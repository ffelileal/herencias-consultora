# HerencIAs - Automatización con IA

Sitio web estático para el diagnóstico de procesos de negocio y automatización con IA.

## Funcionalidades

- Formulario interactivo de 9 pasos para mapear procesos de negocio
- Envío de diagnósticos por email usando EmailJS
- Diseño responsive y moderno

## Configuración

### 1. EmailJS

Para que el formulario envíe emails, configura EmailJS:

1. Ve a [https://www.emailjs.com/](https://www.emailjs.com/) y crea una cuenta
2. Crea un servicio de email (por ejemplo, Gmail)
3. Crea un template de email con las variables del formulario
4. Obtén tu Public Key, Service ID y Template ID

### 2. Actualizar el código

En `index.html`, reemplaza el Public Key en la inicialización de EmailJS:

```javascript
emailjs.init('TU_PUBLIC_KEY_AQUI');
```

En `js/form-handler.js`, reemplaza el Service ID y Template ID:

```javascript
emailjs.send('TU_SERVICE_ID', 'TU_TEMPLATE_ID', data)
```

También asegúrate de que el template incluya las variables que envía el formulario, por ejemplo:

```text
{{title}}
{{name}}
{{email}}
{{tiempo}}
{{message}}
```

Donde `{{message}}` puede contener todos los datos del formulario en un solo bloque legible.
### 3. Desplegar en Vercel

1. Sube este repositorio a GitHub
2. Conecta tu repo a Vercel
## 🚀 Despliegue en Vercel

1. **Sube el código a GitHub**:
   - Crea un repositorio nuevo
   - Sube todos los archivos (index.html, js/, package.json, vercel.json, README.md)

2. **Conecta a Vercel**:
   - Ve a [vercel.com](https://vercel.com)
   - Importa tu repositorio de GitHub
   - Vercel detectará automáticamente la configuración

3. **¡Listo!** El sitio estará online en segundos

## ✅ Checklist final

- [ ] EmailJS configurado con Service ID real
- [ ] Template ID correcto en `js/form-handler.js`
- [ ] Código subido a GitHub
- [ ] Desplegado en Vercel
- [ ] Probar el formulario completando un diagnóstico de prueba
- [ ] Revisar logs de Vercel para las sumisiones

## Monitorización de envíos

El formulario ahora envía los datos a un endpoint de Vercel en `api/log.js` además del email.

- En Vercel, las sumisiones quedan registradas en los logs de la función.
- Busca el mensaje `📥 Nueva sumisión de formulario:` en el panel de funciones.

### Opcional: enviar monitorización a un webhook

Si querés recibir notificaciones en Slack, Discord o cualquier otro servicio, agrega la variable de entorno en Vercel:

- `MONITORING_WEBHOOK_URL`

El contenido del formulario se enviará automáticamente a ese webhook en JSON.

¡Tu sitio de HerencIAs ahora envía el diagnóstico por email y guarda un registro para monitoreo! 🎉

## Estructura del proyecto

- `index.html` - Página principal con todo el contenido y estilos
- `js/form-handler.js` - Lógica de envío del formulario con EmailJS
- `package.json` - Metadatos del proyecto
- `vercel.json` - Configuración de Vercel
- `README.md` - Este archivo

## Licencia

© 2025 HerencIAs. Todos los derechos reservados.</content>
<parameter name="filePath">c:\FELIPE\herencias\README.md