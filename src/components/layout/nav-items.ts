import {
  LayoutDashboard,
  Globe,
  FileText,
  FileType,
  FolderTree,
  Tags,
  Image,
  Inbox,
  Network,
  TrendingUp,
  Search,
  DollarSign,
  CheckSquare,
  Users,
  Settings,
  type LucideIcon,
} from 'lucide-react';
import type { Permission } from '@/lib/permissions';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  permission: Permission;
  group?: string;
}

export const NAV_ITEMS: NavItem[] = [
  // Oversikt
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, permission: 'sites:view', group: 'Oversikt' },
  { href: '/growth', label: 'Growth', icon: TrendingUp, permission: 'growth:view', group: 'Oversikt' },

  // Innhold
  { href: '/sites', label: 'Nettsider', icon: Globe, permission: 'sites:view', group: 'Innhold' },
  { href: '/articles', label: 'Artikler', icon: FileText, permission: 'articles:view', group: 'Innhold' },
  { href: '/pages', label: 'Sider', icon: FileType, permission: 'pages:view', group: 'Innhold' },
  { href: '/categories', label: 'Kategorier', icon: FolderTree, permission: 'taxonomy:manage', group: 'Innhold' },
  { href: '/topics', label: 'Temaer', icon: Tags, permission: 'taxonomy:manage', group: 'Innhold' },
  { href: '/media', label: 'Media', icon: Image, permission: 'media:view', group: 'Innhold' },

  // Vekst & data
  { href: '/leads', label: 'Leads', icon: Inbox, permission: 'leads:view', group: 'Vekst' },
  { href: '/domains', label: 'Domener', icon: Network, permission: 'domains:view', group: 'Vekst' },
  { href: '/seo', label: 'SEO', icon: Search, permission: 'seo:view', group: 'Vekst' },
  { href: '/pricing', label: 'Priser', icon: DollarSign, permission: 'pricing:view', group: 'Vekst' },

  // Drift
  { href: '/tasks', label: 'Oppgaver', icon: CheckSquare, permission: 'tasks:view', group: 'Drift' },
  { href: '/users', label: 'Brukere', icon: Users, permission: 'users:view', group: 'Drift' },
  { href: '/settings', label: 'Innstillinger', icon: Settings, permission: 'settings:view', group: 'Drift' },
];
