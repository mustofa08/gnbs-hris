import { LoginForm } from '../components/LoginForm';

export function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <section className="w-full max-w-md">
        <div className="mb-8">
          <p className="text-sm font-medium text-primary">Pesantren HRIS</p>
          <h1 className="mt-2 text-2xl font-semibold tracking-normal">Sign in to your account</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Use your HRIS credentials to continue.
          </p>
        </div>
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <LoginForm />
        </div>
      </section>
    </div>
  );
}
