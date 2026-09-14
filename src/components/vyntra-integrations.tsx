import { useMemo, useState } from "react";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  Bot,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Clock3,
  Code2,
  Copy,
  ExternalLink,
  Eye,
  EyeOff,
  Flame,
  KeyRound,
  Play,
  Radio,
  RefreshCw,
  Search,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
  Terminal,
  Trash2,
  Webhook,
  XCircle,
  Zap,
  Info,
  MapPin,
  Coins,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useVyntra } from "@/lib/vyntra/store";
import type { IntegrationLog, ProcessWebhookResult } from "@/lib/vyntra/webhook-service";
import { BRL, relativeTime } from "@/lib/vyntra/utils";
import { NOVA_SERRA_REGION_CITIES } from "@/lib/vyntra/types";

// ---------------------------------------------------------------------------
// Componente de Badge de Score e Classificação
// ---------------------------------------------------------------------------
function ScoreClassificationBadge({
  score,
  classification,
}: {
  score: number;
  classification?: "Hot" | "Warm" | "Cold";
}) {
  const cls = classification || (score >= 70 ? "Hot" : score >= 40 ? "Warm" : "Cold");
  if (cls === "Hot") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-bold text-emerald-400">
        <Flame className="size-3 text-emerald-400" />
        Hot ({score} pts)
      </span>
    );
  }
  if (cls === "Warm") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2.5 py-0.5 text-xs font-bold text-cyan-300">
        <Sparkles className="size-3 text-cyan-300" />
        Warm ({score} pts)
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 px-2.5 py-0.5 text-xs font-bold text-blue-300">
      <Clock3 className="size-3 text-blue-300" />
      Cold ({score} pts)
    </span>
  );
}

// ---------------------------------------------------------------------------
// Visualizador de Payload JSON Modal / Expansível
// ---------------------------------------------------------------------------
function JsonPayloadViewer({
  payload,
  isOpen,
  onClose,
  log,
}: {
  payload: Record<string, unknown>;
  isOpen: boolean;
  onClose: () => void;
  log?: IntegrationLog | null;
}) {
  const [activeTab, setActiveTab] = useState<"amigavel" | "json">("amigavel");
  const [copied, setCopied] = useState(false);
  if (!isOpen) return null;

  const jsonString = JSON.stringify(payload, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    toast.success("Payload JSON copiado para a área de transferência.");
    setTimeout(() => setCopied(false), 2000);
  };

  const clientName = (payload["nome"] || payload["name"] || payload["customer_name"] || "Cliente sem nome informado") as string;
  const phone = (payload["telefone"] || payload["whatsapp"] || payload["phone"] || "Não informado") as string;
  const product = (payload["modelo_moto"] || payload["moto"] || payload["produto"] || "Modelo 0 km") as string;
  const method = (payload["forma_pagamento"] || payload["method"] || "Financiamento / Consórcio") as string;
  const downPayment = (payload["valor_entrada"] || payload["downPayment"] || "Sem entrada especificada") as string;
  const city = (payload["cidade"] || payload["city"] || "Detectada automaticamente") as string;
  const state = (payload["estado"] || payload["state"] || "SC/RS") as string;
  const message = (payload["mensagem"] || payload["message"] || "") as string;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-xl border border-cyan-500/40 bg-[#070e24] p-5 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border/50 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="size-5 text-cyan-400" />
            <div>
              <h3 className="font-bold text-sm text-foreground">Auditoria & Explicação do Lead</h3>
              <span className="text-[11px] text-muted-foreground">
                Origem: <strong className="text-cyan-300">{log?.source || "Webhook"}</strong> · Status HTTP {log?.httpCode || 201}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex rounded-lg border border-border/70 bg-surface p-0.5">
              <button
                onClick={() => setActiveTab("amigavel")}
                className={cn(
                  "px-2.5 py-1 text-xs rounded-md font-medium transition-colors",
                  activeTab === "amigavel"
                    ? "bg-cyan-500 text-slate-950 font-bold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Visão Autoexplicativa
              </button>
              <button
                onClick={() => setActiveTab("json")}
                className={cn(
                  "px-2.5 py-1 text-xs rounded-md font-medium transition-colors",
                  activeTab === "json"
                    ? "bg-cyan-500 text-slate-950 font-bold"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                JSON Técnico
              </button>
            </div>
            <Button size="sm" variant="ghost" onClick={onClose} className="h-8 px-2 text-muted-foreground hover:text-foreground">
              ✕
            </Button>
          </div>
        </div>

        {activeTab === "amigavel" ? (
          <div className="mt-4 space-y-3.5">
            {/* Status Explicativo */}
            <div className={cn(
              "rounded-xl border p-3.5 flex items-start gap-3",
              log?.status === "success" && "border-emerald-500/30 bg-emerald-950/20 text-emerald-300",
              log?.status === "duplicate" && "border-amber-500/30 bg-amber-950/20 text-amber-300",
              (log?.status === "error" || log?.status === "rejected") && "border-destructive/30 bg-destructive/10 text-destructive",
            )}>
              {log?.status === "success" ? (
                <CheckCircle2 className="size-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : log?.status === "duplicate" ? (
                <AlertCircle className="size-5 text-amber-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="size-5 text-destructive shrink-0 mt-0.5" />
              )}
              <div className="text-xs">
                <strong className="block text-sm font-semibold text-foreground">
                  {log?.status === "success"
                    ? "Requisição aprovada e lead integrado com sucesso"
                    : log?.status === "duplicate"
                      ? "Lead existente atualizado (Anti-duplicação ativado)"
                      : "Requisição barrada pela validação de integridade"}
                </strong>
                <p className="mt-0.5 text-muted-foreground leading-relaxed">
                  {log?.errorMessage || (log?.status === "success"
                    ? "O lead foi pontuado pela inteligência Vyntra, alocado na concessionária correspondente e direcionado ao consultor ideal."
                    : log?.status === "duplicate"
                      ? "O cliente já havia enviado proposta nas últimas 24 horas. O sistema atualizou seu interesse sem duplicar o cartão na fila."
                      : "Falta de parâmetros obrigatórios ou telefone inválido. O CRM descartou para evitar poluição da base.")}
                </p>
              </div>
            </div>

            {/* Dados Decodificados do Cliente */}
            <div className="rounded-xl border border-border/70 bg-[#030717] p-4 space-y-3">
              <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider block">
                DADOS EXTRAÍDOS DO LEAD
              </span>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-muted-foreground block text-[11px]">Nome do Cliente:</span>
                  <strong className="text-foreground font-semibold">{clientName}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">WhatsApp / Telefone:</span>
                  <strong className="text-foreground font-mono">{phone}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Moto de Interesse:</span>
                  <strong className="text-cyan-300 font-semibold">{product}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Forma de Aquisição:</span>
                  <strong className="text-foreground">{method}</strong>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Entrada Declarada:</span>
                  <span className="text-foreground">{downPayment}</span>
                </div>
                <div>
                  <span className="text-muted-foreground block text-[11px]">Localização:</span>
                  <span className="text-foreground">{city} / {state}</span>
                </div>
              </div>

              {message && (
                <div className="pt-2 border-t border-border/40 text-xs">
                  <span className="text-muted-foreground block text-[11px] mb-1">Mensagem enviada:</span>
                  <p className="rounded bg-surface-2/60 p-2 text-foreground/90 italic text-[11px]">"{message}"</p>
                </div>
              )}
            </div>

            {/* Fluxo Realizado pela IA */}
            <div className="rounded-xl border border-cyan-500/20 bg-cyan-950/10 p-3 text-xs text-muted-foreground">
              <strong className="text-cyan-300 font-semibold block mb-1">Ações Automáticas da IA Vyntra:</strong>
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                <span className="rounded bg-cyan-500/15 px-2 py-0.5 text-cyan-300 font-medium">1. Score Calculado</span>
                <span>➔</span>
                <span className="rounded bg-cyan-500/15 px-2 py-0.5 text-cyan-300 font-medium">2. Loja Localizada</span>
                <span>➔</span>
                <span className="rounded bg-cyan-500/15 px-2 py-0.5 text-cyan-300 font-medium">3. Consultor Meritocrático Atribuído</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <div className="flex justify-end">
              <Button size="sm" variant="outline" onClick={handleCopy} className="h-7 gap-1.5 text-xs">
                {copied ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
                {copied ? "Copiado" : "Copiar JSON"}
              </Button>
            </div>
            <div className="max-h-[50vh] overflow-y-auto custom-scrollbar rounded-lg border border-border/40 bg-[#030712] p-4 font-mono text-xs text-cyan-200">
              <pre>{jsonString}</pre>
            </div>
          </div>
        )}

        <div className="mt-5 flex justify-end">
          <Button size="sm" variant="secondary" onClick={onClose}>
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 1. ÁREA DE CONFIGURAÇÕES: INTEGRAÇÕES (IntegrationsPage)
// ---------------------------------------------------------------------------
export function IntegrationsPage({
  setSelected,
  onNavigateLogs,
}: {
  setSelected: (id: string) => void;
  onNavigateLogs?: () => void;
}) {
  const {
    webhookCompany,
    integrationLogs,
    toggleWebhookActive,
    rotateWebhookToken,
    testWebhookLead,
    opportunities,
  } = useVyntra();

  const [copiedUrl, setCopiedUrl] = useState(false);
  const [copiedToken, setCopiedToken] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [activeTestTab, setActiveTestTab] = useState<"hot" | "warm" | "cold" | "duplicate" | "custom">("hot");
  const [isTesting, setIsTesting] = useState(false);
  const [lastTestResult, setLastTestResult] = useState<ProcessWebhookResult | null>(null);

  // Payload customizado
  const [customName, setCustomName] = useState("Rafael Becker");
  const [customPhone, setCustomPhone] = useState("(54) 99122-3344");
  const [customEmail, setCustomEmail] = useState("rafael.becker@empresa.com");
  const [customInterest, setCustomInterest] = useState("SUV Especial 0km");
  const [customBudget, setCustomBudget] = useState("195000");
  const [customCity, setCustomCity] = useState("Santa Aurora");
  const [customSource, setCustomSource] = useState("Meta Ads");
  const [customMessage, setCustomMessage] = useState("Quero proposta com taxa especial e avaliar meu Corolla seminovo na troca.");

  // URL canônica do webhook
  const currentOrigin = typeof window !== "undefined" ? window.location.origin : "https://app.vyntra.com.br";
  const webhookUrl = `${currentOrigin}/api/webhooks/leads/${webhookCompany.id}`;

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedUrl(true);
    toast.success("URL do Webhook copiada para a área de transferência!");
    setTimeout(() => setCopiedUrl(false), 2000);
  };

  const handleCopyToken = () => {
    navigator.clipboard.writeText(webhookCompany.webhookToken);
    setCopiedToken(true);
    toast.success("Token de integração copiado!");
    setTimeout(() => setCopiedToken(false), 2000);
  };

  // Cálculo de Métricas da Integração
  const totalRequests = integrationLogs.length;
  const successCount = integrationLogs.filter((l) => l.status === "success").length;
  const duplicateCount = integrationLogs.filter((l) => l.status === "duplicate").length;
  const errorCount = integrationLogs.filter((l) => l.status === "error" || l.status === "rejected").length;
  const healthRate = totalRequests > 0 ? Math.round((successCount / (totalRequests - duplicateCount || 1)) * 100) : 100;

  // Últimos leads recebidos via webhook
  const webhookLeads = useMemo(() => {
    return opportunities
      .filter((o) => o.source.toLowerCase().includes("webhook") || o.source.toLowerCase().includes("ads") || o.source.toLowerCase().includes("simulador"))
      .slice(0, 5);
  }, [opportunities]);

  // Executar teste do webhook
  const handleRunTest = async () => {
    setIsTesting(true);
    setLastTestResult(null);

    let payloadToTest: Record<string, unknown> = {};

    if (activeTestTab === "hot") {
      payloadToTest = {
        name: "Eduardo Camargo Dorneles",
        phone: "(49) 99188-4422",
        email: "eduardo.dorneles@fazenda.com.br",
        interest: "Toyota Hilux SRX Plus 0km",
        budget: 290000,
        city: "Nova Serra",
        message: "Tenho pressa para retirar o veículo nesta semana. Pago à vista com faturamento imediato.",
        source: "Meta Ads - Campanha Agro SC",
        campaign: "Campanha Força Bruta 2026",
        external_id: `EXT-HOT-${Date.now()}`,
      };
    } else if (activeTestTab === "warm") {
      payloadToTest = {
        name: "Mariana Souza Bittencourt",
        phone: "(55) 98833-2211",
        email: "mariana.bittencourt@gmail.com",
        interest: "Toyota Corolla Cross XRE",
        budget: 165000,
        city: "Vale Azul",
        message: "Gostaria de simulação de financiamento com 30% de entrada.",
        source: "Google Ads",
        campaign: "Google Search - Corolla RS",
        external_id: `EXT-WARM-${Date.now()}`,
      };
    } else if (activeTestTab === "cold") {
      payloadToTest = {
        name: "Felipe Antunes",
        phone: "(54) 99777-1122",
        email: "felipe.antunes@outlook.com",
        interest: "Seminovos",
        city: "Passo Fundo",
        message: "Apenas pesquisando valores para o próximo semestre.",
        source: "Site Oficial",
        external_id: `EXT-COLD-${Date.now()}`,
      };
    } else if (activeTestTab === "duplicate") {
      // Usa o mesmo do último lead para testar deduplicação
      const last = webhookLeads[0];
      payloadToTest = {
        name: last?.customer.name || "Eduardo Camargo Dorneles",
        phone: last?.customer.whatsapp || "(49) 99188-4422",
        email: last?.customer.email || "eduardo.dorneles@fazenda.com.br",
        interest: "Tentativa de Reenvio Duplicado",
        source: "Reenvio CRM Externo",
      };
    } else {
      payloadToTest = {
        name: customName,
        phone: customPhone,
        email: customEmail,
        interest: customInterest,
        budget: customBudget ? parseInt(customBudget.replace(/\D/g, ""), 10) : undefined,
        city: customCity,
        message: customMessage,
        source: customSource,
        external_id: `EXT-CUST-${Date.now()}`,
      };
    }

    try {
      const resp = await testWebhookLead(payloadToTest);
      setLastTestResult(resp.result);

      if (resp.result.status === "success") {
        toast.success(`Webhook processado com sucesso! Score calculado: ${resp.result.score} pts (${resp.result.classification}).`);
      } else if (resp.result.status === "duplicate") {
        toast.info("Lead duplicado identificado. Bloqueada a criação duplicada com sucesso!");
      } else {
        toast.error(`Erro no webhook: ${resp.result.message}`);
      }
    } catch {
      toast.error("Falha ao disparar webhook de teste.");
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Página de Integrações */}
      <div className="flex flex-col justify-between gap-4 border-b border-border/50 pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
            <Webhook className="size-3.5" />
            MOTOR DE INTEGRAÇÕES & WEBHOOK
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Integrações de Leads
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Recebimento automático, validação anti-duplicação e qualificação preditiva via Webhook em tempo real.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-xl border border-border/60 bg-card/60 px-3.5 py-2">
            <span
              className={cn(
                "size-2.5 rounded-full",
                webhookCompany.isActive ? "bg-emerald-400 animate-pulse" : "bg-muted-foreground",
              )}
            />
            <span className="text-xs font-medium text-foreground">
              {webhookCompany.isActive ? "Integração Ativa" : "Integração Pausada"}
            </span>
            <Switch
              checked={webhookCompany.isActive}
              onCheckedChange={toggleWebhookActive}
              className="ml-2"
            />
          </div>

          {onNavigateLogs && (
            <Button variant="outline" size="sm" onClick={onNavigateLogs} className="h-9 gap-1.5 text-xs">
              <Terminal className="size-3.5" />
              Ver Logs de Execução
            </Button>
          )}
        </div>
      </div>

      {/* Cartão de Configuração do Endpoint Webhook */}
      <section className="rounded-xl border border-cyan-500/30 bg-gradient-to-br from-[#060c22] via-[#091330] to-[#040817] p-6 shadow-xl relative overflow-hidden">
        <div className="pointer-events-none absolute -right-24 -top-24 size-80 rounded-full bg-cyan-500/10 blur-[80px]" />
        
        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <div className="flex items-center gap-2">
              <span className="rounded-md bg-cyan-500/20 px-2 py-0.5 font-mono text-xs font-bold text-cyan-300">
                POST
              </span>
              <h2 className="text-lg font-bold text-foreground">Endpoint de Recebimento de Leads</h2>
              <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">
                Multi-Tenant: {webhookCompany.id}
              </span>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Configure esta URL no seu formulário de landing page, CRM, Meta Ads Webhook, Google Ads ou portal parceiro.
              Qualquer lead enviado será validado, salvo e qualificado em menos de 100ms.
            </p>

            {/* Input da URL com botão de copiar */}
            <div className="mt-4 flex items-center gap-2">
              <div className="flex-1 rounded-lg border border-cyan-500/30 bg-[#030612]/90 px-3.5 py-2.5 font-mono text-xs text-cyan-200 overflow-x-auto custom-scrollbar select-all">
                {webhookUrl}
              </div>
              <Button
                onClick={handleCopyUrl}
                size="sm"
                className="h-9 gap-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold shrink-0"
              >
                {copiedUrl ? <Check className="size-4 text-slate-950" /> : <Copy className="size-4" />}
                {copiedUrl ? "Copiado!" : "Copiar URL"}
              </Button>
            </div>
          </div>

          {/* Token Secreto e Ações */}
          <div className="rounded-lg border border-border/60 bg-[#050b1c]/80 p-4 shrink-0 lg:w-80">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <KeyRound className="size-3.5 text-cyan-400" /> Token de Segurança
              </span>
              <button
                onClick={() => setShowToken(!showToken)}
                className="text-xs text-muted-foreground hover:text-cyan-300 flex items-center gap-1"
              >
                {showToken ? <EyeOff className="size-3" /> : <Eye className="size-3" />}
                {showToken ? "Ocultar" : "Mostrar"}
              </button>
            </div>

            <div className="mt-2 flex items-center justify-between rounded border border-border/40 bg-[#020510] px-2.5 py-1.5 font-mono text-[11px] text-muted-foreground">
              <span>{showToken ? webhookCompany.webhookToken : "••••••••••••••••••••••••••••"}</span>
              <button
                onClick={handleCopyToken}
                className="ml-2 text-cyan-400 hover:text-cyan-300"
                title="Copiar token"
              >
                {copiedToken ? <Check className="size-3 text-emerald-400" /> : <Copy className="size-3" />}
              </button>
            </div>

            <div className="mt-3 flex items-center justify-between border-t border-border/30 pt-2.5">
              <span className="text-[10px] text-muted-foreground">Isolamento ativo</span>
              <Button
                size="sm"
                variant="ghost"
                onClick={rotateWebhookToken}
                className="h-6 text-[11px] text-cyan-300 hover:text-cyan-200 px-1.5"
              >
                <RefreshCw className="size-3 mr-1" />
                Gerar Novo Token
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Grid de KPIs e Status da Integração */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="panel p-4 flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Activity className="size-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Saúde da Integração</div>
            <div className="text-xl font-bold text-foreground">{healthRate}% SLA</div>
            <div className="text-[10px] text-emerald-400 font-medium">Latência &lt; 85ms</div>
          </div>
        </div>

        <div className="panel p-4 flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <CheckCircle2 className="size-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Leads Criados (201)</div>
            <div className="text-xl font-bold text-foreground">{successCount}</div>
            <div className="text-[10px] text-muted-foreground">Qualificados e distribuídos</div>
          </div>
        </div>

        <div className="panel p-4 flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <ShieldCheck className="size-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Duplicados Filtrados (200)</div>
            <div className="text-xl font-bold text-foreground">{duplicateCount}</div>
            <div className="text-[10px] text-amber-400">Proteção anti-spam ativa</div>
          </div>
        </div>

        <div className="panel p-4 flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-lg bg-destructive/10 text-destructive border border-destructive/20">
            <AlertTriangle className="size-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">Erros Evitados (400/403)</div>
            <div className="text-xl font-bold text-foreground">{errorCount}</div>
            <div className="text-[10px] text-muted-foreground">Payloads inconsistentes</div>
          </div>
        </div>
      </div>

      {/* Seção Interativa: Simulador e Testador de Recebimento de Lead */}
      <section className="panel p-6">
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center border-b border-border/50 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Play className="size-4 text-cyan-400 fill-cyan-400" />
              <h2 className="text-lg font-semibold text-foreground">Testar Recebimento de Lead via Webhook</h2>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              Dispare um teste real contra o endpoint para validar o score, classificação e ver o lead entrar no dashboard ao vivo.
            </p>
          </div>

          <Button
            onClick={handleRunTest}
            disabled={isTesting}
            className="bg-gradient-to-r from-cyan-500 to-violet-600 hover:from-cyan-400 hover:to-violet-500 text-white font-semibold h-9 px-4 gap-2 shadow-lg shadow-cyan-500/20"
          >
            {isTesting ? <RefreshCw className="size-4 animate-spin" /> : <Send className="size-4" />}
            {isTesting ? "Disparando Webhook..." : "Disparar Teste de Webhook"}
          </Button>
        </div>

        {/* Abas de Cenários de Teste */}
        <div className="mt-4 flex flex-wrap gap-2">
          {[
            { id: "hot", label: "Lead Quente (Hilux R$ 290k - Hot)" },
            { id: "warm", label: "Lead Morno (Corolla Cross R$ 165k - Warm)" },
            { id: "cold", label: "Lead Frio (Sem orçamento - Cold)" },
            { id: "duplicate", label: "Teste de Duplicidade (Anti-Duplicata)" },
            { id: "custom", label: "Customizado (Preenchimento Livre)" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTestTab(tab.id as typeof activeTestTab)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors border",
                activeTestTab === tab.id
                  ? "border-cyan-500/40 bg-cyan-500/15 text-cyan-300"
                  : "border-border/60 bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Formulário Customizado quando selecionado */}
        {activeTestTab === "custom" && (
          <div className="mt-4 grid gap-3 rounded-lg border border-border/60 bg-[#050b1c] p-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="text-[11px] text-muted-foreground font-medium">Nome do Lead *</label>
              <Input
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                className="mt-1 h-8 text-xs bg-background/80"
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground font-medium">Telefone / WhatsApp *</label>
              <Input
                value={customPhone}
                onChange={(e) => setCustomPhone(e.target.value)}
                className="mt-1 h-8 text-xs bg-background/80"
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground font-medium">E-mail *</label>
              <Input
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                className="mt-1 h-8 text-xs bg-background/80"
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground font-medium">Interesse / Veículo</label>
              <Input
                value={customInterest}
                onChange={(e) => setCustomInterest(e.target.value)}
                className="mt-1 h-8 text-xs bg-background/80"
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground font-medium">Orçamento (R$)</label>
              <Input
                value={customBudget}
                onChange={(e) => setCustomBudget(e.target.value)}
                className="mt-1 h-8 text-xs bg-background/80"
              />
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground font-medium">Cidade (RS ou SC)</label>
              <Input
                value={customCity}
                onChange={(e) => setCustomCity(e.target.value)}
                className="mt-1 h-8 text-xs bg-background/80"
              />
              <div className="mt-1 flex flex-wrap gap-1">
                {NOVA_SERRA_REGION_CITIES.slice(0, 6).map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setCustomCity(c)}
                    className="rounded bg-primary/10 px-1 py-0.5 text-[9px] text-primary hover:bg-primary/20 transition-colors"
                  >
                    {c}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-[11px] text-muted-foreground font-medium">Origem (Source)</label>
              <Input
                value={customSource}
                onChange={(e) => setCustomSource(e.target.value)}
                className="mt-1 h-8 text-xs bg-background/80"
              />
            </div>
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="text-[11px] text-muted-foreground font-medium">Mensagem do Lead</label>
              <Input
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                className="mt-1 h-8 text-xs bg-background/80"
              />
            </div>
          </div>
        )}

        {/* Resposta do Teste em Tempo Real */}
        {Boolean(lastTestResult) && (
          <div className="mt-4 rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/20 via-[#091535] to-violet-950/20 p-4 transition-all">
            <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-center border-b border-border/40 pb-3">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "rounded px-2 py-0.5 text-xs font-bold font-mono",
                    lastTestResult?.httpCode === 201
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : lastTestResult?.httpCode === 200
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : "bg-destructive/20 text-destructive border border-destructive/30",
                  )}
                >
                  HTTP {lastTestResult?.httpCode || 200}
                </span>
                <span className="text-sm font-semibold text-foreground">
                  {lastTestResult?.message}
                </span>
              </div>

              {lastTestResult?.score !== undefined && (
                <ScoreClassificationBadge
                  score={lastTestResult.score}
                  {...(lastTestResult.classification ? { classification: lastTestResult.classification } : {})}
                />
              )}
            </div>

            {/* Motivos da Pontuação da IA */}
            {Boolean(lastTestResult?.reasons && lastTestResult.reasons.length > 0) && (
              <div className="mt-3">
                <div className="text-xs font-semibold text-cyan-300 flex items-center gap-1.5 mb-1.5">
                  <Bot className="size-3.5 text-cyan-400" /> Justificativa do Score de Qualificação da IA:
                </div>
                <div className="grid gap-1.5 sm:grid-cols-2">
                  {lastTestResult?.reasons?.map((reason, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 rounded bg-[#03081a]/60 px-2.5 py-1 text-xs text-muted-foreground border border-border/30"
                    >
                      <Check className="size-3 text-cyan-400 shrink-0" />
                      <span>{reason}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Tabela dos Últimos Leads Recebidos via Webhook */}
      <section className="panel p-6">
        <div className="flex items-center justify-between border-b border-border/50 pb-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Últimos Leads Recebidos via Webhook</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Atualização contínua e instantânea. Clique no lead para abrir a ficha completa.
            </p>
          </div>
          <span className="rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-400">
            {webhookLeads.length} leads recentes
          </span>
        </div>

        <div className="mt-4 overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/50 text-muted-foreground">
                <th className="pb-3 font-semibold">Cliente</th>
                <th className="pb-3 font-semibold">Contato</th>
                <th className="pb-3 font-semibold">Origem</th>
                <th className="pb-3 font-semibold">Interesse</th>
                <th className="pb-3 font-semibold">Orçamento</th>
                <th className="pb-3 font-semibold">Score IA</th>
                <th className="pb-3 font-semibold">Loja / Consultor</th>
                <th className="pb-3 font-semibold text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {webhookLeads.map((o) => (
                <tr key={o.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="py-3 font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      <div className="size-2 rounded-full bg-cyan-400" />
                      {o.customer.name}
                    </div>
                  </td>
                  <td className="py-3 text-muted-foreground">
                    <div>{o.customer.whatsapp}</div>
                    <div className="text-[10px] text-muted-foreground/70">{o.customer.email}</div>
                  </td>
                  <td className="py-3">
                    <span className="rounded-full bg-secondary/80 px-2 py-0.5 text-[10px] font-medium text-cyan-300 border border-border/50">
                      {o.source}
                    </span>
                  </td>
                  <td className="py-3 font-medium text-foreground">{o.product}</td>
                  <td className="py-3 font-bold text-foreground">{o.budget || BRL(o.potentialValue)}</td>
                  <td className="py-3">
                    <ScoreClassificationBadge score={o.score} />
                  </td>
                  <td className="py-3 text-muted-foreground">
                    <div>{o.store}</div>
                    <div className="text-[10px] text-cyan-400/80">Resp: {o.sellerId}</div>
                  </td>
                  <td className="py-3 text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelected(o.id)}
                      className="h-7 text-xs text-cyan-400 hover:text-cyan-300"
                    >
                      Ver detalhes <ChevronRight className="size-3 ml-1" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

// ---------------------------------------------------------------------------
// 2. PÁGINA: LOGS DE INTEGRAÇÃO (IntegrationLogsPage)
// ---------------------------------------------------------------------------
export function IntegrationLogsPage({
  setSelected,
  onNavigateSettings,
}: {
  setSelected?: (id: string) => void;
  onNavigateSettings?: () => void;
}) {
  const { integrationLogs, clearIntegrationLogs, refreshIntegrationData } = useVyntra();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "success" | "duplicate" | "error">("all");
  const [selectedPayload, setSelectedPayload] = useState<Record<string, unknown> | null>(null);

  // Filtragem dos Logs
  const filteredLogs = useMemo(() => {
    return integrationLogs.filter((log) => {
      // Filtro de status
      if (statusFilter !== "all" && log.status !== statusFilter) return false;

      // Busca textual
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const sourceMatch = log.source.toLowerCase().includes(query);
        const leadIdMatch = (log.leadId || "").toLowerCase().includes(query);
        const errorMatch = (log.errorMessage || "").toLowerCase().includes(query);
        const payloadString = JSON.stringify(log.payload).toLowerCase();
        const payloadMatch = payloadString.includes(query);
        return sourceMatch || leadIdMatch || errorMatch || payloadMatch;
      }

      return true;
    });
  }, [integrationLogs, statusFilter, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Cabeçalho da Página de Logs */}
      <div className="flex flex-col justify-between gap-4 border-b border-border/50 pb-5 sm:flex-row sm:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 text-xs font-semibold text-cyan-300">
            <Terminal className="size-3.5" />
            HISTÓRICO & AUDITORIA DE REQUISIÇÕES
          </div>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Logs de Integração
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitoramento de disparos de Webhook, payloads brutos recebidos, status HTTP e identificação de erros.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={refreshIntegrationData} className="h-9 gap-1.5 text-xs">
            <RefreshCw className="size-3.5" /> Atualizar
          </Button>

          <Button
            variant="destructive"
            size="sm"
            onClick={clearIntegrationLogs}
            className="h-9 gap-1.5 text-xs bg-destructive/20 hover:bg-destructive/30 text-destructive border border-destructive/30"
          >
            <Trash2 className="size-3.5" /> Limpar Logs
          </Button>

          {onNavigateSettings && (
            <Button size="sm" onClick={onNavigateSettings} className="h-9 gap-1.5 text-xs bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold">
              <Webhook className="size-3.5" /> Configurar Webhook
            </Button>
          )}
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "all", label: `Todos (${integrationLogs.length})` },
            { id: "success", label: `Sucesso / 201 (${integrationLogs.filter((l) => l.status === "success").length})` },
            { id: "duplicate", label: `Duplicados / 200 (${integrationLogs.filter((l) => l.status === "duplicate").length})` },
            { id: "error", label: `Erros / 400 (${integrationLogs.filter((l) => l.status === "error" || l.status === "rejected").length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id as typeof statusFilter)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors border",
                statusFilter === tab.id
                  ? "border-cyan-500/40 bg-cyan-500/15 text-cyan-300 font-semibold"
                  : "border-border/60 bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por origem, lead ou erro..."
            className="h-8 pl-9 text-xs bg-card/60"
          />
        </div>
      </div>

      {/* Tabela de Logs */}
      <div className="panel overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-border/50 bg-[#030614] text-muted-foreground">
                <th className="py-3 px-4 font-semibold">Data / Hora</th>
                <th className="py-3 px-4 font-semibold">Origem</th>
                <th className="py-3 px-4 font-semibold">Status HTTP</th>
                <th className="py-3 px-4 font-semibold">Lead ID</th>
                <th className="py-3 px-4 font-semibold">Detalhes / Erro</th>
                <th className="py-3 px-4 font-semibold text-right">Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground text-xs">
                    Nenhum log de integração encontrado para os filtros selecionados.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => {
                  const isSuccess = log.status === "success";
                  const isDuplicate = log.status === "duplicate";
                  const isError = log.status === "error" || log.status === "rejected";

                  return (
                    <tr key={log.id} className="hover:bg-secondary/20 transition-colors">
                      {/* Data / Hora */}
                      <td className="py-3 px-4 text-foreground whitespace-nowrap">
                        <div className="font-mono text-xs">
                          {new Date(log.createdAt).toLocaleDateString("pt-BR")} ·{" "}
                          {new Date(log.createdAt).toLocaleTimeString("pt-BR")}
                        </div>
                        <div className="text-[10px] text-muted-foreground">{relativeTime(log.createdAt)}</div>
                      </td>

                      {/* Origem */}
                      <td className="py-3 px-4">
                        <span className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 text-[11px] font-medium text-cyan-300">
                          {log.source}
                        </span>
                      </td>

                      {/* Status HTTP */}
                      <td className="py-3 px-4">
                        <span
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold border",
                            isSuccess
                              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                              : isDuplicate
                                ? "bg-amber-500/10 border-amber-500/30 text-amber-300"
                                : "bg-destructive/10 border-destructive/30 text-destructive",
                          )}
                        >
                          {isSuccess && <CheckCircle2 className="size-3 text-emerald-400" />}
                          {isDuplicate && <AlertCircle className="size-3 text-amber-300" />}
                          {isError && <XCircle className="size-3 text-destructive" />}
                          HTTP {log.httpCode} · {isSuccess ? "Criado" : isDuplicate ? "Duplicado" : "Erro"}
                        </span>
                      </td>

                      {/* Lead ID */}
                      <td className="py-3 px-4">
                        {log.leadId ? (
                          <button
                            onClick={() => setSelected?.(log.leadId!)}
                            className="font-mono text-xs text-cyan-400 hover:underline hover:text-cyan-300"
                          >
                            {log.leadId}
                          </button>
                        ) : (
                          <span className="text-muted-foreground/60">—</span>
                        )}
                      </td>

                      {/* Detalhes / Erro */}
                      <td className="py-3 px-4 max-w-xs">
                        {log.errorMessage ? (
                          <span className="text-xs text-amber-300/90 leading-tight">
                            {log.errorMessage}
                          </span>
                        ) : isSuccess ? (
                          <span className="text-xs text-emerald-400/80">
                            Lead gravado, score calculado e distribuído ao consultor.
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>

                      {/* Botão Ver Payload */}
                      <td className="py-3 px-4 text-right">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setSelectedPayload(log.payload)}
                          className="h-7 text-xs gap-1 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10"
                        >
                          <Code2 className="size-3" /> Ver JSON
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Visualizador de Payload JSON */}
      <JsonPayloadViewer
        payload={selectedPayload || {}}
        isOpen={Boolean(selectedPayload)}
        onClose={() => setSelectedPayload(null)}
      />
    </div>
  );
}
