import type { Locale } from "@/i18n/locales";

type LandingCopy = {
  language: string;
  languageSwitch: string;
  eyebrow: string;
  title: string;
  description: string;
  primaryAction: string;
  services: Array<{ title: string; description: string }>;
  form: {
    title: string;
    description: string;
    fullName: string;
    email: string;
    phone: string;
    company: string;
    companyOptional: string;
    service: string;
    timeline: string;
    message: string;
    consent: string;
    submit: string;
    submitting: string;
    invalidField: string;
    success: string;
    submissionError: string;
    serviceOptions: Record<"automation" | "consulting" | "web_development" | "other", string>;
    timelineOptions: Record<"asap" | "this_month" | "exploring", string>;
  };
  footer: string;
};

const copy: Record<Locale, LandingCopy> = {
  en: {
    language: "English",
    languageSwitch: "Ver en español",
    eyebrow: "Independent developer",
    title: "Automation, consulting, and web development for your next project.",
    description:
      "Tell me what you need and I will review the context before we schedule a discovery call.",
    primaryAction: "Tell me about your project",
    services: [
      {
        title: "Automation",
        description: "Connect repetitive work into reliable, maintainable workflows.",
      },
      {
        title: "Consulting",
        description: "Define a practical technical path before investing in implementation.",
      },
      {
        title: "Web development",
        description: "Build focused web products with a clear business purpose.",
      },
    ],
    form: {
      title: "Start the conversation",
      description: "Share the essentials. You will be able to book a call after the automation is connected.",
      fullName: "Full name",
      email: "Email",
      phone: "WhatsApp number",
      company: "Company",
      companyOptional: "Optional",
      service: "What do you need help with?",
      timeline: "Estimated timeline",
      message: "Tell me about the project",
      consent: "I agree to be contacted about this request.",
      submit: "Send request",
      submitting: "Sending request...",
      invalidField: "Review this field and try again.",
      success: "Thanks. Your request was received and I will review it shortly.",
      submissionError: "Your request could not be sent. Please try again.",
      serviceOptions: {
        automation: "Automation",
        consulting: "Consulting",
        web_development: "Web development",
        other: "Other",
      },
      timelineOptions: {
        asap: "As soon as possible",
        this_month: "This month",
        exploring: "I am still exploring",
      },
    },
    footer: "Lead-to-Appointment System",
  },
  es: {
    language: "Español",
    languageSwitch: "View in English",
    eyebrow: "Desarrollador independiente",
    title: "Automatización, consultoría y desarrollo web para tu próximo proyecto.",
    description:
      "Contame qué necesitás y reviso el contexto antes de que coordinemos una llamada de descubrimiento.",
    primaryAction: "Contame sobre tu proyecto",
    services: [
      {
        title: "Automatización",
        description: "Conectá tareas repetitivas en flujos confiables y mantenibles.",
      },
      {
        title: "Consultoría",
        description: "Definí un camino técnico práctico antes de invertir en implementación.",
      },
      {
        title: "Desarrollo web",
        description: "Construí productos web enfocados en una necesidad de negocio clara.",
      },
    ],
    form: {
      title: "Empecemos la conversación",
      description: "Compartí lo esencial. Vas a poder reservar una llamada cuando conectemos la automatización.",
      fullName: "Nombre completo",
      email: "Correo electrónico",
      phone: "Número de WhatsApp",
      company: "Empresa",
      companyOptional: "Opcional",
      service: "¿En qué necesitás ayuda?",
      timeline: "Plazo estimado",
      message: "Contame sobre el proyecto",
      consent: "Acepto que me contacten sobre esta consulta.",
      submit: "Enviar consulta",
      submitting: "Enviando consulta...",
      invalidField: "Revisá este campo e intentá nuevamente.",
      success: "Gracias. Recibí tu consulta y la voy a revisar a la brevedad.",
      submissionError: "No se pudo enviar tu consulta. Intentá nuevamente.",
      serviceOptions: {
        automation: "Automatización",
        consulting: "Consultoría",
        web_development: "Desarrollo web",
        other: "Otro",
      },
      timelineOptions: {
        asap: "Lo antes posible",
        this_month: "Este mes",
        exploring: "Todavía estoy explorando",
      },
    },
    footer: "Lead-to-Appointment System",
  },
};

export function getLandingCopy(locale: Locale): LandingCopy {
  return copy[locale];
}
