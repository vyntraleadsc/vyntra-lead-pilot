import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  Bike,
  Bot,
  BriefcaseBusiness,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Coins,
  Eye,
  EyeOff,
  FileText,
  Flame,
  Gauge,
  KeyRound,
  LayoutDashboard,
  LayoutGrid,
  List,
  Lock,
  LogOut,
  Mail,
  Megaphone,
  Menu,
  MessageCircle,
  MoreHorizontal,
  Percent,
  Phone,
  Plus,
  RefreshCw,
  Route as RouteIcon,
  Search,
  Send,
  Settings,
  ShieldAlert,
  ShieldCheck,
  SlidersHorizontal,
  Snowflake,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  Trophy,
  UserCheck,
  UserPlus,
  UserRound,
  UsersRound,
  MapPin,
  Terminal,
  Webhook,
  X,
  Zap,
  Award,
  BadgeCheck,
  Calculator,
  Smartphone,
  Monitor,
} from "lucide-react";
import { IntegrationsPage, IntegrationLogsPage } from "./vyntra-integrations";
import { AdCampaignPage } from "./vyntra-ad-campaign";
import { PlansPage } from "./vyntra-plans";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Toaster } from "@/components/ui/sonner";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  DEMO_CREDENTIALS,
  DEMO_CREDENTIALS_GESTOR,
  DEMO_CREDENTIALS_VENDEDOR,
  DEALERSHIP,
  pickSellerByPerformance,
} from "@/lib/vyntra/mock-data";
import { useVyntra, VyntraProvider, type RoleView } from "@/lib/vyntra/store";
import {
  LAGES_REGION_CITIES,
  type CommercialRoute,
  type FollowUpBucket,
  type LeadState,
  type LeadStore,
  type Opportunity,
  type OpportunityFilters,
  type OpportunityStatus,
  type PlanTier,
  type PurchaseMethod,
} from "@/lib/vyntra/types";
import {
  BRL,
  STATUS_TONE,
  TEMPERATURE_META,
  bucketOf,
  computeScore,
  minutesSince,
  relativeTime,
  temperatureOf,
  timerLevel,
  waitingMinutes,
} from "@/lib/vyntra/utils";

type View =
  | "overview"
  | "opportunities"
  | "campaign"
  | "distribution"
  | "followups"
  | "proposals"
  | "team"
  | "insights"
  | "qualification"
  | "impact"
  | "plans"
  | "integrations"
  | "integration-logs"
  | "settings";

const NAV: Array<{ id: View; label: string; icon: typeof LayoutDashboard }> = [
  { id: "overview", label: "Visão geral", icon: LayoutDashboard },
  { id: "opportunities", label: "Oportunidades", icon: Target },
  { id: "followups", label: "Follow-ups", icon: CalendarClock },
  { id: "proposals", label: "Propostas", icon: FileText },
  { id: "qualification", label: "Qualificação", icon: Bot },
  { id: "campaign", label: "Campanhas no WhatsApp", icon: Megaphone },
  { id: "distribution", label: "Distribuição", icon: RouteIcon },
  { id: "insights", label: "Insights", icon: Sparkles },
  { id: "impact", label: "Impacto comercial", icon: CircleDollarSign },
  { id: "team", label: "Gestão de equipe", icon: UsersRound },
  { id: "plans", label: "Planos", icon: Trophy },
  { id: "integrations", label: "Integrações", icon: Webhook },
  { id: "integration-logs", label: "Logs de integração", icon: Terminal },
  { id: "settings", label: "Configurações", icon: Settings },
];

const FILTER_INITIAL: OpportunityFilters = {
  search: "",
  period: "30d",
  state: "all",
  store: "all",
  city: "all",
  sellerId: "all",
  product: "all",
  category: "all",
  method: "all",
  temperature: "all",
  status: "all",
};

function VyntraAppContent() {
  const { hydrated, authed } = useVyntra();

  useEffect(() => {
    if (!authed) return;
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const t = setTimeout(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 60);
    return () => clearTimeout(t);
  }, [authed]);

  if (!hydrated) return <div className="min-h-screen bg-background" />;
  return (
    <>
      {authed ? <Workspace /> : <Login />}
      <Toaster position="top-right" richColors />
    </>
  );
}

export function VyntraApp() {
  return (
    <VyntraProvider>
      <VyntraAppContent />
    </VyntraProvider>
  );
}

function Brand({
  compact = false,
  className,
  onClick,
}: {
  compact?: boolean | undefined;
  className?: string | undefined;
  onClick?: (() => void) | undefined;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={!onClick}
      title={onClick ? "Voltar ao Início" : undefined}
      aria-label={onClick ? "Voltar ao Início" : "VYNTRA"}
      className={cn(
        "inline-flex items-center text-left bg-transparent border-0 p-0 focus:outline-none",
        onClick && "cursor-pointer group transition-transform active:scale-95",
        !onClick && "cursor-default",
        className,
      )}
    >
      <img
        src="/logo.png"
        alt="VYNTRA"
        className={cn(
          "object-contain select-none transition-all duration-300 group-hover:scale-105 group-hover:brightness-110 filter drop-shadow-[0_0_12px_rgba(6,182,212,0.35)]",
          compact ? "h-6 w-auto" : "h-7 sm:h-8 w-auto",
        )}
      />
    </button>
  );
}

function Login() {
  const { login, loginAs, sellers } = useVyntra();
  const [authMode, setAuthMode] = useState<"login" | "forgot-password" | "first-access">("login");
  const [selectedRole, setSelectedRole] = useState<RoleView>("gestor");
  const [selectedSellerId, setSelectedSellerId] = useState("francine");
  const [email, setEmail] = useState(DEMO_CREDENTIALS_GESTOR.email);
  const [password, setPassword] = useState("123456");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotDone, setForgotDone] = useState(false);

  // First access state
  const [firstRole, setFirstRole] = useState<RoleView>("vendedor");
  const [firstSellerId, setFirstSellerId] = useState("francine");
  const [firstEmail, setFirstEmail] = useState("francine@vyntra.com");
  const [firstPass, setFirstPass] = useState("");
  const [firstPassConfirm, setFirstPassConfirm] = useState("");
  const [firstShowPass, setFirstShowPass] = useState(false);

  const handleRoleChange = (role: RoleView) => {
    setSelectedRole(role);
    setError("");
    if (role === "gestor") {
      setEmail("gestor@vyntra.com");
    } else {
      const s = sellers.find((x) => x.id === selectedSellerId) ?? sellers[0];
      setEmail(`${s?.id || "francine"}@vyntra.com`);
    }
  };

  const handleSellerChange = (sellerId: string) => {
    setSelectedSellerId(sellerId);
    setEmail(`${sellerId}@vyntra.com`);
    setError("");
  };

  const [welcomeUser, setWelcomeUser] = useState<{
    name: string;
    role: RoleView;
  } | null>(null);

  const triggerAnimatedLogin = (
    role: RoleView,
    sellerId?: string,
    explicitEmail?: string,
    explicitPass?: string,
  ) => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const name =
      role === "gestor"
        ? "Gestor"
        : sellers.find((s) => s.id === (sellerId || selectedSellerId))?.name || "Francine";
    setWelcomeUser({ name, role });
    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: "instant" });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      if (explicitEmail && explicitPass) {
        login(explicitEmail, explicitPass, role, sellerId);
      } else {
        loginAs(role, sellerId);
      }
    }, 1100);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validPassword = password === DEMO_CREDENTIALS.password || password === "123456";
    if (!validPassword) {
      setError("E-mail ou senha inválidos. Utilize a senha padrão 123456 para demonstração.");
      return;
    }
    setError("");
    triggerAnimatedLogin(selectedRole, selectedSellerId, email, password);
  };

  const handleForgotSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail || !forgotEmail.includes("@")) {
      toast.error("Informe um e-mail válido para recuperação.");
      return;
    }
    setForgotDone(true);
    toast.success("Instruções de recuperação despachadas com sucesso.");
  };

  const handleFirstAccessSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstEmail || !firstEmail.includes("@")) {
      toast.error("Informe um e-mail corporativo válido.");
      return;
    }
    if (firstPass.length < 6) {
      toast.error("A senha deve conter no mínimo 6 caracteres.");
      return;
    }
    if (firstPass !== firstPassConfirm) {
      toast.error("A confirmação de senha não confere.");
      return;
    }
    toast.success("Credencial corporativa ativada com sucesso. Acessando a plataforma...");
    triggerAnimatedLogin(
      firstRole,
      firstRole === "vendedor" ? firstSellerId : undefined,
      firstEmail,
      firstPass,
    );
  };

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr] bg-[#030712] text-foreground selection:bg-cyan-500/30">
      {/* Coluna Esquerda: Showcase & Branding Oficial */}
      <section className="relative hidden overflow-hidden border-r border-border/40 bg-gradient-to-br from-[#02040a] via-[#050914] to-[#0a1128] p-12 lg:flex lg:flex-col justify-between">
        {/* Glows de ambientação com a paleta original (Ciano Elétrico e Violeta) */}
        <div className="pointer-events-none absolute -left-28 -top-28 size-[460px] rounded-full bg-cyan-500/15 blur-[120px] login-glow" />
        <div
          className="pointer-events-none absolute -bottom-28 -right-28 size-[520px] rounded-full bg-violet-600/15 blur-[140px] login-glow"
          style={{ animationDelay: "-3.5s" }}
        />
        <div className="absolute inset-0 grid-noise opacity-35" />

        {/* Topo: Logo Oficial Sem Fundo em Alta Resolução */}
        <div className="relative z-10">
          <img
            src="/logo.png"
            alt="VYNTRA Logo Sem Fundo"
            className="h-11 w-auto object-contain select-none login-float filter drop-shadow-[0_0_25px_rgba(6,182,212,0.45)]"
          />
        </div>

        {/* Centro: Título e Proposta de Valor */}
        <div className="relative z-10 my-auto max-w-xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-500/35 bg-cyan-500/10 px-3.5 py-1.5 text-[11px] font-bold tracking-wider text-cyan-300 backdrop-blur-sm shadow-[0_0_25px_rgba(6,182,212,0.2)]">
            <Sparkles className="size-3.5 text-cyan-300" />
            MOTOR DE INTELIGÊNCIA COMERCIAL AUTOMOTIVA
          </div>
          <h1 className="text-5xl font-semibold leading-[1.08] text-foreground tracking-tight">
            Da oportunidade ao fechamento,{" "}
            <span className="bg-gradient-to-r from-cyan-400 via-sky-300 to-violet-400 bg-clip-text text-transparent">
              sem perder o timing.
            </span>
          </h1>
          <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground font-normal">
            Qualificação preditiva com score de compra, SLA de primeiro contato em até 5 minutos e
            direcionamento otimizado para a rede de concessionárias em RS e SC.
          </p>

          <div className="mt-10 grid grid-cols-3 gap-3">
            {[
              ["QUALIFICAR", "Score de 0 a 100 e intenção real"],
              ["SLA ÁGIL", "Resposta rápida em até 5 min"],
              ["ROTA IDEAL", "0 km, seminova ou consórcio"],
            ].map(([a, b]) => (
              <div
                key={a}
                className="rounded-xl border border-cyan-500/20 bg-[#080e22]/50 p-3.5 backdrop-blur-sm transition-all hover:border-cyan-400/40 hover:bg-[#0a122e]/70"
              >
                <div className="text-[11px] font-bold text-cyan-300 tracking-wide">{a}</div>
                <div className="mt-1 text-xs text-muted-foreground leading-snug">{b}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Rodapé: Concessionárias e Status */}
        <div className="relative z-10 flex items-center justify-between border-t border-border/40 pt-4 text-xs text-muted-foreground">
          <span className="font-medium">VYNTRA · Unidades Lages, Três Passos e Santa Rosa</span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="size-2 rounded-full bg-emerald-400 animate-pulse" />
            Ambiente operacional ativo
          </span>
        </div>
      </section>

      {/* Coluna Direita: Formulários Interativos com Efeitos de Entrada */}
      <section className="relative flex items-center justify-center bg-gradient-to-b from-[#030611] to-[#060b1b] px-5 py-12 overflow-y-auto custom-scrollbar">
        {/* Glow sutil no mobile e desktop */}
        <div className="pointer-events-none absolute top-0 right-0 size-80 rounded-full bg-cyan-500/10 blur-[100px]" />
        <div className="pointer-events-none absolute bottom-0 left-0 size-80 rounded-full bg-violet-600/10 blur-[100px]" />

        <div className="relative z-10 w-full max-w-md my-auto">
          {/* Logo no Mobile */}
          <div className="mb-8 flex items-center justify-center lg:hidden login-enter-1">
            <img
              src="/logo.png"
              alt="VYNTRA"
              className="h-10 w-auto object-contain filter drop-shadow-[0_0_20px_rgba(6,182,212,0.4)]"
            />
          </div>

          {/* VISTA 1: LOGIN PRINCIPAL */}
          {authMode === "login" && (
            <div>
              {/* Header do Login */}
              <div className="mb-6 login-enter-1">
                <div className="mb-2 inline-flex items-center gap-2 text-xs font-semibold text-cyan-400">
                  <span className="size-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                  ACESSO À PLATAFORMA
                </div>
                <h2 className="text-2xl font-semibold sm:text-3xl text-foreground">
                  Selecione seu perfil
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Acesso com permissões dedicadas para cada função comercial.
                </p>
              </div>

              {/* Seletor de Perfil Gestor vs Vendedor */}
              <div className="mb-5 grid grid-cols-2 gap-1.5 rounded-xl border border-cyan-500/20 bg-[#060b1c]/80 p-1.5 backdrop-blur-sm login-enter-2 shadow-inner">
                <button
                  type="button"
                  onClick={() => handleRoleChange("gestor")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition-all duration-300",
                    selectedRole === "gestor"
                      ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_20px_rgba(6,182,212,0.4)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5",
                  )}
                >
                  <ShieldCheck className="size-4" />
                  Acesso Gestor
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleChange("vendedor")}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-semibold transition-all duration-300",
                    selectedRole === "vendedor"
                      ? "bg-gradient-to-r from-blue-600 to-violet-600 text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/5",
                  )}
                >
                  <UserRound className="size-4" />
                  Acesso Vendedor
                </button>
              </div>

              {/* Card Informativo do Perfil Selecionado */}
              <div className="mb-5 rounded-xl border border-cyan-500/20 bg-[#070e24]/70 p-3.5 text-xs leading-relaxed text-muted-foreground backdrop-blur-sm login-enter-2">
                {selectedRole === "gestor" ? (
                  <>
                    <div className="flex items-center gap-2 font-semibold text-cyan-300 mb-1">
                      <ShieldCheck className="size-3.5" />
                      Visão Gerencial e Supervisão:
                    </div>
                    Controle consolidado das unidades (Lages, Três Passos e Santa Rosa), funil
                    geral, regras de distribuição e desempenho da equipe.
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-2 font-semibold text-violet-300 mb-1">
                      <UserRound className="size-3.5" />
                      Painel do Consultor Comercial:
                    </div>
                    Fila de ação em tempo real com SLA de resposta, leads individuais, propostas e
                    follow-ups exclusivos.
                  </>
                )}
              </div>

              {/* Formulário de Login */}
              <form className="space-y-4" onSubmit={handleSubmit}>
                {selectedRole === "vendedor" && (
                  <label className="block text-sm font-medium login-enter-3">
                    <span className="text-muted-foreground">Consultor responsável</span>
                    <Select value={selectedSellerId} onValueChange={handleSellerChange}>
                      <SelectTrigger className="mt-1.5 h-11 border-cyan-500/25 bg-[#070d20] focus:border-cyan-400 focus:ring-cyan-500/20">
                        <SelectValue placeholder="Selecione o consultor" />
                      </SelectTrigger>
                      <SelectContent className="border-cyan-500/30 bg-[#080f26]">
                        {sellers.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </label>
                )}

                <div className="login-enter-3">
                  <label className="block text-sm font-medium">
                    <span className="text-muted-foreground">E-mail corporativo</span>
                    <div className="relative mt-1.5">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        className="h-11 border-cyan-500/25 bg-[#070d20] pl-10 focus:border-cyan-400 focus:ring-cyan-500/20"
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          setError("");
                        }}
                      />
                    </div>
                  </label>
                </div>

                <div className="login-enter-4">
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span className="text-muted-foreground">Senha</span>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(email);
                        setForgotDone(false);
                        setAuthMode("forgot-password");
                      }}
                      className="text-xs text-cyan-400 hover:text-cyan-300 hover:underline transition-colors"
                    >
                      Esqueci minha senha
                    </button>
                  </div>
                  <div className="relative mt-1.5">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                    <Input
                      className="h-11 border-cyan-500/25 bg-[#070d20] pl-10 pr-11 focus:border-cyan-400 focus:ring-cyan-500/20"
                      type={show ? "text" : "password"}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        setError("");
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 text-muted-foreground hover:text-foreground"
                      onClick={() => setShow(!show)}
                      aria-label={show ? "Ocultar senha" : "Mostrar senha"}
                    >
                      {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </Button>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm login-enter-4">
                  <label className="flex cursor-pointer items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
                    <input
                      type="checkbox"
                      checked={remember}
                      onChange={(e) => setRemember(e.target.checked)}
                      className="size-4 rounded accent-cyan-500"
                    />
                    Lembrar de mim neste dispositivo
                  </label>
                </div>

                {error && (
                  <div className="rounded-lg border border-destructive/40 bg-destructive/15 px-3.5 py-2.5 text-sm text-destructive font-medium animate-shake">
                    {error}
                  </div>
                )}

                <Button
                  className="h-11 w-full font-semibold bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 text-white shadow-[0_0_25px_rgba(6,182,212,0.35)] hover:shadow-[0_0_35px_rgba(6,182,212,0.5)] transition-all duration-300 login-enter-5"
                  type="submit"
                >
                  Entrar como {selectedRole === "gestor" ? "Gestor" : "Vendedor"}
                  <ArrowRight className="size-4 ml-1.5" />
                </Button>

                <div className="pt-2 text-center login-enter-5">
                  <button
                    type="button"
                    onClick={() => {
                      setFirstEmail(email);
                      setFirstRole(selectedRole);
                      setAuthMode("first-access");
                    }}
                    className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-cyan-400 transition-colors"
                  >
                    <UserPlus className="size-3.5 text-cyan-400" />
                    Primeiro acesso? <strong className="font-semibold text-cyan-400">Ative sua conta corporativa</strong>
                  </button>
                </div>
              </form>

              {/* Seção de Acesso Rápido para Demonstração */}
              <div className="mt-7 space-y-2.5 login-enter-6">
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  <span>Acesso Rápido de Demonstração</span>
                  <span className="text-[10px] text-cyan-400 font-semibold">1-Clique</span>
                </div>
                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => triggerAnimatedLogin("gestor")}
                    className="flex flex-col items-start gap-1 rounded-xl border border-cyan-500/30 bg-[#071026]/70 p-3 text-left transition-all hover:bg-cyan-500/10 hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.25)]"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                      <ShieldCheck className="size-3.5" />
                      Entrar como Gestor
                    </div>
                    <div className="text-[11px] text-foreground font-medium">gestor@vyntra.com</div>
                    <div className="text-[10px] text-muted-foreground">Gestor · Lojas RS/SC</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => triggerAnimatedLogin("vendedor", "francine")}
                    className="flex flex-col items-start gap-1 rounded-xl border border-violet-500/30 bg-[#0d0a26]/70 p-3 text-left transition-all hover:bg-violet-500/10 hover:border-violet-400/60 hover:shadow-[0_0_20px_rgba(139,92,246,0.25)]"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-violet-400">
                      <UserRound className="size-3.5" />
                      Entrar como Vendedor
                    </div>
                    <div className="text-[11px] text-foreground font-medium">francine@vyntra.com</div>
                    <div className="text-[10px] text-muted-foreground">Fila de ação e consultora</div>
                  </button>
                </div>
              </div>

              {/* Rodapé de Segurança */}
              <div className="mt-8 flex items-center justify-center gap-2 text-[11px] text-muted-foreground login-enter-6">
                <span className="size-1.5 rounded-full bg-cyan-400" />
                <span>Autenticação criptografada TLS 1.3 · Rede Concessionárias</span>
              </div>
            </div>
          )}

          {/* VISTA 2: ESQUECI MINHA SENHA */}
          {authMode === "forgot-password" && (
            <div className="login-enter-1">
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-cyan-400 transition-colors"
              >
                <ArrowLeft className="size-4" /> Voltar para o login
              </button>

              <div className="mb-6">
                <div className="mb-3 grid size-12 place-items-center rounded-xl border border-cyan-500/30 bg-cyan-500/10 text-cyan-400 shadow-[0_0_25px_rgba(6,182,212,0.3)]">
                  <KeyRound className="size-6" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
                  Recuperar senha
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Informe o e-mail corporativo cadastrado na concessionária para redefinir sua credencial.
                </p>
              </div>

              {!forgotDone ? (
                <form className="space-y-4" onSubmit={handleForgotSubmit}>
                  <label className="block text-sm font-medium">
                    <span className="text-muted-foreground">E-mail corporativo</span>
                    <div className="relative mt-1.5">
                      <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <Input
                        className="h-11 border-cyan-500/25 bg-[#070d20] pl-10 focus:border-cyan-400 focus:ring-cyan-500/20"
                        type="email"
                        placeholder="seu.nome@vyntra.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        required
                      />
                    </div>
                  </label>

                  <Button
                    className="h-11 w-full font-semibold bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-[0_0_25px_rgba(6,182,212,0.3)] hover:shadow-[0_0_35px_rgba(6,182,212,0.5)]"
                    type="submit"
                  >
                    Enviar link de recuperação
                    <ArrowRight className="size-4 ml-1.5" />
                  </Button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-xs leading-relaxed text-emerald-300">
                    <div className="flex items-center gap-2 font-semibold text-emerald-400 mb-1">
                      <CheckCircle2 className="size-4" />
                      Instruções despachadas com sucesso!
                    </div>
                    Um token de verificação e instruções foram enviados para{" "}
                    <strong>{forgotEmail}</strong>. No ambiente de demonstração, sua senha padrão é{" "}
                    <span className="font-mono font-bold text-white">123456</span>.
                  </div>

                  <Button
                    className="h-11 w-full font-semibold bg-cyan-600 text-white hover:bg-cyan-500"
                    type="button"
                    onClick={() => {
                      setEmail(forgotEmail);
                      setPassword("123456");
                      setAuthMode("login");
                    }}
                  >
                    Voltar ao login com este e-mail
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* VISTA 3: PRIMEIRO ACESSO */}
          {authMode === "first-access" && (
            <div className="login-enter-1">
              <button
                type="button"
                onClick={() => setAuthMode("login")}
                className="mb-6 inline-flex items-center gap-2 text-xs font-semibold text-muted-foreground hover:text-cyan-400 transition-colors"
              >
                <ArrowLeft className="size-4" /> Voltar para o login
              </button>

              <div className="mb-6">
                <div className="mb-3 grid size-12 place-items-center rounded-xl border border-violet-500/30 bg-violet-500/10 text-violet-400 shadow-[0_0_25px_rgba(139,92,246,0.3)]">
                  <Sparkles className="size-6" />
                </div>
                <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
                  Primeiro acesso
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  Ative sua credencial corporativa na rede de concessionárias VYNTRA.
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleFirstAccessSubmit}>
                {/* Escolha do Perfil */}
                <div className="grid grid-cols-2 gap-1.5 rounded-xl border border-cyan-500/20 bg-[#060b1c] p-1">
                  <button
                    type="button"
                    onClick={() => {
                      setFirstRole("gestor");
                      setFirstEmail("gestor@vyntra.com");
                    }}
                    className={cn(
                      "py-2 text-xs font-semibold rounded-lg transition-all",
                      firstRole === "gestor"
                        ? "bg-cyan-500 text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    Gestor
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFirstRole("vendedor");
                      setFirstEmail(`${firstSellerId}@vyntra.com`);
                    }}
                    className={cn(
                      "py-2 text-xs font-semibold rounded-lg transition-all",
                      firstRole === "vendedor"
                        ? "bg-violet-600 text-white shadow-sm"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    Consultor
                  </button>
                </div>

                {firstRole === "vendedor" && (
                  <label className="block text-sm font-medium">
                    <span className="text-muted-foreground">Consultor associado</span>
                    <Select
                      value={firstSellerId}
                      onValueChange={(v) => {
                        setFirstSellerId(v);
                        setFirstEmail(`${v}@vyntra.com`);
                      }}
                    >
                      <SelectTrigger className="mt-1.5 h-11 border-cyan-500/25 bg-[#070d20]">
                        <SelectValue placeholder="Selecione o consultor" />
                      </SelectTrigger>
                      <SelectContent className="border-cyan-500/30 bg-[#080f26]">
                        {sellers.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </label>
                )}

                <label className="block text-sm font-medium">
                  <span className="text-muted-foreground">E-mail corporativo</span>
                  <Input
                    className="mt-1.5 h-11 border-cyan-500/25 bg-[#070d20]"
                    type="email"
                    value={firstEmail}
                    onChange={(e) => setFirstEmail(e.target.value)}
                    required
                  />
                </label>

                <label className="block text-sm font-medium">
                  <span className="text-muted-foreground">Criar nova senha (mínimo 6 dígitos)</span>
                  <div className="relative mt-1.5">
                    <Input
                      className="h-11 border-cyan-500/25 bg-[#070d20] pr-10"
                      type={firstShowPass ? "text" : "password"}
                      value={firstPass}
                      onChange={(e) => setFirstPass(e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1 text-muted-foreground"
                      onClick={() => setFirstShowPass(!firstShowPass)}
                    >
                      {firstShowPass ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </Button>
                  </div>
                </label>

                <label className="block text-sm font-medium">
                  <span className="text-muted-foreground">Confirmar nova senha</span>
                  <Input
                    className="mt-1.5 h-11 border-cyan-500/25 bg-[#070d20]"
                    type={firstShowPass ? "text" : "password"}
                    value={firstPassConfirm}
                    onChange={(e) => setFirstPassConfirm(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </label>

                <Button
                  className="h-11 w-full font-semibold bg-gradient-to-r from-violet-600 to-cyan-500 text-white shadow-[0_0_25px_rgba(139,92,246,0.35)]"
                  type="submit"
                >
                  Ativar conta e acessar agora
                  <ArrowRight className="size-4 ml-1.5" />
                </Button>
              </form>
            </div>
          )}
        </div>
      </section>

      {/* Overlay Animado de Login Efetivado */}
      {welcomeUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md welcome-overlay">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-cyan-500/50 bg-[#060e22]/95 p-8 text-center shadow-[0_0_60px_rgba(6,182,212,0.4)] welcome-card">
            {/* Efeitos de Glow */}
            <div className="pointer-events-none absolute -top-24 -left-24 size-48 rounded-full bg-cyan-500/25 blur-3xl" />
            <div className="pointer-events-none absolute -bottom-24 -right-24 size-48 rounded-full bg-violet-600/25 blur-3xl" />

            {/* Ícone com pulso e anel de energia */}
            <div className="relative mx-auto mb-5 grid size-16 place-items-center rounded-2xl border border-cyan-400/50 bg-gradient-to-br from-cyan-500/30 to-blue-600/20 shadow-[0_0_35px_rgba(6,182,212,0.35)]">
              <div className="absolute inset-0 rounded-2xl border border-cyan-400/60 welcome-ring" />
              {welcomeUser.role === "gestor" ? (
                <ShieldCheck className="size-8 text-cyan-300 animate-pulse" />
              ) : (
                <UserRound className="size-8 text-violet-400 animate-pulse" />
              )}
            </div>

            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/40 bg-cyan-500/15 px-3 py-1 text-xs font-semibold text-cyan-300 mb-3">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
              Login Efetivado com Sucesso
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white mb-2">
              Olá, {welcomeUser.name}!
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 mb-6 leading-relaxed">
              {welcomeUser.role === "gestor"
                ? "Acessando a Visão Geral do Gestor com métricas e inteligência em tempo real..."
                : "Acessando sua fila de atendimento personalizada e oportunidades quentes..."}
            </p>

            {/* Barra de progresso animada */}
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800/90 border border-slate-700/60">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-400 welcome-progress-bar" />
            </div>

            <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-muted-foreground">
              <span className="size-1.5 rounded-full bg-cyan-400" />
              <span>Conexão Segura TLS 1.3 · Rede Concessionárias</span>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}

function Workspace() {
  const {
    role,
    currentPlan = "performance",
    opportunities,
    followUps,
    now,
    currentSellerId,
    sellers,
    sellerById,
    setRole,
    setCurrentPlan,
    setCurrentSellerId,
    logout,
  } = useVyntra();
  const [view, setView] = useState<View>("overview");
  const [mobileNav, setMobileNav] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [globalSearch, setGlobalSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);

  // Versão ativa: "desktop" (PC) ou "mobile" (Celular)
  const [deviceMode, setDeviceMode] = useState<"desktop" | "mobile">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("vyntra_device_mode");
      if (saved === "desktop" || saved === "mobile") return saved;
      return window.innerWidth < 1024 ? "mobile" : "desktop";
    }
    return "desktop";
  });

  const setMode = (mode: "desktop" | "mobile") => {
    setDeviceMode(mode);
    try {
      localStorage.setItem("vyntra_device_mode", mode);
    } catch (_) {}
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  };

  // Contadores para os badges da navegação móvel
  const hotCount = useMemo(() => {
    return opportunities.filter((o) => {
      if (role === "vendedor" && currentSellerId && o.sellerId !== currentSellerId) return false;
      return o.score >= 75;
    }).length;
  }, [opportunities, role, currentSellerId]);

  const overdueCount = useMemo(() => {
    return followUps.filter((f) => {
      const opportunity = opportunities.find((item) => item.id === f.opportunityId);
      if (role === "vendedor" && currentSellerId && opportunity?.sellerId !== currentSellerId) return false;
      return !f.done && new Date(f.dueAt).getTime() < now;
    }).length;
  }, [followUps, opportunities, now, role, currentSellerId]);

  // Garante que a tela aberta pertença ao plano atualmente demonstrado
  useEffect(() => {
    if (role === "vendedor" && (view === "qualification" || view === "plans")) {
      setView("overview");
      return;
    }

    if (view === "plans") return;

    const allowedInEssencial: View[] = [
      "overview",
      "opportunities",
      "followups",
      "proposals",
      "plans",
    ];
    const allowedInPerformance: View[] = [
      ...allowedInEssencial,
      "qualification",
      "campaign",
      "distribution",
      "insights",
      "impact",
      "team",
    ];

    if (currentPlan === "essencial" && !allowedInEssencial.includes(view)) {
      setView("overview");
    } else if (currentPlan === "performance" && !allowedInPerformance.includes(view)) {
      setView("overview");
    }
  }, [currentPlan, view, role]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const t = setTimeout(() => {
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 50);
    return () => clearTimeout(t);
  }, [view]);

  const handleGoHome = () => {
    setView("overview");
    setSelected(null);
    setMobileNav(false);
    setSearchOpen(false);
    setAlertsOpen(false);
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  };

  // =========================================================================
  // 1. VERSÃO EXCLUSIVA PARA COMPUTADOR (PC / DESKTOP)
  // 100% autônoma, pura, sem alterações mobile interferindo na navegação de PC
  // =========================================================================
  if (deviceMode === "desktop") {
    return (
      <div className="min-h-screen bg-background">
        <DesktopSidebar
          view={view}
          setView={setView}
          onGoHome={handleGoHome}
        />
        <div className="pl-[244px]">
          <DesktopTopbar
            globalSearch={globalSearch}
            setGlobalSearch={setGlobalSearch}
            searchOpen={searchOpen}
            setSearchOpen={setSearchOpen}
            setSelected={setSelected}
            alertsOpen={alertsOpen}
            setAlertsOpen={setAlertsOpen}
            onGoHome={handleGoHome}
            setView={setView}
            onSwitchToMobile={() => setMode("mobile")}
          />
          <main className="mx-auto max-w-[1680px] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
            {role === "vendedor" ? (
              <SellerWorkspace view={view} setView={setView} setSelected={setSelected} />
            ) : (
              <ManagerView view={view} setView={setView} setSelected={setSelected} />
            )}
          </main>
        </div>
        <OpportunityDrawer id={selected} onClose={() => setSelected(null)} />
      </div>
    );
  }

  // =========================================================================
  // 2. VERSÃO EXCLUSIVA PARA CELULAR (MOBILE / SMARTPHONE)
  // 100% autônoma, com barra inferior, menu nativo gaveta e ergonomia de toque
  // =========================================================================
  return (
    <div className="min-h-screen bg-background pb-20">
      <MobileHeader
        onMenu={() => setMobileNav(true)}
        globalSearch={globalSearch}
        setGlobalSearch={setGlobalSearch}
        setSelected={setSelected}
        alertsOpen={alertsOpen}
        setAlertsOpen={setAlertsOpen}
        onGoHome={handleGoHome}
        onSwitchToDesktop={() => setMode("desktop")}
      />
      <main className="mx-auto max-w-lg px-3.5 py-4 pb-28">
        {role === "vendedor" ? (
          <SellerWorkspace view={view} setView={setView} setSelected={setSelected} />
        ) : (
          <ManagerView view={view} setView={setView} setSelected={setSelected} />
        )}
      </main>

      <MobileBottomNav
        view={view}
        setView={(v) => {
          setView(v);
          setMobileNav(false);
          window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
        }}
        onOpenMenu={() => setMobileNav(true)}
        role={role}
        hotCount={hotCount}
        overdueCount={overdueCount}
      />

      <MobileActionSheet
        open={mobileNav}
        onClose={() => setMobileNav(false)}
        view={view}
        setView={setView}
        role={role}
        setRole={setRole}
        currentPlan={currentPlan}
        setCurrentPlan={setCurrentPlan}
        currentSellerId={currentSellerId}
        setCurrentSellerId={setCurrentSellerId}
        sellers={sellers}
        sellerById={sellerById}
        logout={logout}
        onGoHome={handleGoHome}
        onSwitchToDesktop={() => {
          setMobileNav(false);
          setMode("desktop");
        }}
      />

      <OpportunityDrawer id={selected} onClose={() => setSelected(null)} />
    </div>
  );
}

function SellerWorkspace({
  view,
  setView,
  setSelected,
}: {
  view: View;
  setView: (v: View) => void;
  setSelected: (v: string | null) => void;
}) {
  if (view === "overview") return <SellerDashboard setSelected={setSelected} />;
  if (view === "opportunities") return <OpportunitiesPage setSelected={setSelected} />;
  if (view === "followups") return <FollowUps setSelected={setSelected} />;
  if (view === "proposals") return <Proposals setSelected={setSelected} />;

  return (
    <div className="panel mx-auto mt-12 max-w-lg p-8 text-center">
      <div className="mx-auto mb-4 grid size-12 place-items-center rounded-xl bg-destructive/10 text-destructive">
        <ShieldAlert className="size-6" />
      </div>
      <h2 className="text-xl font-semibold">Painel Restrito à Gerência</h2>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        Esta visão contém indicadores executivos e regras de distribuição da concessionária reservadas para o perfil de Gerência.
      </p>
      <div className="mt-6 flex justify-center gap-3">
        <Button onClick={() => setView("overview")}>
          Voltar para minha fila de atendimento
        </Button>
      </div>
    </div>
  );
}

function MobileBottomNav({
  view,
  setView,
  onOpenMenu,
  role,
  hotCount,
  overdueCount,
}: {
  view: View;
  setView: (v: View) => void;
  onOpenMenu: () => void;
  role: RoleView;
  hotCount: number;
  overdueCount: number;
}) {
  const tabs = useMemo(() => {
    if (role === "vendedor") {
      return [
        { id: "overview" as const, label: "Fila", icon: Zap, badge: null, badgeColor: "" },
        {
          id: "opportunities" as const,
          label: "Leads",
          icon: Target,
          badge: hotCount > 0 ? hotCount : null,
          badgeColor: "bg-amber-500 text-black",
        },
        {
          id: "followups" as const,
          label: "Follow-up",
          icon: CalendarClock,
          badge: overdueCount > 0 ? overdueCount : null,
          badgeColor: "bg-destructive text-destructive-foreground",
        },
        { id: "proposals" as const, label: "Propostas", icon: FileText, badge: null, badgeColor: "" },
        { id: "menu" as const, label: "Menu", icon: Menu, badge: null, badgeColor: "" },
      ];
    }
    return [
      { id: "overview" as const, label: "Início", icon: LayoutDashboard, badge: null, badgeColor: "" },
      {
        id: "opportunities" as const,
        label: "Leads",
        icon: Target,
        badge: hotCount > 0 ? hotCount : null,
        badgeColor: "bg-amber-500 text-black",
      },
      {
        id: "followups" as const,
        label: "Follow-up",
        icon: CalendarClock,
        badge: overdueCount > 0 ? overdueCount : null,
        badgeColor: "bg-destructive text-destructive-foreground",
      },
      { id: "proposals" as const, label: "Propostas", icon: FileText, badge: null, badgeColor: "" },
      { id: "menu" as const, label: "Mais", icon: Menu, badge: null, badgeColor: "" },
    ];
  }, [role, hotCount, overdueCount]);

  return (
    <nav
      aria-label="Navegação móvel"
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden border-t border-border/80 bg-background/95 backdrop-blur-2xl shadow-[0_-8px_30px_rgba(0,0,0,0.45)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      <div className="grid grid-cols-5 items-center h-[58px] px-1 max-w-md mx-auto">
        {tabs.map((tab) => {
          const isMenu = tab.id === "menu";
          const isActive = !isMenu && view === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                if (isMenu) {
                  onOpenMenu();
                } else {
                  setView(tab.id as View);
                }
              }}
              className={cn(
                "relative flex flex-col items-center justify-center h-full py-1 transition-all group focus:outline-none active:scale-95",
                isActive ? "text-cyan-400" : "text-muted-foreground/75 hover:text-foreground",
              )}
            >
              {/* Indicador sutil de aba ativa no topo */}
              {isActive && (
                <span className="absolute top-0 h-[2.5px] w-8 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.9)] animate-in fade-in duration-200" />
              )}

              <div className="relative">
                <Icon
                  className={cn(
                    "size-5 transition-transform duration-200",
                    isActive ? "scale-110 drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" : "group-hover:scale-105",
                  )}
                />
                {tab.badge !== null && tab.badge > 0 && (
                  <span
                    className={cn(
                      "absolute -top-1.5 -right-2.5 min-w-4 h-4 px-1 flex items-center justify-center rounded-full text-[9px] font-extrabold leading-none shadow-sm",
                      tab.badgeColor,
                    )}
                  >
                    {tab.badge > 99 ? "99+" : tab.badge}
                  </span>
                )}
              </div>

              <span
                className={cn(
                  "mt-1 text-[10px] tracking-tight leading-none transition-colors",
                  isActive ? "font-bold text-cyan-400" : "font-medium",
                )}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

function MobileActionSheet({
  open,
  onClose,
  view,
  setView,
  role,
  setRole,
  currentPlan,
  setCurrentPlan,
  currentSellerId,
  setCurrentSellerId,
  sellers,
  sellerById,
  logout,
  onGoHome,
  onSwitchToDesktop,
}: {
  open: boolean;
  onClose: () => void;
  view: View;
  setView: (v: View) => void;
  role: RoleView;
  setRole: (r: RoleView) => void;
  currentPlan: PlanTier;
  setCurrentPlan: (p: PlanTier) => void;
  currentSellerId?: string | undefined;
  setCurrentSellerId: (s: string) => void;
  sellers: Array<{ id: string; name: string; store?: string }>;
  sellerById: (id: string) => { id: string; name: string; store?: string } | undefined;
  logout: () => void;
  onGoHome?: () => void;
  onSwitchToDesktop?: () => void;
}) {
  if (!open) return null;

  const currentSeller = sellerById(currentSellerId || "francine") ?? sellers[0];

  const sections = useMemo(() => {
    if (role === "vendedor") {
      return [
        {
          title: "Operação Comercial",
          tag: "Vendedor",
          items: [
            { id: "overview" as View, label: "Fila de Atendimento", icon: Zap, desc: "SLA e novos leads em tempo real" },
            { id: "opportunities" as View, label: "Meus Leads", icon: Target, desc: "Oportunidades atribuídas" },
            { id: "followups" as View, label: "Meus Follow-ups", icon: CalendarClock, desc: "Compromissos e retornos" },
            { id: "proposals" as View, label: "Minhas Propostas", icon: FileText, desc: "Negociações e cotações ativas" },
          ],
        },
      ];
    }

    // Gestor comercial organizado por pilares executivos
    const operacao = [
      { id: "overview" as View, label: "Visão Geral", icon: LayoutDashboard, desc: "Painel executivo e SLAs da rede" },
      { id: "opportunities" as View, label: "Oportunidades", icon: Target, desc: "Funil completo e pipeline" },
      { id: "followups" as View, label: "Follow-ups", icon: CalendarClock, desc: "Acompanhamento diário" },
      { id: "proposals" as View, label: "Propostas Comerciais", icon: FileText, desc: "Propostas e fechamentos" },
    ];

    const inteligencia = [
      { id: "qualification" as View, label: "Qualificação com IA", icon: Bot, desc: "Agente inteligente e score preditivo" },
      { id: "campaign" as View, label: "Campanhas WhatsApp", icon: Megaphone, desc: "Disparos e reengajamento" },
      { id: "distribution" as View, label: "Distribuição de Leads", icon: RouteIcon, desc: "Regras por concessionária" },
      { id: "insights" as View, label: "Insights Preditivos", icon: Sparkles, desc: "Gargalos e oportunidades" },
      { id: "impact" as View, label: "Impacto Comercial", icon: CircleDollarSign, desc: "ROI e receita estimada" },
      { id: "team" as View, label: "Gestão de Equipe", icon: UsersRound, desc: "Ranking e conversão da equipe" },
    ].filter(() => currentPlan !== "essencial");

    const governanca = [
      { id: "integrations" as View, label: "Integrações", icon: Webhook, desc: "HubSpot, RD Station e WhatsApp" },
      { id: "integration-logs" as View, label: "Logs de Integração", icon: Terminal, desc: "Webhooks e auditoria de sync" },
      { id: "settings" as View, label: "Configurações", icon: Settings, desc: "Parâmetros operacionais" },
    ].filter(() => currentPlan === "enterprise");

    const planos = [
      { id: "plans" as View, label: "Planos & Assinatura", icon: Trophy, desc: "Comparativo comercial completo" },
    ];

    const result = [{ title: "Operação Diária", tag: "Essencial", items: operacao }];

    if (inteligencia.length > 0) {
      result.push({ title: "Inteligência & Escala", tag: "Performance", items: inteligencia });
    }
    if (governanca.length > 0) {
      result.push({ title: "Governança & Integrações", tag: "Enterprise", items: governanca });
    }
    result.push({ title: "Planos Comerciais", tag: "Comercial", items: planos });

    return result;
  }, [role, currentPlan]);

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex flex-col justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-background/85 backdrop-blur-md"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sheet Modal nativo de navegação móvel */}
      <div
        className="relative z-10 flex max-h-[88vh] w-full flex-col rounded-t-[28px] border-t border-border/80 bg-[#070d1e]/98 backdrop-blur-2xl shadow-[0_-20px_60px_rgba(0,0,0,0.85)] animate-in slide-in-from-bottom duration-300"
        style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      >
        {/* Handle de arraste superior */}
        <div className="mx-auto mt-3 h-1.5 w-12 rounded-full bg-muted-foreground/30" />

        {/* Topo do Menu Móvel */}
        <div className="flex items-center justify-between px-5 pt-2 pb-3 border-b border-border/60">
          <Brand
            compact
            onClick={() => {
              if (onGoHome) onGoHome();
              onClose();
            }}
          />
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-muted-foreground font-medium truncate max-w-[170px]">
              {DEALERSHIP}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="size-8 rounded-full bg-secondary/60 text-muted-foreground hover:text-foreground"
              onClick={onClose}
              aria-label="Fechar menu"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {/* Conteúdo com rolagem nativa */}
        <div className="flex-1 overflow-y-auto custom-scrollbar px-4 py-3 space-y-4">
          {/* Seletor rápido de plano demo para Gestor */}
          {role === "gestor" && (
            <div className="rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-3.5 shadow-sm">
              <div className="flex items-center justify-between mb-2.5">
                <span className="text-[11px] font-bold uppercase tracking-wider text-primary flex items-center gap-1.5">
                  <Trophy className="size-3.5 text-primary" />
                  Plano da Demonstração
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setView("plans");
                    onClose();
                  }}
                  className="text-[11px] font-bold text-primary hover:underline flex items-center gap-0.5"
                >
                  Comparar
                  <ChevronRight className="size-3" />
                </button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {(["essencial", "performance", "enterprise"] as const).map((p) => {
                  const active = currentPlan === p;
                  const price =
                    p === "essencial" ? "R$ 797" : p === "performance" ? "R$ 1.197" : "R$ 1.997";
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setCurrentPlan(p)}
                      className={cn(
                        "flex flex-col items-center justify-center rounded-xl py-2 px-1 text-center transition-all",
                        active
                          ? "bg-primary text-primary-foreground font-bold shadow-md ring-1 ring-primary"
                          : "bg-background/80 text-muted-foreground hover:bg-secondary hover:text-foreground border border-border/70",
                      )}
                    >
                      <span className="text-xs font-semibold capitalize">{p}</span>
                      <span className="text-[9px] opacity-80 mt-0.5 font-normal">{price}/mês</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Telas organizadas por categoria */}
          <div className="space-y-4">
            {sections.map((sec) => (
              <div key={sec.title} className="space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    {sec.title}
                  </span>
                  <span className="rounded px-1.5 py-0.2 text-[9px] font-semibold text-muted-foreground/80 bg-surface border border-border/60">
                    {sec.tag}
                  </span>
                </div>
                <div className="grid grid-cols-1 gap-1.5">
                  {sec.items.map((item) => {
                    const active = view === item.id;
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setView(item.id);
                          onClose();
                        }}
                        className={cn(
                          "flex items-center justify-between rounded-xl p-2.5 text-left transition-all border",
                          active
                            ? "bg-cyan-500/10 border-cyan-500/40 text-foreground font-semibold shadow-xs"
                            : "bg-surface/60 border-border/50 text-muted-foreground hover:bg-surface hover:text-foreground",
                        )}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={cn(
                              "grid size-8 shrink-0 place-items-center rounded-lg border transition-colors",
                              active
                                ? "bg-cyan-500/20 border-cyan-500/40 text-cyan-300"
                                : "bg-background/60 border-border/60 text-muted-foreground",
                            )}
                          >
                            <Icon className="size-4" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div
                              className={cn(
                                "text-xs font-medium leading-tight",
                                active && "text-cyan-300 font-bold",
                              )}
                            >
                              {item.label}
                            </div>
                            <div className="text-[10px] text-muted-foreground truncate mt-0.5">
                              {item.desc}
                            </div>
                          </div>
                        </div>
                        <ChevronRight
                          className={cn(
                            "size-3.5 shrink-0 text-muted-foreground/60",
                            active && "text-cyan-400",
                          )}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Troca de Perfil (Gestor <-> Vendedor) */}
          <div className="rounded-2xl border border-border bg-surface/70 p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Alternar Perfil
              </span>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                  role === "gestor"
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "bg-violet-500/20 text-violet-300 border border-violet-500/30",
                )}
              >
                {role === "gestor" ? "Gestor Comercial" : "Vendedor"}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-1 rounded-xl bg-background p-1 border border-border/50">
              <Button
                variant={role === "gestor" ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "h-8 text-xs font-semibold",
                  role === "gestor" &&
                    "bg-primary/20 text-primary hover:bg-primary/25 border border-primary/30",
                )}
                onClick={() => {
                  setRole("gestor");
                  setView("overview");
                }}
              >
                Gestor
              </Button>
              <Button
                variant={role === "vendedor" ? "secondary" : "ghost"}
                size="sm"
                className={cn(
                  "h-8 text-xs font-semibold",
                  role === "vendedor" &&
                    "bg-violet-500/20 text-violet-300 hover:bg-violet-500/25 border border-violet-500/30",
                )}
                onClick={() => {
                  setRole("vendedor");
                  setView("overview");
                }}
              >
                Vendedor
              </Button>
            </div>
            {role === "vendedor" && (
              <div className="pt-1">
                <label className="text-[10px] text-muted-foreground font-medium mb-1 block">
                  Consultor Simulado:
                </label>
                <Select
                  value={currentSellerId || "francine"}
                  onValueChange={(val) => setCurrentSellerId(val)}
                >
                  <SelectTrigger className="h-8 text-xs bg-background border-border">
                    <SelectValue placeholder="Escolher vendedor" />
                  </SelectTrigger>
                  <SelectContent className="z-[70]">
                    {sellers.map((s) => (
                      <SelectItem key={s.id} value={s.id} className="text-xs">
                        {s.name}{s.store ? ` (${s.store})` : ""}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          {/* Alternar para Versão de Computador (PC) */}
          {onSwitchToDesktop && (
            <button
              type="button"
              onClick={onSwitchToDesktop}
              className="flex w-full items-center justify-between rounded-xl p-3 border border-border/80 bg-surface/90 text-left hover:bg-surface text-muted-foreground hover:text-foreground transition-all cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="grid size-8 place-items-center rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  <Monitor className="size-4" />
                </div>
                <div>
                  <div className="text-xs font-bold text-foreground">Alternar para Versão PC</div>
                  <div className="text-[10px] text-muted-foreground">Visualizar layout executivo de computador</div>
                </div>
              </div>
              <ChevronRight className="size-4 text-muted-foreground" />
            </button>
          )}

          {/* Usuário e Logout */}
          <div className="flex items-center justify-between border-t border-border/80 pt-3 pb-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="grid size-9 shrink-0 place-items-center rounded-xl bg-primary/15 text-xs font-bold text-primary border border-primary/30">
                {role === "gestor"
                  ? "G"
                  : (currentSeller?.name || "VD")
                      .split(" ")
                      .map((x) => x[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-xs font-semibold">
                  {role === "gestor" ? "Gestor" : currentSeller?.name || "Consultor"}
                </div>
                <div className="truncate text-[10px] text-muted-foreground">
                  {role === "gestor" ? "gestor@vyntra.com" : `${currentSeller?.id || "francine"}@vyntra.com`}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                onClose();
                logout();
              }}
              className="text-destructive hover:bg-destructive/10 hover:text-destructive gap-1.5 text-xs font-semibold px-2.5 h-8"
            >
              <LogOut className="size-3.5" />
              <span>Sair</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DesktopSidebar({
  view,
  setView,
  onGoHome,
}: {
  view: View;
  setView: (v: View) => void;
  onGoHome?: (() => void) | undefined;
}) {
  const {
    logout,
    role,
    setRole,
    currentSellerId,
    setCurrentSellerId,
    sellers,
    sellerById,
    currentPlan = "performance",
    setCurrentPlan,
  } = useVyntra();
  const currentSeller = sellerById(currentSellerId || "francine") ?? sellers[0]!;

  const navItems = useMemo(() => {
    if (role === "vendedor") {
      return [
        { id: "overview" as View, label: "Fila de atendimento", icon: Zap },
        { id: "opportunities" as View, label: "Meus leads", icon: Target },
        { id: "followups" as View, label: "Meus follow-ups", icon: CalendarClock },
        { id: "proposals" as View, label: "Minhas propostas", icon: FileText },
      ];
    }

    return NAV.filter((item) => {
      if (item.id === "plans") return true;

      if (currentPlan === "essencial") {
        return (
          item.id === "overview" ||
          item.id === "opportunities" ||
          item.id === "followups" ||
          item.id === "proposals"
        );
      }

      if (currentPlan === "performance") {
        return (
          item.id === "overview" ||
          item.id === "opportunities" ||
          item.id === "followups" ||
          item.id === "proposals" ||
          item.id === "qualification" ||
          item.id === "campaign" ||
          item.id === "distribution" ||
          item.id === "insights" ||
          item.id === "impact" ||
          item.id === "team"
        );
      }

      return true;
    });
  }, [role, currentPlan]);

  const handleHomeNavigation = () => {
    if (onGoHome) {
      onGoHome();
    } else {
      setView("overview");
      window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
    }
  };

  const body = (
    <div className="flex h-full flex-col bg-sidebar px-3 py-4">
      <div className="shrink-0 px-3 pb-4">
        <Brand onClick={handleHomeNavigation} />
      </div>
      <ScrollArea className="flex-1 min-h-0 -mr-2 pr-2.5 custom-scrollbar">
        <div className="mb-2.5 px-3 flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          <span>{role === "gestor" ? "Gestão Comercial" : "Painel do Vendedor"}</span>
          {role === "gestor" && (
            <span
              className={cn(
                "rounded px-1.5 py-0.5 text-[9px] font-bold tracking-wider uppercase",
                currentPlan === "essencial"
                  ? "bg-secondary text-muted-foreground border border-border"
                  : currentPlan === "performance"
                    ? "bg-primary/20 text-primary border border-primary/30"
                    : "bg-amber-500/20 text-amber-300 border border-amber-500/30",
              )}
            >
              {currentPlan}
            </span>
          )}
        </div>
        <nav className="space-y-1 pb-4">
          {navItems.map((item) => {
            const I = item.icon;
            const active = view === item.id;
            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => setView(item.id)}
                className={cn(
                  "h-10 w-full justify-start px-3 text-muted-foreground",
                  active &&
                    "bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_2px_0_0_var(--primary)] font-medium",
                )}
              >
                <I className="size-[17px]" />
                {item.label}
              </Button>
            );
          })}
        </nav>
      </ScrollArea>
      <div className="shrink-0 mt-auto pt-3 space-y-3 border-t border-sidebar-border/60">
        {role === "gestor" && (
          <div className="rounded-lg border border-primary/30 bg-primary/5 p-2.5 space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-primary flex items-center gap-1">
                <Trophy className="size-3" />
                Plano Demo
              </span>
              <button
                type="button"
                onClick={() => setView("plans")}
                className="text-[10px] font-semibold text-primary hover:underline"
              >
                Ver todos
              </button>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-foreground capitalize">
                {currentPlan || "performance"}
              </span>
              <button
                type="button"
                onClick={() => {
                  const nextPlan: PlanTier =
                    currentPlan === "essencial"
                      ? "performance"
                      : currentPlan === "performance"
                        ? "enterprise"
                        : "essencial";
                  setCurrentPlan(nextPlan);
                }}
                className="text-[10px] font-bold text-primary bg-primary/15 hover:bg-primary/25 px-2 py-0.5 rounded transition-colors"
                title="Clique para alternar o plano da demonstração"
              >
                Alterar plano
              </button>
            </div>
          </div>
        )}

        <div className="rounded-lg border border-border bg-surface/60 p-2.5">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Alternar Perfil
            </span>
            <span
              className={cn(
                "rounded px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                role === "gestor"
                  ? "bg-primary/20 text-primary"
                  : "bg-[color:var(--violet)]/20 text-[color:var(--violet)]",
              )}
            >
              {role === "gestor" ? "Gestor" : "Vendedor"}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-1 rounded-md bg-background p-1">
            <Button
              variant={role === "gestor" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => {
                setRole("gestor");
                setView("overview");
              }}
            >
              Gestor
            </Button>
            <Button
              variant={role === "vendedor" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => {
                setRole("vendedor");
                setView("overview");
              }}
            >
              Vendedor
            </Button>
          </div>
          {role === "vendedor" && (
            <div className="mt-2">
              <Select
                value={currentSellerId || "francine"}
                onValueChange={(val) => setCurrentSellerId(val)}
              >
                <SelectTrigger className="h-7 text-xs bg-background">
                  <SelectValue placeholder="Escolher vendedor" />
                </SelectTrigger>
                <SelectContent>
                  {sellers.map((s) => (
                    <SelectItem key={s.id} value={s.id} className="text-xs">
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3 border-t border-border pt-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/15 text-sm font-bold text-primary">
            {role === "gestor"
              ? "G"
              : currentSeller.name
                  .split(" ")
                  .map((x) => x[0])
                  .join("")
                  .slice(0, 2)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">
              {role === "gestor" ? "Gestor" : currentSeller.name}
            </div>
            <div className="truncate text-[11px] text-muted-foreground">
              {role === "gestor" ? "gestor@vyntra.com" : `${currentSeller.id}@vyntra.com`}
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={logout} aria-label="Sair">
            <LogOut className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <aside className="fixed inset-y-0 left-0 z-40 w-[244px] border-r border-sidebar-border bg-sidebar">
      {body}
    </aside>
  );
}

function DesktopTopbar({
  globalSearch,
  setGlobalSearch,
  searchOpen,
  setSearchOpen,
  setSelected,
  alertsOpen,
  setAlertsOpen,
  onGoHome,
  setView,
  onSwitchToMobile,
}: {
  globalSearch: string;
  setGlobalSearch: (v: string) => void;
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
  setSelected: (v: string | null) => void;
  alertsOpen: boolean;
  setAlertsOpen: (v: boolean) => void;
  onGoHome?: (() => void) | undefined;
  setView?: (v: View) => void;
  onSwitchToMobile: () => void;
}) {
  const {
    opportunities,
    sellerById,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    role,
    currentSellerId,
    currentPlan = "performance",
    setCurrentPlan,
  } = useVyntra();
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);
  const currentSeller = sellerById(currentSellerId || "francine");
  const matches = useMemo(() => {
    const q = globalSearch.toLowerCase().trim();
    if (!q) return [];
    return opportunities
      .filter((o) =>
        `${o.customer.name} ${o.product} ${sellerById(o.sellerId)?.name}`.toLowerCase().includes(q),
      )
      .slice(0, 6);
  }, [globalSearch, opportunities, sellerById]);
  const unread = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/90 px-6 backdrop-blur-xl lg:px-8">
      <div className="relative flex-1 max-w-xl">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={globalSearch}
          onFocus={() => setSearchOpen(true)}
          onChange={(e) => {
            setGlobalSearch(e.target.value);
            setSearchOpen(true);
          }}
          placeholder="Buscar cliente, modelo ou vendedor..."
          className="h-9 border-transparent bg-surface pl-9 focus:border-input"
        />
        {searchOpen && globalSearch && (
          <div className="absolute left-0 right-0 top-11 z-50 overflow-hidden rounded-lg border border-border bg-popover shadow-2xl">
            {matches.length ? (
              matches.map((o) => (
                <button
                  key={o.id}
                  onClick={() => {
                    setSelected(o.id);
                    setSearchOpen(false);
                  }}
                  className="flex w-full items-center gap-3 border-b border-border px-3 py-3 text-left last:border-0 hover:bg-accent"
                >
                  <ScoreMini score={o.score} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{o.customer.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {o.product} · {sellerById(o.sellerId)?.name}
                    </div>
                  </div>
                  <ChevronRight className="size-4 text-muted-foreground" />
                </button>
              ))
            ) : (
              <div className="p-4 text-sm text-muted-foreground">Nenhum resultado encontrado.</div>
            )}
          </div>
        )}
      </div>

      {/* Botão de Alternar para Versão Celular */}
      <button
        type="button"
        onClick={onSwitchToMobile}
        className="flex items-center gap-1.5 rounded-full border border-cyan-500/35 bg-cyan-500/10 hover:bg-cyan-500/20 px-3 py-1.5 text-xs font-semibold text-cyan-300 transition-all shadow-xs cursor-pointer shrink-0"
        title="Alternar para a visualização dedicada para celular"
      >
        <Smartphone className="size-3.5 text-cyan-400" />
        <span>Versão Celular</span>
      </button>

      <div className="hidden items-center gap-2 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground xl:flex shrink-0">
        <Bike className="size-4 text-primary" />
        {DEALERSHIP}
      </div>

      {/* Seletor Rápido do Modo Demonstração & Plano Demonstrado (exclusivo para o gestor) */}
      {role === "gestor" && (
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setDemoMenuOpen(!demoMenuOpen)}
            className="flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold text-primary hover:bg-primary/15 transition-all shadow-xs"
          >
            <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-muted-foreground font-normal">Plano demonstrado:</span>
            <span className="font-bold uppercase text-foreground">{currentPlan}</span>
            <ChevronRight
              className={cn(
                "size-3 transition-transform text-muted-foreground",
                demoMenuOpen && "rotate-90",
              )}
            />
          </button>

          {demoMenuOpen && (
            <div className="absolute right-0 top-10 z-50 w-64 rounded-xl border border-border bg-popover p-3 shadow-2xl space-y-2 animate-in fade-in zoom-in-95 duration-150">
              <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground px-1">
                Alternar Plano da Demonstração
              </div>
              <div className="space-y-1">
                {(["essencial", "performance", "enterprise"] as const).map((p) => {
                  const isSelected = currentPlan === p;
                  const priceLabel =
                    p === "essencial" ? "R$ 797" : p === "performance" ? "R$ 1.197" : "R$ 1.997";
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => {
                        setCurrentPlan(p);
                        setDemoMenuOpen(false);
                      }}
                      className={cn(
                        "flex w-full items-center justify-between rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors",
                        isSelected
                          ? "bg-primary text-primary-foreground font-bold"
                          : "text-foreground hover:bg-secondary",
                      )}
                    >
                      <span className="capitalize">{p}</span>
                      <span className="text-[10px] opacity-80">{priceLabel}/mês</span>
                    </button>
                  );
                })}
              </div>
              <div className="border-t border-border/60 pt-2 px-1">
                <button
                  type="button"
                  onClick={() => {
                    if (setView) setView("plans");
                    setDemoMenuOpen(false);
                  }}
                  className="w-full text-left text-xs font-semibold text-primary hover:underline flex items-center justify-between"
                >
                  Ver comparação de planos
                  <ChevronRight className="size-3" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="relative shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setAlertsOpen(!alertsOpen)}
          aria-label="Notificações"
        >
          <Bell />
          {unread > 0 && (
            <span className="absolute right-1 top-1 grid size-4 place-items-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
              {unread}
            </span>
          )}
        </Button>
        {alertsOpen && (
          <div className="absolute right-0 top-12 w-[380px] rounded-xl border border-border bg-popover shadow-2xl">
            <div className="flex items-center justify-between border-b border-border p-4">
              <div>
                <h3 className="font-semibold">Central de alertas</h3>
                <p className="text-xs text-muted-foreground">{unread} não lidos</p>
              </div>
              <Button variant="ghost" size="sm" onClick={markAllNotificationsRead}>
                Marcar como lidos
              </Button>
            </div>
            <div className="max-h-[440px] overflow-y-auto custom-scrollbar p-2 pr-2.5 space-y-1">
              {notifications.map((n) => (
                <button
                  key={n.id}
                  className={cn(
                    "w-full rounded-lg p-3 text-left hover:bg-accent",
                    !n.read && "bg-primary/5",
                  )}
                  onClick={() => {
                    markNotificationRead(n.id);
                    if (n.opportunityId) setSelected(n.opportunityId);
                  }}
                >
                  <div className="flex gap-3">
                    <AlertIcon kind={n.kind} />
                    <div>
                      <div className="text-sm font-medium leading-5">{n.title}</div>
                      <div className="mt-1 text-xs leading-4 text-muted-foreground">
                        {n.description}
                      </div>
                      <div className="mt-2 text-[10px] text-muted-foreground">
                        {relativeTime(n.createdAt)}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="flex h-8 items-center gap-2 border-l border-border pl-3 shrink-0">
        <div className="grid size-8 place-items-center rounded-lg bg-primary/15 text-xs font-bold text-primary">
          {role === "gestor"
            ? "G"
            : (currentSeller?.name || "VD")
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
        </div>
        <div className="hidden xl:block">
          <div className="text-xs font-semibold">
            {role === "gestor" ? "Gestor" : currentSeller?.name || "Consultor"}
          </div>
          <div className="text-[10px] text-muted-foreground">
            {role === "gestor" ? "Gerência & Supervisão" : "Consultor Comercial"}
          </div>
        </div>
      </div>
    </header>
  );
}

function MobileHeader({
  onMenu,
  globalSearch,
  setGlobalSearch,
  setSelected,
  alertsOpen,
  setAlertsOpen,
  onGoHome,
  onSwitchToDesktop,
}: {
  onMenu: () => void;
  globalSearch: string;
  setGlobalSearch: (v: string) => void;
  setSelected: (v: string | null) => void;
  alertsOpen: boolean;
  setAlertsOpen: (v: boolean) => void;
  onGoHome?: (() => void) | undefined;
  onSwitchToDesktop: () => void;
}) {
  const {
    opportunities,
    sellerById,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    role,
    currentPlan = "performance",
  } = useVyntra();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const unread = notifications.filter((n) => !n.read).length;

  const matches = useMemo(() => {
    const q = globalSearch.toLowerCase().trim();
    if (!q) return [];
    return opportunities
      .filter((o) =>
        `${o.customer.name} ${o.product} ${sellerById(o.sellerId)?.name}`.toLowerCase().includes(q),
      )
      .slice(0, 6);
  }, [globalSearch, opportunities, sellerById]);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between gap-2 px-3.5">
        <div className="flex items-center gap-2 min-w-0">
          <Brand compact onClick={onGoHome} />
          <div className="flex items-center gap-1.5 overflow-hidden">
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                role === "gestor"
                  ? "bg-primary/20 text-primary border border-primary/30"
                  : "bg-violet-500/20 text-violet-300 border border-violet-500/30",
              )}
            >
              {role === "gestor" ? "Gestor" : "Consultor"}
            </span>
            {role === "gestor" && (
              <span className="truncate rounded-full bg-secondary/80 px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-muted-foreground border border-border">
                {currentPlan}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          {/* Botão de Alternar para Versão PC */}
          <button
            type="button"
            onClick={onSwitchToDesktop}
            className="flex items-center gap-1 rounded-full border border-border bg-secondary/80 hover:bg-secondary px-2.5 py-1 text-[10px] font-semibold text-muted-foreground hover:text-foreground transition-all cursor-pointer mr-0.5"
            title="Alternar para a versão de computador (PC)"
          >
            <Monitor className="size-3 text-cyan-400" />
            <span className="font-bold">PC</span>
          </button>

          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "size-8 text-muted-foreground",
              mobileSearchOpen && "text-primary bg-primary/10",
            )}
            onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
            aria-label="Buscar"
          >
            <Search className="size-4" />
          </Button>

          <div className="relative">
            <Button
              variant="ghost"
              size="icon"
              className="size-8 text-muted-foreground relative"
              onClick={() => setAlertsOpen(!alertsOpen)}
              aria-label="Notificações"
            >
              <Bell className="size-4" />
              {unread > 0 && (
                <span className="absolute right-1 top-1 grid size-3.5 place-items-center rounded-full bg-destructive text-[8px] font-bold text-destructive-foreground">
                  {unread}
                </span>
              )}
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="size-8 text-foreground"
            onClick={onMenu}
            aria-label="Menu"
          >
            <Menu className="size-5" />
          </Button>
        </div>
      </div>

      {mobileSearchOpen && (
        <div className="relative px-3.5 pb-3 border-t border-border/40 pt-2 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={globalSearch}
              autoFocus
              onChange={(e) => setGlobalSearch(e.target.value)}
              placeholder="Buscar cliente, modelo ou vendedor..."
              className="h-9 border-border bg-surface/90 pl-9 pr-8 text-xs focus:border-primary"
            />
            {globalSearch && (
              <button
                type="button"
                onClick={() => setGlobalSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
          {globalSearch.trim() && (
            <div className="mt-2 overflow-hidden rounded-xl border border-border bg-popover shadow-2xl divide-y divide-border/60">
              {matches.length ? (
                matches.map((o) => (
                  <button
                    key={o.id}
                    onClick={() => {
                      setSelected(o.id);
                      setMobileSearchOpen(false);
                    }}
                    className="flex w-full items-center gap-3 p-2.5 text-left active:bg-accent"
                  >
                    <ScoreMini score={o.score} />
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-semibold truncate">{o.customer.name}</div>
                      <div className="text-[10px] text-muted-foreground truncate">
                        {o.product} · {sellerById(o.sellerId)?.name}
                      </div>
                    </div>
                    <ChevronRight className="size-3.5 text-muted-foreground" />
                  </button>
                ))
              ) : (
                <div className="p-3 text-center text-xs text-muted-foreground">
                  Nenhuma oportunidade encontrada.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {alertsOpen && (
        <div className="fixed inset-x-3 top-16 z-50 rounded-2xl border border-border bg-popover p-3 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between border-b border-border pb-2.5 mb-2">
            <div>
              <h3 className="text-sm font-semibold">Central de Alertas</h3>
              <p className="text-[10px] text-muted-foreground">{unread} não lidos</p>
            </div>
            <div className="flex items-center gap-1.5">
              <Button
                variant="ghost"
                size="sm"
                className="h-7 text-xs px-2"
                onClick={markAllNotificationsRead}
              >
                Marcar lidos
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="size-7"
                onClick={() => setAlertsOpen(false)}
              >
                <X className="size-4" />
              </Button>
            </div>
          </div>
          <div className="max-h-[60vh] overflow-y-auto custom-scrollbar space-y-1.5 pr-1">
            {notifications.map((n) => (
              <button
                key={n.id}
                className={cn(
                  "w-full rounded-xl p-2.5 text-left transition-colors border border-border/40",
                  !n.read ? "bg-primary/10 border-primary/30" : "bg-surface/50",
                )}
                onClick={() => {
                  markNotificationRead(n.id);
                  if (n.opportunityId) setSelected(n.opportunityId);
                  setAlertsOpen(false);
                }}
              >
                <div className="flex gap-2.5">
                  <AlertIcon kind={n.kind} />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold leading-tight">{n.title}</div>
                    <div className="mt-1 text-[11px] leading-snug text-muted-foreground line-clamp-2">
                      {n.description}
                    </div>
                    <div className="mt-1.5 text-[9px] text-muted-foreground">
                      {relativeTime(n.createdAt)}
                    </div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}

function AlertIcon({ kind }: { kind: string }) {
  const I =
    kind === "hot"
      ? Flame
      : kind === "followup"
        ? Clock3
        : kind === "proposal"
          ? FileText
          : kind === "money"
            ? CircleDollarSign
            : UsersRound;
  return (
    <div className="grid size-8 shrink-0 place-items-center rounded-lg bg-secondary">
      <I className="size-4 text-primary" />
    </div>
  );
}

function ManagerView({
  view,
  setView,
  setSelected,
}: {
  view: View;
  setView: (v: View) => void;
  setSelected: (v: string | null) => void;
}) {
  if (view === "overview") return <Overview setSelected={setSelected} setView={setView} />;
  if (view === "opportunities") return <OpportunitiesPage setSelected={setSelected} setView={setView} />;
  if (view === "campaign") return <AdCampaignPage setView={setView} />;
  if (view === "distribution") return <Distribution setView={setView} />;
  if (view === "followups") return <FollowUps setSelected={setSelected} />;
  if (view === "proposals") return <Proposals setSelected={setSelected} />;
  if (view === "team") return <Team />;
  if (view === "insights") return <Insights setView={setView} setSelected={setSelected} />;
  if (view === "qualification") return <Qualification />;
  if (view === "impact") return <Impact />;
  if (view === "plans") return <PlansPage setView={setView} />;
  if (view === "integrations")
    return (
      <IntegrationsPage
        setSelected={setSelected}
        onNavigateLogs={() => setView("integration-logs")}
      />
    );
  if (view === "integration-logs")
    return (
      <IntegrationLogsPage
        setSelected={setSelected}
        onNavigateSettings={() => setView("integrations")}
      />
    );
  return <SettingsPage setView={setView} />;
}

function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-3 sm:flex-row sm:items-end">
      <div>
        <h1 className="text-2xl font-semibold sm:text-3xl">{title}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}

function Kpi({
  label,
  value,
  change,
  icon: I,
  danger = false,
}: {
  label: string;
  value: string;
  change?: string;
  icon: typeof Target;
  danger?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border p-4 transition-all duration-300 group",
        danger
          ? "border-rose-500/30 bg-gradient-to-b from-[#140a12]/80 to-[#0c0816]/90 hover:border-rose-500/60 hover:shadow-[0_0_25px_rgba(244,63,94,0.18)]"
          : "border-border/60 bg-gradient-to-b from-[#0b1328]/80 to-[#060c1c]/90 hover:border-cyan-500/50 hover:shadow-[0_0_25px_rgba(6,182,212,0.14)]",
      )}
    >
      <div className="flex items-start justify-between">
        <div className="text-[11px] font-medium text-muted-foreground line-clamp-1">{label}</div>
        <div
          className={cn(
            "grid size-7 place-items-center rounded-lg border transition-colors",
            danger
              ? "border-rose-500/30 bg-rose-500/10 text-rose-400 group-hover:bg-rose-500/20"
              : "border-cyan-500/20 bg-cyan-500/10 text-cyan-300 group-hover:bg-cyan-500/20",
          )}
        >
          <I className="size-3.5" />
        </div>
      </div>
      <div className="mt-2.5 text-2xl font-bold tracking-tight text-foreground">{value}</div>
      {change && (
        <div
          className={cn(
            "mt-1.5 flex items-center gap-1 text-[10.5px] font-medium",
            danger ? "text-rose-400" : "text-emerald-400",
          )}
        >
          {danger ? <TrendingDown className="size-3" /> : <TrendingUp className="size-3" />}
          <span>{change}</span>
        </div>
      )}
    </div>
  );
}

function Overview({
  setSelected,
  setView,
}: {
  setSelected: (v: string) => void;
  setView?: (v: View) => void;
}) {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  const { opportunities, followUps, now, currentPlan = "performance" } = useVyntra();
  const hot = opportunities.filter((o) => o.score >= 80);
  const critical = hot.filter((o) => {
    const m = waitingMinutes(o, now);
    return m !== null && m >= 10;
  });
  const overdue = followUps.filter((f) => !f.done && new Date(f.dueAt).getTime() < now);
  const recoverable = opportunities
    .filter((o) => !["Venda", "Perdida"].includes(o.status))
    .reduce((a, o) => a + o.potentialValue, 0);
  const stages = [
    { n: "Recebidas", v: 142, color: "from-cyan-500 to-blue-600" },
    { n: "Qualificadas", v: 87, color: "from-blue-500 to-indigo-600" },
    { n: "Atendimento", v: 61, color: "from-indigo-500 to-violet-600" },
    { n: "Propostas", v: 28, color: "from-violet-500 to-purple-600" },
    { n: "Negociação", v: 19, color: "from-purple-500 to-fuchsia-600" },
    { n: "Vendas", v: 11, color: "from-emerald-500 to-teal-500" },
  ];
  const temp = [
    { key: "muito_quente" as const, v: hot.length },
    {
      key: "potencial" as const,
      v: opportunities.filter((o) => o.score >= 60 && o.score < 80).length,
    },
    { key: "morno" as const, v: opportunities.filter((o) => o.score >= 40 && o.score < 60).length },
    { key: "baixo" as const, v: opportunities.filter((o) => o.score < 40).length },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Executivo de Boas-Vindas */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-[#061226]/95 via-[#0a1835]/75 to-[#040816]/95 p-5 sm:p-6 shadow-[0_0_40px_rgba(6,182,212,0.12)]">
        <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 size-72 rounded-full bg-violet-600/15 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4">
            <div className="relative grid size-14 shrink-0 place-items-center rounded-2xl border border-cyan-400/50 bg-gradient-to-br from-cyan-500/30 to-blue-600/25 text-xl font-bold text-cyan-300 shadow-[0_0_25px_rgba(6,182,212,0.3)]">
              G
              <span className="absolute -bottom-1 -right-1 size-3.5 rounded-full border-2 border-[#050b1a] bg-emerald-500" title="Gestor Online" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/40 bg-cyan-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-300">
                  <ShieldCheck className="size-3 text-cyan-400" />
                  Gerência Geral de Vendas
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
                  <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Operação em Tempo Real
                </span>
                <span className="hidden sm:inline-flex items-center rounded-full border border-slate-700/60 bg-slate-800/50 px-2.5 py-0.5 text-[11px] text-muted-foreground">
                  Via Passos Honda
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                Olá, Gestor!
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl">
                Central executiva de comando · Monitoramento consolidado das concessionárias em <strong className="text-cyan-300">Lages/SC</strong>, <strong className="text-cyan-300">Três Passos/RS</strong> e <strong className="text-cyan-300">Santa Rosa/RS</strong>.
              </p>
            </div>
          </div>

          {/* Ações Rápidas Executivas */}
          <div className="flex flex-wrap items-center gap-2 pt-3 lg:pt-0 border-t border-border/40 lg:border-t-0">
            {currentPlan !== "essencial" && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setView?.("impact")}
                  className="border-cyan-500/40 bg-cyan-950/30 text-xs font-semibold text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                >
                  <TrendingUp className="mr-1.5 size-3.5 text-cyan-400" />
                  Simulador de Impacto
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setView?.("distribution")}
                  className="border-violet-500/40 bg-violet-950/30 text-xs font-semibold text-violet-300 hover:bg-violet-500/20 hover:border-violet-400/60 shadow-[0_0_15px_rgba(139,92,246,0.15)]"
                >
                  <Sparkles className="mr-1.5 size-3.5 text-violet-400" />
                  Distribuição de Leads
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setView?.("campaign")}
                  className="border-emerald-500/40 bg-emerald-950/30 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/20 hover:border-emerald-400/60 shadow-[0_0_15px_rgba(16,185,129,0.15)]"
                >
                  <Megaphone className="mr-1.5 size-3.5 text-emerald-400" />
                  Campanhas no WhatsApp
                </Button>
              </>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setView?.("opportunities")}
              className="border-border/60 bg-surface-2/60 text-xs font-medium hover:bg-surface-2"
            >
              <Target className="mr-1.5 size-3.5 text-primary" />
              Ver Todas Oportunidades
            </Button>
          </div>
        </div>
      </div>

      {/* Alerta Crítico Executivo */}
      {critical.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-rose-500/40 bg-gradient-to-r from-rose-950/40 via-red-950/25 to-[#0b0814]/90 p-4 sm:p-5 shadow-[0_0_35px_rgba(244,63,94,0.18)] flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3.5">
            <div className="relative grid size-11 shrink-0 place-items-center rounded-xl border border-rose-500/50 bg-rose-500/20 text-rose-400 shadow-[0_0_20px_rgba(244,63,94,0.3)]">
              <Flame className="size-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold text-rose-300">
                  {critical.length} Oportunidades Muito Quentes Aguardando Atendimento
                </span>
                <span className="rounded-full bg-rose-500/20 border border-rose-500/40 px-2 py-0.5 text-[10px] font-bold text-rose-300 uppercase tracking-wider">
                  Prioridade Máxima
                </span>
              </div>
              <div className="text-xs text-muted-foreground mt-0.5">
                Tempo sem resposta superior a 10 min — Potencial acumulado em risco:{" "}
                <strong className="text-rose-400 font-bold text-sm">
                  {BRL(critical.reduce((a, o) => a + o.potentialValue, 0))}
                </strong>
              </div>
            </div>
          </div>
          <Button
            size="sm"
            onClick={() => setSelected(critical[0]?.id ?? "")}
            className="shrink-0 bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-[0_0_20px_rgba(244,63,94,0.35)]"
          >
            Atribuir Prioridade Imediata <ArrowRight className="ml-1.5 size-4" />
          </Button>
        </div>
      )}

      {/* Grid de KPIs Principais (8 colunas) */}
      <div className="grid grid-cols-2 gap-3 sm:gap-3.5 lg:grid-cols-4 xl:grid-cols-8">
        <Kpi label="Oportunidades recebidas" value="142" change="+12% no período" icon={Target} />
        <Kpi label="Qualificadas" value="87" change="61,3% do total" icon={ShieldCheck} />
        <Kpi label="Muito quentes" value="24" change="17 precisam de ação" icon={Flame} />
        <Kpi label="Em atendimento" value="61" icon={MessageCircle} />
        <Kpi label="Propostas enviadas" value="28" change="+8% no período" icon={FileText} />
        <Kpi label="Vendas realizadas" value="11" change="+2 vs. período anterior" icon={Check} />
        <Kpi label="Oportunidades perdidas" value="19" danger icon={TrendingDown} />
        <Kpi label="Taxa de conversão" value="12,6%" change="+1,4 p.p." icon={TrendingUp} />
      </div>

      {/* Trio de Indicadores Executivos em Destaque */}
      <div className="grid gap-3.5 md:grid-cols-3">
        <div className="rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-[#0b1428]/80 to-[#060c1a]/90 p-5 shadow-[0_0_25px_rgba(6,182,212,0.08)]">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Tempo Médio 1ª Resposta</span>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
              Meta: &lt; 10 min
            </span>
          </div>
          <div className="text-3xl font-bold tracking-tight text-white">8 min</div>
          <div className="mt-3">
            <div className="flex justify-between text-[11px] text-muted-foreground mb-1">
              <span>Velocidade de Contato</span>
              <span className="text-emerald-400 font-semibold">Zona Segura</span>
            </div>
            <div className="h-2 w-full rounded-full bg-slate-800 overflow-hidden">
              <div style={{ width: "40%" }} className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" />
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-gradient-to-b from-[#18120c]/80 to-[#0e0a06]/90 p-5 shadow-[0_0_25px_rgba(245,158,11,0.08)]">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Follow-ups Pendentes</span>
            <span
              className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                overdue.length > 0
                  ? "border-rose-500/30 bg-rose-500/15 text-rose-400"
                  : "border-emerald-500/30 bg-emerald-500/15 text-emerald-400",
              )}
            >
              {overdue.length > 0 ? "Atrasados" : "Em Dia"}
            </span>
          </div>
          <div className="text-3xl font-bold tracking-tight text-white">{overdue.length} atrasados</div>
          <p className="mt-3 text-xs text-muted-foreground leading-relaxed">
            Contatos programados que necessitam de reengajamento para não perder a oportunidade.
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-[#081814]/80 to-[#040e0c]/90 p-5 shadow-[0_0_25px_rgba(16,185,129,0.08)]">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
            <span>Potencial Comercial Ativo</span>
            <span className="rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
              Pipeline Aberto
            </span>
          </div>
          <div className="text-3xl font-bold tracking-tight text-emerald-400">{BRL(recoverable)}</div>
          <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
            <span>23 oportunidades em negociação</span>
            <span className="text-cyan-300 font-medium">Lojas SC & RS</span>
          </div>
        </div>
      </div>

      {/* Funil e Temperatura */}
      <div className="grid gap-5 xl:grid-cols-[1.45fr_0.8fr]">
        <section className="rounded-2xl border border-border/60 bg-gradient-to-b from-surface/80 to-surface-2/40 p-5 sm:p-6">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">Funil de Oportunidades</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">Eficiência e conversão por etapa da jornada de compra</p>
            </div>
            <div className="rounded-lg border border-border/60 bg-secondary/80 px-2.5 py-1 text-[11px] font-semibold text-muted-foreground">
              ÚLTIMOS 30 DIAS
            </div>
          </div>
          <div className="space-y-3.5">
            {stages.map((s, i) => (
              <div key={s.n} className="grid grid-cols-[100px_1fr_50px] items-center gap-3">
                <div>
                  <div className="text-sm font-bold text-foreground">{s.v}</div>
                  <div className="text-[11px] text-muted-foreground font-medium">{s.n}</div>
                </div>
                <div className="relative h-8 overflow-hidden rounded-lg bg-secondary/60 border border-border/40">
                  <div
                    className={cn("h-full rounded-lg bg-gradient-to-r transition-all duration-500", s.color)}
                    style={{ width: `${Math.max(10, (s.v / stages[0]!.v) * 100)}%` }}
                  />
                  <span className="absolute inset-y-0 left-3 flex items-center text-[10px] font-semibold text-white/90 drop-shadow">
                    {s.n} ({s.v})
                  </span>
                </div>
                <div className="text-right text-xs font-mono font-medium text-cyan-300">
                  {i === 0 ? "100%" : `${Math.round((s.v / stages[i - 1]!.v) * 100)}%`}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-start gap-3 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-amber-400" />
            <div className="text-xs leading-relaxed text-slate-200">
              <strong className="text-amber-300 font-semibold">Insight Vyntra AI:</strong> Você tem maior índice de atrito na transição de atendimento para proposta. A aceleração de simulação de consórcio e entrada flexível eleva a taxa de avanço em até 28%.
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-border/60 bg-gradient-to-b from-surface/80 to-surface-2/40 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold text-foreground">Temperatura das Oportunidades</h2>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Classificação Vyntra Score: Quentes (Verde), Médios (Amarelo) e Frios (Vermelho)
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs">
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                🟢 Quentes
              </span>
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/30">
                🟡 Médios
              </span>
              <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold bg-rose-500/15 text-rose-400 border border-rose-500/30">
                🔴 Frios
              </span>
            </div>
          </div>
          <div className="mt-5 space-y-4">
            {temp.map((t) => {
              const m = TEMPERATURE_META[t.key];
              const share = Math.round((t.v / Math.max(1, opportunities.length)) * 100);
              return (
                <div key={t.key}>
                  <div className="mb-1.5 flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">
                      {m.emoji} {m.label}
                    </span>
                    <span className="font-mono text-xs">
                      <strong>{t.v}</strong> ({share}%)
                    </span>
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-secondary/80 border border-border/40">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${share}%`,
                        background: m.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-6 border-t border-border/40 pt-4 text-[11px] leading-relaxed text-muted-foreground">
            Critérios multivariáveis: intenção imediata, orçamento vs. modelo Honda, prazo de compra, entrada em dinheiro ou moto seminova.
          </p>
        </section>
      </div>

      {/* Prioridades Imediatas e Dinheiro em Risco */}
      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <PriorityList setSelected={setSelected} />
        <section className="rounded-2xl border border-border/60 bg-gradient-to-b from-surface/80 to-surface-2/40 p-5 sm:p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-foreground">Dinheiro em Risco Agora</h2>
              <p className="text-xs text-muted-foreground">Leads de alto valor sem contato nas últimas 2h</p>
            </div>
            <span className="text-lg font-bold text-rose-400">R$ 84.900</span>
          </div>
          <div className="divide-y divide-border/40">
            {critical.slice(0, 3).map((o) => (
              <button
                key={o.id}
                onClick={() => setSelected(o.id)}
                className="flex w-full items-center gap-3 py-3 text-left transition-colors hover:bg-white/5 px-2 rounded-lg"
              >
                <ScoreMini score={o.score} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold truncate text-foreground">{o.customer.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {o.product} · {o.city} · {o.objection}
                  </div>
                </div>
                <div className="text-sm font-bold text-cyan-300 shrink-0">{BRL(o.potentialValue)}</div>
              </button>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

function PriorityList({ setSelected }: { setSelected: (v: string) => void }) {
  const { opportunities, sellerById, now } = useVyntra();
  const list = opportunities
    .filter((o) => {
      const m = waitingMinutes(o, now);
      return o.score >= 80 && m !== null;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);
  return (
    <section className="panel overflow-hidden">
      <div className="flex items-center justify-between p-5">
        <div>
          <h2 className="text-base font-semibold">Merecem atenção agora</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Ordenadas por score e tempo sem resposta
          </p>
        </div>
        <Zap className="size-5 text-primary" />
      </div>
      <div>
        {list.map((o) => {
          const m = waitingMinutes(o, now) ?? 0;
          return (
            <button
              key={o.id}
              onClick={() => setSelected(o.id)}
              className="grid w-full grid-cols-[auto_1fr_auto] items-center gap-3 border-t border-border px-5 py-3 text-left hover:bg-accent/50"
            >
              <ScoreMini score={o.score} />
              <div>
                <div className="text-sm font-medium">
                  {o.customer.name} <span className="text-muted-foreground">· {o.product}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {sellerById(o.sellerId)?.name} · {o.route.primary}
                </div>
              </div>
              <Timer minutes={m} />
            </button>
          );
        })}
      </div>
    </section>
  );
}

function Timer({ minutes }: { minutes: number }) {
  const level = timerLevel(minutes);
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold",
        level === "normal" &&
          "bg-[color:color-mix(in_oklab,var(--success)_15%,transparent)] text-[color:var(--success)]",
        level === "atencao" &&
          "bg-[color:color-mix(in_oklab,var(--warm)_15%,transparent)] text-[color:var(--warm)]",
        level === "critico" && "bg-destructive/15 text-destructive",
      )}
    >
      <Clock3 className="size-3" />
      {minutes} min
    </span>
  );
}
function ScoreMini({ score }: { score: number }) {
  const m = TEMPERATURE_META[temperatureOf(score)];
  return (
    <div
      className="grid size-9 shrink-0 place-items-center rounded-lg text-xs font-bold border transition-transform duration-150 hover:scale-105"
      style={{
        color: m.color,
        background: `color-mix(in oklab, ${m.color} 14%, transparent)`,
        borderColor: `color-mix(in oklab, ${m.color} 35%, transparent)`,
      }}
      title={`${m.label}: Score ${score}`}
    >
      {score}
    </div>
  );
}

function FilterBar({
  filters,
  setFilters,
  hideSellerFilter,
}: {
  filters: OpportunityFilters;
  setFilters: (v: OpportunityFilters) => void;
  hideSellerFilter?: boolean;
}) {
  const { sellers, opportunities } = useVyntra();
  const products = [...new Set(opportunities.map((o) => o.product))];
  const storeOptions: Array<[string, string]> =
    filters.state === "SC"
      ? [
          ["all", "Todas as lojas (SC)"],
          ["Lages / SC", "Lages / SC"],
        ]
      : filters.state === "RS"
        ? [
            ["all", "Todas as lojas (RS)"],
            ["Três Passos / RS", "Três Passos / RS"],
            ["Santa Rosa / RS", "Santa Rosa / RS"],
          ]
        : [
            ["all", "Todas as lojas (RS e SC)"],
            ["Lages / SC", "Lages / SC (SC)"],
            ["Três Passos / RS", "Três Passos / RS (RS)"],
            ["Santa Rosa / RS", "Santa Rosa / RS (RS)"],
          ];

  const handleStateChange = (newState: string) => {
    let nextStore = filters.store;
    if (newState === "SC" && (filters.store === "Três Passos / RS" || filters.store === "Santa Rosa / RS")) {
      nextStore = "all";
    } else if (newState === "RS" && filters.store === "Lages / SC") {
      nextStore = "all";
    }
    setFilters({ ...filters, state: newState, store: nextStore, city: "all" });
  };

  const select = (key: keyof OpportunityFilters, label: string, items: Array<[string, string]>) => (
    <Select value={filters[key] || ""} onValueChange={(v) => setFilters({ ...filters, [key]: v })}>
      <SelectTrigger className="h-9 min-w-[130px] bg-surface">
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        {items.map(([v, l]) => (
          <SelectItem key={v} value={v}>
            {l}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );

  // Lista de cidades disponíveis com base nos filtros regionais
  const availableCities: Array<[string, string]> = [["all", "Todas as cidades"]];
  if (filters.state === "SC" || filters.store === "Lages / SC") {
    LAGES_REGION_CITIES.forEach((c) => availableCities.push([c, c]));
  } else if (filters.state === "RS") {
    const rsCities = Array.from(new Set(opportunities.filter((o) => o.state === "RS").map((o) => o.city))).sort();
    rsCities.forEach((c) => availableCities.push([c, c]));
  } else {
    const allUniqueCities = Array.from(new Set([...LAGES_REGION_CITIES, ...opportunities.map((o) => o.city)])).sort();
    allUniqueCities.forEach((c) => availableCities.push([c, c]));
  }

  return (
    <div className="mb-4 flex flex-wrap gap-2 rounded-xl border border-border bg-surface/50 p-3">
      <div className="flex items-center gap-2 px-1 text-xs font-medium text-muted-foreground">
        <SlidersHorizontal className="size-4" />
        Filtros
      </div>
      {select("period", "Período", [
        ["30d", "Últimos 30 dias"],
        ["7d", "Últimos 7 dias"],
        ["today", "Hoje"],
      ])}
      {!hideSellerFilter &&
        select("sellerId", "Vendedor", [
          ["all", "Todos os vendedores"],
          ...sellers.map((s) => [s.id, s.name] as [string, string]),
        ])}
      <Select value={filters.state} onValueChange={handleStateChange}>
        <SelectTrigger className="h-9 min-w-[140px] bg-surface">
          <SelectValue placeholder="Estado" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">RS e SC</SelectItem>
          <SelectItem value="RS">Rio Grande do Sul</SelectItem>
          <SelectItem value="SC">Santa Catarina</SelectItem>
        </SelectContent>
      </Select>
      <Select
        value={filters.store}
        onValueChange={(v) => {
          let nextState = filters.state;
          if (v === "Lages / SC" && filters.state === "RS") nextState = "SC";
          if ((v === "Três Passos / RS" || v === "Santa Rosa / RS") && filters.state === "SC") nextState = "RS";
          setFilters({ ...filters, store: v, state: nextState, city: "all" });
        }}
      >
        <SelectTrigger className="h-9 min-w-[160px] bg-surface">
          <SelectValue placeholder="Loja" />
        </SelectTrigger>
        <SelectContent>
          {storeOptions.map(([v, l]) => (
            <SelectItem key={v} value={v}>
              {l}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        value={filters.city || "all"}
        onValueChange={(v) => {
          let nextState = filters.state;
          let nextStore = filters.store;
          if (LAGES_REGION_CITIES.includes(v as (typeof LAGES_REGION_CITIES)[number])) {
            nextState = "SC";
            nextStore = "Lages / SC";
          }
          setFilters({ ...filters, city: v, state: nextState, store: nextStore });
        }}
      >
        <SelectTrigger className="h-9 min-w-[140px] bg-surface">
          <SelectValue placeholder="Cidade" />
        </SelectTrigger>
        <SelectContent>
          {availableCities.map(([v, l]) => (
            <SelectItem key={v} value={v}>
              {l}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {select("product", "Produto", [
        ["all", "Todos os produtos"],
        ...products.map((p) => [p, p] as [string, string]),
      ])}
      {select("category", "Categoria", [
        ["all", "0 km / Seminova"],
        ["0 km", "0 km"],
        ["Seminova", "Seminova"],
      ])}
      {select("method", "Forma", [
        ["all", "Todas as formas"],
        ["Financiamento", "Financiamento"],
        ["Consórcio", "Consórcio"],
        ["À vista", "À vista"],
      ])}
      {select("temperature", "Temperatura", [
        ["all", "Todas as temperaturas"],
        ["muito_quente", "🟢 Quente (Score 80+)"],
        ["potencial", "🟡 Médio / Potencial (60-79)"],
        ["morno", "🟡 Médio / Morno (40-59)"],
        ["baixo", "🔴 Frio (Score < 40)"],
      ])}
      {select("status", "Status", [
        ["all", "Todos os status"],
        ...[
          "Novo",
          "Em atendimento",
          "Follow-up",
          "Aguardando cliente",
          "Proposta enviada",
          "Negociação",
          "Venda",
          "Perdida",
        ].map((x) => [x, x] as [string, string]),
      ])}
      <Button variant="ghost" size="sm" onClick={() => setFilters(FILTER_INITIAL)}>
        Limpar
      </Button>
    </div>
  );
}

function applyFilters(o: Opportunity, f: OpportunityFilters) {
  return (
    (f.sellerId === "all" || o.sellerId === f.sellerId) &&
    (f.state === "all" || o.state === f.state) &&
    (f.store === "all" || o.store === f.store) &&
    (f.city === "all" || !f.city || o.city === f.city) &&
    (f.product === "all" || o.product === f.product) &&
    (f.category === "all" || o.category === f.category) &&
    (f.method === "all" || o.method === f.method) &&
    (f.temperature === "all" || temperatureOf(o.score) === f.temperature) &&
    (f.status === "all" || o.status === f.status) &&
    (!f.search ||
      `${o.customer.name} ${o.product} ${o.city} ${o.store} ${o.state}`
        .toLowerCase()
        .includes(f.search.toLowerCase()))
  );
}

function OpportunitiesPage({
  setSelected,
  setView,
}: {
  setSelected: (v: string) => void;
  setView?: ((v: View) => void) | undefined;
}) {
  const { opportunities, sellers, sellerById, assignLeads, now, role, currentSellerId } = useVyntra();
  const isSeller = role === "vendedor";
  const [f, setF] = useState(FILTER_INITIAL);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [targetSeller, setTargetSeller] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");
  const [insightFilter, setInsightFilter] = useState<"all" | "hot" | "consorcio" | "urgent" | "lages" | "rs">("all");

  const baseOpportunities = useMemo(() => {
    return isSeller ? opportunities.filter((o) => o.sellerId === currentSellerId) : opportunities;
  }, [opportunities, isSeller, currentSellerId]);

  // Contadores para a Barra de Insights
  const hotCount = useMemo(() => baseOpportunities.filter((o) => o.score >= 80).length, [baseOpportunities]);
  const consorcioCount = useMemo(
    () =>
      baseOpportunities.filter(
        (o) =>
          o.method.toLowerCase().includes("consórcio") ||
          o.product.toLowerCase().includes("consórcio") ||
          o.route.alternative?.toLowerCase().includes("consórcio"),
      ).length,
    [baseOpportunities],
  );
  const urgentCount = useMemo(() => {
    return baseOpportunities.filter((o) => {
      const waiting = waitingMinutes(o, now);
      return o.score >= 80 && waiting !== null && waiting >= 10;
    }).length;
  }, [baseOpportunities, now]);
  const lagesCount = useMemo(
    () => baseOpportunities.filter((o) => o.store === "Lages / SC").length,
    [baseOpportunities],
  );
  const rsCount = useMemo(
    () => baseOpportunities.filter((o) => o.store.includes("RS")).length,
    [baseOpportunities],
  );

  const list = useMemo(() => {
    return baseOpportunities.filter((o) => {
      if (insightFilter === "hot" && o.score < 80) return false;
      if (
        insightFilter === "consorcio" &&
        !o.method.toLowerCase().includes("consórcio") &&
        !o.product.toLowerCase().includes("consórcio") &&
        !o.route.alternative?.toLowerCase().includes("consórcio")
      )
        return false;
      if (insightFilter === "urgent") {
        const waiting = waitingMinutes(o, now);
        if (o.score < 80 || waiting === null || waiting < 10) return false;
      }
      if (insightFilter === "lages" && o.store !== "Lages / SC") return false;
      if (insightFilter === "rs" && !o.store.includes("RS")) return false;

      return applyFilters(o, f);
    });
  }, [baseOpportunities, f, now, insightFilter]);

  const visibleIds = list.map((o) => o.id);
  const allVisibleSelected = visibleIds.length > 0 && visibleIds.every((id) => selectedIds.includes(id));
  const toggleLead = (id: string) =>
    setSelectedIds((current) =>
      current.includes(id) ? current.filter((selectedId) => selectedId !== id) : [...current, id],
    );
  const toggleVisible = () =>
    setSelectedIds((current) =>
      allVisibleSelected
        ? current.filter((id) => !visibleIds.includes(id))
        : [...new Set([...current, ...visibleIds])],
    );
  const distributeSelected = () => {
    if (!targetSeller) {
      toast.error("Escolha o vendedor que receberá os leads.");
      return;
    }
    assignLeads(selectedIds, targetSeller);
    setSelectedIds([]);
    setTargetSeller("");
  };

  return (
    <>
      {!isSeller && setView && (
        <div className="mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setView("overview")}
            className="gap-2 text-xs font-semibold border-cyan-500/30 bg-cyan-950/20 hover:bg-cyan-500/20 hover:border-cyan-400 text-cyan-300 shadow-sm"
          >
            <ArrowLeft className="size-3.5 text-cyan-400" />
            Voltar para Visão Geral
          </Button>
        </div>
      )}
      <PageHeader
        title={isSeller ? "Meus Leads & Oportunidades" : "Oportunidades Comerciais"}
        subtitle={
          isSeller
            ? "Acompanhe sua carteira individual de atendimento com score de qualificação."
            : "Priorize oportunidades quentes, controle o SLA de resposta e direcione leads por meritocracia."
        }
        action={
          <Button className="gap-1.5 font-semibold bg-cyan-500 hover:bg-cyan-400 text-slate-950">
            <Plus className="size-4" />
            Nova oportunidade
          </Button>
        }
      />

      {/* BARRA DE INSIGHTS COMERCIAIS IA */}
      <div className="mb-4 rounded-xl border border-cyan-500/25 bg-gradient-to-r from-[#04081b] via-[#071330] to-[#040a1d] p-3.5 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-border/40 pb-2.5 mb-3">
          <div className="flex items-center gap-2">
            <div className="grid size-7 place-items-center rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400">
              <Sparkles className="size-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">Barra de Insights Comerciais IA</span>
                <span className="rounded-full bg-cyan-500/15 px-2 py-0.2 text-[9px] font-bold text-cyan-300 border border-cyan-500/30">
                  Tempo Real
                </span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Filtre instantaneamente oportunidades por temperatura, demanda de consórcio ou urgência de contato:
              </p>
            </div>
          </div>
          {insightFilter !== "all" && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setInsightFilter("all")}
              className="h-7 text-xs border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10 self-start md:self-auto"
            >
              <X className="size-3 mr-1" />
              Limpar Filtro ({insightFilter})
            </Button>
          )}
        </div>

        {/* Pílulas de Ação Rápida */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {/* 1. Leads Quentes */}
          <button
            onClick={() => setInsightFilter(insightFilter === "hot" ? "all" : "hot")}
            className={cn(
              "flex flex-col text-left rounded-lg p-2.5 transition-all border",
              insightFilter === "hot"
                ? "bg-emerald-500/20 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                : "bg-surface-2/40 border-border/60 hover:bg-surface-2 hover:border-emerald-500/30",
            )}
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                <Flame className="size-3.5 fill-emerald-400 text-emerald-400" /> Leads Quentes
              </span>
              <span className="rounded-md bg-emerald-500/20 px-1.5 py-0.2 text-[10px] font-bold text-emerald-300">
                {hotCount}
              </span>
            </div>
            <span className="mt-1 text-[10px] text-muted-foreground line-clamp-1">
              Score 80+ · Alta conversão
            </span>
          </button>

          {/* 2. Consórcio Honda */}
          <button
            onClick={() => setInsightFilter(insightFilter === "consorcio" ? "all" : "consorcio")}
            className={cn(
              "flex flex-col text-left rounded-lg p-2.5 transition-all border",
              insightFilter === "consorcio"
                ? "bg-emerald-500/20 border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                : "bg-surface-2/40 border-border/60 hover:bg-surface-2 hover:border-emerald-500/30",
            )}
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                <Coins className="size-3.5 text-emerald-400" /> Consórcio Honda
              </span>
              <span className="rounded-md bg-emerald-500/20 px-1.5 py-0.2 text-[10px] font-bold text-emerald-300">
                {consorcioCount}
              </span>
            </div>
            <span className="mt-1 text-[10px] text-muted-foreground line-clamp-1">
              Sem barreira de entrada
            </span>
          </button>

          {/* 3. Alerta de SLA (<10m) */}
          <button
            onClick={() => setInsightFilter(insightFilter === "urgent" ? "all" : "urgent")}
            className={cn(
              "flex flex-col text-left rounded-lg p-2.5 transition-all border",
              insightFilter === "urgent"
                ? "bg-destructive/20 border-destructive/60 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                : "bg-surface-2/40 border-border/60 hover:bg-surface-2 hover:border-destructive/30",
            )}
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-[11px] font-semibold text-destructive">
                <Clock3 className="size-3.5 text-destructive" /> Alerta de SLA
              </span>
              <span className="rounded-md bg-destructive/20 px-1.5 py-0.2 text-[10px] font-bold text-destructive">
                {urgentCount}
              </span>
            </div>
            <span className="mt-1 text-[10px] text-muted-foreground line-clamp-1">
              Contato atrasado &gt;10 min
            </span>
          </button>

          {/* 4. Serra Catarinense (Lages) */}
          <button
            onClick={() => setInsightFilter(insightFilter === "lages" ? "all" : "lages")}
            className={cn(
              "flex flex-col text-left rounded-lg p-2.5 transition-all border",
              insightFilter === "lages"
                ? "bg-cyan-500/20 border-cyan-500/60 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                : "bg-surface-2/40 border-border/60 hover:bg-surface-2 hover:border-cyan-500/30",
            )}
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-[11px] font-semibold text-cyan-300">
                <MapPin className="size-3.5 text-cyan-400" /> Loja Lages / SC
              </span>
              <span className="rounded-md bg-cyan-500/20 px-1.5 py-0.2 text-[10px] font-bold text-cyan-300">
                {lagesCount}
              </span>
            </div>
            <span className="mt-1 text-[10px] text-muted-foreground line-clamp-1">
              Serra Catarinense
            </span>
          </button>

          {/* 5. Região RS */}
          <button
            onClick={() => setInsightFilter(insightFilter === "rs" ? "all" : "rs")}
            className={cn(
              "col-span-2 sm:col-span-1 flex flex-col text-left rounded-lg p-2.5 transition-all border",
              insightFilter === "rs"
                ? "bg-indigo-500/20 border-indigo-500/60 shadow-[0_0_15px_rgba(99,102,241,0.2)]"
                : "bg-surface-2/40 border-border/60 hover:bg-surface-2 hover:border-indigo-500/30",
            )}
          >
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1 text-[11px] font-semibold text-indigo-300">
                <MapPin className="size-3.5 text-indigo-400" /> Região RS
              </span>
              <span className="rounded-md bg-indigo-500/20 px-1.5 py-0.2 text-[10px] font-bold text-indigo-300">
                {rsCount}
              </span>
            </div>
            <span className="mt-1 text-[10px] text-muted-foreground line-clamp-1">
              Três Passos & Santa Rosa
            </span>
          </button>
        </div>
      </div>

      {/* Controles de Busca e Alternador de Visualização */}
      <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
          <Input
            className="pl-9 bg-surface text-xs"
            placeholder="Buscar por cliente, moto, cidade ou ID..."
            value={f.search}
            onChange={(e) => setF({ ...f, search: e.target.value })}
          />
        </div>

        {/* Alternador de Modo: Tabela vs Cards (Sem scroll horizontal) */}
        <div className="flex items-center gap-1 rounded-lg border border-border/70 bg-surface p-1">
          <Button
            variant={viewMode === "table" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("table")}
            className="h-7 gap-1.5 text-xs font-medium"
          >
            <List className="size-3.5" />
            Tabela Detalhada
          </Button>
          <Button
            variant={viewMode === "cards" ? "secondary" : "ghost"}
            size="sm"
            onClick={() => setViewMode("cards")}
            className="h-7 gap-1.5 text-xs font-medium"
          >
            <LayoutGrid className="size-3.5" />
            Cards Comerciais
          </Button>
        </div>
      </div>

      <FilterBar filters={f} setFilters={setF} hideSellerFilter={isSeller} />

      {!isSeller && selectedIds.length > 0 && (
        <div className="mb-4 flex flex-col gap-3 rounded-lg border border-primary/30 bg-primary/10 p-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="grid size-9 shrink-0 place-items-center rounded-md bg-primary text-sm font-bold text-primary-foreground">
              {selectedIds.length}
            </div>
            <div>
              <div className="text-sm font-semibold">
                {selectedIds.length === 1 ? "Lead selecionado" : "Leads selecionados"}
              </div>
              <div className="text-xs text-muted-foreground">Escolha quem receberá esta carteira.</div>
            </div>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Select value={targetSeller} onValueChange={setTargetSeller}>
              <SelectTrigger className="h-9 min-w-[220px] bg-surface">
                <SelectValue placeholder="Escolher vendedor" />
              </SelectTrigger>
              <SelectContent>
                {sellers.map((seller) => (
                  <SelectItem key={seller.id} value={seller.id}>
                    {seller.name} · {seller.online ? "Online" : "Offline"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button size="sm" onClick={distributeSelected}>
              <Send className="mr-1.5 size-3.5" /> Enviar leads
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelectedIds([])}>
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {/* MODO CARDS COMERCIAIS (Sem scroll horizontal) */}
      {viewMode === "cards" ? (
        <div className="space-y-4">
          <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((o) => {
              const tm = TEMPERATURE_META[temperatureOf(o.score)];
              const waiting = waitingMinutes(o, now);
              const isConsorcio =
                o.method.toLowerCase().includes("consórcio") ||
                o.product.toLowerCase().includes("consórcio");
              const isSelected = selectedIds.includes(o.id);
              const seller = sellerById(o.sellerId);

              return (
                <article
                  key={o.id}
                  onClick={() => setSelected(o.id)}
                  className={cn(
                    "panel cursor-pointer p-4 transition-all duration-200 hover:border-cyan-500/50 hover:shadow-lg relative flex flex-col justify-between",
                    isSelected && "border-primary bg-primary/5",
                    o.score >= 80 && "border-emerald-500/30 hover:border-emerald-500/60 shadow-[0_0_15px_rgba(16,185,129,0.06)]",
                  )}
                >
                  <div>
                    {/* Header do Card */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleLead(o.id);
                          }}
                        >
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={() => toggleLead(o.id)}
                            aria-label={`Selecionar lead ${o.customer.name}`}
                          />
                        </div>
                        <div>
                          <h4 className="font-semibold text-sm text-foreground line-clamp-1">
                            {o.customer.name}
                          </h4>
                          <span className="font-mono text-[10px] text-muted-foreground">{o.id}</span>
                        </div>
                      </div>

                      {/* Score Badge */}
                      <div
                        className="flex items-center gap-1 rounded-lg px-2 py-0.5 text-xs font-bold shrink-0"
                        style={{
                          color: tm.color,
                          backgroundColor: `color-mix(in oklab, ${tm.color} 15%, transparent)`,
                          border: `1px solid color-mix(in oklab, ${tm.color} 30%, transparent)`,
                        }}
                        title={`${tm.label}: Score ${o.score}`}
                      >
                        {o.score >= 80 ? (
                          <Flame className="size-3 fill-current" />
                        ) : o.score >= 40 ? (
                          <Activity className="size-3" />
                        ) : (
                          <Snowflake className="size-3" />
                        )}
                        {o.score}
                      </div>
                    </div>

                    {/* Localização / Loja */}
                    <div className="mt-2.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <MapPin className="size-3 text-cyan-400 shrink-0" />
                      <span className="font-medium text-foreground">{o.store}</span>
                      <span>·</span>
                      <span>{o.city}</span>
                    </div>

                    {/* Produto & Forma de Pagamento */}
                    <div className="mt-2.5 rounded-lg border border-border/60 bg-surface-2/40 p-2 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Modelo:</span>
                        <strong className="text-foreground font-semibold">{o.product}</strong>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Forma:</span>
                        {isConsorcio ? (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                            <Coins className="size-2.5" /> Consórcio Honda
                          </span>
                        ) : (
                          <span className="font-medium text-foreground">{o.method}</span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground">Entrada:</span>
                        <span className="text-muted-foreground">{o.downPayment}</span>
                      </div>
                    </div>

                    {/* Vendedor Responsável & Status */}
                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-border/40 text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <UserRound className="size-3 text-primary" />
                        <span className="font-medium text-foreground">
                          {seller?.name.split(" ")[0] || "Sem vendedor"}
                        </span>
                      </div>
                      <span className={cn("rounded-md border px-2 py-0.5 text-[10px] font-semibold", STATUS_TONE[o.status])}>
                        {o.status}
                      </span>
                    </div>

                    {/* Timer de Resposta */}
                    {waiting !== null && o.score >= 80 && (
                      <div className="mt-2 flex items-center justify-between text-[10px]">
                        <span className="text-muted-foreground">SLA de Primeiro Contato:</span>
                        <Timer minutes={waiting} />
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-2 border-t border-border/40 flex items-center justify-between text-[11px] text-muted-foreground">
                    <span>{relativeTime(o.lastContactAt, now)}</span>
                    <span className="text-cyan-400 font-medium hover:underline flex items-center gap-0.5">
                      Ficha comercial →
                    </span>
                  </div>
                </article>
              );
            })}
          </div>

          <div className="flex items-center justify-between border-t border-border pt-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <Checkbox
                aria-label="Selecionar todos os leads visíveis"
                checked={allVisibleSelected}
                onCheckedChange={toggleVisible}
              />
              <span>{allVisibleSelected ? "Desmarcar todos" : "Selecionar todos os visíveis"}</span>
              <span>·</span>
              <span>{list.length} de {opportunities.length} oportunidades</span>
            </div>
            <span className="font-mono text-[11px] text-cyan-300">Modo Cards Sem Scroll Horizontal</span>
          </div>
        </div>
      ) : (
        /* MODO TABELA COM SCROLLBAR PERSONALIZADO E CABEÇALHO FIXO */
        <div className="panel overflow-hidden border border-border/80 shadow-md">
          <div className="overflow-x-auto custom-scrollbar max-h-[720px]">
            <table className="w-full min-w-[1440px] text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-[#050b20] shadow-sm backdrop-blur">
                <tr className="border-b border-border/70 text-[10px] uppercase tracking-wider text-muted-foreground">
                  {[
                    "Selecionar",
                    "Score / Temp",
                    "Cliente",
                    "Região / Loja",
                    "Produto Honda",
                    "Categoria",
                    "Forma de Compra",
                    "Orçamento",
                    "Entrada",
                    "Prazo",
                    "Vendedor",
                    "Status",
                    "Último Contato",
                    "Ação",
                  ].map((h) => (
                    <th key={h} className="px-4 py-3 font-semibold whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {list.length === 0 ? (
                  <tr>
                    <td colSpan={14} className="py-12 text-center text-sm text-muted-foreground">
                      Nenhuma oportunidade encontrada com os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  list.map((o) => {
                    const tm = TEMPERATURE_META[temperatureOf(o.score)];
                    const waiting = waitingMinutes(o, now);
                    const isConsorcio =
                      o.method.toLowerCase().includes("consórcio") ||
                      o.product.toLowerCase().includes("consórcio");

                    return (
                      <tr
                        key={o.id}
                        onClick={() => setSelected(o.id)}
                        className="cursor-pointer border-b border-border/40 transition-colors hover:bg-cyan-950/15"
                      >
                        <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                          <Checkbox
                            aria-label={`Selecionar lead de ${o.customer.name}`}
                            checked={selectedIds.includes(o.id)}
                            onCheckedChange={() => toggleLead(o.id)}
                          />
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <ScoreMini score={o.score} />
                            <span className="text-base" title={tm.label}>{tm.emoji}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="text-sm font-semibold text-foreground">{o.customer.name}</div>
                          <div className="font-mono text-[10px] text-muted-foreground">{o.id}</div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex flex-col gap-0.5">
                            <span className="inline-flex items-center gap-1 font-semibold text-xs text-foreground">
                              <MapPin className="size-3 text-cyan-400 shrink-0" /> {o.store}
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {o.city} · {o.state}
                            </span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs font-medium text-foreground whitespace-nowrap">
                          {o.product}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">{o.category}</td>
                        <td className="px-4 py-3 text-xs whitespace-nowrap">
                          {isConsorcio ? (
                            <span className="inline-flex items-center gap-1 rounded bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-300 border border-emerald-500/30">
                              <Coins className="size-2.5" /> Consórcio Honda
                            </span>
                          ) : (
                            o.method
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{o.budget}</td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{o.downPayment}</td>
                        <td className="px-4 py-3 text-xs whitespace-nowrap">{o.deadline}</td>
                        <td className="px-4 py-3 text-xs whitespace-nowrap">
                          <span className="font-medium text-foreground">
                            {sellerById(o.sellerId)?.name.split(" ")[0] || "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span
                            className={cn(
                              "rounded-md border px-2 py-1 text-[10px] font-medium",
                              STATUS_TONE[o.status],
                            )}
                          >
                            {o.status}
                          </span>
                          {waiting !== null && o.score >= 80 && (
                            <div className="mt-1">
                              <Timer minutes={waiting} />
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                          {relativeTime(o.lastContactAt, now)}
                        </td>
                        <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="icon" onClick={() => setSelected(o.id)}>
                            <ChevronRight className="size-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <Checkbox
                aria-label="Selecionar todos os leads visíveis"
                checked={allVisibleSelected}
                onCheckedChange={toggleVisible}
              />
              <span>{allVisibleSelected ? "Desmarcar visíveis" : "Selecionar todos os visíveis"}</span>
              <span>·</span>
              <span>{list.length} de {opportunities.length} oportunidades</span>
            </div>
            <span className="text-[11px] text-muted-foreground">Scroll suave horizontal ativado</span>
          </div>
        </div>
      )}
    </>
  );
}

function OpportunityDrawer({ id, onClose }: { id: string | null; onClose: () => void }) {
  const v = useVyntra();
  const o = id ? v.opportunityById(id) : undefined;
  const [routeOpen, setRouteOpen] = useState(false);
  if (!o) return null;
  const temp = TEMPERATURE_META[temperatureOf(o.score)];
  const waiting = waitingMinutes(o, v.now);
  const routes: CommercialRoute[] = [
    "0 km",
    "Seminova",
    "Financiamento",
    "Consórcio",
    "À vista",
    "Avaliação de troca",
    "Atendimento consultivo",
  ];
  return (
    <Sheet
      open={Boolean(id)}
      onOpenChange={(x) => {
        if (!x) onClose();
      }}
    >
      <SheetContent className="w-full overflow-y-auto custom-scrollbar p-0 sm:max-w-[720px]">
        <div className="sticky top-0 z-20 border-b border-border bg-[#050b18]/95 p-4 sm:p-5 backdrop-blur-xl">
          <div className="mb-3 flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="h-8 gap-2 px-3 text-xs font-semibold text-foreground border-cyan-500/40 bg-cyan-950/20 hover:bg-cyan-500/10 hover:border-cyan-400 transition-colors shadow-sm"
            >
              <ArrowLeft className="size-3.5 text-cyan-400" />
              Voltar
            </Button>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-rose-500/15 border border-rose-500/30 px-2.5 py-0.5 text-[10px] font-bold text-rose-300 uppercase tracking-wider">
                Prioridade Imediata
              </span>
              <span className="text-[11px] font-mono text-muted-foreground">ID: {o.id}</span>
            </div>
          </div>
          <SheetHeader>
            <SheetTitle className="flex items-center gap-3">
              <div
                className="grid size-12 place-items-center rounded-xl text-lg font-bold border shrink-0"
                style={{
                  color: temp.color,
                  background: `color-mix(in oklab, ${temp.color} 14%, transparent)`,
                  borderColor: `color-mix(in oklab, ${temp.color} 35%, transparent)`,
                }}
                title={`${temp.label}: Score ${o.score}`}
              >
                {o.score}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xl font-bold truncate">{o.customer.name}</div>
                <SheetDescription className="flex items-center gap-2">
                  <span>{temp.emoji} {temp.label}</span>
                  <span>·</span>
                  <span>{o.product}</span>
                  <span>·</span>
                  <span>{o.store}</span>
                </SheetDescription>
              </div>
            </SheetTitle>
          </SheetHeader>
        </div>
        <div className="space-y-5 p-5">
          {waiting !== null && o.score >= 80 && (
            <div
              className={cn(
                "rounded-xl border p-4",
                waiting >= 10
                  ? "border-destructive/30 bg-destructive/10"
                  : "border-[color:var(--warm)]/30",
              )}
            >
              <div className="flex items-start gap-3">
                <AlertTriangle
                  className={cn(
                    "size-5",
                    waiting >= 10 ? "text-destructive" : "text-[color:var(--warm)]",
                  )}
                />
                <div className="flex-1">
                  <div className="font-semibold">
                    {waiting >= 10
                      ? "Oportunidade quente sem atendimento"
                      : "Atendimento exige atenção"}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">
                    Sem atendimento há {waiting} minutos.
                  </div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <Button size="sm" variant="outline" onClick={() => v.notifySeller(o.id)}>
                  Notificar responsável
                </Button>
                <Button size="sm" variant="destructive" onClick={() => v.escalate(o.id)}>
                  Escalar para gestor
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onClose}
                  className="gap-1.5 text-xs font-semibold border-border/80 hover:bg-surface-2"
                >
                  <ArrowLeft className="size-3.5 text-cyan-400" />
                  Voltar
                </Button>
              </div>
            </div>
          )}
          <section className="panel p-4">
            <h3 className="mb-4 text-sm font-semibold">Perfil da oportunidade</h3>
            <div className="grid grid-cols-2 gap-x-5 gap-y-4 sm:grid-cols-3">
              {[
                ["Produto desejado", `Honda ${o.product}`],
                ["Categoria", o.category],
                ["Forma de compra", o.method],
                ["Prazo", o.deadline],
                ["Parcela / orçamento", o.budget],
                ["Entrada", o.downPayment],
                ["Possui moto", o.hasBike ? "Sim" : "Não"],
                ["Moto atual", o.currentBike ?? "—"],
                ["Utiliza na negociação", o.tradeIn ? "Sim" : "Não"],
                ["Já fez simulação", o.simulated ? "Sim" : "Não"],
                ["Principal objeção", o.objection],
                ["Origem", o.source],
                ["Região", o.region || (o.state === "RS" ? "Rio Grande do Sul" : "Santa Catarina")],
                ["Loja de Atendimento", o.store],
                ["Cidade do Lead", o.city],
              ].map(([a, b]) => (
                <div key={a}>
                  <div className="text-[10px] uppercase tracking-wide text-muted-foreground">
                    {a}
                  </div>
                  <div className="mt-1 text-sm font-medium">{b}</div>
                </div>
              ))}
            </div>
          </section>
          <section className="rounded-xl border border-primary/30 bg-primary/5 p-4">
            <div className="mb-4 flex items-center gap-2 text-xs font-bold text-primary">
              <Sparkles className="size-4" />
              ROTA RECOMENDADA PELA VYNTRA
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-md bg-primary px-3 py-1.5 text-xs font-bold text-primary-foreground">
                {o.route.primary.toUpperCase()} — PRINCIPAL
              </span>
              <span className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold">
                {o.route.alternative.toUpperCase()} — ALTERNATIVA
              </span>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs">
              <span className="text-muted-foreground">Compatibilidade com orçamento:</span>
              <strong
                className={
                  o.route.budgetFit === "baixa" ? "text-destructive" : "text-[color:var(--success)]"
                }
              >
                {o.route.budgetFit}
              </strong>
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{o.route.rationale}</p>
            <div className="mt-3 text-[10px] leading-4 text-muted-foreground">
              Opção recomendada para avaliação. Aprovação real depende do processo autorizado da
              instituição financeira ou administradora.
            </div>
            <Button
              variant="outline"
              size="sm"
              className="mt-4"
              onClick={() => setRouteOpen(!routeOpen)}
            >
              <RouteIcon />
              Alterar rota
            </Button>
            {routeOpen && (
              <div className="mt-3 flex flex-wrap gap-2">
                {routes.map((r) => (
                  <Button
                    key={r}
                    size="sm"
                    variant={r === o.route.primary ? "default" : "secondary"}
                    onClick={() => {
                      v.changeRoute(o.id, r);
                      setRouteOpen(false);
                    }}
                  >
                    {r}
                  </Button>
                ))}
              </div>
            )}
          </section>
          <section className="panel p-4">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold">Vyntra Score</h3>
                <p className="text-xs text-muted-foreground">Motivos que formam a prioridade</p>
              </div>
              <ScoreRing score={o.score} />
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              {o.scoreReasons.slice(0, 6).map((r) => (
                <div key={r} className="flex items-start gap-2 text-xs text-muted-foreground">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-[color:var(--success)]" />
                  {r}
                </div>
              ))}
            </div>
          </section>
          <section className="panel p-4">
            <h3 className="mb-4 text-sm font-semibold">Responsável e status</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <Select value={o.sellerId} onValueChange={(x) => v.assignSeller(o.id, x)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {v.sellers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={o.status}
                onValueChange={(x) => v.setStatus(o.id, x as OpportunityStatus)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[
                    "Novo",
                    "Em atendimento",
                    "Follow-up",
                    "Aguardando cliente",
                    "Proposta enviada",
                    "Negociação",
                    "Venda",
                    "Perdida",
                  ].map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </section>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <Button variant="outline" onClick={() => v.simulateWhatsApp(o.id)}>
              <MessageCircle />
              WhatsApp
            </Button>
            <Button variant="outline" onClick={() => v.registerContact(o.id)}>
              <Phone />
              Registrar contato
            </Button>
            <Button onClick={() => v.sendProposal(o.id)}>
              <Send />
              Enviar proposta
            </Button>
            <Button
              variant="secondary"
              onClick={() => v.scheduleFollowUp(o.id, 24, "Retomar oportunidade")}
            >
              <CalendarClock />
              Follow-up
            </Button>
          </div>
          <div className="pt-4 flex items-center justify-between border-t border-border/60">
            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className="gap-2 text-xs font-semibold border-cyan-500/40 bg-cyan-950/15 hover:bg-cyan-500/20 hover:border-cyan-400 text-cyan-300"
            >
              <ArrowLeft className="size-3.5 text-cyan-400" />
              Voltar para o Painel do Gestor
            </Button>
            <span className="text-xs text-muted-foreground font-medium">Honda Via Passos</span>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function ScoreRing({ score, size = "md" }: { score: number; size?: "md" | "lg" }) {
  const m = TEMPERATURE_META[temperatureOf(score)];
  const d = size === "lg" ? 112 : 72;
  return (
    <div
      className="relative grid place-items-center rounded-full"
      style={{
        width: d,
        height: d,
        background: `conic-gradient(${m.color} ${score * 3.6}deg, var(--secondary) 0)`,
      }}
    >
      <div className="absolute rounded-full bg-surface" style={{ width: d - 10, height: d - 10 }} />
      <div className="relative text-center">
        <div className={cn("font-bold", size === "lg" ? "text-2xl" : "text-lg")} style={{ color: m.color }}>
          {score}
          <span className="text-[10px] text-muted-foreground font-normal">/100</span>
        </div>
        {size === "lg" && (
          <div className="text-[9px] font-bold tracking-wider" style={{ color: m.color }}>
            {m.label.toUpperCase()}
          </div>
        )}
      </div>
    </div>
  );
}
function Distribution({ setView }: { setView?: ((v: View) => void) | undefined }) {
  const v = useVyntra();
  const [isSimulating, setIsSimulating] = useState(false);

  const rules: Array<[keyof typeof v.distribution, string, string]> = [
    [
      "autoDistribution",
      "Distribuição automática e meritocrática",
      "Prioriza mais leads para vendedores com maior volume de vendas e taxa de conversão",
    ],
    ["byProduct", "Portfólio Completo", "Todos os consultores atendem todas as modalidades (0 km, consórcio, seminovas e financiamento)"],
    ["bySellerProfile", "Perfil e Eficiência", "Pondera experiência e taxa de conversão histórica"],
    ["byAvailability", "Disponibilidade Online", "Garante atendimento imediato para consultores ativos"],
    ["byWorkload", "Equilíbrio de Carga", "Evita gargalos sem prejudicar a fila prioritária dos top closers"],
    ["byPriority", "Prioridade para Leads Quentes", "Entrega leads Score 80+ imediatamente aos fechadores ouro"],
  ];

  // Ordenação meritocrática: mais fechamentos e maior conversão no topo
  const rankedSellers = useMemo(() => {
    return [...v.sellers].sort((a, b) => {
      const scoreA = a.sales * 20 + a.conversion * 2.5;
      const scoreB = b.sales * 20 + b.conversion * 2.5;
      return scoreB - scoreA;
    });
  }, [v.sellers]);

  // Simular distribuição ao vivo com base em fechamento
  const handleSimulateBatch = () => {
    setIsSimulating(true);
    const mockLeadNames = [
      "Honda CB 300F Twister (Lages / SC)",
      "Honda Bros 160 (Correia Pinto / SC)",
      "Honda PCX 160 (Capão Alto / SC)",
      "Consórcio Honda XRE 190 (Otacílio / SC)",
      "Honda Sahara 300 (Três Passos / RS)",
      "Honda Titan 160 (Santa Rosa / RS)",
      "Consórcio Honda CB 500F (Lages / SC)",
      "Honda Tornado 300 (Painel / SC)",
      "Honda Elite 125 (São José do Cerrito / SC)",
      "Consórcio Honda Biz 125 (Bocaina / SC)",
    ];

    const distributionCount: Record<string, number> = {};
    rankedSellers.forEach((s) => (distributionCount[s.name] = 0));

    mockLeadNames.forEach((_, idx) => {
      const isHot = idx % 3 === 0;
      const chosen = pickSellerByPerformance(v.sellers, v.distribution, isHot);
      distributionCount[chosen.name] = (distributionCount[chosen.name] || 0) + 1;
    });

    setTimeout(() => {
      setIsSimulating(false);
      const summary = Object.entries(distributionCount)
        .map(([name, qty]) => `${name.split(" ")[0]}: ${qty} leads`)
        .join(" · ");
      toast.success("10 novos leads distribuídos com sucesso por meritocracia!", {
        description: summary,
      });
    }, 500);
  };

  return (
    <>
      {setView && (
        <div className="mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setView("overview")}
            className="gap-2 text-xs font-semibold border-cyan-500/30 bg-cyan-950/20 hover:bg-cyan-500/20 hover:border-cyan-400 text-cyan-300 shadow-sm"
          >
            <ArrowLeft className="size-3.5 text-cyan-400" />
            Voltar para Visão Geral
          </Button>
        </div>
      )}
      <PageHeader
        title="Distribuição Inteligente & Roteamento Meritocrático"
        subtitle="Mais oportunidades direcionadas automaticamente aos consultores com maior taxa de conversão e histórico de fechamento."
        action={
          <Button
            onClick={handleSimulateBatch}
            disabled={isSimulating}
            className="gap-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold shadow-[0_0_20px_rgba(6,182,212,0.3)]"
          >
            <Zap className={cn("size-4", isSimulating && "animate-spin")} />
            {isSimulating ? "Simulando Distribuição..." : "Simular Entrada de 10 Leads"}
          </Button>
        }
      />

      {/* Banner de Meritocracia Comercial */}
      <div className="mb-5 rounded-xl border border-cyan-500/30 bg-gradient-to-r from-[#050c26] via-[#08173d] to-[#04091a] p-4 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="grid size-11 place-items-center rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 shrink-0">
              <Trophy className="size-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-foreground">Regra Meritocrática: Prioridade Absoluta por Fechamento de Vendas</h2>
                <span className="rounded-full bg-emerald-500/20 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  ● Algoritmo Ativo
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                Consultores com maior taxa de fechamento recebem até <strong className="text-cyan-300">3.5x mais leads</strong> e exclusividade na primeira rodada de oportunidades quentes (Score 80+).
                Atualmente liderado por <strong className="text-emerald-400">Francine (21% conv. · 5 vendas)</strong> e <strong className="text-cyan-300">Guilherme (18% conv. · 4 vendas)</strong>.
              </p>
            </div>
          </div>
        </div>

        {/* Barra Proporcional de Participação (Lead Share) */}
        <div className="mt-4 pt-3 border-t border-border/40">
          <div className="flex items-center justify-between text-xs text-muted-foreground mb-1.5 font-medium">
            <span>Participação Projetada no Volume de Novos Leads (Lead Share por Fechamento):</span>
            <span className="font-mono text-cyan-300">Francine 38% · Guilherme 29% · Vitor 20% · Gabriel 13%</span>
          </div>
          <div className="h-2.5 w-full rounded-full bg-slate-900 overflow-hidden flex border border-border/60">
            <div style={{ width: "38%" }} className="h-full bg-emerald-500" title="Francine (38%)" />
            <div style={{ width: "29%" }} className="h-full bg-cyan-500" title="Guilherme (29%)" />
            <div style={{ width: "20%" }} className="h-full bg-indigo-500" title="Vitor (20%)" />
            <div style={{ width: "13%" }} className="h-full bg-amber-500/80" title="Gabriel (13%)" />
          </div>
        </div>
      </div>

      {/* Grid de Consultores Ranqueados por Fechamento */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4 mb-5">
        {rankedSellers.map((s, rankIndex) => {
          const own = v.opportunities.filter(
            (o) => o.sellerId === s.id && !["Venda", "Perdida"].includes(o.status),
          );
          const hotCount = own.filter((o) => o.score >= 80).length;
          const rankTier = rankIndex === 0 ? "ouro" : rankIndex === 1 ? "prata" : rankIndex === 2 ? "bronze" : "capacitacao";

          return (
            <article
              key={s.id}
              className={cn(
                "panel relative p-4 transition-all duration-200 hover:border-primary/50",
                rankIndex === 0 && "border-emerald-500/40 bg-gradient-to-b from-emerald-950/15 to-surface/80 shadow-[0_0_20px_rgba(16,185,129,0.1)]",
                rankIndex === 1 && "border-cyan-500/40 bg-gradient-to-b from-cyan-950/15 to-surface/80",
              )}
            >
              {/* Badge de Posição de Fechamento */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "grid size-10 place-items-center rounded-lg font-bold text-sm",
                      rankTier === "ouro" && "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30",
                      rankTier === "prata" && "bg-cyan-500/20 text-cyan-400 border border-cyan-500/30",
                      rankTier === "bronze" && "bg-indigo-500/20 text-indigo-400 border border-indigo-500/30",
                      rankTier === "capacitacao" && "bg-secondary text-muted-foreground",
                    )}
                  >
                    {rankIndex === 0 ? "🥇" : rankIndex === 1 ? "🥈" : rankIndex === 2 ? "🥉" : `#${rankIndex + 1}`}
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm leading-tight text-foreground">{s.name}</h3>
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-1.5 py-0.2 text-[9px] font-bold border mt-0.5",
                        rankTier === "ouro" && "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
                        rankTier === "prata" && "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
                        rankTier === "bronze" && "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
                        rankTier === "capacitacao" && "bg-muted text-muted-foreground border-border",
                      )}
                    >
                      {rankTier === "ouro" && "Top Closer · Fila Ouro"}
                      {rankTier === "prata" && "Alto Fechamento · Prata"}
                      {rankTier === "bronze" && "Intermediário · Bronze"}
                      {rankTier === "capacitacao" && "Em Capacitação"}
                    </span>
                  </div>
                </div>
                <span
                  className={cn(
                    "text-[10px] font-semibold flex items-center gap-1",
                    s.online ? "text-[color:var(--success)]" : "text-muted-foreground",
                  )}
                >
                  <span className={cn("size-1.5 rounded-full", s.online ? "bg-emerald-400 animate-pulse" : "bg-muted-foreground")} />
                  {s.online ? "Online" : "Offline"}
                </span>
              </div>

              {/* Indicador de Conversão e Fechamento */}
              <div className="mt-3 rounded-lg border border-border/60 bg-surface-2/40 p-2.5">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground font-medium">Taxa de Conversão:</span>
                  <span className="font-bold text-foreground">{s.conversion}%</span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-background overflow-hidden">
                  <div
                    style={{ width: `${Math.min(100, s.conversion * 3.5)}%` }}
                    className={cn(
                      "h-full rounded-full",
                      s.conversion >= 20 ? "bg-emerald-400" : s.conversion >= 15 ? "bg-cyan-400" : "bg-indigo-400"
                    )}
                  />
                </div>
                <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                  <span>Vendas confirmadas: <strong className="text-foreground">{s.sales} un</strong></span>
                  <span className="text-cyan-300 font-medium">
                    Share: {rankIndex === 0 ? "38%" : rankIndex === 1 ? "29%" : rankIndex === 2 ? "20%" : "13%"}
                  </span>
                </div>
              </div>

              {/* Lojas Atendidas */}
              <div className="mt-3 flex flex-wrap gap-1 text-[10px] font-medium">
                <span className="rounded-md border border-border bg-surface-2 px-1.5 py-0.5" title="Loja Lages / SC">
                  Lages: <strong className="text-primary">{own.filter((o) => o.store === "Lages / SC").length}</strong>
                </span>
                <span className="rounded-md border border-border bg-surface-2 px-1.5 py-0.5" title="Loja Três Passos / RS">
                  Três Passos: <strong className="text-foreground">{own.filter((o) => o.store === "Três Passos / RS").length}</strong>
                </span>
                <span className="rounded-md border border-border bg-surface-2 px-1.5 py-0.5" title="Loja Santa Rosa / RS">
                  Santa Rosa: <strong className="text-foreground">{own.filter((o) => o.store === "Santa Rosa / RS").length}</strong>
                </span>
              </div>

              {/* Métricas do Vendedor */}
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border/60 pt-3 text-center">
                <div>
                  <strong className="block text-base text-foreground font-bold">{own.length}</strong>
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Leads Ativos</span>
                </div>
                <div>
                  <strong className="block text-base text-[color:var(--hot)] font-bold">{hotCount}</strong>
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Quentes</span>
                </div>
                <div>
                  <strong
                    className={cn(
                      "block text-base font-bold",
                      s.avgResponseMinutes >= 10 ? "text-destructive" : "text-emerald-400",
                    )}
                  >
                    {s.avgResponseMinutes}m
                  </strong>
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wider">Resposta</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Cartões Regionais: SC (Lages e região) e RS */}
      <div className="mb-5 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Região Santa Catarina (SC) · Concessionária Oficial
            </span>
            <span className="rounded-full bg-primary/20 px-2.5 py-0.5 text-xs font-bold text-primary">
              {v.opportunities.filter((o) => o.store === "Lages / SC").length} leads ativos
            </span>
          </div>
          <div className="mt-2 text-sm font-semibold text-foreground">Loja Central: Lages / SC</div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Cobertura regional: Lages, Capão Alto, Campo Belo, Correia Pinto, Palmeira, Bocaina, Painel, Otacílio, Ponte Alta, Cerro Negro e São José do Cerrito.
          </p>
          <div className="mt-3 flex flex-wrap gap-1">
            {LAGES_REGION_CITIES.map((c) => {
              const count = v.opportunities.filter((o) => o.city === c).length;
              return (
                <span
                  key={c}
                  className="inline-flex items-center gap-1 rounded-md border border-primary/25 bg-background/80 px-2 py-0.5 text-[10px] text-foreground"
                >
                  <span>{c}</span>
                  <span className="font-bold text-primary">({count})</span>
                </span>
              );
            })}
          </div>
        </div>
        <div className="rounded-xl border border-[color:var(--violet)]/30 bg-[color:color-mix(in_oklab,var(--violet)_5%,transparent)] p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[color:var(--violet)]">
              Região Rio Grande do Sul (RS) · Concessionárias Oficiais
            </span>
            <span className="rounded-full bg-[color:color-mix(in_oklab,var(--violet)_20%,transparent)] px-2.5 py-0.5 text-xs font-bold text-[color:var(--violet)]">
              {v.opportunities.filter((o) => o.state === "RS").length} leads ativos
            </span>
          </div>
          <div className="mt-2 text-sm font-semibold text-foreground">
            Lojas Centrais: Três Passos / RS ({v.opportunities.filter((o) => o.store === "Três Passos / RS").length}) · Santa Rosa / RS ({v.opportunities.filter((o) => o.store === "Santa Rosa / RS").length})
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Roteamento inteligente por proximidade entre Noroeste e Celeiro gaúcho, distribuindo com prioridade aos fechadores de cada concessionária.
          </p>
        </div>
      </div>

      {/* Regras de Distribuição & Fluxo */}
      <div className="grid gap-5 xl:grid-cols-[1fr_0.8fr]">
        <section className="panel p-5">
          <div className="flex items-center justify-between pb-3 border-b border-border/40">
            <div>
              <h2 className="font-semibold text-base">Regras de Roteamento Meritocrático</h2>
              <p className="text-xs text-muted-foreground">
                Ajuste os parâmetros de inteligência para equilibrar meritocracia e capacidade da equipe.
              </p>
            </div>
            <span className="rounded-md border border-cyan-500/30 bg-cyan-500/10 px-2 py-1 text-[10px] font-bold text-cyan-300">
              Score Ponderado
            </span>
          </div>
          <div className="mt-3 divide-y divide-border/60">
            {rules.map(([key, title, desc]) => (
              <div key={key} className="flex items-center justify-between gap-4 py-3.5">
                <div>
                  <div className="text-sm font-medium text-foreground">{title}</div>
                  <div className="mt-0.5 text-xs text-muted-foreground">{desc}</div>
                </div>
                <Switch
                  checked={v.distribution[key]}
                  onCheckedChange={() => v.toggleDistributionRule(key)}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="panel p-5">
          <div className="mb-4 flex items-center gap-2 pb-3 border-b border-border/40">
            <RouteIcon className="size-5 text-primary" />
            <h2 className="font-semibold text-base">Pipeline de Roteamento</h2>
          </div>
          {[
            "Vyntra recebe o lead via Webhook ou Simulador e calcula Lead Score",
            "Identifica a concessionária regional (Lages/SC ou Três Passos/Santa Rosa)",
            "Analisa o histórico de fechamento de cada vendedor ativo",
            "Atribui com peso meritocrático (Top Closers recebem mais oportunidades)",
            "Inicia timer de SLA de resposta de 5 minutos e monitora follow-ups",
          ].map((x, i) => (
            <div key={x} className="flex gap-3 pb-4 last:pb-0">
              <div className="relative grid size-7 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                {i + 1}
                {i < 4 && <span className="absolute top-7 h-5 w-px bg-border" />}
              </div>
              <div className="pt-0.5 text-xs leading-relaxed text-muted-foreground">
                <strong className="text-foreground">{x.split(" ")[0]} {x.split(" ")[1]}</strong> {x.split(" ").slice(2).join(" ")}
              </div>
            </div>
          ))}
        </section>
      </div>
    </>
  );
}

function FollowUps({ setSelected }: { setSelected: (id: string) => void }) {
  const v = useVyntra();
  const isSeller = v.role === "vendedor";
  const active = v.followUps.filter((f) => {
    if (f.done) return false;
    if (isSeller) {
      const opp = v.opportunityById(f.opportunityId);
      return opp?.sellerId === v.currentSellerId;
    }
    return true;
  });
  const buckets: Array<[FollowUpBucket, string, string]> = [
    ["atrasado", "Atrasados", "text-destructive"],
    ["hoje", "Hoje", "text-primary"],
    ["amanha", "Amanhã", "text-cyan-400"],
    ["proximos", "Próximos dias", "text-muted-foreground"],
  ];
  return (
    <>
      <PageHeader
        title={isSeller ? "Meus Follow-ups" : "Follow-ups"}
        subtitle={
          isSeller
            ? "Suas próximas ações organizadas por urgência e prazo com o cliente."
            : "Próximas ações organizadas por urgência e potencial comercial."
        }
        action={
          <Button onClick={() => toast("Selecione uma oportunidade para agendar um follow-up.")}>
            <Plus />
            Agendar
          </Button>
        }
      />
      <div className="mb-5 grid grid-cols-3 gap-3">
        <Kpi
          label="Atrasados"
          value={String(active.filter((f) => bucketOf(f, v.now) === "atrasado").length)}
          danger
          icon={AlertTriangle}
        />
        <Kpi
          label="Para hoje"
          value={String(active.filter((f) => bucketOf(f, v.now) === "hoje").length)}
          icon={CalendarClock}
        />
        <Kpi
          label="Amanhã"
          value={String(active.filter((f) => bucketOf(f, v.now) === "amanha").length)}
          icon={Clock3}
        />
      </div>
      <div className="grid gap-4 xl:grid-cols-4">
        {buckets.map(([key, label, color]) => {
          const items = active.filter((f) => bucketOf(f, v.now) === key);
          return (
            <section key={key} className="rounded-xl border border-border bg-surface/40 p-3">
              <div className="mb-3 flex items-center justify-between px-1">
                <h2 className={cn("text-sm font-semibold", color)}>{label}</h2>
                <span className="grid size-6 place-items-center rounded-full bg-secondary text-[10px]">
                  {items.length}
                </span>
              </div>
              <div className="space-y-3">
                {items.map((f) => {
                  const o = v.opportunityById(f.opportunityId);
                  if (!o) return null;
                  return (
                    <article key={f.id} className="rounded-lg border border-border bg-surface p-3">
                      <button onClick={() => setSelected(o.id)} className="w-full text-left">
                        <div className="flex items-center gap-2">
                          <ScoreMini score={o.score} />
                          <div>
                            <div className="text-sm font-semibold">{o.customer.name}</div>
                            <div className="text-xs text-muted-foreground">{o.product}</div>
                          </div>
                        </div>
                        <p className="mt-3 text-xs leading-5">{f.action}</p>
                        <div className="mt-2 text-[10px] text-muted-foreground">
                          Último contato: {relativeTime(o.lastContactAt, v.now)}
                        </div>
                        <div className="mt-1 text-[10px] text-muted-foreground">
                          {relativeTime(f.dueAt, v.now)}
                        </div>
                      </button>
                      <div className="mt-3 grid grid-cols-2 gap-1">
                        <Button size="sm" onClick={() => v.completeFollowUp(f.id)}>
                          <Check />
                          Concluir
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => v.rescheduleFollowUp(f.id, 24)}
                        >
                          <RefreshCw />
                          Reagendar
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => v.simulateWhatsApp(o.id)}>
                          <MessageCircle />
                          WhatsApp
                        </Button>
                        <Button size="sm" variant="ghost" onClick={() => v.registerContact(o.id)}>
                          <Phone />
                          Ligar
                        </Button>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </>
  );
}

function Proposals({ setSelected }: { setSelected: (id: string) => void }) {
  const v = useVyntra();
  const isSeller = v.role === "vendedor";
  const [selectedFilter, setSelectedFilter] = useState<"ativas" | "todas" | "fechadas" | "perdidas">("ativas");

  const allSellerProposals = isSeller
    ? v.proposals.filter((p) => p.sellerId === v.currentSellerId)
    : v.proposals;

  const stages = [
    "Rascunho",
    "Enviada",
    "Visualizada",
    "Aguardando retorno",
    "Negociação",
    "Fechada",
    "Perdida",
  ] as const;

  const activeStages =
    selectedFilter === "ativas"
      ? (["Rascunho", "Enviada", "Visualizada", "Aguardando retorno", "Negociação"] as const)
      : selectedFilter === "fechadas"
        ? (["Fechada"] as const)
        : selectedFilter === "perdidas"
          ? (["Perdida"] as const)
          : stages;

  const displayedProposals =
    selectedFilter === "ativas"
      ? allSellerProposals.filter((p) => !["Fechada", "Perdida"].includes(p.status))
      : selectedFilter === "fechadas"
        ? allSellerProposals.filter((p) => p.status === "Fechada")
        : selectedFilter === "perdidas"
          ? allSellerProposals.filter((p) => p.status === "Perdida")
          : allSellerProposals;

  const volumeEmNegociacao = allSellerProposals
    .filter((p) => !["Fechada", "Perdida"].includes(p.status))
    .reduce((a, p) => a + p.value, 0);

  return (
    <>
      <PageHeader
        title={isSeller ? "Minhas Propostas" : "Propostas"}
        subtitle={
          isSeller
            ? "Acompanhe e avance suas condições comerciais até o fechamento."
            : "Acompanhe cada condição enviada até o fechamento."
        }
        action={
          <div className="flex flex-wrap items-center gap-3">
            <div className="rounded-xl border border-cyan-500/20 bg-[#060c20]/80 px-3.5 py-1.5 text-xs backdrop-blur-sm">
              <span className="text-muted-foreground">Volume em negociação: </span>
              <strong className="text-cyan-400 font-bold">{BRL(volumeEmNegociacao)}</strong>
            </div>
          </div>
        }
      />

      {/* Barra de Resumo das Etapas com Scroll Horizontal Estilizado */}
      <div className="mb-5 relative">
        <div className="flex gap-3 overflow-x-auto pb-2.5 pt-1 proposals-scroll">
          {stages.map((s) => {
            const count = allSellerProposals.filter((p) => p.status === s).length;
            const isClosing = s === "Fechada";
            const isLost = s === "Perdida";
            return (
              <div
                key={s}
                className={cn(
                  "min-w-[155px] shrink-0 rounded-xl border p-3 transition-all duration-200 backdrop-blur-sm",
                  isClosing
                    ? "border-emerald-500/30 bg-emerald-950/20 hover:border-emerald-500/50"
                    : isLost
                      ? "border-destructive/30 bg-destructive/10 hover:border-destructive/50"
                      : "border-cyan-500/20 bg-[#060b1e]/80 hover:border-cyan-400/50 hover:bg-[#09112e]/90 shadow-sm",
                )}
              >
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className={cn(isClosing && "text-emerald-400 font-medium", isLost && "text-destructive font-medium")}>
                    {s}
                  </span>
                  <span className="size-1.5 rounded-full bg-cyan-400" />
                </div>
                <div className="mt-1.5 flex items-baseline justify-between">
                  <span className="text-2xl font-bold tracking-tight text-foreground">{count}</span>
                  <span className="text-[10px] text-muted-foreground">
                    {count === 1 ? "proposta" : "propostas"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Barra de Controles e Indicador de Scroll da Pipeline */}
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {/* Filtro de Visão */}
        <div className="inline-flex rounded-lg border border-cyan-500/20 bg-[#060c20] p-1 text-xs">
          <button
            type="button"
            onClick={() => setSelectedFilter("ativas")}
            className={cn(
              "px-3 py-1.5 rounded-md font-medium transition-all",
              selectedFilter === "ativas"
                ? "bg-cyan-500 text-white shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Em andamento (5 etapas)
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter("fechadas")}
            className={cn(
              "px-3 py-1.5 rounded-md font-medium transition-all",
              selectedFilter === "fechadas"
                ? "bg-emerald-600 text-white shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Fechadas
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter("perdidas")}
            className={cn(
              "px-3 py-1.5 rounded-md font-medium transition-all",
              selectedFilter === "perdidas"
                ? "bg-destructive text-white shadow-sm font-semibold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Perdidas
          </button>
          <button
            type="button"
            onClick={() => setSelectedFilter("todas")}
            className={cn(
              "px-3 py-1.5 rounded-md font-medium transition-all",
              selectedFilter === "todas"
                ? "bg-cyan-500/20 text-cyan-300 font-semibold"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            Todas as etapas
          </button>
        </div>

        {/* Indicador visual de rolagem horizontal */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span className="size-1.5 rounded-full bg-cyan-400 animate-pulse" />
          <span>Pipeline Kanban</span>
          <span className="hidden sm:inline-block text-[11px] text-cyan-400/80">
            · Deslize horizontalmente para navegar
          </span>
          <ArrowRight className="size-3 text-cyan-400" />
        </div>
      </div>

      {/* Pipeline Kanban com Scroll Horizontal Suave e Scroll Vertical Interno por Coluna */}
      <div className="relative">
        <div className="flex gap-4 overflow-x-auto pb-6 pt-1 proposals-scroll snap-x">
          {activeStages.map((stage) => {
            const stageProposals = displayedProposals.filter((p) => p.status === stage);
            const isClosing = stage === "Fechada";
            const isLost = stage === "Perdida";

            return (
              <section
                key={stage}
                className={cn(
                  "w-[305px] sm:w-[325px] lg:w-[340px] shrink-0 snap-start flex flex-col rounded-xl border p-3.5 backdrop-blur-md transition-all",
                  isClosing
                    ? "border-emerald-500/30 bg-[#051515]/70"
                    : isLost
                      ? "border-destructive/30 bg-[#160a0a]/70"
                      : "border-cyan-500/20 bg-[#070d22]/70 hover:border-cyan-500/40 shadow-lg",
                )}
              >
                {/* Cabeçalho da Coluna com Contador */}
                <div className="mb-3 flex items-center justify-between border-b border-border/40 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "size-2 rounded-full",
                        isClosing ? "bg-emerald-400" : isLost ? "bg-destructive" : "bg-cyan-400",
                      )}
                    />
                    <h2 className="text-sm font-semibold text-foreground tracking-wide">{stage}</h2>
                  </div>
                  <span
                    className={cn(
                      "grid size-6 place-items-center rounded-full text-xs font-bold border",
                      isClosing
                        ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                        : isLost
                          ? "bg-destructive/10 border-destructive/30 text-destructive"
                          : "bg-cyan-500/10 border-cyan-500/25 text-cyan-400",
                    )}
                  >
                    {stageProposals.length}
                  </span>
                </div>

                {/* Lista de Cards com Scrollbar Vertical Interna Suave */}
                <div className="space-y-3 max-h-[calc(100vh-340px)] min-h-[160px] overflow-y-auto pr-1 column-scroll flex-1">
                  {stageProposals.length === 0 ? (
                    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/50 p-6 text-center text-xs text-muted-foreground my-auto">
                      <FileText className="size-6 text-muted-foreground/30 mb-2" />
                      <span>Nenhuma proposta nesta etapa</span>
                    </div>
                  ) : (
                    stageProposals.map((p) => {
                      const o = v.opportunityById(p.opportunityId);
                      if (!o) return null;
                      return (
                        <article
                          key={p.id}
                          className="rounded-lg border border-border/60 bg-[#09112a]/95 p-3.5 transition-all duration-200 hover:border-cyan-400/50 hover:shadow-[0_0_16px_rgba(6,182,212,0.2)] hover:-translate-y-0.5"
                        >
                          <button className="w-full text-left" onClick={() => setSelected(o.id)}>
                            <div className="flex items-start justify-between gap-2">
                              <div className="text-sm font-semibold text-foreground hover:text-cyan-300 transition-colors">
                                {o.customer.name}
                              </div>
                              <span className="shrink-0 text-[10px] font-medium text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 rounded-full">
                                {p.method}
                              </span>
                            </div>
                            <div className="mt-1 text-xs text-muted-foreground">
                              {o.product} · {o.store}
                            </div>
                            <div className="mt-3 flex items-baseline justify-between">
                              <div className="text-lg font-bold text-foreground">{BRL(p.value)}</div>
                              <div className="text-[11px] text-muted-foreground font-medium">
                                {p.installment ? `Parc. ${BRL(p.installment)}` : "À vista"}
                              </div>
                            </div>
                            <div className="mt-2 text-[10px] text-muted-foreground flex items-center justify-between border-t border-border/30 pt-1.5">
                              <span>Consultor: {v.sellerById(p.sellerId)?.name}</span>
                              <span>{relativeTime(p.createdAt)}</span>
                            </div>
                          </button>

                          {/* Ações de Avanço do Funil */}
                          {!["Fechada", "Perdida"].includes(stage) && (
                            <div className="mt-3 flex gap-1.5 border-t border-border/30 pt-2.5">
                              <Button
                                size="sm"
                                variant="secondary"
                                className="flex-1 text-xs h-8 bg-cyan-500/10 hover:bg-cyan-500/25 text-cyan-300 border border-cyan-500/20"
                                onClick={() => {
                                  const i = stages.indexOf(stage);
                                  const next = stages[Math.min(i + 1, 5)];
                                  if (next) v.setProposalStatus(p.id, next);
                                }}
                              >
                                Avançar etapa <ArrowRight className="size-3.5 ml-1" />
                              </Button>
                            </div>
                          )}
                        </article>
                      );
                    })
                  )}
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </>
  );
}

function Team() {
  const v = useVyntra();
  const [selected, setSelected] = useState<string | null>(null);
  const seller = selected ? v.sellerById(selected) : undefined;
  return (
    <>
      <PageHeader
        title="Equipe comercial"
        subtitle="Performance, disponibilidade e velocidade de atendimento dos vendedores."
      />
      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead>
              <tr className="border-b border-border text-[10px] uppercase text-muted-foreground">
                {[
                  "Vendedor",
                  "Status",
                  "Oportunidades",
                  "Quentes",
                  "Tempo de resposta",
                  "Conversão",
                  "Vendas",
                  "",
                ].map((x) => (
                  <th key={x} className="px-5 py-3">
                    {x}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {v.sellers.map((s) => {
                const own = v.opportunities.filter((o) => o.sellerId === s.id);
                return (
                  <tr key={s.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-4">
                      <div className="font-medium text-foreground">{s.name}</div>
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={
                          s.online ? "text-[color:var(--success)]" : "text-muted-foreground"
                        }
                      >
                        ● {s.online ? "Online" : "Offline"}
                      </span>
                    </td>
                    <td className="px-5 py-4">{own.length}</td>
                    <td className="px-5 py-4 font-semibold text-[color:var(--hot)]">
                      {own.filter((o) => o.score >= 80).length}
                    </td>
                    <td
                      className={cn("px-5 py-4", s.avgResponseMinutes >= 10 && "text-destructive")}
                    >
                      {s.avgResponseMinutes} min
                    </td>
                    <td className="px-5 py-4">{s.conversion}%</td>
                    <td className="px-5 py-4">{s.sales} vendas</td>
                    <td className="px-5 py-4">
                      <Button variant="ghost" size="sm" onClick={() => setSelected(s.id)}>
                        Ver desempenho
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {seller && (
        <div className="mt-5 grid gap-4 lg:grid-cols-[0.7fr_1.3fr]">
          <section className="panel p-5">
            <div className="flex items-center gap-3">
              <div className="grid size-12 place-items-center rounded-xl bg-primary/15 text-primary">
                {seller.name
                  .split(" ")
                  .map((x) => x[0])
                  .join("")
                  .slice(0, 2)}
              </div>
              <div>
                <h2 className="font-semibold">{seller.name}</h2>
                <p className="text-xs text-muted-foreground">Consultor Comercial</p>
              </div>
            </div>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <Kpi label="Conversão" value={`${seller.conversion}%`} icon={TrendingUp} />
              <Kpi label="Vendas" value={String(seller.sales)} icon={Check} />
            </div>
          </section>
          <section className="panel p-5">
            <h2 className="font-semibold">Indicadores de desempenho</h2>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart
                data={[
                  { n: "Resposta", v: Math.max(5, 100 - seller.avgResponseMinutes * 4) },
                  { n: "Conversão", v: seller.conversion * 4 },
                  { n: "Atividade", v: seller.online ? 88 : 45 },
                  { n: "Follow-up", v: 72 },
                ]}
              >
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="n" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis hide />
                <ChartTooltip
                  contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)" }}
                />
                <Bar dataKey="v" fill="var(--primary)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </section>
        </div>
      )}
    </>
  );
}
function Insights({
  setView,
  setSelected,
}: {
  setView?: (v: View) => void;
  setSelected?: (v: string | null) => void;
}) {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, []);

  const [period, setPeriod] = useState<"30d" | "15d" | "7d">("30d");
  const [activeTab, setActiveTab] = useState<"losses" | "funnel" | "regional">("losses");

  // Detailed Loss Reasons Data with Monetary and Playbook metadata
  const lossData = [
    {
      n: "Parcela incompatível",
      v: 35,
      amount: 280000,
      color: "oklch(0.72 0.19 148)", // emerald/green
      badge: "Rota Seminova",
      action: "Orçamento aquém da 0 km: direcionar para motos seminovas certificadas.",
    },
    {
      n: "Sem entrada imediata",
      v: 24,
      amount: 192000,
      color: "oklch(0.82 0.17 85)", // golden amber
      badge: "Consórcio Honda",
      action: "Ativação de cota de consórcio sem entrada e parcelas reduzidas.",
    },
    {
      n: "Cliente não respondeu (SLA)",
      v: 18,
      amount: 144000,
      color: "oklch(0.86 0.17 95)", // bright yellow
      badge: "Trava de SLA",
      action: "Tempo de primeiro contato excedeu 10 minutos; esfriamento acelerado.",
    },
    {
      n: "Restrição / Crédito reprovado",
      v: 12,
      amount: 96000,
      color: "oklch(0.65 0.17 295)", // violet
      badge: "Consórcio Nacional",
      action: "Consórcio Honda não exige consulta prévia para adesão da cota.",
    },
    {
      n: "Comprou concorrente (Yamaha)",
      v: 7,
      amount: 56000,
      color: "oklch(0.64 0.22 25)", // red
      badge: "Agilidade",
      action: "Perda por falta de proposta formal no primeiro dia útil do lead.",
    },
    {
      n: "Outros motivos / Desistência",
      v: 4,
      amount: 32000,
      color: "oklch(0.7 0.022 258)", // muted
      badge: "Follow-up",
      action: "Adiar compra para momento futuro ou mudança de prioridade.",
    },
  ];

  const totalLossValue = lossData.reduce((acc, x) => acc + x.amount, 0);

  // Conversion Funnel Data
  const funnelStages = [
    {
      stage: "1. Qualificação Vyntra",
      count: 168,
      pct: 100,
      conversion: 94,
      drop: 6,
      desc: "Leads identificados por Score comercial e intenção de compra",
      tone: "from-cyan-500 to-blue-600",
    },
    {
      stage: "2. Primeiro Contato (SLA <5m)",
      count: 158,
      pct: 94,
      conversion: 68,
      drop: 26,
      desc: "Abordagem rápida via WhatsApp/Ligação pela equipe de vendas",
      tone: "from-blue-500 to-indigo-600",
    },
    {
      stage: "3. Envio de Proposta / Simulação",
      count: 107,
      pct: 64,
      conversion: 62,
      drop: 38,
      desc: "Simulação de 0 km, Consórcio ou Seminova com entrada flexível",
      tone: "from-indigo-500 to-purple-600",
    },
    {
      stage: "4. Negociação & Fechamento",
      count: 66,
      pct: 39,
      conversion: 59,
      drop: 41,
      desc: "Aprovação de crédito, assinatura de cota ou entrega da moto",
      tone: "from-emerald-500 to-teal-500",
    },
  ];

  // Regional Dealerships Performance
  const regionalStores = [
    {
      name: "Passos Honda Lages / SC",
      region: "Serra Catarinense",
      sla: "7 min",
      conversion: "34%",
      sales: 42,
      leads: 124,
      health: "Excelente",
      healthTone: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
      topRoute: "Honda 0 km & Consórcio",
    },
    {
      name: "Passos Honda Três Passos / RS",
      region: "Noroeste Gaúcho",
      sla: "9 min",
      conversion: "29%",
      sales: 28,
      leads: 97,
      health: "Estável",
      healthTone: "text-cyan-400 bg-cyan-500/10 border-cyan-500/30",
      topRoute: "Seminovas & Financiamento",
    },
    {
      name: "Passos Honda Santa Rosa / RS",
      region: "Missões / Região Noroeste",
      sla: "11 min",
      conversion: "25%",
      sales: 22,
      leads: 88,
      health: "Atenção SLA",
      healthTone: "text-amber-400 bg-amber-500/10 border-amber-500/30",
      topRoute: "Consórcio & Financiamento",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Hero Header Executivo de Inteligência */}
      <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-[#061329]/95 via-[#0a1835]/80 to-[#040816]/95 p-5 sm:p-6 shadow-[0_0_40px_rgba(6,182,212,0.12)]">
        <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-cyan-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 -bottom-20 size-72 rounded-full bg-violet-600/15 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/40 bg-cyan-500/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                <Sparkles className="size-3 text-cyan-300 animate-pulse" />
                Vyntra Cognitive Engine 4.2
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
                Diagnóstico em Tempo Real
              </span>
              <span className="rounded-full border border-border/60 bg-surface-2/60 px-2.5 py-0.5 text-[10px] font-medium text-slate-300">
                Rede Passos Honda
              </span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-foreground">
              Diagnósticos & Insights Estratégicos
            </h1>
            <p className="mt-1 max-w-2xl text-xs sm:text-sm text-slate-300 leading-relaxed">
              Mapeamento analítico de gargalos de atendimento, motivos reais de perda e planos de reversão comercial para as unidades de SC e RS.
            </p>
          </div>

          {/* Controles de Período e Ações */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex rounded-xl border border-border/70 bg-surface-2/80 p-1 backdrop-blur-md">
              <button
                onClick={() => setPeriod("30d")}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                  period === "30d"
                    ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Últimos 30 dias
              </button>
              <button
                onClick={() => setPeriod("15d")}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                  period === "15d"
                    ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                15 dias
              </button>
              <button
                onClick={() => setPeriod("7d")}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-semibold transition-all",
                  period === "7d"
                    ? "bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/30"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                7 dias
              </button>
            </div>
            {setView && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setView("impact")}
                className="h-9 border-cyan-500/40 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 text-xs font-semibold"
              >
                <Zap className="mr-1.5 size-3.5" />
                Simulador de Impacto
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* 4 Cards de Métricas Executivas com Glow e Status */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Receita Recuperável */}
        <div className="group relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-[#061814]/90 to-[#04100c]/90 p-4 transition-all duration-300 hover:border-emerald-500/60 hover:shadow-[0_0_30px_rgba(16,185,129,0.18)]">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-300">Receita Recuperável</span>
            <div className="grid size-8 place-items-center rounded-lg border border-emerald-500/40 bg-emerald-500/15 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
              <Coins className="size-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-black tracking-tight text-foreground">
            {BRL(496000)}
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1 font-semibold text-emerald-400">
              <TrendingUp className="size-3" />
              62% das perdas
            </span>
            <span className="text-muted-foreground">via Consórcio / Seminova</span>
          </div>
        </div>

        {/* Card 2: Gargalo Crítico #1 */}
        <div className="group relative overflow-hidden rounded-2xl border border-rose-500/30 bg-gradient-to-b from-[#1c0a12]/90 to-[#10050c]/90 p-4 transition-all duration-300 hover:border-rose-500/60 hover:shadow-[0_0_30px_rgba(244,63,94,0.18)]">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-300">Gargalo Crítico #1</span>
            <div className="grid size-8 place-items-center rounded-lg border border-rose-500/40 bg-rose-500/15 text-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.25)]">
              <Clock3 className="size-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-black tracking-tight text-rose-300">
            SLA &gt; 10 min
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1 font-semibold text-rose-400">
              <AlertTriangle className="size-3" />
              64% das perdas
            </span>
            <span className="text-muted-foreground">esfriamento rápido</span>
          </div>
        </div>

        {/* Card 3: Alavanca Consórcio */}
        <div className="group relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-b from-[#1c1408]/90 to-[#100a04]/90 p-4 transition-all duration-300 hover:border-amber-500/60 hover:shadow-[0_0_30px_rgba(245,158,11,0.18)]">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-300">Alavanca de Tração</span>
            <div className="grid size-8 place-items-center rounded-lg border border-amber-500/40 bg-amber-500/15 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.25)]">
              <Sparkles className="size-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-black tracking-tight text-amber-300">
            +32% Avanço
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1 font-semibold text-amber-400">
              <CheckCircle2 className="size-3" />
              Consórcio Honda
            </span>
            <span className="text-muted-foreground">sem barreira de entrada</span>
          </div>
        </div>

        {/* Card 4: Score Médio de Conversão */}
        <div className="group relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-[#061828]/90 to-[#040e1a]/90 p-4 transition-all duration-300 hover:border-cyan-500/60 hover:shadow-[0_0_30px_rgba(6,182,212,0.18)]">
          <div className="flex items-start justify-between">
            <span className="text-xs font-semibold text-slate-300">Score de Conversão</span>
            <div className="grid size-8 place-items-center rounded-lg border border-cyan-500/40 bg-cyan-500/15 text-cyan-300 shadow-[0_0_12px_rgba(6,182,212,0.25)]">
              <Target className="size-4" />
            </div>
          </div>
          <div className="mt-3 text-2xl sm:text-3xl font-black tracking-tight text-cyan-300">
            82 Pontos
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1 font-semibold text-cyan-400">
              <TrendingUp className="size-3" />
              4.2x mais vendas
            </span>
            <span className="text-muted-foreground">em leads Quentes</span>
          </div>
        </div>
      </div>

      {/* Navegação por Abas de Diagnóstico */}
      <div className="flex items-center gap-2 border-b border-border/60 pb-3">
        <button
          onClick={() => setActiveTab("losses")}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all border",
            activeTab === "losses"
              ? "border-cyan-500/50 bg-cyan-500/15 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-surface-2/60",
          )}
        >
          <Coins className="size-3.5" />
          Raio-X de Motivos de Perda & Dinheiro em Risco
        </button>
        <button
          onClick={() => setActiveTab("funnel")}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all border",
            activeTab === "funnel"
              ? "border-cyan-500/50 bg-cyan-500/15 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-surface-2/60",
          )}
        >
          <Activity className="size-3.5" />
          Gargalos no Funil de Vendas
        </button>
        <button
          onClick={() => setActiveTab("regional")}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all border",
            activeTab === "regional"
              ? "border-cyan-500/50 bg-cyan-500/15 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.15)]"
              : "border-transparent text-muted-foreground hover:text-foreground hover:bg-surface-2/60",
          )}
        >
          <MapPin className="size-3.5" />
          Desempenho por Concessionária
        </button>
      </div>

      {/* ABA 1: RAIO-X DE PERDAS & DINHEIRO EM RISCO */}
      {activeTab === "losses" && (
        <div className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
          {/* Coluna Esquerda: Lista Detalhada dos Motivos de Perda com Ações de Reversão */}
          <section className="rounded-2xl border border-border/60 bg-gradient-to-b from-surface/85 to-surface-2/45 p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div>
                <h2 className="text-base font-bold text-foreground">
                  Motivos de Perda & Rotas de Reversão
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Auditoria de 105 oportunidades perdidas nos últimos 30 dias na rede Via Passos
                </p>
              </div>
              <span className="rounded-lg bg-surface-2 px-2.5 py-1 font-mono text-xs font-bold text-cyan-300 border border-cyan-500/30">
                Total Auditado: {BRL(totalLossValue)}
              </span>
            </div>

            <div className="space-y-3 pt-1">
              {lossData.map((item) => (
                <div
                  key={item.n}
                  className="rounded-xl border border-border/60 bg-[#070e20]/60 p-3.5 transition-all hover:border-cyan-500/40 hover:bg-[#0a142c]/80"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="size-2.5 rounded-full shrink-0 shadow-[0_0_8px_currentColor]"
                        style={{ color: item.color, background: item.color }}
                      />
                      <strong className="text-sm font-semibold text-foreground">{item.n}</strong>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="rounded bg-surface-2 px-2 py-0.5 font-mono text-xs font-bold text-foreground border border-border/50">
                        {item.v}%
                      </span>
                      <span className="font-mono text-xs font-bold text-rose-300">
                        {BRL(item.amount)}
                      </span>
                      <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                        {item.badge}
                      </span>
                    </div>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="mt-2.5 h-2 overflow-hidden rounded-full bg-secondary/80 border border-border/30">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.v}%`,
                        background: item.color,
                      }}
                    />
                  </div>

                  {/* Recomendação de Reversão da IA */}
                  <div className="mt-2 flex items-start gap-2 text-xs text-slate-300">
                    <Sparkles className="mt-0.5 size-3 text-cyan-300 shrink-0" />
                    <span>
                      <strong className="text-cyan-300">Reversão Vyntra:</strong> {item.action}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Coluna Direita: Gráfico de Rosca com Centro Informativo */}
          <section className="rounded-2xl border border-border/60 bg-gradient-to-b from-surface/85 to-surface-2/45 p-5 sm:p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold text-foreground">Distribuição Proporcional</h2>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Impacto percentual por categoria
                  </p>
                </div>
                <div className="rounded-full border border-primary/30 bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary">
                  Perdas Auditadas
                </div>
              </div>

              {/* Rosca com Centro Resumido */}
              <div className="relative mt-4 h-[240px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={lossData}
                      dataKey="v"
                      nameKey="n"
                      innerRadius={65}
                      outerRadius={95}
                      paddingAngle={3}
                    >
                      {lossData.map((x, i) => (
                        <Cell key={i} fill={x.color} stroke="var(--surface)" strokeWidth={2} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length && payload[0]) {
                          const data = payload[0].payload as (typeof lossData)[number];
                          if (!data) return null;
                          return (
                            <div className="rounded-xl border border-border bg-popover p-2.5 shadow-xl text-xs">
                              <div className="font-bold text-foreground">{data.n}</div>
                              <div className="text-cyan-400 font-mono mt-0.5">
                                {data.v}% ({BRL(data.amount)})
                              </div>
                              <div className="text-[10px] text-muted-foreground mt-1">
                                {data.badge}
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Centro da Rosca */}
                <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="font-mono text-xs font-bold text-muted-foreground">TOTAL</span>
                  <span className="font-mono text-base font-black text-foreground">
                    {BRL(totalLossValue)}
                  </span>
                  <span className="text-[10px] text-cyan-400 font-semibold">105 Casos</span>
                </div>
              </div>

              {/* Legenda Customizada em Grid */}
              <div className="mt-4 grid grid-cols-1 gap-2 border-t border-border/50 pt-4">
                {lossData.map((x) => (
                  <div
                    key={x.n}
                    className="flex items-center justify-between text-xs rounded-lg px-2 py-1 bg-surface-2/30"
                  >
                    <div className="flex items-center gap-2">
                      <span className="size-2 rounded-full" style={{ background: x.color }} />
                      <span className="text-muted-foreground truncate max-w-[170px]">{x.n}</span>
                    </div>
                    <strong className="font-mono text-foreground">{x.v}%</strong>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-5 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-xs leading-relaxed text-slate-200">
              <strong className="text-amber-300 font-semibold">Alerta da IA:</strong> 59% das
              perdas são recuperáveis através do redirecionamento imediato para Consórcio Nacional
              ou Seminovas no primeiro atendimento.
            </div>
          </section>
        </div>
      )}

      {/* ABA 2: GARGALOS NO FUNIL DE VENDAS */}
      {activeTab === "funnel" && (
        <div className="space-y-5">
          <section className="rounded-2xl border border-border/60 bg-gradient-to-b from-surface/85 to-surface-2/45 p-5 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/50 pb-4">
              <div>
                <h2 className="text-base font-bold text-foreground">
                  Diagnóstico de Fricção no Funil de Conversão
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Acompanhe a taxa de avanço entre cada etapa e identifique onde a rede Passos perde volume
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/15 border border-rose-500/30 px-2 py-1 text-[11px] font-bold text-rose-300">
                  Maior Atrito: Etapa 2 → 3 (-26%)
                </span>
              </div>
            </div>

            {/* Visualização de Etapas do Funil com Barras Gradientes */}
            <div className="mt-6 space-y-5">
              {funnelStages.map((st, i) => (
                <div key={st.stage} className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 rounded px-1.5 py-0.5">
                        0{i + 1}
                      </span>
                      <strong className="text-sm font-semibold text-foreground">{st.stage}</strong>
                    </div>
                    <div className="flex items-center gap-3 font-mono text-xs">
                      <span className="text-muted-foreground">
                        Volume: <strong>{st.count} leads</strong>
                      </span>
                      <span className="text-foreground font-bold">Taxa: {st.pct}%</span>
                      {st.drop > 0 && (
                        <span className="text-rose-400 font-bold bg-rose-500/10 border border-rose-500/25 rounded px-1.5 py-0.5 text-[10px]">
                          Perda: -{st.drop}%
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="h-3.5 overflow-hidden rounded-full bg-secondary/80 border border-border/40 p-0.5">
                    <div
                      className={cn(
                        "h-full rounded-full bg-gradient-to-r transition-all duration-700 shadow-sm",
                        st.tone,
                      )}
                      style={{ width: `${st.pct}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-muted-foreground pl-1">{st.desc}</p>
                </div>
              ))}
            </div>

            {/* Diagnóstico Sintético da IA */}
            <div className="mt-8 grid gap-4 md:grid-cols-2 border-t border-border/50 pt-5">
              <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/10 p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                  <Sparkles className="size-4" />
                  Gargalo Identificado: O "Susto da Parcela"
                </div>
                <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                  Entre o Primeiro Contato e o envio da Proposta, 26% dos leads param de responder ao ver o valor da parcela do financiamento tradicional da moto 0 km.
                </p>
                <div className="mt-3 text-xs font-semibold text-cyan-400">
                  Solução Vyntra: Simular antecipadamente Rota de Consórcio e Seminova reduz esse cancelamento em até 31%.
                </div>
              </div>

              <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
                <div className="flex items-center gap-2 text-xs font-bold text-emerald-300">
                  <Clock3 className="size-4" />
                  Efeito Velocidade de Atendimento
                </div>
                <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                  Leads contatados em menos de 5 minutos registram taxa de avanço de 84%. Acima de 15 minutos, a taxa despenca para apenas 22%.
                </p>
                <div className="mt-3 text-xs font-semibold text-emerald-400">
                  Ação Recomendada: Manter a trava de SLA ativada no roteador meritocrático.
                </div>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* ABA 3: DESEMPENHO POR CONCESSIONÁRIA */}
      {activeTab === "regional" && (
        <section className="rounded-2xl border border-border/60 bg-gradient-to-b from-surface/85 to-surface-2/45 p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-border/50 pb-4">
            <div>
              <h2 className="text-base font-bold text-foreground">
                Comparativo por Unidade da Rede Via Passos
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Eficiência operacional nas lojas de Lages/SC, Três Passos/RS e Santa Rosa/RS
              </p>
            </div>
            <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
              3 Concessionárias Conectadas
            </span>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {regionalStores.map((st) => (
              <div
                key={st.name}
                className="rounded-xl border border-border/70 bg-[#070e20]/70 p-5 space-y-4 hover:border-cyan-500/40 hover:bg-[#0a142c] transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-foreground">{st.name}</h3>
                    <span className="text-xs text-muted-foreground">{st.region}</span>
                  </div>
                  <span
                    className={cn(
                      "rounded-full px-2.5 py-0.5 text-[10px] font-bold border",
                      st.healthTone,
                    )}
                  >
                    {st.health}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 border-y border-border/50 py-3 text-center">
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                      SLA Médio
                    </span>
                    <strong className="text-base font-bold text-foreground">{st.sla}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                      Conversão
                    </span>
                    <strong className="text-base font-bold text-emerald-400">{st.conversion}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider block">
                      Vendas
                    </span>
                    <strong className="text-base font-bold text-cyan-300">{st.sales}</strong>
                  </div>
                </div>

                <div className="space-y-1 text-xs">
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Leads Atendidos:</span>
                    <strong className="text-foreground">{st.leads}</strong>
                  </div>
                  <div className="flex items-center justify-between text-muted-foreground">
                    <span>Rota de Maior Saída:</span>
                    <strong className="text-cyan-300 font-semibold">{st.topRoute}</strong>
                  </div>
                </div>

                {setView && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs font-semibold border-cyan-500/30 hover:bg-cyan-500/10 text-cyan-300"
                    onClick={() => setView("team")}
                  >
                    Ver Vendedores da Loja <ArrowRight className="ml-1 size-3" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Planos de Ação Recomendados pela IA (Playbooks Acionáveis) */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="size-4 text-cyan-300" />
          <h2 className="text-base font-bold text-foreground">
            Planos de Ação Executivos Recomendados pela IA
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {/* Card Ação 1 */}
          <article className="group rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-[#06151c]/80 to-[#040e14]/90 p-5 flex flex-col justify-between transition-all hover:border-emerald-500/60 hover:shadow-[0_0_25px_rgba(16,185,129,0.15)]">
            <div>
              <div className="flex items-center justify-between">
                <div className="grid size-9 place-items-center rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  <Coins className="size-4" />
                </div>
                <span className="rounded-full bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                  +R$ 192k Potencial
                </span>
              </div>
              <h3 className="mt-4 font-bold text-base text-foreground">
                Reversão via Consórcio Honda
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                24% das perdas acontecem por falta de entrada imediata. O Consórcio Nacional Honda viabiliza a compra da 0 km com parcelas sem juros e lances embutidos.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-border/40">
              {setView && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setView("opportunities")}
                  className="w-full text-xs font-semibold border-emerald-500/40 text-emerald-300 hover:bg-emerald-500/15"
                >
                  Ver Oportunidades Elegíveis <ArrowRight className="ml-1 size-3" />
                </Button>
              )}
            </div>
          </article>

          {/* Card Ação 2 */}
          <article className="group rounded-2xl border border-rose-500/30 bg-gradient-to-b from-[#180a14]/80 to-[#0e040c]/90 p-5 flex flex-col justify-between transition-all hover:border-rose-500/60 hover:shadow-[0_0_25px_rgba(244,63,94,0.15)]">
            <div>
              <div className="flex items-center justify-between">
                <div className="grid size-9 place-items-center rounded-xl bg-rose-500/15 text-rose-300 border border-rose-500/30">
                  <Clock3 className="size-4" />
                </div>
                <span className="rounded-full bg-rose-500/15 border border-rose-500/30 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                  Trava de 5 Minutos
                </span>
              </div>
              <h3 className="mt-4 font-bold text-base text-foreground">
                Redistribuição Automática por SLA
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                Leads atendidos em até 5 minutos convertem 3.8x mais. Configure a redistribuição automática para consultores online ativos caso o lead fique 7 min sem resposta.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-border/40">
              {setView && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setView("distribution")}
                  className="w-full text-xs font-semibold border-rose-500/40 text-rose-300 hover:bg-rose-500/15"
                >
                  Configurar Distribuição <ArrowRight className="ml-1 size-3" />
                </Button>
              )}
            </div>
          </article>

          {/* Card Ação 3 */}
          <article className="group rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-[#061426]/80 to-[#040c1a]/90 p-5 flex flex-col justify-between transition-all hover:border-cyan-500/60 hover:shadow-[0_0_25px_rgba(6,182,212,0.15)]">
            <div>
              <div className="flex items-center justify-between">
                <div className="grid size-9 place-items-center rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  <Zap className="size-4" />
                </div>
                <span className="rounded-full bg-cyan-500/15 border border-cyan-500/30 px-2 py-0.5 text-[10px] font-bold text-cyan-300">
                  Simulação Financeira
                </span>
              </div>
              <h3 className="mt-4 font-bold text-base text-foreground">
                Simulador de Impacto Comercial
              </h3>
              <p className="mt-2 text-xs leading-relaxed text-slate-300">
                Calcule em tempo real o incremento de receita bruta ao reduzir o SLA médio da rede em 3 minutos e direcionar 30% mais leads para os fechadores ouro.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-border/40">
              {setView && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setView("impact")}
                  className="w-full text-xs font-semibold border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/15"
                >
                  Abrir Simulador de Impacto <ArrowRight className="ml-1 size-3" />
                </Button>
              )}
            </div>
          </article>
        </div>
      </div>
    </div>
  );
}

interface QuizOption {
  value: string;
  title: string;
  desc: string;
  badge?: string;
  iconName?:
    | "Bike"
    | "Coins"
    | "Sparkles"
    | "MapPin"
    | "Zap"
    | "RefreshCw"
    | "CircleDollarSign"
    | "Flame"
    | "Target"
    | "CalendarClock"
    | "Search";
}

interface QuizQuestion {
  key: string;
  stepNumber: number;
  title: string;
  subtitle: string;
  options: QuizOption[];
}

function renderQuizOptionIcon(name?: string) {
  switch (name) {
    case "Bike":
      return <Bike className="size-5 text-primary shrink-0" />;
    case "Coins":
      return <Coins className="size-5 text-amber-500 shrink-0" />;
    case "Sparkles":
      return <Sparkles className="size-5 text-emerald-500 shrink-0" />;
    case "MapPin":
      return <MapPin className="size-5 text-primary shrink-0" />;
    case "Zap":
      return <Zap className="size-5 text-yellow-500 shrink-0" />;
    case "RefreshCw":
      return <RefreshCw className="size-5 text-cyan-500 shrink-0" />;
    case "CircleDollarSign":
      return <CircleDollarSign className="size-5 text-emerald-500 shrink-0" />;
    case "Flame":
      return <Flame className="size-5 text-rose-500 shrink-0 animate-pulse" />;
    case "Target":
      return <Target className="size-5 text-primary shrink-0" />;
    case "CalendarClock":
      return <CalendarClock className="size-5 text-sky-500 shrink-0" />;
    case "Search":
      return <Search className="size-5 text-muted-foreground shrink-0" />;
    default:
      return <Sparkles className="size-5 text-primary shrink-0" />;
  }
}

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    key: "produto",
    stepNumber: 1,
    title: "Qual moto você quer acelerar?",
    subtitle: "Selecione a categoria desejada para direcionarmos as melhores ofertas da concessionária",
    options: [
      {
        value: "Honda 0 km",
        title: "Honda 0 km Nova",
        desc: "Motos novas direto de fábrica com garantia nacional Honda de 3 anos",
        badge: "Mais Procurada",
        iconName: "Bike",
      },
      {
        value: "Consórcio Honda",
        title: "Consórcio Nacional Honda",
        desc: "Sem juros, parcelas que cabem no bolso e sem necessidade de entrada",
        badge: "Sem Juros · Entrada Zero",
        iconName: "Coins",
      },
      {
        value: "Seminova revisada",
        title: "Seminova com Garantia",
        desc: "Motos revisadas com procedência atestada e pronta entrega imediata",
        badge: "Pronta Entrega",
        iconName: "Sparkles",
      },
    ],
  },
  {
    key: "regiao",
    stepNumber: 2,
    title: "Onde você prefere ser atendido?",
    subtitle: "Atendimento oficial pela concessionária autorizada mais próxima de você",
    options: [
      {
        value: "Lages e Serra Catarinense (SC)",
        title: "Lages & Serra Catarinense (SC)",
        desc: "Concessionária autorizada em Lages / SC para toda a região serrana",
        badge: "Santa Catarina",
        iconName: "MapPin",
      },
      {
        value: "Três Passos e Região Celeiro (RS)",
        title: "Três Passos & Região Celeiro (RS)",
        desc: "Concessionária autorizada em Três Passos / RS e cidades vizinhas",
        badge: "Rio Grande do Sul",
        iconName: "MapPin",
      },
      {
        value: "Santa Rosa e Noroeste (RS)",
        title: "Santa Rosa & Noroeste Gaúcho (RS)",
        desc: "Concessionária autorizada em Santa Rosa / RS e região noroeste",
        badge: "Rio Grande do Sul",
        iconName: "MapPin",
      },
    ],
  },
  {
    key: "forma",
    stepNumber: 3,
    title: "Qual condição fica melhor para o seu bolso?",
    subtitle: "Montamos a melhor condição personalizada para o seu planejamento",
    options: [
      {
        value: "Consórcio Honda (Sem juros e sem entrada)",
        title: "Consórcio Honda",
        desc: "Parcelas reduzidas sem juros bancários e sem entrada obrigatória",
        badge: "Econômico · Sem Entrada",
        iconName: "Coins",
      },
      {
        value: "Financiamento com entrada facilitada",
        title: "Financiamento Bancário",
        desc: "Aprovação rápida e parcelas sob medida com entrada facilitada",
        badge: "Aprovação Imediata",
        iconName: "Zap",
      },
      {
        value: "Usar minha moto atual como entrada/lance",
        title: "Minha moto na troca",
        desc: "Avaliação da sua moto atual como entrada ou lance contemplado",
        badge: "Melhor Avaliação",
        iconName: "RefreshCw",
      },
      {
        value: "Pagamento à vista (com desconto)",
        title: "Pagamento à vista",
        desc: "Desconto especial exclusivo para pagamento à vista no fechamento",
        badge: "Maior Desconto",
        iconName: "CircleDollarSign",
      },
    ],
  },
  {
    key: "prazo",
    stepNumber: 4,
    title: "Para quando você planeja estar acelerando?",
    subtitle: "Selecione o momento da compra para priorizarmos o seu atendimento",
    options: [
      {
        value: "Imediato (esta semana / até 7 dias)",
        title: "Imediato (esta semana)",
        desc: "Quero fechar negócio e retirar a moto nos próximos 7 dias",
        badge: "Prioridade Máxima",
        iconName: "Flame",
      },
      {
        value: "Neste mês (próximos 30 dias)",
        title: "Neste mês (até 30 dias)",
        desc: "Previsão de fechar negócio durante o mês atual",
        badge: "Alta Prioridade",
        iconName: "Target",
      },
      {
        value: "Nos próximos 2 a 3 meses",
        title: "Próximos 2 a 3 meses",
        desc: "Me planejando e acompanhando as melhores oportunidades",
        badge: "Planejamento",
        iconName: "CalendarClock",
      },
      {
        value: "Apenas pesquisando valores no momento",
        title: "Pesquisando valores",
        desc: "Conhecendo valores de parcelas e condições sem pressa",
        badge: "Cotação",
        iconName: "Search",
      },
    ],
  },
];

function resolveLeadLocation(answers: Record<string, string>): {
  state: LeadState;
  store: LeadStore;
  city: string;
  region: string;
} {
  const regiao = answers["regiao"] || answers["cidade_loja"] || "";
  const estado = answers["estado"] || "";
  const isSC =
    regiao.includes("Lages") ||
    regiao.includes("Santa Catarina") ||
    regiao.includes("(SC)") ||
    estado.includes("Santa Catarina") ||
    estado === "SC";

  const isSantaRosa =
    regiao.includes("Santa Rosa") ||
    answers["cidade_loja"]?.includes("Santa Rosa");

  if (isSC) {
    return {
      state: "SC",
      store: "Lages / SC",
      city: "Lages",
      region: "Serra Catarinense (SC)",
    };
  }

  if (isSantaRosa) {
    return {
      state: "RS",
      store: "Santa Rosa / RS",
      city: "Santa Rosa",
      region: "Noroeste Gaúcho (RS)",
    };
  }

  return {
    state: "RS",
    store: "Três Passos / RS",
    city: "Três Passos",
    region: "Região Celeiro (RS)",
  };
}

const ANSWER_LABELS: Record<string, string> = {
  produto: "Moto desejada",
  regiao: "Concessionária / Região",
  forma: "Condição de pagamento",
  prazo: "Momento da compra",
  estado: "Estado",
  cidade_loja: "Cidade / Loja",
  modalidade_consorcio: "Objetivo Consórcio",
  orcamento: "Orçamento mensal",
  entrada: "Entrada",
  simulacao: "Simulação",
  moto: "Possui moto",
  objecao: "Objeção",
};

function Qualification() {
  const { addOpportunityFromQuiz } = useVyntra();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [done, setDone] = useState(false);
  const [createdLeadId, setCreatedLeadId] = useState<string | null>(null);

  const questions = QUIZ_QUESTIONS;
  const result = computeScore(answers);
  const m = TEMPERATURE_META[temperatureOf(result.score)];
  const q = questions[step];
  const isLast = step === questions.length - 1;
  const loc = resolveLeadLocation(answers);

  const isConsorcio =
    answers["produto"] === "Consórcio Honda" ||
    answers["forma"]?.toLowerCase().includes("consórcio");

  const handleSelectOption = (key: string, optionValue: string) => {
    const nextAnswers = { ...answers, [key]: optionValue };
    setAnswers(nextAnswers);

    // Auto-avanço suave (280ms) para qualificação fluida com 4 cliques rápidos
    if (step < questions.length - 1) {
      setTimeout(() => {
        setStep((prev) => Math.min(prev + 1, questions.length - 1));
      }, 280);
    } else {
      setTimeout(() => {
        setDone(true);
      }, 320);
    }
  };

  const handleCreateLead = () => {
    if (createdLeadId) return;
    const category =
      answers["produto"] === "Seminova revisada" || answers["produto"] === "Honda seminova"
        ? "Seminova"
        : "0 km";

    const method: PurchaseMethod = isConsorcio
      ? "Consórcio"
      : answers["forma"]?.includes("à vista") || answers["forma"]?.includes("À vista")
        ? "À vista"
        : "Financiamento";

    const downPayment = isConsorcio
      ? "Sem entrada (Consórcio Honda)"
      : answers["forma"]?.includes("troca") || answers["forma"]?.includes("moto atual")
        ? "Moto usada na troca"
        : answers["forma"]?.includes("Financiamento")
          ? "Entrada facilitada"
          : "À vista";

    const newId = addOpportunityFromQuiz({
      customer: {
        name: `Lead Qualificado (${loc.city})`,
        whatsapp: `(${loc.state === "SC" ? "49" : "55"}) 9${Math.floor(8000 + Math.random() * 1999)}-${Math.floor(1000 + Math.random() * 8999)}`,
      },
      state: loc.state,
      store: loc.store,
      city: loc.city,
      product: answers["produto"] || "Honda 0 km",
      category,
      method,
      budget: isConsorcio ? "Parcela reduzida sem juros" : "Conforme simulação",
      downPayment,
      deadline: answers["prazo"] || "Até 30 dias",
      score: result.score,
      scoreReasons: result.reasons,
      objection: isConsorcio ? "Comparando cotas de consórcio" : "Simulando melhor taxa",
      route: {
        primary: isConsorcio
          ? "Consórcio"
          : category === "Seminova"
            ? "Seminova"
            : "Financiamento",
        alternative: isConsorcio ? "0 km" : "Consórcio",
        rationale: isConsorcio
          ? `Lead com perfil ideal para Consórcio Nacional Honda. Roteado imediatamente para consultores da concessionária ${loc.store}.`
          : `Lead qualificado com alta intenção de compra para a concessionária ${loc.store} (${loc.city}).`,
        budgetFit: result.score >= 70 ? "alta" : "média",
      },
    });
    setCreatedLeadId(newId);
  };

  if (done)
    return (
      <>
        <PageHeader
          title="Qualificação rápida concluída"
          subtitle="Vyntra Score consolidado, concessionária definida e roteamento comercial automático."
        />
        <div className="grid gap-5 lg:grid-cols-[0.75fr_1.25fr]">
          <section className="panel flex flex-col items-center p-8 text-center">
            <ScoreRing score={result.score} size="lg" />
            <div className="mt-4 text-xl font-semibold" style={{ color: m.color }}>
              {m.emoji} {m.label} ({result.score} pts)
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {result.score >= 80
                ? "Alta prioridade de atendimento com excelente aderência"
                : result.score >= 60
                  ? "Bom potencial comercial com interesse ativo"
                  : "Lead em fase inicial de planejamento e cotação"}
            </p>

            <div className="mt-5 w-full rounded-xl border border-primary/30 bg-primary/5 p-4 text-left">
              <div className="text-[10px] font-bold uppercase tracking-wider text-primary">
                Concessionária Oficial de Atendimento
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <MapPin className="size-4 text-primary shrink-0" />
                {loc.store}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Região atendida: <strong>{loc.region}</strong>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2 w-full">
              {createdLeadId ? (
                <div className="rounded-lg border border-[color:var(--success)]/40 bg-[color:color-mix(in_oklab,var(--success)_10%,transparent)] p-3 text-xs text-[color:var(--success)] font-medium">
                  ✓ Lead <strong>{createdLeadId}</strong> direcionado para consultores de <strong>{loc.store}</strong>!
                </div>
              ) : (
                <Button className="w-full" onClick={handleCreateLead}>
                  <Send className="mr-1.5 size-4" />
                  Salvar e direcionar para {loc.store}
                </Button>
              )}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setStep(0);
                  setAnswers({});
                  setDone(false);
                  setCreatedLeadId(null);
                }}
              >
                <RefreshCw className="mr-1.5 size-4" />
                Nova qualificação rápida
              </Button>
            </div>
          </section>

          <section className="space-y-5">
            <div className="panel p-5">
              <h2 className="font-semibold text-base">Critérios avaliados pelo Vyntra Score</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {result.reasons.map((r) => (
                  <div key={r} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-[color:var(--success)]" />
                    <span>{r}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
              <div className="flex items-center justify-between">
                <div className="text-xs font-bold text-primary tracking-wider uppercase">ROTA COMERCIAL SUGERIDA</div>
                {isConsorcio ? (
                  <span className="rounded-full bg-amber-500/20 border border-amber-500/40 px-2 py-0.5 text-[10px] font-bold text-amber-300">
                    Rota Oficial Consórcio Honda
                  </span>
                ) : (
                  <span className="rounded-full bg-emerald-500/20 border border-emerald-500/40 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
                    Venda Direta / Financiamento
                  </span>
                )}
              </div>
              <div className="mt-3 text-lg font-semibold">
                {isConsorcio
                  ? "Consórcio Nacional Honda — Rota de Alta Conversão"
                  : answers["produto"] === "Seminova revisada"
                    ? "Seminova com Procedência — Atendimento Imediato"
                    : "Honda 0 km — Simulação Especial na Concessionária"}
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {isConsorcio
                  ? `Perfil excelente para aquisição programada sem cobrança de juros bancários. Direcionado imediatamente para especialistas em Consórcio Honda de ${loc.store}.`
                  : `Cliente qualificado com interesse em ${answers["produto"] || "moto Honda"}. Contato preparado com simulação pronta para a equipe de vendas de ${loc.store}.`}
              </p>
            </div>

            <div className="panel p-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3">
                Resumo das 4 Respostas do Lead
              </h3>
              <div className="grid gap-2 sm:grid-cols-2">
                {Object.entries(answers).map(([k, val]) => (
                  <div key={k} className="rounded-lg bg-secondary/60 p-3 text-xs">
                    <div className="text-muted-foreground font-medium">{ANSWER_LABELS[k] ?? k}</div>
                    <div className="mt-1 font-semibold text-foreground text-sm">{val}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </>
    );

  return (
    <>
      <PageHeader
        title="Qualificação rápida de leads"
        subtitle="Questionário ultra simples em 4 cliques com cálculo em tempo real do Vyntra Score."
      />
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <section className="panel p-5 sm:p-8">
          {/* Barra de progresso dos 4 passos */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
              <span className="font-semibold text-primary uppercase tracking-wider">
                Passo {step + 1} de {questions.length} · Qualificação rápida (4 cliques)
              </span>
              <span className="font-medium text-foreground">
                {Math.round(((step + (q && answers[q.key] ? 1 : 0)) / questions.length) * 100)}% concluído
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {questions.map((item, idx) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => {
                    if (idx <= step || answers[item.key]) setStep(idx);
                  }}
                  className={cn(
                    "h-2 rounded-full transition-all text-left",
                    idx === step
                      ? "bg-primary ring-2 ring-primary/30"
                      : idx < step || answers[item.key]
                        ? "bg-primary/70"
                        : "bg-secondary"
                  )}
                  title={`Passo ${idx + 1}: ${item.title}`}
                />
              ))}
            </div>
          </div>

          <div className="text-xs font-bold text-primary tracking-wider uppercase">
            Pergunta {step + 1} de {questions.length}
          </div>
          <h2 className="mt-1 text-2xl font-bold text-foreground">{q?.title}</h2>
          {q?.subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{q.subtitle}</p>
          )}

          {/* Cards interativos com clique rápido */}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {q?.options.map((opt) => {
              const isSelected = answers[q.key] === opt.value;
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => handleSelectOption(q.key, opt.value)}
                  className={cn(
                    "group relative flex flex-col justify-between rounded-xl border p-4 text-left transition-all duration-200 cursor-pointer",
                    isSelected
                      ? "border-primary bg-primary/10 shadow-md ring-2 ring-primary/40"
                      : "border-border/70 bg-card hover:border-primary/50 hover:bg-secondary/40 hover:shadow-sm"
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "flex size-10 items-center justify-center rounded-xl transition-colors shrink-0",
                          isSelected
                            ? "bg-primary/20 text-primary"
                            : "bg-secondary text-muted-foreground group-hover:text-primary group-hover:bg-primary/10"
                        )}
                      >
                        {renderQuizOptionIcon(opt.iconName)}
                      </div>
                      <div>
                        <div className="font-semibold text-foreground text-sm sm:text-base leading-snug">
                          {opt.title}
                        </div>
                        {opt.badge && (
                          <span
                            className={cn(
                              "mt-1 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
                              isSelected
                                ? "bg-primary text-primary-foreground"
                                : "bg-secondary text-muted-foreground group-hover:text-primary"
                            )}
                          >
                            {opt.badge}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="shrink-0 pt-0.5">
                      <div
                        className={cn(
                          "flex size-5 items-center justify-center rounded-full border transition-colors",
                          isSelected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-muted-foreground/30 bg-transparent group-hover:border-primary/50"
                        )}
                      >
                        {isSelected && <Check className="size-3 stroke-[3]" />}
                      </div>
                    </div>
                  </div>
                  <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
                    {opt.desc}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="mt-8 flex items-center justify-between pt-4 border-t border-border/40">
            <Button
              variant="ghost"
              disabled={step === 0}
              onClick={() => setStep(step - 1)}
              className="gap-1.5 text-muted-foreground"
            >
              <ArrowLeft className="size-4" />
              Voltar
            </Button>
            <div className="flex items-center gap-2">
              <Button
                disabled={!q || !answers[q.key]}
                onClick={() => (isLast ? setDone(true) : setStep(step + 1))}
                className="gap-1.5"
              >
                {isLast ? "Ver Vyntra Score & Rota" : "Próximo passo"}
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </div>
        </section>

        {/* Sidebar com Vyntra Score em tempo real */}
        <aside className="panel p-5 space-y-4">
          <div className="flex items-center gap-3 pb-3 border-b border-border/40">
            <Gauge className="size-5 text-primary shrink-0" />
            <div>
              <h3 className="font-semibold text-sm">Vyntra Score dinâmico</h3>
              <p className="text-xs text-muted-foreground">Atualiza a cada clique do lead</p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-2">
            <ScoreRing score={result.score} size="lg" />
            <div className="mt-2 text-xs font-semibold" style={{ color: m.color }}>
              {m.emoji} {m.label} ({result.score} pts)
            </div>
          </div>

          <div className="rounded-lg border border-primary/30 bg-primary/10 p-3 text-xs">
            <div className="flex items-center gap-1.5 font-semibold text-primary">
              <MapPin className="size-3.5 shrink-0" />
              Concessionária prevista:
            </div>
            <div className="mt-1 font-bold text-foreground">{loc.store}</div>
            <div className="text-[11px] text-muted-foreground">{loc.region}</div>
          </div>

          <div className="space-y-2">
            <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
              Resumo das respostas:
            </div>
            {Object.entries(answers).map(([k, val]) => (
              <div key={k} className="rounded-md bg-secondary/80 px-3 py-2 text-xs flex justify-between gap-2">
                <span className="text-muted-foreground shrink-0">{ANSWER_LABELS[k] ?? k}:</span>
                <span className="font-medium text-foreground text-right truncate">{val}</span>
              </div>
            ))}
            {Object.keys(answers).length === 0 && (
              <div className="text-xs text-muted-foreground italic text-center py-2">
                Selecione a primeira opção para iniciar o cálculo.
              </div>
            )}
          </div>

          <div className="border-t border-border/50 pt-3 text-[10px] leading-relaxed text-muted-foreground">
            Qualificação instantânea em 4 cliques com roteamento automatizado para o time comercial da concessionária mais próxima.
          </div>
        </aside>
      </div>
    </>
  );
}

function Impact() {
  const [leadsPerMonth, setLeadsPerMonth] = useState(150);
  const [avgTicket, setAvgTicket] = useState(22000);
  const [currentConversion, setCurrentConversion] = useState(8);
  const [vyntraConversion, setVyntraConversion] = useState(16);

  // Cálculos do simulador financeiro
  const salesWithout = Math.round(leadsPerMonth * (currentConversion / 100));
  const revWithout = salesWithout * avgTicket;

  const salesWith = Math.round(leadsPerMonth * (vyntraConversion / 100));
  const revWith = salesWith * avgTicket;

  const additionalSales = salesWith - salesWithout;
  const additionalRevenue = revWith - revWithout;
  const annualAdditionalRevenue = additionalRevenue * 12;
  const recoveredLeadsCount = Math.round(leadsPerMonth * 0.15);

  const formatCurrency = (val: number) =>
    val.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

  return (
    <>
      <PageHeader
        title="Impacto Comercial & Retorno sobre Investimento"
        subtitle="Inteligência de receita, recuperação de oportunidades perdidas e projeção financeira para concessionárias."
        action={
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-[11px] font-bold text-cyan-300 flex items-center gap-1.5">
              <Sparkles className="size-3 text-cyan-400" /> MODELO PREDITIVO COMERCIAL
            </span>
          </div>
        }
      />

      {/* Grid de KPIs de Alto Impacto */}
      <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-5">
        <div className="panel p-4 border-border/80 bg-surface/80">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Investimento em Tráfego</span>
            <CircleDollarSign className="size-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">R$ 18.500</div>
          <span className="mt-1 block text-[11px] text-muted-foreground">Mídia Meta Ads & Google</span>
        </div>

        <div className="panel p-4 border-border/80 bg-surface/80">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Leads Processados</span>
            <Target className="size-4 text-primary" />
          </div>
          <div className="mt-2 text-2xl font-bold text-foreground">142</div>
          <span className="mt-1 block text-[11px] text-muted-foreground">Regiões SC & RS</span>
        </div>

        <div className="panel p-4 border-border/80 bg-surface/80">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Oportunidades Quentes</span>
            <ShieldCheck className="size-4 text-amber-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-amber-400">87 leads</div>
          <span className="mt-1 block text-[11px] text-muted-foreground">Score 60+ (61% do volume)</span>
        </div>

        <div className="panel p-4 border-border/80 bg-surface/80">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span>Leads Salvos do Abandono</span>
            <RefreshCw className="size-4 text-emerald-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-400">23 leads</div>
          <span className="mt-1 block text-[11px] text-muted-foreground">Resgatados por SLA &lt; 10m</span>
        </div>

        <div className="panel p-4 border-cyan-500/40 bg-gradient-to-b from-cyan-950/20 to-surface/80 shadow-[0_0_20px_rgba(6,182,212,0.1)]">
          <div className="flex items-center justify-between text-muted-foreground text-xs font-medium">
            <span className="text-cyan-300 font-semibold">Receita Recuperada</span>
            <TrendingUp className="size-4 text-cyan-400" />
          </div>
          <div className="mt-2 text-2xl font-bold text-cyan-300">+R$ 186.400</div>
          <span className="mt-1 block text-[11px] text-cyan-400/80 font-medium">ROI Estimado de 10.1x</span>
        </div>
      </div>

      {/* SIMULADOR INTERATIVO DE RECEITA DA CONCESSIONÁRIA */}
      <div className="mt-6 panel p-5 lg:p-6 border-cyan-500/30 bg-gradient-to-r from-[#04081c] via-[#081533] to-[#04091a]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-border/40 pb-4">
          <div className="flex items-center gap-3">
            <div className="grid size-11 place-items-center rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">
              <Calculator className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-foreground">Simulador Financeiro de Receita Comercial</h3>
                <span className="rounded-full bg-cyan-500/20 px-2 py-0.5 text-[10px] font-bold text-cyan-300 border border-cyan-500/30">
                  Interativo
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                Ajuste os parâmetros da sua concessionária para calcular o retorno direto da distribuição meritocrática e qualificação instantânea.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {[100, 150, 250, 400].map((preset) => (
              <button
                key={preset}
                onClick={() => setLeadsPerMonth(preset)}
                className={cn(
                  "rounded-lg px-2.5 py-1 text-xs font-medium border transition-colors",
                  leadsPerMonth === preset
                    ? "bg-cyan-500 text-slate-950 font-bold border-cyan-400"
                    : "bg-surface-2/60 text-muted-foreground border-border hover:text-foreground",
                )}
              >
                {preset} leads/mês
              </button>
            ))}
          </div>
        </div>

        {/* Controles do Simulador */}
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {/* Controle 1: Volume de Leads */}
          <div className="rounded-xl border border-border/70 bg-surface/60 p-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-muted-foreground font-medium">Leads Inbound por Mês:</span>
              <strong className="text-sm text-foreground font-mono">{leadsPerMonth} leads</strong>
            </div>
            <input
              type="range"
              min="50"
              max="500"
              step="10"
              value={leadsPerMonth}
              onChange={(e) => setLeadsPerMonth(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 rounded-lg bg-slate-800"
            />
            <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
              <span>50 leads</span>
              <span>250 leads</span>
              <span>500 leads</span>
            </div>
          </div>

          {/* Controle 2: Ticket Médio da Moto / Consórcio */}
          <div className="rounded-xl border border-border/70 bg-surface/60 p-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-muted-foreground font-medium">Ticket Médio por Venda:</span>
              <strong className="text-sm text-foreground font-mono">{formatCurrency(avgTicket)}</strong>
            </div>
            <input
              type="range"
              min="12000"
              max="45000"
              step="1000"
              value={avgTicket}
              onChange={(e) => setAvgTicket(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 rounded-lg bg-slate-800"
            />
            <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
              <span>R$ 12.000 (Biz/Pop)</span>
              <span>R$ 22.000 (Twister/Bros)</span>
              <span>R$ 45.000+ (Sahara/CB 500)</span>
            </div>
          </div>

          {/* Controle 3: Conversão Sem vs Com Vyntra */}
          <div className="rounded-xl border border-border/70 bg-surface/60 p-4">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="text-muted-foreground font-medium">Meta de Conversão:</span>
              <strong className="text-sm text-emerald-400 font-mono">
                {currentConversion}% → {vyntraConversion}%
              </strong>
            </div>
            <input
              type="range"
              min="10"
              max="26"
              step="1"
              value={vyntraConversion}
              onChange={(e) => setVyntraConversion(Number(e.target.value))}
              className="w-full accent-emerald-400 cursor-pointer h-1.5 rounded-lg bg-slate-800"
            />
            <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
              <span>Base atual: {currentConversion}%</span>
              <span>Média Vyntra: 16%</span>
              <span>Top Closers: 26%</span>
            </div>
          </div>
        </div>

        {/* Painel de Resultados do Simulador */}
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 pt-3 border-t border-border/50">
          <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4">
            <span className="text-[11px] font-bold text-destructive uppercase tracking-wider">
              Operação Sem Vyntra
            </span>
            <div className="mt-2 text-2xl font-bold text-foreground font-mono">
              {salesWithout} vendas
            </div>
            <span className="text-xs text-muted-foreground">
              Faturamento: <strong className="text-foreground">{formatCurrency(revWithout)}</strong>
            </span>
          </div>

          <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/15 p-4">
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
              Com Vyntra Lead Pilot
            </span>
            <div className="mt-2 text-2xl font-bold text-emerald-300 font-mono">
              {salesWith} vendas
            </div>
            <span className="text-xs text-muted-foreground">
              Faturamento: <strong className="text-foreground">{formatCurrency(revWith)}</strong>
            </span>
          </div>

          <div className="rounded-xl border border-cyan-500/40 bg-cyan-950/20 p-4">
            <span className="text-[11px] font-bold text-cyan-300 uppercase tracking-wider">
              Ganho Mensal Adicional
            </span>
            <div className="mt-2 text-2xl font-bold text-cyan-300 font-mono">
              +{formatCurrency(additionalRevenue)}
            </div>
            <span className="text-xs text-muted-foreground">
              +{additionalSales} motos ou cotas a mais/mês
            </span>
          </div>

          <div className="rounded-xl border border-amber-500/40 bg-amber-950/20 p-4">
            <span className="text-[11px] font-bold text-amber-300 uppercase tracking-wider">
              Impacto Anual Projetado
            </span>
            <div className="mt-2 text-2xl font-bold text-amber-400 font-mono">
              +{formatCurrency(annualAdditionalRevenue)}
            </div>
            <span className="text-xs text-muted-foreground">
              {recoveredLeadsCount * 12} leads resgatados no ano
            </span>
          </div>
        </div>
      </div>

      {/* COMPARAÇÃO LADO A LADO: REATIVO VS COM INTELIGÊNCIA */}
      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-destructive/30 bg-gradient-to-b from-destructive/10 to-surface/60 p-6">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-destructive tracking-wider">MODELO TRADICIONAL</div>
            <span className="rounded-full bg-destructive/10 border border-destructive/30 px-2 py-0.5 text-[10px] font-bold text-destructive">
              Decisões Reativas
            </span>
          </div>
          <h3 className="mt-3 text-xl font-bold text-foreground">Distribuição Aleatória & Gargalos</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Leads distribuídos igualmente sem considerar taxa de fechamento ou perfil de consórcio.
          </p>

          <div className="mt-6 space-y-4">
            {[
              ["Oportunidades quentes sem resposta em 15m", "31 leads", "text-destructive"],
              ["Follow-ups esquecidos pela equipe", "18 leads", "text-destructive"],
              ["Tempo médio de primeiro contato", "24 min", "text-destructive"],
              ["Potencial de vendas perdido estimado", "R$ 198.000", "text-foreground"],
              ["Taxa média de fechamento da equipe", "8.2%", "text-muted-foreground"],
            ].map(([label, val, clr]) => (
              <div
                key={label}
                className="flex items-center justify-between border-b border-destructive/15 pb-2.5 text-xs"
              >
                <span className="text-muted-foreground">{label}</span>
                <strong className={cn("font-bold text-sm font-mono", clr)}>{val}</strong>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/15 to-surface/60 p-6">
          <div className="flex items-center justify-between">
            <div className="text-xs font-bold text-emerald-400 tracking-wider">COM VYNTRA LEAD PILOT</div>
            <span className="rounded-full bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 text-[10px] font-bold text-emerald-300">
              Meritocracia + IA
            </span>
          </div>
          <h3 className="mt-3 text-xl font-bold text-foreground">Roteamento Inteligente & SLA Rápido</h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Top closers e consultores com maior taxa de fechamento recebem leads quentes prioritariamente.
          </p>

          <div className="mt-6 space-y-4">
            {[
              ["Oportunidades quentes priorizadas", "87 leads", "text-emerald-400"],
              ["Follow-ups recuperados automaticamente", "23 leads", "text-emerald-400"],
              ["Tempo médio de primeiro contato", "7.4 min", "text-emerald-400"],
              ["Receita comercial recuperada no mês", "+R$ 186.400", "text-cyan-300 font-bold"],
              ["Taxa média de fechamento dos closers", "18.5%", "text-emerald-300"],
            ].map(([label, val, clr]) => (
              <div
                key={label}
                className="flex items-center justify-between border-b border-emerald-500/15 pb-2.5 text-xs"
              >
                <span className="text-muted-foreground">{label}</span>
                <strong className={cn("font-bold text-sm font-mono", clr)}>{val}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* IMPACTO REGIONAL & GRÁFICO COMPARATIVO */}
      <div className="mt-6 panel p-6 border-border/80">
        <div className="grid items-center gap-6 lg:grid-cols-[1fr_1.3fr]">
          <div>
            <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
              IMPACTO POR CONCESSIONÁRIA & REGIÃO
            </div>
            <h4 className="mt-2 text-2xl font-bold text-foreground">Recuperação de Vendas em SC e RS</h4>
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              Com o roteamento geográfico e meritocrático, cada loja atinge máxima eficiência sem canibalização de fila:
            </p>

            <div className="mt-4 space-y-2.5 text-xs">
              <div className="rounded-lg border border-border/60 bg-surface-2/40 p-3 flex items-center justify-between">
                <div>
                  <strong className="text-foreground block">Lages / SC (Serra Catarinense)</strong>
                  <span className="text-[11px] text-muted-foreground">Francine & Guilherme</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-cyan-300">+R$ 98.000</span>
                  <span className="block text-[10px] text-muted-foreground">49 leads / 12 vendas</span>
                </div>
              </div>

              <div className="rounded-lg border border-border/60 bg-surface-2/40 p-3 flex items-center justify-between">
                <div>
                  <strong className="text-foreground block">Três Passos / RS (Noroeste RS)</strong>
                  <span className="text-[11px] text-muted-foreground">Vitor & Fila Regional</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-400">+R$ 52.000</span>
                  <span className="block text-[10px] text-muted-foreground">28 leads / 7 vendas</span>
                </div>
              </div>

              <div className="rounded-lg border border-border/60 bg-surface-2/40 p-3 flex items-center justify-between">
                <div>
                  <strong className="text-foreground block">Santa Rosa / RS (Missões / Fronteira)</strong>
                  <span className="text-[11px] text-muted-foreground">Gabriel & Francine</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-indigo-300">+R$ 36.400</span>
                  <span className="block text-[10px] text-muted-foreground">21 leads / 4 vendas</span>
                </div>
              </div>
            </div>
          </div>

          <div className="h-[280px]">
            <div className="text-xs text-muted-foreground mb-2 flex items-center justify-between font-medium">
              <span>Comparativo de Faturamento Projetado (em milhares de R$):</span>
              <span className="text-[11px] text-cyan-300">Base simulada mensal</span>
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { n: "Perda por SLA Lento", sem: 198, com: 42 },
                  { n: "Recuperado por IA", sem: 0, com: 186 },
                  { n: "Faturamento Total", sem: 264, com: 450 },
                ]}
              >
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="n" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={10} />
                <ChartTooltip
                  contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: "8px" }}
                />
                <Bar
                  name="Sem Vyntra (R$ mil)"
                  dataKey="sem"
                  fill="var(--destructive)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  name="Com Vyntra (R$ mil)"
                  dataKey="com"
                  fill="var(--success)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </>
  );
}

function SettingsPage({ setView }: { setView?: (v: View) => void }) {
  const v = useVyntra();
  return (
    <>
      <PageHeader
        title="Configurações"
        subtitle="Parâmetros do ambiente, regras e integrações da operação."
      />

      {/* Cartão em destaque de Integrações Webhook */}
      <section className="mb-6 rounded-xl border border-cyan-500/30 bg-gradient-to-r from-[#060e26] via-[#091535] to-[#04091a] p-5 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="grid size-11 place-items-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
            <Webhook className="size-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-foreground">Integração de Webhook de Leads</h2>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-[10px] font-bold border",
                  v.webhookCompany.isActive
                    ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                    : "bg-muted/30 border-border text-muted-foreground",
                )}
              >
                {v.webhookCompany.isActive ? "Ativo" : "Inativo"}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground max-w-xl">
              Endpoint ativo para recebimento automático de leads de campanhas (Meta Ads, Google Ads, formulários e portais). Inclui qualificação preditiva com Lead Score (0 a 100) e distribuição instantânea.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {setView && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setView("integration-logs")}
                className="h-9 text-xs border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
              >
                <Terminal className="size-3.5 mr-1" />
                Logs
              </Button>
              <Button
                size="sm"
                onClick={() => setView("integrations")}
                className="h-9 text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold"
              >
                Gerenciar Integração
                <ChevronRight className="size-3.5 ml-1" />
              </Button>
            </>
          )}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-[1fr_0.8fr]">
        <section className="panel p-5">
          <h2 className="font-semibold">Ambiente de demonstração</h2>
          <div className="mt-4 rounded-lg border border-primary/25 bg-primary/5 p-4">
            <div className="flex items-start gap-3">
              <ShieldCheck className="size-5 shrink-0 text-primary" />
              <div>
                <div className="text-sm font-semibold">DEMO — Dados fictícios</div>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Este ambiente utiliza dados simulados exclusivamente para demonstração. Não há
                  integração com CRM, WhatsApp, instituição financeira, bureau de crédito ou banco
                  de dados real.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-5 space-y-4">
            {[
              ["Consultas de CPF / crédito", false],
              ["Integração WhatsApp", false],
              ["Persistência local no navegador", true],
              ["Toasts e ações simuladas", true],
            ].map(([l, x]) => (
              <div
                key={String(l)}
                className="flex items-center justify-between border-b border-border pb-4"
              >
                <div className="text-sm">{String(l)}</div>
                <Switch checked={Boolean(x)} disabled />
              </div>
            ))}
          </div>
          <Button variant="destructive" className="mt-4" onClick={v.resetDemo}>
            <RefreshCw />
            Reiniciar todos os dados demo
          </Button>
        </section>
        <section className="panel p-5">
          <h2 className="font-semibold">Parâmetros de resposta</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Faixas usadas nos alertas do protótipo.
          </p>
          <div className="mt-5 space-y-3">
            {[
              ["Normal", "0–5 minutos", "var(--success)"],
              ["Atenção", "5–10 minutos", "var(--warm)"],
              ["Crítico", "10+ minutos", "var(--destructive)"],
            ].map(([a, b, c]) => (
              <div
                key={a}
                className="flex items-center justify-between rounded-lg bg-secondary p-3"
              >
                <div className="flex items-center gap-2">
                  <span className="size-2 rounded-full" style={{ background: c }} />
                  <span className="text-sm font-medium">{a}</span>
                </div>
                <span className="text-xs text-muted-foreground">{b}</span>
              </div>
            ))}
          </div>
          <h2 className="mt-8 font-semibold">Concessionária</h2>
          <div className="mt-3 rounded-lg border border-border p-4">
            <div className="text-sm font-medium">{DEALERSHIP}</div>
            <div className="mt-1 text-xs text-muted-foreground">
              Unidade simulada · Sul de Minas
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
function SellerDashboard({ setSelected }: { setSelected: (id: string) => void }) {
  const v = useVyntra();
  const sellerId = v.currentSellerId || "francine";
  const seller = v.sellerById(sellerId);
  const firstName = seller?.name?.split(" ")[0] || "Consultor";
  const own = v.opportunities.filter(
    (o) => o.sellerId === sellerId && !["Venda", "Perdida"].includes(o.status),
  );
  const hot = own.filter((o) => o.score >= 80);
  const overdue = v.followUps.filter(
    (f) =>
      !f.done && new Date(f.dueAt).getTime() < v.now && own.some((o) => o.id === f.opportunityId),
  );
  const proposals = v.proposals.filter(
    (p) => p.sellerId === sellerId && !["Fechada", "Perdida"].includes(p.status),
  );
  return (
    <>
      <PageHeader
        title={`Olá, ${firstName}.`}
        subtitle={`Você possui ${own.length} oportunidades aguardando ação na sua carteira.`}
        action={
          <div className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs text-primary">
            Painel do vendedor · {seller?.name || "Consultor"}
          </div>
        }
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Kpi label="Oportunidades quentes" value={String(hot.length)} icon={Flame} />
        <Kpi label="Follow-ups atrasados" value={String(overdue.length)} danger icon={Clock3} />
        <Kpi
          label="Propostas aguardando retorno"
          value={String(proposals.length)}
          icon={FileText}
        />
        <Kpi
          label="Potencial em aberto"
          value={BRL(own.reduce((a, o) => a + o.potentialValue, 0))}
          icon={CircleDollarSign}
        />
      </div>
      <div className="mt-6 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">Sua fila de ação</h2>
          <p className="text-xs text-muted-foreground">Ordenada por score e urgência</p>
        </div>
        <span className="text-xs text-muted-foreground">Meta: responder em até 5 min</span>
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        {own
          .sort((a, b) => b.score - a.score)
          .map((o) => {
            const waiting = waitingMinutes(o, v.now);
            return (
              <article key={o.id} className="panel p-4">
                <div className="flex items-start gap-3">
                  <ScoreRing score={o.score} />
                  <button onClick={() => setSelected(o.id)} className="min-w-0 flex-1 text-left">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{o.customer.name}</h3>
                      {waiting !== null && <Timer minutes={waiting} />}
                    </div>
                    <div className="mt-1 text-sm text-muted-foreground">
                      {o.product} · {o.category} · {o.method}
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs sm:grid-cols-4">
                      <div>
                        <span className="text-muted-foreground">Orçamento</span>
                        <strong className="mt-1 block">{o.budget}</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Prazo</span>
                        <strong className="mt-1 block">{o.deadline}</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Objeção</span>
                        <strong className="mt-1 block">{o.objection}</strong>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Rota</span>
                        <strong className="mt-1 block text-primary">{o.route.primary}</strong>
                      </div>
                    </div>
                  </button>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
                  <Button size="sm" onClick={() => v.simulateWhatsApp(o.id)}>
                    <MessageCircle />
                    Chamar cliente
                  </Button>
                  <Button size="sm" variant="secondary" onClick={() => v.registerContact(o.id)}>
                    <Phone />
                    Registrar contato
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => v.sendProposal(o.id)}>
                    <Send />
                    Enviar proposta
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => v.scheduleFollowUp(o.id, 24, "Retomar oportunidade")}
                  >
                    <CalendarClock />
                    Follow-up
                  </Button>
                </div>
              </article>
            );
          })}
      </div>
    </>
  );
}
