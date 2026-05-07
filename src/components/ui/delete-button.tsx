'use client';

import { useState, useTransition } from 'react';
import { Trash2, AlertTriangle } from 'lucide-react';
import { Button } from './button';

interface Props {
  /** Server action som faktisk sletter. Skal redirecte ved suksess. */
  action: () => Promise<{ error?: string } | void>;
  /** Tekst i dialogen. */
  itemLabel: string;
  /** Skriv "BEKREFT" eller liknende for å frigjøre slettingen. */
  confirmText?: string;
}

export function DeleteButton({ action, itemLabel, confirmText = 'SLETT' }: Props) {
  const [open, setOpen] = useState(false);
  const [typed, setTyped] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onDelete = () => {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result && 'error' in result && result.error) {
        setError(result.error);
      }
    });
  };

  return (
    <>
      <Button variant="danger" type="button" onClick={() => setOpen(true)}>
        <Trash2 className="w-4 h-4" />
        Slett
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="panel p-5 max-w-md w-full space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-danger/10 border border-danger/20 flex items-center justify-center flex-shrink-0">
                <AlertTriangle className="w-4 h-4 text-danger" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-fg">Slett {itemLabel}?</h2>
                <p className="text-xs text-fg-muted mt-1">
                  Dette kan ikke angres. Skriv{' '}
                  <code className="font-mono text-fg bg-bg-panel-light px-1 rounded">
                    {confirmText}
                  </code>{' '}
                  for å bekrefte.
                </p>
              </div>
            </div>

            <input
              type="text"
              autoFocus
              value={typed}
              onChange={(e) => setTyped(e.target.value)}
              className="w-full bg-bg-panel-light border border-border rounded-lg px-3 py-2 text-fg text-sm focus:border-danger focus:ring-1 focus:ring-danger"
              placeholder={confirmText}
            />

            {error && (
              <p className="text-xs text-danger">
                {error.includes('foreign key') || error.includes('violates')
                  ? 'Kan ikke slettes — det er fortsatt data som peker på denne (artikler, sider, domener osv.). Fjern disse først.'
                  : error}
              </p>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="secondary"
                type="button"
                onClick={() => {
                  setOpen(false);
                  setTyped('');
                  setError(null);
                }}
              >
                Avbryt
              </Button>
              <Button
                variant="danger"
                type="button"
                disabled={typed !== confirmText}
                loading={pending}
                onClick={onDelete}
              >
                <Trash2 className="w-4 h-4" />
                Slett permanent
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
