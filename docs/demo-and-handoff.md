# Demo and handoff

Estado: demo/MVP validado el 2026-09-13. Este documento no contiene tokens, números de
teléfono ni otros secretos.

## Propósito

La landing recibe una consulta y n8n la valida, la clasifica con un modelo local, crea o
actualiza el contacto en HubSpot, envía un mensaje de WhatsApp con el enlace de Calendly y
sincroniza reservas de Calendly de forma programada.

## Mapa de workflows

```text
Landing /es
  -> Lead — Receive landing lead
       -> validación y deduplicación de email
       -> Ollama: clasificación y prioridad
       -> HubSpot: create or update contact
       -> Lead — Send WhatsApp lead confirmation
            -> WhatsApp Cloud API: mensaje con enlace de Calendly

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
| `Lead — Receive landing lead` | Webhook de la landing | Valida el lead, deduplica el email, clasifica con Ollama, prioriza, actualiza HubSpot y llama al workflow de WhatsApp. |
| `Lead — Send WhatsApp lead confirmation` | Ejecutado por otro workflow | Envía el mensaje fijo con el enlace de Calendly. No se ejecuta manualmente como parte del flujo real. |
| `Lead — Sync Calendly bookings` | Schedule Trigger, cada 15 minutos | Lee eventos paginados, sincroniza reservas activas y procesa cancelaciones sin duplicar efectos. |
| `Lead — Handle workflow errors` | Error Trigger | Guarda fecha, workflow, ejecución, nodo y mensaje de cualquier fallo en `lead-workflow-errors`. |

## Estado operativo y evidencia

### Validado

- Landing local disponible en `/es`.
- Un lead atravesó el camino real: landing → validación → Ollama → HubSpot → workflow hijo → WhatsApp.
- El mensaje llegó al destinatario de prueba con el enlace de Calendly.
- La sincronización de Calendly procesó una reserva activa y una segunda ejecución no duplicó HubSpot ni la marca de procesado.
- La paginación de Calendly está configurada para seguir la URL siguiente, con límite de seguridad de 100 páginas.
- El workflow de errores guardó tanto un evento de prueba como errores reales del workflow padre y del hijo.

### Data Tables

| Tabla | Uso |
|---|---|
| `processed-lead-emails` | Evita reprocesar el mismo lead. |
| `processed-calendly-events` | Evita volver a sincronizar una reserva activa. |
| `processed-calendly-cancellations` | Evita reprocesar una cancelación. |
| `lead-workflow-errors` | Historial operativo de fallos. |

## Guion recomendado para OBS

1. Abrir Docker, n8n y Ollama; comprobar que el modelo local está disponible.
2. Levantar la landing con `npm run dev` y abrir `http://localhost:3000/es`.
3. Mostrar el formulario y enviar un lead de prueba nuevo, con correo `@example.com` único.
4. En n8n, mostrar la ejecución de `Lead — Receive landing lead`: validación, Ollama,
   prioridad, HubSpot y llamada al workflow hijo.
5. Mostrar la ejecución de `Lead — Send WhatsApp lead confirmation` y el mensaje recibido,
   sin revelar credenciales ni números personales.
6. Mostrar el contacto creado/actualizado en HubSpot y sus propiedades de Calendly.
7. Mostrar `Lead — Sync Calendly bookings`, su Schedule Trigger, paginación e
   idempotencia con las Data Tables.
8. Mostrar `lead-workflow-errors` como evidencia de observabilidad. No provocar fallos para la
   grabación: ya existen registros reales de prueba.
9. Mostrar la rama de cancelación en el canvas como capacidad implementada; aclarar que la
   validación en vivo queda pendiente de una reserva descartable.

## Requisitos de la prueba de WhatsApp

- El workflow recibe el teléfono de la landing; debe incluir el código de país.
- El proveedor de prueba exige que el destinatario esté en su lista permitida.
- El emisor de prueba no es un destinatario válido.
- Las credenciales permanecen en n8n Credentials; nunca se muestran en la grabación.

## Pendientes diferidos hasta una implementación real

1. Probar una cancelación real de Calendly con una reserva descartable. No cancelar una reserva
   válida solo para probarla.
2. Reemplazar el recurso de prueba de WhatsApp por un número comercial del cliente, destinatarios
   reales, token de sistema y template aprobado para mensajes fuera de la ventana de conversación.
3. Hospedar n8n en una instancia siempre disponible antes de depender del Schedule Trigger: la
   instancia local requiere que Docker y el equipo permanezcan encendidos.

## Regla de mantenimiento

Cuando se cambie una integración, volver a verificar una ruta de éxito, la idempotencia y el
registro de un fallo antes de declararla lista para demo o producción.
