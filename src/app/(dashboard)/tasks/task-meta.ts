import type { TaskType, TaskPriority, TaskStatus } from '@/types/database';

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  write_article: 'Skrive artikkel',
  edit_article: 'Redigere artikkel',
  seo_review: 'SEO-gjennomgang',
  aeo_review: 'AEO-gjennomgang',
  geo_review: 'GEO-gjennomgang',
  llm_review: 'LLM-gjennomgang',
  publish_article: 'Publisere artikkel',
  update_prices: 'Oppdatere priser',
  check_domain: 'Sjekke domene',
  follow_up_lead: 'Følge opp lead',
  build_landing_page: 'Bygge landingsside',
  upload_media: 'Laste opp media',
  technical_fix: 'Teknisk fiks',
  internal_linking: 'Internlenking',
  add_faq: 'Legge til FAQ',
  add_sources: 'Legge til kilder',
  update_meta: 'Oppdatere meta',
};

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Lav',
  medium: 'Medium',
  high: 'Høy',
  urgent: 'Haster',
};

export const PRIORITY_VARIANTS: Record<
  TaskPriority,
  'neutral' | 'info' | 'warning' | 'danger'
> = {
  low: 'neutral',
  medium: 'info',
  high: 'warning',
  urgent: 'danger',
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  backlog: 'Backlog',
  todo: 'Todo',
  in_progress: 'Pågår',
  review: 'Review',
  approved: 'Godkjent',
  done: 'Ferdig',
  blocked: 'Blokkert',
};

// Kolonnerekkefølge i kanban
export const KANBAN_COLUMNS: TaskStatus[] = [
  'backlog',
  'todo',
  'in_progress',
  'review',
  'done',
];
