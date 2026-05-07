import type { Domain } from '@/types/database';

/**
 * Priority Score
 *
 * Beregner et samlet 0–100 score for hvor mye et domene fortjener
 * oppmerksomhet akkurat nå. Blanding av kommersiell verdi, lead-potensial,
 * SEO-potensial og en innholdsmangel-bonus (et tomt domene med høyt
 * potensial er mer "akutt" enn et som allerede ranker).
 *
 * Vekter velges slik at hver komponent kan stå alene som et sterkt signal.
 * Justér gjerne i fase 6 når vi har empiri fra Search Console.
 */

export interface ScoreInputs {
  lead_potential_score?: number | null;
  traffic_potential_score?: number | null;
  seo_potential_score?: number | null;
  commercial_intent_score?: number | null;
  content_score?: number | null;
  status?: string | null;
}

const WEIGHTS = {
  lead: 0.30,
  traffic: 0.25,
  seo: 0.20,
  commercial: 0.20,
  contentGap: 0.05,
};

export function computePriorityScore(inputs: ScoreInputs): number {
  const lead = inputs.lead_potential_score ?? 0;
  const traffic = inputs.traffic_potential_score ?? 0;
  const seo = inputs.seo_potential_score ?? 0;
  const commercial = inputs.commercial_intent_score ?? 0;
  const content = inputs.content_score ?? 0;

  // Innholdsmangel: hvis content_score er lavt og potensialet er høyt,
  // er domenet en "rask gevinst" — mer presserende.
  const potentialAvg = (lead + traffic + seo + commercial) / 4;
  const contentGap = Math.max(0, potentialAvg - content);

  // Status-bonus: domener som ikke er bygget enda, men har potensial,
  // får en liten boost slik at de bobler oppover på prioriteringslisten.
  let statusBoost = 0;
  if (inputs.status === 'not_started' && potentialAvg > 60) statusBoost = 8;
  else if (inputs.status === 'planned' && potentialAvg > 60) statusBoost = 5;
  else if (inputs.status === 'in_build') statusBoost = 3;

  const raw =
    lead * WEIGHTS.lead +
    traffic * WEIGHTS.traffic +
    seo * WEIGHTS.seo +
    commercial * WEIGHTS.commercial +
    contentGap * WEIGHTS.contentGap +
    statusBoost;

  return Math.max(0, Math.min(100, Math.round(raw)));
}

/**
 * Anbefal neste handling basert på score-profil og status.
 * Returnerer en kort, handlingsorientert tekst på norsk.
 */
export function recommendNextAction(d: ScoreInputs): string {
  const lead = d.lead_potential_score ?? 0;
  const traffic = d.traffic_potential_score ?? 0;
  const commercial = d.commercial_intent_score ?? 0;
  const content = d.content_score ?? 0;

  if (d.status === 'not_started' || d.status === 'planned') {
    if (lead >= 80 && commercial >= 80) {
      return 'Lag landingsside og leadskjema først';
    }
    if (traffic >= 80) {
      return 'Lag pillar page og topical cluster';
    }
    return 'Reserver i innholdsplanen';
  }

  if (d.status === 'in_build') {
    if (content < 30) return 'Skriv minst 5 kjerneartikler';
    if (content < 60) return 'Bygg ut FAQ og internlenker';
    return 'Klar for publisering';
  }

  if (d.status === 'live' || d.status === 'ranking') {
    if (content < 60) return 'Utvid med flere klyngeartikler';
    if (lead >= 70 && commercial >= 70) return 'Optimaliser CTAer og leadskjema';
    return 'Hold ved like — oppdater eldste artikler';
  }

  if (d.status === 'lead_machine') {
    return 'Skaler — bygg flere innhold som konverterer';
  }

  if (d.status === 'expired_watch') {
    return 'Vurder fornyelse eller la utløpe';
  }

  return 'Vurder neste skritt';
}
