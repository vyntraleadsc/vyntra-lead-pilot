export type Temperature = "muito_quente" | "potencial" | "morno" | "baixo";

export type Category = "0 km" | "Seminova";

export type LeadState = "RS" | "SC";

export type LeadStore = "Nova Serra / SC" | "Vale Azul / RS" | "Santa Aurora / RS";

export type PurchaseMethod = "Financiamento" | "Consórcio" | "À vista";

export type OpportunityStatus =
  | "Novo"
  | "Em atendimento"
  | "Follow-up"
  | "Aguardando cliente"
  | "Proposta enviada"
  | "Negociação"
  | "Venda"
  | "Perdida";

export type CommercialRoute =
  | "0 km"
  | "Seminova"
  | "Financiamento"
  | "Consórcio"
  | "À vista"
  | "Avaliação de troca"
  | "Atendimento consultivo";

export interface Customer {
  name: string;
  whatsapp: string;
  email?: string;
}

export interface RouteRecommendation {
  primary: CommercialRoute;
  alternative: CommercialRoute;
  rationale: string;
  budgetFit: "alta" | "média" | "baixa";
}

export interface Opportunity {
  id: string;
  customer: Customer;
  state: LeadState;
  store: LeadStore;
  city: string;
  region: string;
  product: string;
  category: Category;
  method: PurchaseMethod;
  budget: string;
  downPayment: string;
  deadline: string;
  score: number;
  scoreReasons: string[];
  sellerId: string;
  status: OpportunityStatus;
  /** ISO date of last registered contact, null when never contacted */
  lastContactAt: string | null;
  /** ISO date the opportunity was routed to the seller */
  assignedAt: string;
  /** ISO date of first seller response, null when still unattended */
  firstResponseAt: string | null;
  objection: string;
  potentialValue: number;
  hasBike: boolean;
  currentBike?: string;
  tradeIn: boolean;
  simulated: boolean;
  route: RouteRecommendation;
  source: string;
}

export interface Seller {
  id: string;
  name: string;
  online: boolean;
  avgResponseMinutes: number;
  conversion: number;
  sales: number;
  specialty: string;
}

export type FollowUpBucket = "atrasado" | "hoje" | "amanha" | "proximos";

export interface FollowUp {
  id: string;
  opportunityId: string;
  dueAt: string;
  action: string;
  done: boolean;
}

export type ProposalStatus =
  | "Rascunho"
  | "Enviada"
  | "Visualizada"
  | "Aguardando retorno"
  | "Negociação"
  | "Fechada"
  | "Perdida";

export interface Proposal {
  id: string;
  opportunityId: string;
  value: number;
  installment: number;
  method: PurchaseMethod;
  status: ProposalStatus;
  sellerId: string;
  createdAt: string;
}

export interface AppNotification {
  id: string;
  kind: "hot" | "followup" | "proposal" | "seller" | "money";
  title: string;
  description: string;
  opportunityId?: string;
  read: boolean;
  createdAt: string;
}

export interface DistributionRules {
  autoDistribution: boolean;
  byProduct: boolean;
  bySellerProfile: boolean;
  byAvailability: boolean;
  byWorkload: boolean;
  byPriority: boolean;
}

export const NOVA_SERRA_REGION_CITIES = [
  "Nova Serra",
  "Vale Azul",
  "Santa Aurora",
  "Jardim Norte",
  "Vila Central",
  "Alto da Serra",
  "Bela Vista",
  "Porto Belo",
  "Monte Alto",
  "Rio Claro",
  "Pinhal Novo",
] as const;

export const LAGES_REGION_CITIES = NOVA_SERRA_REGION_CITIES;

export type LagesRegionCity = (typeof LAGES_REGION_CITIES)[number];

export interface OpportunityFilters {
  search: string;
  period: string;
  state: string;
  store: string;
  city: string;
  sellerId: string;
  product: string;
  category: string;
  method: string;
  temperature: string;
  status: string;
}

export type PlanTier = "essencial" | "performance" | "enterprise";

