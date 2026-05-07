import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-bg bg-radial-glow flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <p className="text-xs uppercase tracking-wider text-fg-subtle mb-3">
          404
        </p>
        <h1 className="text-2xl font-semibold text-fg mb-2">Siden finnes ikke</h1>
        <p className="text-sm text-fg-muted mb-6">
          Lenken du fulgte er enten gammel eller siden er ikke bygget enda.
        </p>
        <Link href="/dashboard" className="btn-secondary inline-flex">
          <ArrowLeft className="w-4 h-4" />
          Tilbake til dashboard
        </Link>
      </div>
    </div>
  );
}
