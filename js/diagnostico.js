let currentStep = 1;
let selectedSector = '';

const progress = { 1: 33, 2: 66, 3: 100 };
const stepLabels = { 1: 'Paso 1 de 3', 2: 'Paso 2 de 3', 3: 'Paso 3 de 3' };

function openModal() {
  const el = document.getElementById('modalOverlay');
  if (el) el.style.display = 'flex';
  document.body.classList.add('modal-open');
}

function closeModal() {
  const el = document.getElementById('modalOverlay');
  if (el) el.style.display = 'none';
  document.body.classList.remove('modal-open');
  resetModalForm();
  closeMenu();
}

function overlayClick(e) {
  if (e.target === document.getElementById('modalOverlay')) closeModal();
}

function closeMenu() {
  const menu = document.querySelector('.nav-menu') || document.getElementById('navLinks');
  const hamburger = document.getElementById('hamburger');
  if (menu) menu.classList.remove('mobile-open', 'open');
  if (hamburger) hamburger.classList.remove('active');
}

function resetModalForm() {
  currentStep = 1;
  selectedSector = '';
  showStep(1);

  const fOk = document.getElementById('fOk');
  if (fOk) fOk.style.display = 'none';
  const fLoading = document.getElementById('fLoading');
  if (fLoading) fLoading.style.display = 'none';

  const progressFill = document.getElementById('progressFill');
  if (progressFill) progressFill.style.width = '33%';

  const stepLabel = document.getElementById('stepLabel');
  if (stepLabel) stepLabel.textContent = stepLabels[1];

  const dot0 = document.getElementById('dot0'); if (dot0) dot0.style.background = 'var(--accent)';
  const dot1 = document.getElementById('dot1'); if (dot1) dot1.style.background = 'var(--line)';
  const dot2 = document.getElementById('dot2'); if (dot2) dot2.style.background = 'var(--line)';

  document.querySelectorAll('.pill').forEach(pill => pill.classList.remove('sel'));

  ['nombre', 'negocio', 'whatsapp', 'prefijo', 'otroRubro', 'problema'].forEach(id => {
    const field = document.getElementById(id);
    if (field) field.value = id === 'prefijo' ? '+54' : '';
  });

  const otroField = document.getElementById('otroField');
  if (otroField) otroField.style.display = 'none';

  ['nombre', 'negocio', 'whatsapp', 'problema'].forEach(id => showError(id, false));
  const errSector = document.getElementById('err-sector');
  if (errSector) errSector.style.display = 'none';
}

function goNext(from) {
  if (from === 1) {
    if (!validateStep1()) return;
    showStep(2);
  } else if (from === 2) {
    if (!validateStep2()) return;
    showStep(3);
  }
}

function go(from, to) {
  showStep(to);
}

function showStep(step) {
  document.querySelectorAll('.fs').forEach(p => p.classList.remove('active'));
  const target = document.getElementById('step' + step);
  if (target) target.classList.add('active');
  currentStep = step;
  updateUI(step);
}

function updateUI(step) {
  const bar = document.getElementById('progressFill');
  if (bar) bar.style.width = progress[step] + '%';

  const label = document.getElementById('stepLabel');
  if (label) label.textContent = stepLabels[step];

  for (let i = 0; i < 3; i++) {
    const dot = document.getElementById('dot' + i);
    if (!dot) continue;
    dot.className = 'step-dot';
    if (i + 1 === step) {
      dot.className = 'step-dot active';
    } else if (i + 1 < step) {
      dot.className = 'step-dot done';
    }
  }
}

function selectPill(el, sector) {
  document.querySelectorAll('.pill').forEach(p => p.classList.remove('sel'));
  el.classList.add('sel');
  selectedSector = sector;

  const err = document.getElementById('err-sector');
  if (err) err.style.display = 'none';

  const otroField = document.getElementById('otroField');
  if (otroField) otroField.style.display = sector === 'Otro' ? 'block' : 'none';
  if (sector !== 'Otro') {
    const otroRubro = document.getElementById('otroRubro');
    if (otroRubro) otroRubro.value = '';
  }
}

function validateStep1() {
  let ok = true;
  const nombre = document.getElementById('nombre').value.trim();
  const negocio = document.getElementById('negocio').value.trim();
  const wa = document.getElementById('whatsapp').value.trim();

  if (!nombre) { showError('nombre', true); ok = false; } else showError('nombre', false);
  if (!negocio) { showError('negocio', true); ok = false; } else showError('negocio', false);
  if (!wa || wa.length < 8) { showError('whatsapp', true); ok = false; } else showError('whatsapp', false);

  return ok;
}

function validateStep2() {
  if (!selectedSector) {
    const err = document.getElementById('err-sector');
    if (err) err.style.display = 'block';
    return false;
  }

  if (selectedSector === 'Otro') {
    const otroRubro = document.getElementById('otroRubro');
    if (!otroRubro || !otroRubro.value.trim()) {
      if (otroRubro) otroRubro.classList.add('error');
      return false;
    }
  }

  return true;
}

function showError(id, show) {
  const input = document.getElementById(id);
  const err = document.getElementById('err-' + id);
  if (input) input.classList.toggle('error', show);
  if (err) err.style.display = show ? 'block' : 'none';
}

function submitForm() {
  const problema = document.getElementById('problema').value.trim();
  if (!problema || problema.length < 15) {
    showError('problema', true);
    return;
  }

  showError('problema', false);
  const btn = document.getElementById('submitBtn');
  const originalText = btn ? btn.textContent : '';
  if (btn) { btn.textContent = 'Enviando...'; btn.disabled = true; }

  const data = {
    to_email: 'herencias.asist@gmail.com',
    from_name: document.getElementById('nombre').value.trim(),
    from_email: 'web@herencias.com',
    negocio: document.getElementById('negocio').value.trim(),
    whatsapp: document.getElementById('prefijo').value + document.getElementById('whatsapp').value.trim(),
    sector: selectedSector === 'Otro' ? document.getElementById('otroRubro').value.trim() : selectedSector,
    problema: problema,
    timestamp: new Date().toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' })
  };

  if (window.emailjs) {
    emailjs.send('service_9rl9itj', 'template_pqdf7qo', data)
      .then(() => {
        document.querySelectorAll('.fs').forEach(p => p.classList.remove('active'));
        const loading = document.getElementById('fLoading');
        if (loading) loading.style.display = 'block';
        document.getElementById('stepLabel').textContent = 'Procesando...';
        const fill = document.getElementById('progressFill'); if (fill) fill.style.width = '100%';

        setTimeout(() => {
          if (loading) loading.style.display = 'none';
          const success = document.getElementById('fOk');
          if (success) {
            const namePart = data.from_name.split(' ')[0] || data.from_name;
            document.getElementById('successNombre').textContent = namePart;
            success.style.display = 'block';
          }
          setTimeout(() => { closeModal(); window.scrollTo({ top: 0, behavior: 'smooth' }); }, 2800);
        }, 1400);
      })
      .catch(err => {
        console.error('EmailJS error:', err);
        alert('Error al enviar el formulario. Por favor intentá nuevamente.');
      })
      .finally(() => {
        if (btn) { btn.textContent = originalText; btn.disabled = false; }
      });
  } else {
    alert('No se pudo enviar el formulario. Por favor intentá nuevamente más tarde.');
    if (btn) { btn.textContent = originalText; btn.disabled = false; }
  }
}

function initPageEvents() {
  document.querySelectorAll('[data-action="open-modal"]').forEach(el => {
    el.addEventListener('click', event => {
      event.preventDefault();
      openModal();
    });
  });

  const overlay = document.getElementById('modalOverlay');
  if (overlay) overlay.addEventListener('click', overlayClick);

  document.querySelectorAll('[data-action="close-modal"]').forEach(btn => {
    btn.addEventListener('click', closeModal);
  });

  document.querySelectorAll('[data-action="next"]').forEach(btn => {
    const step = Number(btn.dataset.step);
    if (!Number.isNaN(step)) {
      btn.addEventListener('click', () => goNext(step));
    }
  });

  document.querySelectorAll('[data-action="back"]').forEach(btn => {
    const step = Number(btn.dataset.step);
    if (!Number.isNaN(step)) {
      btn.addEventListener('click', () => go(step + 1, step));
    }
  });

  document.querySelectorAll('[data-action="submit"]').forEach(btn => {
    btn.addEventListener('click', submitForm);
  });

  document.querySelectorAll('[data-action="select-pill"]').forEach(label => {
    label.addEventListener('click', event => {
      event.preventDefault();
      const value = label.dataset.value;
      if (value) selectPill(label, value);
    });
  });

  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
    navLinks.querySelectorAll('a').forEach(link => link.addEventListener('click', () => navLinks.classList.remove('open')));
  }

  const compareToggle = document.getElementById('compareToggle');
  const compareTableWrap = document.getElementById('compareTableWrap');
  if (compareToggle && compareTableWrap) {
    compareToggle.addEventListener('click', () => {
      const isOpen = compareTableWrap.dataset.open === 'true';
      compareTableWrap.dataset.open = !isOpen;
      compareToggle.setAttribute('aria-expanded', !isOpen);
      compareToggle.firstChild.textContent = isOpen
        ? 'Comparar los tres planes lado a lado '
        : 'Cerrar comparativa ';
    });
  }
}

function initDiagnostico() {
  const nombre = document.getElementById('nombre');
  if (nombre) nombre.addEventListener('blur', () => { if (nombre.value.trim()) showError('nombre', false); });

  const negocio = document.getElementById('negocio');
  if (negocio) negocio.addEventListener('blur', () => { if (negocio.value.trim()) showError('negocio', false); });

  const whatsapp = document.getElementById('whatsapp');
  if (whatsapp) whatsapp.addEventListener('blur', () => { if (whatsapp.value.trim().length >= 8) showError('whatsapp', false); });

  const problema = document.getElementById('problema');
  if (problema) problema.addEventListener('input', () => { if (problema.value.trim().length >= 15) showError('problema', false); });
}

window.addEventListener('DOMContentLoaded', () => {
  if (window.emailjs) { emailjs.init('adm4MXdWYT5iF8f7B'); }
  initDiagnostico();
  initPageEvents();
});
