# n8n workflow exports

Los exports recomendados son los de la arquitectura confiable basada en PostgreSQL y una outbox
de WhatsApp, más su handler compartido de fallos inesperados. Se exportaron desde los workflows
reales, permanecen inactivos y no contienen credenciales, tokens, IDs internos, URLs específicas,
ejecuciones ni datos de prueba.

## Arquitectura confiable (recomendada)

| Archivo | Responsabilidad |
| --- | --- |
| `lead-initialize-reliability-state.json` | Crea las tablas PostgreSQL de estado de leads y entregas. Se ejecuta manualmente una única vez. |
| `lead-receive-landing-lead-reliably.json` | Valida, normaliza y reserva atómicamente el lead; responde `202` y dispara el procesamiento asíncrono. |
| `lead-process-pending-leads-reliably.json` | Valida Ollama y HubSpot, deriva prioridad desde `timeline` y genera una intención única de WhatsApp. |
| `lead-send-whatsapp-confirmations-reliably.json` | Reclama la outbox, llama a Meta y solo completa el lead con un ID de mensaje verificable. |
| `lead-recover-retryable-processing.json` | Recupera manualmente un caso reintentable de Ollama o HubSpot. |
| `lead-recover-retryable-whatsapp.json` | Recupera manualmente una entrega WhatsApp reintentable. |
| `lead-handle-workflow-errors.json` | Handler compartido con `Error Trigger`; registra solo fallos inesperados en la Data Table de observabilidad. |

### Importación segura

1. Crear una carpeta o proyecto propio en n8n e importar los siete JSON recomendados. Permanecen
   inactivos al importarse.
2. Crear y seleccionar manualmente las credenciales PostgreSQL, Ollama, HubSpot y Meta. Nunca
   pegar secretos dentro de los nodos ni de los exports.
3. En los nodos HTTP, reemplazar `<CONFIGURE_URL>` con las URLs propias. Configurar también el
   identificador del número emisor, la plantilla aprobada y el enlace de agenda.
4. Ejecutar manualmente `Lead — Initialize reliability state` una vez, con PostgreSQL ya
   configurado. Crea `lead_processing_state` y `whatsapp_delivery_state`.
5. Crear la Data Table `lead-workflow-errors` para observabilidad, con las columnas de texto
   `occurredAt`, `workflowName`, `executionId`, `executionUrl`, `failedNode` y `errorMessage`.
   En `Lead — Handle workflow errors`, seleccionar esa tabla y publicarlo antes de enlazarlo.
6. Configurar `Lead — Handle workflow errors` como handler compartido de los tres workflows de
   la ruta confiable. El handler registra solo fallos inesperados; los estados esperados de
   Ollama, HubSpot y Meta quedan persistidos en PostgreSQL.
7. Volver a seleccionar los subworkflows en los nodos que muestran
   `<CONFIGURE_WORKFLOW_REFERENCE>`.
8. Probar con datos seguros la ruta completa y un duplicado. Publicar únicamente el ingreso,
   procesador y sender confiables después de observar las ejecuciones.

## Estados y recuperación

- Un lead comienza en `pending` y solo llega a `completed` después de HubSpot y de una respuesta
  verificable de Meta.
- La prioridad operativa no depende de la IA: `asap` → `high`, `this_month` → `normal` y
  `exploring` → `low`.
- Ollama solo decide revisión manual y resumen. HubSpot y Meta se validan antes de avanzar.
- Meta `429` y `5xx` quedan reintentables; `400`, `401` y `403` son permanentes. Un timeout o un
  `2xx` sin `messages[0].id` pasa a revisión manual para evitar mensajes duplicados.
- Los recuperadores no tienen Schedule Trigger: se ejecutan manualmente y reclaman un único caso
  recuperable por vez.
- La Data Table `lead-workflow-errors` es solo observabilidad de errores inesperados; PostgreSQL
  sigue siendo la fuente de verdad para el estado y la recuperación del lead.

## Exports legacy

Los JSON históricos de este directorio que usan Data Tables describen la arquitectura anterior.
Se conservan únicamente como referencia y **no deben importarse junto con la ruta confiable**:

- `lead-receive-landing-lead.json`
- `lead-send-whatsapp-confirmation.json`
- `lead-retry-failed-hubspot-deliveries.json`
- `lead-retry-failed-ollama-classification.json`
- `lead-test-whatsapp-cloud-api.json`

`lead-sync-calendly-bookings.json` es una automatización independiente de Calendly y conserva sus
marcas de idempotencia propias.

## Matriz mínima de pruebas

| Caso | Resultado esperado |
| --- | --- |
| Mismo email enviado dos veces | Una sola reserva; el segundo envío no llama a Ollama, HubSpot ni WhatsApp. |
| Falla transitoria de Ollama | `retryable` en etapa `ollama`; no hay contacto ni intención WhatsApp. |
| Respuesta inválida de Ollama | `manual_review`; no se automatiza. |
| Falla transitoria de HubSpot | `retryable` en etapa `hubspot`; no se crea intención WhatsApp. |
| Éxito HubSpot | Crea una sola intención WhatsApp pendiente. |
| Meta 429/5xx | Intención `retryable`; no se marca el lead completo. |
| Meta 400/401/403 | Fallo permanente; sin reintento automático. |
| Meta 2xx sin ID de mensaje / timeout | Revisión manual; sin reintento automático. |
| Meta 2xx con `messages[0].id` | Intención `accepted` y lead `completed`. |
| Cada plazo | `asap` = `high`, `this_month` = `normal`, `exploring` = `low`. |

## Límites de la demo

La implementación se ejecuta localmente y se muestra como portfolio. No incluye el volumen de
Docker, la base de datos, credenciales, ejecuciones ni datos reales. Antes de exponer un webhook
públicamente se requieren rate limiting, protección anti-bot, autenticación cuando corresponda y
una infraestructura disponible de forma permanente.

### Evidencia local verificada el 2026-11-24

- Camino completo: PostgreSQL → Ollama → HubSpot → outbox WhatsApp → respuesta de Meta con ID
  verificable → `completed`.
- Duplicados, prioridad por los tres plazos y respuesta `202` del ingreso.
- Clasificación aislada de fallos permanentes, transitorios y ambiguos de Meta y Ollama.
- Recuperación manual de etapas reintentables de Ollama, HubSpot y WhatsApp.
