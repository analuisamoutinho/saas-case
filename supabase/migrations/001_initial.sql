create extension if not exists vector;

create table clientes (
  id uuid primary key default gen_random_uuid(),
  nome text not null,
  criado_em timestamptz default now(),
  perfil_negocio jsonb,
  dna jsonb,
  scores jsonb,
  gargalo jsonb,
  meta jsonb,
  status text default 'novo',
  progresso text
);

create table fontes (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid references clientes(id) on delete cascade,
  tipo text,
  conteudo text,
  arquivo_url text,
  criado_em timestamptz default now()
);

create table ativos (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid references clientes(id) on delete cascade,
  tipo text,
  arquivo_url text,
  criado_em timestamptz default now()
);

create table playbooks (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid references clientes(id) on delete cascade,
  diagnostico_executivo text,
  prioridades jsonb,
  hipoteses jsonb,
  roadmap_90d jsonb,
  criado_em timestamptz default now()
);

create table memoria (
  id uuid primary key default gen_random_uuid(),
  cliente_id uuid references clientes(id) on delete cascade,
  tipo text,
  conteudo text,
  embedding vector(1536),
  criado_em timestamptz default now()
);
