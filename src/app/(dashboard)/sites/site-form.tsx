'use client';

import { useActionState, useState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { AlertCircle, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field, Input, Textarea, Select, FormSection } from '@/components/ui/form';
import { slugify } from '@/lib/utils';
import type { SiteFormState } from './actions';
import type { Site } from '@/types/database';

interface Props {
  site?: Site | null;
  action: (prev: SiteFormState, formData: FormData) => Promise<SiteFormState>;
  submitLabel?: string;
  successMessage?: string;
}

export function SiteForm({
  site,
  action,
  submitLabel = 'Lagre',
  successMessage,
}: Props) {
  const [state, formAction] = useActionState<SiteFormState, FormData>(action, {});
  const [name, setName] = useState(site?.name ?? '');
  const [slug, setSlug] = useState(site?.slug ?? '');
  const [slugTouched, setSlugTouched] = useState(!!site);

  // Auto-generér slug fra navn når man oppretter
  useEffect(() => {
    if (!slugTouched && name) {
      setSlug(slugify(name));
    }
  }, [name, slugTouched]);

  const errors = state.fieldErrors ?? {};
  const v = state.values ?? {};

  const showSuccess = !state.error && !state.fieldErrors && state.values && site;

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

      <FormSection
        title="Grunnleggende"
        description="Navn, domene og synlig identitet"
      >
        <Field label="Navn" htmlFor="name" required error={errors.name}>
          <Input
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            invalid={!!errors.name}
            placeholder="f.eks. Bilforsikring"
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field
            label="Domene"
            htmlFor="domain"
            required
            error={errors.domain}
            hint="Uten http(s):// — bare bilforsikring.no"
          >
            <Input
              id="domain"
              name="domain"
              defaultValue={(v.domain as string) ?? site?.domain ?? ''}
              invalid={!!errors.domain}
              placeholder="bilforsikring.no"
            />
          </Field>

          <Field
            label="Slug"
            htmlFor="slug"
            required
            error={errors.slug}
            hint="Internt kortnavn brukt i lenker og databaser"
          >
            <Input
              id="slug"
              name="slug"
              value={slug}
              onChange={(e) => {
                setSlug(slugify(e.target.value));
                setSlugTouched(true);
              }}
              invalid={!!errors.slug}
              placeholder="bilforsikring"
            />
          </Field>
        </div>

        <Field label="Beskrivelse" htmlFor="description" error={errors.description}>
          <Textarea
            id="description"
            name="description"
            rows={3}
            defaultValue={(v.description as string) ?? site?.description ?? ''}
            invalid={!!errors.description}
            placeholder="Kort beskrivelse av hva nettsiden handler om"
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Status" htmlFor="status" required>
            <Select
              id="status"
              name="status"
              defaultValue={(v.status as string) ?? site?.status ?? 'draft'}
            >
              <option value="draft">Utkast</option>
              <option value="active">Aktiv</option>
              <option value="paused">Pauset</option>
              <option value="archived">Arkivert</option>
            </Select>
          </Field>

          <Field label="Språk" htmlFor="language">
            <Select id="language" name="language" defaultValue={(v.language as string) ?? site?.language ?? 'no'}>
              <option value="no">Norsk</option>
              <option value="en">Engelsk</option>
              <option value="da">Dansk</option>
              <option value="sv">Svensk</option>
            </Select>
          </Field>

          <Field label="Land" htmlFor="country">
            <Select id="country" name="country" defaultValue={(v.country as string) ?? site?.country ?? 'NO'}>
              <option value="NO">Norge</option>
              <option value="DK">Danmark</option>
              <option value="SE">Sverige</option>
              <option value="GB">Storbritannia</option>
              <option value="US">USA</option>
            </Select>
          </Field>
        </div>
      </FormSection>

      <FormSection title="Visuell identitet" description="Logo og farger brukes på offentlig frontend">
        <Field
          label="Logo URL"
          htmlFor="logo_url"
          error={errors.logo_url}
          hint="Full URL til logo-bilde"
        >
          <Input
            id="logo_url"
            name="logo_url"
            type="url"
            defaultValue={(v.logo_url as string) ?? site?.logo_url ?? ''}
            invalid={!!errors.logo_url}
            placeholder="https://..."
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Primærfarge" htmlFor="primary_color" error={errors.primary_color}>
            <div className="flex gap-2">
              <Input
                id="primary_color"
                name="primary_color"
                defaultValue={(v.primary_color as string) ?? site?.primary_color ?? '#2563FF'}
                invalid={!!errors.primary_color}
                placeholder="#2563FF"
                className="font-mono"
              />
            </div>
          </Field>

          <Field label="Sekundærfarge" htmlFor="secondary_color" error={errors.secondary_color}>
            <Input
              id="secondary_color"
              name="secondary_color"
              defaultValue={(v.secondary_color as string) ?? site?.secondary_color ?? '#27D0C3'}
              invalid={!!errors.secondary_color}
              placeholder="#27D0C3"
              className="font-mono"
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title="SEO defaults" description="Brukes når en artikkel eller side ikke har egen verdi">
        <Field
          label="Standard SEO-tittel"
          htmlFor="default_seo_title"
          error={errors.default_seo_title}
          hint="Vises i Google når en side ikke har egen tittel"
        >
          <Input
            id="default_seo_title"
            name="default_seo_title"
            defaultValue={(v.default_seo_title as string) ?? site?.default_seo_title ?? ''}
            invalid={!!errors.default_seo_title}
            maxLength={70}
          />
        </Field>

        <Field
          label="Standard SEO-beskrivelse"
          htmlFor="default_seo_description"
          error={errors.default_seo_description}
        >
          <Textarea
            id="default_seo_description"
            name="default_seo_description"
            rows={2}
            defaultValue={(v.default_seo_description as string) ?? site?.default_seo_description ?? ''}
            invalid={!!errors.default_seo_description}
            maxLength={170}
          />
        </Field>

        <Field
          label="Standard OG-bilde"
          htmlFor="default_og_image"
          error={errors.default_og_image}
          hint="Brukes ved deling i sosiale medier (1200x630 anbefalt)"
        >
          <Input
            id="default_og_image"
            name="default_og_image"
            type="url"
            defaultValue={(v.default_og_image as string) ?? site?.default_og_image ?? ''}
            invalid={!!errors.default_og_image}
            placeholder="https://..."
          />
        </Field>
      </FormSection>

      <FormSection title="Teknisk" description="Hva som genereres for søkemotorer og AI-svartjenester">
        <Toggle
          name="sitemap_enabled"
          label="Sitemap aktivert"
          description="Generér /sitemap.xml automatisk"
          defaultChecked={site?.sitemap_enabled ?? true}
        />
        <Toggle
          name="robots_enabled"
          label="Robots aktivert"
          description="Generér /robots.txt automatisk"
          defaultChecked={site?.robots_enabled ?? true}
        />
        <Toggle
          name="llms_enabled"
          label="llms.txt aktivert"
          description="Generér /llms.txt for AI-søkemotorer (ChatGPT, Perplexity, Claude)"
          defaultChecked={site?.llms_enabled ?? true}
        />
      </FormSection>

      <div className="flex items-center gap-3 sticky bottom-0 bg-bg/80 backdrop-blur py-4 -mx-1 px-1 border-t border-border">
        <SubmitButton label={submitLabel} />
      </div>
    </form>
  );
}

function Toggle({
  name,
  label,
  description,
  defaultChecked,
}: {
  name: string;
  label: string;
  description?: string;
  defaultChecked?: boolean;
}) {
  const [checked, setChecked] = useState(defaultChecked ?? false);
  return (
    <label className="flex items-start justify-between gap-4 cursor-pointer">
      <div>
        <p className="text-sm font-medium text-fg">{label}</p>
        {description && <p className="text-xs text-fg-muted mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        onClick={() => setChecked(!checked)}
        className={`relative inline-flex h-5 w-9 flex-shrink-0 rounded-full transition-colors ${
          checked ? 'bg-brand' : 'bg-border'
        }`}
        role="switch"
        aria-checked={checked}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform mt-0.5 ${
            checked ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </button>
      <input type="hidden" name={name} value={checked ? 'on' : 'off'} />
    </label>
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
