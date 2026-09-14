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
    label: "Quente (Score 80+)",
    emoji: "🟢",
    color: "var(--hot)",
    text: "text-[color:var(--hot)]",
    bg: "bg-[color:color-mix(in_oklab,var(--hot)_18%,transparent)]",
  },
  potencial: {
    label: "Médio / Potencial (60-79)",
    emoji: "🟡",
    color: "var(--warm)",
    text: "text-[color:var(--warm)]",
    bg: "bg-[color:color-mix(in_oklab,var(--warm)_18%,transparent)]",
  },
  morno: {
    label: "Médio / Morno (40-59)",
    emoji: "🟡",
    color: "var(--mild)",
    text: "text-[color:var(--mild)]",
    bg: "bg-[color:color-mix(in_oklab,var(--mild)_18%,transparent)]",
  },
  baixo: {
    label: "Frio (Score < 40)",
    emoji: "🔴",
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
  "Proposta enviada": "border-cyan-500/50 text-cyan-400",
  Negociação: "border-[color:var(--warm)]/50 text-[color:var(--warm)]",
  Venda: "border-[color:var(--success)]/50 text-[color:var(--success)]",
  Perdida: "border-destructive/50 text-destructive",
};

/** Simulated Vyntra scoring engine used by the qualification simulator. */
export function computeScore(answers: Record<string, string>): {
  score: number;
  reasons: string[];
} {
  let score = 15;
  const reasons: string[] = [];
  const add = (points: number, reason: string) => {
    score += points;
    if (points > 0 && reason) reasons.push(reason);
  };

  // 1. Região / Concessionária
  const regiao = answers["regiao"] || answers["cidade_loja"] || "";
  if (regiao.includes("Lages") || regiao.includes("Santa Catarina") || answers["estado"]?.includes("Santa Catarina")) {
    add(14, "Região confirmada: Concessionária Lages / SC");
  } else if (regiao.includes("Três Passos")) {
    add(14, "Região confirmada: Concessionária Três Passos / RS");
  } else if (regiao.includes("Santa Rosa")) {
    add(14, "Região confirmada: Concessionária Santa Rosa / RS");
  } else if (answers["estado"]) {
    add(8, `Região: ${answers["estado"]}`);
  }

  // 2. Modelo / Categoria
  const produto = answers["produto"] || "";
  if (produto.includes("0 km") || produto.includes("Nova")) {
    add(18, "Interesse definido em modelo 0 km");
  } else if (produto.includes("Consórcio")) {
    add(20, "Perfil de alta aderência ao Consórcio Nacional");
  } else if (produto.includes("Seminova")) {
    add(16, "Interesse em seminova revisada com garantia");
  } else if (produto) {
    add(10, `Interesse em ${produto}`);
  }

  // 3. Forma de Pagamento
  const forma = answers["forma"] || "";
  if (forma.includes("à vista") || forma.includes("À vista")) {
    add(25, "Pagamento à vista com alta probabilidade de fechamento rápido");
  } else if (forma.includes("troca") || forma.includes("moto atual") || answers["moto"] === "Sim") {
    add(22, "Possui veículo usado na negociação para entrada ou lance");
  } else if (forma.includes("Financiamento")) {
    add(20, "Intenção de financiamento bancário com entrada facilitada");
  } else if (forma.includes("Consórcio") || produto.includes("Consórcio")) {
    add(18, "Consórcio Nacional: parcelas reduzidas sem juros");
  } else if (forma) {
    add(12, `Forma de pagamento: ${forma}`);
  }

  // 4. Prazo / Momento de Compra (Urgência)
  const prazo = answers["prazo"] || "";
  if (prazo.includes("Imediato") || prazo.includes("7 dias")) {
    add(28, "Momento de compra imediato (fechamento em até 7 dias)");
  } else if (prazo.includes("30 dias") || prazo.includes("Neste mês")) {
    add(18, "Previsão de aquisição no mês corrente (até 30 dias)");
  } else if (prazo.includes("2 a 3 meses") || prazo.includes("1–3 meses") || prazo.includes("60")) {
    add(10, "Compra planejada para os próximos meses");
  } else if (prazo.includes("pesquisando") || prazo.includes("Mais de 3 meses")) {
    add(3, "Lead em estágio inicial de pesquisa e cotação de mercado");
  }

  return { score: Math.max(0, Math.min(100, Math.round(score))), reasons: reasons.filter(Boolean) };
}
