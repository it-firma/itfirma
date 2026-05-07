# IT Firma Growth OS

SaaS-kontrollpanel for å drifte 2000+ domener for IT-Firma.no sin portefølje
(vaskemaskin.no, komfyr.no, hvitevare.no, domæne.com med flere).

**Stack:** Next.js 15 App Router · TypeScript · Tailwind 4 · Supabase · Vercel

---

## Status per modul

| Modul | Status | Fase |
|---|---|---|
| Auth & login | ✅ Fungerer | 1 |
| Dashboard | ✅ Fungerer | 1 |
| Sites | ✅ Fungerer | 2 |
| Domains (med 500-batch import) | ✅ Fungerer | 2 |
| Growth (prioriteringskø) | ✅ Fungerer | 2 |
| Tasks (kanban) | ✅ Fungerer | 2 |
| Articles | 🚧 Stub | 3 |
| Pages | 🚧 Stub | 4 |
| Categories | 🚧 Stub | 4 |
| Topics | 🚧 Stub | 4 |
| Media | 🚧 Stub | 4 |
| Leads (admin-visning) | 🚧 Stub | 5 |
| Pricing | 🚧 Stub | 5 |
| SEO oversikt | 🚧 Stub | 5 |
| Settings (per site) | 🚧 Stub | 5 |
| Users | 🚧 Stub | 5 |
| `/sitemap.xml` | ✅ Fungerer | 6 |
| `/robots.txt` | ✅ Fungerer | 6 |
| `/llms.txt` | ✅ Fungerer | 6 |
| `POST /api/leads/submit` | ✅ Fungerer | 6 |

Stubs viser navn og en "kommer snart"-melding. De er beskyttet med samme rolletilgang som de ferdige modulene vil få, slik at det ikke blir brudd ved senere lansering.

---

## Kom i gang lokalt

```bash
git clone <ditt-repo>
cd itfirma-panel
npm install
cp .env.example .env.local
# Fyll inn Supabase URL, anon key, service role key
npm run dev
```

---

## Database

Migrasjoner i `supabase/migrations/` kjøres i rekkefølge i Supabase SQL Editor:

```
0001_initial_schema.sql      # Alle tabeller, enums, indexer (inkl. pg_trgm GIN)
0002_rls_policies.sql        # RLS-policies
0003_seed_data.sql           # Standard kategorier og temaer
0004_priority_score.sql      # Auto-trigger for domain priority_score
0005_media_storage.sql       # Storage bucket "media" + policies
```

### Førstegangsoppsett

1. Registrer deg via `/login`.
2. I Supabase SQL Editor: `update profiles set role = 'owner', is_active = true where email = 'din@epost.no';`
3. Logg inn → opprett første Site → importer domener.

---

## Public endpoints

`/sitemap.xml`, `/robots.txt`, `/llms.txt` matcher per Host:

- `panel.*` → robots.txt blokkerer alt
- Frontend-domener (matchet mot `sites.domain`) → genereres dynamisk

`POST /api/leads/submit` for kontaktskjema fra frontend:

```js
fetch('https://vaskemaskin.no/api/leads/submit', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    site_id: 'uuid-her',
    name: 'Ola',
    email: 'ola@example.com',
    message: 'Hei!',
    _hp: ''
  })
})
```

---

## Deploy til Vercel

Push til GitHub, importer i Vercel, legg til miljøvariabler, deploy.

`vercel.json` er konfigurert for region `arn1` (Stockholm) og riktige headers.

### DNS

```
panel.itfirma.no       CNAME   cname.vercel-dns.com
vaskemaskin.no         A       76.76.21.21
www.vaskemaskin.no     CNAME   cname.vercel-dns.com
```

For hvert frontend-domene må feltet `domain` på `sites`-raden matche eksakt (uten `www.`).

---

## Roller

| Rolle | Tilgang |
|---|---|
| `owner` | Full. Kan tildele owner. |
| `admin` | Full utenom owner-tildeling. |
| `seo_manager` | Artikler (publiser), SEO, tasks. |
| `content_editor` | Artikler, pages, kategorier. |
| `writer` | Artikler (utkast). |
| `lead_manager` | Leads. |
| `domain_manager` | Domains, sites. |
| `developer` | Settings, tasks. |
| `viewer` | Lesetilgang. |

To lag tilgangskontroll: UI-permissions (`hasPermission`) og DB-RLS.

---

## Veien videre

Neste fase: bygge ut artikkel-editoren (fase 3) — det er den tyngste delen igjen. Den krever live SEO/AEO/GEO/LLM-scoring som klient-komponent, FAQ/sources/links-editorer, og publiseringsflyt med blokkerere mot manglende meta. Database-skjemaet i fase 1 er allerede dekket; kodingen kan starte uten ny migrasjon.

Bygget for Mohan / IT-Firma.no.
