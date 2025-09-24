# WhatsApp Inbox - Aplicación de Mensajería con Twilio

Una aplicación web moderna estilo WhatsApp Web para gestionar conversaciones de WhatsApp Business usando Twilio API.

## Características

- ✅ Interfaz moderna y responsiva similar a WhatsApp Web
- ✅ Sidebar con lista de conversaciones
- ✅ Área de chat con burbujas de mensajes
- ✅ Soporte automático para modo claro/oscuro
- ✅ Recepción de mensajes en tiempo real vía webhook
- ✅ Envío de mensajes a través de Twilio API
- ✅ Almacenamiento temporal en memoria
- ✅ Timestamps y formato de fecha/hora

## Requisitos Previos

1. **Cuenta de Twilio**: Necesitas una cuenta activa en [Twilio](https://www.twilio.com)
2. **WhatsApp Business API**: Configurado en tu cuenta de Twilio
3. **Node.js**: Versión 18 o superior
4. **Vercel CLI** (opcional): Para deployment

## Instalación

1. **Clona o descarga el proyecto**
   \`\`\`bash
   # Si usas Git
   git clone <tu-repositorio>
   cd whatsapp-inbox
   
   # O descarga el ZIP y extrae los archivos
   \`\`\`

2. **Instala las dependencias**
   \`\`\`bash
   npm install
   \`\`\`

3. **Configura las variables de entorno**
   
   Crea un archivo `.env.local` en la raíz del proyecto:
   \`\`\`env
   TWILIO_ACCOUNT_SID=tu_account_sid_aqui
   TWILIO_AUTH_TOKEN=tu_auth_token_aqui
   TWILIO_WHATSAPP_NUMBER=+14155238886
   \`\`\`

   **Dónde encontrar estos valores:**
   - `TWILIO_ACCOUNT_SID` y `TWILIO_AUTH_TOKEN`: En tu [Twilio Console](https://console.twilio.com/)
   - `TWILIO_WHATSAPP_NUMBER`: Tu número de WhatsApp Business (formato: +1234567890)

4. **Ejecuta la aplicación**
   \`\`\`bash
   npm run dev
   \`\`\`

   La aplicación estará disponible en `http://localhost:3000`

## Configuración de Twilio Webhook

Para recibir mensajes, necesitas configurar el webhook en Twilio:

### Desarrollo Local

1. **Instala ngrok** (para exponer tu localhost):
   \`\`\`bash
   npm install -g ngrok
   \`\`\`

2. **Expone tu aplicación local**:
   \`\`\`bash
   ngrok http 3000
   \`\`\`

3. **Copia la URL HTTPS** que ngrok te proporciona (ej: `https://abc123.ngrok.io`)

4. **Configura el webhook en Twilio**:
   - Ve a [Twilio Console > WhatsApp > Senders](https://console.twilio.com/us1/develop/sms/senders/whatsapp-senders)
   - Selecciona tu número de WhatsApp
   - En "Webhook URL", ingresa: `https://abc123.ngrok.io/api/webhook`
   - Método HTTP: `POST`
   - Guarda los cambios

### Producción (Vercel)

1. **Despliega en Vercel**:
   \`\`\`bash
   # Instala Vercel CLI si no lo tienes
   npm install -g vercel
   
   # Despliega
   vercel
   \`\`\`

2. **Configura variables de entorno en Vercel**:
   - Ve a tu proyecto en [Vercel Dashboard](https://vercel.com/dashboard)
   - Settings > Environment Variables
   - Agrega las mismas variables del archivo `.env.local`

3. **Configura el webhook con tu URL de producción**:
   - URL del webhook: `https://tu-app.vercel.app/api/webhook`

## Uso

1. **Inicia la aplicación** con `npm run dev`
2. **Configura el webhook** siguiendo los pasos anteriores
3. **Envía un mensaje** a tu número de WhatsApp Business desde cualquier teléfono
4. **El mensaje aparecerá** automáticamente en la interfaz
5. **Responde** escribiendo en el campo de texto y presionando Enter o el botón enviar

## Estructura del Proyecto

\`\`\`
whatsapp-inbox/
├── app/
│   ├── api/
│   │   ├── webhook/route.ts      # Recibe mensajes de Twilio
│   │   ├── send/route.ts         # Envía mensajes via Twilio
│   │   ├── messages/route.ts     # API para obtener mensajes
│   │   └── conversations/route.ts # API para obtener conversaciones
│   ├── globals.css               # Estilos globales y tema
│   └── page.tsx                  # Componente principal de la UI
├── components/ui/                # Componentes de UI (shadcn/ui)
├── package.json
└── README.md
\`\`\`

## API Endpoints

- `POST /api/webhook` - Recibe mensajes entrantes de Twilio
- `POST /api/send` - Envía mensajes salientes
- `GET /api/messages` - Obtiene todos los mensajes
- `GET /api/conversations` - Obtiene lista de conversaciones

## Personalización

### Cambiar Colores
Edita `app/globals.css` para modificar el tema de colores:
\`\`\`css
--color-primary: #00a884;  /* Verde de WhatsApp */
--color-message-sent: #d9fdd3;  /* Color de mensajes enviados */
\`\`\`

### Agregar Base de Datos
Actualmente usa almacenamiento en memoria. Para producción, considera:
- PostgreSQL con Prisma
- MongoDB con Mongoose
- Supabase
- PlanetScale

### Funcionalidades Adicionales
- Autenticación de usuarios
- Múltiples agentes/operadores
- Historial persistente de mensajes
- Notificaciones push
- Archivos multimedia
- Estados de mensaje (enviado, entregado, leído)

## Solución de Problemas

### Error: "Cannot find module 'twilio'"
\`\`\`bash
npm install twilio
\`\`\`

### Mensajes no llegan
1. Verifica que el webhook esté configurado correctamente
2. Revisa los logs de Twilio Console
3. Asegúrate de que ngrok esté corriendo (desarrollo local)

### Error de autenticación Twilio
1. Verifica que `TWILIO_ACCOUNT_SID` y `TWILIO_AUTH_TOKEN` sean correctos
2. Revisa que las variables de entorno estén cargadas

### Webhook no responde
1. Verifica que la URL del webhook sea accesible públicamente
2. Revisa los logs de la aplicación
3. Asegúrate de que el endpoint retorne status 200

## Deployment en Vercel

1. **Conecta tu repositorio** a Vercel
2. **Configura las variables de entorno** en Vercel Dashboard
3. **Despliega** automáticamente con cada push
4. **Actualiza el webhook URL** en Twilio con tu nueva URL de producción

## Licencia

MIT License - Siéntete libre de usar este código para tus proyectos.

## Soporte

Si encuentras algún problema:
1. Revisa la sección de "Solución de Problemas"
2. Verifica la configuración de Twilio
3. Revisa los logs de la aplicación y Twilio Console

---

**¡Tu aplicación de WhatsApp Inbox está lista para usar!** 🚀
