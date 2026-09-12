import { qualifyLead, type WebhookLeadPayload, type LeadScoreResult } from "./lead-scorer";
import type { Opportunity } from "./types";
import { SELLERS, pickSellerByPerformance } from "./mock-data";

export interface Company {
  id: string;
  name: string;
  slug: string;
  webhookToken: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationLog {
  id: string;
  companyId: string;
  source: string;
  status: "success" | "duplicate" | "error" | "rejected";
  httpCode: number;
  payload: Record<string, unknown>;
  errorMessage?: string;
  leadId?: string;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Armazenamento em Memória & Persistência Local Multi-Tenant
// ---------------------------------------------------------------------------

const DEFAULT_COMPANY_ID = "vyntra-automotive";

const companiesStore: Map<string, Company> = new Map([
  [
    DEFAULT_COMPANY_ID,
    {
      id: DEFAULT_COMPANY_ID,
      name: "Vyntra Concessionárias RS / SC",
      slug: "vyntra-automotive",
      webhookToken: "vnt_sec_9a8b7c6d5e4f3a2b1c0d",
      isActive: true,
      createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ],
]);

// Armazena leads específicos de webhook indexados por companyId
const leadsByCompany: Map<string, Opportunity[]> = new Map();

// Armazena logs de execução de integração por companyId
const logsByCompany: Map<string, IntegrationLog[]> = new Map([
  [
    DEFAULT_COMPANY_ID,
    [
      {
        id: "LOG-INIT-01",
        companyId: DEFAULT_COMPANY_ID,
        source: "Meta Ads",
        status: "success",
        httpCode: 201,
        payload: {
          name: "Roberto Silveira Albuquerque",
          phone: "(54) 99182-4410",
          email: "roberto.albuquerque@agroval.com.br",
          interest: "Toyota Hilux SRX 0km",
          budget: 280000,
          city: "Passo Fundo",
          message: "Tenho interesse em negociar à vista com faturamento para produtor rural.",
          source: "Meta Ads",
          campaign: "Campanha Produtor Rural 2026",
        },
        leadId: "OPP-9482",
        createdAt: new Date(Date.now() - 42 * 60000).toISOString(),
      },
      {
        id: "LOG-INIT-02",
        companyId: DEFAULT_COMPANY_ID,
        source: "Google Ads",
        status: "success",
        httpCode: 201,
        payload: {
          name: "Juliana Mendes da Silva",
          phone: "(49) 98822-7711",
          email: "juliana.mendes@clinica.med.br",
          interest: "BMW 320i M Sport",
          budget: 195000,
          city: "Lages",
          message: "Gostaria de agendar um test drive para este sábado pela manhã.",
          source: "Google Ads",
          campaign: "Google Search - Premium SC",
        },
        leadId: "OPP-7124",
        createdAt: new Date(Date.now() - 110 * 60000).toISOString(),
      },
      {
        id: "LOG-INIT-03",
        companyId: DEFAULT_COMPANY_ID,
        source: "WebMotors",
        status: "duplicate",
        httpCode: 200,
        payload: {
          name: "Roberto Silveira Albuquerque",
          phone: "(54) 99182-4410",
          email: "roberto.albuquerque@agroval.com.br",
          interest: "Hilux SRX",
          external_id: "EXT-HILUX-01",
        },
        errorMessage: "Lead duplicado identificado por telefone e e-mail já existentes na base.",
        leadId: "OPP-9482",
        createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
      },
    ],
  ],
]);

// Listeners em tempo real para sincronização instantânea de novos leads
type WebhookEventListener = (event: {
  type: "new_lead" | "log";
  companyId: string;
  lead?: Opportunity;
  log?: IntegrationLog;
}) => void;

const eventListeners: Set<WebhookEventListener> = new Set();

export function subscribeToWebhookEvents(listener: WebhookEventListener): () => void {
  eventListeners.add(listener);
  return () => {
    eventListeners.delete(listener);
  };
}

function broadcastWebhookEvent(event: {
  type: "new_lead" | "log";
  companyId: string;
  lead?: Opportunity;
  log?: IntegrationLog;
}) {
  eventListeners.forEach((listener) => {
    try {
      listener(event);
    } catch (e) {
      console.error("[Webhook Broadcast Error]:", e);
    }
  });

  // Notificar no ambiente do navegador via CustomEvent ou BroadcastChannel se disponível
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("vyntra-webhook-event", { detail: event }));
  }
}

// ---------------------------------------------------------------------------
// Funções de Gestão de Empresas (Multi-Tenant)
// ---------------------------------------------------------------------------

export function getCompany(companyId: string): Company | null {
  return companiesStore.get(companyId) || null;
}

export function getAllCompanies(): Company[] {
  return Array.from(companiesStore.values());
}

export function toggleCompanyIntegration(companyId: string): Company | null {
  const comp = companiesStore.get(companyId);
  if (!comp) return null;
  comp.isActive = !comp.isActive;
  comp.updatedAt = new Date().toISOString();
  companiesStore.set(companyId, comp);
  return comp;
}

export function rotateCompanyToken(companyId: string): Company | null {
  const comp = companiesStore.get(companyId);
  if (!comp) return null;
  const randomHex = Math.random().toString(36).slice(2, 10) + Math.random().toString(36).slice(2, 10);
  comp.webhookToken = `vnt_sec_${randomHex}`;
  comp.updatedAt = new Date().toISOString();
  companiesStore.set(companyId, comp);
  return comp;
}

export function getCompanyLogs(companyId: string): IntegrationLog[] {
  return logsByCompany.get(companyId) || [];
}

export function clearCompanyLogs(companyId: string): void {
  logsByCompany.set(companyId, []);
}

export function getCompanyLeads(companyId: string): Opportunity[] {
  return leadsByCompany.get(companyId) || [];
}

// ---------------------------------------------------------------------------
// Normalizadores e Validadores de Duplicidade
// ---------------------------------------------------------------------------

function normalizePhone(phone?: string): string {
  if (!phone) return "";
  return phone.replace(/[^\d]/g, "").slice(-9); // Últimos 9 dígitos
}

function normalizeEmail(email?: string): string {
  if (!email) return "";
  return email.trim().toLowerCase();
}

/**
 * Verifica se o lead já existe na empresa por external_id OU por (telefone + email).
 */
export function findDuplicateLead(
  companyId: string,
  payload: WebhookLeadPayload,
  externalOpportunities?: Opportunity[],
): Opportunity | null {
  const companyLeads = leadsByCompany.get(companyId) || [];
  const allLeads = [...companyLeads, ...(externalOpportunities || [])];

  // 1. Checagem por external_id se fornecido
  if (payload.external_id && payload.external_id.trim()) {
    const extId = payload.external_id.trim();
    const matchByExt = allLeads.find((l) => (l as unknown as { external_id?: string }).external_id === extId);
    if (matchByExt) return matchByExt;
  }

  // 2. Checagem por Telefone + E-mail
  const normPhone = normalizePhone(payload.phone);
  const normEmail = normalizeEmail(payload.email);

  if (normPhone && normEmail) {
    const matchByContact = allLeads.find((l) => {
      const lPhone = normalizePhone(l.customer.whatsapp);
      const lEmail = normalizeEmail(l.customer.email);
      return lPhone === normPhone && lEmail === normEmail;
    });
    if (matchByContact) return matchByContact;
  }

  // 3. Checagem secundária: telefone idêntico com mesmo nome se o e-mail não existir
  if (normPhone && payload.name) {
    const normName = payload.name.trim().toLowerCase();
    const matchByPhoneName = allLeads.find((l) => {
      const lPhone = normalizePhone(l.customer.whatsapp);
      const lName = l.customer.name.trim().toLowerCase();
      return lPhone === normPhone && lName === normName;
    });
    if (matchByPhoneName) return matchByPhoneName;
  }

  return null;
}

// ---------------------------------------------------------------------------
// Processador Principal do Webhook de Leads
// POST /api/webhooks/leads/{companyId}
// ---------------------------------------------------------------------------

export interface ProcessWebhookResult {
  status: "success" | "duplicate" | "error" | "rejected";
  httpCode: number;
  message: string;
  leadId?: string;
  lead?: Opportunity;
  score?: number;
  classification?: "Hot" | "Warm" | "Cold";
  reasons?: string[];
  errors?: string[];
}

export async function processLeadWebhook(
  companyId: string,
  rawBody: unknown,
  externalOpportunities?: Opportunity[],
): Promise<ProcessWebhookResult> {
  const logId = `LOG-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

  // 1. Identificar Empresa pelo companyId
  let company = getCompany(companyId);
  if (!company) {
    // Para conveniência em demonstrações ou novas empresas, criar dinamicamente se o ID for válido
    if (companyId && companyId.length >= 3) {
      company = {
        id: companyId,
        name: `Empresa ${companyId.toUpperCase()}`,
        slug: companyId,
        webhookToken: `vnt_sec_${Math.random().toString(36).slice(2, 10)}`,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      companiesStore.set(companyId, company);
    } else {
      const errorLog: IntegrationLog = {
        id: logId,
        companyId: companyId || "unknown",
        source: "Webhook",
        status: "rejected",
        httpCode: 404,
        payload: (rawBody as Record<string, unknown>) || {},
        errorMessage: `Empresa com companyId '${companyId}' não foi encontrada na plataforma.`,
        createdAt: new Date().toISOString(),
      };
      return {
        status: "rejected",
        httpCode: 404,
        message: `Empresa '${companyId}' não localizada.`,
        errors: ["Empresa não cadastrada."],
      };
    }
  }

  // 2. Validar se a integração da empresa está ativa
  if (!company.isActive) {
    const errorLog: IntegrationLog = {
      id: logId,
      companyId,
      source: (rawBody as WebhookLeadPayload)?.source || "Webhook",
      status: "rejected",
      httpCode: 403,
      payload: (rawBody as Record<string, unknown>) || {},
      errorMessage: `A integração de webhook para a empresa '${company.name}' está desativada no painel de configurações.`,
      createdAt: new Date().toISOString(),
    };
    const currentLogs = logsByCompany.get(companyId) || [];
    logsByCompany.set(companyId, [errorLog, ...currentLogs]);
    broadcastWebhookEvent({ type: "log", companyId, log: errorLog });

    return {
      status: "rejected",
      httpCode: 403,
      message: "Integração desativada para esta empresa.",
      errors: ["Integração inativa. Ative-a no painel de Integrações."],
    };
  }

  // 3. Validar a Requisição e Campos Obrigatórios
  if (!rawBody || typeof rawBody !== "object") {
    const errorLog: IntegrationLog = {
      id: logId,
      companyId,
      source: "Webhook",
      status: "error",
      httpCode: 400,
      payload: {},
      errorMessage: "O corpo da requisição deve ser um objeto JSON válido.",
      createdAt: new Date().toISOString(),
    };
    const currentLogs = logsByCompany.get(companyId) || [];
    logsByCompany.set(companyId, [errorLog, ...currentLogs]);

    return {
      status: "error",
      httpCode: 400,
      message: "Payload inválido. Envie um JSON com os campos do lead.",
      errors: ["Corpo da requisição vazio ou inválido."],
    };
  }

  const payload = rawBody as WebhookLeadPayload;
  const validationErrors: string[] = [];

  if (!payload.name || typeof payload.name !== "string" || payload.name.trim().length < 2) {
    validationErrors.push("O campo 'name' é obrigatório e deve ter no mínimo 2 caracteres.");
  }

  const hasValidPhone = Boolean(payload.phone && String(payload.phone).replace(/[^\d]/g, "").length >= 8);
  const hasValidEmail = Boolean(payload.email && String(payload.email).includes("@"));

  if (!hasValidPhone && !hasValidEmail) {
    validationErrors.push("Pelo menos um canal de contato ('phone' ou 'email') deve ser informado.");
  }

  if (validationErrors.length > 0) {
    const errorLog: IntegrationLog = {
      id: logId,
      companyId,
      source: payload.source || "Webhook",
      status: "error",
      httpCode: 400,
      payload: payload as unknown as Record<string, unknown>,
      errorMessage: `Validação de campos obrigatórios falhou: ${validationErrors.join(" | ")}`,
      createdAt: new Date().toISOString(),
    };
    const currentLogs = logsByCompany.get(companyId) || [];
    logsByCompany.set(companyId, [errorLog, ...currentLogs]);
    broadcastWebhookEvent({ type: "log", companyId, log: errorLog });

    return {
      status: "error",
      httpCode: 400,
      message: "Falha na validação do payload.",
      errors: validationErrors,
    };
  }

  // 4. Verificar se o lead já existe usando external_id ou telefone + email
  const existingLead = findDuplicateLead(companyId, payload, externalOpportunities);
  if (existingLead) {
    // 5. Caso seja duplicado, não criar outro lead!
    const dupLog: IntegrationLog = {
      id: logId,
      companyId,
      source: payload.source || "Webhook",
      status: "duplicate",
      httpCode: 200,
      payload: payload as unknown as Record<string, unknown>,
      errorMessage: `Lead duplicado ignorado. Já cadastrado com ID ${existingLead.id} (${existingLead.customer.name}).`,
      leadId: existingLead.id,
      createdAt: new Date().toISOString(),
    };
    const currentLogs = logsByCompany.get(companyId) || [];
    logsByCompany.set(companyId, [dupLog, ...currentLogs]);
    broadcastWebhookEvent({ type: "log", companyId, log: dupLog });

    return {
      status: "duplicate",
      httpCode: 200,
      message: "Lead já existente na base de dados desta empresa. Nenhuma duplicata foi criada.",
      leadId: existingLead.id,
      lead: existingLead,
      score: existingLead.score,
    };
  }

  // 6. Executar automaticamente o sistema de qualificação
  // 7. Calcular Lead Score de 0 a 100
  // 8. Classificar como Hot, Warm ou Cold
  // 9. Registrar os motivos da pontuação
  const qualification: LeadScoreResult = qualifyLead(payload);

  // 10. Selecionar consultor/vendedor responsável de acordo com meritocracia de fechamento
  const assignedSeller = pickSellerByPerformance(SELLERS, undefined, qualification.score >= 80);
  const newLeadId = `OPP-${Math.floor(1000 + Math.random() * 9000)}`;
  const nowIso = new Date().toISOString();

  // 11. Salvar o lead associado à empresa correta
  const newOpportunity: Opportunity = {
    id: newLeadId,
    customer: {
      name: payload.name.trim(),
      whatsapp: payload.phone || "(54) 99999-0000",
      email: payload.email || `${payload.name.toLowerCase().replace(/\s+/g, ".")}@contato.com`,
    },
    state: qualification.suggestedState,
    store: qualification.suggestedStore,
    city: payload.city || (qualification.suggestedState === "SC" ? "Lages" : "Três Passos"),
    region: qualification.suggestedState === "SC" ? "Santa Catarina" : "Rio Grande do Sul",
    product: payload.interest || "Veículo Sob Consulta",
    category: qualification.suggestedCategory,
    method: qualification.suggestedMethod,
    budget: qualification.normalizedBudget > 0 ? `R$ ${qualification.normalizedBudget.toLocaleString("pt-BR")}` : "A definir",
    downPayment: qualification.normalizedBudget > 0 ? `R$ ${(qualification.normalizedBudget * 0.2).toLocaleString("pt-BR")}` : "Entrada negociável",
    deadline: "Imediato",
    score: qualification.score,
    scoreReasons: qualification.reasons,
    objection: payload.message ? `Mensagem do lead: "${payload.message}"` : "Sem objeção registrada no recebimento.",
    route: {
      primary: qualification.suggestedRoute,
      alternative: qualification.suggestedMethod,
      rationale: `Qualificado automaticamente via Webhook (${qualification.classification} - Score ${qualification.score}/100)`,
      budgetFit: qualification.score >= 70 ? "alta" : qualification.score >= 40 ? "média" : "baixa",
    },
    status: "Novo",
    sellerId: assignedSeller.id,
    assignedAt: nowIso,
    lastContactAt: null,
    firstResponseAt: null,
    potentialValue: qualification.normalizedBudget > 0 ? qualification.normalizedBudget : 45000,
    hasBike: false,
    tradeIn: (payload.message || "").toLowerCase().includes("troca"),
    simulated: false,
    source: payload.source || "Webhook Externo",
  };

  // Guardar no array da empresa
  const currentLeads = leadsByCompany.get(companyId) || [];
  leadsByCompany.set(companyId, [newOpportunity, ...currentLeads]);

  // 12. Registrar log de sucesso
  const successLog: IntegrationLog = {
    id: logId,
    companyId,
    source: payload.source || "Webhook",
    status: "success",
    httpCode: 201,
    payload: payload as unknown as Record<string, unknown>,
    leadId: newLeadId,
    createdAt: nowIso,
  };
  const currentLogs = logsByCompany.get(companyId) || [];
  logsByCompany.set(companyId, [successLog, ...currentLogs]);

  // 13. Enviar o novo lead para o dashboard do gestor em tempo real!
  broadcastWebhookEvent({
    type: "new_lead",
    companyId,
    lead: newOpportunity,
    log: successLog,
  });

  return {
    status: "success",
    httpCode: 201,
    message: "Lead recebido, qualificado e distribuído com sucesso na plataforma Vyntra.",
    leadId: newLeadId,
    lead: newOpportunity,
    score: qualification.score,
    classification: qualification.classification,
    reasons: qualification.reasons,
  };
}
