import type { Category, CommercialRoute, LeadState, LeadStore, PurchaseMethod } from "./types";

export interface WebhookLeadPayload {
  name: string;
  phone?: string;
  email?: string;
  source?: string;
  campaign?: string;
  interest?: string;
  budget?: string | number;
  city?: string;
  message?: string;
  external_id?: string;
  created_at?: string;
}

export interface LeadScoreResult {
  score: number; // 0 to 100
  classification: "Hot" | "Warm" | "Cold";
  reasons: string[];
  suggestedStore: LeadStore;
  suggestedState: LeadState;
  suggestedCategory: Category;
  suggestedMethod: PurchaseMethod;
  suggestedRoute: CommercialRoute;
  normalizedBudget: number;
}

/**
 * Motor de qualificação e scoring preditivo de leads para Vyntra.
 * Analisa profundidade de intenção, poder de compra declarado, completude de contato e contexto de mensagem.
 */
export function qualifyLead(payload: WebhookLeadPayload): LeadScoreResult {
  let score = 20; // Pontuação base inicial para qualquer lead recebido via webhook
  const reasons: string[] = ["Entrada de lead qualificado via Webhook (+20 pts)"];

  // 1. Análise do Orçamento / Poder de Compra (até +30 pts)
  let numericBudget = 0;
  if (typeof payload.budget === "number") {
    numericBudget = payload.budget;
  } else if (typeof payload.budget === "string") {
    const digits = payload.budget.replace(/[^\d]/g, "");
    numericBudget = digits ? parseInt(digits, 10) : 0;
  }

  if (numericBudget >= 80000) {
    score += 30;
    reasons.push(`Orçamento premium informado (R$ ${numericBudget.toLocaleString("pt-BR")}) (+30 pts)`);
  } else if (numericBudget >= 40000) {
    score += 25;
    reasons.push(`Orçamento consolidado para segmento médio (R$ ${numericBudget.toLocaleString("pt-BR")}) (+25 pts)`);
  } else if (numericBudget >= 20000) {
    score += 15;
    reasons.push(`Orçamento viável de entrada (R$ ${numericBudget.toLocaleString("pt-BR")}) (+15 pts)`);
  } else if (numericBudget > 0) {
    score += 8;
    reasons.push(`Orçamento preliminar declarado (+8 pts)`);
  } else {
    reasons.push("Orçamento financeiro em aberto (0 pts)");
  }

  // 2. Interesse em Produto e Categoria (até +25 pts)
  const interestLower = (payload.interest || "").toLowerCase();
  const highIntentKeywords = [
    "0km", "0 km", "seminovo", "suv", "honda", "toyota", "bmw", "corolla",
    "civic", "compass", "onix", "tracker", "t-cross", "creta", "renegade",
    "hilux", "ranger", "strada", "pulse", "hb20", "byd"
  ];
  const hasSpecificModel = highIntentKeywords.some((k) => interestLower.includes(k));

  if (hasSpecificModel) {
    score += 25;
    reasons.push(`Interesse explícito em modelo ou categoria específica (${payload.interest}) (+25 pts)`);
  } else if (interestLower.trim().length > 2) {
    score += 15;
    reasons.push(`Interesse geral registrado (${payload.interest}) (+15 pts)`);
  } else {
    reasons.push("Interesse em veículo ainda não especificado (0 pts)");
  }

  // 3. Completude dos Canais de Contato (até +20 pts)
  const hasPhone = Boolean(payload.phone && payload.phone.replace(/[^\d]/g, "").length >= 9);
  const hasEmail = Boolean(payload.email && payload.email.includes("@") && payload.email.includes("."));

  if (hasPhone && hasEmail) {
    score += 20;
    reasons.push("Contato multicanal completo (WhatsApp verificado + E-mail corporativo/pessoal) (+20 pts)");
  } else if (hasPhone) {
    score += 14;
    reasons.push("WhatsApp direto fornecido para atendimento imediato (+14 pts)");
  } else if (hasEmail) {
    score += 10;
    reasons.push("E-mail informado para contato comercial (+10 pts)");
  }

  // 4. Sinais de Compra e Urgência na Mensagem (até +15 pts)
  const messageLower = (payload.message || "").toLowerCase();
  const urgentSignals = [
    "financiar", "financiamento", "proposta", "hoje", "comprar", "fechar",
    "à vista", "a vista", "test drive", "troca", "avaliação", "simulação",
    "urgente", "entrada", "retorno rápido", "consórcio", "consorcio"
  ];
  const matchedSignals = urgentSignals.filter((signal) => messageLower.includes(signal));

  if (matchedSignals.length >= 2) {
    score += 15;
    reasons.push(`Múltiplos sinais de fechamento iminente na mensagem (${matchedSignals.join(", ")}) (+15 pts)`);
  } else if (matchedSignals.length === 1) {
    score += 10;
    reasons.push(`Sinal claro de negociação na mensagem (${matchedSignals[0]}) (+10 pts)`);
  } else if (messageLower.trim().length > 8) {
    score += 6;
    reasons.push("Mensagem contextualizada enviada pelo cliente (+6 pts)");
  }

  // 5. Autoridade e Qualidade da Origem (até +10 pts)
  const sourceLower = (payload.source || "").toLowerCase();
  if (
    sourceLower.includes("google") ||
    sourceLower.includes("meta") ||
    sourceLower.includes("facebook") ||
    sourceLower.includes("instagram") ||
    sourceLower.includes("webmotors") ||
    sourceLower.includes("icarros")
  ) {
    score += 10;
    reasons.push(`Origem com alta taxa de conversão histórica (${payload.source}) (+10 pts)`);
  } else if (payload.campaign) {
    score += 5;
    reasons.push(`Vinculado à campanha de marketing ativo (${payload.campaign}) (+5 pts)`);
  }

  // Garantir limites 0 a 100
  const finalScore = Math.min(100, Math.max(5, score));

  // Classificação: Hot (>= 70), Warm (40 a 69), Cold (< 40)
  let classification: "Hot" | "Warm" | "Cold";
  if (finalScore >= 70) {
    classification = "Hot";
  } else if (finalScore >= 40) {
    classification = "Warm";
  } else {
    classification = "Cold";
  }

  // Direcionamento regional e de loja (RS e SC)
  const cityLower = (payload.city || "").toLowerCase();
  let suggestedStore: LeadStore = "Três Passos / RS";
  let suggestedState: LeadState = "RS";

  if (
    cityLower.includes("lages") ||
    cityLower.includes("capão alto") ||
    cityLower.includes("capao alto") ||
    cityLower.includes("campo belo") ||
    cityLower.includes("correia pinto") ||
    cityLower.includes("palmeira") ||
    cityLower.includes("bocaina") ||
    cityLower.includes("painel") ||
    cityLower.includes("otacílio") ||
    cityLower.includes("otacilio") ||
    cityLower.includes("ponte alta") ||
    cityLower.includes("cerro negro") ||
    cityLower.includes("são josé do cerrito") ||
    cityLower.includes("sao jose do cerrito") ||
    cityLower.includes("sc") ||
    cityLower.includes("santa catarina") ||
    cityLower.includes("florianópolis") ||
    cityLower.includes("florianopolis") ||
    cityLower.includes("chapecó") ||
    cityLower.includes("chapeco") ||
    cityLower.includes("criciúma") ||
    cityLower.includes("criciuma") ||
    cityLower.includes("blumenau") ||
    cityLower.includes("joinville")
  ) {
    suggestedStore = "Lages / SC";
    suggestedState = "SC";
  } else if (
    cityLower.includes("santa rosa") ||
    cityLower.includes("santo ângelo") ||
    cityLower.includes("santo angelo") ||
    cityLower.includes("ijui") ||
    cityLower.includes("ijuí")
  ) {
    suggestedStore = "Santa Rosa / RS";
    suggestedState = "RS";
  } else {
    suggestedStore = "Três Passos / RS";
    suggestedState = "RS";
  }

  // Categoria e método sugeridos
  const suggestedCategory: Category =
    interestLower.includes("0km") || interestLower.includes("0 km") || numericBudget >= 75000
      ? "0 km"
      : "Seminova";

  const suggestedMethod: PurchaseMethod = messageLower.includes("consorcio") || messageLower.includes("consórcio")
    ? "Consórcio"
    : messageLower.includes("vista") || numericBudget >= 120000
      ? "À vista"
      : "Financiamento";

  const suggestedRoute: CommercialRoute =
    suggestedCategory === "0 km"
      ? "0 km"
      : messageLower.includes("troca")
        ? "Avaliação de troca"
        : suggestedMethod;

  return {
    score: finalScore,
    classification,
    reasons,
    suggestedStore,
    suggestedState,
    suggestedCategory,
    suggestedMethod,
    suggestedRoute,
    normalizedBudget: numericBudget,
  };
}
