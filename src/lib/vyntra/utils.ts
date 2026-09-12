import type { FollowUp, FollowUpBucket, Opportunity, Temperature } from "./types";

export const BRL = (v: number) =>
  v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

export function temperatureOf(score: number): Temperature {
  if (score >= 80) return "muito_quente";
  if (score >= 60) return "potencial";
  if (score >= 40) return "morno";
  return "baixo";
}

export const TEMPERATURE_META: Record<
  Temperature,
  { label: string; emoji: string; color: string; text: string; bg: string }
> = {
  muito_quente: {
    label: "Muito quente",
    emoji: "🔥",
    color: "var(--hot)",
    text: "text-[color:var(--hot)]",
    bg: "bg-[color:color-mix(in_oklab,var(--hot)_18%,transparent)]",
  },
  potencial: {
    label: "Potencial",
    emoji: "🟠",
    color: "var(--warm)",
    text: "text-[color:var(--warm)]",
    bg: "bg-[color:color-mix(in_oklab,var(--warm)_18%,transparent)]",
  },
  morno: {
    label: "Morno",
    emoji: "🟡",
    color: "var(--mild)",
    text: "text-[color:var(--mild)]",
    bg: "bg-[color:color-mix(in_oklab,var(--mild)_18%,transparent)]",
  },
  baixo: {
    label: "Baixo potencial",
    emoji: "❄️",
    color: "var(--cold)",
    text: "text-[color:var(--cold)]",
    bg: "bg-[color:color-mix(in_oklab,var(--cold)_18%,transparent)]",
  },
};

export function minutesSince(isoDate: string, now: number = Date.now()) {
  return Math.max(0, Math.floor((now - new Date(isoDate).getTime()) / 60000));
}

export function waitingMinutes(o: Opportunity, now: number = Date.now()) {
  if (o.firstResponseAt) return null;
  return minutesSince(o.assignedAt, now);
}

export function timerLevel(minutes: number): "normal" | "atencao" | "critico" {
  if (minutes < 5) return "normal";
  if (minutes < 10) return "atencao";
  return "critico";
}

export function relativeTime(iso: string | null, now: number = Date.now()) {
  if (!iso) return "Sem contato";
  const diff = now - new Date(iso).getTime();
  const abs = Math.abs(diff);
  const min = Math.round(abs / 60000);
  const suffix = diff >= 0 ? "atrás" : "";
  const prefix = diff < 0 ? "em " : "";
  if (min < 60) return `${prefix}${min} min ${suffix}`.trim();
  const hours = Math.round(min / 60);
  if (hours < 24) return `${prefix}${hours} h ${suffix}`.trim();
  const days = Math.round(hours / 24);
  return `${prefix}${days} d ${suffix}`.trim();
}

export function bucketOf(f: FollowUp, now: number = Date.now()): FollowUpBucket {
  const due = new Date(f.dueAt).getTime();
  const startOfToday = new Date(new Date(now).setHours(0, 0, 0, 0)).getTime();
  const startOfTomorrow = startOfToday + 86400000;
  const startOfAfter = startOfTomorrow + 86400000;
  if (due < now) return "atrasado";
  if (due < startOfTomorrow) return "hoje";
  if (due < startOfAfter) return "amanha";
  return "proximos";
}

export const STATUS_TONE: Record<string, string> = {
  Novo: "border-[color:var(--primary)]/40 text-[color:var(--primary)]",
  "Em atendimento": "border-[color:var(--violet)]/40 text-[color:var(--violet)]",
  "Follow-up": "border-[color:var(--mild)]/40 text-[color:var(--mild)]",
  "Aguardando cliente": "border-border text-muted-foreground",
  "Proposta enviada": "border-[color:var(--cold)]/50 text-[color:var(--cold)]",
  Negociação: "border-[color:var(--warm)]/50 text-[color:var(--warm)]",
  Venda: "border-[color:var(--success)]/50 text-[color:var(--success)]",
  Perdida: "border-destructive/50 text-destructive",
};

/** Simulated Vyntra scoring engine used by the qualification simulator. */
export function computeScore(answers: Record<string, string>): {
  score: number;
  reasons: string[];
} {
  let score = 20;
  const reasons: string[] = [];
  const add = (points: number, reason: string) => {
    score += points;
    if (points > 0 && reason) reasons.push(reason);
  };

  if (answers["estado"]) {
    const isSC = answers["estado"].includes("Santa Catarina") || answers["estado"] === "SC";
    add(4, isSC ? "Região confirmada: Santa Catarina (SC)" : "Região confirmada: Rio Grande do Sul (RS)");
  }

  if (answers["cidade_loja"]) {
    const cleanCity = answers["cidade_loja"].split("(")[0]?.trim() || answers["cidade_loja"];
    add(6, `Atendimento regional direcionado: ${cleanCity}`);
  }

  switch (answers["prazo"]) {
    case "Próximos 7 dias":
      add(22, "Compra em até 7 dias");
      break;
    case "Até 30 dias":
      add(16, "Compra prevista em até 30 dias");
      break;
    case "1–3 meses":
      add(8, "Compra planejada em 1–3 meses");
      break;
    case "Mais de 3 meses":
      add(3, "Horizonte de compra longo");
      break;
    default:
      add(0, "");
  }

  if (answers["produto"] === "Honda 0 km") add(12, "Produto definido (0 km)");
  else if (answers["produto"] === "Honda seminova") add(10, "Produto definido (seminova)");
  else if (answers["produto"]?.includes("Consórcio")) add(14, "Consórcio Honda — perfil de planejamento estruturado");

  if (answers["forma"] === "Financiamento") add(10, "Forma de compra definida: financiamento");
  else if (answers["forma"] === "À vista") add(14, "Pagamento à vista");
  else if (answers["forma"]?.includes("Consórcio")) add(12, "Consórcio Honda: compra programada sem juros");

  if (answers["consorcio_modalidade"]) {
    add(8, `Modalidade Consórcio: ${answers["consorcio_modalidade"]}`);
  }

  const budget = answers["orcamento"];
  if (budget === "R$1.000+") add(14, "Orçamento mensal elevado");
  else if (budget === "R$700–1.000") add(11, "Orçamento mensal compatível");
  else if (budget === "R$500–700") add(8, "Orçamento mensal intermediário");
  else if (budget === "R$300–500") add(5, "Orçamento mensal compatível com parcelas de consórcio");
  else if (budget === "Até R$300") add(3, "Ideal para cotas acessíveis de Consórcio Honda");

  if (answers["entrada"] === "Sim") add(12, "Entrada disponível para lance ou financiamento");
  else if (answers["entrada"] === "Ainda não") add(3, "");

  if (answers["simulacao"] === "Já estou negociando") add(14, "Negociação já iniciada");
  else if (answers["simulacao"] === "Já simulei") add(10, "Já realizou simulação");
  else if (answers["simulacao"] === "Apenas pesquisei") add(4, "");

  if (answers["moto"] === "Sim") add(8, "Possui moto para troca / lance");

  const objection = answers["objecao"];
  const isConsorcio = answers["forma"]?.includes("Consórcio") || answers["produto"]?.includes("Consórcio");
  if (objection === "Nada") add(6, "Sem objeção declarada");
  else if (objection === "Questão de crédito") add(isConsorcio ? 4 : -8, isConsorcio ? "Consórcio facilita adesão sem travas imediatas de financiamento" : "");
  else if (objection === "Não tenho entrada") add(isConsorcio ? 6 : -6, isConsorcio ? "Consórcio Nacional Honda não exige entrada obrigatória" : "");
  else if (objection === "Estou juntando dinheiro") add(isConsorcio ? 8 : -5, isConsorcio ? "Consórcio viabiliza poupança forçada inteligente" : "");

  if (answers["produto"] === "Honda 0 km" && !isConsorcio && (budget === "Até R$300" || budget === "R$300–500")) {
    add(-10, "");
    reasons.push("Baixa compatibilidade entre produto 0 km financiado e orçamento — recomendada rota de Consórcio");
  }

  return { score: Math.max(0, Math.min(100, Math.round(score))), reasons: reasons.filter(Boolean) };
}
