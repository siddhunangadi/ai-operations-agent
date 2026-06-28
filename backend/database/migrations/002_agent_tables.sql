-- V1.0 agent runtime tables (align backend code with Supabase schema)

create table if not exists usage_logs (
    id uuid primary key default gen_random_uuid(),
    organization_id text not null default 'org_1',
    project_name text,
    provider text not null,
    model text,
    prompt_tokens integer default 0,
    completion_tokens integer default 0,
    total_tokens integer default 0,
    request_cost numeric(12, 6) default 0,
    latency_ms integer default 0,
    created_at timestamptz default now()
);

create table if not exists world_model (
    id uuid primary key default gen_random_uuid(),
    organization_id text not null unique,
    state jsonb not null default '{}'::jsonb,
    updated_at timestamptz default now()
);

create table if not exists agent_memory (
    id uuid primary key default gen_random_uuid(),
    organization_id text not null default 'org_1',
    content jsonb not null default '{}'::jsonb,
    created_at timestamptz default now()
);

create table if not exists organization_memory (
    id uuid primary key default gen_random_uuid(),
    organization_id text not null default 'org_1',
    content jsonb not null default '{}'::jsonb,
    created_at timestamptz default now()
);

create table if not exists agent_learning (
    id uuid primary key default gen_random_uuid(),
    organization_id text not null default 'org_1',
    lesson_type text,
    lesson text,
    confidence numeric(4, 3) default 0,
    affected_components text[],
    created_at timestamptz default now()
);

create table if not exists action_history (
    id uuid primary key default gen_random_uuid(),
    organization_id text not null default 'org_1',
    action_name text not null,
    description text,
    status text not null default 'PENDING',
    parameters jsonb default '{}'::jsonb,
    result jsonb default '{}'::jsonb,
    logs text[],
    created_at timestamptz default now()
);

create table if not exists budgets (
    id uuid primary key default gen_random_uuid(),
    organization_id text not null default 'org_1',
    project_name text not null,
    monthly_budget numeric(12, 2) not null,
    created_at timestamptz default now()
);

create index if not exists idx_usage_logs_org on usage_logs(organization_id);
create index if not exists idx_action_history_org on action_history(organization_id);
