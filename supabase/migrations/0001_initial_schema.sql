-- =============================================================================
-- IT Firma Growth OS - Database Schema
-- Migration: 0001_initial_schema
-- =============================================================================
-- Designet for å støtte hele systemet: nettsider, artikler, sider, leads,
-- domener, oppgaver, brukere, roller, RLS, og scalable portfolio management.
-- =============================================================================

-- Extensions
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =============================================================================
-- ENUMS
-- =============================================================================

-- User roles
create type user_role as enum (
  'owner',
  'admin',
  'seo_manager',
  'content_editor',
  'writer',
  'lead_manager',
  'domain_manager',
  'developer',
  'viewer'
);

-- Site status
create type site_status as enum (
  'active',
  'draft',
  'paused',
  'archived'
);

-- Article status
create type article_status as enum (
  'draft',
  'review',
  'approved',
  'published',
  'archived',
  'needs_update'
);

-- Article search intent
create type search_intent as enum (
  'informational',
  'commercial',
  'transactional',
  'navigational',
  'local'
);

-- Article type
create type article_type as enum (
  'guide',
  'comparison',
  'definition',
  'how_to',
  'listicle',
  'review',
  'landing_article',
  'news',
  'faq_article',
  'pillar_page',
  'cluster_article'
);

-- CTA types
create type cta_type as enum (
  'lead_form',
  'contact',
  'comparison',
  'download',
  'newsletter',
  'domain_lease',
  'quote_request'
);

-- Schema markup types
create type schema_type as enum (
  'Article',
  'BlogPosting',
  'FAQPage',
  'HowTo',
  'Product',
  'Service',
  'LocalBusiness',
  'NewsArticle',
  'WebPage',
  'CollectionPage'
);

-- Page templates
create type page_template as enum (
  'home',
  'standard',
  'landing',
  'service',
  'contact',
  'legal',
  'comparison',
  'knowledge_base'
);

-- Domain status
create type domain_status as enum (
  'owned',
  'not_started',
  'planned',
  'in_build',
  'live',
  'ranking',
  'lead_machine',
  'for_lease',
  'reserved',
  'sold',
  'paused',
  'expired_watch'
);

-- Lead status
create type lead_status as enum (
  'new',
  'contacted',
  'qualified',
  'won',
  'lost',
  'spam'
);

-- Task status
create type task_status as enum (
  'backlog',
  'todo',
  'in_progress',
  'review',
  'approved',
  'done',
  'blocked'
);

-- Task type
create type task_type as enum (
  'write_article',
  'edit_article',
  'seo_review',
  'aeo_review',
  'geo_review',
  'llm_review',
  'publish_article',
  'update_prices',
  'check_domain',
  'follow_up_lead',
  'build_landing_page',
  'upload_media',
  'technical_fix',
  'internal_linking',
  'add_faq',
  'add_sources',
  'update_meta'
);

-- Task priority
create type task_priority as enum (
  'low',
  'medium',
  'high',
  'urgent'
);

-- =============================================================================
-- HELPER FUNCTIONS
-- =============================================================================

-- Auto-update updated_at trigger
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =============================================================================
-- TABLES
-- =============================================================================

-- -----------------------------------------------------------------------------
-- profiles - kobler Supabase Auth til våre roller
-- -----------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  full_name text,
  avatar_url text,
  role user_role not null default 'viewer',
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index profiles_email_idx on profiles(email);
create index profiles_role_idx on profiles(role);

create trigger profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();

-- Auto-create profile when user signs up
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'viewer'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- -----------------------------------------------------------------------------
-- sites - nettsider i porteføljen
-- -----------------------------------------------------------------------------
create table sites (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  domain text not null unique,
  slug text not null unique,
  description text,
  logo_url text,
  primary_color text default '#2563FF',
  secondary_color text default '#27D0C3',
  status site_status not null default 'draft',
  language text default 'no',
  country text default 'NO',
  default_seo_title text,
  default_seo_description text,
  default_og_image text,
  llms_enabled boolean not null default true,
  sitemap_enabled boolean not null default true,
  robots_enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index sites_status_idx on sites(status);
create index sites_slug_idx on sites(slug);
create index sites_domain_idx on sites(domain);

create trigger sites_updated_at
  before update on sites
  for each row execute function set_updated_at();

-- -----------------------------------------------------------------------------
-- domains - domeneportefølje (over 2000 domener)
-- -----------------------------------------------------------------------------
create table domains (
  id uuid primary key default uuid_generate_v4(),
  domain_name text not null unique,
  tld text,
  category text,
  industry text,
  status domain_status not null default 'owned',
  registrar text,
  renewal_date date,
  purchase_price numeric(12, 2),
  estimated_value numeric(12, 2),
  asking_price numeric(12, 2),
  leasing_price_monthly numeric(12, 2),
  lead_potential_score smallint check (lead_potential_score between 0 and 100),
  traffic_potential_score smallint check (traffic_potential_score between 0 and 100),
  seo_potential_score smallint check (seo_potential_score between 0 and 100),
  commercial_intent_score smallint check (commercial_intent_score between 0 and 100),
  content_score smallint check (content_score between 0 and 100),
  priority_score smallint check (priority_score between 0 and 100),
  project_site_id uuid references sites(id) on delete set null,
  assigned_to uuid references profiles(id) on delete set null,
  notes text,
  dns_status text,
  nameserver_status text,
  ssl_status text,
  built_status text,
  traffic_status text,
  lead_status text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index domains_status_idx on domains(status);
create index domains_priority_score_idx on domains(priority_score desc);
create index domains_renewal_date_idx on domains(renewal_date);
create index domains_project_site_id_idx on domains(project_site_id);
create index domains_assigned_to_idx on domains(assigned_to);
create index domains_tld_idx on domains(tld);
create index domains_category_idx on domains(category);
create index domains_domain_name_trgm_idx on domains using gin (domain_name gin_trgm_ops);

-- Trigram for raskere søk på 2000+ domener (krever pg_trgm)
create extension if not exists pg_trgm;

create trigger domains_updated_at
  before update on domains
  for each row execute function set_updated_at();

-- -----------------------------------------------------------------------------
-- categories - per site
-- -----------------------------------------------------------------------------
create table categories (
  id uuid primary key default uuid_generate_v4(),
  site_id uuid not null references sites(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, slug)
);

create index categories_site_id_idx on categories(site_id);

create trigger categories_updated_at
  before update on categories
  for each row execute function set_updated_at();

-- -----------------------------------------------------------------------------
-- topics - per site
-- -----------------------------------------------------------------------------
create table topics (
  id uuid primary key default uuid_generate_v4(),
  site_id uuid not null references sites(id) on delete cascade,
  name text not null,
  slug text not null,
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, slug)
);

create index topics_site_id_idx on topics(site_id);

create trigger topics_updated_at
  before update on topics
  for each row execute function set_updated_at();

-- -----------------------------------------------------------------------------
-- articles - hovedinnholdet
-- -----------------------------------------------------------------------------
create table articles (
  id uuid primary key default uuid_generate_v4(),
  site_id uuid not null references sites(id) on delete cascade,
  title text not null,
  slug text not null,
  primary_keyword text,
  secondary_keywords text[] default '{}',
  related_keywords text[] default '{}',
  search_intent search_intent,
  target_audience text,
  article_type article_type,
  excerpt text,
  quick_answer text,
  content text,
  cover_image_url text,
  cover_image_alt text,
  category_id uuid references categories(id) on delete set null,
  author_id uuid references profiles(id) on delete set null,
  status article_status not null default 'draft',
  published_at timestamptz,
  seo_title text,
  seo_description text,
  canonical_url text,
  og_title text,
  og_description text,
  og_image_url text,
  ai_summary text,
  faq_json jsonb default '[]'::jsonb,
  sources_json jsonb default '[]'::jsonb,
  internal_links_json jsonb default '[]'::jsonb,
  external_links_json jsonb default '[]'::jsonb,
  cta_text text,
  cta_url text,
  cta_type cta_type,
  schema_type schema_type default 'Article',
  reading_time integer,
  word_count integer,
  seo_score smallint check (seo_score between 0 and 100),
  aeo_score smallint check (aeo_score between 0 and 100),
  geo_score smallint check (geo_score between 0 and 100),
  llm_score smallint check (llm_score between 0 and 100),
  featured boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, slug)
);

create index articles_site_id_idx on articles(site_id);
create index articles_status_idx on articles(status);
create index articles_published_at_idx on articles(published_at desc);
create index articles_author_id_idx on articles(author_id);
create index articles_category_id_idx on articles(category_id);
create index articles_seo_score_idx on articles(seo_score);
create index articles_featured_idx on articles(featured) where featured = true;

create trigger articles_updated_at
  before update on articles
  for each row execute function set_updated_at();

-- -----------------------------------------------------------------------------
-- article_topics - many to many
-- -----------------------------------------------------------------------------
create table article_topics (
  article_id uuid not null references articles(id) on delete cascade,
  topic_id uuid not null references topics(id) on delete cascade,
  primary key (article_id, topic_id)
);

create index article_topics_topic_id_idx on article_topics(topic_id);

-- -----------------------------------------------------------------------------
-- pages - statiske sider per site
-- -----------------------------------------------------------------------------
create table pages (
  id uuid primary key default uuid_generate_v4(),
  site_id uuid not null references sites(id) on delete cascade,
  title text not null,
  slug text not null,
  content text,
  template page_template not null default 'standard',
  status article_status not null default 'draft',
  seo_title text,
  seo_description text,
  canonical_url text,
  og_title text,
  og_description text,
  og_image_url text,
  ai_summary text,
  faq_json jsonb default '[]'::jsonb,
  schema_type schema_type default 'WebPage',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, slug)
);

create index pages_site_id_idx on pages(site_id);
create index pages_status_idx on pages(status);

create trigger pages_updated_at
  before update on pages
  for each row execute function set_updated_at();

-- -----------------------------------------------------------------------------
-- media - Supabase Storage referanser
-- -----------------------------------------------------------------------------
create table media (
  id uuid primary key default uuid_generate_v4(),
  site_id uuid references sites(id) on delete cascade,
  file_name text not null,
  file_url text not null,
  file_type text,
  file_size bigint,
  alt_text text,
  caption text,
  uploaded_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create index media_site_id_idx on media(site_id);
create index media_uploaded_by_idx on media(uploaded_by);

-- -----------------------------------------------------------------------------
-- leads - leads på tvers av nettsider
-- -----------------------------------------------------------------------------
create table leads (
  id uuid primary key default uuid_generate_v4(),
  site_id uuid not null references sites(id) on delete cascade,
  source_page text,
  source_url text,
  name text,
  email text,
  phone text,
  company text,
  message text,
  status lead_status not null default 'new',
  notes text,
  assigned_to uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index leads_site_id_idx on leads(site_id);
create index leads_status_idx on leads(status);
create index leads_assigned_to_idx on leads(assigned_to);
create index leads_email_idx on leads(email);
create index leads_created_at_idx on leads(created_at desc);

create trigger leads_updated_at
  before update on leads
  for each row execute function set_updated_at();

-- -----------------------------------------------------------------------------
-- pricing_records - for domene.io og prissammenligning
-- -----------------------------------------------------------------------------
create table pricing_records (
  id uuid primary key default uuid_generate_v4(),
  site_id uuid references sites(id) on delete cascade,
  provider_name text not null,
  tld text not null,
  first_year_price numeric(10, 2),
  renewal_price numeric(10, 2),
  transfer_price numeric(10, 2),
  redemption_price numeric(10, 2),
  email_price numeric(10, 2),
  hosting_price numeric(10, 2),
  ssl_price numeric(10, 2),
  currency text default 'DKK',
  last_checked_at timestamptz,
  source_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index pricing_provider_idx on pricing_records(provider_name);
create index pricing_tld_idx on pricing_records(tld);
create index pricing_site_id_idx on pricing_records(site_id);

create trigger pricing_records_updated_at
  before update on pricing_records
  for each row execute function set_updated_at();

-- -----------------------------------------------------------------------------
-- tasks - arbeidsflyt
-- -----------------------------------------------------------------------------
create table tasks (
  id uuid primary key default uuid_generate_v4(),
  site_id uuid references sites(id) on delete cascade,
  domain_id uuid references domains(id) on delete cascade,
  assigned_to uuid references profiles(id) on delete set null,
  created_by uuid references profiles(id) on delete set null,
  title text not null,
  description text,
  task_type task_type,
  priority task_priority not null default 'medium',
  status task_status not null default 'backlog',
  due_date date,
  related_article_id uuid references articles(id) on delete set null,
  related_page_id uuid references pages(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index tasks_site_id_idx on tasks(site_id);
create index tasks_domain_id_idx on tasks(domain_id);
create index tasks_assigned_to_idx on tasks(assigned_to);
create index tasks_status_idx on tasks(status);
create index tasks_priority_idx on tasks(priority);
create index tasks_due_date_idx on tasks(due_date);

create trigger tasks_updated_at
  before update on tasks
  for each row execute function set_updated_at();

-- -----------------------------------------------------------------------------
-- settings - per site
-- -----------------------------------------------------------------------------
create table settings (
  id uuid primary key default uuid_generate_v4(),
  site_id uuid not null references sites(id) on delete cascade unique,
  logo_url text,
  primary_color text default '#2563FF',
  secondary_color text default '#27D0C3',
  default_seo_title text,
  default_seo_description text,
  default_og_image text,
  contact_email text,
  language text default 'no',
  country text default 'NO',
  robots_enabled boolean not null default true,
  sitemap_enabled boolean not null default true,
  llms_enabled boolean not null default true,
  tracking_scripts text,
  footer_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index settings_site_id_idx on settings(site_id);

create trigger settings_updated_at
  before update on settings
  for each row execute function set_updated_at();
