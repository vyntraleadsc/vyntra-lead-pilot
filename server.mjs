import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

// Importar dinamicamente os handlers de webhook compilados/transpilados ou rodar nativo
let handleWebhookApiRequest = null;
try {
  const routerModule = await import("./src/lib/vyntra/api-router.ts");
  handleWebhookApiRequest = routerModule.handleWebhookApiRequest;
} catch (e) {
  console.log("[Webhook Server] Carregando roteador fallback...");
}

const server = http.createServer(async (req, res) => {
  // CORS Headers
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Webhook-Token");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host || "localhost"}`);

  // Se for rota de API de Webhooks
  if (url.pathname.startsWith("/api/webhooks/leads") && handleWebhookApiRequest) {
    try {
      // Coletar corpo da requisição
      const chunks = [];
      for await (const chunk of req) {
        chunks.push(chunk);
      }
      const rawBody = Buffer.concat(chunks).toString("utf-8");

      // Construir Request Web API
      const webReq = new Request(url.href, {
        method: req.method,
        headers: req.headers,
        body: ["POST", "PUT", "PATCH"].includes(req.method) && rawBody ? rawBody : undefined,
      });

      const webRes = await handleWebhookApiRequest(webReq);
      if (webRes) {
        res.writeHead(webRes.status, Object.fromEntries(webRes.headers.entries()));
        const bodyText = await webRes.text();
        res.end(bodyText);
        return;
      }
    } catch (err) {
      console.error("[Webhook Server Error]:", err);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Erro interno no servidor de webhook", message: err.message }));
      return;
    }
  }

  // Health check simples
  if (url.pathname === "/health") {
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ status: "ok", service: "Vyntra Webhook Engine", timestamp: new Date().toISOString() }));
    return;
  }

  // Resposta padrão
  res.writeHead(200, { "Content-Type": "application/json" });
  res.end(JSON.stringify({
    message: "Vyntra API Server ativo",
    endpoint: "POST /api/webhooks/leads/{companyId}",
  }));
});

server.listen(PORT, () => {
  console.log(`[Vyntra Webhook Engine] Servidor ativo e escutando na porta ${PORT}`);
});
