import { LoginForm } from './login-form';

export const metadata = {
  title: 'Logg inn',
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next } = await searchParams;

  return (
    <div className="panel p-8 animate-slide-up">
      <div className="mb-8 text-center">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-brand/10 border border-brand/20 mb-4">
          <span className="text-brand font-bold text-lg">IT</span>
        </div>
        <h1 className="text-2xl font-semibold text-fg">IT Firma Growth OS</h1>
        <p className="mt-2 text-sm text-fg-muted">
          Logg inn for å fortsette
        </p>
      </div>

      <LoginForm next={next} />

      <p className="mt-8 text-center text-xs text-fg-subtle">
        Beskyttet område. Kun autoriserte brukere har tilgang.
      </p>
    </div>
  );
}
