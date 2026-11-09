// Se carga en el head para restaurar el tema antes de mostrar la página.
(() => {
  const root = document.documentElement;
  const normalizeTheme = (theme) => (theme === 'light' ? 'light' : 'dark');

  const readTheme = () => {
    try {
      return normalizeTheme(localStorage.getItem('theme'));
    } catch {
      return 'dark';
    }
  };

  const updateControls = () => {
    const dark = root.getAttribute('data-bs-theme') === 'dark';
    const label = dark ? 'Cambiar a tema claro' : 'Cambiar a tema oscuro';

    document.querySelectorAll('[data-theme-toggle]').forEach((button) => {
      button.setAttribute('aria-label', label);
      button.setAttribute('title', label);
      const icon = button.querySelector('i');
      if (icon) icon.className = dark ? 'bi bi-sun-fill' : 'bi bi-moon-fill';
    });
  };

  const applyTheme = (theme) => {
    root.setAttribute('data-bs-theme', normalizeTheme(theme));
    updateControls();
  };

  applyTheme(readTheme());
  document.addEventListener('DOMContentLoaded', updateControls, { once: true });

  document.addEventListener('click', (event) => {
    if (!event.target.closest('[data-theme-toggle]')) return;
    const theme = root.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(theme);
    try {
      localStorage.setItem('theme', theme);
    } catch {
      // El botón sigue funcionando si el navegador bloquea el almacenamiento.
    }
  });

  // Sincroniza otras pestañas y las páginas restauradas por el navegador.
  window.addEventListener('storage', (event) => {
    if (event.key === 'theme' || event.key === null) {
      applyTheme(normalizeTheme(event.newValue));
    }
  });
  window.addEventListener('pageshow', () => applyTheme(readTheme()));
})();
