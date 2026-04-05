// ==============================
// CONFIG
// ==============================
const MONITORING_ENDPOINT = '/api/log';

// ==============================
// SANITIZACIÓN
// ==============================
function sanitizeInput(value) {
  return String(value || '').replace(/[{}]/g, '');
}

function attachSanitizers() {
  const fields = document.querySelectorAll('input[type=text], input[type=email], input[type=tel], textarea');
  fields.forEach(field => {
    field.addEventListener('input', () => {
      const sanitized = field.value.replace(/[{}]/g, '');
      if (field.value !== sanitized) {
        field.value = sanitized;
      }
    });
  });
}

document.addEventListener('DOMContentLoaded', attachSanitizers);

// ==============================
// MONITOREO (opcional)
// ==============================
async function monitorSubmission(data) {
  try {
    await fetch(MONITORING_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (error) {
    console.error('Error monitoreo:', error);
  }
}

// ==============================
// ENVÍO PRINCIPAL
// ==============================
function submitForm() {

  // ==============================
  // DATOS BÁSICOS
  // ==============================
  const data = {
    negocio: sanitizeInput(document.getElementById('g-negocio').value),
    nombre: sanitizeInput(document.getElementById('g-nombre').value),
    name: sanitizeInput(document.getElementById('g-nombre').value),
    email: sanitizeInput(document.getElementById('g-email').value),
    from_email: sanitizeInput(document.getElementById('g-email').value),
    reply_to: sanitizeInput(document.getElementById('g-email').value),
    tel: sanitizeInput(document.getElementById('g-tel').value),
    proceso: sanitizeInput(document.getElementById('g-proceso').value),
    area: sanitizeInput(document.querySelector('input[name="area"]:checked')?.value),
    tiempo: new Date().toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })
  };

  // ==============================
  // CAMPOS EXTRA
  // ==============================
  data.iniDesc = sanitizeInput(document.getElementById('ini-desc').value);
  data.actorIni = sanitizeInput(document.querySelector('input[name="actor-ini"]:checked')?.value);
  data.iniDatos = sanitizeInput(document.getElementById('ini-datos').value);
  data.sistemas = Array.from(document.querySelectorAll('input[name="sis"]:checked')).map(cb => sanitizeInput(cb.value)).join(', ');
  data.errCancel = sanitizeInput(document.getElementById('err-cancel').value);
  data.finCuando = sanitizeInput(document.getElementById('fin-cuando').value);
  data.finResultado = sanitizeInput(document.getElementById('fin-resultado').value);
  data.finDesc = sanitizeInput(document.getElementById('fin-desc').value);
  data.comentario = sanitizeInput(document.getElementById('comentario').value);

  // ==============================
  // PARTICIPANTES
  // ==============================
  let participantes = [];
  document.querySelectorAll('#partContainer .part-row').forEach(row => {
    const nombre = sanitizeInput(row.querySelector('.part-inp')?.value.trim());
    const tipo = sanitizeInput(row.querySelector('.part-sel')?.value);
    if (nombre) participantes.push(`${nombre} (${tipo})`);
  });

  // ==============================
  // TAREAS
  // ==============================
  let tareas = [];
  document.querySelectorAll('#tasksContainer .task-row').forEach(row => {
    const desc = sanitizeInput(row.querySelector('.task-inp')?.value.trim());
    const quien = sanitizeInput(row.querySelectorAll('.task-sel')[0]?.value);
    const tipo = sanitizeInput(row.querySelectorAll('.task-sel')[1]?.value);
    const out = sanitizeInput(row.querySelector('.task-out')?.value);

    if (desc) {
      tareas.push(`• ${desc} → ${quien} (${tipo}) | Output: ${out}`);
    }
  });

  // ==============================
  // DECISIONES
  // ==============================
  let decisiones = [];
  document.querySelectorAll('#gwContainer .gw-block').forEach(gw => {
    const q = sanitizeInput(gw.querySelector('.gw-q')?.value.trim());
    let ramas = [];

    gw.querySelectorAll('.gw-branch-row').forEach(br => {
      const inputs = br.querySelectorAll('input');
      const cond = sanitizeInput(inputs[0]?.value.trim());
      const paso = sanitizeInput(inputs[1]?.value.trim());

      if (cond) ramas.push(`${cond} → ${paso}`);
    });

    if (q) decisiones.push(`• ${q}\n   ${ramas.join('\n   ')}`);
  });

  // ==============================
  // ERRORES
  // ==============================
  let errores = [];
  document.querySelectorAll('#errContainer .err-block').forEach(err => {
    const inputs = err.querySelectorAll('.err-i');
    const sels = err.querySelectorAll('.err-s');

    const problema = sanitizeInput(inputs[0]?.value);
    const paso = sanitizeInput(inputs[1]?.value);
    const frecuencia = sanitizeInput(sels[0]?.value);
    const consecuencia = sanitizeInput(sels[1]?.value);

    if (problema) {
      errores.push(`• ${problema} (Paso: ${paso}, Frecuencia: ${frecuencia}, Impacto: ${consecuencia})`);
    }
  });

  // ==============================
  // MENSAJE FINAL (REPORTE PRO)
  // ==============================
  data.message = `
📌 INFORMACIÓN GENERAL
- Negocio: ${data.negocio}
- Nombre: ${data.nombre}
- Email: ${data.email}
- Tel: ${data.tel}

⚙️ PROCESO
- ${data.proceso}
- Área: ${data.area}

🚀 INICIO
- Evento: ${data.iniDesc}
- Actor: ${data.actorIni}
- Datos: ${data.iniDatos}

👥 PARTICIPANTES
${participantes.join('\n')}

🧩 SISTEMAS
${data.sistemas}

📋 TAREAS
${tareas.join('\n')}

🔀 DECISIONES
${decisiones.join('\n\n')}

❌ ERRORES
${errores.join('\n')}

🏁 FINAL
- Condición: ${data.finCuando}
- Resultado: ${data.finResultado}
- Descripción: ${data.finDesc}

💬 COMENTARIOS
${data.comentario}
`;

  data.subject = `Nuevo diagnóstico - ${data.proceso} (${data.nombre})`;

  // ==============================
  // VALIDACIÓN
  // ==============================
  if (!data.negocio || !data.nombre || !data.email || !data.proceso || !data.area) {
    alert('Completá los campos obligatorios');
    return;
  }

  // ==============================
  // UI LOADING
  // ==============================
  const btn = document.querySelector('.btn-send');
  const originalText = btn.textContent;

  btn.textContent = 'Enviando...';
  btn.disabled = true;

  // ==============================
  // ENVÍO EMAILJS
  // ==============================
  emailjs.send('service_9rl9itj', 'template_pqdf7qo', data)
    .then(async () => {
      await monitorSubmission(data);
      alert('Diagnóstico enviado correctamente 🚀');
    })
    .catch(err => {
      console.error(err);
      alert('Error al enviar');
    })
    .finally(() => {
      btn.textContent = originalText;
      btn.disabled = false;
    });
}