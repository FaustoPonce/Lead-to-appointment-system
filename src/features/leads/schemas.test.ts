import { describe, expect, it } from "vitest";
import { leadSchema } from "./schemas";

const validLead = {
  locale: "es",
  fullName: "Test User",
  email: "test@example.com",
  phone: "+54 11 5555 5555",
  company: "",
  service: "automation",
  timeline: "this_month",
  message: "Necesito automatizar el seguimiento de consultas entrantes.",
  consent: true,
};

describe("leadSchema", () => {
  it("acepta un lead completo", () => {
    expect(leadSchema.safeParse(validLead).success).toBe(true);
  });

  it("rechaza una dirección de correo inválida", () => {
    expect(leadSchema.safeParse({ ...validLead, email: "invalid-email" }).success).toBe(false);
  });

  it("requiere consentimiento", () => {
    expect(leadSchema.safeParse({ ...validLead, consent: false }).success).toBe(false);
  });
});
