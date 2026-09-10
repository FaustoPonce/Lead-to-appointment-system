import { notFound } from "next/navigation";
import { getLandingCopy } from "@/features/leads/copy";
import { LanguageSwitcher } from "@/features/leads/components/LanguageSwitcher";
import { LeadForm } from "@/features/leads/components/LeadForm";
import { isLocale } from "@/i18n/locales";

type LandingPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LandingPage({ params }: LandingPageProps) {
  const { locale } = await params;

  if (!isLocale(locale)) {
    notFound();
  }

  const copy = getLandingCopy(locale);

  return (
    <main className="min-h-screen bg-background">
      <header className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6 lg:px-8">
        <a className="text-lg font-bold tracking-tight text-slate-950" href={`/${locale}`}>
          Fausto Ponce
        </a>
        <LanguageSwitcher locale={locale} />
      </header>
      <section className="mx-auto grid w-full max-w-6xl gap-12 px-6 pb-20 pt-14 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:pt-24">
        <div className="max-w-2xl">
          <p className="mb-5 text-sm font-bold uppercase tracking-[0.18em] text-accent">{copy.eyebrow}</p>
          <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
            {copy.title}
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">{copy.description}</p>
          <a
            className="mt-8 inline-flex rounded-xl bg-accent px-5 py-3 font-semibold text-white transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
            href="#contact"
          >
            {copy.primaryAction}
          </a>
          <div className="mt-16 grid gap-4 sm:grid-cols-3">
            {copy.services.map((service) => (
              <article className="rounded-2xl border border-border bg-surface p-5" key={service.title}>
                <h2 className="font-bold text-slate-950">{service.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{service.description}</p>
              </article>
            ))}
          </div>
        </div>
        <section className="rounded-3xl border border-border bg-surface p-6 shadow-sm sm:p-8" id="contact">
          <h2 className="text-2xl font-bold tracking-tight text-slate-950">{copy.form.title}</h2>
          <p className="mt-3 leading-7 text-slate-600">{copy.form.description}</p>
          <div className="mt-8">
            <LeadForm locale={locale} />
          </div>
        </section>
      </section>
      <footer className="border-t border-border px-6 py-6 text-center text-sm text-slate-500">
        {copy.footer}
      </footer>
    </main>
  );
}
