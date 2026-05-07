'use client';

import { useEffect } from 'react';
import { AlertTriangle, RotateCw } from 'lucide-react';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('App error:', error);
  }, [error]);

  return (
    <html lang="no">
      <body className="bg-bg text-fg antialiased">
        <div className="min-h-screen flex items-center justify-center p-6">
          <div className="max-w-md text-center">
            <div className="inline-flex w-12 h-12 rounded-xl bg-danger/10 border border-danger/20 items-center justify-center mb-4">
              <AlertTriangle className="w-5 h-5 text-danger" />
            </div>
            <h1 className="text-xl font-semibold mb-2">Noe gikk galt</h1>
            <p className="text-sm text-fg-muted mb-6">
              En uventet feil oppsto. Prøv å laste siden på nytt. Hvis problemet
              vedvarer, kontakt en utvikler.
            </p>
            {error.digest && (
              <p className="text-xs text-fg-subtle font-mono mb-6">
                ID: {error.digest}
              </p>
            )}
            <button onClick={reset} className="btn-primary">
              <RotateCw className="w-4 h-4" />
              Prøv igjen
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
