# Lead-to-Appointment System

Demo local de portfolio que convierte una consulta desde una landing en un seguimiento ordenado:
recibe el lead, entiende el contexto, lo registra en el CRM y confirma por WhatsApp cómo reservar
una llamada.

Está pensado para mostrar una automatización aplicable a servicios profesionales —automatización,
consultoría o desarrollo web— sin presentar la demo como un producto en producción.

## Qué muestra

Una persona completa el formulario de la landing y recibe una confirmación por WhatsApp con el
enlace para agendar una llamada. Mientras tanto, el contacto queda registrado en HubSpot con el
contexto de su consulta y una prioridad operativa clara.

```text
Formulario de la landing
  → reserva confiable del lead
  → revisión local con IA
  → HubSpot
  → confirmación por WhatsApp
  → enlace de Calendly
```

La landing está disponible en español e inglés. El idioma del mensaje de WhatsApp se decide por el
idioma elegido en el formulario, no por la IA.

## Por qué no es solo un formulario conectado

La automatización conserva el estado de cada lead en PostgreSQL para evitar errores comunes en
integraciones encadenadas:

- Si alguien reenvía el formulario, no se crean contactos ni mensajes duplicados.
- El lead empieza como `pending` y solo termina como `completed` cuando HubSpot y WhatsApp dieron
  una respuesta verificable.
- Un fallo temporal queda listo para recuperar; uno permanente se detiene para revisión, sin
  insistir ni enviar mensajes duplicados.
- La prioridad no queda librada a la IA: depende del plazo elegido en el formulario.
  `asap` = alta, `this_month` = normal y `exploring` = baja.
- WhatsApp solo se considera enviado cuando Meta devuelve un identificador de mensaje.

## Arquitectura técnica

| Pieza | Rol en la demo |
| --- | --- |
| Next.js + TypeScript | Landing bilingüe y validación previa del formulario. |
| n8n | Orquestación de los workflows y de las integraciones. |
| PostgreSQL en Docker | Estado transaccional, deduplicación y outbox de WhatsApp. |
| Ollama | Modelo local para decidir si una consulta necesita revisión manual y resumirla. |
| HubSpot | CRM donde se crea o actualiza el contacto. |
| WhatsApp Cloud API | Plantilla de confirmación en español o inglés. |
| Calendly | Enlace de reserva y sincronización de agendas. |

La instancia se usa de forma local para portfolio. No necesita deploy ni dominio propio para la
demo, pero Meta necesita poder alcanzar el webhook cuando se prueba WhatsApp.

## Estado validado

La ruta completa se comprobó localmente el 2026-11-24:

- formulario / webhook → PostgreSQL → Ollama → HubSpot → WhatsApp;
- Meta respondió con un ID de mensaje y el lead terminó en `completed`;
- duplicados, prioridad por plazo y respuesta `202` del webhook;
- recuperación manual de fallos reintentables de Ollama, HubSpot y WhatsApp;
- clasificación de fallos permanentes, transitorios y ambiguos.

No se incluyen en el repositorio tokens, credenciales, destinatarios de prueba ni ejecuciones.

## Ejecutar la demo local

Requiere Node 22. Copiá `.env.example` como `.env.local`, configurá las variables de la landing e
instalá las dependencias:

```bash
npm install
npm run dev
```

Abrí `http://localhost:3000/es`. Para validar la automatización completa también deben estar
disponibles Docker (PostgreSQL y n8n), Ollama y las credenciales configuradas dentro de n8n.

```bash
npm run check
```

Ese comando ejecuta typecheck, lint, tests y build.

## Documentación adicional

- [Demo y handoff](docs/demo-and-handoff.md): mapa de workflows, evidencia de pruebas y guion de
  grabación.
- [Automatizaciones n8n](docs/n8n/README.md): estados, recuperadores, pruebas y guía de
  importación segura.

## Límites de esta demo

Es una demostración local, no una instalación lista para producción. Una implementación real
requiere infraestructura siempre disponible, un número comercial de WhatsApp, monitoreo,
protecciones de entrada y reglas de privacidad acordes al negocio que la use.
