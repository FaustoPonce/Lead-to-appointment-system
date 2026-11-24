import { describe, expect, it } from "vitest";
import { leadSchema } from "./schemas";

const validLead = {
  locale: "es",
  fullName: "Test User",
  email: "test@example.com",
  phone: "+5491155555555",
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

  it("requiere un número internacional posible", () => {
    expect(leadSchema.safeParse({ ...validLead, phone: "343 698-5959" }).success).toBe(false);
    expect(leadSchema.safeParse({ ...validLead, phone: "+5412" }).success).toBe(false);
  });
});
