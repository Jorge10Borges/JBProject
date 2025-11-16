class AppSideNav extends HTMLElement {
  connectedCallback() {
    this.active = this.getAttribute('data-active') || document.body.dataset.active || '';
    this.render();
    this.setupListeners();
  }

  render() {
    const open = document.body.dataset.sidebarOpen === 'true';
    const collapsed = document.body.dataset.sidebarCollapsed === 'true';

    const widthCls = collapsed ? 'md:w-20' : 'md:w-56';
    const baseClasses = `fixed md:static left-0 top-0 z-50 flex flex-col gap-1 p-4 ${widthCls} bg-brand-SlateBlue text-white min-h-dvh transition-transform md:translate-x-0`;
    const mobileHidden = open ? 'translate-x-0' : '-translate-x-full';

    const backdropCls = open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none';
    
    /* Iconos Menu */
    /* Dashboard */
    const iconDashboard = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-layout-dashboard"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M5 4h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-6a1 1 0 0 1 1 -1" /><path d="M5 16h4a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-2a1 1 0 0 1 1 -1" /><path d="M15 12h4a1 1 0 0 1 1 1v6a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-6a1 1 0 0 1 1 -1" /><path d="M15 4h4a1 1 0 0 1 1 1v2a1 1 0 0 1 -1 1h-4a1 1 0 0 1 -1 -1v-2a1 1 0 0 1 1 -1" /></svg>`;
    /* Presupuesto */
    const iconPresupuesto = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-message-2-dollar"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M8 9h8" /><path d="M8 13h6" /><path d="M13.5 19.5l-1.5 1.5l-3 -3h-3a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v3.5" /><path d="M21 15h-2.5a1.5 1.5 0 0 0 0 3h1a1.5 1.5 0 0 1 0 3h-2.5" /><path d="M19 21v1m0 -8v1" /></svg>`;
    /* Presupuestos */
    const iconProyectos = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-password-user"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M12 17v4" /><path d="M10 20l4 -2" /><path d="M10 18l4 2" /><path d="M5 17v4" /><path d="M3 20l4 -2" /><path d="M3 18l4 2" /><path d="M19 17v4" /><path d="M17 20l4 -2" /><path d="M17 18l4 2" /><path d="M9 6a3 3 0 1 0 6 0a3 3 0 0 0 -6 0" /><path d="M7 14a2 2 0 0 1 2 -2h6a2 2 0 0 1 2 2" /></svg>`;
    /* Expandir */
    const iconExpand = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-arrow-bar-to-right-dashed"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M14 12l-10 0" /><path d="M14 12l-4 4" /><path d="M14 12l-4 -4" /><path d="M20 4l0 3m0 13l0 -3m0 -3.5l0 -3" /></svg>`;
    /* Contraer */
    const iconContract = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1" stroke-linecap="round" stroke-linejoin="round" class="icon icon-tabler icons-tabler-outline icon-tabler-arrow-bar-to-left-dashed"><path stroke="none" d="M0 0h24v24H0z" fill="none"/><path d="M10 12l10 0" /><path d="M10 12l4 -4" /><path d="M10 12l4 4" /><path d="M4 20l0 -3m0 -13l0 3m0 3.5l0 3" /></svg>`;

    this.innerHTML = `
      <button id="menu-toggle" aria-controls="app-sidenav" aria-expanded="${open}"
        class="md:hidden fixed top-1 left-1 z-50 rounded bg-brand-600 p-2 text-white shadow focus:outline-none focus:ring-2 focus:ring-brand-400">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" class="size-6">
          <path d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" stroke="currentColor" stroke-linecap="round" stroke-width="2" />
        </svg>
      </button>

      <div id="backdrop" class="md:hidden fixed inset-0 z-40 bg-black/40 transition-opacity ${backdropCls}"></div>

      <nav id="app-sidenav" class="${baseClasses} ${mobileHidden} md:shrink-0" role="navigation" aria-label="Sidebar">
        <div class="mb-4 flex items-center justify-between">
          <span class="text-sm font-semibold tracking-wide">Panel</span>
          <div class="flex items-center gap-2">
            <button class="hidden md:inline-flex rounded px-2 py-1 hover:text-white" data-collapse>
              ${collapsed ? iconExpand : iconContract}
            </button>
            <button class="md:hidden rounded px-2 py-1 text-xs bg-brand-600 hover:bg-brand-700" data-close>✕</button>
          </div>
        </div>
        ${this.link('Dashboard','index.html','home', iconDashboard, collapsed)}
        ${this.link('Proyectos','proyectos.html','proyectos', iconProyectos, collapsed)}
        ${this.link('Contabilidad','contabilidad.html','contabilidad', iconDashboard, collapsed)}
      </nav>
    `;
  }

  link(label, href, id, icon, collapsed) {
    const isActive = this.active === id;
    // Oculta solo en md+ cuando está colapsado
    const labelCls = collapsed ? 'hidden md:inline-block md:whitespace-nowrap md:overflow-hidden md:w-0' : '';
    return `
      <a href="${href}" class="rounded px-3 py-2 text-sm block ${isActive ? 'bg-brand-Glaucous' : 'hover:bg-brand-Glaucous/55'}">
        <div class="flex items-center">
          <div class="icon mr-2">
            ${icon}
          </div>
          <span class="label ${labelCls}">${label}</span>
        </div>
      </a>`;
  }

  setupListeners() {
    // Delegación de eventos robusta para botones (soporta SVG y anidados)
    this.addEventListener('click', (e) => {
      const btn = e.target.closest('button');
      if (btn) {
        if (btn.id === 'menu-toggle') {
          const current = document.body.dataset.sidebarOpen === 'true';
          document.body.dataset.sidebarOpen = current ? 'false' : 'true';
          this.render();
          return;
        }
        if (btn.dataset.close !== undefined) {
          document.body.dataset.sidebarOpen = 'false';
          this.render();
          return;
        }
        if (btn.dataset.collapse !== undefined) {
          const current = document.body.dataset.sidebarCollapsed === 'true';
          document.body.dataset.sidebarCollapsed = current ? 'false' : 'true';
          this.render();
          return;
        }
      }
      // Cerrar menú móvil al hacer clic en backdrop
      if (e.target && e.target.id === 'backdrop') {
        document.body.dataset.sidebarOpen = 'false';
        this.render();
        return;
      }
      // Cerrar menú móvil al navegar
      const link = e.target.closest('a');
      if (link && window.innerWidth < 768) {
        document.body.dataset.sidebarOpen = 'false';
        // No renderizar aquí para evitar parpadeo
      }
    });

    document.addEventListener('sidebar:toggle', () => {
      const current = document.body.dataset.sidebarOpen === 'true';
      document.body.dataset.sidebarOpen = current ? 'false' : 'true';
      this.render();
    });

    window.addEventListener('resize', () => {
      if (window.innerWidth >= 768) {
        document.body.dataset.sidebarOpen = 'true';
        this.render();
      }
    });
  }
}
customElements.define('app-side-nav', AppSideNav);
