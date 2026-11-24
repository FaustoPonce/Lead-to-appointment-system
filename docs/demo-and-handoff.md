# Demo and handoff

Estado: demo local de portfolio. La ruta confiable con PostgreSQL se verificó el
2026-11-24; la plantilla de WhatsApp está aprobada en español e inglés. Este documento no
contiene tokens, números de teléfono ni otros secretos.

## Propósito

La landing recibe una consulta y n8n la valida, la clasifica con un modelo local, crea o
actualiza el contacto en HubSpot, prepara una confirmación de WhatsApp con el enlace de
Calendly y sincroniza reservas de Calendly de forma programada.

## Mapa de workflows

```text
Landing /es
  -> Lead — Receive landing lead reliably
       -> validación y reserva atómica del email en PostgreSQL
       -> respuesta 202 y procesamiento asíncrono
  -> Lead — Process pending leads reliably
       -> Ollama: revisión manual y resumen
       -> prioridad operativa: timeline -> high / normal / low
       -> HubSpot: create or update contact
       -> outbox WhatsApp única
  -> Lead — Send WhatsApp confirmations reliably
            -> WhatsApp Cloud API: plantilla de utilidad con enlace de Calendly
            -> Meta ID verificable -> lead completed

Calendly
  -> Lead — Sync Calendly bookings (cada 15 minutos)
       -> lista paginada de eventos e invitees
       -> reserva activa: HubSpot + marca de procesado
       -> reserva cancelada: HubSpot + marca de cancelación

Errores de cualquiera de los workflows anteriores
  -> Lead — Handle workflow errors
       -> lead-workflow-errors
```

## Workflows y responsabilidad

| Workflow | Trigger | Responsabilidad |
|---|---|---|
| `Lead — Receive landing lead reliably` | Webhook de la landing | Valida, reserva el email en PostgreSQL y responde `202`. Un duplicado no vuelve a disparar integraciones. |
| `Lead — Process pending leads reliably` | Ejecutado por el ingreso o recuperador manual | Valida la respuesta de Ollama, deriva prioridad desde `timeline`, sincroniza HubSpot y crea una intención WhatsApp única. |
| `Lead — Send WhatsApp confirmations reliably` | Ejecutado por el procesador o recuperador manual | Envía la plantilla `lead_confirmation` en `es_AR` o `en_US`; solo marca el lead completo ante un ID verificable de Meta. |
| `Lead — Recover retryable processing (manual)` | Manual | Reclama un caso reintentable de Ollama o HubSpot. |
| `Lead — Recover retryable WhatsApp (manual)` | Manual | Reclama una entrega WhatsApp reintentable. |
| `Lead — Sync Calendly bookings` | Schedule Trigger, cada 15 minutos | Lee eventos paginados, sincroniza reservas activas y procesa cancelaciones sin duplicar efectos. |
| `Lead — Handle workflow errors` | Error Trigger | Guarda fecha, workflow, ejecución, nodo y mensaje de cualquier fallo en `lead-workflow-errors`. |

## Estado operativo y evidencia

### Validado

- Landing local disponible en `/es`.
- El formulario captura el teléfono mediante un selector internacional y lo entrega en formato E.164.
- Un lead atravesó el camino real: landing → validación → Ollama → HubSpot → workflow hijo → WhatsApp.
- El 2026-10-19 las plantillas `lead_confirmation` en español (`es_AR`) e inglés (`en_US`)
  llegaron al destinatario de prueba con el nombre dinámico y el enlace de Calendly.
- La sincronización de Calendly procesó una reserva activa y una segunda ejecución no duplicó HubSpot ni la marca de procesado.
- La paginación de Calendly está configurada para seguir la URL siguiente, con límite de seguridad de 100 páginas.
- El workflow de errores guardó tanto un evento de prueba como errores reales del workflow padre y del hijo.

### Estado transaccional

| Tabla | Uso |
|---|---|
| PostgreSQL: `lead_processing_state` | Reserva, etapas, prioridad determinística y estado recuperable del lead. |
| PostgreSQL: `whatsapp_delivery_state` | Outbox única, lease, reintentos, HTTP status e ID de Meta. |
| `processed-calendly-events` | Evita volver a sincronizar una reserva activa. |
| `processed-calendly-cancellations` | Evita reprocesar una cancelación. |
| `lead-workflow-errors` | Historial operativo de fallos. |

## Guion recomendado para OBS

1. Abrir Docker, n8n y Ollama; comprobar que el modelo local está disponible.
2. Levantar la landing con `npm run dev` y abrir `http://localhost:3000/es`.
3. Mostrar el formulario y enviar un lead de prueba nuevo, con correo `@example.com` único.
4. En n8n, mostrar la ejecución de `Lead — Receive landing lead reliably`: reserva PostgreSQL,
   respuesta `202` y llamada al procesador.
5. Mostrar la ejecución de `Lead — Process pending leads reliably` y `Lead — Send WhatsApp confirmations reliably`,
   junto al mensaje recibido,
   sin revelar credenciales ni números personales.
6. Mostrar el contacto creado/actualizado en HubSpot y sus propiedades de Calendly.
7. Mostrar `Lead — Sync Calendly bookings`, su Schedule Trigger, paginación e
   idempotencia con las Data Tables.
8. Mostrar `lead-workflow-errors` como evidencia de observabilidad. No provocar fallos para la
   grabación: ya existen registros reales de prueba.
9. Mostrar la rama de cancelación en el canvas como capacidad implementada; aclarar que la
   validación en vivo queda pendiente de una reserva descartable.

## Requisitos de la prueba de WhatsApp

- El workflow recibe el teléfono de la landing en formato E.164, con el código de país.
- El proveedor de prueba exige que el destinatario esté en su lista permitida.
- El emisor de prueba no es un destinatario válido.
- Las credenciales permanecen en n8n Credentials; nunca se muestran en la grabación.
- Un mensaje de texto libre sólo funciona dentro de la ventana de conversación de WhatsApp.
  Para confirmar un formulario sin un mensaje previo del contacto, usar una plantilla de
  utilidad aprobada en el idioma correspondiente.

## Pendientes diferidos hasta una implementación real

1. Probar una cancelación real de Calendly con una reserva descartable. No cancelar una reserva
   válida solo para probarla.
2. Para una implementación real, reemplazar el recurso de prueba por un número comercial del
   cliente, destinatarios reales y un token de sistema.
3. Hospedar n8n en una instancia siempre disponible antes de depender del Schedule Trigger: la
   instancia local requiere que Docker y el equipo permanezcan encendidos.

## Nota para publicación de portfolio

Describir el proyecto como una demo local de portfolio que muestra el flujo end-to-end:
captación, clasificación, CRM, confirmación por WhatsApp y sincronización de agenda. No
presentarlo como una implementación lista para producción. Aclarar que una exposición pública
incorpora controles contra abuso, rate limiting y una capa de entrada segura para el webhook.

## Regla de mantenimiento

Cuando se cambie una integración, volver a verificar una ruta de éxito, la idempotencia y el
registro de un fallo antes de declararla lista para demo o producción.
