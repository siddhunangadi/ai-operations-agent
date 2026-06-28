-- Enable UUID extension
create extension if not exists "pgcrypto";

---------------------------------------------------------
-- PROFILES
---------------------------------------------------------

create table if not exists profiles (

    id uuid primary key,

    email text not null unique,

    full_name text,

    avatar_url text,

    created_at timestamptz default now(),

    updated_at timestamptz default now()

);

---------------------------------------------------------
-- ORGANIZATIONS
---------------------------------------------------------

create table if not exists organizations (

    id uuid primary key default gen_random_uuid(),

    name text not null,

    slug text unique,

    owner_id uuid references profiles(id),

    created_at timestamptz default now()

);

---------------------------------------------------------
-- ORGANIZATION MEMBERS
---------------------------------------------------------

create table if not exists organization_members (

    id uuid primary key default gen_random_uuid(),

    organization_id uuid references organizations(id) on delete cascade,

    profile_id uuid references profiles(id) on delete cascade,

    role text not null,

    created_at timestamptz default now(),

    unique(organization_id, profile_id)

);

---------------------------------------------------------
-- PROJECTS
---------------------------------------------------------

create table if not exists projects (

    id uuid primary key default gen_random_uuid(),

    organization_id uuid references organizations(id) on delete cascade,

    name text not null,

    description text,

    created_at timestamptz default now()

);

---------------------------------------------------------
-- PROVIDERS
---------------------------------------------------------

create table if not exists providers (

    id uuid primary key default gen_random_uuid(),

    project_id uuid references projects(id) on delete cascade,

    provider_name text not null,

    model_name text,

    api_key_name text,

    created_at timestamptz default now()

);

---------------------------------------------------------
-- USAGE RECORDS
---------------------------------------------------------

create table if not exists usage_records (

    id uuid primary key default gen_random_uuid(),

    project_id uuid references projects(id),

    provider_id uuid references providers(id),

    prompt_tokens integer,

    completion_tokens integer,

    total_tokens integer,

    estimated_cost numeric(12,6),

    latency_ms integer,

    created_at timestamptz default now()

);
