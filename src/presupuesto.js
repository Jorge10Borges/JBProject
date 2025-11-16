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
  tbody.innerHTML = "";
  items.forEach((it) => {
    const tr = document.createElement("tr");
    tr.className = "hover:bg-zinc-50 transition";

    const subtotal = it.cantidad * it.precio;
    const isKnown = UNIT_OPTIONS.includes(it.unidad);
    const selectedUnit = isKnown ? it.unidad : "OTRO";
    const customUnit = selectedUnit === "OTRO" ? it.unidad || "" : "";

    tr.innerHTML = `
      <td class="px-3 py-2 align-top">
        <div class="flex items-center gap-2 group">
          <span class="block font-medium">${it.descripcion}</span>
          <button title="Editar descripción" class="opacity-0 group-hover:opacity-100 transition cursor-pointer edit-desc-btn" data-action="edit-desc" data-id="${
            it.id
          }" aria-label="Editar descripción">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-edit">
              <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
              <path d="M7 7h-1a2 2 0 0 0 -2 2v9a2 2 0 0 0 2 2h9a2 2 0 0 0 2 -2v-1" />
              <path d="M20.385 6.585a2.1 2.1 0 0 0 -2.97 -2.97l-8.415 8.385v3h3l8.385 -8.415z" />
              <path d="M16 5l3 3" />
            </svg>
          </button>
        </div>
      </td>
      <td class="px-3 py-2 text-right align-top">
        <div class="flex flex-col items-end">
          <select data-id="${
            it.id
          }" data-field="unidad" class="w-24 rounded border border-zinc-300 px-2 py-1 text-right text-sm focus:outline-none focus:ring-2 focus:ring-brand-500">${unitOptionsHTML(
      selectedUnit
    )}</select>
          <input type="text" value="${customUnit}" placeholder="Especificar unidad" data-id="${it.id}" data-field="unidad-custom" class="${
      selectedUnit === "OTRO" ? "" : "hidden"
    } mt-1 w-24 rounded border border-zinc-300 px-2 py-1 text-right text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
        </div>
      </td>
      <td class="px-3 py-2 text-right align-top">
        <input type="number" min="0" step="1" value="${it.cantidad}" data-id="${
      it.id
    }" data-field="cantidad" class="w-20 rounded border border-zinc-300 px-2 py-1 text-right text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
      </td>
      <td class="px-3 py-2 text-right align-top">
        <input type="number" min="0" step="0.01" value="${it.precio}" data-id="${
      it.id
    }" data-field="precio" class="w-24 rounded border border-zinc-300 px-2 py-1 text-right text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
      </td>
      <td class="px-3 py-2 text-right align-top font-medium">${format(subtotal)}</td>
      <td class="px-3 py-2 text-center align-top flex gap-2 justify-center">
        <button data-action="guardar" data-id="${it.id}" class="text-xs rounded bg-brand-100 text-brand-700 px-2 py-1 hover:bg-brand-200 ${
      it._dirty ? "cursor-pointer opacity-100" : "cursor-not-allowed opacity-10"
    }" ${it._dirty ? "" : "disabled"}>Guardar</button>
        <button data-action="delete" data-id="${
          it.id
        }" class="text-xs rounded bg-red-100 text-red-700 px-2 py-1 hover:bg-red-200 cursor-pointer">Eliminar</button>
      </td>
    `;

    tbody.appendChild(tr);
  });
  totalCell.textContent = format(calcTotal());
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

// Eventos
// --- INICIALIZACIÓN PRINCIPAL ---
async function setProjectAndActividadTitles() {
  const projectTitle = document.getElementById("project-title");
  const actividadTitle = document.getElementById("actividad-title");
  const presupuestoH2 = document.getElementById("presupuesto-title");

  try {
    // Si hay id de presupuesto, cargarlo directamente
    if (presupuestoId && presupuestoH2) {
      const res = await fetch((config.apiBaseUrl || "/api/") + `presupuesto_info.php?id=${encodeURIComponent(presupuestoId)}`);
      if (res.ok) {
        const presupuesto = await res.json();
        if (presupuesto && presupuesto.nombre) {
          presupuestoH2.textContent = `Presupuesto: ${presupuesto.nombre}`;
        }
        // Cargar nombre de la actividad asociada si existe
        if (presupuesto && presupuesto.actividades_id && actividadTitle) {
          const resAct = await fetch((config.apiBaseUrl || "/api/") + `actividad_info.php?id=${encodeURIComponent(presupuesto.actividades_id)}`);
          if (resAct.ok) {
            const actividad = await resAct.json();
            if (actividad && actividad.nombre) {
              actividadTitle.textContent = actividad.nombre;
            }
          }
        }
      }
    } else {
      // Lógica anterior si no hay id de presupuesto
      if (projectId && projectTitle) {
        const res = await fetch((config.apiBaseUrl || "/api/") + "projects.php");
        if (res.ok) {
          const projects = await res.json();
          const project = projects.find((p) => String(p.id) === String(projectId));
          if (project) projectTitle.textContent = project.name;
        }
      }
      if (actividadId && actividadTitle) {
        const res = await fetch((config.apiBaseUrl || "/api/") + `actividades.php?project_id=${encodeURIComponent(projectId)}`);
        if (res.ok) {
          const actividades = await res.json();
          const actividad = actividades.find((a) => String(a.id) === String(actividadId));
          if (actividad) actividadTitle.textContent = actividad.nombre;
        }
      }
      if (actividadId && presupuestoH2) {
        const res = await fetch((config.apiBaseUrl || "/api/") + `presupuesto.php?project_id=${encodeURIComponent(projectId)}`);
        if (res.ok) {
          const presupuestos = await res.json();
          const presupuesto = presupuestos.find((p) => String(p.actividad_id) === String(actividadId));
          if (presupuesto && presupuesto.nombre) {
            presupuestoH2.textContent = `Presupuesto: ${presupuesto.nombre}`;
          } else {
            presupuestoH2.textContent = "Presupuesto";
          }
        }
      }
    }
  } catch (e) {
    // Silenciar error
  }
}

(async function init() {
  await setProjectAndActividadTitles();
  await loadItemsFromBackend();
  render();
})();

// --- FIN INICIALIZACIÓN PRINCIPAL ---

// ...existing code...
// --- DESCARGAR PDF ---

let jsPDFLib = null;
let autoTableLib = null;

async function ensureJsPDF() {
  if (!jsPDFLib) {
    jsPDFLib = (await import('jspdf')).jsPDF;
  }
  if (!autoTableLib) {
    autoTableLib = (await import('jspdf-autotable')).default;
  }
}

const descargarPdfBtn = document.getElementById("descargar-pdf-btn");
if (descargarPdfBtn) {
  descargarPdfBtn.addEventListener("click", async () => {
    await ensureJsPDF();
    // Obtener datos del presupuesto actual
    const presupuestoH2 = document.getElementById("presupuesto-title");
    const actividadTitle = document.getElementById("actividad-title");
    const projectTitle = document.getElementById("project-title");
    const fechaHora = new Date();
    const fechaStr = fechaHora.toLocaleDateString();
    const horaStr = fechaHora.toLocaleTimeString();

    // Asegurarse de tener los ítems cargados
    await loadItemsFromBackend();

    // Formato de moneda: miles con punto, decimales con coma
    function formatMoney(num) {
      return Number(num).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    }

    // Crear PDF
    const doc = new jsPDFLib();
    let y = 15;
    doc.setFontSize(16);
    doc.text(projectTitle?.textContent || "", 14, y);
    y += 8;
    doc.setFontSize(12);
    doc.text(actividadTitle?.textContent || "", 14, y);
    y += 8;
    doc.text(presupuestoH2?.textContent || "Presupuesto", 14, y);
    y += 8;
    doc.setFontSize(10);
    doc.text(`Fecha de descarga: ${fechaStr} ${horaStr}`, 14, y);
    y += 8;

    // Tabla de ítems
    const tableData = items.map(it => [
      it.descripcion,
      it.unidad,
      it.cantidad,
      formatMoney(it.precio),
      formatMoney(it.cantidad * it.precio)
    ]);

    // Agregar fila de total
    const total = items.reduce((acc, it) => acc + (Number(it.cantidad) * Number(it.precio)), 0);
    tableData.push([
      { content: 'TOTAL', colSpan: 4, styles: { halign: 'right', fontStyle: 'bold' } },
      { content: formatMoney(total), styles: { fontStyle: 'bold', halign: 'right' } }
    ]);

    autoTableLib(doc, {
      head: [["Descripción", "Unidad", "Cantidad", "P. U.", "Subtotal"]],
      body: tableData,
      startY: y,
      styles: { fontSize: 10 },
      headStyles: { fillColor: [41, 128, 185] },
      margin: { left: 14, right: 14 },
      columnStyles: {
        1: { halign: 'center' }, // Unidad
        2: { halign: 'center' }, // Cantidad
        3: { halign: 'right' },  // P. U.
        4: { halign: 'right' }   // Subtotal
      }
    });

    doc.save(`presupuesto_${presupuestoId || ""}.pdf`);
  });
}
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
  if (!actividadId) {
    showToast("Actividad no definida", "error");
    return;
  }
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
tbody.addEventListener("input", (e) => {
  const target = e.target;
  if (!(target instanceof HTMLInputElement)) return;
  const id = target.getAttribute("data-id");
  const field = target.getAttribute("data-field");
  const value = target.value;
  if (field === "cantidad" || field === "precio") {
    // Actualizar el valor y marcar como dirty
    items = items.map((it) =>
      it.id === id ? { ...it, [field]: Number(value), _dirty: true } : it
    );
    // Habilitar el botón Guardar solo para este ítem
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
      // Recalcular y actualizar el subtotal de esta fila
      const updated = items.find((it) => it.id === id);
      const subtotalCell = tr.querySelector("td:nth-child(5)");
      if (updated && subtotalCell) {
        const subtotal = Number(updated.cantidad) * Number(updated.precio);
        subtotalCell.textContent = format(subtotal);
      }
    }
    // Actualizar el total general
    totalCell.textContent = format(calcTotal());
  }
});
// Evento para el botón Guardar en cada fila
tbody.addEventListener("click", (e) => {
  const btn = e.target.closest('button[data-action="guardar"]');
  if (!btn) return;
  const id = btn.getAttribute("data-id");
  const tr = btn.closest("tr");
  if (!tr || !id) return;
  // Leer valores actuales de la fila
  const cantidadInput = tr.querySelector('input[data-field="cantidad"][data-id="' + id + '"]');
  const precioInput = tr.querySelector('input[data-field="precio"][data-id="' + id + '"]');
  const unidadSelect = tr.querySelector('select[data-field="unidad"][data-id="' + id + '"]');
  const unidadCustom = tr.querySelector('input[data-field="unidad-custom"][data-id="' + id + '"]');
  const cantidad = Number(cantidadInput?.value || 0);
  const precio = Number(precioInput?.value || 0);
  let unidadVal = "UND";
  if (unidadSelect) {
    if (unidadSelect.value === "OTRO") {
      unidadVal = String(unidadCustom?.value || "").trim() || "UND";
    } else {
      unidadVal = String(unidadSelect.value).trim() || "UND";
    }
  }
  // Guardar en backend
  (async () => {
    try {
      const apiBase = config.apiBaseUrl || "/api/";
      const url = apiBase.replace(/\/$/, "") + "/presupuesto_item_update.php";
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: Number(id), cantidad, precio, unidad: unidadVal }),
      });
      if (!res.ok) throw new Error("Error guardando ítem");
      const data = await res.json();
      if (!data.success) throw new Error("Respuesta inválida del servidor");
      // Actualizar estado local
      items = items.map((it) => (it.id === id ? { ...it, cantidad, precio, unidad: unidadVal, _dirty: false } : it));
      // Desactivar botón y cursor
      btn.disabled = true;
      btn.classList.remove("cursor-pointer", "opacity-100");
      btn.classList.add("cursor-not-allowed", "opacity-10");
      // Recalcular subtotal y total
      const subtotalCell = tr.querySelector("td:nth-child(5)");
      if (subtotalCell) subtotalCell.textContent = format(cantidad * precio);
      totalCell.textContent = format(calcTotal());
      showToast("Ítem guardado");
    } catch (err) {
      console.error(err);
      showToast("No se pudo guardar el ítem", "error");
    }
  })();
});
// ...existing code...
