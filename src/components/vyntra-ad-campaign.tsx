import React, { useState, useEffect, useRef } from "react";
import {
  Megaphone,
  Sparkles,
  Upload,
  Image as ImageIcon,
  CheckCircle2,
  Send,
  Users,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  Check,
  RotateCcw,
  Eye,
  Calendar,
  MessageSquare,
  Clock,
  Phone,
  FileCheck,
  AlertCircle,
  Plus,
  Play,
  Layers,
  Sparkle,
  Copy,
  Edit3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface CampaignClient {
  id: string;
  name: string;
  phone: string;
  avatar: string;
  location: string;
  interest: string;
}

export const DEMO_CLIENTS: CampaignClient[] = [
  { id: "c1", name: "João Silva", phone: "(49) 99999-1001", avatar: "JS", location: "Nova Serra / SC", interest: "Modelo 0 km" },
  { id: "c2", name: "Mariana Souza", phone: "(55) 99999-1002", avatar: "MS", location: "Vale Azul / RS", interest: "Seminova revisada" },
  { id: "c3", name: "Carlos Oliveira", phone: "(55) 99999-1003", avatar: "CO", location: "Santa Aurora / RS", interest: "Consórcio Nacional" },
  { id: "c4", name: "Ana Paula Santos", phone: "(49) 99999-1004", avatar: "AS", location: "Nova Serra / SC", interest: "Trail 160cc" },
  { id: "c5", name: "Lucas Pereira", phone: "(55) 99999-1005", avatar: "LP", location: "Vale Azul / RS", interest: "Street 160cc" },
  { id: "c6", name: "Fernanda Costa", phone: "(55) 99999-1006", avatar: "FC", location: "Santa Aurora / RS", interest: "Scooter 125cc" },
  { id: "c7", name: "Rafael Martins", phone: "(49) 99999-1007", avatar: "RM", location: "Nova Serra / SC", interest: "Sport 300cc" },
  { id: "c8", name: "Juliana Alves", phone: "(55) 99999-1008", avatar: "JA", location: "Vale Azul / RS", interest: "Adventure 300cc" },
];

export interface ClientMessageDraft {
  clientId: string;
  clientName: string;
  phone: string;
  avatar: string;
  message: string;
  selected: boolean;
  status: "pending" | "sending" | "sent";
}

export interface CampaignRecord {
  id: string;
  title: string;
  info: string;
  image: string;
  totalClients: number;
  sentCount: number;
  status: "Concluída" | "Em andamento";
  date: string;
  messages: Array<{
    clientName: string;
    phone: string;
    message: string;
  }>;
}

const DEFAULT_DEMO_CAMPAIGN: CampaignRecord = {
  id: "camp-demo-1",
  title: "FEIRÃO GRUPO NOVA SERRA",
  info: "Feirão Grupo Nova Serra neste fim de semana, com condições especiais em modelos novos e seminovos. Consulte as oportunidades disponíveis.",
  image: "/feirao-honda.jpg",
  totalClients: 8,
  sentCount: 8,
  status: "Concluída",
  date: "Hoje às 10:15",
  messages: [
    {
      clientName: "João Silva",
      phone: "(49) 99999-1001",
      message:
        "Olá, João! Tudo bem?\n\nQuero te fazer um convite especial. Neste fim de semana teremos o Feirão Grupo Nova Serra, com condições especiais em modelos novos e seminovos.\n\nAchei que poderia ser uma boa oportunidade para você. Se quiser, posso te mostrar as condições disponíveis.",
    },
    {
      clientName: "Mariana Souza",
      phone: "(55) 99999-1002",
      message:
        "Olá, Mariana! Tudo bem?\n\nPassando para te avisar de uma oportunidade especial: neste fim de semana acontece o Feirão Grupo Nova Serra, com condições diferenciadas em modelos novos e seminovos selecionados.\n\nSeparei essa oportunidade porque acredito que você possa encontrar uma condição interessante por lá.\n\nQuer que eu te mostre as opções disponíveis?",
    },
    {
      clientName: "Carlos Oliveira",
      phone: "(55) 99999-1003",
      message:
        "Olá, Carlos! Tudo bem por aí?\n\nLembrei do seu interesse em modelos novos e queria compartilhar em primeira mão: teremos neste fim de semana o Feirão Grupo Nova Serra, com taxas exclusivas e condições facilitadas tanto para modelos 0 km quanto seminovos.\n\nSe fizer sentido para o seu momento, posso te adiantar os modelos disponíveis.",
    },
    {
      clientName: "Ana Paula Santos",
      phone: "(49) 99999-1004",
      message:
        "Olá, Ana Paula! Como você está?\n\nEstou entrando em contato para te dar uma notícia excelente: neste fim de semana o Grupo Nova Serra fará um feirão especial com oportunidades diferenciadas em modelos novos e seminovos selecionados.\n\nPensei no seu perfil e achei que gostaria de conferir. Posso te enviar mais detalhes?",
    },
    {
      clientName: "Lucas Pereira",
      phone: "(55) 99999-1005",
      message:
        "Olá, Lucas! Tudo certo?\n\nPassando com uma oportunidade que vale a pena conferir: o Feirão Grupo Nova Serra acontece neste fim de semana, trazendo planos facilitados e condições sob medida em toda a linha.\n\nComo você já estava acompanhando as novidades, quis te avisar com antecedência. Me avisa se quiser ver as opções!",
    },
    {
      clientName: "Fernanda Costa",
      phone: "(55) 99999-1006",
      message:
        "Olá, Fernanda! Tudo ótimo com você?\n\nQuero te convidar para o Feirão Grupo Nova Serra neste fim de semana. Teremos condições realmente diferenciadas em modelos novos e seminovos revisados com garantia de procedência.\n\nAcredito que tenha opções perfeitas para você. Quer que eu separe algumas propostas para você dar uma olhada?",
    },
    {
      clientName: "Rafael Martins",
      phone: "(49) 99999-1007",
      message:
        "Olá, Rafael! Como vão as coisas?\n\nUma novidade rápida: teremos neste fim de semana o Feirão Grupo Nova Serra com condições exclusivas de negociação em modelos novos e seminovos.\n\nSeparei o seu contato para garantir prioridade de atendimento. Gostaria que eu te enviasse as condições especiais disponíveis?",
    },
    {
      clientName: "Juliana Alves",
      phone: "(55) 99999-1008",
      message:
        "Olá, Juliana! Tudo bem?\n\nPassando para te fazer um convite exclusivo: neste fim de semana realizaremos o Feirão Grupo Nova Serra, com condições imperdíveis para quem quer conquistar seu veículo novo ou seminovo.\n\nLembrei da sua busca e quis garantir que você soubesse antes. Posso te adiantar o catálogo do feirão?",
    },
  ],
};

function generateIndividualizedMessage(
  clientName: string,
  title: string,
  info: string,
  index: number,
): string {
  const firstName = clientName.split(" ")[0];
  const t = title.trim() || "Feirão Grupo Nova Serra";
  const cleanInfo = info.trim();

  const variations = [
    `Olá, ${firstName}! Tudo bem?\n\nQuero te fazer um convite especial. Neste fim de semana teremos o ${t}, com condições especiais em modelos novos e seminovos.\n\nAchei que poderia ser uma boa oportunidade para você. Se quiser, posso te mostrar as condições disponíveis.`,

    `Olá, ${firstName}! Tudo bem?\n\nPassando para te avisar de uma oportunidade especial: neste fim de semana acontece o ${t}, com condições diferenciadas em modelos novos e seminovos.\n\nSeparei essa oportunidade porque acredito que você possa encontrar uma condição interessante por lá.\n\nQuer que eu te mostre as opções disponíveis?`,

    `Olá, ${firstName}! Tudo bem por aí?\n\nLembrei do seu interesse em modelos novos e queria compartilhar em primeira mão: teremos o ${t}, com taxas exclusivas e condições facilitadas tanto para modelos 0 km quanto seminovos.\n\nSe fizer sentido para o seu momento, posso te adiantar os modelos disponíveis.`,

    `Olá, ${firstName}! Como você está?\n\nEstou entrando em contato para te dar uma notícia excelente: teremos o ${t} com oportunidades diferenciadas em modelos novos e seminovos selecionados no Grupo Nova Serra.\n\nPensei no seu perfil e achei que gostaria de conferir. Posso te enviar mais detalhes?`,

    `Olá, ${firstName}! Tudo certo?\n\nPassando com uma oportunidade que vale a pena conferir: o ${t} acontece com planos facilitados e condições sob medida em toda a linha.\n\nComo você já estava acompanhando as novidades, quis te avisar com antecedência. Me avisa se quiser ver as opções!`,

    `Olá, ${firstName}! Tudo ótimo com você?\n\nQuero te convidar para o ${t}. Teremos condições realmente diferenciadas em modelos novos e seminovos revisados com garantia.\n\nAcredito que tenha opções perfeitas para você. Quer que eu separe algumas propostas para você dar uma olhada?`,

    `Olá, ${firstName}! Como vão as coisas?\n\nUma novidade rápida: teremos o ${t} com condições exclusivas de negociação em modelos novos e seminovos.\n\nSeparei o seu contato para garantir prioridade de atendimento na rede Grupo Nova Serra. Gostaria que eu te enviasse as condições especiais disponíveis?`,

    `Olá, ${firstName}! Tudo bem?\n\nPassando para te fazer um convite exclusivo: realizaremos o ${t}, com condições imperdíveis para quem quer conquistar seu veículo novo ou seminovo.\n\nLembrei da sua busca e quis garantir que você soubesse antes. Posso te adiantar o catálogo do feirão?`,
  ];

  return variations[index % variations.length] ?? variations[0] ?? "";
}

export function AdCampaignPage({ setView }: { setView?: (v: any) => void }) {
  // Navigation inside Campaign module
  const [activeStep, setActiveStep] = useState<1 | 2 | 3 | null>(null);

  // Campaign Form State (Etapa 1)
  const [campaignTitle, setCampaignTitle] = useState("");
  const [campaignInfo, setCampaignInfo] = useState("");
  const [campaignImage, setCampaignImage] = useState<string>("/feirao-honda.jpg");
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // Review State (Etapa 2)
  const [clientDrafts, setClientDrafts] = useState<ClientMessageDraft[]>([]);
  const [editingClientId, setEditingClientId] = useState<string | null>(null);

  // Dispatch / Sending State (Etapa 3)
  const [isDispatching, setIsDispatching] = useState(false);
  const [dispatchProgress, setDispatchProgress] = useState(0);
  const [currentDispatchIndex, setCurrentDispatchIndex] = useState(-1);
  const [dispatchCompleted, setDispatchCompleted] = useState(false);

  // History State
  const [history, setHistory] = useState<CampaignRecord[]>([DEFAULT_DEMO_CAMPAIGN]);
  const [selectedHistoryCampaign, setSelectedHistoryCampaign] = useState<CampaignRecord | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Scroll to top when view or step changes
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
  }, [activeStep]);

  // Load Demonstration Example
  const handleLoadDemo = () => {
    setCampaignTitle("FEIRÃO GRUPO NOVA SERRA");
    setCampaignInfo(
      "Feirão Grupo Nova Serra neste fim de semana, com condições especiais em modelos novos e seminovos selecionados. Consulte as oportunidades disponíveis.",
    );
    setCampaignImage("/feirao-honda.jpg");
    toast.success("Dados de demonstração da campanha carregados!");
  };

  // Image Upload handler
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setCampaignImage(result);
      toast.success("Imagem do anúncio carregada com sucesso!");
    };
    reader.readAsDataURL(file);
  };

  // Trigger AI Generation (Etapa 1 -> Etapa 2)
  const handleGenerateCampaignWithAi = () => {
    if (!campaignTitle.trim()) {
      toast.error("Por favor, preencha o título do anúncio.");
      return;
    }
    if (!campaignInfo.trim()) {
      toast.error("Por favor, informe a descrição e condições do anúncio.");
      return;
    }

    setIsAiGenerating(true);

    // Simulate AI cognitive processing
    setTimeout(() => {
      const drafts: ClientMessageDraft[] = DEMO_CLIENTS.map((c, i) => ({
        clientId: c.id,
        clientName: c.name,
        phone: c.phone,
        avatar: c.avatar,
        message: generateIndividualizedMessage(c.name, campaignTitle, campaignInfo, i),
        selected: true,
        status: "pending",
      }));

      setClientDrafts(drafts);
      setIsAiGenerating(false);
      setActiveStep(2);
      toast.success("A IA da VYNTRA gerou 8 mensagens personalizadas!");
    }, 1200);
  };

  // Selection toggles (Etapa 2)
  const selectedCount = clientDrafts.filter((c) => c.selected).length;
  const isAllSelected = selectedCount === clientDrafts.length && clientDrafts.length > 0;

  const handleToggleSelectAll = () => {
    const nextState = !isAllSelected;
    setClientDrafts((prev) => prev.map((c) => ({ ...c, selected: nextState })));
  };

  const handleToggleClient = (id: string) => {
    setClientDrafts((prev) =>
      prev.map((c) => (c.clientId === id ? { ...c, selected: !c.selected } : c)),
    );
  };

  const handleUpdateClientMessage = (id: string, newMessage: string) => {
    setClientDrafts((prev) =>
      prev.map((c) => (c.clientId === id ? { ...c, message: newMessage } : c)),
    );
    setEditingClientId(null);
    toast.success("Mensagem do cliente atualizada.");
  };

  // Advance to Step 3
  const handleContinueToStep3 = () => {
    if (selectedCount === 0) {
      toast.error("Selecione pelo menos um cliente para continuar.");
      return;
    }
    setActiveStep(3);
    setIsDispatching(false);
    setDispatchProgress(0);
    setCurrentDispatchIndex(-1);
    setDispatchCompleted(false);
  };

  // Execute Dispatch Simulation (Etapa 3)
  const handleStartDispatch = () => {
    setIsDispatching(true);
    setDispatchProgress(0);
    setCurrentDispatchIndex(0);
    setDispatchCompleted(false);

    const selectedClients = clientDrafts.filter((c) => c.selected);
    const total = selectedClients.length;
    let currentIdx = 0;

    const interval = setInterval(() => {
      if (currentIdx < total) {
        const client = selectedClients[currentIdx];
        if (client) {
          setClientDrafts((prev) =>
            prev.map((c) => (c.clientId === client.clientId ? { ...c, status: "sent" } : c)),
          );
        }
        setCurrentDispatchIndex(currentIdx);
        setDispatchProgress(Math.round(((currentIdx + 1) / total) * 100));
        currentIdx++;
      } else {
        clearInterval(interval);
        setIsDispatching(false);
        setDispatchCompleted(true);
        setDispatchProgress(100);

        // Save into History
        const now = new Date();
        const timeString = `Hoje às ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

        const newRecord: CampaignRecord = {
          id: `camp-${Date.now()}`,
          title: campaignTitle || "FEIRÃO GRUPO NOVA SERRA",
          info: campaignInfo,
          image: campaignImage,
          totalClients: total,
          sentCount: total,
          status: "Concluída",
          date: timeString,
          messages: selectedClients.map((c) => ({
            clientName: c.clientName,
            phone: c.phone,
            message: c.message,
          })),
        };

        setHistory((prev) => [newRecord, ...prev]);
        toast.success("Campanha concluída com sucesso!");
      }
    }, 420);
  };

  // Reset to create another campaign
  const handleStartNewCampaign = () => {
    setCampaignTitle("");
    setCampaignInfo("");
    setCampaignImage("/feirao-honda.jpg");
    setClientDrafts([]);
    setActiveStep(1);
    setDispatchCompleted(false);
  };

  return (
    <div className="space-y-6">
      {/* SE NÃO ESTIVER EM NENHUM PASSO: MOSTRAR TELA INICIAL DA CAMPANHA DE ANÚNCIO (COM HISTÓRICO) */}
      {activeStep === null ? (
        <div className="space-y-6">
          {/* Header com Call to Action Principal */}
          <div className="relative overflow-hidden rounded-2xl border border-cyan-500/30 bg-gradient-to-br from-[#061329]/95 via-[#0a1835]/80 to-[#040816]/95 p-6 sm:p-8 shadow-[0_0_40px_rgba(6,182,212,0.12)]">
            <div className="pointer-events-none absolute -right-20 -top-20 size-72 rounded-full bg-cyan-500/15 blur-3xl" />
            <div className="pointer-events-none absolute -left-20 -bottom-20 size-72 rounded-full bg-violet-600/15 blur-3xl" />

            <div className="relative z-10 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan-500/40 bg-cyan-500/15 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-cyan-300">
                    <Megaphone className="size-3.5 text-cyan-300" />
                    MÓDULO EXCLUSIVO DO GESTOR
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-400">
                    <span className="size-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Inteligência Ativa
                  </span>
                </div>
                <h1 className="mt-3 text-3xl sm:text-4xl font-black tracking-tight text-foreground">
                  Campanha de Anúncio
                </h1>
                <p className="mt-2 max-w-2xl text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
                  <strong className="text-cyan-300 font-semibold">"O gestor coloca o anúncio. A VYNTRA faz o resto."</strong>
                  <br />
                  Transforme qualquer oferta em abordagens comerciais personalizadas para cada cliente em apenas 3 passos rápidos.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  size="lg"
                  onClick={() => {
                    handleLoadDemo();
                    setActiveStep(1);
                  }}
                  className="h-12 px-6 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold shadow-[0_0_25px_rgba(6,182,212,0.35)] text-sm transition-all"
                >
                  <Plus className="mr-2 size-5" />
                  + CRIAR CAMPANHA
                </Button>
              </div>
            </div>
          </div>

          {/* Cards Rápidos de Conceito do Fluxo em 3 Etapas */}
          <div className="grid gap-3.5 sm:grid-cols-3">
            <div className="rounded-xl border border-border/60 bg-surface/80 p-4 transition-all hover:border-cyan-500/40">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                <span className="flex size-6 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs">
                  1
                </span>
                CRIAR CAMPANHA
              </div>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Insira o título, a descrição e a foto do anúncio ou feirão. Apenas essas informações são necessárias.
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-surface/80 p-4 transition-all hover:border-cyan-500/40">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                <span className="flex size-6 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs">
                  2
                </span>
                REVISAR COM IA
              </div>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                A IA da VYNTRA gera mensagens individualizadas pelo nome de cada cliente, sem parecer disparo robótico em massa.
              </p>
            </div>

            <div className="rounded-xl border border-border/60 bg-surface/80 p-4 transition-all hover:border-cyan-500/40">
              <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                <span className="flex size-6 items-center justify-center rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs">
                  3
                </span>
                INICIAR DISPARO
              </div>
              <p className="mt-2 text-xs text-muted-foreground leading-relaxed">
                Revise o resumo em 1 clique e inicie a simulação do envio com acompanhamento em tempo real para a carteira.
              </p>
            </div>
          </div>

          {/* Seção de Histórico de Campanhas */}
          <section className="rounded-2xl border border-border/60 bg-gradient-to-b from-surface/85 to-surface-2/45 p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-border/50 pb-3">
              <div>
                <h2 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <Clock className="size-4 text-cyan-400" />
                  Histórico de Campanhas
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Registro de campanhas executadas e abordagens personalizadas criadas pela plataforma
                </p>
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                {history.length} {history.length === 1 ? "campanha" : "campanhas"}
              </span>
            </div>

            <div className="divide-y divide-border/40">
              {history.map((item) => (
                <div
                  key={item.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-4 first:pt-2 last:pb-2"
                >
                  <div className="flex items-start gap-3.5">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="size-16 rounded-xl object-cover border border-border/60 shrink-0 bg-surface-2"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-bold text-base text-foreground">{item.title}</h3>
                        <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
                          <CheckCircle2 className="size-3" />
                          {item.status}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground line-clamp-1 max-w-xl">
                        {item.info}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground font-medium">
                        <span className="flex items-center gap-1 text-cyan-300">
                          <Users className="size-3" />
                          {item.totalClients} clientes atendidos
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="size-3" />
                          {item.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedHistoryCampaign(item)}
                      className="h-9 border-cyan-500/30 text-cyan-300 hover:bg-cyan-500/10 text-xs font-semibold"
                    >
                      <Eye className="mr-1.5 size-3.5" />
                      VER CAMPANHA
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      ) : (
        /* FLUXO EM 3 ETAPAS */
        <div className="space-y-6">
          {/* Barra de Progresso / Stepper das 3 Etapas */}
          <div className="rounded-2xl border border-border/70 bg-[#070e20]/80 p-4 sm:p-5 backdrop-blur-md">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  if (activeStep === 1) setActiveStep(null);
                  else if (activeStep === 2) setActiveStep(1);
                  else if (activeStep === 3) setActiveStep(2);
                }}
                className="text-xs text-muted-foreground hover:text-foreground h-8 px-2"
              >
                <ArrowLeft className="mr-1.5 size-3.5" />
                {activeStep === 1 ? "Voltar ao Histórico" : "Etapa Anterior"}
              </Button>

              <div className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">
                FLUXO EM 3 ETAPAS
              </div>
            </div>

            {/* Visual Stepper */}
            <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-4 text-center">
              {/* Etapa 1 */}
              <div
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl p-2.5 sm:p-3 border transition-all text-xs font-bold",
                  activeStep === 1
                    ? "border-cyan-500 bg-cyan-500/15 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                    : activeStep > 1
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                      : "border-border/60 text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex size-5 sm:size-6 items-center justify-center rounded-full text-[10px] sm:text-xs font-mono font-bold",
                    activeStep === 1
                      ? "bg-cyan-500 text-slate-950"
                      : activeStep > 1
                        ? "bg-emerald-500 text-slate-950"
                        : "bg-secondary text-muted-foreground",
                  )}
                >
                  {activeStep > 1 ? "✓" : "1"}
                </span>
                <span className="truncate">CRIAR ANÚNCIO</span>
              </div>

              {/* Etapa 2 */}
              <div
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl p-2.5 sm:p-3 border transition-all text-xs font-bold",
                  activeStep === 2
                    ? "border-cyan-500 bg-cyan-500/15 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                    : activeStep > 2
                      ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                      : "border-border/60 text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex size-5 sm:size-6 items-center justify-center rounded-full text-[10px] sm:text-xs font-mono font-bold",
                    activeStep === 2
                      ? "bg-cyan-500 text-slate-950"
                      : activeStep > 2
                        ? "bg-emerald-500 text-slate-950"
                        : "bg-secondary text-muted-foreground",
                  )}
                >
                  {activeStep > 2 ? "✓" : "2"}
                </span>
                <span className="truncate">REVISAR COM IA</span>
              </div>

              {/* Etapa 3 */}
              <div
                className={cn(
                  "flex items-center justify-center gap-2 rounded-xl p-2.5 sm:p-3 border transition-all text-xs font-bold",
                  activeStep === 3
                    ? "border-cyan-500 bg-cyan-500/15 text-cyan-300 shadow-[0_0_20px_rgba(6,182,212,0.2)]"
                    : "border-border/60 text-muted-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex size-5 sm:size-6 items-center justify-center rounded-full text-[10px] sm:text-xs font-mono font-bold",
                    activeStep === 3
                      ? "bg-cyan-500 text-slate-950"
                      : "bg-secondary text-muted-foreground",
                  )}
                >
                  3
                </span>
                <span className="truncate">INICIAR DISPARO</span>
              </div>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* ETAPA 1 — CRIAR CAMPANHA */}
          {/* ========================================================================= */}
          {activeStep === 1 && (
            <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <section className="rounded-2xl border border-border/60 bg-gradient-to-b from-surface/85 to-surface-2/45 p-6 sm:p-8 space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                      ETAPA 1 DE 3
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleLoadDemo}
                      className="text-xs text-cyan-300 hover:text-cyan-200 hover:bg-cyan-500/10 h-7"
                    >
                      <Sparkle className="mr-1 size-3 text-cyan-300" />
                      Carregar exemplo de demonstração
                    </Button>
                  </div>
                  <h2 className="mt-1 text-2xl font-bold text-foreground">
                    Informações do Anúncio
                  </h2>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Informe os dados básicos da oferta. A inteligência artificial da VYNTRA fará o resto do trabalho.
                  </p>
                </div>

                <div className="space-y-5">
                  {/* 1. TÍTULO DO ANÚNCIO */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      1. TÍTULO DO ANÚNCIO
                    </label>
                    <Input
                      placeholder="Ex: FEIRÃO GRUPO NOVA SERRA"
                      value={campaignTitle}
                      onChange={(e) => setCampaignTitle(e.target.value)}
                      className="h-11 bg-[#060b1b] border-border/70 text-sm focus-visible:border-cyan-500"
                    />
                  </div>

                  {/* 2. INFORMAÇÕES DO ANÚNCIO */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      2. INFORMAÇÕES DO ANÚNCIO
                    </label>
                    <Textarea
                      rows={4}
                      placeholder="Descreva as condições, datas, modelos ou benefícios da campanha..."
                      value={campaignInfo}
                      onChange={(e) => setCampaignInfo(e.target.value)}
                      className="bg-[#060b1b] border-border/70 text-sm leading-relaxed focus-visible:border-cyan-500 resize-none"
                    />
                  </div>

                  {/* 3. IMAGEM DO ANÚNCIO */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-slate-200">
                      3. IMAGEM DO ANÚNCIO
                    </label>

                    <input
                      type="file"
                      ref={fileInputRef}
                      onChange={handleImageUpload}
                      accept="image/*"
                      className="hidden"
                    />

                    <div className="flex flex-wrap items-center gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                        className="h-10 border-border/70 bg-surface-2/60 text-xs font-semibold hover:border-cyan-500/50"
                      >
                        <Upload className="mr-2 size-4 text-cyan-400" />
                        CARREGAR IMAGEM
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        onClick={() => {
                          setCampaignImage("/feirao-honda.jpg");
                          toast.success("Banner oficial do Feirão selecionado.");
                        }}
                        className="h-10 text-xs text-muted-foreground hover:text-foreground"
                      >
                        <ImageIcon className="mr-1.5 size-4" />
                        Usar Imagem Padrão do Feirão
                      </Button>
                    </div>
                  </div>
                </div>

                {/* BOTÃO PRINCIPAL: GERAR CAMPANHA COM IA */}
                <div className="pt-4 border-t border-border/50">
                  <Button
                    type="button"
                    size="lg"
                    disabled={isAiGenerating}
                    onClick={handleGenerateCampaignWithAi}
                    className="w-full h-12 bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-black tracking-wide text-sm shadow-[0_0_30px_rgba(6,182,212,0.35)] transition-all"
                  >
                    {isAiGenerating ? (
                      <span className="flex items-center gap-2">
                        <Sparkles className="size-4 animate-spin text-slate-950" />
                        A IA ESTÁ ANALISANDO E PERSONALIZANDO AS MENSAGENS...
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Sparkles className="size-4 text-slate-950" />
                        GERAR CAMPANHA COM IA
                      </span>
                    )}
                  </Button>
                  <p className="mt-2 text-center text-[11px] text-muted-foreground">
                    Nenhuma outra configuração técnica é exigida do gestor.
                  </p>
                </div>
              </section>

              {/* Coluna Direita: Prévia da Imagem e Diagnóstico de Oferta */}
              <div className="space-y-4">
                <div className="rounded-2xl border border-border/60 bg-surface/85 p-5 space-y-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                    PRÉVIA DA IMAGEM
                  </span>

                  {campaignImage ? (
                    <div className="relative overflow-hidden rounded-xl border border-border/80 bg-black/40 aspect-[4/3] group">
                      <img
                        src={campaignImage}
                        alt="Prévia do Anúncio"
                        className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-80" />
                      <div className="absolute bottom-3 left-3 right-3 text-white">
                        <div className="text-xs font-bold truncate">
                          {campaignTitle || "Título do Anúncio"}
                        </div>
                        <div className="text-[10px] text-slate-300 truncate">
                          Pronto para anexo nos disparos
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="grid place-items-center rounded-xl border border-dashed border-border/80 bg-surface-2/40 aspect-[4/3] text-center p-6">
                      <ImageIcon className="size-10 text-muted-foreground" />
                      <span className="mt-2 text-xs text-muted-foreground">
                        Nenhuma imagem selecionada. Clique em "Carregar Imagem".
                      </span>
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-cyan-500/30 bg-cyan-500/10 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                    <Sparkles className="size-4" />
                    Como funciona a IA nesta etapa:
                  </div>
                  <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                    A IA da VYNTRA recebe o título, a descrição e a foto, cruza com a carteira de clientes selecionada e constrói uma mensagem humanizada para cada pessoa pelo nome, sem jargões genéricos.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ETAPA 2 — REVISAR CAMPANHA */}
          {/* ========================================================================= */}
          {activeStep === 2 && (
            <div className="space-y-6">
              {/* Barra Superior da Etapa 2 */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-2xl border border-border/60 bg-surface/85 p-5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                      ETAPA 2 DE 3
                    </span>
                    <Badge variant="outline" className="border-emerald-500/30 text-emerald-300 bg-emerald-500/10 text-[10px]">
                      IA: 8 Mensagens Únicas
                    </Badge>
                  </div>
                  <h2 className="mt-1 text-2xl font-bold text-foreground">
                    Revisar Mensagens Personalizadas
                  </h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    A IA gerou abordagens individualizadas para cada cliente. Selecione quem receberá o anúncio.
                  </p>
                </div>

                {/* Controles de Seleção e Contador */}
                <div className="flex items-center gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleToggleSelectAll}
                    className="text-xs font-semibold border-border/70"
                  >
                    {isAllSelected ? "Desmarcar Todos" : "SELECIONAR TODOS"}
                  </Button>
                  <div className="rounded-xl border border-cyan-500/30 bg-cyan-500/15 px-3 py-1.5 text-xs font-bold text-cyan-300">
                    {selectedCount} clientes selecionados
                  </div>
                </div>
              </div>

              {/* Lista dos 8 Clientes com Prévia das Mensagens */}
              <div className="grid gap-4 md:grid-cols-2">
                {clientDrafts.map((client, idx) => (
                  <div
                    key={client.clientId}
                    className={cn(
                      "rounded-2xl border p-5 transition-all relative flex flex-col justify-between",
                      client.selected
                        ? "border-cyan-500/40 bg-gradient-to-b from-[#070e20]/90 to-[#040816]/90 shadow-md"
                        : "border-border/50 bg-surface/40 opacity-60",
                    )}
                  >
                    <div>
                      {/* Cabeçalho do Cliente */}
                      <div className="flex items-start justify-between gap-3 border-b border-border/40 pb-3">
                        <div className="flex items-center gap-3">
                          <Checkbox
                            id={`client-check-${client.clientId}`}
                            checked={client.selected}
                            onCheckedChange={() => handleToggleClient(client.clientId)}
                            aria-label={`Selecionar cliente ${client.clientName}`}
                          />
                          <div className="grid size-9 place-items-center rounded-full bg-primary/15 text-primary font-bold text-xs border border-primary/25">
                            {client.avatar}
                          </div>
                          <div>
                            <h3 className="font-bold text-sm text-foreground">
                              {client.clientName}
                            </h3>
                            <div className="flex items-center gap-2 text-[11px] text-muted-foreground font-mono">
                              <Phone className="size-3 text-emerald-400" />
                              {client.phone}
                            </div>
                          </div>
                        </div>

                        <span className="text-[10px] font-mono text-muted-foreground">
                          Cliente #{idx + 1}
                        </span>
                      </div>

                      {/* Prévia da Mensagem Personalizada Estilo WhatsApp */}
                      <div className="mt-3.5 space-y-3">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-semibold text-cyan-300 flex items-center gap-1">
                            <Sparkles className="size-3" />
                            Abordagem Individualizada pela IA:
                          </span>
                          <button
                            type="button"
                            onClick={() => setEditingClientId(client.clientId)}
                            className="text-muted-foreground hover:text-cyan-300 flex items-center gap-1 transition-colors"
                          >
                            <Edit3 className="size-3" />
                            Editar texto
                          </button>
                        </div>

                        {/* Balão de Mensagem */}
                        <div className="rounded-xl border border-border/60 bg-[#06141a]/60 p-3 text-xs leading-relaxed text-slate-200 whitespace-pre-line font-sans border-l-2 border-l-emerald-500">
                          {client.message}
                        </div>

                        {/* Prévia do anexo de imagem */}
                        {campaignImage && (
                          <div className="flex items-center gap-2.5 rounded-lg border border-border/50 bg-black/30 p-2 text-xs">
                            <img
                              src={campaignImage}
                              alt="Anexo"
                              className="size-10 rounded object-cover border border-border/50"
                            />
                            <div className="min-w-0 flex-1">
                              <span className="font-semibold text-foreground truncate block">
                                {campaignTitle || "Anúncio Oficial"}
                              </span>
                              <span className="text-[10px] text-muted-foreground block">
                                Imagem do anúncio anexada
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Barra de Ação Inferior */}
              <div className="flex items-center justify-between rounded-2xl border border-border/60 bg-surface/90 p-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setActiveStep(1)}
                  className="text-xs font-semibold"
                >
                  <ArrowLeft className="mr-1.5 size-3.5" />
                  Voltar à Etapa 1
                </Button>

                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground hidden sm:inline">
                    {selectedCount} de {clientDrafts.length} selecionados
                  </span>
                  <Button
                    type="button"
                    size="lg"
                    onClick={handleContinueToStep3}
                    className="h-11 px-8 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all"
                  >
                    CONTINUAR
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* ETAPA 3 — INICIAR CAMPANHA & SIMULAÇÃO */}
          {/* ========================================================================= */}
          {activeStep === 3 && (
            <div className="max-w-3xl mx-auto space-y-6">
              <section className="rounded-2xl border border-border/60 bg-gradient-to-b from-surface/85 to-surface-2/45 p-6 sm:p-8 space-y-6">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                      ETAPA 3 DE 3
                    </span>
                    <Badge variant="outline" className="border-cyan-500/40 text-cyan-300 bg-cyan-500/10 text-[10px]">
                      Demonstração / Teste
                    </Badge>
                  </div>
                  <h2 className="mt-1 text-2xl font-bold text-foreground">
                    Resumo & Disparo da Campanha
                  </h2>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    Confira as informações consolidadas e inicie o processamento da campanha para os clientes selecionados.
                  </p>
                </div>

                {/* Resumo Simples em Cards Conforme Especificado */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-border/60 bg-[#070e20]/70 p-4">
                    <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider block">
                      CAMPANHA
                    </span>
                    <strong className="mt-1 text-base font-bold text-foreground block">
                      {campaignTitle || "FEIRÃO GRUPO NOVA SERRA"}
                    </strong>
                  </div>

                  <div className="rounded-xl border border-border/60 bg-[#070e20]/70 p-4">
                    <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider block">
                      CLIENTES SELECIONADOS
                    </span>
                    <strong className="mt-1 text-base font-bold text-cyan-300 block">
                      {selectedCount} clientes
                    </strong>
                  </div>

                  <div className="rounded-xl border border-border/60 bg-[#070e20]/70 p-4">
                    <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider block">
                      MENSAGENS PERSONALIZADAS
                    </span>
                    <strong className="mt-1 text-base font-bold text-foreground block">
                      {selectedCount} abordagens únicas
                    </strong>
                  </div>

                  <div className="rounded-xl border border-border/60 bg-[#070e20]/70 p-4">
                    <span className="text-[10px] font-mono font-bold text-muted-foreground uppercase tracking-wider block">
                      IMAGEM & IA
                    </span>
                    <div className="mt-1 flex items-center gap-3 text-xs font-bold text-emerald-400">
                      <span>✓ Imagem adicionada</span>
                      <span>✓ Mensagens geradas</span>
                    </div>
                  </div>
                </div>

                {/* Caixa de Aviso de Demonstração */}
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3.5 text-xs leading-relaxed text-slate-200">
                  <strong className="text-amber-300 font-semibold">Aviso de Protótipo:</strong>{" "}
                  Nenhum envio real por WhatsApp será realizado neste momento. O sistema simulará o processamento e a distribuição das abordagens personalizadas para validação executiva com o Grupo Nova Serra.
                </div>

                {/* ÁREA DE SIMULAÇÃO DE DISPARO */}
                {!isDispatching && !dispatchCompleted && (
                  <div className="pt-2">
                    <Button
                      type="button"
                      size="lg"
                      onClick={handleStartDispatch}
                      className="w-full h-14 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-base shadow-[0_0_30px_rgba(16,185,129,0.35)] transition-all"
                    >
                      <Play className="mr-2 size-5 fill-slate-950" />
                      INICIAR CAMPANHA
                    </Button>
                  </div>
                )}

                {/* PROGRESSO EM TEMPO REAL */}
                {(isDispatching || dispatchCompleted) && (
                  <div className="rounded-xl border border-cyan-500/40 bg-[#061024] p-5 space-y-4">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-cyan-300 flex items-center gap-2">
                        {isDispatching && <Sparkles className="size-4 animate-spin text-cyan-400" />}
                        {isDispatching ? "Preparando e processando envios..." : "Disparos concluídos com sucesso!"}
                      </span>
                      <span className="font-mono font-bold text-foreground text-sm">
                        {dispatchProgress}%
                      </span>
                    </div>

                    {/* Barra de Progresso */}
                    <div className="h-3 overflow-hidden rounded-full bg-secondary/80 border border-border/40 p-0.5">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 via-teal-400 to-emerald-400 transition-all duration-300"
                        style={{ width: `${dispatchProgress}%` }}
                      />
                    </div>

                    {/* Checklist em Tempo Real Conforme Especificado */}
                    <div className="rounded-lg border border-border/50 bg-black/40 p-3 space-y-1.5 max-h-56 overflow-y-auto custom-scrollbar font-mono text-xs">
                      {clientDrafts
                        .filter((c) => c.selected)
                        .map((c, i) => {
                          const isDone = c.status === "sent" || dispatchCompleted;
                          const isCurrent = currentDispatchIndex === i && isDispatching;

                          return (
                            <div
                              key={c.clientId}
                              className={cn(
                                "flex items-center justify-between py-1 px-2 rounded transition-colors",
                                isDone
                                  ? "text-emerald-300 bg-emerald-500/10"
                                  : isCurrent
                                    ? "text-cyan-300 bg-cyan-500/15 animate-pulse"
                                    : "text-muted-foreground",
                              )}
                            >
                              <span>{c.clientName}</span>
                              <span>{isDone ? "✓ Enviado" : isCurrent ? "Enviando..." : "Na fila"}</span>
                            </div>
                          );
                        })}
                    </div>

                    {dispatchCompleted && (
                      <div className="rounded-lg border border-emerald-500/40 bg-emerald-500/15 p-4 text-center space-y-2">
                        <CheckCircle2 className="size-8 text-emerald-400 mx-auto" />
                        <h4 className="font-bold text-base text-emerald-300">
                          Campanha concluída com sucesso.
                        </h4>
                        <p className="text-xs text-slate-300">
                          Todas as {selectedCount} mensagens personalizadas foram processadas e registradas no histórico da plataforma.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* BOTÕES DE FINALIZAÇÃO */}
                <div className="flex items-center justify-between border-t border-border/50 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={isDispatching}
                    onClick={() => setActiveStep(2)}
                    className="text-xs font-semibold"
                  >
                    <ArrowLeft className="mr-1.5 size-3.5" />
                    Revisar Mensagens
                  </Button>

                  {dispatchCompleted && (
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleStartNewCampaign}
                        className="text-xs font-semibold"
                      >
                        Nova Campanha
                      </Button>
                      <Button
                        type="button"
                        onClick={() => setActiveStep(null)}
                        className="text-xs font-bold bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                      >
                        Ver no Histórico
                      </Button>
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}
        </div>
      )}

      {/* MODAL / DIALOG PARA EDITAR MENSAGEM DO CLIENTE (ETAPA 2) */}
      <Dialog
        open={Boolean(editingClientId)}
        onOpenChange={(open) => {
          if (!open) setEditingClientId(null);
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Editar Abordagem Personalizada</DialogTitle>
            <DialogDescription>
              Ajuste o texto gerado pela IA para este cliente específico antes do envio.
            </DialogDescription>
          </DialogHeader>

          {editingClientId && (
            <div className="space-y-4 pt-2">
              <Textarea
                rows={7}
                defaultValue={
                  clientDrafts.find((c) => c.clientId === editingClientId)?.message || ""
                }
                id="edit-message-textarea"
                className="text-xs leading-relaxed"
              />
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingClientId(null)}
                  className="text-xs"
                >
                  Cancelar
                </Button>
                <Button
                  size="sm"
                  onClick={() => {
                    const el = document.getElementById(
                      "edit-message-textarea",
                    ) as HTMLTextAreaElement;
                    if (el) handleUpdateClientMessage(editingClientId, el.value);
                  }}
                  className="text-xs font-semibold bg-cyan-500 text-slate-950 hover:bg-cyan-400"
                >
                  Salvar Alteração
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* MODAL / DIALOG PARA VER DETALHES DE CAMPANHA NO HISTÓRICO */}
      <Dialog
        open={Boolean(selectedHistoryCampaign)}
        onOpenChange={(open) => {
          if (!open) setSelectedHistoryCampaign(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto custom-scrollbar">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Megaphone className="size-5 text-cyan-400" />
              {selectedHistoryCampaign?.title}
            </DialogTitle>
            <DialogDescription>
              Campanha realizada em {selectedHistoryCampaign?.date} · {selectedHistoryCampaign?.totalClients} clientes
            </DialogDescription>
          </DialogHeader>

          {selectedHistoryCampaign && (
            <div className="space-y-5 pt-3">
              {/* Imagem e Info */}
              <div className="flex flex-col sm:flex-row gap-4 rounded-xl border border-border/60 bg-surface-2/40 p-4">
                <img
                  src={selectedHistoryCampaign.image}
                  alt={selectedHistoryCampaign.title}
                  className="size-24 rounded-lg object-cover border border-border/60 shrink-0"
                />
                <div>
                  <h4 className="font-bold text-sm text-foreground">Conteúdo do Anúncio</h4>
                  <p className="mt-1 text-xs text-muted-foreground leading-relaxed">
                    {selectedHistoryCampaign.info}
                  </p>
                </div>
              </div>

              {/* Mensagens enviadas para cada cliente */}
              <div className="space-y-3">
                <h4 className="font-bold text-sm text-foreground flex items-center gap-2">
                  <MessageSquare className="size-4 text-cyan-400" />
                  Mensagens Personalizadas Enviadas
                </h4>

                <div className="space-y-2.5 max-h-72 overflow-y-auto custom-scrollbar pr-1">
                  {selectedHistoryCampaign.messages.map((m, i) => (
                    <div
                      key={i}
                      className="rounded-xl border border-border/60 bg-[#061220]/70 p-3.5 space-y-1.5"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <strong className="font-semibold text-foreground">{m.clientName}</strong>
                        <span className="font-mono text-muted-foreground">{m.phone}</span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line border-l-2 border-l-cyan-500 pl-2">
                        {m.message}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedHistoryCampaign(null)}
                  className="text-xs"
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
