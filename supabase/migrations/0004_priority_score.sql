-- =============================================================================
-- IT Firma Growth OS - Domain Priority Score Trigger
-- Migration: 0004_priority_score
-- =============================================================================
-- Auto-beregn priority_score når et domene oppdateres.
-- Dette er den samme formelen som src/lib/scores.ts, men kjørt i database
-- så vi alltid kan sortere/filtrere på den uten å regne i applikasjonslag.
-- =============================================================================

create or replace function compute_priority_score(
  p_lead numeric,
  p_traffic numeric,
  p_seo numeric,
  p_commercial numeric,
  p_content numeric,
  p_status text
) returns smallint
language plpgsql
immutable
as $$
declare
  v_lead numeric := coalesce(p_lead, 0);
  v_traffic numeric := coalesce(p_traffic, 0);
  v_seo numeric := coalesce(p_seo, 0);
  v_commercial numeric := coalesce(p_commercial, 0);
  v_content numeric := coalesce(p_content, 0);
  v_potential numeric;
  v_gap numeric;
  v_status_boost numeric := 0;
  v_raw numeric;
begin
  v_potential := (v_lead + v_traffic + v_seo + v_commercial) / 4.0;
  v_gap := greatest(0, v_potential - v_content);

  if p_status = 'not_started' and v_potential > 60 then
    v_status_boost := 8;
  elsif p_status = 'planned' and v_potential > 60 then
    v_status_boost := 5;
  elsif p_status = 'in_build' then
    v_status_boost := 3;
  end if;

  v_raw :=
    v_lead * 0.30 +
    v_traffic * 0.25 +
    v_seo * 0.20 +
    v_commercial * 0.20 +
    v_gap * 0.05 +
    v_status_boost;

  return greatest(0, least(100, round(v_raw)))::smallint;
end;
$$;

create or replace function set_domain_priority_score()
returns trigger
language plpgsql
as $$
begin
  new.priority_score := compute_priority_score(
    new.lead_potential_score,
    new.traffic_potential_score,
    new.seo_potential_score,
    new.commercial_intent_score,
    new.content_score,
    new.status::text
  );
  return new;
end;
$$;

drop trigger if exists domains_priority_score on domains;
create trigger domains_priority_score
  before insert or update on domains
  for each row execute function set_domain_priority_score();

-- Beregn for eksisterende rader
update domains set updated_at = updated_at;
