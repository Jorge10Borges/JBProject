// Capa de acceso a variables de entorno y construcción de endpoints
// No expone secretos (sólo variables con prefijo VITE_)

function getEnv(key, fallback = undefined) {
  const value = import.meta.env[key];
  return value !== undefined ? value : fallback;
}

// Detectar entorno y asignar la URL base de API
let apiBaseUrl;
const hostname = window.location.hostname;
if (
  hostname === 'localhost' ||
  hostname === '127.0.0.1' ||
  hostname === '192.168.0.200'
) {
  apiBaseUrl = 'http://192.168.0.200/JBProject/api/';
} else {
  // Cambia esta URL por la de tu dominio/hosting real
  apiBaseUrl = 'https://api.midominio.com/v1/';
}

export const config = {
  apiBaseUrl,
  endpoints: {
    items: getEnv('VITE_API_ITEMS_ENDPOINT', '/items'),
    auth: getEnv('VITE_API_AUTH_ENDPOINT', '/auth/login'),
  },
  debug: getEnv('VITE_DEBUG', 'false') === 'true',
};

export function buildUrl(path) {
  const base = config.apiBaseUrl.replace(/\/$/, '');
  const clean = path.startsWith('/') ? path : `/${path}`;
  return `${base}${clean}`;
}

export function getItemsUrl() {
  return buildUrl(config.endpoints.items);
}

export function getAuthUrl() {
  return buildUrl(config.endpoints.auth);
}
