import { useMemo, useState } from "react";
import {
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
  Eye,
  EyeOff,
  FileText,
  Flame,
  Gauge,
  KeyRound,
  LayoutDashboard,
  Lock,
  LogOut,
  Mail,
  Menu,
  MessageCircle,
  MoreHorizontal,
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
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  UserPlus,
  UserRound,
  UsersRound,
  MapPin,
  Terminal,
  Webhook,
  X,
  Zap,
} from "lucide-react";
import { IntegrationsPage, IntegrationLogsPage } from "./vyntra-integrations";
import {
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
} from "@/lib/vyntra/mock-data";
import { useVyntra, type RoleView } from "@/lib/vyntra/store";
import {
  LAGES_REGION_CITIES,
  type CommercialRoute,
  type FollowUpBucket,
  type LeadState,
  type LeadStore,
  type Opportunity,
  type OpportunityFilters,
  type OpportunityStatus,
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
  | "distribution"
  | "followups"
  | "proposals"
  | "team"
  | "insights"
  | "qualification"
  | "impact"
  | "integrations"
  | "integration-logs"
  | "settings";

const NAV: Array<{ id: View; label: string; icon: typeof LayoutDashboard }> = [
  { id: "overview", label: "Visão geral", icon: LayoutDashboard },
  { id: "opportunities", label: "Oportunidades", icon: Target },
  { id: "distribution", label: "Distribuição", icon: RouteIcon },
  { id: "followups", label: "Follow-ups", icon: CalendarClock },
  { id: "proposals", label: "Propostas", icon: FileText },
  { id: "team", label: "Equipe", icon: UsersRound },
  { id: "insights", label: "Insights", icon: Sparkles },
  { id: "qualification", label: "Qualificação", icon: Bot },
  { id: "impact", label: "Impacto comercial", icon: CircleDollarSign },
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

export function VyntraApp() {
  const { hydrated, authed } = useVyntra();
  if (!hydrated) return <div className="min-h-screen bg-background" />;
  return (
    <>
      {authed ? <Workspace /> : <Login />}
      <Toaster position="top-right" richColors />
    </>
  );
}

function Brand({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <div className={cn("inline-flex items-center", className)}>
      <img
        src="/logo.png"
        alt="VYNTRA"
        className={cn(
          "object-contain select-none transition-transform duration-300 hover:scale-105 filter drop-shadow-[0_0_12px_rgba(6,182,212,0.35)]",
          compact ? "h-6 w-auto" : "h-7 sm:h-8 w-auto",
        )}
      />
    </div>
  );
}

function Login() {
  const { login, loginAs, sellers } = useVyntra();
  const [authMode, setAuthMode] = useState<"login" | "forgot-password" | "first-access">("login");
  const [selectedRole, setSelectedRole] = useState<RoleView>("gestor");
  const [selectedSellerId, setSelectedSellerId] = useState("carlos");
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
  const [firstSellerId, setFirstSellerId] = useState("carlos");
  const [firstEmail, setFirstEmail] = useState("carlos@vyntra.com");
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
      setEmail(`${s?.id || "carlos"}@vyntra.com`);
    }
  };

  const handleSellerChange = (sellerId: string) => {
    setSelectedSellerId(sellerId);
    setEmail(`${sellerId}@vyntra.com`);
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login(email, password, selectedRole, selectedSellerId)) {
      setError("E-mail ou senha inválidos. Utilize a senha padrão 123456 para demonstração.");
    }
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
    login(firstEmail, firstPass, firstRole, firstRole === "vendedor" ? firstSellerId : undefined);
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
      <section className="relative flex items-center justify-center bg-gradient-to-b from-[#030611] to-[#060b1b] px-5 py-12 overflow-y-auto">
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
                            {s.name} · {s.specialty}
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
                    onClick={() => loginAs("gestor")}
                    className="flex flex-col items-start gap-1 rounded-xl border border-cyan-500/30 bg-[#071026]/70 p-3 text-left transition-all hover:bg-cyan-500/10 hover:border-cyan-400/60 hover:shadow-[0_0_20px_rgba(6,182,212,0.25)]"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-cyan-400">
                      <ShieldCheck className="size-3.5" />
                      Entrar como Gestor
                    </div>
                    <div className="text-[11px] text-foreground font-medium">gestor@vyntra.com</div>
                    <div className="text-[10px] text-muted-foreground">Visão geral e lojas RS/SC</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => loginAs("vendedor", "carlos")}
                    className="flex flex-col items-start gap-1 rounded-xl border border-violet-500/30 bg-[#0d0a26]/70 p-3 text-left transition-all hover:bg-violet-500/10 hover:border-violet-400/60 hover:shadow-[0_0_20px_rgba(139,92,246,0.25)]"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-bold text-violet-400">
                      <UserRound className="size-3.5" />
                      Entrar como Vendedor
                    </div>
                    <div className="text-[11px] text-foreground font-medium">carlos@vyntra.com</div>
                    <div className="text-[10px] text-muted-foreground">Fila de ação e consultor</div>
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
                            {s.name} ({s.specialty})
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
    </main>
  );
}

function Workspace() {
  const { role } = useVyntra();
  const [view, setView] = useState<View>("overview");
  const [mobileNav, setMobileNav] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const [globalSearch, setGlobalSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [alertsOpen, setAlertsOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        view={view}
        setView={(v) => {
          setView(v);
          setMobileNav(false);
        }}
        mobileOpen={mobileNav}
        setMobileOpen={setMobileNav}
      />
      <div className="lg:pl-[244px]">
        <Topbar
          onMenu={() => setMobileNav(true)}
          globalSearch={globalSearch}
          setGlobalSearch={setGlobalSearch}
          searchOpen={searchOpen}
          setSearchOpen={setSearchOpen}
          setSelected={setSelected}
          alertsOpen={alertsOpen}
          setAlertsOpen={setAlertsOpen}
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
  if (view === "qualification") return <Qualification />;

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

function Sidebar({
  view,
  setView,
  mobileOpen,
  setMobileOpen,
}: {
  view: View;
  setView: (v: View) => void;
  mobileOpen: boolean;
  setMobileOpen: (v: boolean) => void;
}) {
  const { logout, role, setRole, currentSellerId, setCurrentSellerId, sellers, sellerById } =
    useVyntra();
  const currentSeller = sellerById(currentSellerId || "carlos") ?? sellers[0]!;

  const navItems =
    role === "vendedor"
      ? [
          { id: "overview" as View, label: "Fila de atendimento", icon: Zap },
          { id: "opportunities" as View, label: "Meus leads", icon: Target },
          { id: "followups" as View, label: "Meus follow-ups", icon: CalendarClock },
          { id: "proposals" as View, label: "Minhas propostas", icon: FileText },
          { id: "qualification" as View, label: "Qualificação (Quiz)", icon: Bot },
        ]
      : NAV;

  const body = (
    <div className="flex h-full flex-col bg-sidebar px-3 py-4">
      <div className="shrink-0 px-3 pb-4">
        <Brand />
      </div>
      <ScrollArea className="flex-1 min-h-0 -mr-2 pr-2.5 custom-scrollbar">
        <div className="mb-2.5 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          {role === "gestor" ? "Gestão Comercial" : "Painel do Vendedor"}
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
                value={currentSellerId || "carlos"}
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
              ? "GC"
              : currentSeller.name
                  .split(" ")
                  .map((x) => x[0])
                  .join("")
                  .slice(0, 2)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">
              {role === "gestor" ? "Gestor Comercial" : currentSeller.name}
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
    <>
      <aside className="fixed inset-y-0 left-0 z-40 hidden w-[244px] border-r border-sidebar-border lg:block">
        {body}
      </aside>
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative h-full w-[280px] border-r border-border">{body}</aside>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-4"
            onClick={() => setMobileOpen(false)}
          >
            <X />
          </Button>
        </div>
      )}
    </>
  );
}

function Topbar({
  onMenu,
  globalSearch,
  setGlobalSearch,
  searchOpen,
  setSearchOpen,
  setSelected,
  alertsOpen,
  setAlertsOpen,
}: {
  onMenu: () => void;
  globalSearch: string;
  setGlobalSearch: (v: string) => void;
  searchOpen: boolean;
  setSearchOpen: (v: boolean) => void;
  setSelected: (v: string | null) => void;
  alertsOpen: boolean;
  setAlertsOpen: (v: boolean) => void;
}) {
  const {
    opportunities,
    sellerById,
    notifications,
    markNotificationRead,
    markAllNotificationsRead,
    role,
    currentSellerId,
  } = useVyntra();
  const currentSeller = sellerById(currentSellerId || "carlos");
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
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur-xl sm:px-6 lg:px-8">
      <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenu}>
        <Menu />
      </Button>
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
      <div className="hidden items-center gap-2 rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground xl:flex">
        <Bike className="size-4 text-primary" />
        {DEALERSHIP}
      </div>
      <div className="hidden rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[10px] font-bold tracking-wide text-primary sm:block">
        DEMO — Dados fictícios
      </div>
      <div className="relative">
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
          <div className="absolute right-0 top-12 w-[min(380px,calc(100vw-32px))] rounded-xl border border-border bg-popover shadow-2xl">
            <div className="flex items-center justify-between border-b border-border p-4">
              <div>
                <h3 className="font-semibold">Central de alertas</h3>
                <p className="text-xs text-muted-foreground">{unread} não lidos</p>
              </div>
              <Button variant="ghost" size="sm" onClick={markAllNotificationsRead}>
                Marcar como lidos
              </Button>
            </div>
            <div className="max-h-[480px] overflow-auto p-2">
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
      <div className="hidden h-8 items-center gap-2 border-l border-border pl-3 sm:flex">
        <div className="grid size-8 place-items-center rounded-lg bg-primary/15 text-xs font-bold text-primary">
          {role === "gestor"
            ? "GP"
            : (currentSeller?.name || "VD")
                .split(" ")
                .map((n) => n[0])
                .slice(0, 2)
                .join("")
                .toUpperCase()}
        </div>
        <div className="hidden xl:block">
          <div className="text-xs font-semibold">
            {role === "gestor" ? "Gestor Comercial" : currentSeller?.name || "Consultor"}
          </div>
          <div className="text-[10px] text-muted-foreground">
            {role === "gestor" ? "Gerência & Supervisão" : currentSeller?.specialty || "Consultor comercial"}
          </div>
        </div>
      </div>
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
  if (view === "overview") return <Overview setSelected={setSelected} />;
  if (view === "opportunities") return <OpportunitiesPage setSelected={setSelected} />;
  if (view === "distribution") return <Distribution />;
  if (view === "followups") return <FollowUps setSelected={setSelected} />;
  if (view === "proposals") return <Proposals setSelected={setSelected} />;
  if (view === "team") return <Team />;
  if (view === "insights") return <Insights />;
  if (view === "qualification") return <Qualification />;
  if (view === "impact") return <Impact />;
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
    <div className="panel p-4">
      <div className="flex items-start justify-between">
        <div className="text-xs font-medium text-muted-foreground">{label}</div>
        <I className={cn("size-4 text-primary", danger && "text-destructive")} />
      </div>
      <div className="mt-3 text-2xl font-semibold">{value}</div>
      {change && (
        <div
          className={cn(
            "mt-2 flex items-center gap-1 text-[11px]",
            danger ? "text-destructive" : "text-[color:var(--success)]",
          )}
        >
          <TrendingUp className="size-3" />
          {change}
        </div>
      )}
    </div>
  );
}

function Overview({ setSelected }: { setSelected: (v: string) => void }) {
  const { opportunities, followUps, now } = useVyntra();
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
    { n: "Recebidas", v: 142 },
    { n: "Qualificadas", v: 87 },
    { n: "Atendimento", v: 61 },
    { n: "Propostas", v: 28 },
    { n: "Negociação", v: 19 },
    { n: "Vendas", v: 11 },
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
    <>
      <PageHeader
        title="Visão geral"
        subtitle="Veja onde suas oportunidades estão e onde o dinheiro está sendo perdido."
        action={
          <div className="text-xs text-muted-foreground">Atualizado agora · Últimos 30 dias</div>
        }
      />
      {critical.length > 0 && (
        <div className="mb-5 flex flex-col justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 p-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <div className="grid size-9 place-items-center rounded-lg bg-destructive/15">
              <Flame className="size-5 text-destructive" />
            </div>
            <div>
              <div className="text-sm font-semibold">
                {critical.length} oportunidades muito quentes sem atendimento
              </div>
              <div className="text-xs text-muted-foreground">
                Ação imediata recomendada — potencial de{" "}
                {BRL(critical.reduce((a, o) => a + o.potentialValue, 0))}
              </div>
            </div>
          </div>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => setSelected(critical[0]?.id ?? "")}
          >
            Ver prioridade <ArrowRight />
          </Button>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 xl:grid-cols-8">
        <Kpi label="Oportunidades recebidas" value="142" change="+12% no período" icon={Target} />
        <Kpi label="Qualificadas" value="87" change="61,3% do total" icon={ShieldCheck} />
        <Kpi label="Muito quentes" value="24" change="17 precisam de ação" icon={Flame} />
        <Kpi label="Em atendimento" value="61" icon={MessageCircle} />
        <Kpi label="Propostas enviadas" value="28" change="+8% no período" icon={FileText} />
        <Kpi label="Vendas realizadas" value="11" change="+2 vs. período anterior" icon={Check} />
        <Kpi label="Oportunidades perdidas" value="19" danger icon={TrendingDown} />
        <Kpi label="Taxa de conversão" value="12,6%" change="+1,4 p.p." icon={TrendingUp} />
      </div>
      <div className="mt-3 grid gap-3 md:grid-cols-3">
        <Kpi label="Tempo médio de primeira resposta" value="8 min" icon={Clock3} />
        <Kpi
          label="Follow-ups atrasados"
          value={String(overdue.length)}
          danger
          icon={CalendarClock}
        />
        <Kpi
          label="Potencial comercial em aberto"
          value={BRL(recoverable)}
          change="23 oportunidades recuperáveis"
          icon={CircleDollarSign}
        />
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.45fr_0.8fr]">
        <section className="panel p-5">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <h2 className="text-base font-semibold">Funil de oportunidades</h2>
              <p className="mt-1 text-xs text-muted-foreground">Conversão por etapa comercial</p>
            </div>
            <div className="rounded-md bg-secondary px-2 py-1 text-[10px] text-muted-foreground">
              30 DIAS
            </div>
          </div>
          <div className="space-y-3">
            {stages.map((s, i) => (
              <div key={s.n} className="grid grid-cols-[90px_1fr_46px] items-center gap-3">
                <div>
                  <div className="text-sm font-semibold">{s.v}</div>
                  <div className="text-[10px] text-muted-foreground">{s.n}</div>
                </div>
                <div className="relative h-7 overflow-hidden rounded bg-secondary">
                  <div
                    className="h-full rounded bg-primary/70"
                    style={{ width: `${Math.max(12, (s.v / stages[0]!.v) * 100)}%` }}
                  />
                </div>
                <div className="text-right text-[10px] text-muted-foreground">
                  {i === 0 ? "100%" : `${Math.round((s.v / stages[i - 1]!.v) * 100)}%`}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 flex items-start gap-3 rounded-lg border border-[color:var(--warm)]/25 bg-[color:color-mix(in_oklab,var(--warm)_8%,transparent)] p-3">
            <Sparkles className="mt-0.5 size-4 shrink-0 text-[color:var(--warm)]" />
            <div className="text-xs leading-5">
              <strong>Insight Vyntra:</strong> você está perdendo oportunidades principalmente entre
              atendimento e proposta.
            </div>
          </div>
        </section>
        <section className="panel p-5">
          <h2 className="text-base font-semibold">Temperatura das oportunidades</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Prioridade calculada pelo Vyntra Score
          </p>
          <div className="mt-5 space-y-4">
            {temp.map((t) => {
              const m = TEMPERATURE_META[t.key];
              return (
                <div key={t.key}>
                  <div className="mb-1.5 flex items-center justify-between">
                    <span className="text-sm">
                      {m.emoji} {m.label}
                    </span>
                    <strong>{t.v}</strong>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-secondary">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${(t.v / opportunities.length) * 100}%`,
                        background: m.color,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mt-6 border-t border-border pt-4 text-[11px] leading-5 text-muted-foreground">
            Temperatura baseada em intenção de compra, prazo, orçamento, produto, forma de pagamento
            e comportamento.
          </p>
        </section>
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <PriorityList setSelected={setSelected} />
        <section className="panel p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">Dinheiro em risco agora</h2>
            <span className="text-lg font-semibold text-destructive">R$ 84.900</span>
          </div>
          {critical.slice(0, 3).map((o) => (
            <button
              key={o.id}
              onClick={() => setSelected(o.id)}
              className="flex w-full items-center gap-3 border-t border-border py-3 text-left"
            >
              <ScoreMini score={o.score} />
              <div className="flex-1">
                <div className="text-sm font-medium">{o.customer.name}</div>
                <div className="text-xs text-muted-foreground">
                  {o.product} · {o.objection}
                </div>
              </div>
              <div className="text-sm font-semibold">{BRL(o.potentialValue)}</div>
            </button>
          ))}
        </section>
      </div>
    </>
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
      className="grid size-9 shrink-0 place-items-center rounded-lg text-xs font-bold"
      style={{ color: m.color, background: `color-mix(in oklab, ${m.color} 13%, transparent)` }}
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
        ["all", "Temperaturas"],
        ["muito_quente", "Muito quente"],
        ["potencial", "Potencial"],
        ["morno", "Morno"],
        ["baixo", "Baixo potencial"],
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

function OpportunitiesPage({ setSelected }: { setSelected: (v: string) => void }) {
  const { opportunities, sellers, sellerById, assignLeads, now, role, currentSellerId } = useVyntra();
  const isSeller = role === "vendedor";
  const [f, setF] = useState(FILTER_INITIAL);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [targetSeller, setTargetSeller] = useState("");
  const list = opportunities.filter(
    (o) => (isSeller ? o.sellerId === currentSellerId : true) && applyFilters(o, f),
  );
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
      <PageHeader
        title={isSeller ? "Meus Leads & Oportunidades" : "Oportunidades"}
        subtitle={
          isSeller
            ? "Acompanhe e gerencie sua carteira individual de atendimento."
            : "Priorize, direcione e monitore cada oportunidade comercial."
        }
        action={
          <Button>
            <Plus />
            Nova oportunidade
          </Button>
        }
      />
      <div className="mb-3 relative max-w-sm">
        <Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" />
        <Input
          className="pl-9 bg-surface"
          placeholder="Buscar nesta lista..."
          value={f.search}
          onChange={(e) => setF({ ...f, search: e.target.value })}
        />
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
              <Send /> Enviar leads
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSelectedIds([])}>
              Cancelar
            </Button>
          </div>
        </div>
      )}
      <div className="panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1480px] text-left">
            <thead>
              <tr className="border-b border-border bg-surface-2/30 text-[10px] uppercase tracking-wider text-muted-foreground">
                {[
                  "Selecionar",
                  "Temperatura",
                  "Cliente",
                  "Região / Loja",
                  "Produto",
                  "Categoria",
                  "Forma de compra",
                  "Orçamento",
                  "Entrada",
                  "Prazo",
                  "Score",
                  "Responsável",
                  "Status",
                  "Último contato",
                  "Ação",
                ].map((h) => (
                  <th key={h} className="px-4 py-3 font-semibold">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {list.map((o) => {
                const tm = TEMPERATURE_META[temperatureOf(o.score)];
                const waiting = waitingMinutes(o, now);
                return (
                  <tr
                    key={o.id}
                    onClick={() => setSelected(o.id)}
                    className="cursor-pointer border-b border-border last:border-0 hover:bg-accent/40"
                  >
                    <td className="px-4 py-3" onClick={(event) => event.stopPropagation()}>
                      <Checkbox
                        aria-label={`Selecionar lead de ${o.customer.name}`}
                        checked={selectedIds.includes(o.id)}
                        onCheckedChange={() => toggleLead(o.id)}
                      />
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-lg">{tm.emoji}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium">{o.customer.name}</div>
                      <div className="text-[10px] text-muted-foreground">{o.id}</div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-0.5">
                        <span className="inline-flex items-center gap-1 font-semibold text-xs text-foreground">
                          <MapPin className="size-3 text-primary shrink-0" /> {o.store}
                        </span>
                        <span className="text-[10px] text-muted-foreground">
                          {o.city} · {o.state}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">{o.product}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{o.category}</td>
                    <td className="px-4 py-3 text-xs">{o.method}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{o.budget}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{o.downPayment}</td>
                    <td className="px-4 py-3 text-xs">{o.deadline}</td>
                    <td className="px-4 py-3">
                      <ScoreMini score={o.score} />
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {sellerById(o.sellerId)?.name.split(" ")[0]}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "rounded-md border px-2 py-1 text-[10px]",
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
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {relativeTime(o.lastContactAt, now)}
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal />
                      </Button>
                    </td>
                  </tr>
                );
              })}
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
          <span>Dados locais</span>
        </div>
      </div>
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
      <SheetContent className="w-full overflow-y-auto p-0 sm:max-w-[720px]">
        <div className="sticky top-0 z-10 border-b border-border bg-background/95 p-5 backdrop-blur">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-3">
              <div
                className="grid size-12 place-items-center rounded-xl text-lg font-bold"
                style={{
                  color: temp.color,
                  background: `color-mix(in oklab, ${temp.color} 13%, transparent)`,
                }}
              >
                {o.score}
              </div>
              <div>
                <div className="text-xl">{o.customer.name}</div>
                <SheetDescription>
                  {temp.emoji}{" "}
                  {o.score >= 80
                    ? "Alta probabilidade de compra"
                    : "Oportunidade em acompanhamento"}{" "}
                  · {o.id}
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
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" variant="outline" onClick={() => v.notifySeller(o.id)}>
                  Notificar responsável
                </Button>
                <Button size="sm" variant="destructive" onClick={() => v.escalate(o.id)}>
                  Escalar para gestor
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
        <div className={cn("font-bold", size === "lg" ? "text-2xl" : "text-lg")}>
          {score}
          <span className="text-[10px] text-muted-foreground">/100</span>
        </div>
        {size === "lg" && <div className="text-[9px] text-muted-foreground">VYNTRA SCORE</div>}
      </div>
    </div>
  );
}
function Distribution() {
  const v = useVyntra();
  const rules: Array<[keyof typeof v.distribution, string, string]> = [
    [
      "autoDistribution",
      "Distribuição automática",
      "Ativa o roteamento inteligente de novas oportunidades",
    ],
    ["byProduct", "Produto", "Relaciona especialidade do vendedor ao produto"],
    ["bySellerProfile", "Perfil do vendedor", "Considera experiência e taxa de conversão"],
    ["byAvailability", "Disponibilidade", "Prioriza vendedores online"],
    ["byWorkload", "Quantidade de oportunidades", "Equilibra a carga de atendimento"],
    ["byPriority", "Prioridade", "Direciona oportunidades quentes aos melhores tempos"],
  ];
  return (
    <>
      <PageHeader
        title="Distribuição inteligente"
        subtitle="Vyntra distribui oportunidades de acordo com produto, perfil, disponibilidade e carga de atendimento."
        action={
          <div className="rounded-full border border-[color:var(--success)]/30 bg-[color:color-mix(in_oklab,var(--success)_10%,transparent)] px-3 py-1.5 text-xs text-[color:var(--success)]">
            ● Distribuição ativa
          </div>
        }
      />
      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              Região Santa Catarina (SC)
            </span>
            <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] font-bold text-primary">
              {v.opportunities.filter((o) => o.store === "Lages / SC").length} leads
            </span>
          </div>
          <div className="mt-1.5 text-sm font-medium">Loja Central: Lages / SC</div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Cobertura regional: Lages, Capão Alto, Campo Belo, Correia Pinto, Palmeira, Bocaina, Painel, Otacílio, Ponte Alta, Cerro Negro e São José do Cerrito.
          </p>
          <div className="mt-2.5 flex flex-wrap gap-1">
            {LAGES_REGION_CITIES.map((c) => {
              const count = v.opportunities.filter((o) => o.city === c).length;
              return (
                <span
                  key={c}
                  className="inline-flex items-center gap-1 rounded-md border border-primary/25 bg-background/80 px-1.5 py-0.5 text-[10px] text-foreground"
                >
                  <span>{c}</span>
                  <span className="font-semibold text-primary">({count})</span>
                </span>
              );
            })}
          </div>
        </div>
        <div className="rounded-xl border border-[color:var(--violet)]/20 bg-[color:color-mix(in_oklab,var(--violet)_5%,transparent)] p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[color:var(--violet)]">
              Região Rio Grande do Sul (RS)
            </span>
            <span className="rounded-full bg-[color:color-mix(in_oklab,var(--violet)_20%,transparent)] px-2 py-0.5 text-[10px] font-bold text-[color:var(--violet)]">
              {v.opportunities.filter((o) => o.state === "RS").length} leads
            </span>
          </div>
          <div className="mt-1.5 text-sm font-medium">
            Lojas Centrais: Três Passos / RS ({v.opportunities.filter((o) => o.store === "Três Passos / RS").length}) · Santa Rosa / RS ({v.opportunities.filter((o) => o.store === "Santa Rosa / RS").length})
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Roteamento inteligente por proximidade entre Noroeste e Celeiro gaúcho.
          </p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {v.sellers.map((s) => {
          const own = v.opportunities.filter(
            (o) => o.sellerId === s.id && !["Venda", "Perdida"].includes(o.status),
          );
          return (
            <article key={s.id} className="panel p-4">
              <div className="flex items-start justify-between">
                <div className="grid size-10 place-items-center rounded-lg bg-primary/10 font-semibold text-primary">
                  {s.name
                    .split(" ")
                    .map((x) => x[0])
                    .join("")
                    .slice(0, 2)}
                </div>
                <span
                  className={cn(
                    "text-[10px]",
                    s.online ? "text-[color:var(--success)]" : "text-muted-foreground",
                  )}
                >
                  ● {s.online ? "Online" : "Offline"}
                </span>
              </div>
              <h3 className="mt-4 font-semibold">{s.name}</h3>
              <p className="text-xs text-muted-foreground">{s.specialty}</p>
              <div className="mt-3 flex flex-wrap gap-1 text-[10px] font-semibold">
                <span className="rounded-md border border-border bg-surface-2 px-1.5 py-0.5" title="Loja Lages / SC">
                  Lages: {own.filter((o) => o.store === "Lages / SC").length}
                </span>
                <span className="rounded-md border border-border bg-surface-2 px-1.5 py-0.5" title="Loja Três Passos / RS">
                  Três Passos: {own.filter((o) => o.store === "Três Passos / RS").length}
                </span>
                <span className="rounded-md border border-border bg-surface-2 px-1.5 py-0.5" title="Loja Santa Rosa / RS">
                  Santa Rosa: {own.filter((o) => o.store === "Santa Rosa / RS").length}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-border pt-4 text-center">
                <div>
                  <strong className="block text-lg">{own.length}</strong>
                  <span className="text-[9px] text-muted-foreground">OPORT.</span>
                </div>
                <div>
                  <strong className="block text-lg text-[color:var(--hot)]">
                    {own.filter((o) => o.score >= 80).length}
                  </strong>
                  <span className="text-[9px] text-muted-foreground">QUENTES</span>
                </div>
                <div>
                  <strong
                    className={cn(
                      "block text-lg",
                      s.avgResponseMinutes >= 10 && "text-destructive",
                    )}
                  >
                    {s.avgResponseMinutes}m
                  </strong>
                  <span className="text-[9px] text-muted-foreground">RESPOSTA</span>
                </div>
              </div>
            </article>
          );
        })}
      </div>
      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_0.8fr]">
        <section className="panel p-5">
          <h2 className="font-semibold">Regras de distribuição</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Ajuste os fatores considerados pelo motor de roteamento.
          </p>
          <div className="mt-4 divide-y divide-border">
            {rules.map(([key, title, desc]) => (
              <div key={key} className="flex items-center justify-between gap-4 py-4">
                <div>
                  <div className="text-sm font-medium">{title}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{desc}</div>
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
          <div className="mb-5 flex items-center gap-2">
            <RouteIcon className="size-5 text-primary" />
            <h2 className="font-semibold">Como uma oportunidade é roteada</h2>
          </div>
          {[
            "Vyntra recebe e qualifica a oportunidade",
            "Calcula prioridade e rota comercial",
            "Cruza produto, perfil e disponibilidade",
            "Distribui e inicia o timer de resposta",
            "Monitora atendimento e escala alertas",
          ].map((x, i) => (
            <div key={x} className="flex gap-3 pb-5 last:pb-0">
              <div className="relative grid size-7 shrink-0 place-items-center rounded-full bg-primary/15 text-xs font-bold text-primary">
                {i + 1}
                {i < 4 && <span className="absolute top-7 h-5 w-px bg-border" />}
              </div>
              <div className="pt-1 text-sm">{x}</div>
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
    ["amanha", "Amanhã", "text-[color:var(--cold)]"],
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
                      <div className="font-medium">{s.name}</div>
                      <div className="text-xs text-muted-foreground">{s.specialty}</div>
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
                <p className="text-xs text-muted-foreground">{seller.specialty}</p>
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
function Insights() {
  const loss = [
    { n: "Parcela incompatível", v: 35 },
    { n: "Sem entrada", v: 24 },
    { n: "Cliente não respondeu", v: 18 },
    { n: "Problema de crédito", v: 12 },
    { n: "Comprou outra marca", v: 7 },
    { n: "Outros", v: 4 },
  ];
  const colors = [
    "var(--hot)",
    "var(--warm)",
    "var(--mild)",
    "var(--cold)",
    "var(--violet)",
    "var(--muted-foreground)",
  ];
  return (
    <>
      <PageHeader
        title="Insights"
        subtitle="Entenda por que oportunidades avançam, travam ou são perdidas."
        action={
          <div className="flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs text-primary">
            <Sparkles className="size-3" />
            Análise simulada por IA
          </div>
        }
      />
      <div className="grid gap-5 xl:grid-cols-[1.15fr_0.85fr]">
        <section className="panel p-5">
          <h2 className="font-semibold">Por que estamos perdendo oportunidades?</h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Motivos registrados nos últimos 30 dias
          </p>
          <div className="mt-4 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={loss} layout="vertical" margin={{ left: 40 }}>
                <CartesianGrid stroke="var(--border)" horizontal={false} />
                <XAxis type="number" stroke="var(--muted-foreground)" fontSize={10} />
                <YAxis
                  type="category"
                  dataKey="n"
                  width={130}
                  stroke="var(--muted-foreground)"
                  fontSize={10}
                />
                <ChartTooltip
                  contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)" }}
                />
                <Bar dataKey="v" radius={[0, 5, 5, 0]}>
                  {loss.map((_, i) => (
                    <Cell key={i} fill={colors[i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
        <section className="panel p-5">
          <h2 className="font-semibold">Distribuição das perdas</h2>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={loss}
                  dataKey="v"
                  nameKey="n"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={2}
                >
                  {loss.map((_, i) => (
                    <Cell key={i} fill={colors[i]} />
                  ))}
                </Pie>
                <ChartTooltip
                  contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {loss.map((x, i) => (
              <div key={x.n} className="flex items-center gap-2 text-xs">
                <span className="size-2 rounded-full" style={{ background: colors[i] }} />
                <span className="text-muted-foreground">{x.n}</span>
                <strong className="ml-auto">{x.v}%</strong>
              </div>
            ))}
          </div>
        </section>
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {[
          [
            "Gargalo crítico",
            "Seu maior gargalo está entre qualificação e primeiro atendimento.",
            AlertTriangle,
          ],
          [
            "Velocidade converte",
            "Leads respondidos em até 5 minutos apresentam maior taxa de avanço.",
            Zap,
          ],
          [
            "Recuperação por rota",
            "Seminovas recuperam oportunidades que não se encaixam no orçamento de 0 km.",
            RouteIcon,
          ],
        ].map(([t, d, I]) => {
          const Icon = I as typeof Sparkles;
          return (
            <article key={String(t)} className="panel p-5">
              <div className="grid size-9 place-items-center rounded-lg bg-primary/10">
                <Icon className="size-4 text-primary" />
              </div>
              <h3 className="mt-4 font-semibold">{String(t)}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{String(d)}</p>
              <Button variant="link" className="mt-2 h-auto p-0">
                Explorar oportunidades <ArrowRight />
              </Button>
            </article>
          );
        })}
      </div>
    </>
  );
}

interface QuizQuestion {
  key: string;
  title: string;
  subtitle?: string;
  options: string[];
}

function getQuizQuestions(answers: Record<string, string>): QuizQuestion[] {
  const isSC = answers["estado"]?.includes("Santa Catarina");
  const isRS = answers["estado"]?.includes("Rio Grande do Sul");

  const regionQuestion: QuizQuestion = {
    key: "cidade_loja",
    title: isSC
      ? "Qual a sua cidade ou loja mais próxima em Santa Catarina?"
      : isRS
        ? "Qual a sua cidade ou loja mais próxima no Rio Grande do Sul?"
        : "Qual a sua cidade e loja de atendimento?",
    subtitle: isSC
      ? "Atendimento oficial pela concessionária de Lages / SC e municípios da Serra Catarinense"
      : isRS
        ? "Atendimento oficial pelas concessionárias de Três Passos / RS e Santa Rosa / RS"
        : "Selecione o estado no passo anterior",
    options: isSC
      ? [
          "Lages (Loja Central)",
          "Capão Alto",
          "Campo Belo",
          "Correia Pinto",
          "Palmeira",
          "Bocaina",
          "Painel",
          "Otacílio",
          "Ponte Alta",
          "Cerro Negro",
          "São José do Cerrito",
          "Outra cidade da Região de Lages / SC",
        ]
      : isRS
        ? [
            "Três Passos / RS (Loja Autorizada)",
            "Santa Rosa / RS (Loja Autorizada)",
            "Tenente Portela (Região Três Passos)",
            "Crissiumal (Região Três Passos)",
            "Giruá (Região Santa Rosa)",
            "Tuparendi (Região Santa Rosa)",
            "Outra cidade do Rio Grande do Sul",
          ]
        : [
            "Lages / SC",
            "Três Passos / RS",
            "Santa Rosa / RS",
          ],
  };

  return [
    {
      key: "estado",
      title: "Em qual estado/região você está localizado?",
      subtitle: "Direcionamos você para o time comercial oficial da sua região",
      options: ["Santa Catarina (SC)", "Rio Grande do Sul (RS)"],
    },
    regionQuestion,
    {
      key: "produto",
      title: "O que você está procurando?",
      options: ["Honda 0 km", "Honda seminova", "Ainda não sei"],
    },
    {
      key: "forma",
      title: "Como pretende comprar?",
      options: ["Financiamento", "Consórcio", "À vista", "Ainda não sei"],
    },
    {
      key: "orcamento",
      title: "Quanto pretende investir por mês?",
      options: ["Até R$300", "R$300–500", "R$500–700", "R$700–1.000", "R$1.000+"],
    },
    { key: "entrada", title: "Possui entrada?", options: ["Sim", "Não", "Ainda não"] },
    {
      key: "prazo",
      title: "Quando pretende comprar?",
      options: [
        "Próximos 7 dias",
        "Até 30 dias",
        "1–3 meses",
        "Mais de 3 meses",
        "Apenas pesquisando",
      ],
    },
    {
      key: "simulacao",
      title: "Já fez alguma simulação ou falou com uma loja?",
      options: ["Já estou negociando", "Já simulei", "Apenas pesquisei", "Não"],
    },
    { key: "moto", title: "Possui uma moto atualmente?", options: ["Sim", "Não"] },
    {
      key: "objecao",
      title: "O que está impedindo a compra hoje?",
      options: [
        "Preciso financiar",
        "Não tenho entrada",
        "Preciso de parcela menor",
        "Questão de crédito",
        "Estou comparando opções",
        "Estou juntando dinheiro",
        "Nada",
        "Outro",
      ],
    },
  ];
}

function resolveLeadLocation(answers: Record<string, string>): {
  state: LeadState;
  store: LeadStore;
  city: string;
  region: string;
} {
  const isSC = answers["estado"]?.includes("Santa Catarina") || answers["estado"] === "SC";
  const cityRaw = answers["cidade_loja"] || (isSC ? "Lages" : "Três Passos");
  const cleanCity = cityRaw.split("(")[0]?.split("/")[0]?.trim() || (isSC ? "Lages" : "Três Passos");

  const lagesKeywords = [
    "lages",
    "capão alto",
    "capao alto",
    "campo belo",
    "correia pinto",
    "palmeira",
    "bocaina",
    "painel",
    "otacílio",
    "otacilio",
    "ponte alta",
    "cerro negro",
    "são josé do cerrito",
    "sao jose do cerrito",
    "cerrito",
  ];

  const matchesLages = lagesKeywords.some((kw) => cityRaw.toLowerCase().includes(kw));

  if (isSC || matchesLages) {
    return {
      state: "SC",
      store: "Lages / SC",
      city: cleanCity,
      region: "Santa Catarina",
    };
  }

  const isSantaRosa =
    cityRaw.includes("Santa Rosa") ||
    cityRaw.includes("Giruá") ||
    cityRaw.includes("Tuparendi");

  return {
    state: "RS",
    store: isSantaRosa ? "Santa Rosa / RS" : "Três Passos / RS",
    city: cleanCity,
    region: "Rio Grande do Sul",
  };
}

const ANSWER_LABELS: Record<string, string> = {
  estado: "Estado",
  cidade_loja: "Cidade / Loja",
  produto: "Produto",
  forma: "Forma de compra",
  orcamento: "Orçamento mensal",
  entrada: "Entrada",
  prazo: "Prazo de compra",
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

  const questions = useMemo(() => getQuizQuestions(answers), [answers]);
  const result = computeScore(answers);
  const m = TEMPERATURE_META[temperatureOf(result.score)];
  const q = questions[step];
  const isLast = step === questions.length - 1;
  const loc = resolveLeadLocation(answers);

  const handleSelectOption = (key: string, option: string) => {
    if (key === "estado" && answers["estado"] !== option) {
      const next: Record<string, string> = { ...answers, [key]: option };
      delete next["cidade_loja"];
      setAnswers(next);
    } else {
      setAnswers({ ...answers, [key]: option });
    }
  };

  const handleCreateLead = () => {
    if (createdLeadId) return;
    const newId = addOpportunityFromQuiz({
      customer: {
        name: `Lead Qualificado (${loc.city})`,
        whatsapp: `(${loc.state === "SC" ? "49" : "55"}) 9${Math.floor(8000 + Math.random() * 1999)}-${Math.floor(1000 + Math.random() * 8999)}`,
      },
      state: loc.state,
      store: loc.store,
      city: loc.city,
      product: answers["produto"] || "Honda 0 km",
      category: answers["produto"] === "Honda seminova" ? "Seminova" : "0 km",
      method: (answers["forma"] as PurchaseMethod) || "Financiamento",
      budget: answers["orcamento"] || "R$700–1.000",
      downPayment: answers["entrada"] === "Sim" ? "R$ 5.000" : "Sem entrada",
      deadline: answers["prazo"] || "Até 30 dias",
      score: result.score,
      scoreReasons: result.reasons,
      objection: answers["objecao"] || "Preciso financiar",
      route: {
        primary: answers["produto"] === "Honda seminova" ? "Seminova" : "Financiamento",
        alternative: "Consórcio",
        rationale: `Lead qualificado para atendimento presencial na concessionária ${loc.store} (${loc.city}).`,
        budgetFit: result.score >= 70 ? "alta" : "média",
      },
    });
    setCreatedLeadId(newId);
  };

  if (done)
    return (
      <>
        <PageHeader
          title="Qualificação concluída"
          subtitle="Demonstração do Vyntra Score, direcionamento regional e rota comercial sugerida."
        />
        <div className="grid gap-5 lg:grid-cols-[0.7fr_1.3fr]">
          <section className="panel flex flex-col items-center p-8 text-center">
            <ScoreRing score={result.score} size="lg" />
            <div className="mt-4 text-xl font-semibold" style={{ color: m.color }}>
              {m.emoji} {m.label}
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              {result.score >= 80
                ? "Alta intenção de compra"
                : result.score >= 60
                  ? "Bom potencial comercial"
                  : "Requer acompanhamento consultivo"}
            </p>

            <div className="mt-5 w-full rounded-xl border border-primary/30 bg-primary/5 p-4 text-left">
              <div className="text-[10px] font-bold uppercase tracking-wider text-primary">
                Unidade Regional de Atendimento
              </div>
              <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-foreground">
                <MapPin className="size-4 text-primary shrink-0" />
                {loc.store}
              </div>
              <div className="mt-1 text-xs text-muted-foreground">
                Cidade: <strong>{loc.city}</strong> · Região: <strong>{loc.region}</strong>
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-2 w-full">
              {createdLeadId ? (
                <div className="rounded-lg border border-[color:var(--success)]/40 bg-[color:color-mix(in_oklab,var(--success)_10%,transparent)] p-3 text-xs text-[color:var(--success)] font-medium">
                  ✓ Lead <strong>{createdLeadId}</strong> direcionado para <strong>{loc.store}</strong>!
                </div>
              ) : (
                <Button className="w-full" onClick={handleCreateLead}>
                  <Send className="mr-1.5 size-4" />
                  Salvar e enviar para {loc.store}
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
                Nova simulação
              </Button>
            </div>
          </section>
          <section className="space-y-5">
            <div className="panel p-5">
              <h2 className="font-semibold">Razões do score & Região</h2>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {result.reasons.map((r) => (
                  <div key={r} className="flex gap-2 text-sm text-muted-foreground">
                    <Check className="mt-0.5 size-4 shrink-0 text-[color:var(--success)]" />
                    {r}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border border-primary/30 bg-primary/5 p-5">
              <div className="text-xs font-bold text-primary">ROTA COMERCIAL SUGERIDA</div>
              <div className="mt-3 text-lg font-semibold">
                {answers["produto"] === "Honda 0 km" &&
                (answers["orcamento"] === "Até R$300" || answers["orcamento"] === "R$300–500")
                  ? "Seminova — alternativa recomendada"
                  : "Financiamento — principal"}
              </div>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Opção recomendada para avaliação conforme intenção, orçamento e momento de compra.
                Encaminhamento automático para concessionária <strong>{loc.store}</strong>.
              </p>
            </div>
          </section>
        </div>
      </>
    );

  return (
    <>
      <PageHeader
        title="Como a Vyntra qualifica"
        subtitle="Simule a jornada de qualificação e veja o score ser formado em tempo real."
      />
      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <section className="panel p-5 sm:p-8">
          <div className="mb-8 flex gap-1">
            {questions.map((_, i) => (
              <div
                key={i}
                className={cn("h-1 flex-1 rounded-full", i <= step ? "bg-primary" : "bg-secondary")}
              />
            ))}
          </div>
          <div className="text-xs font-semibold text-primary">
            PERGUNTA {step + 1} DE {questions.length}
          </div>
          <h2 className="mt-2 text-2xl font-semibold">{q?.title}</h2>
          {q?.subtitle && (
            <p className="mt-1 text-sm text-muted-foreground">{q.subtitle}</p>
          )}
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {q?.options.map((o) => (
              <Button
                key={o}
                variant={answers[q.key] === o ? "default" : "outline"}
                className="h-auto min-h-12 justify-start whitespace-normal py-3 text-left"
                onClick={() => handleSelectOption(q.key, o)}
              >
                {answers[q.key] === o && <Check />}
                {o}
              </Button>
            ))}
          </div>
          <div className="mt-8 flex justify-between">
            <Button variant="ghost" disabled={step === 0} onClick={() => setStep(step - 1)}>
              Voltar
            </Button>
            <Button
              disabled={!q || !answers[q.key]}
              onClick={() => (isLast ? setDone(true) : setStep(step + 1))}
            >
              {isLast ? "Calcular Vyntra Score" : "Continuar"}
              <ArrowRight />
            </Button>
          </div>
        </section>
        <aside className="panel p-5">
          <div className="flex items-center gap-3">
            <Gauge className="size-5 text-primary" />
            <div>
              <h3 className="font-semibold">Score em construção</h3>
              <p className="text-xs text-muted-foreground">Atualiza a cada resposta</p>
            </div>
          </div>
          <div className="mt-5 flex justify-center">
            <ScoreRing score={result.score} size="lg" />
          </div>
          {answers["estado"] && (
            <div className="mt-4 rounded-lg border border-primary/30 bg-primary/10 p-2.5 text-xs">
              <span className="font-semibold text-primary">Unidade prevista:</span>
              <div className="mt-0.5 font-medium text-foreground">{loc.store}</div>
            </div>
          )}
          <div className="mt-4 space-y-2">
            {Object.entries(answers).map(([k, val]) => (
              <div key={k} className="rounded-md bg-secondary px-3 py-2 text-xs">
                <span className="text-muted-foreground">{ANSWER_LABELS[k] ?? k}: </span>
                <span className="font-medium text-foreground">{val}</span>
              </div>
            ))}
          </div>
          <div className="mt-5 border-t border-border pt-4 text-[10px] leading-4 text-muted-foreground">
            Ao continuar, o cliente concorda com o uso dos dados para contato comercial. Nenhuma
            consulta de CPF ou análise de crédito é realizada.
          </div>
        </aside>
      </div>
    </>
  );
}

function Impact() {
  return (
    <>
      <PageHeader
        title="Impacto comercial"
        subtitle="Quanto valor a operação pode recuperar ao priorizar e agir no momento certo."
        action={
          <span className="rounded-full border border-border bg-secondary px-3 py-1 text-[10px] text-muted-foreground">
            DADOS SIMULADOS · DEMONSTRAÇÃO
          </span>
        }
      />
      <div className="grid gap-3 md:grid-cols-5">
        <Kpi label="Investimento em oportunidades" value="R$ 18.500" icon={CircleDollarSign} />
        <Kpi label="Oportunidades recebidas" value="142" icon={Target} />
        <Kpi label="Oportunidades qualificadas" value="87" icon={ShieldCheck} />
        <Kpi label="Oportunidades recuperáveis" value="23" icon={RefreshCw} />
        <Kpi
          label="Potencial recuperável"
          value="R$ 126.000"
          change="Estimativa demonstrativa"
          icon={TrendingUp}
        />
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-destructive/30 bg-destructive/5 p-6">
          <div className="text-xs font-bold text-destructive">SEM VYNTRA</div>
          <h2 className="mt-3 text-2xl font-semibold">Decisões reativas</h2>
          <div className="mt-7 space-y-5">
            {[
              ["Oportunidades sem resposta", "31"],
              ["Follow-ups esquecidos", "18"],
              ["Potencial perdido estimado", "R$ 198.000"],
              ["Tempo médio de resposta", "24 min"],
            ].map(([a, b]) => (
              <div
                key={a}
                className="flex items-center justify-between border-b border-destructive/15 pb-3"
              >
                <span className="text-sm text-muted-foreground">{a}</span>
                <strong className="text-lg">{b}</strong>
              </div>
            ))}
          </div>
        </section>
        <section className="rounded-xl border border-[color:var(--success)]/30 bg-[color:color-mix(in_oklab,var(--success)_5%,transparent)] p-6">
          <div className="text-xs font-bold text-[color:var(--success)]">COM VYNTRA</div>
          <h2 className="mt-3 text-2xl font-semibold">Ação priorizada</h2>
          <div className="mt-7 space-y-5">
            {[
              ["Oportunidades priorizadas", "87"],
              ["Oportunidades recuperáveis", "23"],
              ["Potencial comercial recuperável", "R$ 126.000"],
              ["Tempo médio de resposta", "8 min"],
            ].map(([a, b]) => (
              <div
                key={a}
                className="flex items-center justify-between border-b border-[color:var(--success)]/15 pb-3"
              >
                <span className="text-sm text-muted-foreground">{a}</span>
                <strong className="text-lg">{b}</strong>
              </div>
            ))}
          </div>
        </section>
      </div>
      <div className="mt-5 panel p-6">
        <div className="grid items-center gap-6 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <div className="text-xs font-semibold text-primary">IMPACTO PROJETADO</div>
            <div className="mt-2 text-4xl font-semibold">+R$ 126 mil</div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Potencial de oportunidades recuperáveis quando velocidade, follow-up e rota comercial
              são aplicados de forma consistente.
            </p>
          </div>
          <div className="h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={[
                  { n: "Perdido", sem: 198, com: 72 },
                  { n: "Recuperado", sem: 0, com: 126 },
                  { n: "Convertido", sem: 84, com: 142 },
                ]}
              >
                <CartesianGrid stroke="var(--border)" vertical={false} />
                <XAxis dataKey="n" stroke="var(--muted-foreground)" fontSize={11} />
                <YAxis stroke="var(--muted-foreground)" fontSize={10} />
                <ChartTooltip
                  contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)" }}
                />
                <Bar
                  name="Sem Vyntra"
                  dataKey="sem"
                  fill="var(--destructive)"
                  radius={[3, 3, 0, 0]}
                />
                <Bar name="Com Vyntra" dataKey="com" fill="var(--success)" radius={[3, 3, 0, 0]} />
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
  const sellerId = v.currentSellerId || "carlos";
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
