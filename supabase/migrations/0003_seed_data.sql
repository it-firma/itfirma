-- =============================================================================
-- IT Firma Growth OS - Seed Data
-- =============================================================================
-- Kjør denne ETTER 0001 og 0002. Trygg å kjøre flere ganger (idempotent).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- SITES
-- -----------------------------------------------------------------------------
insert into sites (name, domain, slug, description, status, language, country)
values
  ('IT Firma', 'itfirma.no', 'itfirma', 'IT Firma hovedside og kontrollpanel for porteføljen', 'active', 'no', 'NO'),
  ('Kunnskapsbase', 'kunnskapsbase.no', 'kunnskapsbase', 'Kunnskapsbase med guider og forklaringer', 'draft', 'no', 'NO'),
  ('Domene.io', 'domene.io', 'domene-io', 'Domeneregisterring og prissammenligning', 'draft', 'no', 'NO'),
  ('Domain Nordic', 'domainnordic.com', 'domainnordic', 'Nordic domain comparison portal', 'draft', 'en', 'NO'),
  ('AI Nettside', 'ainettside.no', 'ainettside', 'AI-drevet nettsidebygger', 'draft', 'no', 'NO'),
  ('SEO Byrå', 'seobyrå.com', 'seobyra', 'SEO byrå tjenester', 'draft', 'no', 'NO'),
  ('Bilforsikring', 'bilforsikring.no', 'bilforsikring', 'Sammenlign bilforsikring', 'draft', 'no', 'NO'),
  ('Søvnproblem', 'søvnproblem.no', 'sovnproblem', 'Søvnproblemer og løsninger', 'draft', 'no', 'NO')
on conflict (domain) do nothing;

-- -----------------------------------------------------------------------------
-- CATEGORIES (knyttet til itfirma.no som hovedeksempel)
-- -----------------------------------------------------------------------------
do $$
declare
  itfirma_id uuid;
begin
  select id into itfirma_id from sites where slug = 'itfirma' limit 1;

  if itfirma_id is not null then
    insert into categories (site_id, name, slug, description) values
      (itfirma_id, 'AI', 'ai', 'Kunstig intelligens og maskinlæring'),
      (itfirma_id, 'SEO', 'seo', 'Søkemotoroptimalisering'),
      (itfirma_id, 'Domener', 'domener', 'Domener og domeneadministrasjon'),
      (itfirma_id, 'Nettsider', 'nettsider', 'Nettsidebygging og publisering'),
      (itfirma_id, 'IT tjenester', 'it-tjenester', 'IT-tjenester og rådgivning'),
      (itfirma_id, 'Forsikring', 'forsikring', 'Forsikring og sammenligning'),
      (itfirma_id, 'Helse', 'helse', 'Helse og velvære'),
      (itfirma_id, 'Finans', 'finans', 'Finans og økonomi')
    on conflict (site_id, slug) do nothing;
  end if;
end $$;

-- -----------------------------------------------------------------------------
-- SETTINGS for hver site
-- -----------------------------------------------------------------------------
insert into settings (site_id, primary_color, secondary_color, language, country)
select id, primary_color, secondary_color, language, country
from sites
on conflict (site_id) do nothing;

-- -----------------------------------------------------------------------------
-- BOOTSTRAP: Sett første bruker som owner
-- -----------------------------------------------------------------------------
-- Etter du har registrert deg første gang, kjør:
--   update profiles set role = 'owner' where email = 'din@epost.no';
-- =============================================================================
