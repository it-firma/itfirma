'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field, Textarea, Select, FormSection } from '@/components/ui/form';
import { bulkImportDomainsAction, type BulkImportState } from './actions';

export function BulkImportForm() {
  const [state, formAction] = useActionState<BulkImportState, FormData>(
    bulkImportDomainsAction,
    {}
  );

  const showResult = state.added != null || state.skipped != null;

  return (
    <form action={formAction} className="space-y-5 max-w-3xl">
      {state.error && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-danger/10 border border-danger/20">
          <AlertCircle className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" />
          <p className="text-sm text-danger">{state.error}</p>
        </div>
      )}

      {showResult && !state.error && (
        <div className="panel p-4 space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-success" />
            <p className="text-sm font-medium text-fg">Import ferdig</p>
          </div>
          <ul className="text-sm text-fg-muted space-y-1 pl-6">
            <li>
              <span className="text-success font-medium">{state.added ?? 0}</span> nye
              domener lagt til
            </li>
            {(state.skipped ?? 0) > 0 && (
              <li>
                <span className="text-fg font-medium">{state.skipped}</span> hoppet
                over (fantes fra før)
              </li>
            )}
            {state.invalid && state.invalid.length > 0 && (
              <li>
                <span className="text-danger font-medium">
                  {state.invalid.length}
                </span>{' '}
                ugyldige
              </li>
            )}
          </ul>

          {state.invalid && state.invalid.length > 0 && (
            <details className="mt-2">
              <summary className="text-xs text-fg-muted cursor-pointer hover:text-fg">
                Se ugyldige oppføringer
              </summary>
              <pre className="mt-2 p-3 bg-bg-panel-light rounded text-xs text-danger font-mono max-h-40 overflow-auto">
                {state.invalid.join('\n')}
              </pre>
            </details>
          )}
        </div>
      )}

      <FormSection title="Lim inn domener" description="Ett domene per linje, eller separert med komma">
        <Field
          label="Domener"
          htmlFor="text"
          hint="Aksepterer også URL-er (https://eksempel.no). Duplikater hoppes automatisk over."
        >
          <Textarea
            id="text"
            name="text"
            rows={12}
            placeholder={`bilforsikring.no\nsovnproblem.no\nainettside.no\nseobyra.com`}
            className="font-mono text-xs"
            required
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Standard status"
            htmlFor="default_status"
            hint="Settes på alle nye domener"
          >
            <Select id="default_status" name="default_status" defaultValue="owned">
              <option value="owned">Eid</option>
              <option value="not_started">Ikke startet</option>
              <option value="planned">Planlagt</option>
              <option value="for_lease">Til leasing</option>
              <option value="reserved">Reservert</option>
            </Select>
          </Field>

          <Field
            label="Standard registrar"
            htmlFor="default_registrar"
            hint="Valgfritt"
          >
            <input
              id="default_registrar"
              name="default_registrar"
              className="input-base"
              placeholder="f.eks. Domeneshop"
            />
          </Field>
        </div>
      </FormSection>

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      <Upload className="w-4 h-4" />
      {pending ? 'Importerer…' : 'Importer domener'}
    </Button>
  );
}
