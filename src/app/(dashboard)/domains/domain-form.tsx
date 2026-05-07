'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { AlertCircle, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field, Input, Textarea, Select, FormSection } from '@/components/ui/form';
import type { DomainFormState } from './actions';
import type { Domain, Site, Profile } from '@/types/database';

interface Props {
  domain?: Domain | null;
  sites: Pick<Site, 'id' | 'name' | 'domain'>[];
  profiles: Pick<Profile, 'id' | 'full_name' | 'email'>[];
  action: (prev: DomainFormState, formData: FormData) => Promise<DomainFormState>;
  submitLabel?: string;
  successMessage?: string;
}

const STATUS_OPTIONS: Array<{ value: Domain['status']; label: string }> = [
  { value: 'owned', label: 'Eid' },
  { value: 'not_started', label: 'Ikke startet' },
  { value: 'planned', label: 'Planlagt' },
  { value: 'in_build', label: 'Bygges' },
  { value: 'live', label: 'Live' },
  { value: 'ranking', label: 'Ranker' },
  { value: 'lead_machine', label: 'Leadmaskin' },
  { value: 'for_lease', label: 'Til leasing' },
  { value: 'reserved', label: 'Reservert' },
  { value: 'sold', label: 'Solgt' },
  { value: 'paused', label: 'Pauset' },
  { value: 'expired_watch', label: 'Utløper - overvåk' },
];

export function DomainForm({
  domain,
  sites,
  profiles,
  action,
  submitLabel = 'Lagre',
  successMessage,
}: Props) {
  const [state, formAction] = useActionState<DomainFormState, FormData>(action, {});
  const errors = state.fieldErrors ?? {};
  const v = state.values ?? {};

  const get = <K extends keyof Domain>(key: K, fallback: string = ''): string => {
    const fromValues = (v as Record<string, unknown>)[key as string];
    if (fromValues != null && fromValues !== '') return String(fromValues);
    if (domain && domain[key] != null) return String(domain[key]);
    return fallback;
  };

  const showSuccess = !state.error && !state.fieldErrors && state.values && domain;

  return (
    <form action={formAction} className="space-y-5 max-w-3xl">
      {state.error && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-danger/10 border border-danger/20">
          <AlertCircle className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" />
          <p className="text-sm text-danger">{state.error}</p>
        </div>
      )}
      {showSuccess && successMessage && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-success/10 border border-success/20">
          <p className="text-sm text-success">{successMessage}</p>
        </div>
      )}

      <FormSection title="Domene">
        <Field
          label="Domenenavn"
          htmlFor="domain_name"
          required
          error={errors.domain_name}
        >
          <Input
            id="domain_name"
            name="domain_name"
            defaultValue={get('domain_name')}
            invalid={!!errors.domain_name}
            placeholder="bilforsikring.no"
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="TLD" htmlFor="tld" hint="Auto-utledes">
            <Input id="tld" name="tld" defaultValue={get('tld')} placeholder="no" />
          </Field>
          <Field label="Kategori" htmlFor="category">
            <Input id="category" name="category" defaultValue={get('category')} />
          </Field>
          <Field label="Bransje" htmlFor="industry">
            <Input id="industry" name="industry" defaultValue={get('industry')} />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Status" htmlFor="status" required>
            <Select id="status" name="status" defaultValue={get('status', 'owned')}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Registrar" htmlFor="registrar">
            <Input id="registrar" name="registrar" defaultValue={get('registrar')} />
          </Field>
        </div>

        <Field
          label="Fornyelsesdato"
          htmlFor="renewal_date"
          error={errors.renewal_date}
          hint="ÅÅÅÅ-MM-DD"
        >
          <Input
            id="renewal_date"
            name="renewal_date"
            type="date"
            defaultValue={get('renewal_date')}
            invalid={!!errors.renewal_date}
          />
        </Field>
      </FormSection>

      <FormSection
        title="Score"
        description="Manuelle vurderinger 0–100. Priority score regnes automatisk i databasen."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <ScoreInput name="lead_potential_score" label="Lead potential" defaultValue={get('lead_potential_score')} />
          <ScoreInput name="traffic_potential_score" label="Traffic potential" defaultValue={get('traffic_potential_score')} />
          <ScoreInput name="seo_potential_score" label="SEO potential" defaultValue={get('seo_potential_score')} />
          <ScoreInput name="commercial_intent_score" label="Commercial intent" defaultValue={get('commercial_intent_score')} />
          <ScoreInput name="content_score" label="Content score" defaultValue={get('content_score')} />
          {domain?.priority_score != null && (
            <Field label="Priority score" hint="Auto-beregnet">
              <div className="h-9 px-3 flex items-center bg-bg-panel-light border border-border rounded-lg text-fg font-mono tabular-nums">
                {domain.priority_score}
              </div>
            </Field>
          )}
        </div>
      </FormSection>

      <FormSection title="Verdi" description="Priser og leasing (NOK)">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <PriceInput name="purchase_price" label="Kjøpspris" defaultValue={get('purchase_price')} />
          <PriceInput name="estimated_value" label="Estimert verdi" defaultValue={get('estimated_value')} />
          <PriceInput name="asking_price" label="Salgspris" defaultValue={get('asking_price')} />
          <PriceInput name="leasing_price_monthly" label="Leasing/mnd" defaultValue={get('leasing_price_monthly')} />
        </div>
      </FormSection>

      <FormSection
        title="Driftstatus"
        description="Operasjonell status. Frie tekstfelt — bruk verdier som passer arbeidsflyten din."
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Field label="DNS" htmlFor="dns_status" hint="ok / mangler / hos ekstern">
            <Input id="dns_status" name="dns_status" defaultValue={get('dns_status')} placeholder="ok" />
          </Field>
          <Field label="Nameserver" htmlFor="nameserver_status" hint="ok / endring pågår">
            <Input id="nameserver_status" name="nameserver_status" defaultValue={get('nameserver_status')} placeholder="ok" />
          </Field>
          <Field label="SSL" htmlFor="ssl_status" hint="ok / mangler / utløper">
            <Input id="ssl_status" name="ssl_status" defaultValue={get('ssl_status')} placeholder="ok" />
          </Field>
          <Field label="Bygget" htmlFor="built_status" hint="parkert / under bygging / live">
            <Input id="built_status" name="built_status" defaultValue={get('built_status')} placeholder="parkert" />
          </Field>
          <Field label="Trafikk" htmlFor="traffic_status" hint="ingen / lav / økende / høy">
            <Input id="traffic_status" name="traffic_status" defaultValue={get('traffic_status')} placeholder="ingen" />
          </Field>
          <Field label="Lead-status" htmlFor="lead_status" hint="ingen / sporadisk / jevn / leadmaskin">
            <Input id="lead_status" name="lead_status" defaultValue={get('lead_status')} placeholder="ingen" />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Tilknytninger">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Prosjekt-nettside"
            htmlFor="project_site_id"
            hint="Hvilken nettside er domenet del av"
          >
            <Select
              id="project_site_id"
              name="project_site_id"
              defaultValue={get('project_site_id')}
            >
              <option value="">Ingen</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.domain})
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Tildelt" htmlFor="assigned_to">
            <Select id="assigned_to" name="assigned_to" defaultValue={get('assigned_to')}>
              <option value="">Ingen</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name ?? p.email}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Field label="Notater" htmlFor="notes">
          <Textarea id="notes" name="notes" rows={3} defaultValue={get('notes')} />
        </Field>
      </FormSection>

      <div className="flex items-center gap-3 sticky bottom-0 bg-bg/80 backdrop-blur py-4 -mx-1 px-1 border-t border-border">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}

function ScoreInput({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue: string;
}) {
  return (
    <Field label={label} htmlFor={name}>
      <Input
        id={name}
        name={name}
        type="number"
        min={0}
        max={100}
        defaultValue={defaultValue}
        placeholder="0-100"
      />
    </Field>
  );
}

function PriceInput({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue: string;
}) {
  return (
    <Field label={label} htmlFor={name}>
      <Input
        id={name}
        name={name}
        type="number"
        min={0}
        step="0.01"
        defaultValue={defaultValue}
      />
    </Field>
  );
}

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" loading={pending}>
      <Save className="w-4 h-4" />
      {label}
    </Button>
  );
}
