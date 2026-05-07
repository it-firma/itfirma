import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { requirePermission } from '@/lib/auth';
import { PageHeader } from '@/components/ui/page-header';
import { BulkImportForm } from './import-form';

export const metadata = { title: 'Bulk import domener' };

export default async function ImportPage() {
  await requirePermission('domains:create');
  return (
    <>
      <Link
        href="/domains"
        className="inline-flex items-center gap-1.5 text-xs text-fg-muted hover:text-fg mb-3"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Tilbake til domener
      </Link>
      <PageHeader
        title="Bulk import"
        description="Lim inn opptil 2000+ domener på én gang. Settes inn i batches på 500."
      />
      <BulkImportForm />
    </>
  );
}
