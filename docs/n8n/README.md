# n8n workflow exports

Estos archivos son una versión pública e importable de la automatización que acompaña a la
landing. Describen la estructura, nodos, conexiones y expresiones del sistema, pero no incluyen
credenciales, tokens, IDs internos, datos de ejecución ni datos de prueba.

Todos los workflows exportados quedan `inactive`. Importarlos no activa un webhook, una tarea
programada ni un envío externo.

## Workflows

| Archivo | Responsabilidad |
| --- | --- |
| `lead-receive-landing-lead.json` | Recibe y valida el lead, evita duplicados, lo clasifica con Ollama, lo sincroniza con HubSpot y llama a la confirmación por WhatsApp. También escribe las colas de revisión y fallos. |
| `lead-send-whatsapp-confirmation.json` | Subworkflow que manda la confirmación de WhatsApp y el enlace de agenda. |
| `lead-retry-failed-hubspot-deliveries.json` | Reintenta sincronizaciones de HubSpot que fallaron y elimina la fila de la cola al recuperarse. |
| `lead-retry-failed-ollama-classification.json` | Reintenta clasificaciones de Ollama y deriva el resultado recuperado a HubSpot o revisión manual. |
| `lead-test-whatsapp-cloud-api.json` | Prueba aislada de la integración de WhatsApp Cloud API. |
| `lead-sync-calendly-bookings.json` | Sincroniza reservas y cancelaciones de Calendly con HubSpot, con paginación e idempotencia. |
| `lead-handle-workflow-errors.json` | Registra errores de los demás workflows en una Data Table. |

## Importación segura

1. Crear un proyecto o carpeta propia en n8n.
2. Crear primero las Data Tables indicadas abajo, vacías.
3. Importar los siete JSON. Permanecen inactivos.
4. En cada nodo de Data Table, seleccionar la tabla local correspondiente: los IDs fueron
   reemplazados deliberadamente.
5. Crear las credenciales y seleccionarlas en los nodos indicados. No pegar secretos dentro de
   los nodos o de los JSON.
6. Reemplazar los placeholders de URL, enlace de agenda e ID del número de WhatsApp.
7. En `Lead — Receive landing lead`, volver a seleccionar el subworkflow
   `Lead — Send WhatsApp lead confirmation` en el nodo que lo invoca.
8. Configurar el workflow de errores para los workflows que se quieran supervisar.
9. Probar cada camino con datos seguros. Publicar solo después de observar la ejecución completa.

Para una copia pública, conviene cambiar también el path del Webhook y actualizar la variable de
entorno de la landing que le envía el formulario. Así no se reutiliza un endpoint de otra
instancia.

## Data Tables

Crear estas tablas sin filas iniciales. Las columnas son de tipo `string` salvo donde n8n agregue
sus campos automáticos.

| Tabla | Columnas |
| --- | --- |
| `processed-lead-emails` | `emailKey` |
| `manual-review-leads` | `emailKey`, `fullName`, `email`, `phone`, `company`, `locale`, `service`, `timeline`, `message`, `reviewReason`, `priority`, `summary` |
| `failed-lead-deliveries` | `emailKey`, `fullName`, `email`, `phone`, `company`, `locale`, `service`, `timeline`, `message`, `priority`, `summary`, `failedStep`, `errorMessage` |
| `processed-calendly-events` | `eventKey` |
| `processed-calendly-cancellations` | `eventKey` |
| `lead-workflow-errors` | `occurredAt`, `workflowName`, `executionId`, `executionUrl`, `failedNode`, `errorMessage` |

## Credenciales y configuración manual

| Integración | Dónde se usa | Configuración que queda fuera del repo |
| --- | --- | --- |
| HubSpot | Workflow principal, reintentos y sincronización de Calendly | Credencial de HubSpot y propiedades de contacto propias. |
| Ollama | Workflow principal y reintento de clasificación | URL accesible desde n8n y modelo local elegido. |
| WhatsApp Cloud API | Confirmación y prueba aislada | Credencial Header Auth, token, versión de API e ID del número emisor. |
| Calendly | Sincronización de reservas | Credencial Header Auth y enlace de agenda propio. |

Las URLs de WhatsApp, Ollama y Calendly que eran específicas de esta demo fueron sustituidas por
placeholders. El formato del teléfono que recibe la landing debe incluir código de país; normalizar
espacios o guiones no agrega un prefijo que falta.

## Límites de la exportación

- No incluye credenciales, tokens ni autorizaciones OAuth.
- No incluye contactos, reservas, ejecuciones, logs ni filas de Data Tables.
- No incluye la configuración de Docker ni la base de datos de n8n.
- El flujo de cancelación de Calendly está implementado, pero debe validarse con una cancelación
  real y segura antes de considerarlo listo para producción.
