import {
  getCompany,
  toggleCompanyIntegration,
  rotateCompanyToken,
  getCompanyLogs,
  clearCompanyLogs,
  getCompanyLeads,
  processLeadWebhook,
  subscribeToWebhookEvents,
} from "./webhook-service";

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Webhook-Token",
    },
  });
}

/**
 * Roteador HTTP universal para as rotas /api/webhooks/leads/*
 * Compatível com TanStack Start, Nitro, Node.js HTTP e Express.
 */
export async function handleWebhookApiRequest(request: Request): Promise<Response | null> {
  const url = new URL(request.url);
  const pathname = url.pathname;

  // Lidar com pre-flight CORS OPTIONS
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Webhook-Token",
      },
    });
  }

  // Verificar se a rota pertence a /api/webhooks/leads
  const webhookLeadRegex = /^\/api\/webhooks\/leads\/([^/?#]+)(?:\/([^/?#]+))?$/;
  const match = pathname.match(webhookLeadRegex);

  if (!match) {
    return null; // Não é uma rota gerenciada por este roteador
  }

  const companyId = decodeURIComponent(match[1] || "");
  const subAction = match[2]; // ex: "status", "toggle", "rotate-token", "logs", "recent", "test", "stream"

  try {
    // 1. POST /api/webhooks/leads/{companyId} (O endpoint principal de webhook externo)
    if (!subAction && request.method === "POST") {
      let body: unknown = {};
      try {
        const text = await request.text();
        if (text && text.trim()) {
          body = JSON.parse(text);
        }
      } catch (parseErr) {
        return jsonResponse(
          {
            status: "error",
            httpCode: 400,
            message: "JSON inválido no corpo da requisição.",
            errors: [(parseErr as Error).message],
          },
          400,
        );
      }

      const result = await processLeadWebhook(companyId, body);
      return jsonResponse(result, result.httpCode);
    }

    // 2. GET /api/webhooks/leads/{companyId}/status
    if (subAction === "status" && request.method === "GET") {
      const company = getCompany(companyId);
      if (!company) {
        return jsonResponse({ error: "Empresa não encontrada" }, 404);
      }
      const logs = getCompanyLogs(companyId);
      const leads = getCompanyLeads(companyId);
      const totalRequests = logs.length;
      const successRequests = logs.filter((l) => l.status === "success").length;
      const duplicateRequests = logs.filter((l) => l.status === "duplicate").length;
      const errorRequests = logs.filter((l) => l.status === "error" || l.status === "rejected").length;
      const successRate = totalRequests > 0 ? Math.round((successRequests / totalRequests) * 100) : 100;

      return jsonResponse({
        company: {
          id: company.id,
          name: company.name,
          slug: company.slug,
          webhookToken: company.webhookToken,
          isActive: company.isActive,
          endpointUrl: `${url.origin}/api/webhooks/leads/${company.id}`,
        },
        stats: {
          totalRequests,
          successRequests,
          duplicateRequests,
          errorRequests,
          successRate,
          lastLeadAt: leads[0]?.assignedAt || logs[0]?.createdAt || null,
        },
      });
    }

    // 3. POST /api/webhooks/leads/{companyId}/toggle
    if (subAction === "toggle" && request.method === "POST") {
      const updated = toggleCompanyIntegration(companyId);
      if (!updated) return jsonResponse({ error: "Empresa não encontrada" }, 404);
      return jsonResponse({ success: true, company: updated });
    }

    // 4. POST /api/webhooks/leads/{companyId}/rotate-token
    if (subAction === "rotate-token" && request.method === "POST") {
      const updated = rotateCompanyToken(companyId);
      if (!updated) return jsonResponse({ error: "Empresa não encontrada" }, 404);
      return jsonResponse({ success: true, company: updated });
    }

    // 5. GET /api/webhooks/leads/{companyId}/logs
    if (subAction === "logs" && request.method === "GET") {
      const logs = getCompanyLogs(companyId);
      return jsonResponse({ logs });
    }

    // 6. DELETE /api/webhooks/leads/{companyId}/logs
    if (subAction === "logs" && request.method === "DELETE") {
      clearCompanyLogs(companyId);
      return jsonResponse({ success: true, message: "Logs limpos com sucesso." });
    }

    // 7. GET /api/webhooks/leads/{companyId}/recent
    if (subAction === "recent" && request.method === "GET") {
      const leads = getCompanyLeads(companyId);
      return jsonResponse({ leads });
    }

    // 8. POST /api/webhooks/leads/{companyId}/test (Disparo de teste simulado)
    if (subAction === "test" && request.method === "POST") {
      let testPayload: Record<string, unknown> = {
        name: "Carlos Eduardo Nogueira (Lead Teste)",
        phone: "(54) 99199-8877",
        email: "carlos.nogueira@teste.com.br",
        interest: "Toyota Corolla Cross XRE 0km",
        budget: 185000,
        city: "Santa Aurora",
        message: "Quero simular financiamento com 40% de entrada e taxa zero. Teste de webhook ao vivo.",
        source: "Simulador Webhook Vyntra",
        campaign: "Teste de Homologação de Integração",
      };

      try {
        const text = await request.text();
        if (text && text.trim()) {
          const parsed = JSON.parse(text);
          if (parsed && typeof parsed === "object") {
            testPayload = { ...testPayload, ...parsed };
          }
        }
      } catch {
        /* usa o payload padrao de teste */
      }

      const result = await processLeadWebhook(companyId, testPayload);
      return jsonResponse(result, result.httpCode);
    }

    // 9. GET /api/webhooks/leads/{companyId}/stream (SSE em tempo real)
    if (subAction === "stream" && request.method === "GET") {
      const encoder = new TextEncoder();
      const stream = new ReadableStream({
        start(controller) {
          // Enviar ping inicial de conexão estabelecida
          controller.enqueue(
            encoder.encode(`event: connected\ndata: ${JSON.stringify({ connected: true, companyId })}\n\n`),
          );

          const unsubscribe = subscribeToWebhookEvents((event) => {
            if (event.companyId === companyId) {
              controller.enqueue(
                encoder.encode(`event: ${event.type}\ndata: ${JSON.stringify(event)}\n\n`),
              );
            }
          });

          // Limpeza ao fechar conexão
          request.signal.addEventListener("abort", () => {
            unsubscribe();
            try {
              controller.close();
            } catch {
              /* ignore */
            }
          });
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
          "Access-Control-Allow-Origin": "*",
        },
      });
    }

    return jsonResponse({ error: "Sub-ação não suportada ou método inválido" }, 405);
  } catch (err) {
    console.error("[Webhook API Error]:", err);
    return jsonResponse(
      {
        error: "Erro interno ao processar requisição de webhook",
        message: (err as Error).message,
      },
      500,
    );
  }
}
