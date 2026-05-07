'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { AlertCircle, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Field, Input, Textarea, Select, FormSection } from '@/components/ui/form';
import { createTaskAction, type TaskFormState } from './actions';
import { TASK_TYPE_LABELS, PRIORITY_LABELS, STATUS_LABELS } from './task-meta';
import type { Site, Profile, Domain } from '@/types/database';

interface Props {
  sites: Pick<Site, 'id' | 'name'>[];
  domains: Pick<Domain, 'id' | 'domain_name'>[];
  profiles: Pick<Profile, 'id' | 'full_name' | 'email'>[];
  articles: Array<{ id: string; title: string }>;
  pages: Array<{ id: string; title: string }>;
  defaultSiteId?: string;
  defaultDomainId?: string;
}

export function NewTaskForm({
  sites,
  domains,
  profiles,
  articles,
  pages,
  defaultSiteId,
  defaultDomainId,
}: Props) {
  const [state, formAction] = useActionState<TaskFormState, FormData>(
    createTaskAction,
    {}
  );
  const errors = state.fieldErrors ?? {};

  return (
    <form action={formAction} className="space-y-5 max-w-3xl">
      {state.error && (
        <div className="flex items-start gap-2 px-4 py-3 rounded-lg bg-danger/10 border border-danger/20">
          <AlertCircle className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" />
          <p className="text-sm text-danger">{state.error}</p>
        </div>
      )}

      <FormSection title="Oppgave">
        <Field label="Tittel" htmlFor="title" required error={errors.title}>
          <Input
            id="title"
            name="title"
            invalid={!!errors.title}
            placeholder="Hva skal gjøres?"
          />
        </Field>

        <Field label="Beskrivelse" htmlFor="description">
          <Textarea
            id="description"
            name="description"
            rows={4}
            placeholder="Detaljer, akseptansekriterier, lenker"
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Type" htmlFor="task_type">
            <Select id="task_type" name="task_type" defaultValue="">
              <option value="">Velg type</option>
              {Object.entries(TASK_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Prioritet" htmlFor="priority">
            <Select id="priority" name="priority" defaultValue="medium">
              {Object.entries(PRIORITY_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Status" htmlFor="status">
            <Select id="status" name="status" defaultValue="todo">
              {Object.entries(STATUS_LABELS).map(([k, v]) => (
                <option key={k} value={k}>
                  {v}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Frist" htmlFor="due_date" error={errors.due_date}>
            <Input
              id="due_date"
              name="due_date"
              type="date"
              invalid={!!errors.due_date}
            />
          </Field>

          <Field label="Tildelt" htmlFor="assigned_to">
            <Select id="assigned_to" name="assigned_to" defaultValue="">
              <option value="">Ikke tildelt</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.full_name ?? p.email}
                </option>
              ))}
            </Select>
          </Field>
        </div>
      </FormSection>

      <FormSection title="Tilknytning">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Nettside" htmlFor="site_id">
            <Select id="site_id" name="site_id" defaultValue={defaultSiteId ?? ''}>
              <option value="">Ingen</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Domene" htmlFor="domain_id">
            <Select id="domain_id" name="domain_id" defaultValue={defaultDomainId ?? ''}>
              <option value="">Ingen</option>
              {domains.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.domain_name}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Relatert artikkel" htmlFor="related_article_id">
            <Select id="related_article_id" name="related_article_id" defaultValue="">
              <option value="">Ingen</option>
              {articles.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.title}
                </option>
              ))}
            </Select>
          </Field>

          <Field label="Relatert side" htmlFor="related_page_id">
            <Select id="related_page_id" name="related_page_id" defaultValue="">
              <option value="">Ingen</option>
              {pages.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </Select>
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
      <Save className="w-4 h-4" />
      Opprett oppgave
    </Button>
  );
}
