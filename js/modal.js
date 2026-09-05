// ═══════════════════════════════════════════════════════════════════════════
// MODALES PROPIOS — reemplazan alert()/confirm() del navegador con algo que
// respeta el estilo visual de la app.
// ═══════════════════════════════════════════════════════════════════════════

// ═══════════════════════════════════════════════════════════════════════════
// MODO OSCURO — alterna la clase 'dark' en <html> y la recuerda en
// localStorage. El destello inicial se evita con un script en el <head>
// de index.html que aplica la clase antes de pintar la página.
// ═══════════════════════════════════════════════════════════════════════════
function toggleTheme(){
  const isDark = document.documentElement.classList.toggle('dark');
  try{ localStorage.setItem('itmAsist_theme', isDark ? 'dark' : 'light'); }catch(e){}
}

const MODAL_ICONS = {
  info: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`,
  error: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>`,
  success: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>`,
  warning: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
};

// ═══════════════════════════════════════════════════════════════════════════
// ICONOS SVG REUTILIZABLES — sustituyen a los emojis (calendario, engrane,
// documento, descarga, check) para un look más consistente entre sistemas.
// ═══════════════════════════════════════════════════════════════════════════
const APP_ICONS = {
  calendar: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
  gear: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 1 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>`,
  file: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
  download: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
  check: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
};

/** Devuelve el <span> con el ícono inline listo para insertar en innerHTML. */
function appIcon(name){
  return `<span class="icon-inline">${APP_ICONS[name] || ''}</span>`;
}

function ensureModalRoot(){
  let root = document.getElementById('modalRoot');
  if(!root){
    root = document.createElement('div');
    root.id = 'modalRoot';
    document.body.appendChild(root);
  }
  return root;
}

function buildModal({type='info', message, showCancel=false}){
  return new Promise(resolve => {
    const root = ensureModalRoot();
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-box modal-${type}">
        <div class="modal-icon">${MODAL_ICONS[type] || MODAL_ICONS.info}</div>
        <div class="modal-msg">${message}</div>
        <div class="modal-actions">
          ${showCancel ? '<button class="modal-btn modal-btn-cancel" data-v="0">Cancelar</button>' : ''}
          <button class="modal-btn modal-btn-ok" data-v="1">Aceptar</button>
        </div>
      </div>`;
    root.appendChild(overlay);

    const cleanup = (val) => { overlay.remove(); resolve(val); };
    overlay.querySelector('.modal-btn-ok').onclick = () => cleanup(true);
    const cancelBtn = overlay.querySelector('.modal-btn-cancel');
    if(cancelBtn) cancelBtn.onclick = () => cleanup(false);
    overlay.onclick = (e) => { if(e.target===overlay && showCancel) cleanup(false); };
    document.addEventListener('keydown', function esc(e){
      if(e.key==='Escape'){ document.removeEventListener('keydown', esc); cleanup(showCancel?false:true); }
    });

    // foco inicial en el botón principal, para poder confirmar con Enter
    setTimeout(() => overlay.querySelector('.modal-btn-ok')?.focus(), 10);
  });
}

/** Sustituye alert(). No bloquea el hilo — el caller normalmente no necesita esperar. */
function showAlert(message, type='info'){
  return buildModal({type, message, showCancel:false});
}

/** Sustituye confirm(). Debe usarse con await: if(!(await showConfirm('...'))) return; */
function showConfirm(message){
  return buildModal({type:'warning', message, showCancel:true});
}

/**
 * Sustituye prompt(). Debe usarse con await:
 *   const v = await showPrompt('¿Número de memo?', {placeholder:'Ej. 070'});
 *   if(!v) return;
 * Devuelve el texto ingresado, o null si se cancela.
 */
function showPrompt(message, {placeholder='', defaultValue=''}={}){
  return new Promise(resolve => {
    const root = ensureModalRoot();
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal-box modal-info">
        <div class="modal-icon">${MODAL_ICONS.info}</div>
        <div class="modal-msg">${message}</div>
        <input type="text" class="modal-input" id="modalPromptInput" placeholder="${placeholder}" value="${defaultValue}" autocomplete="off"/>
        <div class="modal-actions">
          <button class="modal-btn modal-btn-cancel" data-v="0">Cancelar</button>
          <button class="modal-btn modal-btn-ok" data-v="1">Aceptar</button>
        </div>
      </div>`;
    root.appendChild(overlay);

    const input = overlay.querySelector('#modalPromptInput');
    const cleanup = (val) => { overlay.remove(); resolve(val); };
    const submit = () => { const v = input.value.trim(); cleanup(v ? v : null); };

    overlay.querySelector('.modal-btn-ok').onclick = submit;
    overlay.querySelector('.modal-btn-cancel').onclick = () => cleanup(null);
    overlay.onclick = (e) => { if(e.target===overlay) cleanup(null); };
    input.addEventListener('keydown', (e) => {
      if(e.key==='Enter'){ e.preventDefault(); submit(); }
      if(e.key==='Escape'){ e.preventDefault(); cleanup(null); }
    });

    setTimeout(() => input.focus(), 10);
  });
}
