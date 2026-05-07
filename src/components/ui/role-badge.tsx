import { ROLE_LABELS } from '@/lib/permissions';
import type { UserRole } from '@/types/database';
import { StatusBadge } from './status-badge';

const ROLE_VARIANTS: Record<UserRole, Parameters<typeof StatusBadge>[0]['variant']> = {
  owner: 'brand',
  admin: 'brand',
  seo_manager: 'accent',
  content_editor: 'info',
  writer: 'info',
  lead_manager: 'success',
  domain_manager: 'warning',
  developer: 'neutral',
  viewer: 'neutral',
};

export function RoleBadge({ role }: { role: UserRole }) {
  return (
    <StatusBadge variant={ROLE_VARIANTS[role]} dot>
      {ROLE_LABELS[role]}
    </StatusBadge>
  );
}
