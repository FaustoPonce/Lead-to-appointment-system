# Lead-to-Appointment System

Demo pública que recibe leads para servicios profesionales y automatiza su clasificación,
registro y seguimiento. La landing es Next.js estático; n8n coordina Ollama, HubSpot,
WhatsApp y Calendly.

## Desarrollo

Usar Node 22. Copiar `.env.example` como `.env.local`, instalar dependencias y levantar
el servidor:

```bash
npm install
npm run dev
```

## Verificación y deploy

`npm run check` ejecuta typecheck, lint, tests y build. El build genera `out/` para
Cloudflare Pages. Antes de pushear a `main`, confirmar que la integración de Pages esté
conectada: un push allí publica producción.

## Demo y handoff

El mapa de workflows, la evidencia de pruebas, el guión para grabar con OBS y los
pendientes de producción están en [docs/demo-and-handoff.md](docs/demo-and-handoff.md).

Los exports saneados de n8n y su guía de importación están en
[docs/n8n/README.md](docs/n8n/README.md).
