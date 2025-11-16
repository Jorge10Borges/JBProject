# Configuración de Endpoints y Base de Datos

Este proyecto usa variables de entorno prefijadas con `VITE_` para que estén disponibles en el cliente mediante `import.meta.env`.

## Pasos
1. Copia `./.env.example` a `./.env`.
2. Ajusta valores reales (no subir el archivo `.env` al repositorio).
3. Accede a los valores en código con `import.meta.env.VITE_API_BASE_URL`.

## Variables clave
- `VITE_API_BASE_URL`: URL base (ej: https://api.midominio.com/v1)
- `VITE_API_ITEMS_ENDPOINT`: Ruta para gestionar ítems
- `VITE_API_AUTH_ENDPOINT`: Ruta de autenticación
- Parámetros BD (`VITE_DB_*`): Sólo como referencia; no se usan en front directamente (el backend debe manejar credenciales de conexión). 

## Seguridad
- Las credenciales reales de BD NO deben exponerse en el front. Usa estas variables sólo para construir URLs o activar flags.
- Para secretos usa backend y genera tokens temporales para el cliente.

## Ejemplo de construcción de URL
```js
const urlItems = `${import.meta.env.VITE_API_BASE_URL}${import.meta.env.VITE_API_ITEMS_ENDPOINT}`;
```

## Modo debug
`VITE_DEBUG=true` permite activar logs condicionales:
```js
if (import.meta.env.VITE_DEBUG === 'true') {
  console.debug('[DEBUG] Cargando ítems');
}
```
