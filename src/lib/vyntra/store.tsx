import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { toast } from "sonner";
import {
  DEMO_CREDENTIALS,
  SELLERS,
  buildFollowUps,
  buildNotifications,
  buildOpportunities,
  buildProposals,
} from "./mock-data";
import type {
  AppNotification,
  CommercialRoute,
  DistributionRules,
  FollowUp,
  Opportunity,
  OpportunityStatus,
  Proposal,
  ProposalStatus,
  Seller,
} from "./types";

const STORAGE_KEY = "vyntra-demo-state-v1";

export type RoleView = "gestor" | "vendedor";

interface PersistedState {
  authed: boolean;
  role: RoleView;
  opportunities: Opportunity[];
  followUps: FollowUp[];
  proposals: Proposal[];
  notifications: AppNotification[];
  distribution: DistributionRules;
}

function initialState(): PersistedState {
  const opportunities = buildOpportunities();
  return {
    authed: false,
    role: "gestor",
    opportunities,
    followUps: buildFollowUps(opportunities),
    proposals: buildProposals(opportunities),
    notifications: buildNotifications(opportunities),
    distribution: {
      autoDistribution: true,
      byProduct: true,
      bySellerProfile: true,
      byAvailability: true,
      byWorkload: true,
      byPriority: false,
    },
  };
}

interface VyntraContextValue extends PersistedState {
  hydrated: boolean;
  sellers: Seller[];
  now: number;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  setRole: (role: RoleView) => void;
  resetDemo: () => void;
  setStatus: (id: string, status: OpportunityStatus) => void;
  registerContact: (id: string) => void;
  simulateWhatsApp: (id: string) => void;
  assignSeller: (id: string, sellerId: string) => void;
  changeRoute: (id: string, route: CommercialRoute) => void;
  sendProposal: (id: string) => void;
  setProposalStatus: (id: string, status: ProposalStatus) => void;
  scheduleFollowUp: (opportunityId: string, hoursFromNow: number, action: string) => void;
  completeFollowUp: (id: string) => void;
  rescheduleFollowUp: (id: string, hoursFromNow: number) => void;
  notifySeller: (opportunityId: string) => void;
  escalate: (opportunityId: string) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  toggleDistributionRule: (key: keyof DistributionRules) => void;
  sellerById: (id: string) => Seller | undefined;
  opportunityById: (id: string) => Opportunity | undefined;
}

const VyntraContext = createContext<VyntraContextValue | null>(null);

export function VyntraProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(() => initialState());
  const [hydrated, setHydrated] = useState(false);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) setState(JSON.parse(stored) as PersistedState);
    } catch {
      /* ignore corrupted demo state */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable */
    }
  }, [state, hydrated]);

  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 15000);
    return () => window.clearInterval(t);
  }, []);

  const patchOpportunity = useCallback((id: string, patch: Partial<Opportunity>) => {
    setState((s) => ({
      ...s,
      opportunities: s.opportunities.map((o) => (o.id === id ? { ...o, ...patch } : o)),
    }));
  }, []);

  const value = useMemo<VyntraContextValue>(() => {
    const sellerById = (id: string) => SELLERS.find((s) => s.id === id);
    const opportunityById = (id: string) => state.opportunities.find((o) => o.id === id);
    const nameOf = (id: string) => opportunityById(id)?.customer.name ?? "Cliente";

    const pushNotification = (n: Omit<AppNotification, "id" | "createdAt" | "read">) =>
      setState((s) => ({
        ...s,
        notifications: [
          { ...n, id: `NT-${Math.random().toString(36).slice(2, 8)}`, read: false, createdAt: new Date().toISOString() },
          ...s.notifications,
        ],
      }));

    return {
      ...state,
      hydrated,
      now,
      sellers: SELLERS,
      sellerById,
      opportunityById,
      login: (email, password) => {
        const ok =
          email.trim().toLowerCase() === DEMO_CREDENTIALS.email && password === DEMO_CREDENTIALS.password;
        if (ok) setState((s) => ({ ...s, authed: true }));
        return ok;
      },
      logout: () => setState((s) => ({ ...s, authed: false, role: "gestor" })),
      setRole: (role) => setState((s) => ({ ...s, role })),
      resetDemo: () => {
        setState({ ...initialState(), authed: true });
        toast.success("Ambiente de demonstração reiniciado.");
      },
      setStatus: (id, status) => {
        patchOpportunity(id, { status });
        toast.success(`Status atualizado para “${status}”.`);
      },
      registerContact: (id) => {
        const nowIso = new Date().toISOString();
        const o = opportunityById(id);
        patchOpportunity(id, {
          lastContactAt: nowIso,
          firstResponseAt: o?.firstResponseAt ?? nowIso,
          status: o?.status === "Novo" ? "Em atendimento" : (o?.status ?? "Em atendimento"),
        });
        toast.success("Cliente marcado como contatado.");
      },
      simulateWhatsApp: (id) => {
        const nowIso = new Date().toISOString();
        const o = opportunityById(id);
        patchOpportunity(id, { lastContactAt: nowIso, firstResponseAt: o?.firstResponseAt ?? nowIso });
        toast("WhatsApp simulado", { description: `Mensagem enviada para ${nameOf(id)} (ambiente demo).` });
      },
      assignSeller: (id, sellerId) => {
        patchOpportunity(id, { sellerId, assignedAt: new Date().toISOString(), firstResponseAt: null });
        toast.success(`Oportunidade redistribuída para ${sellerById(sellerId)?.name ?? "vendedor"}.`);
      },
      changeRoute: (id, route) => {
        const o = opportunityById(id);
        if (!o) return;
        patchOpportunity(id, { route: { ...o.route, primary: route } });
        toast.success(`Rota comercial alterada para “${route}”.`);
      },
      sendProposal: (id) => {
        const o = opportunityById(id);
        if (!o) return;
        setState((s) => ({
          ...s,
          opportunities: s.opportunities.map((x) =>
            x.id === id ? { ...x, status: "Proposta enviada", lastContactAt: new Date().toISOString() } : x,
          ),
          proposals: [
            {
              id: `PRP-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
              opportunityId: id,
              value: o.potentialValue,
              installment: Math.round((o.potentialValue * 0.045) / 10) * 10,
              method: o.method,
              status: "Enviada",
              sellerId: o.sellerId,
              createdAt: new Date().toISOString(),
            },
            ...s.proposals,
          ],
        }));
        toast.success("Proposta enviada.");
      },
      setProposalStatus: (id, status) => {
        setState((s) => ({
          ...s,
          proposals: s.proposals.map((p) => (p.id === id ? { ...p, status } : p)),
        }));
        toast.success(`Proposta movida para “${status}”.`);
      },
      scheduleFollowUp: (opportunityId, hoursFromNow, action) => {
        setState((s) => ({
          ...s,
          followUps: [
            {
              id: `FU-${Math.random().toString(36).slice(2, 7).toUpperCase()}`,
              opportunityId,
              dueAt: new Date(Date.now() + hoursFromNow * 3600000).toISOString(),
              action,
              done: false,
            },
            ...s.followUps,
          ],
        }));
        toast.success("Follow-up agendado.");
      },
      completeFollowUp: (id) => {
        setState((s) => ({
          ...s,
          followUps: s.followUps.map((f) => (f.id === id ? { ...f, done: true } : f)),
        }));
        toast.success("Follow-up concluído.");
      },
      rescheduleFollowUp: (id, hoursFromNow) => {
        setState((s) => ({
          ...s,
          followUps: s.followUps.map((f) =>
            f.id === id ? { ...f, dueAt: new Date(Date.now() + hoursFromNow * 3600000).toISOString() } : f,
          ),
        }));
        toast.success("Follow-up reagendado.");
      },
      notifySeller: (opportunityId) => {
        const o = opportunityById(opportunityId);
        pushNotification({
          kind: "seller",
          title: `Responsável notificado — ${o?.customer.name ?? ""}`,
          description: `${sellerById(o?.sellerId ?? "")?.name ?? "Vendedor"} recebeu um alerta de atendimento imediato.`,
          ...(opportunityId ? { opportunityId } : {}),
        });
        toast.success("Responsável notificado.");
      },
      escalate: (opportunityId) => {
        const o = opportunityById(opportunityId);
        pushNotification({
          kind: "hot",
          title: `Escalada para o gestor — ${o?.customer.name ?? ""}`,
          description: "Oportunidade quente sem atendimento dentro do SLA.",
          ...(opportunityId ? { opportunityId } : {}),
        });
        toast.success("Oportunidade escalada para o gestor.");
      },
      markNotificationRead: (id) =>
        setState((s) => ({
          ...s,
          notifications: s.notifications.map((n) => (n.id === id ? { ...n, read: true } : n)),
        })),
      markAllNotificationsRead: () =>
        setState((s) => ({ ...s, notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
      toggleDistributionRule: (key) =>
        setState((s) => ({ ...s, distribution: { ...s.distribution, [key]: !s.distribution[key] } })),
    };
  }, [state, hydrated, now, patchOpportunity]);

  return <VyntraContext.Provider value={value}>{children}</VyntraContext.Provider>;
}

export function useVyntra() {
  const ctx = useContext(VyntraContext);
  if (!ctx) throw new Error("useVyntra must be used inside VyntraProvider");
  return ctx;
}
