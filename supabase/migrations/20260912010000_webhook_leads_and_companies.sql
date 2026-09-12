-- ============================================================================
-- MIGRATION: 20260912010000_webhook_leads_and_companies.sql
-- Módulo de Webhooks, Qualificação de Leads e Logs de Integração Multi-Tenant
-- ============================================================================

-- 1. Tabela de Empresas (Multi-Tenant)
CREATE TABLE IF NOT EXISTS public.companies (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  webhook_token TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 2. Tabela de Leads recebidos por Webhook / Canais Externos
CREATE TABLE IF NOT EXISTS public.leads (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  external_id TEXT,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  source TEXT NOT NULL DEFAULT 'Webhook',
  campaign TEXT,
  interest TEXT,
  budget TEXT,
  city TEXT,
  state TEXT,
  store TEXT,
  message TEXT,
  score INTEGER NOT NULL DEFAULT 50,
  score_classification TEXT NOT NULL DEFAULT 'Warm',
  score_reasons JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'Novo',
  seller_id TEXT,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  raw_payload JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Tabela de Logs de Execução de Integrações
CREATE TABLE IF NOT EXISTS public.integration_logs (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  source TEXT NOT NULL DEFAULT 'Webhook',
  status TEXT NOT NULL, -- 'success' | 'duplicate' | 'error' | 'rejected'
  http_code INTEGER NOT NULL DEFAULT 200,
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  error_message TEXT,
  lead_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Índices de busca rápida e validação de duplicidade por empresa
CREATE INDEX IF NOT EXISTS idx_leads_company_external_id ON public.leads(company_id, external_id) WHERE external_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_company_phone_email ON public.leads(company_id, phone, email);
CREATE INDEX IF NOT EXISTS idx_leads_company_created_at ON public.leads(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_integration_logs_company_created ON public.integration_logs(company_id, created_at DESC);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.integration_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso permissivo para leitura e operações da aplicação
CREATE POLICY "Permitir leitura anonima de empresas ativas" ON public.companies
  FOR SELECT USING (is_active = true);

CREATE POLICY "Permitir leitura de leads por empresa" ON public.leads
  FOR ALL USING (true);

CREATE POLICY "Permitir leitura de logs de integracao" ON public.integration_logs
  FOR ALL USING (true);

-- Inserção da empresa matriz padrão para o ambiente Vyntra
INSERT INTO public.companies (id, name, slug, webhook_token, is_active)
VALUES (
  'vyntra-automotive',
  'Vyntra Concessionárias RS / SC',
  'vyntra-automotive',
  'vnt_sec_9a8b7c6d5e4f3a2b1c0d',
  true
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  is_active = EXCLUDED.is_active;
