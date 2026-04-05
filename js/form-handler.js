// form-handler.js - Manejo del formulario de diagnóstico con EmailJS

const MONITORING_ENDPOINT = '/api/log';

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

async function monitorSubmission(data) {
  try {
    await fetch(MONITORING_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (error) {
    console.error('Error enviando datos al endpoint de monitorización:', error);
  }
}

// Función para enviar el formulario
function submitForm() {
  // Recopilar datos del formulario
  const negocio = sanitizeInput(document.getElementById('g-negocio').value);
  const nombre = sanitizeInput(document.getElementById('g-nombre').value);
  const email = sanitizeInput(document.getElementById('g-email').value);
  const tel = sanitizeInput(document.getElementById('g-tel').value);
  const proceso = sanitizeInput(document.getElementById('g-proceso').value);
  const area = sanitizeInput(document.querySelector('input[name="area"]:checked')?.value);
  const areaOtro = sanitizeInput(document.getElementById('g-areaOtro').value);
  const trig = Array.from(document.querySelectorAll('input[name="trig"]:checked')).map(cb => sanitizeInput(cb.value)).join(', ');
  const iniDesc = sanitizeInput(document.getElementById('ini-desc').value);
  const actorIni = sanitizeInput(document.querySelector('input[name="actor-ini"]:checked')?.value);
  const iniDatos = sanitizeInput(document.getElementById('ini-datos').value);
  const sistemas = Array.from(document.querySelectorAll('input[name="sis"]:checked')).map(cb => sanitizeInput(cb.value)).join(', ');
  const otroSis = sanitizeInput(document.getElementById('otro-sis-txt').value);
  const errCancel = sanitizeInput(document.getElementById('err-cancel').value);
  const finCuando = sanitizeInput(document.getElementById('fin-cuando').value);
  const finResultado = sanitizeInput(document.getElementById('fin-resultado').value);
  const finDesc = sanitizeInput(document.getElementById('fin-desc').value);
  const comentario = sanitizeInput(document.getElementById('comentario').value);

  const data = {
    negocio,
    nombre,
    name: nombre,
    email,
    from_email: email,
    reply_to: email,
    tel,
    proceso,
    title: proceso,
    subject: `Diagnóstico – ${proceso}`,
    tiempo: new Date().toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }),
    area,
    areaOtro,
    trig,
    iniDesc,
    actorIni,
    iniDatos,
    participantes: [],
    sistemas,
    otroSis,
    tareas: [],
    decisiones: [],
    esperas: [],
    errores: [],
    errCancel,
    finCuando,
    finResultado,
    finDesc,
    finesAlt: [],
    procesosExtra: [],
    comentario,
    message: ''
  };

  // Procesar participantes
  document.querySelectorAll('#partContainer .part-row').forEach(row => {
    const inp = row.querySelector('.part-inp');
    const sel = row.querySelector('.part-sel');
    const nombrePart = sanitizeInput(inp.value.trim());
    const tipoPart = sanitizeInput(sel.value);
    if(nombrePart) data.participantes.push(`${nombrePart} (${tipoPart})`);
  });
  data.participantes = data.participantes.join('; ');

  // Procesar tareas
  document.querySelectorAll('#tasksContainer .task-row').forEach(row => {
    const inp = row.querySelector('.task-inp');
    const sels = row.querySelectorAll('.task-sel');
    const out = row.querySelector('.task-out');
    const tareaDesc = sanitizeInput(inp.value.trim());
    const quien = sanitizeInput(sels[0]?.value);
    const tipo = sanitizeInput(sels[1]?.value);
    const output = sanitizeInput(out.value);
    if(tareaDesc) data.tareas.push(`${tareaDesc} - Quién: ${quien} - Cómo: ${tipo} - Output: ${output}`);
  });
  data.tareas = data.tareas.join('\n');

  // Procesar decisiones
  document.querySelectorAll('#gwContainer .gw-block').forEach(gw => {
    const q = sanitizeInput(gw.querySelector('.gw-q').value.trim());
    const branches = [];
    gw.querySelectorAll('.gw-branch-row').forEach(br => {
      const inps = br.querySelectorAll('input');
      const condicion = sanitizeInput(inps[0]?.value.trim());
      const paso = sanitizeInput(inps[1]?.value.trim());
      if(condicion) branches.push(`${condicion} → ${paso}`);
    });
    if(q) data.decisiones.push(`Pregunta: ${q}\nRamas: ${branches.join(', ')}`);
  });
  data.decisiones = data.decisiones.join('\n\n');

  // Procesar esperas
  document.querySelectorAll('#waitsContainer .wait-block').forEach(wait => {
    const inps = wait.querySelectorAll('.wait-inp');
    const sel = wait.querySelector('.wait-sel');
    const despues = sanitizeInput(inps[0]?.value);
    const espera = sanitizeInput(sel.value);
    const tiempo = sanitizeInput(inps[1]?.value);
    const consecuencia = sanitizeInput(inps[2]?.value);
    if(despues || espera || tiempo || consecuencia) {
      data.esperas.push(`Después de: ${despues} - Espera: ${espera} - Tiempo: ${tiempo} - Consecuencia: ${consecuencia}`);
    }
  });
  data.esperas = data.esperas.join('\n');

  // Procesar errores
  document.querySelectorAll('#errContainer .err-block').forEach(err => {
    const inps = err.querySelectorAll('.err-i');
    const sels = err.querySelectorAll('.err-s');
    const problema = sanitizeInput(inps[0]?.value);
    const paso = sanitizeInput(inps[1]?.value);
    const frecuencia = sanitizeInput(sels[0]?.value);
    const consecuencia = sanitizeInput(sels[1]?.value);
    const manejo = sanitizeInput(inps[2]?.value);
    if(problema || paso || frecuencia || consecuencia || manejo) {
      data.errores.push(`Problema: ${problema} - Paso: ${paso} - Frecuencia: ${frecuencia} - Consecuencia: ${consecuencia} - Manejo: ${manejo}`);
    }
  });
  data.errores = data.errores.join('\n');

  // Procesar fines alternativos
  document.querySelectorAll('#altEndsContainer .end-block').forEach(end => {
    const inp = end.querySelector('.end-i');
    const sel = end.querySelector('.end-s');
    const descripcion = sanitizeInput(inp.value.trim());
    const estado = sanitizeInput(sel.value);
    if(descripcion) data.finesAlt.push(`${descripcion} - Estado: ${estado}`);
  });
  data.finesAlt = data.finesAlt.join('\n');

  // Procesar procesos extra
  document.querySelectorAll('#extraProcsContainer .extra-proc-row').forEach(xp => {
    const inp = xp.querySelector('.extra-inp');
    const ta = xp.querySelector('.extra-ta');
    const nombreExtra = sanitizeInput(inp.value.trim());
    const descripcionExtra = sanitizeInput(ta.value);
    if(nombreExtra) data.procesosExtra.push(`${nombreExtra}: ${descripcionExtra}`);
  });
  data.procesosExtra = data.procesosExtra.join('\n\n');

  data.message = `
Negocio: ${data.negocio}
Nombre: ${data.nombre}
Email: ${data.email}
Teléfono: ${data.tel}
Proceso: ${data.proceso}
Área: ${data.area}${data.areaOtro ? ' (' + data.areaOtro + ')' : ''}
Evento de inicio: ${data.iniDesc}
Actor que inicia: ${data.actorIni}
Información inicial: ${data.iniDatos}
Participantes: ${data.participantes}
Sistemas: ${data.sistemas}${data.otroSis ? ' (' + data.otroSis + ')' : ''}
Tareas:
${data.tareas}
Decisiones:
${data.decisiones}
Esperas:
${data.esperas}
Errores:
${data.errores}
Error que cancela: ${data.errCancel}
Fin exitoso cuando: ${data.finCuando}
Resultado final: ${data.finResultado}
Descripción de fin: ${data.finDesc}
Fines alternativos:
${data.finesAlt}
Procesos extra:
${data.procesosExtra}
Comentario adicional:
${data.comentario}
`;

  // Validación básica
  if(!data.negocio || !data.nombre || !data.email || !data.proceso || !data.area){
    alert('Por favor completá todos los campos obligatorios marcados con *');
    return;
  }

  // Mostrar indicador de carga
  const btn = document.querySelector('.btn-send');
  const originalText = btn.textContent;
  btn.textContent = 'Enviando...';
  btn.disabled = true;

  if (typeof emailjs === 'undefined') {
    console.error('EmailJS no está cargado.');
    alert('No se pudo enviar el diagnóstico porque EmailJS no se cargó correctamente. Recargá la página e intentá nuevamente.');
    btn.textContent = originalText;
    btn.disabled = false;
    return;
  }

  // Enviar email con EmailJS
  emailjs.send('service_9rl9itj', 'template_pqdf7qo', data)
    .then(async function(response) {
      console.log('Email enviado exitosamente', response.status, response.text);
      await monitorSubmission(data);
      document.querySelectorAll('.fs').forEach(fs => fs.classList.remove('active'));
      document.getElementById('fOk').style.display = 'block';
      document.getElementById('modal').scrollTop = 0;
    })
    .catch(function(error) {
      console.log('Error al enviar email', error);
      alert('Hubo un error al enviar el diagnóstico. Por favor intentá nuevamente o contactanos directamente a info@herencias.com.ar');
    })
    .finally(function() {
      btn.textContent = originalText;
      btn.disabled = false;
    });
}