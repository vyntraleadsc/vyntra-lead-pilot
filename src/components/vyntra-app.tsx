import { useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bell,
  Bike,
  Bot,
  BriefcaseBusiness,
  CalendarClock,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Eye,
  EyeOff,
  FileText,
  Flame,
  Gauge,
  LayoutDashboard,
  LogOut,
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
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
  UserRound,
  UsersRound,
  MapPin,
  X,
  Zap,
} from "lucide-react";
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
import { DEMO_CREDENTIALS, DEALERSHIP } from "@/lib/vyntra/mock-data";
import { useVyntra } from "@/lib/vyntra/store";
import type {
  CommercialRoute,
  FollowUpBucket,
  LeadState,
  LeadStore,
  Opportunity,
  OpportunityFilters,
  OpportunityStatus,
  PurchaseMethod,
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
  { id: "settings", label: "Configurações", icon: Settings },
];

const FILTER_INITIAL: OpportunityFilters = {
  search: "",
  period: "30d",
  state: "all",
  store: "all",
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

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center gap-2.5">
      <div className="relative grid size-8 place-items-center rounded-lg border border-primary/40 bg-primary/10">
        <div className="h-3.5 w-3.5 rotate-45 border-b-2 border-r-2 border-primary" />
        <span className="absolute -right-0.5 -top-0.5 size-1.5 rounded-full bg-[color:var(--violet)]" />
      </div>
      {!compact && (
        <span className="font-display text-[19px] font-bold tracking-[0.16em] text-foreground">
          VYNTRA
        </span>
      )}
    </div>
  );
}

function Login() {
  const { login } = useVyntra();
  const [email, setEmail] = useState(DEMO_CREDENTIALS.email);
  const [password, setPassword] = useState(DEMO_CREDENTIALS.password);
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");

  return (
    <main className="grid min-h-screen lg:grid-cols-[1.1fr_0.9fr]">
      <section className="relative hidden overflow-hidden border-r border-border bg-sidebar p-12 lg:flex lg:flex-col">
        <div className="absolute inset-0 grid-noise opacity-50" />
        <div className="relative z-10">
          <Brand />
        </div>
        <div className="relative z-10 my-auto max-w-xl">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary">
            <Sparkles className="size-3.5" /> INTELIGÊNCIA COMERCIAL
          </div>
          <h1 className="text-5xl font-semibold leading-[1.08] text-foreground">
            Da oportunidade ao resultado, <span className="text-primary">sem perder o timing.</span>
          </h1>
          <p className="mt-6 max-w-lg text-lg leading-8 text-muted-foreground">
            Qualifique, priorize e direcione cada oportunidade para a melhor rota comercial.
          </p>
          <div className="mt-12 grid grid-cols-3 gap-3">
            {[
              ["QUALIFICAR", "Entender intenção"],
              ["PRIORIZAR", "Agir no momento"],
              ["RECUPERAR", "Reduzir perdas"],
            ].map(([a, b]) => (
              <div key={a} className="border-l-2 border-primary/40 pl-3">
                <div className="text-xs font-bold text-foreground">{a}</div>
                <div className="mt-1 text-xs text-muted-foreground">{b}</div>
              </div>
            ))}
          </div>
        </div>
        <p className="relative z-10 text-xs text-muted-foreground">
          VYNTRA · Ambiente seguro de demonstração
        </p>
      </section>
      <section className="flex items-center justify-center bg-background px-5 py-12">
        <div className="w-full max-w-md">
          <div className="mb-10 lg:hidden">
            <Brand />
          </div>
          <div className="mb-8">
            <div className="mb-4 flex items-center gap-2 text-xs font-semibold text-primary">
              <span className="size-1.5 rounded-full bg-primary" /> ACESSO À PLATAFORMA
            </div>
            <h2 className="text-3xl font-semibold">Bem-vindo à Vyntra</h2>
            <p className="mt-2 text-muted-foreground">
              Inteligência para transformar oportunidades em resultados.
            </p>
          </div>
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (!login(email, password))
                setError("E-mail ou senha inválidos. Use o acesso de demonstração.");
            }}
          >
            <label className="block text-sm font-medium">
              E-mail
              <Input
                className="mt-2 h-11 bg-surface"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                }}
              />
            </label>
            <label className="block text-sm font-medium">
              Senha
              <div className="relative mt-2">
                <Input
                  className="h-11 bg-surface pr-11"
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
                  className="absolute right-1 top-1"
                  onClick={() => setShow(!show)}
                  aria-label={show ? "Ocultar senha" : "Mostrar senha"}
                >
                  {show ? <EyeOff /> : <Eye />}
                </Button>
              </div>
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="size-4 accent-primary"
              />{" "}
              Lembrar de mim
            </label>
            {error && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {error}
              </div>
            )}
            <Button className="h-11 w-full font-semibold" type="submit">
              Entrar <ArrowRight />
            </Button>
          </form>
          <div className="mt-7 rounded-xl border border-primary/25 bg-primary/5 p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-primary">
              <ShieldCheck className="size-4" /> ACESSO DE DEMONSTRAÇÃO
            </div>
            <div className="grid grid-cols-[80px_1fr] gap-y-2 text-sm">
              <span className="text-muted-foreground">E-mail</span>
              <span className="font-medium">gestor@vyntra.com</span>
              <span className="text-muted-foreground">Senha</span>
              <span className="font-medium">123456</span>
            </div>
          </div>
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
            <SellerDashboard setSelected={setSelected} />
          ) : (
            <ManagerView view={view} setSelected={setSelected} />
          )}
        </main>
      </div>
      <OpportunityDrawer id={selected} onClose={() => setSelected(null)} />
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
  const { logout, role, setRole } = useVyntra();
  const body = (
    <div className="flex h-full flex-col bg-sidebar px-3 py-4">
      <div className="shrink-0 px-3 pb-4">
        <Brand />
      </div>
      <ScrollArea className="flex-1 min-h-0 -mr-2 pr-2.5 custom-scrollbar">
        <div className="mb-2.5 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-muted-foreground">
          Navegação
        </div>
        <nav className="space-y-1 pb-4">
          {NAV.map((item) => {
            const I = item.icon;
            return (
              <Button
                key={item.id}
                variant="ghost"
                onClick={() => setView(item.id)}
                className={cn(
                  "h-10 w-full justify-start px-3 text-muted-foreground",
                  view === item.id &&
                    role === "gestor" &&
                    "bg-sidebar-accent text-sidebar-accent-foreground shadow-[inset_2px_0_0_var(--primary)]",
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
          <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
            Visualizar como
          </div>
          <div className="grid grid-cols-2 gap-1 rounded-md bg-background p-1">
            <Button
              variant={role === "gestor" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setRole("gestor")}
            >
              Gestor
            </Button>
            <Button
              variant={role === "vendedor" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setRole("vendedor")}
            >
              Carlos
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-3 border-t border-border pt-3">
          <div className="grid size-9 shrink-0 place-items-center rounded-lg bg-primary/15 text-sm font-bold text-primary">
            GP
          </div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-sm font-semibold">Gestor</div>
            <div className="truncate text-[11px] text-muted-foreground">gestor@vyntra.com</div>
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
  } = useVyntra();
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
          {role === "gestor" ? "GP" : "CM"}
        </div>
        <div className="hidden xl:block">
          <div className="text-xs font-semibold">{role === "gestor" ? "Gestor" : "Carlos"}</div>
          <div className="text-[10px] text-muted-foreground">
            {role === "gestor" ? "Gerência comercial" : "Consultor"}
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
  setSelected,
}: {
  view: View;
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
  return <SettingsPage />;
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
}: {
  filters: OpportunityFilters;
  setFilters: (v: OpportunityFilters) => void;
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
    setFilters({ ...filters, state: newState, store: nextStore });
  };

  const select = (key: keyof OpportunityFilters, label: string, items: Array<[string, string]>) => (
    <Select value={filters[key]} onValueChange={(v) => setFilters({ ...filters, [key]: v })}>
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
      {select("sellerId", "Vendedor", [
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
          setFilters({ ...filters, store: v, state: nextState });
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
  const { opportunities, sellers, sellerById, assignLeads, now } = useVyntra();
  const [f, setF] = useState(FILTER_INITIAL);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [targetSeller, setTargetSeller] = useState("");
  const list = opportunities.filter((o) => applyFilters(o, f));
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
        title="Oportunidades"
        subtitle="Priorize, direcione e monitore cada oportunidade comercial."
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
      <FilterBar filters={f} setFilters={setF} />
      {selectedIds.length > 0 && (
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
            Atendimento para Lages, Correia Pinto, São Joaquim, Urubici e planalto catarinense.
          </p>
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
  const active = v.followUps.filter((f) => !f.done);
  const buckets: Array<[FollowUpBucket, string, string]> = [
    ["atrasado", "Atrasados", "text-destructive"],
    ["hoje", "Hoje", "text-primary"],
    ["amanha", "Amanhã", "text-[color:var(--cold)]"],
    ["proximos", "Próximos dias", "text-muted-foreground"],
  ];
  return (
    <>
      <PageHeader
        title="Follow-ups"
        subtitle="Próximas ações organizadas por urgência e potencial comercial."
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
  const stages = [
    "Rascunho",
    "Enviada",
    "Visualizada",
    "Aguardando retorno",
    "Negociação",
    "Fechada",
    "Perdida",
  ] as const;
  return (
    <>
      <PageHeader
        title="Propostas"
        subtitle="Acompanhe cada condição enviada até o fechamento."
        action={
          <div className="text-sm">
            <span className="text-muted-foreground">Volume em negociação </span>
            <strong>
              {BRL(
                v.proposals
                  .filter((p) => !["Fechada", "Perdida"].includes(p.status))
                  .reduce((a, p) => a + p.value, 0),
              )}
            </strong>
          </div>
        }
      />
      <div className="mb-5 flex gap-3 overflow-x-auto pb-2">
        {stages.map((s) => (
          <div key={s} className="min-w-[150px] rounded-lg border border-border bg-surface p-3">
            <div className="text-xs text-muted-foreground">{s}</div>
            <div className="mt-1 text-xl font-semibold">
              {v.proposals.filter((p) => p.status === s).length}
            </div>
          </div>
        ))}
      </div>
      <div className="grid gap-4 xl:grid-cols-4">
        {stages
          .filter((s) => !["Fechada", "Perdida"].includes(s))
          .map((stage) => (
            <section key={stage} className="rounded-xl border border-border bg-surface/40 p-3">
              <div className="mb-3 flex items-center justify-between">
                <h2 className="text-sm font-semibold">{stage}</h2>
                <span className="text-xs text-muted-foreground">
                  {v.proposals.filter((p) => p.status === stage).length}
                </span>
              </div>
              <div className="space-y-3">
                {v.proposals
                  .filter((p) => p.status === stage)
                  .map((p) => {
                    const o = v.opportunityById(p.opportunityId);
                    if (!o) return null;
                    return (
                      <article
                        key={p.id}
                        className="rounded-lg border border-border bg-surface p-3"
                      >
                        <button className="w-full text-left" onClick={() => setSelected(o.id)}>
                          <div className="text-sm font-semibold">{o.customer.name}</div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            {o.product} · {p.method}
                          </div>
                          <div className="mt-3 text-lg font-semibold">{BRL(p.value)}</div>
                          <div className="text-xs text-muted-foreground">
                            {p.installment
                              ? `Parcela estimada ${BRL(p.installment)}`
                              : "Pagamento à vista"}
                          </div>
                          <div className="mt-2 text-[10px] text-muted-foreground">
                            Responsável: {v.sellerById(p.sellerId)?.name}
                          </div>
                        </button>
                        <div className="mt-3 flex gap-1">
                          <Button
                            size="sm"
                            variant="secondary"
                            className="flex-1"
                            onClick={() => {
                              const i = stages.indexOf(stage);
                              const next = stages[Math.min(i + 1, 5)];
                              if (next) v.setProposalStatus(p.id, next);
                            }}
                          >
                            Avançar <ArrowRight />
                          </Button>
                        </div>
                      </article>
                    );
                  })}
              </div>
            </section>
          ))}
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
          "Lages / SC (Loja Autorizada)",
          "Correia Pinto (Região Lages)",
          "São Joaquim (Região Lages)",
          "Urubici (Região Lages)",
          "Outra cidade de Santa Catarina (Atendimento Lages)",
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

  if (isSC) {
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

function SettingsPage() {
  const v = useVyntra();
  return (
    <>
      <PageHeader
        title="Configurações"
        subtitle="Parâmetros do ambiente e preferências da operação."
      />
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
  const own = v.opportunities.filter(
    (o) => o.sellerId === "carlos" && !["Venda", "Perdida"].includes(o.status),
  );
  const hot = own.filter((o) => o.score >= 80);
  const overdue = v.followUps.filter(
    (f) =>
      !f.done && new Date(f.dueAt).getTime() < v.now && own.some((o) => o.id === f.opportunityId),
  );
  const proposals = v.proposals.filter(
    (p) => p.sellerId === "carlos" && !["Fechada", "Perdida"].includes(p.status),
  );
  return (
    <>
      <PageHeader
        title="Olá, Carlos."
        subtitle={`Você possui ${own.length} oportunidades aguardando ação.`}
        action={
          <div className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1.5 text-xs text-primary">
            Painel do vendedor
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
