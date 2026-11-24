"use client";

import { useState, type FormEvent } from "react";
import PhoneInput from "react-phone-number-input";
import englishPhoneLabels from "react-phone-number-input/locale/en.json";
import spanishPhoneLabels from "react-phone-number-input/locale/es.json";
import { env } from "@/config/env";
import { getLandingCopy } from "@/features/leads/copy";
import {
  leadSchema,
  serviceOptions,
  timelineOptions,
  type LeadInput,
} from "@/features/leads/schemas";
import type { Locale } from "@/i18n/locales";

type LeadFormProps = {
  locale: Locale;
};

type FormErrors = Partial<Record<keyof Omit<LeadInput, "locale">, string>>;

function getErrors(input: unknown, message: string): FormErrors {
  const result = leadSchema.safeParse(input);

  if (result.success) {
    return {};
  }

  const errors = result.error.flatten().fieldErrors;

  return {
    fullName: errors.fullName?.[0] ? message : undefined,
    email: errors.email?.[0] ? message : undefined,
    phone: errors.phone?.[0] ? message : undefined,
    company: errors.company?.[0] ? message : undefined,
    service: errors.service?.[0] ? message : undefined,
    timeline: errors.timeline?.[0] ? message : undefined,
    message: errors.message?.[0] ? message : undefined,
    consent: errors.consent?.[0] ? message : undefined,
  };
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getServerErrors(payload: unknown, message: string): FormErrors {
  if (!isRecord(payload) || !isRecord(payload.details)) {
    return {};
  }

  const details = payload.details;

  return {
    fullName: typeof details.fullName === "string" ? message : undefined,
    email: typeof details.email === "string" ? message : undefined,
    phone: typeof details.phone === "string" ? message : undefined,
    company: typeof details.company === "string" ? message : undefined,
    service: typeof details.service === "string" ? message : undefined,
    timeline: typeof details.timeline === "string" ? message : undefined,
    message: typeof details.message === "string" ? message : undefined,
    consent: typeof details.consent === "string" ? message : undefined,
  };
}

async function readJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

export function LeadForm({ locale }: LeadFormProps) {
  const copy = getLandingCopy(locale).form;
  const [errors, setErrors] = useState<FormErrors>({});
  const [phone, setPhone] = useState<string>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submissionError, setSubmissionError] = useState<string>();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitted(false);
    setSubmissionError(undefined);

    const formData = new FormData(event.currentTarget);
    const lead = {
      locale,
      fullName: formData.get("fullName"),
      email: formData.get("email"),
      phone: phone ?? "",
      company: formData.get("company"),
      service: formData.get("service"),
      timeline: formData.get("timeline"),
      message: formData.get("message"),
      consent: formData.get("consent") === "on",
    };
    const nextErrors = getErrors(lead, copy.invalidField);

    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    const parsedLead = leadSchema.safeParse(lead);

    if (!parsedLead.success) {
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(env.NEXT_PUBLIC_N8N_LEAD_WEBHOOK_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsedLead.data),
      });

      if (response.ok) {
        setIsSubmitted(true);
        return;
      }

      if (response.status === 400) {
        setErrors(getServerErrors(await readJson(response), copy.invalidField));
      }

      setSubmissionError(copy.submissionError);
    } catch {
      setSubmissionError(copy.submissionError);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form aria-busy={isSubmitting} className="grid gap-6" noValidate onSubmit={handleSubmit}>
      <div className="grid gap-6 sm:grid-cols-2">
        <FormField error={errors.fullName} label={copy.fullName} name="fullName" required />
        <FormField error={errors.email} label={copy.email} name="email" required type="email" />
      </div>
      <div className="grid gap-6 sm:grid-cols-2">
        <PhoneField
          error={errors.phone}
          label={copy.phone}
          locale={locale}
          onChange={setPhone}
          value={phone}
        />
        <FormField hint={copy.companyOptional} label={copy.company} name="company" />
      </div>
      <SelectField error={errors.service} label={copy.service} name="service" required>
        <option value="">—</option>
        {serviceOptions.map((option) => (
          <option key={option} value={option}>
            {copy.serviceOptions[option]}
          </option>
        ))}
      </SelectField>
      <SelectField error={errors.timeline} label={copy.timeline} name="timeline" required>
        <option value="">—</option>
        {timelineOptions.map((option) => (
          <option key={option} value={option}>
            {copy.timelineOptions[option]}
          </option>
        ))}
      </SelectField>
      <TextAreaField error={errors.message} label={copy.message} name="message" required />
      <label className="flex gap-3 bg-slate-50 px-4 py-3 text-sm leading-6 text-slate-700">
        <input className="mt-1 size-4 shrink-0 accent-accent" name="consent" type="checkbox" />
        <span>{copy.consent}</span>
      </label>
      {errors.consent ? <p className="-mt-3 text-sm text-red-700">{errors.consent}</p> : null}
      {submissionError ? (
        <p aria-live="polite" className="bg-red-50 px-4 py-3 text-sm text-red-800">
          {submissionError}
        </p>
      ) : null}
      {isSubmitted ? (
        <p aria-live="polite" className="bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {copy.success}
        </p>
      ) : null}
      <button
        className="bg-slate-700 px-5 py-3.5 font-semibold text-white shadow-lg shadow-slate-700/20 transition hover:-translate-y-0.5 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-700 focus:ring-offset-2 disabled:cursor-not-allowed disabled:bg-slate-400 disabled:shadow-none disabled:hover:translate-y-0"
        disabled={isSubmitting}
        type="submit"
      >
        {isSubmitting ? copy.submitting : copy.submit}
      </button>
    </form>
  );
}

type FormFieldProps = {
  error?: string;
  hint?: string;
  label: string;
  name: "fullName" | "email" | "company";
  required?: boolean;
  type?: "email" | "tel" | "text";
};

function FormField({ error, hint, label, name, required, type = "text" }: FormFieldProps) {
  const errorId = `${name}-error`;

  return (
    <label className="grid min-w-0 gap-2 text-sm font-semibold text-slate-800">
      <span className="tracking-tight">
        {label} {hint ? <span className="font-normal text-slate-500">({hint})</span> : null}
      </span>
      <input
        aria-describedby={error ? errorId : undefined}
        aria-invalid={Boolean(error)}
        className="w-full min-w-0 border border-slate-200 bg-slate-50 px-3.5 py-3 text-base text-slate-950 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-accent focus:bg-white focus:ring-4 focus:ring-blue-100"
        name={name}
        required={required}
        type={type}
      />
      {error ? <span className="text-sm font-normal text-red-700" id={errorId}>{error}</span> : null}
    </label>
  );
}

type PhoneFieldProps = {
  error?: string;
  label: string;
  locale: Locale;
  onChange: (value: string | undefined) => void;
  value: string | undefined;
};

function PhoneField({ error, label, locale, onChange, value }: PhoneFieldProps) {
  const errorId = "phone-error";

  return (
    <label className="grid min-w-0 gap-2 text-sm font-semibold text-slate-800">
      <span className="tracking-tight">{label}</span>
      <PhoneInput
        aria-describedby={error ? errorId : undefined}
        aria-invalid={Boolean(error)}
        autoComplete="tel"
        className={error ? "PhoneInput--error" : undefined}
        defaultCountry={locale === "es" ? "AR" : undefined}
        international
        labels={locale === "es" ? spanishPhoneLabels : englishPhoneLabels}
        name="phone"
        onChange={onChange}
        required
        value={value}
      />
      {error ? <span className="text-sm font-normal text-red-700" id={errorId}>{error}</span> : null}
    </label>
  );
}

type SelectFieldProps = {
  children: React.ReactNode;
  error?: string;
  label: string;
  name: "service" | "timeline";
  required?: boolean;
};

function SelectField({ children, error, label, name, required }: SelectFieldProps) {
  const errorId = `${name}-error`;

  return (
    <label className="grid min-w-0 gap-2 text-sm font-semibold text-slate-800">
      <span className="tracking-tight">{label}</span>
      <select
        aria-describedby={error ? errorId : undefined}
        aria-invalid={Boolean(error)}
        className="w-full min-w-0 border border-slate-200 bg-slate-50 px-3.5 py-3 text-base text-slate-950 outline-none transition hover:border-slate-300 focus:border-accent focus:bg-white focus:ring-4 focus:ring-blue-100"
        defaultValue=""
        name={name}
        required={required}
      >
        {children}
      </select>
      {error ? <span className="text-sm font-normal text-red-700" id={errorId}>{error}</span> : null}
    </label>
  );
}

type TextAreaFieldProps = {
  error?: string;
  label: string;
  name: "message";
  required?: boolean;
};

function TextAreaField({ error, label, name, required }: TextAreaFieldProps) {
  const errorId = `${name}-error`;

  return (
    <label className="grid min-w-0 gap-2 text-sm font-semibold text-slate-800">
      <span className="tracking-tight">{label}</span>
      <textarea
        aria-describedby={error ? errorId : undefined}
        aria-invalid={Boolean(error)}
        className="min-h-32 w-full min-w-0 resize-y border border-slate-200 bg-slate-50 px-3.5 py-3 text-base text-slate-950 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-accent focus:bg-white focus:ring-4 focus:ring-blue-100"
        name={name}
        required={required}
      />
      {error ? <span className="text-sm font-normal text-red-700" id={errorId}>{error}</span> : null}
    </label>
  );
}
