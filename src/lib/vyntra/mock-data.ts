import {
  LAGES_REGION_CITIES,
  type AppNotification,
  type Category,
  type CommercialRoute,
  type FollowUp,
  type LeadState,
  type LeadStore,
  type Opportunity,
  type OpportunityStatus,
  type Proposal,
  type PurchaseMethod,
  type Seller,
} from "./types";

const MIN = 60 * 1000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

const iso = (offsetMs: number) => new Date(Date.now() + offsetMs).toISOString();

export const SELLERS: Seller[] = [
  {
    id: "francine",
    name: "Francine",
    online: true,
    avgResponseMinutes: 4,
    conversion: 21,
    sales: 5,
    specialty: "Consultora Comercial",
  },
  {
    id: "guilherme",
    name: "Guilherme",
    online: true,
    avgResponseMinutes: 6,
    conversion: 18,
    sales: 4,
    specialty: "Consultor Comercial",
  },
  {
    id: "vitor",
    name: "Vitor",
    online: true,
    avgResponseMinutes: 8,
    conversion: 14,
    sales: 2,
    specialty: "Consultor Comercial",
  },
  {
    id: "gabriel",
    name: "Gabriel",
    online: false,
    avgResponseMinutes: 13,
    conversion: 9,
    sales: 2,
    specialty: "Consultor Comercial",
  },
];

/**
 * Roteamento meritocrático: direciona proporcionalmente mais leads para os
 * vendedores com maior histórico de fechamento de vendas (sales e conversão).
 */
export function pickSellerByPerformance(
  sellers: Seller[] = SELLERS,
  rules?: { byPriority?: boolean; byAvailability?: boolean; bySellerProfile?: boolean },
  isHot?: boolean,
): Seller {
  if (!sellers || sellers.length === 0) return SELLERS[0]!;

  // Peso calculado a partir de vendas concluídas + taxa de conversão
  const weighted = sellers.map((s) => {
    let weight = Math.max(3, s.sales * 16 + s.conversion * 2.5);

    // Se disponibilidade estiver ativada e vendedor estiver online
    if (rules?.byAvailability !== false && s.online) {
      weight *= 1.35;
    }

    // Leads quentes (score alto) vão com prioridade extra para quem mais fecha
    if (isHot && (s.sales >= 4 || s.conversion >= 18)) {
      weight *= 2.4;
    }

    return { seller: s, weight };
  });

  const totalWeight = weighted.reduce((acc, curr) => acc + curr.weight, 0);
  let randomVal = Math.random() * totalWeight;

  for (const item of weighted) {
    if (randomVal < item.weight) {
      return item.seller;
    }
    randomVal -= item.weight;
  }

  return sellers[0]!;
}

interface Raw {
  n: string;
  p: string;
  c: Category;
  m: PurchaseMethod;
  b: string;
  e: string;
  d: string;
  s: number;
  sel: string;
  st: OpportunityStatus;
  /** hours since last contact, null = never contacted */
  lc: number | null;
  /** minutes since routed to the seller */
  asg: number;
  /** minutes until first response, null = still unattended */
  resp: number | null;
  o: string;
  v: number;
  bike?: string;
  trade?: boolean;
  sim?: boolean;
  rp: CommercialRoute;
  ra: CommercialRoute;
  fit: "alta" | "média" | "baixa";
  rn: string;
  src: string;
}

const FIT_NOTE_LOW =
  "O orçamento informado apresenta possível incompatibilidade com a configuração desejada. Uma unidade seminova pode aumentar a aderência ao orçamento.";

const raw: Raw[] = [
  {
    n: "João Silva",
    p: "Sahara 300",
    c: "0 km",
    m: "Financiamento",
    b: "Até R$ 1.000/mês",
    e: "R$ 10.000",
    d: "Até 7 dias",
    s: 94,
    sel: "guilherme",
    st: "Em atendimento",
    lc: 26,
    asg: 11,
    resp: null,
    o: "Valor da parcela",
    v: 27000,
    bike: "Honda CB 250F 2019",
    trade: true,
    sim: true,
    rp: "Financiamento",
    ra: "Seminova",
    fit: "baixa",
    rn: FIT_NOTE_LOW,
    src: "Meta Ads",
  },
  {
    n: "Mariana Costa",
    p: "PCX",
    c: "0 km",
    m: "Consórcio",
    b: "Até R$ 700/mês",
    e: "Sem entrada",
    d: "Até 30 dias",
    s: 81,
    sel: "francine",
    st: "Novo",
    lc: null,
    asg: 7,
    resp: null,
    o: "Não tenho entrada",
    v: 22500,
    trade: false,
    sim: false,
    rp: "Consórcio",
    ra: "Atendimento consultivo",
    fit: "média",
    rn: "Sem entrada disponível: consórcio é a rota com maior aderência ao perfil informado.",
    src: "Google Ads",
  },
  {
    n: "Pedro Almeida",
    p: "CG 160",
    c: "Seminova",
    m: "À vista",
    b: "Até R$ 18.000",
    e: "—",
    d: "1–3 meses",
    s: 67,
    sel: "gabriel",
    st: "Follow-up",
    lc: 30,
    asg: 2600,
    resp: 22,
    o: "Estou comparando opções",
    v: 17500,
    bike: "Honda Biz 125 2016",
    trade: true,
    sim: false,
    rp: "Seminova",
    ra: "Avaliação de troca",
    fit: "alta",
    rn: "Pagamento à vista com moto para troca: avaliação presencial tende a fechar o valor.",
    src: "Indicação",
  },
  {
    n: "Lucas Martins",
    p: "CB 300F",
    c: "0 km",
    m: "Financiamento",
    b: "Até R$ 500/mês",
    e: "R$ 2.000",
    d: "Até 30 dias",
    s: 58,
    sel: "vitor",
    st: "Aguardando cliente",
    lc: 52,
    asg: 5000,
    resp: 34,
    o: "Preciso de parcela menor",
    v: 24900,
    trade: false,
    sim: true,
    rp: "Seminova",
    ra: "Consórcio",
    fit: "baixa",
    rn: FIT_NOTE_LOW,
    src: "Meta Ads",
  },
  {
    n: "Fernanda Rocha",
    p: "Biz 125",
    c: "0 km",
    m: "Financiamento",
    b: "Até R$ 500/mês",
    e: "R$ 3.500",
    d: "Até 7 dias",
    s: 88,
    sel: "francine",
    st: "Proposta enviada",
    lc: 20,
    asg: 4200,
    resp: 5,
    o: "Nada",
    v: 15900,
    trade: false,
    sim: true,
    rp: "Financiamento",
    ra: "0 km",
    fit: "alta",
    rn: "Entrada e prazo compatíveis com a configuração desejada.",
    src: "Meta Ads",
  },
  {
    n: "Rodrigo Nunes",
    p: "ADV",
    c: "0 km",
    m: "Financiamento",
    b: "R$ 1.000+/mês",
    e: "R$ 8.000",
    d: "Até 7 dias",
    s: 91,
    sel: "guilherme",
    st: "Negociação",
    lc: 6,
    asg: 6000,
    resp: 3,
    o: "Prazo de entrega",
    v: 32900,
    bike: "Honda PCX 2021",
    trade: true,
    sim: true,
    rp: "Financiamento",
    ra: "Avaliação de troca",
    fit: "alta",
    rn: "Perfil aderente: entrada alta, troca disponível e prazo curto.",
    src: "Site",
  },
  {
    n: "Camila Duarte",
    p: "Pop 110i",
    c: "0 km",
    m: "Consórcio",
    b: "Até R$ 300/mês",
    e: "Sem entrada",
    d: "Mais de 3 meses",
    s: 34,
    sel: "vitor",
    st: "Novo",
    lc: null,
    asg: 18,
    resp: null,
    o: "Estou juntando dinheiro",
    v: 11900,
    trade: false,
    sim: false,
    rp: "Consórcio",
    ra: "Atendimento consultivo",
    fit: "média",
    rn: "Horizonte de compra longo: nutrição consultiva antes de proposta.",
    src: "Meta Ads",
  },
  {
    n: "Thiago Barbosa",
    p: "Tornado 300",
    c: "Seminova",
    m: "Financiamento",
    b: "R$ 700–1.000/mês",
    e: "R$ 5.000",
    d: "Até 7 dias",
    s: 86,
    sel: "gabriel",
    st: "Em atendimento",
    lc: 3,
    asg: 14,
    resp: null,
    o: "Questão de crédito",
    v: 21500,
    bike: "Yamaha Factor 150 2018",
    trade: true,
    sim: true,
    rp: "Seminova",
    ra: "Consórcio",
    fit: "média",
    rn: "Restrição de crédito relatada: consórcio é opção recomendada para avaliação.",
    src: "Google Ads",
  },
  {
    n: "Aline Freitas",
    p: "PCX",
    c: "Seminova",
    m: "À vista",
    b: "Até R$ 20.000",
    e: "—",
    d: "Até 30 dias",
    s: 72,
    sel: "francine",
    st: "Proposta enviada",
    lc: 44,
    asg: 7200,
    resp: 9,
    o: "Estou comparando opções",
    v: 19800,
    trade: false,
    sim: false,
    rp: "Seminova",
    ra: "À vista",
    fit: "alta",
    rn: "Pagamento à vista com orçamento compatível ao estoque seminovo.",
    src: "Indicação",
  },
  {
    n: "Bruno Carvalho",
    p: "CG 160",
    c: "0 km",
    m: "Financiamento",
    b: "Até R$ 500/mês",
    e: "R$ 1.500",
    d: "Até 30 dias",
    s: 63,
    sel: "vitor",
    st: "Follow-up",
    lc: 40,
    asg: 8000,
    resp: 17,
    o: "Não tenho entrada",
    v: 16900,
    trade: false,
    sim: true,
    rp: "Financiamento",
    ra: "Seminova",
    fit: "média",
    rn: "Entrada baixa: seminova reduz parcela e mantém o cliente na negociação.",
    src: "Meta Ads",
  },
  {
    n: "Patrícia Lima",
    p: "Biz 125",
    c: "Seminova",
    m: "À vista",
    b: "Até R$ 12.000",
    e: "—",
    d: "Até 7 dias",
    s: 79,
    sel: "gabriel",
    st: "Negociação",
    lc: 5,
    asg: 3000,
    resp: 11,
    o: "Nada",
    v: 11800,
    trade: false,
    sim: false,
    rp: "Seminova",
    ra: "À vista",
    fit: "alta",
    rn: "Compra rápida e orçamento aderente ao estoque atual.",
    src: "Site",
  },
  {
    n: "Gabriel Souza",
    p: "Sahara 300",
    c: "0 km",
    m: "Consórcio",
    b: "R$ 700–1.000/mês",
    e: "Sem entrada",
    d: "1–3 meses",
    s: 55,
    sel: "guilherme",
    st: "Aguardando cliente",
    lc: 70,
    asg: 9000,
    resp: 26,
    o: "Preciso financiar",
    v: 27400,
    trade: false,
    sim: false,
    rp: "Consórcio",
    ra: "Seminova",
    fit: "baixa",
    rn: FIT_NOTE_LOW,
    src: "Meta Ads",
  },
  {
    n: "Renata Alves",
    p: "Elite 125",
    c: "0 km",
    m: "Financiamento",
    b: "Até R$ 500/mês",
    e: "R$ 2.500",
    d: "Até 7 dias",
    s: 83,
    sel: "francine",
    st: "Em atendimento",
    lc: 1,
    asg: 4,
    resp: null,
    o: "Valor da parcela",
    v: 17500,
    trade: false,
    sim: true,
    rp: "Financiamento",
    ra: "0 km",
    fit: "alta",
    rn: "Simulação já realizada e prazo curto: priorizar fechamento.",
    src: "Google Ads",
  },
  {
    n: "Marcelo Pinheiro",
    p: "XRE 190",
    c: "0 km",
    m: "Financiamento",
    b: "R$ 700–1.000/mês",
    e: "R$ 6.000",
    d: "Até 30 dias",
    s: 76,
    sel: "guilherme",
    st: "Proposta enviada",
    lc: 28,
    asg: 12000,
    resp: 7,
    o: "Estou comparando opções",
    v: 25600,
    bike: "Honda CG 160 2017",
    trade: true,
    sim: true,
    rp: "Financiamento",
    ra: "Avaliação de troca",
    fit: "alta",
    rn: "Troca disponível pode cobrir a diferença de entrada.",
    src: "Site",
  },
  {
    n: "Isabela Moraes",
    p: "Pop 110i",
    c: "Seminova",
    m: "À vista",
    b: "Até R$ 8.000",
    e: "—",
    d: "Apenas pesquisando",
    s: 29,
    sel: "vitor",
    st: "Novo",
    lc: null,
    asg: 90,
    resp: null,
    o: "Estou comparando opções",
    v: 7900,
    trade: false,
    sim: false,
    rp: "Atendimento consultivo",
    ra: "Seminova",
    fit: "média",
    rn: "Intenção exploratória: manter em nutrição, sem consumir tempo comercial.",
    src: "Meta Ads",
  },
  {
    n: "Diego Fontes",
    p: "CB 300F",
    c: "0 km",
    m: "Financiamento",
    b: "R$ 1.000+/mês",
    e: "R$ 12.000",
    d: "Até 7 dias",
    s: 97,
    sel: "francine",
    st: "Negociação",
    lc: 2,
    asg: 2000,
    resp: 2,
    o: "Nada",
    v: 29900,
    bike: "Honda Twister 250 2020",
    trade: true,
    sim: true,
    rp: "Financiamento",
    ra: "Avaliação de troca",
    fit: "alta",
    rn: "Score máximo: entrada alta, troca e simulação concluída.",
    src: "Indicação",
  },
  {
    n: "Vanessa Prado",
    p: "ADV",
    c: "Seminova",
    m: "Financiamento",
    b: "R$ 500–700/mês",
    e: "R$ 4.000",
    d: "Até 30 dias",
    s: 69,
    sel: "gabriel",
    st: "Follow-up",
    lc: 36,
    asg: 15000,
    resp: 19,
    o: "Preciso de parcela menor",
    v: 23400,
    trade: false,
    sim: true,
    rp: "Seminova",
    ra: "Consórcio",
    fit: "média",
    rn: "Parcela pretendida abaixo da configuração 0 km: seminova mantém aderência.",
    src: "Google Ads",
  },
  {
    n: "Eduardo Ramos",
    p: "CG 160",
    c: "0 km",
    m: "À vista",
    b: "Até R$ 18.000",
    e: "—",
    d: "Até 7 dias",
    s: 89,
    sel: "guilherme",
    st: "Venda",
    lc: 96,
    asg: 20000,
    resp: 4,
    o: "Nada",
    v: 17900,
    trade: false,
    sim: false,
    rp: "À vista",
    ra: "0 km",
    fit: "alta",
    rn: "Fechamento direto à vista.",
    src: "Site",
  },
  {
    n: "Larissa Teixeira",
    p: "Biz 125",
    c: "0 km",
    m: "Consórcio",
    b: "Até R$ 300/mês",
    e: "Sem entrada",
    d: "Mais de 3 meses",
    s: 25,
    sel: "vitor",
    st: "Perdida",
    lc: 200,
    asg: 26000,
    resp: 61,
    o: "Comprou outra marca",
    v: 15200,
    trade: false,
    sim: false,
    rp: "Consórcio",
    ra: "Atendimento consultivo",
    fit: "baixa",
    rn: "Sem entrada e prazo longo: baixa prioridade comercial.",
    src: "Meta Ads",
  },
  {
    n: "Henrique Alves",
    p: "Tornado 300",
    c: "0 km",
    m: "Financiamento",
    b: "R$ 700–1.000/mês",
    e: "R$ 7.000",
    d: "Até 7 dias",
    s: 90,
    sel: "gabriel",
    st: "Em atendimento",
    lc: 4,
    asg: 22,
    resp: null,
    o: "Valor da parcela",
    v: 28400,
    bike: "Honda XRE 190 2019",
    trade: true,
    sim: true,
    rp: "Financiamento",
    ra: "Seminova",
    fit: "média",
    rn: "Parcela pretendida próxima do limite: avaliar prazo estendido ou seminova.",
    src: "Meta Ads",
  },
  {
    n: "Sofia Andrade",
    p: "PCX",
    c: "0 km",
    m: "Financiamento",
    b: "R$ 500–700/mês",
    e: "R$ 3.000",
    d: "Até 30 dias",
    s: 64,
    sel: "francine",
    st: "Aguardando cliente",
    lc: 60,
    asg: 17000,
    resp: 13,
    o: "Questão de crédito",
    v: 22500,
    trade: false,
    sim: true,
    rp: "Consórcio",
    ra: "Seminova",
    fit: "baixa",
    rn: "Restrição de crédito: consórcio como opção recomendada para avaliação.",
    src: "Google Ads",
  },
  {
    n: "Otávio Machado",
    p: "XRE 190",
    c: "Seminova",
    m: "Financiamento",
    b: "R$ 500–700/mês",
    e: "R$ 4.500",
    d: "1–3 meses",
    s: 52,
    sel: "guilherme",
    st: "Follow-up",
    lc: 48,
    asg: 19000,
    resp: 28,
    o: "Estou juntando dinheiro",
    v: 18700,
    trade: false,
    sim: false,
    rp: "Seminova",
    ra: "Atendimento consultivo",
    fit: "média",
    rn: "Compra planejada: manter follow-up estruturado até o prazo informado.",
    src: "Site",
  },
  {
    n: "Beatriz Nogueira",
    p: "Elite 125",
    c: "Seminova",
    m: "À vista",
    b: "Até R$ 13.000",
    e: "—",
    d: "Até 30 dias",
    s: 71,
    sel: "vitor",
    st: "Proposta enviada",
    lc: 33,
    asg: 11000,
    resp: 15,
    o: "Nada",
    v: 12900,
    trade: false,
    sim: false,
    rp: "Seminova",
    ra: "À vista",
    fit: "alta",
    rn: "Orçamento compatível com o estoque disponível.",
    src: "Indicação",
  },
  {
    n: "Felipe Cardoso",
    p: "CB 300F",
    c: "Seminova",
    m: "Financiamento",
    b: "R$ 700–1.000/mês",
    e: "R$ 6.500",
    d: "Até 7 dias",
    s: 85,
    sel: "gabriel",
    st: "Novo",
    lc: null,
    asg: 13,
    resp: null,
    o: "Preciso financiar",
    v: 24300,
    bike: "Honda Fan 160 2018",
    trade: true,
    sim: true,
    rp: "Financiamento",
    ra: "Avaliação de troca",
    fit: "alta",
    rn: "Oportunidade quente aguardando primeiro atendimento.",
    src: "Meta Ads",
  },
  {
    n: "Carla Mendes",
    p: "Sahara 300",
    c: "Seminova",
    m: "Financiamento",
    b: "R$ 500–700/mês",
    e: "R$ 3.000",
    d: "Até 30 dias",
    s: 61,
    sel: "francine",
    st: "Follow-up",
    lc: 38,
    asg: 21000,
    resp: 21,
    o: "Preciso de parcela menor",
    v: 22800,
    trade: false,
    sim: true,
    rp: "Seminova",
    ra: "Consórcio",
    fit: "média",
    rn: "Seminova recupera aderência ao orçamento informado.",
    src: "Google Ads",
  },
  {
    n: "Ricardo Fonseca",
    p: "ADV",
    c: "0 km",
    m: "À vista",
    b: "Até R$ 32.000",
    e: "—",
    d: "Até 7 dias",
    s: 93,
    sel: "guilherme",
    st: "Venda",
    lc: 120,
    asg: 24000,
    resp: 6,
    o: "Nada",
    v: 32900,
    trade: false,
    sim: false,
    rp: "À vista",
    ra: "0 km",
    fit: "alta",
    rn: "Compra à vista com produto definido.",
    src: "Site",
  },
  {
    n: "Juliana Peixoto",
    p: "Pop 110i",
    c: "0 km",
    m: "Financiamento",
    b: "Até R$ 300/mês",
    e: "R$ 1.000",
    d: "1–3 meses",
    s: 41,
    sel: "vitor",
    st: "Perdida",
    lc: 180,
    asg: 27000,
    resp: 45,
    o: "Cliente não respondeu",
    v: 12400,
    trade: false,
    sim: false,
    rp: "Consórcio",
    ra: "Atendimento consultivo",
    fit: "baixa",
    rn: "Contato sem retorno após três tentativas.",
    src: "Meta Ads",
  },
  {
    n: "André Vasconcelos",
    p: "Tornado 300",
    c: "Seminova",
    m: "À vista",
    b: "Até R$ 22.000",
    e: "—",
    d: "Até 7 dias",
    s: 87,
    sel: "gabriel",
    st: "Negociação",
    lc: 8,
    asg: 5200,
    resp: 12,
    o: "Valor da avaliação da troca",
    v: 21900,
    bike: "Honda CB 500 2015",
    trade: true,
    sim: false,
    rp: "Avaliação de troca",
    ra: "Seminova",
    fit: "alta",
    rn: "Fechamento depende da avaliação da moto atual.",
    src: "Indicação",
  },
];

function buildReasons(r: Raw): string[] {
  const out: string[] = [];
  if (r.d === "Até 7 dias") out.push("Compra em até 7 dias");
  else if (r.d === "Até 30 dias") out.push("Compra prevista em até 30 dias");
  else out.push("Horizonte de compra mais longo");
  out.push(`Produto definido: ${r.p} ${r.c}`);
  out.push(
    r.e === "—" || r.e === "Sem entrada" ? "Sem entrada declarada" : `Entrada disponível (${r.e})`,
  );
  if (r.sim) out.push("Já realizou simulação");
  if (r.trade) out.push("Possui moto para troca");
  out.push(`Forma de compra: ${r.m}`);
  out.push(`Compatibilidade produto/orçamento: ${r.fit}`);
  return out;
}

export function buildOpportunities(): Opportunity[] {
  const scCities = [...LAGES_REGION_CITIES];
  const tpCities = ["Três Passos", "Tenente Portela", "Crissiumal", "Três Passos", "Esperança do Sul"];
  const srCities = ["Santa Rosa", "Giruá", "Tuparendi", "Santa Rosa", "Santo Cristo"];

  return raw.map((r, i) => {
    const isSC = i % 3 === 0;
    const state: LeadState = isSC ? "SC" : "RS";
    let store: LeadStore;
    let city: string;
    let region: string;
    let areaCode: string;

    if (state === "SC") {
      store = "Lages / SC";
      city = scCities[Math.floor(i / 3) % scCities.length]!;
      region = "Santa Catarina";
      areaCode = "49";
    } else if (i % 2 === 0) {
      store = "Três Passos / RS";
      city = tpCities[i % tpCities.length]!;
      region = "Rio Grande do Sul";
      areaCode = "55";
    } else {
      store = "Santa Rosa / RS";
      city = srCities[i % srCities.length]!;
      region = "Rio Grande do Sul";
      areaCode = "55";
    }

    return {
      id: `OPP-${String(1001 + i)}`,
      customer: {
        name: r.n,
        whatsapp: `(${areaCode}) 9${String(8000 + i).slice(0, 4)}-${String(1200 + i * 7).slice(0, 4)}`,
        email: `${r.n.toLowerCase().split(" ")[0]}@email.com`,
      },
      state,
      store,
      city,
      region,
      product: r.p,
      category: r.c,
      method: r.m,
      budget: r.b,
      downPayment: r.e,
      deadline: r.d,
      score: r.s,
      scoreReasons: buildReasons(r),
      sellerId:
        r.s >= 80
          ? i % 3 === 0
            ? "guilherme"
            : "francine"
          : ["francine", "guilherme", "francine", "guilherme", "francine", "vitor", "guilherme", "francine", "vitor", "gabriel"][
              i % 10
            ]!,
      status: r.st,
      lastContactAt: r.lc === null ? null : iso(-r.lc * HOUR),
      assignedAt: iso(-r.asg * MIN),
      firstResponseAt: r.resp === null ? null : iso(-(r.asg - r.resp) * MIN),
      objection: r.o,
      potentialValue: r.v,
      hasBike: Boolean(r.bike),
      ...(r.bike ? { currentBike: r.bike } : {}),
      tradeIn: Boolean(r.trade),
      simulated: Boolean(r.sim),
      route: { primary: r.rp, alternative: r.ra, rationale: r.rn, budgetFit: r.fit },
      source: r.src,
    };
  });
}

export function buildFollowUps(opps: Opportunity[]): FollowUp[] {
  const plan: Array<[number, number, string]> = [
    [0, -2 * HOUR, "Enviar condição revisada de parcela"],
    [2, -1 * DAY, "Retornar sobre avaliação da moto atual"],
    [3, -5 * HOUR, "Reapresentar simulação com prazo estendido"],
    [9, -26 * HOUR, "Confirmar interesse após envio da proposta"],
    [16, -3 * HOUR, "Enviar opções de seminovas equivalentes"],
    [21, -2 * DAY, "Retomar contato sobre planejamento de compra"],
    [24, -8 * HOUR, "Reforçar condição de entrada"],
    [1, 3 * HOUR, "Explicar funcionamento do consórcio"],
    [4, 5 * HOUR, "Confirmar documentação para financiamento"],
    [7, 2 * HOUR, "Apresentar alternativa de consórcio"],
    [10, 6 * HOUR, "Agendar visita para fechamento"],
    [12, 1 * HOUR, "Enviar simulação atualizada"],
    [13, 7 * HOUR, "Retorno sobre proposta enviada"],
    [15, 4 * HOUR, "Confirmar avaliação de troca"],
    [17, 9 * HOUR, "Fechar condição à vista"],
    [19, 30 * MIN, "Primeiro atendimento — oportunidade quente"],
    [20, 8 * HOUR, "Apresentar rota de consórcio"],
    [22, 5 * HOUR, "Enviar fotos da unidade seminova"],
    [23, 90 * MIN, "Primeiro contato e qualificação"],
    [5, 1 * DAY + 2 * HOUR, "Alinhar prazo de entrega"],
    [8, 1 * DAY + 4 * HOUR, "Retomar comparativo de modelos"],
    [11, 1 * DAY + 6 * HOUR, "Reavaliar orçamento com seminova"],
    [14, 1 * DAY + 3 * HOUR, "Nutrição consultiva"],
    [18, 1 * DAY + 5 * HOUR, "Revisar simulação de crédito"],
    [25, 1 * DAY + 7 * HOUR, "Confirmar interesse na seminova"],
    [6, 3 * DAY, "Reapresentar consórcio"],
    [26, 4 * DAY, "Reengajamento pós-perda"],
    [27, 2 * DAY, "Concluir avaliação da troca"],
  ];
  return plan
    .filter(([i]) => opps[i])
    .map(([i, offset, action], k) => ({
      id: `FU-${2001 + k}`,
      opportunityId: opps[i]!.id,
      dueAt: iso(offset),
      action,
      done: false,
    }));
}

export function buildProposals(opps: Opportunity[]): Proposal[] {
  const plan: Array<[number, number, number, Proposal["status"]]> = [
    [0, 26900, 989, "Negociação"],
    [4, 15890, 479, "Visualizada"],
    [5, 32900, 1189, "Negociação"],
    [8, 19800, 0, "Aguardando retorno"],
    [10, 11800, 0, "Negociação"],
    [13, 25600, 899, "Enviada"],
    [15, 29900, 1099, "Negociação"],
    [17, 17900, 0, "Fechada"],
    [22, 12900, 0, "Aguardando retorno"],
    [25, 32900, 0, "Fechada"],
    [18, 15200, 429, "Perdida"],
    [27, 21900, 0, "Negociação"],
    [12, 17500, 549, "Rascunho"],
    [20, 22500, 719, "Enviada"],
  ];
  return plan
    .filter(([i]) => opps[i])
    .map(([i, value, installment, status], k) => ({
      id: `PRP-${3001 + k}`,
      opportunityId: opps[i]!.id,
      value,
      installment,
      method: opps[i]!.method,
      status,
      sellerId: opps[i]!.sellerId,
      createdAt: iso(-(k + 1) * 9 * HOUR),
    }));
}

export function buildNotifications(opps: Opportunity[]): AppNotification[] {
  const find = (name: string) => opps.find((o) => o.customer.name === name);
  const list: AppNotification[] = [
    {
      id: "NT-1",
      kind: "hot",
      title: "João Silva — oportunidade quente sem resposta",
      description: "Score 94 · sem atendimento há mais de 10 minutos",
      ...(find("João Silva") ? { opportunityId: find("João Silva")!.id } : {}),
      read: false,
      createdAt: iso(-11 * MIN),
    },
    {
      id: "NT-2",
      kind: "followup",
      title: "Follow-up atrasado — Pedro Almeida",
      description: "Retornar sobre avaliação da moto atual",
      ...(find("Pedro Almeida") ? { opportunityId: find("Pedro Almeida")!.id } : {}),
      read: false,
      createdAt: iso(-1 * DAY),
    },
    {
      id: "NT-3",
      kind: "proposal",
      title: "Proposta de Mariana Costa sem acompanhamento",
      description: "Enviada há 2 dias, sem retorno registrado",
      ...(find("Mariana Costa") ? { opportunityId: find("Mariana Costa")!.id } : {}),
      read: false,
      createdAt: iso(-5 * HOUR),
    },
    {
      id: "NT-4",
      kind: "seller",
      title: "Gabriel com 3 oportunidades quentes sem resposta",
      description: "Tempo médio de resposta acima da meta (13 min)",
      read: false,
      createdAt: iso(-42 * MIN),
    },
    {
      id: "NT-5",
      kind: "money",
      title: "Oportunidade de R$ 27.000 em risco",
      description: "João Silva — parcela incompatível e sem contato hoje",
      ...(find("João Silva") ? { opportunityId: find("João Silva")!.id } : {}),
      read: false,
      createdAt: iso(-2 * HOUR),
    },
  ];
  return list;
}

export const DEALERSHIP = "Via Passos Honda — Demonstração";

export const DEMO_CREDENTIALS = { email: "gestor@vyntra.com", password: "123456" };
export const DEMO_CREDENTIALS_GESTOR = {
  email: "gestor@vyntra.com",
  password: "123456",
  name: "Airton Lindão",
  role: "gestor" as const,
  title: "Gerência Geral de Vendas",
};
export const DEMO_CREDENTIALS_VENDEDOR = {
  email: "francine@vyntra.com",
  password: "123456",
  name: "Francine",
  sellerId: "francine",
  role: "vendedor" as const,
  title: "Consultora Comercial",
};
