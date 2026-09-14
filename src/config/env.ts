import { z } from "zod";

const environmentSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.url(),
  NEXT_PUBLIC_N8N_LEAD_WEBHOOK_URL: z.url(),
});

const environment = environmentSchema.safeParse({
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
  NEXT_PUBLIC_N8N_LEAD_WEBHOOK_URL: process.env.NEXT_PUBLIC_N8N_LEAD_WEBHOOK_URL,
});

if (!environment.success) {
  throw new Error("La configuración de entorno es inválida.");
}

export const env = environment.data;
