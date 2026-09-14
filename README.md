# VYNTRA Demo Experience

Build a fully functional frontend prototype of a SaaS platform called VYNTRA.

The product is an intelligent opportunity management platform designed initially for vehicle/motorcycle dealerships.

The core problem VYNTRA solves:

Dealerships spend money generating opportunities, but many are poorly qualified. Good opportunities are also frequently lost because salespeople respond late, forget follow-ups, or don’t know which product or commercial route is best.

VYNTRA should qualify, score, prioritize, route and monitor opportunities so the dealership can focus its sales team on the opportunities with the highest commercial potential.

IMPORTANT:

* This is a TEST/MVP prototype.
* DO NOT create or require a real backend.
* DO NOT use a real database.
* Use realistic mock data stored locally in the frontend.
* All buttons, filters, navigation, modals and interactions must work.
* Data can be stored in React state/localStorage only.
* The prototype must feel like a real production SaaS.
* Do not create fake API calls that don’t work.
* No payment system.
* No real CPF/credit consultation.
* No real WhatsApp integration. Buttons can simulate the action.
* All customer data must be fictional.

==================================================

1. BRAND
    ==================================================

Product name:

VYNTRA

Positioning:

“Inteligência para transformar oportunidades em resultados.”

VYNTRA is NOT a CRM.

It is an intelligent layer between advertising/lead generation and the dealership’s commercial operation.

Visual identity:

* Premium SaaS
* Modern
* Clean
* Professional
* Technology/AI feeling
* Dark navy/graphite interface with subtle blue/purple accents
* Avoid excessive gradients
* Excellent spacing
* Strong typography
* Minimal and elegant
* Responsive desktop-first interface
* Also usable on mobile

Create a simple VYNTRA logo using typography and a subtle geometric symbol.

==================================================
2. TEST LOGIN

Create a login screen.

Title:

“Bem-vindo à Vyntra”

Subtitle:

“Inteligência para transformar oportunidades em resultados.”

Login fields:

E-mail
Senha

TEST ACCESS:

E-mail:
gestor@vyntra.com

Password:
123456

Create a visible “Acesso de demonstração” area with these credentials.

When the user logs in, enter the Gestor Dashboard.

Do NOT require backend authentication.

Use local frontend authentication/state.

Include:

* Entrar
* Mostrar/ocultar senha
* Remember me
* Logout

==================================================
3. APPLICATION STRUCTURE

After login, create a professional SaaS dashboard with:

LEFT SIDEBAR:

VYNTRA logo

Overview
Oportunidades
Distribuição
Follow-ups
Propostas
Equipe
Insights
Configurações

Bottom:
Gestor
gestor@vyntra.com
Logout

Top bar:

* Search
* Notifications
* Current dealership: “Grupo Nova Serra — Demonstração”
* User profile

==================================================
4. OVERVIEW DASHBOARD

The main dashboard should immediately communicate the financial/commercial problem VYNTRA solves.

Header:

“Visão geral”

Subtitle:

“Veja onde suas oportunidades estão e onde o dinheiro está sendo perdido.”

Create KPI cards:

Oportunidades recebidas
142

Qualificadas
87

Muito quentes
24

Em atendimento
61

Propostas enviadas
28

Vendas realizadas
11

Oportunidades perdidas
19

Taxa de conversão
12,6%

Also display:

“Tempo médio de primeira resposta”
8 min

“Follow-ups atrasados”
7

“Potencial comercial em aberto”
R$ 287.400

==================================================
5. MAIN OPPORTUNITY FUNNEL

Create a funnel visualization:

142
Oportunidades recebidas

87
Qualificadas

61
Em atendimento

28
Propostas

19
Negociações avançadas

11
Vendas

Show conversion percentages between stages.

Title:

“Funil de oportunidades”

Add a small insight:

“Você está perdendo oportunidades principalmente entre atendimento e proposta.”

==================================================
6. OPPORTUNITY TEMPERATURE

Create a chart/card:

🔥 Muito quente
24

🟠 Potencial
39

🟡 Morno
36

❄️ Baixo potencial
43

Use visual indicators.

Explain:

“Temperatura baseada em intenção de compra, prazo, orçamento, produto, forma de pagamento e comportamento.”

==================================================
7. OPPORTUNITIES PAGE

Create a complete opportunity management table.

Columns:

Temperatura
Cliente
Produto
Categoria
Forma de compra
Orçamento
Entrada
Prazo
Score
Responsável
Status
Último contato
Ação

Example fictional customers:

João Silva
Sahara 300
0 km
Financiamento
Até R$ 1.000/mês
R$ 10.000 entrada
Até 7 dias
94
Carlos
Em atendimento

Mariana Costa
PCX
0 km
Consórcio
Até R$ 700/mês
Sem entrada
Até 30 dias
81
Juliana
Novo

Pedro Almeida
CG 160
Seminova
À vista
Até R$ 18.000

1–3 meses
67
Rafael
Follow-up

Lucas Martins
CB 300F
0 km
Financiamento
Até R$ 500/mês
R$ 2.000
Até 30 dias
58
Marcos
Aguardando cliente

Make rows clickable.

Clicking an opportunity must open a detailed opportunity drawer/modal.

==================================================
8. OPPORTUNITY DETAIL

Create a complete customer profile.

Header:

🔥 94
João Silva

“Alta probabilidade de compra”

Information:

Produto desejado:
Honda Sahara 300

Categoria:
0 km

Forma de compra:
Financiamento

Prazo:
Próximos 7 dias

Parcela pretendida:
Até R$ 1.000

Entrada:
R$ 10.000

Possui moto:
Sim

Moto atual:
Honda CB 250F 2019

Pretende utilizar na negociação:
Sim

Já fez simulação:
Sim

Principal objeção:
Valor da parcela

Then show:

“Rota recomendada pela Vyntra”

FINANCIAMENTO — PRINCIPAL

“SEMINOVA — ALTERNATIVA”

Explain:

“O orçamento informado apresenta possível incompatibilidade com a configuração desejada. Uma unidade seminova pode aumentar a aderência ao orçamento.”

Also allow:

“Alterar rota”

==================================================
9. LEAD QUALIFICATION

Create a “Como a Vyntra qualifica” section.

Questions:

1. O que você está procurando?

Honda 0 km
Honda seminova
Ainda não sei

2. Como pretende comprar?

Financiamento
Consórcio
À vista
Ainda não sei

3. Quanto pretende investir por mês?

Até R$300
R$300–500
R$500–700
R$700–1.000
R$1.000+

4. Possui entrada?

Sim
Não
Ainda não

5. Quando pretende comprar?

Próximos 7 dias
Até 30 dias
1–3 meses
Mais de 3 meses
Apenas pesquisando

6. Já fez alguma simulação ou falou com uma loja?

Já estou negociando
Já simulei
Apenas pesquisei
Não

7. Possui uma moto atualmente?

Sim
Não

8. O que está impedindo a compra hoje?

Preciso financiar
Não tenho entrada
Preciso de parcela menor
Questão de crédito
Estou comparando opções
Estou juntando dinheiro
Nada
Outro

Then collect:

Nome
WhatsApp
E-mail opcional

Create a privacy/consent notice.

Do NOT perform real credit analysis.

==================================================
10. SCORING SYSTEM

Create a simulated Vyntra Score from 0–100.

Rules:

80–100:
🔥 Muito quente

60–79:
🟠 Potencial

40–59:
🟡 Morno

0–39:
❄️ Baixo potencial

Score should consider:

Purchase timing
Product specificity
Budget
Down payment
Purchase method
Prior simulation
Negotiation status
Trade-in
Objection
Product/budget compatibility
Purchase intent

Create a visual score ring.

Example:

94/100

“Alta intenção de compra”

Show reasons:

* Compra em até 7 dias
* Produto definido
* Entrada disponível
* Já realizou simulação
* Possui moto para troca

==================================================
11. PRODUCT / COMMERCIAL ROUTE

This is one of the most important Vyntra features.

Vyntra should not simply classify opportunities as good or bad.

It should determine the most appropriate commercial route.

Possible routes:

0 km
Seminova
Financiamento
Consórcio
À vista
Avaliação de troca
Atendimento consultivo

Example:

Customer wants Sahara 300 0 km but budget is incompatible.

Vyntra:

“Produto desejado: Sahara 300 0 km”

“Compatibilidade com orçamento: baixa”

“Rota alternativa recomendada: Sahara 300 seminova”

Another example:

Customer has difficulty obtaining financing.

Vyntra can recommend:

“Consórcio — avaliar como alternativa”

IMPORTANT:
Never state that a customer is “pré-aprovado” based only on this system.

Use:

“Opção recomendada para avaliação”

Actual approval must happen through the authorized financial/consortium process.

==================================================
12. SELLER RESPONSE TIMER

Every new opportunity assigned to a seller starts a response timer.

Example:

🔥 Hot opportunity

“Sem atendimento há 11 minutos”

Create visual warning.

Rules:

0–5 minutes:
Normal

5–10 minutes:
Attention

10+ minutes:
Critical

If a hot opportunity remains unattended:

“⚠️ Oportunidade quente sem atendimento”

Button:

“Notificar responsável”

Then:

“Escalar para gestor”

Make these buttons functional in the prototype.

==================================================
13. SELLER DASHBOARD

Create a seller view.

Example:

“Olá, Carlos.”

“Você possui 5 oportunidades aguardando ação.”

Cards:

🔥 3 oportunidades quentes
⏰ 2 follow-ups atrasados
📄 4 propostas aguardando retorno
💰 R$ 83.500 em potencial

Opportunity cards should show:

Customer
Product
Score
Purchase method
Budget
Deadline
Objection
Recommended route

Buttons:

CHAMAR CLIENTE
REGISTRAR CONTATO
ENVIAR PROPOSTA
AGENDAR FOLLOW-UP

Buttons should update the opportunity status locally.

==================================================
14. FOLLOW-UP SYSTEM

Create Follow-ups page.

Show:

Hoje
Amanhã
Próximos dias
Atrasados

Example:

🔥 João Silva
Sahara 300
Follow-up atrasado
Último contato: ontem
Próxima ação: enviar condição revisada

Buttons:

Concluir
Reagendar
WhatsApp
Ligar

Create counters:

7 atrasados
12 para hoje
8 amanhã

When clicking “Concluir”, update the task visually.

==================================================
15. PROPOSALS

Create a Proposals page.

Statuses:

Rascunho
Enviada
Visualizada
Aguardando retorno
Negociação
Fechada
Perdida

Example proposal:

João Silva
Sahara 300
Financiamento
R$ XX.XXX
Parcela estimada
Responsável: Carlos

Show proposal pipeline.

==================================================
16. DISTRIBUTION

Create a Distribution page.

Explain:

“Vyntra distribui oportunidades de acordo com produto, perfil, disponibilidade e carga de atendimento.”

Create seller cards:

Carlos
8 oportunidades
2 quentes
Response time: 6 min

Juliana
7 oportunidades
4 quentes
Response time: 4 min

Rafael
10 oportunidades
1 quente
Response time: 13 min

Marcos
5 oportunidades
2 quentes
Response time: 8 min

Create simulated rules:

Distribuição automática: ON

Rules:

Produto
Perfil do vendedor
Disponibilidade
Quantidade de oportunidades
Prioridade

Create toggle controls that work visually.

==================================================
17. TEAM MANAGEMENT

Create Equipe page.

Table:

Seller
Status
Opportunities
Hot
Response time
Conversion
Sales

Example:

Carlos
Online
18
5
6 min
18%
4 sales

Juliana
Online
16
7
4 min
21%
5 sales

Rafael
Offline
22
3
13 min
9%
2 sales

Marcos
Online
12
4
8 min
14%
2 sales

Click seller to see performance.

==================================================
18. MANAGER ALERTS

Create a notification center.

Examples:

🔥 João Silva — hot opportunity without response.

⏰ Follow-up overdue for Pedro Almeida.

📄 Proposal from Mariana Costa has no follow-up.

⚠️ Seller Rafael has 3 hot opportunities without response.

💰 Opportunity worth R$ 27,000 may be lost.

Make notifications clickable.

==================================================
19. INSIGHTS

Create a sophisticated Insights page.

Show:

“Por que estamos perdendo oportunidades?”

Example analysis:

35%
Parcela incompatível

24%
Sem entrada

18%
Cliente não respondeu

12%
Problema de crédito

7%
Comprou outra marca

4%
Outros

Create insight cards:

“Seu maior gargalo está entre qualificação e primeiro atendimento.”

“Leads respondidos em até 5 minutos apresentam maior taxa de avanço.”

“Seminovas estão recuperando oportunidades que não se encaixam no orçamento de 0 km.”

These are simulated insights.

==================================================
20. MANAGER ROI VIEW

This section is very important.

Create:

“Impacto comercial”

Show:

Investimento estimado em oportunidades:
R$ 18.500

Oportunidades recebidas:
142

Oportunidades qualificadas:
87

Oportunidades recuperáveis:
23

Potencial comercial recuperável:
R$ 126.000

Show a visual comparison:

SEM VYNTRA
Oportunidades perdidas
R$ XXX

COM VYNTRA
Oportunidades priorizadas
R$ XXX

Use simulated values and clearly label them as demonstration data.

==================================================
21. FILTERS

Throughout the application, add functional filters:

Período
Vendedor
Produto
0 km / Seminova
Financiamento / Consórcio / À vista
Temperatura
Status

Filters must actually change the displayed mock data.

==================================================
22. SEARCH

Global search should work with mock data.

Search customer names, product names and sellers.

==================================================
23. DEMO DATA

Create at least 25 realistic fictional opportunities.

Include different:

Models:
CG 160
Biz
Pop
PCX
ADV
CB 300F
Sahara 300
Tornado 300

Categories:
0 km
Seminova

Purchase methods:
Financing
Consórcio
Cash

Different scores:
25–98

Different sellers.

Different statuses.

Some hot opportunities must be unattended.

Some must have overdue follow-ups.

Some must have proposals.

Some must be lost.

Some must be sales.

This makes the dashboard feel real.

==================================================
24. INTERACTION REQUIREMENTS

The prototype must NOT be static.

Implement:

* Login
* Logout
* Sidebar navigation
* Search
* Filters
* Opening opportunity details
* Changing opportunity status
* Assigning seller
* Starting/ending follow-up
* Completing follow-up
* Rescheduling follow-up
* Sending simulated WhatsApp action
* Sending simulated proposal
* Notifications
* Response timer
* Manager escalation
* Distribution toggles
* Seller performance details
* Charts
* Dashboard counters
* Responsive behavior

Use toast notifications for simulated actions.

Examples:

“Cliente marcado como contatado.”

“Follow-up concluído.”

“Oportunidade escalada para o gestor.”

“Proposta enviada.”

==================================================
25. IMPORTANT UX PRINCIPLE

The entire interface should answer one question:

“Quais oportunidades merecem minha atenção AGORA?”

The manager should immediately see:

1. How many opportunities entered.
2. How many are qualified.
3. Which are hot.
4. Which sellers haven’t responded.
5. Which follow-ups are overdue.
6. Which opportunities are likely to be lost.
7. Which commercial route Vyntra recommends.
8. How much potential revenue is currently at risk.
9. Which sellers are performing.
10. Where the dealership is losing money.

==================================================
26. DEMO MODE

Add a small badge in the interface:

“DEMO — Dados fictícios”

And in Settings:

“Este ambiente utiliza dados simulados exclusivamente para demonstração.”

==================================================
27. TECHNICAL REQUIREMENTS

Use React + TypeScript.

Use a modern component architecture.

Use reusable components.

Use local mock data.

Use localStorage where necessary for demo persistence.

No backend.

No database.

No authentication provider.

No external CRM integration.

No real financial/credit APIs.

No real WhatsApp API.

The code should be organized so a real backend can be connected later.

Create clean interfaces/types for:

Opportunity
Customer
Seller
FollowUp
Proposal
Notification
Score
CommercialRoute

==================================================
28. FINAL QUALITY REQUIREMENT

Do NOT make this look like a generic admin dashboard.

VYNTRA must look like a specialized commercial intelligence platform.

The product should visually communicate:

QUALIFY
PRIORITIZE
ROUTE
ACT
FOLLOW
RECOVER
MEASURE

The final prototype must be polished enough to demonstrate to a dealership manager.

Build the complete experience now.
Do not stop at the login screen.
Do not leave placeholder pages.
Every major menu item must contain realistic demo content and functional interactions.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://vyntra-lead-pilot.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/d0f9e93f-8a18-4678-9e31-40e1088e8fa9).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
