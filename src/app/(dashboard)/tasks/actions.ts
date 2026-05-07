'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createClient } from '@/lib/supabase/server';
import { requirePermission, requireAuth } from '@/lib/auth';
import {
  taskSchema,
  flattenZodErrors,
  nullifyEmpty,
  type TaskInput,
} from '@/lib/validators';

export type TaskFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
  values?: Partial<TaskInput>;
};

const TASK_STATUSES = [
  'backlog',
  'todo',
  'in_progress',
  'review',
  'approved',
  'done',
  'blocked',
] as const;
type TaskStatus = (typeof TASK_STATUSES)[number];

function parseFormData(formData: FormData): TaskInput {
  const get = (k: string) => (formData.get(k) ?? '') as string;
  return taskSchema.parse({
    title: get('title'),
    description: get('description'),
    task_type: get('task_type') || undefined,
    priority: get('priority') || 'medium',
    status: get('status') || 'backlog',
    due_date: get('due_date'),
    site_id: get('site_id'),
    domain_id: get('domain_id'),
    assigned_to: get('assigned_to'),
    related_article_id: get('related_article_id'),
    related_page_id: get('related_page_id'),
  });
}

export async function createTaskAction(
  _prev: TaskFormState,
  formData: FormData
): Promise<TaskFormState> {
  const { userId } = await requirePermission('tasks:create');

  let parsed: TaskInput;
  try {
    parsed = parseFormData(formData);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return { fieldErrors: flattenZodErrors(err) };
    }
    return { error: 'Validering feilet' };
  }

  const supabase = await createClient();
  const insertData = {
    ...nullifyEmpty(parsed),
    created_by: userId,
  };

  const { error } = await supabase.from('tasks').insert(insertData);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/tasks');
  revalidatePath('/dashboard');
  redirect('/tasks');
}

const statusUpdateSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(TASK_STATUSES),
});

export async function updateTaskStatusAction(formData: FormData) {
  const user = await requireAuth();
  const parsed = statusUpdateSchema.safeParse({
    id: formData.get('id'),
    status: formData.get('status'),
  });

  if (!parsed.success) {
    return { error: 'Ugyldig input' };
  }

  const supabase = await createClient();

  // RLS sikrer at writers bare kan oppdatere oppgaver tildelt dem.
  // Managers kan oppdatere alle.
  const { error } = await supabase
    .from('tasks')
    .update({ status: parsed.data.status })
    .eq('id', parsed.data.id);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/tasks');
  revalidatePath('/dashboard');
  return { success: true, userId: user.userId };
}

export async function deleteTaskAction(formData: FormData) {
  await requirePermission('tasks:create');
  const id = formData.get('id') as string;
  if (!id) return { error: 'ID mangler' };

  const supabase = await createClient();
  const { error } = await supabase.from('tasks').delete().eq('id', id);

  if (error) return { error: error.message };

  revalidatePath('/tasks');
  return { success: true };
}
