-- =============================================================================
-- IT Firma Growth OS - Row Level Security
-- Migration: 0002_rls_policies
-- =============================================================================
-- Komplett RLS for alle tabeller. Ingen tabell står åpen.
-- Roller: owner, admin, seo_manager, content_editor, writer,
--         lead_manager, domain_manager, developer, viewer
-- =============================================================================

-- =============================================================================
-- HELPER FUNCTIONS - rollesjekk
-- =============================================================================

-- Hent rolle for innlogget bruker (cached i request)
create or replace function auth_role()
returns user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from profiles where id = auth.uid() and is_active = true limit 1;
$$;

-- Sjekk om bruker har en av angitte roller
create or replace function has_role(roles user_role[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid()
      and is_active = true
      and role = any(roles)
  );
$$;

-- Sjekk om bruker er authenticated og aktiv
create or replace function is_active_user()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid() and is_active = true
  );
$$;

-- Owner eller admin sjekk
create or replace function is_admin_or_owner()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select has_role(array['owner', 'admin']::user_role[]);
$$;

-- =============================================================================
-- ENABLE RLS ON ALL TABLES
-- =============================================================================

alter table profiles enable row level security;
alter table sites enable row level security;
alter table domains enable row level security;
alter table categories enable row level security;
alter table topics enable row level security;
alter table articles enable row level security;
alter table article_topics enable row level security;
alter table pages enable row level security;
alter table media enable row level security;
alter table leads enable row level security;
alter table pricing_records enable row level security;
alter table tasks enable row level security;
alter table settings enable row level security;

-- =============================================================================
-- PROFILES POLICIES
-- =============================================================================

-- Alle innloggede brukere kan se profilene (for tildeling, etc.)
create policy "profiles_select_authenticated"
  on profiles for select
  to authenticated
  using (is_active_user());

-- Brukere kan oppdatere egen profil (men ikke rolle)
create policy "profiles_update_own"
  on profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id and role = (select role from profiles where id = auth.uid()));

-- Owner og admin kan administrere alle profiler
create policy "profiles_all_admin"
  on profiles for all
  to authenticated
  using (is_admin_or_owner())
  with check (is_admin_or_owner());

-- =============================================================================
-- SITES POLICIES
-- =============================================================================

-- Alle aktive innloggede brukere kan lese sites (for å vite hvilke nettsider finnes)
create policy "sites_select_authenticated"
  on sites for select
  to authenticated
  using (is_active_user());

-- Public kan lese aktive sites (for offentlig frontend som henter data via service role)
create policy "sites_select_public_active"
  on sites for select
  to anon
  using (status = 'active');

-- Owner og admin kan endre sites
create policy "sites_modify_admin"
  on sites for all
  to authenticated
  using (is_admin_or_owner())
  with check (is_admin_or_owner());

-- =============================================================================
-- DOMAINS POLICIES
-- =============================================================================

-- Owner, admin, domain_manager, seo_manager, developer kan se alle domener
create policy "domains_select_managers"
  on domains for select
  to authenticated
  using (
    has_role(array['owner', 'admin', 'domain_manager', 'seo_manager', 'developer']::user_role[])
  );

-- Owner, admin, domain_manager kan endre
create policy "domains_modify_domain_managers"
  on domains for all
  to authenticated
  using (
    has_role(array['owner', 'admin', 'domain_manager']::user_role[])
  )
  with check (
    has_role(array['owner', 'admin', 'domain_manager']::user_role[])
  );

-- =============================================================================
-- CATEGORIES POLICIES
-- =============================================================================

create policy "categories_select_authenticated"
  on categories for select
  to authenticated
  using (is_active_user());

create policy "categories_select_public"
  on categories for select
  to anon
  using (true);

create policy "categories_modify_content"
  on categories for all
  to authenticated
  using (
    has_role(array['owner', 'admin', 'seo_manager', 'content_editor']::user_role[])
  )
  with check (
    has_role(array['owner', 'admin', 'seo_manager', 'content_editor']::user_role[])
  );

-- =============================================================================
-- TOPICS POLICIES
-- =============================================================================

create policy "topics_select_authenticated"
  on topics for select
  to authenticated
  using (is_active_user());

create policy "topics_select_public"
  on topics for select
  to anon
  using (true);

create policy "topics_modify_content"
  on topics for all
  to authenticated
  using (
    has_role(array['owner', 'admin', 'seo_manager', 'content_editor']::user_role[])
  )
  with check (
    has_role(array['owner', 'admin', 'seo_manager', 'content_editor']::user_role[])
  );

-- =============================================================================
-- ARTICLES POLICIES
-- =============================================================================

-- Alle innloggede kan lese artikler (for koordinering)
create policy "articles_select_authenticated"
  on articles for select
  to authenticated
  using (is_active_user());

-- Public kan kun lese published artikler
create policy "articles_select_public_published"
  on articles for select
  to anon
  using (status = 'published');

-- Owner, admin, seo_manager, content_editor kan gjøre alt
create policy "articles_all_editors"
  on articles for all
  to authenticated
  using (
    has_role(array['owner', 'admin', 'seo_manager', 'content_editor']::user_role[])
  )
  with check (
    has_role(array['owner', 'admin', 'seo_manager', 'content_editor']::user_role[])
  );

-- Writers kan opprette artikler (de blir auto-assigned som forfatter)
create policy "articles_insert_writer"
  on articles for insert
  to authenticated
  with check (
    has_role(array['writer']::user_role[])
    and author_id = auth.uid()
    and status in ('draft', 'review')
  );

-- Writers kan oppdatere egne utkast/review (men ikke publisere)
create policy "articles_update_writer_own"
  on articles for update
  to authenticated
  using (
    has_role(array['writer']::user_role[])
    and author_id = auth.uid()
    and status in ('draft', 'review')
  )
  with check (
    has_role(array['writer']::user_role[])
    and author_id = auth.uid()
    and status in ('draft', 'review')
  );

-- =============================================================================
-- ARTICLE_TOPICS POLICIES
-- =============================================================================

create policy "article_topics_select_authenticated"
  on article_topics for select
  to authenticated
  using (is_active_user());

create policy "article_topics_select_public"
  on article_topics for select
  to anon
  using (
    exists (
      select 1 from articles
      where articles.id = article_topics.article_id
        and articles.status = 'published'
    )
  );

create policy "article_topics_modify_editors"
  on article_topics for all
  to authenticated
  using (
    has_role(array['owner', 'admin', 'seo_manager', 'content_editor', 'writer']::user_role[])
  )
  with check (
    has_role(array['owner', 'admin', 'seo_manager', 'content_editor', 'writer']::user_role[])
  );

-- =============================================================================
-- PAGES POLICIES
-- =============================================================================

create policy "pages_select_authenticated"
  on pages for select
  to authenticated
  using (is_active_user());

create policy "pages_select_public_published"
  on pages for select
  to anon
  using (status = 'published');

create policy "pages_all_editors"
  on pages for all
  to authenticated
  using (
    has_role(array['owner', 'admin', 'seo_manager', 'content_editor']::user_role[])
  )
  with check (
    has_role(array['owner', 'admin', 'seo_manager', 'content_editor']::user_role[])
  );

-- =============================================================================
-- MEDIA POLICIES
-- =============================================================================

create policy "media_select_authenticated"
  on media for select
  to authenticated
  using (is_active_user());

create policy "media_insert_content"
  on media for insert
  to authenticated
  with check (
    has_role(array['owner', 'admin', 'seo_manager', 'content_editor', 'writer']::user_role[])
  );

create policy "media_update_owners"
  on media for update
  to authenticated
  using (
    has_role(array['owner', 'admin', 'seo_manager', 'content_editor']::user_role[])
    or uploaded_by = auth.uid()
  )
  with check (
    has_role(array['owner', 'admin', 'seo_manager', 'content_editor']::user_role[])
    or uploaded_by = auth.uid()
  );

create policy "media_delete_admins"
  on media for delete
  to authenticated
  using (
    has_role(array['owner', 'admin', 'content_editor']::user_role[])
    or uploaded_by = auth.uid()
  );

-- =============================================================================
-- LEADS POLICIES
-- =============================================================================

-- Owner, admin, lead_manager kan se alle leads
create policy "leads_select_lead_managers"
  on leads for select
  to authenticated
  using (
    has_role(array['owner', 'admin', 'lead_manager']::user_role[])
  );

create policy "leads_modify_lead_managers"
  on leads for all
  to authenticated
  using (
    has_role(array['owner', 'admin', 'lead_manager']::user_role[])
  )
  with check (
    has_role(array['owner', 'admin', 'lead_manager']::user_role[])
  );

-- VIKTIG: Public skal IKKE kunne lese leads. Insert fra offentlig
-- skjema må gå via en API route med service_role eller via en
-- begrenset RPC-funksjon. Vi legger ingen anon select policy.

-- =============================================================================
-- PRICING POLICIES
-- =============================================================================

create policy "pricing_select_authenticated"
  on pricing_records for select
  to authenticated
  using (is_active_user());

create policy "pricing_select_public"
  on pricing_records for select
  to anon
  using (true);

create policy "pricing_modify_admins"
  on pricing_records for all
  to authenticated
  using (
    has_role(array['owner', 'admin', 'seo_manager', 'content_editor']::user_role[])
  )
  with check (
    has_role(array['owner', 'admin', 'seo_manager', 'content_editor']::user_role[])
  );

-- =============================================================================
-- TASKS POLICIES
-- =============================================================================

-- Alle innloggede kan lese oppgaver (for koordinering)
create policy "tasks_select_authenticated"
  on tasks for select
  to authenticated
  using (is_active_user());

-- Owner, admin, seo_manager, content_editor, domain_manager kan opprette/endre alle
create policy "tasks_all_managers"
  on tasks for all
  to authenticated
  using (
    has_role(array['owner', 'admin', 'seo_manager', 'content_editor', 'domain_manager', 'lead_manager']::user_role[])
  )
  with check (
    has_role(array['owner', 'admin', 'seo_manager', 'content_editor', 'domain_manager', 'lead_manager']::user_role[])
  );

-- Writers og andre kan oppdatere status på sine egne tildelte oppgaver
create policy "tasks_update_assigned"
  on tasks for update
  to authenticated
  using (
    assigned_to = auth.uid()
    and is_active_user()
  )
  with check (
    assigned_to = auth.uid()
    and is_active_user()
  );

-- =============================================================================
-- SETTINGS POLICIES
-- =============================================================================

create policy "settings_select_authenticated"
  on settings for select
  to authenticated
  using (is_active_user());

create policy "settings_select_public"
  on settings for select
  to anon
  using (true);

create policy "settings_modify_admin"
  on settings for all
  to authenticated
  using (is_admin_or_owner())
  with check (is_admin_or_owner());

-- =============================================================================
-- GRANTS
-- =============================================================================

-- Authenticated brukere får standard tilgang (filtreres av RLS)
grant usage on schema public to authenticated, anon;
grant select on all tables in schema public to anon, authenticated;
grant insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

-- Sørg for at fremtidige tabeller får samme grunntilgang
alter default privileges in schema public grant select on tables to anon, authenticated;
alter default privileges in schema public grant insert, update, delete on tables to authenticated;
