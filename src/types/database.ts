/**
 * Database type definitions.
 *
 * Disse er manuelt skrevet i fase 1. I fase 6 anbefales det å
 * generere fra Supabase med:
 *   npx supabase gen types typescript --project-id <id> > src/types/database.ts
 *
 * Denne filen dekker fase 1-tabellene og holdes oppdatert manuelt
 * inntil generering settes opp.
 */

export type UserRole =
  | 'owner'
  | 'admin'
  | 'seo_manager'
  | 'content_editor'
  | 'writer'
  | 'lead_manager'
  | 'domain_manager'
  | 'developer'
  | 'viewer';

export type SiteStatus = 'active' | 'draft' | 'paused' | 'archived';

export type ArticleStatus =
  | 'draft'
  | 'review'
  | 'approved'
  | 'published'
  | 'archived'
  | 'needs_update';

export type SearchIntent =
  | 'informational'
  | 'commercial'
  | 'transactional'
  | 'navigational'
  | 'local';

export type ArticleType =
  | 'guide'
  | 'comparison'
  | 'definition'
  | 'how_to'
  | 'listicle'
  | 'review'
  | 'landing_article'
  | 'news'
  | 'faq_article'
  | 'pillar_page'
  | 'cluster_article';

export type CtaType =
  | 'lead_form'
  | 'contact'
  | 'comparison'
  | 'download'
  | 'newsletter'
  | 'domain_lease'
  | 'quote_request';

export type SchemaType =
  | 'Article'
  | 'BlogPosting'
  | 'FAQPage'
  | 'HowTo'
  | 'Product'
  | 'Service'
  | 'LocalBusiness'
  | 'NewsArticle'
  | 'WebPage'
  | 'CollectionPage';

export type PageTemplate =
  | 'home'
  | 'standard'
  | 'landing'
  | 'service'
  | 'contact'
  | 'legal'
  | 'comparison'
  | 'knowledge_base';

export type DomainStatus =
  | 'owned'
  | 'not_started'
  | 'planned'
  | 'in_build'
  | 'live'
  | 'ranking'
  | 'lead_machine'
  | 'for_lease'
  | 'reserved'
  | 'sold'
  | 'paused'
  | 'expired_watch';

export type LeadStatus =
  | 'new'
  | 'contacted'
  | 'qualified'
  | 'won'
  | 'lost'
  | 'spam';

export type TaskStatus =
  | 'backlog'
  | 'todo'
  | 'in_progress'
  | 'review'
  | 'approved'
  | 'done'
  | 'blocked';

export type TaskType =
  | 'write_article'
  | 'edit_article'
  | 'seo_review'
  | 'aeo_review'
  | 'geo_review'
  | 'llm_review'
  | 'publish_article'
  | 'update_prices'
  | 'check_domain'
  | 'follow_up_lead'
  | 'build_landing_page'
  | 'upload_media'
  | 'technical_fix'
  | 'internal_linking'
  | 'add_faq'
  | 'add_sources'
  | 'update_meta';

export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

// =============================================================================
// Database interface (Supabase format)
// =============================================================================

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'created_at' | 'updated_at'> &
          Partial<Pick<Profile, 'created_at' | 'updated_at'>>;
        Update: Partial<Profile>;
      };
      sites: {
        Row: Site;
        Insert: Omit<Site, 'id' | 'created_at' | 'updated_at'> &
          Partial<Pick<Site, 'id' | 'created_at' | 'updated_at'>>;
        Update: Partial<Site>;
      };
      domains: {
        Row: Domain;
        Insert: Omit<Domain, 'id' | 'created_at' | 'updated_at'> &
          Partial<Pick<Domain, 'id' | 'created_at' | 'updated_at'>>;
        Update: Partial<Domain>;
      };
      categories: {
        Row: Category;
        Insert: Omit<Category, 'id' | 'created_at' | 'updated_at'> &
          Partial<Pick<Category, 'id' | 'created_at' | 'updated_at'>>;
        Update: Partial<Category>;
      };
      topics: {
        Row: Topic;
        Insert: Omit<Topic, 'id' | 'created_at' | 'updated_at'> &
          Partial<Pick<Topic, 'id' | 'created_at' | 'updated_at'>>;
        Update: Partial<Topic>;
      };
      articles: {
        Row: Article;
        Insert: Omit<Article, 'id' | 'created_at' | 'updated_at'> &
          Partial<Pick<Article, 'id' | 'created_at' | 'updated_at'>>;
        Update: Partial<Article>;
      };
      pages: {
        Row: Page;
        Insert: Omit<Page, 'id' | 'created_at' | 'updated_at'> &
          Partial<Pick<Page, 'id' | 'created_at' | 'updated_at'>>;
        Update: Partial<Page>;
      };
      media: {
        Row: Media;
        Insert: Omit<Media, 'id' | 'created_at'> &
          Partial<Pick<Media, 'id' | 'created_at'>>;
        Update: Partial<Media>;
      };
      leads: {
        Row: Lead;
        Insert: Omit<Lead, 'id' | 'created_at' | 'updated_at'> &
          Partial<Pick<Lead, 'id' | 'created_at' | 'updated_at'>>;
        Update: Partial<Lead>;
      };
      pricing_records: {
        Row: PricingRecord;
        Insert: Omit<PricingRecord, 'id' | 'created_at' | 'updated_at'> &
          Partial<Pick<PricingRecord, 'id' | 'created_at' | 'updated_at'>>;
        Update: Partial<PricingRecord>;
      };
      tasks: {
        Row: Task;
        Insert: Omit<Task, 'id' | 'created_at' | 'updated_at'> &
          Partial<Pick<Task, 'id' | 'created_at' | 'updated_at'>>;
        Update: Partial<Task>;
      };
      settings: {
        Row: SiteSettings;
        Insert: Omit<SiteSettings, 'id' | 'created_at' | 'updated_at'> &
          Partial<Pick<SiteSettings, 'id' | 'created_at' | 'updated_at'>>;
        Update: Partial<SiteSettings>;
      };
    };
    Enums: {
      user_role: UserRole;
      site_status: SiteStatus;
      article_status: ArticleStatus;
      domain_status: DomainStatus;
      lead_status: LeadStatus;
      task_status: TaskStatus;
      task_type: TaskType;
      task_priority: TaskPriority;
    };
  };
}

// =============================================================================
// Row types
// =============================================================================

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Site {
  id: string;
  name: string;
  domain: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  status: SiteStatus;
  language: string | null;
  country: string | null;
  default_seo_title: string | null;
  default_seo_description: string | null;
  default_og_image: string | null;
  llms_enabled: boolean;
  sitemap_enabled: boolean;
  robots_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Domain {
  id: string;
  domain_name: string;
  tld: string | null;
  category: string | null;
  industry: string | null;
  status: DomainStatus;
  registrar: string | null;
  renewal_date: string | null;
  purchase_price: number | null;
  estimated_value: number | null;
  asking_price: number | null;
  leasing_price_monthly: number | null;
  lead_potential_score: number | null;
  traffic_potential_score: number | null;
  seo_potential_score: number | null;
  commercial_intent_score: number | null;
  content_score: number | null;
  priority_score: number | null;
  project_site_id: string | null;
  assigned_to: string | null;
  notes: string | null;
  dns_status: string | null;
  nameserver_status: string | null;
  ssl_status: string | null;
  built_status: string | null;
  traffic_status: string | null;
  lead_status: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  site_id: string;
  name: string;
  slug: string;
  description: string | null;
  seo_title: string | null;
  seo_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface Topic {
  id: string;
  site_id: string;
  name: string;
  slug: string;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface SourceItem {
  title: string;
  url: string;
  publisher?: string;
  accessed_at?: string;
  note?: string;
}

export interface InternalLinkItem {
  title: string;
  url: string;
  anchor: string;
}

export interface ExternalLinkItem {
  title: string;
  url: string;
  anchor: string;
  rel?: string;
}

export interface Article {
  id: string;
  site_id: string;
  title: string;
  slug: string;
  primary_keyword: string | null;
  secondary_keywords: string[];
  related_keywords: string[];
  search_intent: SearchIntent | null;
  target_audience: string | null;
  article_type: ArticleType | null;
  excerpt: string | null;
  quick_answer: string | null;
  content: string | null;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  category_id: string | null;
  author_id: string | null;
  status: ArticleStatus;
  published_at: string | null;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
  ai_summary: string | null;
  faq_json: FaqItem[];
  sources_json: SourceItem[];
  internal_links_json: InternalLinkItem[];
  external_links_json: ExternalLinkItem[];
  cta_text: string | null;
  cta_url: string | null;
  cta_type: CtaType | null;
  schema_type: SchemaType | null;
  reading_time: number | null;
  word_count: number | null;
  seo_score: number | null;
  aeo_score: number | null;
  geo_score: number | null;
  llm_score: number | null;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface Page {
  id: string;
  site_id: string;
  title: string;
  slug: string;
  content: string | null;
  template: PageTemplate;
  status: ArticleStatus;
  seo_title: string | null;
  seo_description: string | null;
  canonical_url: string | null;
  og_title: string | null;
  og_description: string | null;
  og_image_url: string | null;
  ai_summary: string | null;
  faq_json: FaqItem[];
  schema_type: SchemaType | null;
  created_at: string;
  updated_at: string;
}

export interface Media {
  id: string;
  site_id: string | null;
  file_name: string;
  file_url: string;
  file_type: string | null;
  file_size: number | null;
  alt_text: string | null;
  caption: string | null;
  uploaded_by: string | null;
  created_at: string;
}

export interface Lead {
  id: string;
  site_id: string;
  source_page: string | null;
  source_url: string | null;
  name: string | null;
  email: string | null;
  phone: string | null;
  company: string | null;
  message: string | null;
  status: LeadStatus;
  notes: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

export interface PricingRecord {
  id: string;
  site_id: string | null;
  provider_name: string;
  tld: string;
  first_year_price: number | null;
  renewal_price: number | null;
  transfer_price: number | null;
  redemption_price: number | null;
  email_price: number | null;
  hosting_price: number | null;
  ssl_price: number | null;
  currency: string | null;
  last_checked_at: string | null;
  source_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  site_id: string | null;
  domain_id: string | null;
  assigned_to: string | null;
  created_by: string | null;
  title: string;
  description: string | null;
  task_type: TaskType | null;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string | null;
  related_article_id: string | null;
  related_page_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface SiteSettings {
  id: string;
  site_id: string;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  default_seo_title: string | null;
  default_seo_description: string | null;
  default_og_image: string | null;
  contact_email: string | null;
  language: string | null;
  country: string | null;
  robots_enabled: boolean;
  sitemap_enabled: boolean;
  llms_enabled: boolean;
  tracking_scripts: string | null;
  footer_text: string | null;
  created_at: string;
  updated_at: string;
}
