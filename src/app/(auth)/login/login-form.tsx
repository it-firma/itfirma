'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Loader2, AlertCircle } from 'lucide-react';
import { loginAction, type LoginState } from './actions';

const initialState: LoginState = {};

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction] = useActionState(loginAction, initialState);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next ?? '/dashboard'} />

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-fg mb-1.5">
          E-post
        </label>
        <input
          id="email"
          name="email"
          type="email"
          required
          autoComplete="email"
          autoFocus
          className="input-base"
          placeholder="navn@itfirma.no"
        />
        {state.fieldErrors?.email && (
          <p className="mt-1 text-xs text-danger">{state.fieldErrors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-fg mb-1.5">
          Passord
        </label>
        <input
          id="password"
          name="password"
          type="password"
          required
          autoComplete="current-password"
          className="input-base"
        />
        {state.fieldErrors?.password && (
          <p className="mt-1 text-xs text-danger">{state.fieldErrors.password}</p>
        )}
      </div>

      {state.error && (
        <div className="flex items-start gap-2 px-3 py-2.5 rounded-lg bg-danger/10 border border-danger/20">
          <AlertCircle className="w-4 h-4 text-danger flex-shrink-0 mt-0.5" />
          <p className="text-sm text-danger">{state.error}</p>
        </div>
      )}

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className="btn-primary w-full">
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Logger inn…
        </>
      ) : (
        'Logg inn'
      )}
    </button>
  );
}
