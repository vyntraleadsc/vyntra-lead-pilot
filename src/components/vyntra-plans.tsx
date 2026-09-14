import { useState } from "react";
import {
  Award,
  BadgeCheck,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  Crown,
  HelpCircle,
  Layers,
  Lock,
  QrCode,
  RefreshCw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Trophy,
  Users,
  Zap,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { useVyntra } from "@/lib/vyntra/store";
import { type PlanTier } from "@/lib/vyntra/types";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PlanDetail {
  id: PlanTier;
  name: string;
  price: string;
  priceValue: number;
  period: string;
  priceNote?: string;
  headline: string;
  description: string;
  highlight?: boolean;
  badge?: string;
  features: string[];
  exclusiveFeatures: {
    name: string;
    lockedIn?: PlanTier[];
    description: string;
  }[];
}

export const PLANS_DATA: PlanDetail[] = [
  {
    id: "essencial",
    name: "Essencial",
    price: "R$ 797",
    priceValue: 797,
    period: "/mês",
    headline: "Recursos fundamentais para iniciar a gestão de leads",
    description:
      "Pacote enxuto e essencial para estruturar o atendimento e a qualificação de novos contatos.",
    features: [
      "Visão Geral",
      "Oportunidades",
      "Qualificação",
      "Follow-ups",
      "Propostas",
      "Campanha de Anúncio",
    ],
    exclusiveFeatures: [
      {
        name: "Visão Geral & Fila",
        description: "Acompanhamento em tempo real dos leads e fila de atendimento",
      },
      {
        name: "Oportunidades & Pipeline",
        description: "Gestão do funil de vendas e status dos clientes",
      },
      {
        name: "Qualificação & Vyntra Score",
        description: "Quiz simplificado em 4 cliques e pontuação automática",
      },
      {
        name: "Follow-ups & Propostas",
        description: "Agendamento de contatos e envio de propostas comerciais",
      },
      {
        name: "Campanha de Anúncio",
        description: "Captação de leads e campanhas promocionais de entrada",
      },
    ],
  },
  {
    id: "performance",
    name: "Performance",
    price: "R$ 1.197",
    priceValue: 1197,
    period: "/mês",
    highlight: true,
    badge: "MAIS ESCOLHIDO",
    headline: "Operação comercial completa com automações e escala",
    description:
      "A operação comercial definitiva com inteligência ativa, distribuição por regras e métricas financeiras.",
    features: [
      "Tudo do Essencial",
      "Distribuição",
      "Insights",
      "Impacto Comercial",
      "Campanhas avançadas",
      "Disparos personalizados",
      "Gestão de equipe",
      "Automações",
      "Qualificação avançada",
    ],
    exclusiveFeatures: [
      {
        name: "Distribuição Inteligente",
        lockedIn: ["essencial"],
        description: "Roteamento automático por perfil de vendedor, disponibilidade e carga",
      },
      {
        name: "Insights Comerciais",
        lockedIn: ["essencial"],
        description: "Inteligência preditiva, horários de pico e gargalos de conversão",
      },
      {
        name: "Impacto Comercial & ROI",
        lockedIn: ["essencial"],
        description: "Simulador financeiro de receita adicional e conversão",
      },
      {
        name: "Gestão de Equipe & Vendedores",
        lockedIn: ["essencial"],
        description: "Monitoramento individual de vendedores, metas e tempo de resposta",
      },
      {
        name: "Automações & Disparos",
        lockedIn: ["essencial"],
        description: "Ações automáticas e réguas de relacionamento programadas",
      },
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "R$ 1.997",
    priceValue: 1997,
    period: "/mês",
    priceNote: "A partir de",
    headline: "A experiência completa da Vyntra para grandes operações",
    description:
      "Governança corporativa, controle multiunidade, integrações completas e acompanhamento estratégico.",
    features: [
      "Tudo do Performance",
      "Permissões avançadas",
      "Multiunidade",
      "Personalização avançada",
      "Administração avançada",
      "Recursos exclusivos Enterprise",
      "Suporte prioritário",
    ],
    exclusiveFeatures: [
      {
        name: "Multiunidade Total",
        lockedIn: ["essencial", "performance"],
        description: "Gestão integrada de matriz e filiais com visualização unificada",
      },
      {
        name: "Permissões Avançadas & RBAC",
        lockedIn: ["essencial", "performance"],
        description: "Controle granular por nível de cargo, departamento e unidade",
      },
      {
        name: "Personalização & Regras Customizadas",
        lockedIn: ["essencial", "performance"],
        description: "Campos customizados, etapas sob medida e branding institucional",
      },
      {
        name: "Administração & Auditoria",
        lockedIn: ["essencial", "performance"],
        description: "Histórico completo de ações, logs de acesso e exportação executiva",
      },
      {
        name: "Suporte Prioritário & SLA Dedicado",
        lockedIn: ["essencial", "performance"],
        description: "Canal direto com gerente de sucesso e consultoria de implantação",
      },
    ],
  },
];

interface PlansPageProps {
  setView?: (v: any) => void;
}

export function PlansPage({ setView }: PlansPageProps) {
  const { currentPlan = "performance", setCurrentPlan } = useVyntra();
  const [selectedPlanForContract, setSelectedPlanForContract] = useState<PlanDetail | null>(null);
  const [checkoutStep, setCheckoutStep] = useState<"initial" | "checkout" | "success" | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"card" | "pix">("card");
  const [isProcessing, setIsProcessing] = useState(false);

  // Form mock
  const [formData, setFormData] = useState({
    name: "Ricardo Mendes Guimarães",
    email: "diretoria@grupocatarinense.com.br",
    phone: "(49) 99182-3400",
    company: "Concessionária Catarinense Veículos e Motos Ltda",
    cnpj: "82.491.204/0001-92",
    city: "Lages",
    state: "SC",
    cardNumber: "•••• •••• •••• 4289",
    cardExp: "12/29",
    cardCvv: "•••",
    cardHolder: "RICARDO M GUIMARAES",
  });

  const activePlanConfig = (PLANS_DATA.find((p) => p.id === currentPlan) || PLANS_DATA[1]) as PlanDetail;

  const handleStartContract = (plan: PlanDetail) => {
    setSelectedPlanForContract(plan);
    setCheckoutStep("initial");
  };

  const handleProceedToCheckout = () => {
    setCheckoutStep("checkout");
  };

  const handleConfirmSubscription = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setCheckoutStep("success");
    }, 1000);
  };

  const handleFinishAndReturn = () => {
    if (selectedPlanForContract) {
      setCurrentPlan(selectedPlanForContract.id);
      toast.success(
        `Plano ${selectedPlanForContract.name.toUpperCase()} ativado no ambiente de demonstração!`,
      );
    }
    setCheckoutStep(null);
    setSelectedPlanForContract(null);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Header da Página */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
            <Trophy className="size-3.5" />
            Planos Comerciais Vyntra
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
            Escolha o plano ideal para a sua concessionária
          </h1>
          <p className="mt-1 text-sm text-muted-foreground max-w-2xl">
            Estruture seu funil comercial, aumente a taxa de resposta e acelere a conversão de leads com a inteligência Vyntra.
          </p>
        </div>

        {/* Botão rápido para ir ao overview se necessário */}
        {setView && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setView("overview")}
            className="self-start md:self-auto gap-2"
          >
            Voltar para o Dashboard
          </Button>
        )}
      </div>

      {/* BANNER DO MODO DEMONSTRAÇÃO (REQUISITO FUNDAMENTAL) */}
      <div className="rounded-2xl border-2 border-primary/40 bg-gradient-to-r from-primary/15 via-card to-primary/10 p-5 sm:p-6 shadow-lg">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider text-primary">
                Modo Demonstração Comercial Ativo
              </span>
            </div>
            <div className="text-lg font-bold text-foreground sm:text-xl flex items-center gap-2">
              Plano demonstrado no momento:
              <span className="rounded-md bg-primary px-2.5 py-0.5 text-sm font-bold text-primary-foreground uppercase shadow-sm">
                {activePlanConfig.name}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-2xl">
              Alterne livremente entre os planos abaixo para apresentar ao cliente exatamente como a plataforma se comporta em cada nível de contratação, sem cobrança e sem novos cadastros.
            </p>
          </div>

          {/* Seletor rápido de demonstração */}
          <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto">
            <span className="text-xs font-semibold text-muted-foreground mr-1 hidden sm:inline">
              Alterar plano:
            </span>
            {PLANS_DATA.map((p) => {
              const isActive = currentPlan === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setCurrentPlan(p.id)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-bold transition-all",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-md ring-2 ring-primary/40"
                      : "bg-secondary text-foreground hover:bg-secondary/80 border border-border",
                  )}
                >
                  {isActive && <Check className="size-3.5 stroke-[3]" />}
                  {p.name}
                  <span className="text-[10px] opacity-80">({p.price})</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* GRID DE CARDS DOS 3 PLANOS */}
      <div className="grid gap-6 lg:grid-cols-3 items-stretch">
        {PLANS_DATA.map((plan) => {
          const isCurrentActive = currentPlan === plan.id;
          const isFeatured = plan.highlight;

          return (
            <div
              key={plan.id}
              className={cn(
                "relative flex flex-col justify-between rounded-2xl p-6 sm:p-7 transition-all duration-200 border bg-card",
                isFeatured
                  ? "border-primary/80 shadow-2xl ring-2 ring-primary/30 lg:-translate-y-1.5 bg-gradient-to-b from-primary/10 via-card to-card"
                  : "border-border shadow-sm hover:border-border/90",
                isCurrentActive && "ring-2 ring-emerald-500/80 border-emerald-500/50",
              )}
            >
              {/* Badge "MAIS ESCOLHIDO" no Performance */}
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[11px] font-black tracking-wider text-primary-foreground uppercase shadow-md flex items-center gap-1.5">
                  <Crown className="size-3" />
                  {plan.badge}
                </div>
              )}

              {/* Tag de Plano Ativo na Demonstração */}
              {isCurrentActive && (
                <div className="mb-4 inline-flex items-center gap-1.5 rounded-md border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-1 text-[11px] font-bold text-emerald-400">
                  <BadgeCheck className="size-3.5 shrink-0" />
                  Plano ativo na demonstração
                </div>
              )}

              <div>
                {/* Cabeçalho do Card */}
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground leading-snug">
                      {plan.headline}
                    </p>
                  </div>
                  <div
                    className={cn(
                      "flex size-10 items-center justify-center rounded-xl",
                      isFeatured
                        ? "bg-primary/20 text-primary"
                        : "bg-secondary text-muted-foreground",
                    )}
                  >
                    {plan.id === "essencial" && <Layers className="size-5" />}
                    {plan.id === "performance" && <Zap className="size-5" />}
                    {plan.id === "enterprise" && <Trophy className="size-5" />}
                  </div>
                </div>

                {/* Preço */}
                <div className="mt-5 pb-5 border-b border-border/60">
                  {plan.priceNote && (
                    <span className="text-xs font-semibold text-muted-foreground block mb-0.5">
                      {plan.priceNote}
                    </span>
                  )}
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                      {plan.price}
                    </span>
                    <span className="text-sm font-medium text-muted-foreground">{plan.period}</span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                    {plan.description}
                  </p>
                </div>

                {/* Lista de Recursos Obrigatórios */}
                <div className="mt-5 space-y-2.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    O que está incluso:
                  </div>
                  <ul className="space-y-2">
                    {plan.features.map((feature, i) => {
                      const isEverythingFromPrevious =
                        feature.startsWith("Tudo do Essencial") ||
                        feature.startsWith("Tudo do Performance");

                      return (
                        <li key={i} className="flex items-center gap-2.5 text-xs sm:text-sm text-foreground/90">
                          <div
                            className={cn(
                              "flex size-4 items-center justify-center rounded-full shrink-0",
                              isEverythingFromPrevious
                                ? "bg-primary text-primary-foreground"
                                : "bg-emerald-500/20 text-emerald-400",
                            )}
                          >
                            <Check className="size-2.5 stroke-[3]" />
                          </div>
                          <span
                            className={cn(
                              isEverythingFromPrevious ? "font-bold text-primary" : "font-medium",
                            )}
                          >
                            {feature}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>

              {/* Botões de Ação */}
              <div className="mt-8 space-y-2.5 pt-4 border-t border-border/40">
                <Button
                  className={cn(
                    "w-full font-bold gap-2 text-sm h-11",
                    isFeatured
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-md"
                      : "",
                  )}
                  variant={isFeatured ? "default" : "outline"}
                  onClick={() => handleStartContract(plan)}
                >
                  <Sparkles className="size-4" />
                  Escolher plano
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "w-full text-xs font-semibold gap-1.5",
                    isCurrentActive
                      ? "text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/15"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                  onClick={() => setCurrentPlan(plan.id)}
                >
                  <RefreshCw className="size-3.5" />
                  {isCurrentActive ? "Plano ativo na demonstração" : `Demonstrar plano ${plan.name}`}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* SEÇÃO DE SIMULAÇÃO DE ACESSO AOS RECURSOS (REQUISITO 7) */}
      <div className="panel p-6 sm:p-8 space-y-6">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between border-b border-border/60 pb-5">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-primary">
              Simulação Visual de Acesso aos Recursos
            </div>
            <h2 className="text-xl font-bold text-foreground sm:text-2xl mt-1">
              Como o cliente visualiza a plataforma no plano {activePlanConfig.name.toUpperCase()}
            </h2>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Veja em tempo real os recursos liberados ou bloqueados conforme o plano atualmente demonstrado.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-secondary/80 p-1.5 border border-border">
            <span className="text-xs font-semibold px-2 text-muted-foreground">Trocar demo:</span>
            {PLANS_DATA.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setCurrentPlan(p.id)}
                className={cn(
                  "rounded-md px-2.5 py-1 text-xs font-bold transition-colors",
                  currentPlan === p.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-background/50",
                )}
              >
                {p.name}
              </button>
            ))}
          </div>
        </div>

        {/* Grade de Recursos com Status de Acesso */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Essencial 1 */}
          <FeatureAccessCard
            title="Visão Geral & Oportunidades"
            description="Fila de atendimento de novos contatos e kanban de oportunidades."
            planRequired="essencial"
            currentPlan={currentPlan}
          />

          {/* Essencial 2 */}
          <FeatureAccessCard
            title="Qualificação & Vyntra Score"
            description="Algoritmo de pontuação e perguntas rápidas em 4 cliques."
            planRequired="essencial"
            currentPlan={currentPlan}
          />

          {/* Essencial 3 */}
          <FeatureAccessCard
            title="Follow-ups, Propostas & Anúncios"
            description="Agendamento comercial de retorno, propostas com simulação e campanhas de captação."
            planRequired="essencial"
            currentPlan={currentPlan}
          />

          {/* Performance 1 */}
          <FeatureAccessCard
            title="Distribuição Avançada"
            description="Regras dinâmicas por carga horária, especialidade do vendedor e taxa de fechamento."
            planRequired="performance"
            currentPlan={currentPlan}
          />

          {/* Performance 2 */}
          <FeatureAccessCard
            title="Insights Comerciais"
            description="Métricas de conversão, canais de captação mais rentáveis e diagnóstico da operação."
            planRequired="performance"
            currentPlan={currentPlan}
          />

          {/* Performance 3 */}
          <FeatureAccessCard
            title="Impacto Comercial & ROI"
            description="Simulador financeiro de receita incremental e projeção de faturamento."
            planRequired="performance"
            currentPlan={currentPlan}
          />

          {/* Performance 4 */}
          <FeatureAccessCard
            title="Gestão Avançada da Equipe"
            description="Acompanhamento individual de cada vendedor, tempo de resposta e produtividade."
            planRequired="performance"
            currentPlan={currentPlan}
          />

          {/* Enterprise 1 */}
          <FeatureAccessCard
            title="Multiunidade & Integrações"
            description="Gestão unificada de matriz e filiais com webhooks de captação integrados."
            planRequired="enterprise"
            currentPlan={currentPlan}
          />

          {/* Enterprise 2 */}
          <FeatureAccessCard
            title="Permissões, Auditoria & Configurações"
            description="Níveis hierárquicos de acesso, logs detalhados e suporte executivo prioritário."
            planRequired="enterprise"
            currentPlan={currentPlan}
          />
        </div>
      </div>

      {/* FAQ / DÚVIDAS COMERCIAIS */}
      <div className="panel p-6 sm:p-8 space-y-4">
        <h3 className="text-lg font-bold text-foreground">Dúvidas Frequentes sobre os Planos Vyntra</h3>
        <div className="grid gap-4 sm:grid-cols-2 text-xs sm:text-sm text-muted-foreground">
          <div className="rounded-xl border border-border p-4 bg-secondary/30">
            <div className="font-semibold text-foreground mb-1">Há taxa de adesão ou fidelidade?</div>
            Não cobramos taxa de implantação nas campanhas atuais. Os planos são mensais e podem ser cancelados ou alterados a qualquer momento.
          </div>
          <div className="rounded-xl border border-border p-4 bg-secondary/30">
            <div className="font-semibold text-foreground mb-1">Posso migrar de plano depois?</div>
            Sim, a mudança entre Essencial, Performance e Enterprise é imediata e os dados dos seus leads permanecem 100% preservados.
          </div>
          <div className="rounded-xl border border-border p-4 bg-secondary/30">
            <div className="font-semibold text-foreground mb-1">Como funciona o modo demonstração?</div>
            O modo demonstração permite apresentar a clientes todas as funcionalidades de cada plano em reuniões comerciais, sem exigir pagamentos reais.
          </div>
          <div className="rounded-xl border border-border p-4 bg-secondary/30">
            <div className="font-semibold text-foreground mb-1">O suporte inclui treinamento da equipe?</div>
            Sim, a partir do plano Performance sua equipe de vendas recebe onboarding direcionado para acelerar o fechamento de propostas.
          </div>
        </div>
      </div>

      {/* MODAL 1: ESCOLHER PLANO (PRÉ-CONTRATAÇÃO - REQUISITO 8) */}
      {checkoutStep === "initial" && selectedPlanForContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-border bg-card p-6 sm:p-7 shadow-2xl space-y-6">
            <button
              type="button"
              onClick={() => {
                setCheckoutStep(null);
                setSelectedPlanForContract(null);
              }}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <X className="size-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                <Sparkles className="size-3.5" />
                Simulação de Contratação
              </div>
              <h3 className="mt-2 text-xl font-bold text-foreground">
                Você escolheu o plano {selectedPlanForContract.name}
              </h3>
              <p className="mt-1 text-xs text-muted-foreground">
                Revise os detalhes da assinatura antes de prosseguir para o checkout simulado.
              </p>
            </div>

            <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-semibold text-foreground">Investimento mensal:</span>
                <span className="text-2xl font-black text-primary">
                  {selectedPlanForContract.price}
                  <span className="text-xs font-normal text-muted-foreground">/mês</span>
                </span>
              </div>
              <div className="text-xs text-muted-foreground flex items-center justify-between border-t border-border/50 pt-2">
                <span>Modalidade de cobrança:</span>
                <span className="font-semibold text-foreground">Assinatura mensal recorrente</span>
              </div>
              <div className="text-xs text-muted-foreground flex items-center justify-between">
                <span>Período de teste / Demonstração:</span>
                <span className="font-semibold text-emerald-400">Ativação instantânea</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Destaques inclusos neste plano:
              </div>
              <div className="grid gap-2 text-xs">
                {selectedPlanForContract.features.slice(0, 5).map((f, i) => (
                  <div key={i} className="flex items-center gap-2 text-foreground/90">
                    <CheckCircle2 className="size-4 text-emerald-400 shrink-0" />
                    <span>{f}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <Button
                variant="outline"
                className="w-full sm:w-1/3"
                onClick={() => {
                  setCheckoutStep(null);
                  setSelectedPlanForContract(null);
                }}
              >
                Cancelar
              </Button>
              <Button
                className="w-full sm:w-2/3 font-bold gap-2"
                onClick={handleProceedToCheckout}
              >
                Continuar
                <ChevronRight className="size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: CHECKOUT SIMULADO (REQUISITO 9) */}
      {checkoutStep === "checkout" && selectedPlanForContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md overflow-y-auto animate-in fade-in duration-200">
          <div className="relative w-full max-w-2xl rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-2xl space-y-6 my-8">
            <button
              type="button"
              onClick={() => {
                setCheckoutStep(null);
                setSelectedPlanForContract(null);
              }}
              className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-secondary hover:text-foreground"
            >
              <X className="size-5" />
            </button>

            {/* Cabeçalho do Checkout */}
            <div className="border-b border-border pb-4">
              <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                <ShieldCheck className="size-4 text-primary" />
                Checkout Comercial Seguro — Demonstração Vyntra
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mt-1">
                Finalizar Contratação do Plano {selectedPlanForContract.name}
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Preencha os dados abaixo para simular a ativação imediata do seu plano comercial.
              </p>
            </div>

            {/* Resumo do Pedido */}
            <div className="rounded-xl border border-border bg-secondary/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="text-xs text-muted-foreground uppercase font-semibold">
                  Plano Selecionado
                </div>
                <div className="text-base font-bold text-foreground flex items-center gap-2">
                  {selectedPlanForContract.name}
                  <span className="rounded bg-primary/20 text-primary text-[10px] px-2 py-0.5 font-bold">
                    Assinatura Mensal
                  </span>
                </div>
              </div>
              <div className="text-right sm:text-right">
                <div className="text-xs text-muted-foreground">Valor mensal</div>
                <div className="text-xl font-black text-foreground">
                  {selectedPlanForContract.price}
                  <span className="text-xs font-normal text-muted-foreground">/mês</span>
                </div>
              </div>
            </div>

            {/* Formulário Simulado */}
            <div className="space-y-4">
              <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Dados da Concessionária / Empresa
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label className="text-xs">Nome do Responsável</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">E-mail Comercial</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">WhatsApp / Telefone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">CNPJ da Empresa</Label>
                  <Input
                    value={formData.cnpj}
                    onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                    className="h-9 text-xs"
                  />
                </div>
              </div>

              {/* Forma de Pagamento Simulada */}
              <div className="pt-2">
                <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Forma de Pagamento Simulada
                </div>
                <div className="grid grid-cols-2 gap-3 mb-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition-all",
                      paymentMethod === "card"
                        ? "border-primary bg-primary/10 text-primary shadow-sm ring-1 ring-primary/40"
                        : "border-border bg-secondary/40 text-muted-foreground hover:bg-secondary",
                    )}
                  >
                    <CreditCard className="size-4" />
                    Cartão de Crédito
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("pix")}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-xl border p-3 text-xs font-bold transition-all",
                      paymentMethod === "pix"
                        ? "border-emerald-500 bg-emerald-500/10 text-emerald-400 shadow-sm ring-1 ring-emerald-500/40"
                        : "border-border bg-secondary/40 text-muted-foreground hover:bg-secondary",
                    )}
                  >
                    <QrCode className="size-4" />
                    Pix Instantâneo
                  </button>
                </div>

                {paymentMethod === "card" ? (
                  <div className="rounded-xl border border-border bg-secondary/20 p-4 space-y-3">
                    <div className="space-y-1">
                      <Label className="text-xs">Número do Cartão</Label>
                      <Input
                        value={formData.cardNumber}
                        onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                        className="h-9 text-xs font-mono"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Validade</Label>
                        <Input
                          value={formData.cardExp}
                          onChange={(e) => setFormData({ ...formData, cardExp: e.target.value })}
                          className="h-9 text-xs font-mono"
                        />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs">CVV</Label>
                        <Input
                          value={formData.cardCvv}
                          onChange={(e) => setFormData({ ...formData, cardCvv: e.target.value })}
                          className="h-9 text-xs font-mono"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-center space-y-2">
                    <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
                      <QrCode className="size-6" />
                    </div>
                    <div className="text-xs font-bold text-foreground">
                      Chave Pix Dinâmica Simulada
                    </div>
                    <p className="text-[11px] text-muted-foreground max-w-sm mx-auto">
                      Na contratação real, o QR Code de ativação é gerado com compensação automática em segundos.
                    </p>
                  </div>
                )}
              </div>

              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-3 text-[11px] text-amber-300 leading-relaxed">
                Ambiente de demonstração comercial Vyntra. Nenhum valor real será cobrado e nenhuma informação confidencial é armazenada.
              </div>
            </div>

            {/* Ações do Checkout */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-3 border-t border-border">
              <Button
                variant="ghost"
                className="w-full sm:w-1/3 text-xs"
                onClick={() => setCheckoutStep("initial")}
                disabled={isProcessing}
              >
                Voltar
              </Button>
              <Button
                className="w-full sm:w-2/3 font-bold gap-2 text-sm h-11"
                onClick={handleConfirmSubscription}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <>
                    <RefreshCw className="size-4 animate-spin" />
                    Processando assinatura...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="size-4" />
                    Confirmar assinatura ({selectedPlanForContract.price}/mês)
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ASSINATURA REALIZADA COM SUCESSO (REQUISITO 9 & 10) */}
      {checkoutStep === "success" && selectedPlanForContract && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg rounded-2xl border border-emerald-500/40 bg-card p-6 sm:p-8 shadow-2xl text-center space-y-6">
            <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-emerald-500/20 text-emerald-400 ring-8 ring-emerald-500/10">
              <Check className="size-8 stroke-[3]" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-black text-foreground">
                Assinatura realizada com sucesso
              </h2>
              <p className="text-sm font-semibold text-emerald-400">
                Seu plano Vyntra está pronto para uso.
              </p>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                A contratação simulada do plano{" "}
                <strong className="text-foreground">{selectedPlanForContract.name}</strong> foi concluída com êxito. Todos os recursos deste nível agora estão habilitados no seu ambiente.
              </p>
            </div>

            <div className="rounded-xl border border-border bg-secondary/50 p-4 text-left text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Plano Ativado:</span>
                <span className="font-bold text-foreground">{selectedPlanForContract.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Valor Mensal:</span>
                <span className="font-bold text-foreground">{selectedPlanForContract.price}/mês</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Protocolo de Ativação:</span>
                <span className="font-mono text-primary font-bold">
                  VYN-SUB-{Math.floor(10000 + Math.random() * 89999)}
                </span>
              </div>
            </div>

            <Button
              className="w-full font-bold text-sm h-11 bg-primary text-primary-foreground shadow-md hover:bg-primary/90"
              onClick={handleFinishAndReturn}
            >
              Voltar para a plataforma
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente auxiliar para visualização dos recursos por plano
function FeatureAccessCard({
  title,
  description,
  planRequired,
  currentPlan,
}: {
  title: string;
  description: string;
  planRequired: PlanTier;
  currentPlan: PlanTier;
}) {
  const planWeights: Record<PlanTier, number> = {
    essencial: 1,
    performance: 2,
    enterprise: 3,
  };

  const isUnlocked = planWeights[currentPlan] >= planWeights[planRequired];
  const requiredPlanName =
    planRequired === "performance"
      ? "Performance"
      : planRequired === "enterprise"
        ? "Enterprise"
        : "Essencial";

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-all duration-200 flex flex-col justify-between",
        isUnlocked
          ? "border-border/80 bg-card/60 shadow-xs"
          : "border-border/40 bg-secondary/20 opacity-75",
      )}
    >
      <div>
        <div className="flex items-start justify-between gap-2">
          <div className="font-semibold text-sm text-foreground">{title}</div>
          {isUnlocked ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
              <Check className="size-3 stroke-[3]" />
              Disponível
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 text-[10px] font-bold text-amber-400">
              <Lock className="size-3" />
              Plano {requiredPlanName}
            </span>
          )}
        </div>
        <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>

      {!isUnlocked && (
        <div className="mt-3 pt-2 border-t border-border/40 text-[11px] text-amber-400/90 font-medium flex items-center gap-1">
          <Lock className="size-3 shrink-0" />
          Disponível no plano {requiredPlanName}
        </div>
      )}
    </div>
  );
}
