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
  pickSellerByPerformance,
} from "./mock-data";
import {
  NOVA_SERRA_REGION_CITIES,
  type AppNotification,
  Category,
  CommercialRoute,
  DistributionRules,
  FollowUp,
  LeadState,
  LeadStore,
  Opportunity,
  OpportunityStatus,
  PlanTier,
  Proposal,
  ProposalStatus,
  PurchaseMethod,
  Seller,
} from "./types";
import {
  clearCompanyLogs,
  getCompany,
  getCompanyLogs,
  processLeadWebhook,
  rotateCompanyToken,
  subscribeToWebhookEvents,
  toggleCompanyIntegration,
  type Company,
  type IntegrationLog,
  type ProcessWebhookResult,
} from "./webhook-service";

const STORAGE_KEY = "vyntra-demo-state-v8";

export type RoleView = "gestor" | "vendedor";

interface PersistedState {
  authed: boolean;
  role: RoleView;
  currentPlan: PlanTier;
  currentSellerId: string;
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
    currentPlan: "performance",
    currentSellerId: "lucas",
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
  login: (email: string, password: string, roleHint?: RoleView, sellerIdHint?: string) => boolean;
  loginAs: (role: RoleView, sellerId?: string) => void;
  setCurrentSellerId: (sellerId: string) => void;
  setCurrentPlan: (plan: PlanTier) => void;
  logout: () => void;
  setRole: (role: RoleView) => void;
  resetDemo: () => void;
  setStatus: (id: string, status: OpportunityStatus) => void;
  registerContact: (id: string) => void;
  simulateWhatsApp: (id: string) => void;
  assignSeller: (id: string, sellerId: string) => void;
  assignLeads: (ids: string[], sellerId: string) => void;
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
  addOpportunityFromQuiz: (payload: {
    customer: { name: string; whatsapp: string; email?: string };
    state: LeadState;
    store: LeadStore;
    city: string;
    product: string;
    category: Category;
    method: PurchaseMethod;
    budget: string;
    downPayment: string;
    deadline: string;
    score: number;
    scoreReasons: string[];
    objection: string;
    route: {
      primary: CommercialRoute;
      alternative: CommercialRoute;
      rationale: string;
      budgetFit: "alta" | "média" | "baixa";
    };
  }) => string;
  webhookCompany: Company;
  integrationLogs: IntegrationLog[];
  toggleWebhookActive: () => void;
  rotateWebhookToken: () => void;
  clearIntegrationLogs: () => void;
  testWebhookLead: (customPayload?: Record<string, unknown>) => Promise<{ success: boolean; result: ProcessWebhookResult }>;
  refreshIntegrationData: () => void;
}

const VyntraContext = createContext<VyntraContextValue | null>(null);

function VyntraProviderInternal({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(() => initialState());
  const [hydrated, setHydrated] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [webhookCompany, setWebhookCompany] = useState<Company>(
    () => getCompany("vyntra-automotive")!,
  );
  const [integrationLogs, setIntegrationLogs] = useState<IntegrationLog[]>(
    () => getCompanyLogs("vyntra-automotive"),
  );

  useEffect(() => {
    // Sincronização em tempo real de novos leads recebidos via Webhook
    const unsubscribe = subscribeToWebhookEvents((event) => {
      if (event.companyId === "vyntra-automotive") {
        if (event.type === "new_lead" && event.lead) {
          const lead = event.lead;
          setState((s) => {
            if (s.opportunities.some((o) => o.id === lead.id)) return s;
            return {
              ...s,
              opportunities: [lead, ...s.opportunities],
              notifications: [
                {
                  id: `NT-${Math.random().toString(36).slice(2, 8)}`,
                  kind: lead.score >= 80 ? "hot" : "seller",
                  title: `Novo lead via Webhook — ${lead.customer.name} (Score ${lead.score}/100)`,
                  description: `${lead.product} · Loja ${lead.store} (${lead.city}) · Origem: ${lead.source}`,
                  opportunityId: lead.id,
                  read: false,
                  createdAt: new Date().toISOString(),
                },
                ...s.notifications,
              ],
            };
          });
          toast.success(
            `Lead recebido via Webhook: ${lead.customer.name} (${lead.score} pts - ${lead.score >= 70 ? "Hot" : lead.score >= 40 ? "Warm" : "Cold"})`,
          );
        }
        setIntegrationLogs([...getCompanyLogs("vyntra-automotive")]);
      }
    });

    const handleCustomEvent = (e: Event) => {
      const customEv = e as CustomEvent;
      if (customEv.detail?.companyId === "vyntra-automotive") {
        setIntegrationLogs([...getCompanyLogs("vyntra-automotive")]);
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("vyntra-webhook-event", handleCustomEvent);
    }

    return () => {
      unsubscribe();
      if (typeof window !== "undefined") {
        window.removeEventListener("vyntra-webhook-event", handleCustomEvent);
      }
    };
  }, []);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as PersistedState;
        let currentSellerId = parsed.currentSellerId ?? "lucas";
        if (currentSellerId === "francine") currentSellerId = "lucas";
        if (currentSellerId === "guilherme") currentSellerId = "rafael";
        if (currentSellerId === "vitor") currentSellerId = "bruno";
        if (currentSellerId === "gabriel") currentSellerId = "felipe";

        setState({
          ...parsed,
          currentSellerId,
          role: parsed.role ?? "gestor",
          opportunities: parsed.opportunities.map((opportunity, index) => {
            const isSC = index % 3 === 0;
            const state: LeadState = opportunity.state ?? (isSC ? "SC" : "RS");
            let store: LeadStore =
              state === "SC"
                ? "Nova Serra / SC"
                : index % 2 === 0
                  ? "Vale Azul / RS"
                  : "Santa Aurora / RS";
            if (opportunity.store === "Nova Serra / SC" || (opportunity.store as unknown as string) === "Lages / SC") {
              store = "Nova Serra / SC";
            } else if (opportunity.store === "Vale Azul / RS" || (opportunity.store as unknown as string) === "Três Passos / RS") {
              store = "Vale Azul / RS";
            } else if (opportunity.store === "Santa Aurora / RS" || (opportunity.store as unknown as string) === "Santa Rosa / RS") {
              store = "Santa Aurora / RS";
            }
            const city =
              opportunity.city &&
              !opportunity.city.includes("Lages") &&
              !opportunity.city.includes("Três Passos") &&
              !opportunity.city.includes("Santa Rosa")
                ? opportunity.city
                : store === "Nova Serra / SC"
                  ? (NOVA_SERRA_REGION_CITIES[
                      Math.floor(index / 3) % NOVA_SERRA_REGION_CITIES.length
                    ] ?? "Nova Serra")
                  : store === "Vale Azul / RS"
                    ? "Vale Azul"
                    : "Santa Aurora";
            const region =
              opportunity.region ??
              (state === "SC" ? "Santa Catarina" : "Rio Grande do Sul");

            let sellerId = opportunity.sellerId;
            if (sellerId === "francine") sellerId = "lucas";
            if (sellerId === "guilherme") sellerId = "rafael";
            if (sellerId === "vitor") sellerId = "bruno";
            if (sellerId === "gabriel") sellerId = "felipe";

            return {
              ...opportunity,
              state,
              store,
              city,
              region,
              sellerId,
            };
          }),
        });
      }
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
          {
            ...n,
            id: `NT-${Math.random().toString(36).slice(2, 8)}`,
            read: false,
            createdAt: new Date().toISOString(),
          },
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
      currentSellerId: state.currentSellerId || "lucas",
      setCurrentSellerId: (sellerId: string) =>
        setState((s) => ({ ...s, currentSellerId: sellerId })),
      login: (email, password, roleHint, sellerIdHint) => {
        const clean = email.trim().toLowerCase();
        const validPassword = password === DEMO_CREDENTIALS.password || password === "123456";
        if (!validPassword) return false;

        let targetRole: RoleView =
          roleHint ??
          (clean.includes("vendedor") ||
          clean.includes("lucas") ||
          clean.includes("rafael") ||
          clean.includes("bruno") ||
          clean.includes("felipe") ||
          clean.includes("francine") ||
          clean.includes("guilherme") ||
          clean.includes("vitor") ||
          clean.includes("gabriel")
            ? "vendedor"
            : "gestor");
        let targetSellerId = sellerIdHint ?? (state.currentSellerId || "lucas");

        if (clean === "gestor@vyntra.com" || clean.includes("gestor") || clean.includes("marcos")) {
          targetRole = "gestor";
        } else if (clean === "vendedor@vyntra.com" || clean.includes("lucas") || clean.includes("francine")) {
          targetRole = "vendedor";
          targetSellerId = "lucas";
        } else if (clean.includes("rafael") || clean.includes("guilherme")) {
          targetRole = "vendedor";
          targetSellerId = "rafael";
        } else if (clean.includes("bruno") || clean.includes("vitor")) {
          targetRole = "vendedor";
          targetSellerId = "bruno";
        } else if (clean.includes("felipe") || clean.includes("gabriel")) {
          targetRole = "vendedor";
          targetSellerId = "felipe";
        }

        setState((s) => ({
          ...s,
          authed: true,
          role: targetRole,
          currentSellerId: targetSellerId,
        }));
        return true;
      },
      loginAs: (role, sellerId = "lucas") => {
        let finalSellerId = sellerId;
        if (finalSellerId === "francine") finalSellerId = "lucas";
        if (finalSellerId === "guilherme") finalSellerId = "rafael";
        if (finalSellerId === "vitor") finalSellerId = "bruno";
        if (finalSellerId === "gabriel") finalSellerId = "felipe";
        setState((s) => ({
          ...s,
          authed: true,
          role,
          currentSellerId: finalSellerId,
        }));
      },
      setCurrentPlan: (plan: PlanTier) => {
        setState((s) => ({ ...s, currentPlan: plan }));
        toast.success(`Plano demonstrado alterado para ${plan.toUpperCase()}`);
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
        patchOpportunity(id, {
          lastContactAt: nowIso,
          firstResponseAt: o?.firstResponseAt ?? nowIso,
        });
        toast("WhatsApp simulado", {
          description: `Mensagem enviada para ${nameOf(id)} (ambiente demo).`,
        });
      },
      assignSeller: (id, sellerId) => {
        patchOpportunity(id, {
          sellerId,
          assignedAt: new Date().toISOString(),
          firstResponseAt: null,
        });
        toast.success(
          `Oportunidade redistribuída para ${sellerById(sellerId)?.name ?? "vendedor"}.`,
        );
      },
      assignLeads: (ids, sellerId) => {
        if (ids.length === 0) return;
        const assignedAt = new Date().toISOString();
        setState((s) => ({
          ...s,
          opportunities: s.opportunities.map((opportunity) =>
            ids.includes(opportunity.id)
              ? { ...opportunity, sellerId, assignedAt, firstResponseAt: null }
              : opportunity,
          ),
        }));
        toast.success(
          `${ids.length} ${ids.length === 1 ? "lead enviado" : "leads enviados"} para ${sellerById(sellerId)?.name ?? "o vendedor"}.`,
        );
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
            x.id === id
              ? { ...x, status: "Proposta enviada", lastContactAt: new Date().toISOString() }
              : x,
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
            f.id === id
              ? { ...f, dueAt: new Date(Date.now() + hoursFromNow * 3600000).toISOString() }
              : f,
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
        setState((s) => ({
          ...s,
          notifications: s.notifications.map((n) => ({ ...n, read: true })),
        })),
      toggleDistributionRule: (key) =>
        setState((s) => ({
          ...s,
          distribution: { ...s.distribution, [key]: !s.distribution[key] },
        })),
      addOpportunityFromQuiz: (payload) => {
        const id = `OPP-${Math.floor(1000 + Math.random() * 9000)}`;
        const assignedSeller = pickSellerByPerformance(SELLERS, state.distribution, payload.score >= 80);
        const nowIso = new Date().toISOString();
        const numericBudget = payload.budget ? parseInt(payload.budget.replace(/\D/g, "")) || 45000 : 45000;
        const newOpp: Opportunity = {
          id,
          customer: {
            name: payload.customer.name,
            whatsapp: payload.customer.whatsapp,
            email: payload.customer.email || `${payload.customer.name.toLowerCase().replace(/\s+/g, ".")}@email.com`,
          },
          state: payload.state,
          store: payload.store,
          city: payload.city,
          region: payload.state === "SC" ? "Santa Catarina" : "Rio Grande do Sul",
          product: payload.product,
          category: payload.category,
          method: payload.method,
          budget: payload.budget,
          downPayment: payload.downPayment,
          deadline: payload.deadline,
          score: payload.score,
          scoreReasons: payload.scoreReasons,
          objection: payload.objection,
          route: payload.route,
          status: "Novo",
          sellerId: assignedSeller.id,
          assignedAt: nowIso,
          lastContactAt: null,
          firstResponseAt: null,
          potentialValue: numericBudget >= 1000 ? 55000 : numericBudget >= 700 ? 45000 : numericBudget >= 500 ? 32000 : 22000,
          hasBike: false,
          tradeIn: false,
          simulated: true,
          source: "Quiz de Qualificação",
        };
        setState((s) => ({
          ...s,
          opportunities: [newOpp, ...s.opportunities],
        }));
        pushNotification({
          kind: payload.score >= 80 ? "hot" : "seller",
          title: `Nova oportunidade qualificada — ${payload.customer.name}`,
          description: `Loja ${payload.store} (${payload.city}) · Score ${payload.score} pts · Encaminhada para ${assignedSeller.name}.`,
          opportunityId: id,
        });
        toast.success(`Oportunidade criada e direcionada para a loja ${payload.store}!`);
        return id;
      },
      webhookCompany,
      integrationLogs,
      toggleWebhookActive: () => {
        const updated = toggleCompanyIntegration("vyntra-automotive");
        if (updated) {
          setWebhookCompany({ ...updated });
          toast.success(
            updated.isActive ? "Integração Webhook ativada." : "Integração Webhook desativada.",
          );
        }
      },
      rotateWebhookToken: () => {
        const updated = rotateCompanyToken("vyntra-automotive");
        if (updated) {
          setWebhookCompany({ ...updated });
          toast.success("Novo token secreto de webhook gerado com sucesso.");
        }
      },
      clearIntegrationLogs: () => {
        clearCompanyLogs("vyntra-automotive");
        setIntegrationLogs([]);
        toast.success("Logs de integração limpos com sucesso.");
      },
      testWebhookLead: async (customPayload) => {
        const result = await processLeadWebhook(
          "vyntra-automotive",
          customPayload || {
            name: "Carlos Eduardo Nogueira (Lead Teste)",
            phone: "(54) 99199-8877",
            email: "carlos.nogueira@teste.com.br",
            interest: "Toyota Corolla Cross XRE 0km",
            budget: 185000,
            city: "Santa Aurora",
            message:
              "Quero simular financiamento com 40% de entrada e taxa zero. Teste de webhook ao vivo.",
            source: "Simulador Webhook Vyntra",
            campaign: "Teste de Homologação de Integração",
          },
          state.opportunities,
        );

        setIntegrationLogs([...getCompanyLogs("vyntra-automotive")]);

        if (result.status === "success" && result.lead) {
          const lead = result.lead;
          setState((s) => ({
            ...s,
            opportunities: [lead, ...s.opportunities.filter((o) => o.id !== lead.id)],
          }));
          return { success: true, result };
        } else if (result.status === "duplicate") {
          return { success: true, result };
        }
        return { success: false, result };
      },
      refreshIntegrationData: () => {
        const comp = getCompany("vyntra-automotive");
        if (comp) setWebhookCompany({ ...comp });
        setIntegrationLogs([...getCompanyLogs("vyntra-automotive")]);
      },
    };
  }, [state, hydrated, now, patchOpportunity, webhookCompany, integrationLogs]);

  return <VyntraContext.Provider value={value}>{children}</VyntraContext.Provider>;
}

export function VyntraProvider({ children }: { children: ReactNode }) {
  const parent = useContext(VyntraContext);
  if (parent) {
    return <>{children}</>;
  }
  return <VyntraProviderInternal>{children}</VyntraProviderInternal>;
}

let defaultFallbackContext: VyntraContextValue | null = null;

function getFallbackContext(): VyntraContextValue {
  if (!defaultFallbackContext) {
    const init = initialState();
    defaultFallbackContext = {
      ...init,
      hydrated: true,
      sellers: SELLERS,
      now: Date.now(),
      login: () => false,
      loginAs: () => {},
      setCurrentSellerId: () => {},
      setCurrentPlan: () => {},
      logout: () => {},
      setRole: () => {},
      resetDemo: () => {},
      setStatus: () => {},
      registerContact: () => {},
      simulateWhatsApp: () => {},
      assignSeller: () => {},
      assignLeads: () => {},
      changeRoute: () => {},
      sendProposal: () => {},
      setProposalStatus: () => {},
      scheduleFollowUp: () => {},
      completeFollowUp: () => {},
      rescheduleFollowUp: () => {},
      notifySeller: () => {},
      escalate: () => {},
      markNotificationRead: () => {},
      markAllNotificationsRead: () => {},
      toggleDistributionRule: () => {},
      sellerById: (id: string) => SELLERS.find((s) => s.id === id),
      opportunityById: (id: string) => init.opportunities.find((o) => o.id === id),
      addOpportunityFromQuiz: () => "",
      webhookCompany: getCompany("vyntra-automotive")!,
      integrationLogs: getCompanyLogs("vyntra-automotive"),
      toggleWebhookActive: () => {},
      rotateWebhookToken: () => {},
      clearIntegrationLogs: () => {},
      testWebhookLead: async () => ({
        success: false,
        result: {
          status: "error" as const,
          httpCode: 500,
          opportunityId: null,
          logs: [],
          message: "Fallback de demonstração",
          payloadReceived: {},
        },
      }),
      refreshIntegrationData: () => {},
    };
  }
  return defaultFallbackContext!;
}

export function useVyntra() {
  const ctx = useContext(VyntraContext);
  if (!ctx) {
    return getFallbackContext();
  }
  return ctx;
}
