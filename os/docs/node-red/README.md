# Node-RED: flujos de control, monitorizacion y alertas

Este directorio contiene flujos listos para importar en Node-RED para controlar la simulacion, ajustar parametros en caliente y reenviar alertas (Telegram/email).

## Flujos incluidos
- `sumulation.json`: panel de control de la simulacion.
  - Injects para arrancar/parar (`/simulation/start`, `/simulation/stop`).
  - Injects para consultar estado (`/simulation/status`).
  - Injects por parametro y un armado de JSON que envia `POST /admin/update` con valores actuales (usa valores por defecto si no pulsas un inject).
  - Puedes añadir GET a `/admin/status`, `/camera/status` o `/police/alerts` conectando nodos `http request` a `debug` o a un `ui_table`.
- `telegram-flow.json`: recepcion de alertas HTTP y reenvio a Telegram.
  - Expone `POST /alerts` en Node-RED.
  - Formatea el mensaje y lo envia via Telegram (usando `node-red-node-telegram`) o mediante llamada HTTP a la API oficial, segun la variante.
  - Si llega `recipientEmail` en el payload (añadido por el backend para alertas ITV), puedes duplicar la rama hacia un nodo `e-mail` para avisar al propietario.

## Requisitos
- Node.js 18+ recomendado.
- Node-RED instalado (`npm install -g --unsafe-perm node-red`).
- Para `telegram-flow.json`: instala `node-red-node-telegram` desde el palette manager o con `npm install node-red-node-telegram` en `~/.node-red`, y configura `TELEGRAM_TOKEN` y `TELEGRAM_CHAT_ID` (env vars o credencial en el nodo).

## Uso
1. Inicia Node-RED: `node-red` y abre `http://localhost:1880`.
2. Menu → Import → importa `sumulation.json` y/o `telegram-flow.json`.
3. Ajusta URLs si tu backend no esta en `http://localhost:8080`.
4. Para control:
   - Pulsa inject start/stop/status para controlar la simulacion.
   - Pulsa los inject de cada parametro (cameraCount, probabilities, etc.). El nodo de armado JSON usa el valor pulsado o el defecto, y envia a `/admin/update`.
5. Para monitorizar:
   - Añade nodos `http request` a `/admin/status`, `/camera/status`, `/police/alerts` y conecta a `debug` o a UI nodes (`ui_text`, `ui_table`).
6. Para alertas Telegram (y email ITV):
   - Configura el nodo `telegram sender` con tu bot token y chat_id (o usa la variante con HTTP request a la API de Telegram con env vars).
   - Haz `POST` a `http://localhost:1880/alerts` con un JSON de alerta (type/plate/message, opcional `recipientEmail`).
   - Para emails ITV: añade un `switch` que filtre `msg.payload.type == 'ITV'` y un nodo `e-mail` usando `msg.payload.recipientEmail` como destinatario.

## Ejemplos de payloads
- Update config (admin/update):
```json
{
  "cameraCount": 4,
  "stolenProbability": 0.1,
  "itvFailProbability": 0.2,
  "ocrDelayMs": 150,
  "vehiclesPerCycle": 2,
  "vehicleIntervalMs": 1000
}
```
- Alerta a `/alerts` (Node-RED → Telegram/email):
```json
{
  "type": "ITV",
  "plate": "1234ABC",
  "priority": 7,
  "message": "ITV CADUCADA del vehiculo 1234ABC",
  "recipientEmail": "owner@example.com"
}
```

## Notas de seguridad
- Protege los endpoints expuestos en Node-RED (API key, IP allowlist, TLS) si se usan fuera de laboratorio.
- Si quieres que el backend Java empuje alertas a Node-RED automaticamente, configura la URL en `application.properties` (`node-red.webhook-url`) y se enviaran desde `PoliceService`.
