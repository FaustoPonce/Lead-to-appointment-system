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
    <main className="min-h-screen overflow-hidden bg-[#f5f7fb] text-slate-950">
      <header className="relative z-10 mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-4 px-6 py-6 lg:px-8">
        <a className="text-lg font-extrabold tracking-tight text-slate-950" href={`/${locale}`}>
          Fausto Ponce
        </a>
        <LanguageSwitcher locale={locale} />
      </header>
      <section className="relative z-10 mx-auto grid w-full max-w-6xl gap-12 px-6 pb-20 pt-12 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:pt-20">
        <div className="max-w-2xl">
          <p className="mb-6 inline-flex border border-blue-200 bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-blue-700 shadow-sm">
            {copy.eyebrow}
          </p>
          <h1 className="max-w-xl text-4xl font-extrabold tracking-[-0.045em] text-slate-950 sm:text-5xl lg:text-[3.7rem] lg:leading-[1.04]">
            {copy.title}
          </h1>
          <p className="mt-7 max-w-xl text-lg leading-8 text-slate-600">{copy.description}</p>
          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {copy.services.map((service) => (
              <article className="flex min-h-80 flex-col border border-white/80 bg-white/75 p-6 shadow-sm backdrop-blur" key={service.title}>
                <h2 className="font-bold tracking-tight text-slate-950">{service.title}</h2>
                <p className="mt-2 text-sm leading-6 text-slate-600">{service.description}</p>
                <ul className="mt-auto grid gap-3 border-t border-slate-200 pt-5 text-sm leading-5 text-slate-700">
                  {service.details.map((detail) => (
                    <li className="flex gap-2" key={detail}>
                      <span aria-hidden="true" className="mt-1.5 size-1.5 shrink-0 bg-slate-500" />
                      {detail}
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
        <section className="border border-slate-200/90 bg-white p-6 shadow-2xl shadow-slate-900/10 sm:p-8 lg:p-9" id="contact">
          <div className="mb-8 border-b border-slate-100 pb-6">
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-950">{copy.form.title}</h2>
            <p className="mt-3 leading-7 text-slate-600">{copy.form.description}</p>
          </div>
          <div>
            <LeadForm locale={locale} />
          </div>
        </section>
      </section>
      <footer className="relative z-10 border-t border-slate-200/80 px-6 py-6 text-center text-sm text-slate-500">
        {copy.footer}
      </footer>
    </main>
  );
}
