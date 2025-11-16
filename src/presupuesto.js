import "./styles/app.css";
import "./components/side-nav.js";
import "./sidebar.js";
import { config, getItemsUrl } from "./config.js";
document.body.dataset.active = "presupuesto";

// Utilidades
function format(num) {
  return Number(num).toFixed(2);
}

// Obtener parámetros de la URL
function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

const presupuestoId = getQueryParam("id");
const projectId = getQueryParam("project_id");
const actividadId = getQueryParam("actividad_id");

// (Eliminadas declaraciones duplicadas de variables DOM y estado)


// Referencias DOM
const form = document.getElementById("item-form");
const formUnidadSelect = document.getElementById("unidad");
const formUnidadCustom = document.getElementById("unidad_custom");
const tbody = document.getElementById("items-tbody");
const totalCell = document.getElementById("total-cell");
const backBtn = document.getElementById("back-btn");
const toastContainer = document.getElementById("toast-container");

// Mostrar/ocultar input de unidad personalizada en el formulario
if (formUnidadSelect && formUnidadCustom) {
  formUnidadSelect.addEventListener("change", () => {
    if (formUnidadSelect.value === "OTRO") {
      formUnidadCustom.classList.remove("hidden");
    } else {
      formUnidadCustom.classList.add("hidden");
    }
  });
}

let items = [];

const UNIT_OPTIONS = ["UND", "ML", "M2", "M3", "KG", "LT", "HRS", "PZA", "GLB", "CJ", "OTRO"];

function unitOptionsHTML(selected) {
  return UNIT_OPTIONS.map((u) => {
    const label = u === "OTRO" ? "OTRO…" : u;
    const sel = u === selected ? " selected" : "";
    return `<option value="${u}"${sel}>${label}</option>`;
  }).join("");
}

// Toast helper
function showToast(message, type = "success") {
  if (!toastContainer) return;
  const base = "pointer-events-auto min-w-[220px] max-w-sm px-3 py-2 rounded shadow-md text-sm transition opacity-0";
  const palette = type === "error" ? "bg-red-600 text-white" : type === "info" ? "bg-zinc-800 text-white" : "bg-green-600 text-white";
  const el = document.createElement("div");
  el.className = `${base} ${palette}`;
  el.textContent = message;
  toastContainer.appendChild(el);
  // fade in
  requestAnimationFrame(() => {
    el.classList.add("opacity-100");
  });
  // auto hide
  setTimeout(() => {
    el.classList.remove("opacity-100");
    el.classList.add("opacity-0");
    setTimeout(() => el.remove(), 300);
  }, 2500);
}

// Modal de confirmación para eliminar
function getDeleteConfirmModal() {
  let modal = document.getElementById('delete-confirm-modal');
  if (!modal) {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = `
      <div id="delete-confirm-modal" class="fixed inset-0 bg-black/50 hidden items-center justify-center z-50 opacity-0 transition-opacity duration-200">
        <div id="delete-confirm-card" class="bg-white rounded shadow-lg p-4 w-[92vw] max-w-md transform transition-transform duration-200 scale-95">
          <h3 class="text-base font-semibold text-zinc-900">Confirmar eliminación</h3>
          <p id="delete-confirm-text" class="mt-2 text-sm text-zinc-600"></p>
          <div class="mt-4 flex justify-end gap-2">
            <button id="delete-confirm-cancel" class="px-3 py-1 rounded border border-zinc-300 text-zinc-800 hover:bg-zinc-50">Cancelar</button>
            <button id="delete-confirm-yes" class="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700">Eliminar</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(wrapper.firstElementChild);
    modal = document.getElementById('delete-confirm-modal');
  }
  const textEl = document.getElementById('delete-confirm-text');
  const yesBtn = document.getElementById('delete-confirm-yes');
  const cancelBtn = document.getElementById('delete-confirm-cancel');
  const cardEl = document.getElementById('delete-confirm-card');
  return { modal, textEl, yesBtn, cancelBtn, cardEl };
}

// Cargar ítems de la actividad desde el backend si hay actividadId
async function loadItemsFromBackend() {
  // Si hay id de presupuesto, cargar por presupuesto_id
  if (presupuestoId) {
    try {
      const apiBase = config.apiBaseUrl || "/api/";
      const url = apiBase.replace(/\/$/, "") + `/presupuesto_item.php?presupuesto_id=${encodeURIComponent(presupuestoId)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("No se pudo cargar los ítems");
      const data = await res.json();
      items = data.map((it) => ({
        id: String(it.id),
        descripcion: it.descripcion,
        unidad: it.unidad || "UND",
        cantidad: Number(it.cantidad),
        precio: Number(it.precio),
        _dirty: false,
      }));
      showToast("Ítems cargados", "info");
    } catch (e) {
      console.error("Error cargando ítems del presupuesto", e);
      items = [];
      showToast("No se pudieron cargar los ítems", "error");
    }
    return;
  }
  // Si no, intentar por actividadId (flujo anterior)
  if (actividadId) {
    try {
      const apiBase = config.apiBaseUrl || "/api/";
      const url = apiBase.replace(/\/$/, "") + `/presupuesto_item.php?actividad_id=${encodeURIComponent(actividadId)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("No se pudo cargar los ítems");
      const data = await res.json();
      items = data.map((it) => ({
        id: String(it.id),
        descripcion: it.descripcion,
        unidad: it.unidad || "UND",
        cantidad: Number(it.cantidad),
        precio: Number(it.precio),
        _dirty: false,
      }));
      showToast("Ítems cargados", "info");
    } catch (e) {
      console.error("Error cargando ítems de la actividad", e);
      items = [];
      showToast("No se pudieron cargar los ítems", "error");
    }
  }
}

function calcTotal() {
  return items.reduce((acc, it) => acc + it.cantidad * it.precio, 0);
}

function render() {
  // ...solo renderizado, sin delegación de eventos...
  if (!tbody || !totalCell) return;
  tbody.innerHTML = "";
  items.forEach((it, idx) => {
    const tr = document.createElement("tr");
    const subtotal = it.cantidad * it.precio;
    const isKnown = UNIT_OPTIONS.includes(it.unidad);
    const selectedUnit = isKnown ? it.unidad : "OTRO";
    const customUnit = selectedUnit === "OTRO" ? it.unidad || "" : "";

    tr.innerHTML = `
      <td class="px-3 py-2 text-center align-top">${idx + 1}</td>
      <td class="px-3 py-2 align-top">
        <div class="flex items-center gap-2 group">
          <span class="block font-medium">${it.descripcion}</span>
          <button title="Editar descripción" class="opacity-0 group-hover:opacity-100 transition cursor-pointer edit-desc-btn" data-action="edit-desc" data-id="${it.id}" aria-label="Editar descripción">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-edit">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" />
              <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" />
              <path d="M16 5l3 3" />
            </svg>
          </button>
          <button title="Copiar descripción" class="opacity-0 group-hover:opacity-100 transition cursor-pointer copy-desc-btn" data-action="copy-desc" data-id="${it.id}" aria-label="Copiar descripción">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-copy">
              <rect x="8" y="8" width="12" height="12" rx="2" />
              <path d="M16 8v-2a2 2 0 0 0 -2 -2h-8a2 2 0 0 0 -2 2v8a2 2 0 0 0 2 2h2" />
            </svg>
          </button>
        </div>
      </td>
      <td class="px-3 py-2 text-right align-top">
        <div class="flex flex-col items-end">
          <select data-id="${it.id}" data-field="unidad" class="w-24 rounded border border-zinc-300 px-2 py-1 text-right text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">${unitOptionsHTML(selectedUnit)}</select>
          <input type="text" value="${customUnit}" placeholder="Especificar unidad" data-id="${it.id}" data-field="unidad-custom" class="${selectedUnit === "OTRO" ? "" : "hidden"} mt-1 w-24 rounded border border-zinc-300 px-2 py-1 text-right text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
      </td>
      <td class="px-3 py-2 text-right align-top">
        <input type="number" min="0" step="1" value="${it.cantidad}" data-id="${it.id}" data-field="cantidad" class="w-20 rounded border border-zinc-300 px-2 py-1 text-right text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
      </td>
      <td class="px-3 py-2 text-right align-top">
        <input type="number" min="0" step="0.01" value="${it.precio}" data-id="${it.id}" data-field="precio" class="w-24 rounded border border-zinc-300 px-2 py-1 text-right text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
      </td>
      <td class="px-3 py-2 text-right align-top font-medium">${format(subtotal)}</td>
      <td class="px-3 py-2 text-center align-top flex gap-2 justify-center">
        <button data-action="guardar" data-id="${it.id}" class="text-xs rounded bg-brand-100 text-brand-700 px-2 py-1 hover:bg-brand-200 ${it._dirty ? "cursor-pointer opacity-100" : "cursor-not-allowed opacity-10"}" ${it._dirty ? "" : "disabled"}>Guardar</button>
        <button data-action="delete" data-id="${it.id}" class="text-xs rounded bg-red-100 text-red-700 px-2 py-1 hover:bg-red-200 cursor-pointer">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  totalCell.textContent = format(calcTotal());

  // (Eliminado: la funcionalidad de copiar ahora solo se maneja por delegación de eventos en tbody.onclick)
}

function addItem({ descripcion, cantidad, precio }) {
  items.push({
    id: crypto.randomUUID(),
    descripcion: descripcion.trim(),
    cantidad: Number(cantidad),
    precio: Number(precio),
  });
  render();
}

async function setProjectAndActividadTitles() {
  const projectTitle = document.getElementById("project-title");
  const actividadTitle = document.getElementById("actividad-title");
  const presupuestoH2 = document.getElementById("presupuesto-title");
    // ...solo renderizado, sin delegación de eventos...
}

// Delegación de eventos para editar, copiar y eliminar ítems (solo una vez, fuera de cualquier función)
tbody.onclick = function(e) {
  const editBtn = e.target.closest('.edit-desc-btn');
  if (editBtn) {
    const id = editBtn.getAttribute('data-id');
    const item = items.find(it => String(it.id) === String(id));
    if (!item) return;
    const modal = document.getElementById('edit-desc-modal');
    const input = document.getElementById('edit-desc-input');
    const saveBtn = document.getElementById('edit-desc-save');
    const cancelBtn = document.getElementById('edit-desc-cancel');
    if (!modal || !input || !saveBtn || !cancelBtn) return;
    input.value = item.descripcion;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    // Limpiar listeners previos
    saveBtn.onclick = null;
    cancelBtn.onclick = null;
    saveBtn.onclick = async () => {
      const nuevaDesc = input.value.trim();
      if (!nuevaDesc) return;
      try {
        const apiBase = config.apiBaseUrl || "/api/";
        const url = apiBase.replace(/\/$/, "") + "/presupuesto_item_update.php";
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: Number(id), descripcion: nuevaDesc }),
        });
        if (!res.ok) throw new Error("Error guardando descripción");
        const data = await res.json();
        if (!data.success) throw new Error("Respuesta inválida del servidor");
        items = items.map(it => it.id === id ? { ...it, descripcion: nuevaDesc } : it);
        render();
        showToast("Descripción actualizada");
      } catch (err) {
        showToast("No se pudo actualizar la descripción", "error");
      } finally {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
      }
    };
    cancelBtn.onclick = () => {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    };
    input.onkeydown = (ev) => {
      if (ev.key === 'Enter') saveBtn.click();
      if (ev.key === 'Escape') cancelBtn.click();
    };
    setTimeout(() => input.focus(), 100);
    return;
  }
  // Copiar descripción
  const copyBtn = e.target.closest('.copy-desc-btn');
  if (copyBtn) {
    const id = copyBtn.getAttribute('data-id');
    const item = items.find(it => String(it.id) === String(id));
    if (item) {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        navigator.clipboard.writeText(item.descripcion)
          .then(() => showToast('Descripción copiada', 'info'))
          .catch(() => showToast('No se pudo copiar', 'error'));
      } else {
        // Fallback para navegadores sin clipboard API
        const temp = document.createElement('textarea');
        temp.value = item.descripcion;
        document.body.appendChild(temp);
        temp.select();
        try {
          document.execCommand('copy');
          showToast('Descripción copiada', 'info');
        } catch {
          showToast('No se pudo copiar', 'error');
        }
        document.body.removeChild(temp);
      }
    }
    return;
  }
  // Guardar cambios de la fila
  const saveBtn = e.target.closest('button[data-action="guardar"]');
  if (saveBtn) {
    const id = saveBtn.getAttribute('data-id');
    const item = items.find(it => String(it.id) === String(id));
    if (!item) return;
    const tr = saveBtn.closest('tr');
    const selUnidad = tr ? tr.querySelector('select[data-field="unidad"]') : null;
    const inpUnidadCustom = tr ? tr.querySelector('input[data-field="unidad-custom"]') : null;
    const inpCantidad = tr ? tr.querySelector('input[data-field="cantidad"]') : null;
    const inpPrecio = tr ? tr.querySelector('input[data-field="precio"]') : null;
    const unidadSel = selUnidad ? selUnidad.value : (item.unidad || 'UND');
    const unidadFinal = unidadSel === 'OTRO' ? (inpUnidadCustom ? String(inpUnidadCustom.value || '').trim() : '') : unidadSel;
    if (unidadSel === 'OTRO' && !unidadFinal) {
      showToast('Especifica la unidad personalizada', 'error');
      if (inpUnidadCustom) inpUnidadCustom.focus();
      return;
    }
    const cantidad = inpCantidad ? Number(inpCantidad.value) : Number(item.cantidad);
    const precio = inpPrecio ? Number(inpPrecio.value) : Number(item.precio);
    if (!Number.isFinite(cantidad) || !Number.isFinite(precio) || cantidad <= 0 || precio <= 0) {
      showToast('La cantidad y el precio deben ser mayores a 0', 'error');
      return;
    }
    const prevText = saveBtn.textContent;
    (async () => {
      try {
        saveBtn.disabled = true;
        saveBtn.textContent = 'Guardando…';
        saveBtn.classList.add('opacity-60', 'cursor-not-allowed');
        saveBtn.classList.remove('cursor-pointer');
        const apiBase = config.apiBaseUrl || '/api/';
        const url = apiBase.replace(/\/$/, '') + '/presupuesto_item_update.php';
        const res = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: Number(id), unidad: unidadFinal, cantidad, precio })
        });
        if (!res.ok) throw new Error('Error guardando ítem');
        const data = await res.json();
        if (!data.success) throw new Error('Respuesta inválida del servidor');
        items = items.map(it => it.id === id ? { ...it, unidad: unidadFinal, cantidad, precio, _dirty: false } : it);
        render();
        showToast('Ítem actualizado');
      } catch (err) {
        console.error(err);
        showToast('No se pudo guardar el ítem', 'error');
      } finally {
        saveBtn.disabled = false;
        saveBtn.textContent = prevText;
        saveBtn.classList.remove('opacity-60', 'cursor-not-allowed');
        saveBtn.classList.add('cursor-pointer');
      }
    })();
    return;
  }
  // Eliminar ítem
  const deleteBtn = e.target.closest('button[data-action="delete"]');
  if (deleteBtn) {
    const id = deleteBtn.getAttribute('data-id');
    const item = items.find(it => String(it.id) === String(id));
    if (!item) return;
    const { modal, textEl, yesBtn, cancelBtn, cardEl } = getDeleteConfirmModal();
    if (!modal || !textEl || !yesBtn || !cancelBtn) return;
    textEl.textContent = item.descripcion;
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    // Animar entrada (fade + scale)
    requestAnimationFrame(() => {
      modal.classList.remove('opacity-0');
      modal.classList.add('opacity-100');
      if (cardEl) {
        cardEl.classList.remove('scale-95');
        cardEl.classList.add('scale-100');
      }
    });
    // Limpiar listeners previos
    yesBtn.onclick = null;
    cancelBtn.onclick = null;
    let onEsc;
    const hide = () => {
      // Animar salida
      modal.classList.remove('opacity-100');
      modal.classList.add('opacity-0');
      if (cardEl) {
        cardEl.classList.remove('scale-100');
        cardEl.classList.add('scale-95');
      }
      setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        if (onEsc) document.removeEventListener('keydown', onEsc);
        modal.onclick = null;
      }, 200);
    };
    cancelBtn.onclick = hide;
    onEsc = (ev) => { if (ev.key === 'Escape') hide(); };
    document.addEventListener('keydown', onEsc);
    modal.onclick = (ev) => { if (ev.target === modal) hide(); };
    yesBtn.onclick = async () => {
      try {
        const apiBase = config.apiBaseUrl || "/api/";
        const url = apiBase.replace(/\/$/, "") + "/presupuesto_item_delete.php";
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: Number(id) })
        });
        if (!res.ok) throw new Error("Error eliminando ítem");
        const data = await res.json();
        if (!data.success) throw new Error("Respuesta inválida del servidor");
        await loadItemsFromBackend();
        render();
        showToast("Ítem eliminado", "info");
      } catch (err) {
        console.error(err);
        showToast("No se pudo eliminar el ítem", "error");
      } finally {
        hide();
      }
    };
    return;
  }
};
// --- FIN DESCARGAR PDF ---
// --- IMPORTAR CONTENIDO UI ---
const importarBtn = document.getElementById("importar-btn");
const importarModal = document.getElementById("importar-modal");
const importarForm = document.getElementById("importar-form");
const importarPresupuestoSelect = document.getElementById("importar-presupuesto-select");
const importarItemsTbody = document.getElementById("importar-items-tbody");
const importarCancel = document.getElementById("importar-cancel");
const importarConfirm = document.getElementById("importar-confirm");
const importarCheckAll = document.getElementById("importar-check-all");

// Mostrar modal
if (importarBtn && importarModal) {
  importarBtn.addEventListener("click", async () => {
    importarModal.classList.remove("hidden");
    importarModal.classList.add("flex");
    await cargarPresupuestosParaImportar();
    importarItemsTbody.innerHTML = '';
  });
}

// Cerrar modal
function cerrarImportarModal() {
  importarModal.classList.add("hidden");
  importarModal.classList.remove("flex");
  importarForm.reset();
  importarItemsTbody.innerHTML = '';
}
if (importarCancel) importarCancel.addEventListener("click", cerrarImportarModal);
if (importarModal) {
  importarModal.addEventListener("click", (e) => {
    if (e.target === importarModal) cerrarImportarModal();
  });
}

// Cargar presupuestos (excepto el actual)
async function cargarPresupuestosParaImportar() {
  if (!importarPresupuestoSelect) return;
  importarPresupuestoSelect.innerHTML = '<option value="">Selecciona…</option>';
  try {
    const apiBase = config.apiBaseUrl || "/api/";
    const url = apiBase.replace(/\/$/, "") + `/presupuestos_by_actividad.php?actividad_id=${encodeURIComponent(actividadId)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error("No se pudieron cargar los presupuestos");
    const presupuestos = await res.json();
    presupuestos.forEach(p => {
      if (String(p.id) !== String(presupuestoId)) {
        const opt = document.createElement('option');
        opt.value = p.id;
        opt.textContent = p.nombre;
        importarPresupuestoSelect.appendChild(opt);
      }
    });
  } catch (e) {
    showToast("Error cargando presupuestos para importar", "error");
  }
}

// Al cambiar el presupuesto, cargar ítems
if (importarPresupuestoSelect) {
  importarPresupuestoSelect.addEventListener("change", async (e) => {
    const id = importarPresupuestoSelect.value;
    importarItemsTbody.innerHTML = '';
    if (!id) return;
    try {
      const apiBase = config.apiBaseUrl || "/api/";
      const url = apiBase.replace(/\/$/, "") + `/presupuesto_item.php?presupuesto_id=${encodeURIComponent(id)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("No se pudieron cargar los ítems");
      const items = await res.json();
      if (!items.length) {
        importarItemsTbody.innerHTML = '<tr><td colspan="4" class="text-center text-zinc-500 py-3">No hay ítems en este presupuesto.</td></tr>';
        return;
      }
      importarItemsTbody.innerHTML = items.map(it => `
        <tr>
          <td class="px-3 py-2 text-center"><input type="checkbox" class="importar-item-check" data-id="${it.id}" data-desc="${encodeURIComponent(it.descripcion)}"></td>
          <td class="px-3 py-2">${it.descripcion}</td>
          <td class="px-3 py-2">${it.unidad || ''}</td>
          <td class="px-3 py-2 text-right">${typeof it.precio !== 'undefined' ? Number(it.precio).toLocaleString('es-MX', { style: 'currency', currency: 'USD' }) : ''}</td>
        </tr>
      `).join('');
    } catch (e) {
      importarItemsTbody.innerHTML = '<tr><td colspan="2" class="text-center text-zinc-500 py-3">Error al cargar ítems.</td></tr>';
    }
  });
}

// Check all
if (importarCheckAll && importarItemsTbody) {
  importarCheckAll.addEventListener("change", () => {
    const checks = importarItemsTbody.querySelectorAll('.importar-item-check');
    checks.forEach(chk => { chk.checked = importarCheckAll.checked; });
  });
}
// --- FIN IMPORTAR CONTENIDO UI ---

// --- IMPORTAR CONTENIDO LOGICA ---
if (importarConfirm && importarItemsTbody) {
  importarConfirm.addEventListener("click", async () => {
    // Obtener ítems seleccionados
    const checks = importarItemsTbody.querySelectorAll('.importar-item-check:checked');
    if (!checks.length) {
      showToast("Selecciona al menos una descripción para importar", "error");
      return;
    }
    const itemsAImportar = Array.from(checks).map(chk => {
      const tr = chk.closest('tr');
      return {
        descripcion: tr ? tr.children[1].textContent : '',
        unidad: tr ? tr.children[2].textContent : '',
        precio: tr ? Number(tr.children[3].textContent.replace(/[^\d.,-]/g, '').replace(',', '.')) : 0,
        cantidad: 1
      };
    });
    if (!presupuestoId) {
      showToast("No hay presupuesto actual definido", "error");
      return;
    }
    try {
      const apiBase = config.apiBaseUrl || "/api/";
      const url = apiBase.replace(/\/$/, "") + "/presupuesto_item_create.php";
      for (const item of itemsAImportar) {
        const res = await fetch(url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            presupuesto_id: Number(presupuestoId),
            descripcion: item.descripcion,
            unidad: item.unidad || 'UND',
            cantidad: 1,
            precio: isNaN(item.precio) ? 0 : item.precio
          })
        });
        if (!res.ok) throw new Error("Error importando ítem");
        const data = await res.json();
        if (!data.success) throw new Error("Error en la respuesta del servidor");
      }
      showToast("Ítems importados correctamente");
      cerrarImportarModal();
      await loadItemsFromBackend();
      render();
    } catch (e) {
      showToast("No se pudieron importar los ítems", "error");
    }
  });
}
// --- FIN IMPORTAR CONTENIDO LOGICA ---
form.addEventListener("submit", (e) => {
  e.preventDefault();
  const fd = new FormData(form);
  const descripcion = String(fd.get("descripcion") || "").trim();
  const unidadSel = String(fd.get("unidad") || "UND").trim() || "UND";
  const unidad = unidadSel === "OTRO" ? String(fd.get("unidad_custom") || "").trim() || "UND" : unidadSel;
  const cantidad = Number(fd.get("cantidad"));
  const precio = Number(fd.get("precio"));
  if (!descripcion || isNaN(cantidad) || isNaN(precio)) return;
  if (!unidad) return;
  if (cantidad <= 0 || precio <= 0) {
    showToast("La cantidad y el precio deben ser mayores a 0", "error");
    return;
  }
  // Ya no es necesario validar actividadId aquí, el presupuesto ya está relacionado a una actividad
  // Enviar al backend para crear el ítem
  (async () => {
    const submitBtn = form.querySelector('button[type="submit"]');
    const prevText = submitBtn ? submitBtn.textContent : "";
    try {
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = "Añadiendo…";
        submitBtn.classList.add("opacity-60", "cursor-not-allowed");
        submitBtn.classList.remove("cursor-pointer");
      }
      const apiBase = config.apiBaseUrl || "/api/";
      const url = apiBase.replace(/\/$/, "") + "/presupuesto_item_create.php";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ presupuesto_id: Number(presupuestoId), descripcion, unidad, cantidad, precio }),
      });
      if (!res.ok) throw new Error("Error creando ítem");
      const data = await res.json();
      if (!data.success) throw new Error("Respuesta inválida del servidor");
      const created = data.item;
      // Añadir al estado y renderizar
      items.push({
        id: String(created.id),
        descripcion: created.descripcion,
        unidad: created.unidad || unidad,
        cantidad: Number(created.cantidad),
        precio: Number(created.precio),
        _dirty: false,
      });
      render();
      showToast("Ítem añadido");
      form.reset();
      if (formUnidadSelect) formUnidadSelect.value = "UND";
      if (formUnidadCustom) {
        formUnidadCustom.value = "";
        formUnidadCustom.classList.add("hidden");
      }
      form.descripcion.focus();
    } catch (err) {
      console.error(err);
      showToast("No se pudo añadir el ítem", "error");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = prevText;
        submitBtn.classList.remove("opacity-60", "cursor-not-allowed");
        submitBtn.classList.add("cursor-pointer");
      }
    }
  })();
});

// Evento para inputs de cantidad y precio en la tabla
function onTbodyNumericChange(e) {
  const target = e.target;
  if (!(target instanceof HTMLInputElement)) return;
  const id = target.getAttribute("data-id");
  const field = target.getAttribute("data-field");
  if (!id || !field) return;
  if (field === "cantidad" || field === "precio") {
    const num = target.value === "" ? 0 : Number(target.value);
    if (Number.isNaN(num)) return;
    items = items.map((it) => (it.id === id ? { ...it, [field]: num, _dirty: true } : it));
    const tr = target.closest("tr");
    if (tr) {
      const btnGuardar = tr.querySelector('button[data-action="guardar"]');
      if (btnGuardar) {
        btnGuardar.disabled = false;
        btnGuardar.classList.remove("cursor-not-allowed");
        btnGuardar.classList.add("cursor-pointer");
        btnGuardar.classList.remove("opacity-10", "opacity-30");
        btnGuardar.classList.add("opacity-100");
      }
      // Actualizar el subtotal (columna 6)
      const updated = items.find((it) => it.id === id);
      const subtotalCell = tr.querySelector("td:nth-child(6)");
      if (updated && subtotalCell) {
        const subtotal = Number(updated.cantidad) * Number(updated.precio);
        subtotalCell.textContent = format(subtotal);
      }
    }
    totalCell.textContent = format(calcTotal());
  }
}

tbody.addEventListener("input", onTbodyNumericChange);
tbody.addEventListener("change", onTbodyNumericChange);

// Cambios en unidad (select) dentro de la tabla
tbody.addEventListener('change', (e) => {
  const target = e.target;
  if (!(target instanceof HTMLSelectElement)) return;
  if (target.getAttribute('data-field') !== 'unidad') return;
  const id = target.getAttribute('data-id');
  const tr = target.closest('tr');
  const custom = tr ? tr.querySelector('input[data-field="unidad-custom"]') : null;
  const val = target.value;
  if (val === 'OTRO') {
    if (custom) custom.classList.remove('hidden');
  } else {
    if (custom) { custom.classList.add('hidden'); custom.value = ''; }
    items = items.map(it => it.id === id ? { ...it, unidad: val, _dirty: true } : it);
  }
  const btnGuardar = tr ? tr.querySelector('button[data-action="guardar"]') : null;
  if (btnGuardar) {
    btnGuardar.disabled = false;
    btnGuardar.classList.remove('cursor-not-allowed');
    btnGuardar.classList.add('cursor-pointer');
    btnGuardar.classList.remove('opacity-10', 'opacity-30');
    btnGuardar.classList.add('opacity-100');
  }
});

// Especificación de unidad personalizada dentro de la tabla
tbody.addEventListener('input', (e) => {
  const target = e.target;
  if (!(target instanceof HTMLInputElement)) return;
  if (target.getAttribute('data-field') !== 'unidad-custom') return;
  const id = target.getAttribute('data-id');
  const tr = target.closest('tr');
  const val = String(target.value || '').trim();
  items = items.map(it => it.id === id ? { ...it, unidad: val, _dirty: true } : it);
  const btnGuardar = tr ? tr.querySelector('button[data-action="guardar"]') : null;
  if (btnGuardar) {
    btnGuardar.disabled = false;
    btnGuardar.classList.remove('cursor-not-allowed');
    btnGuardar.classList.add('cursor-pointer');
    btnGuardar.classList.remove('opacity-10', 'opacity-30');
    btnGuardar.classList.add('opacity-100');
  }
});
// (El listener de guardar y eliminar ahora se maneja por delegación en render)


// --- INICIALIZACIÓN: cargar ítems y renderizar al inicio ---
window.addEventListener('DOMContentLoaded', async () => {
  try {
    await loadItemsFromBackend();
  } catch (e) {
    console.error('Error al cargar ítems iniciales', e);
  }
  render();
});


