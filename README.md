# Overtime Public (TypeScript)

Frontend público de Overtime migrado a TypeScript.

## Requisitos
- Node 18+

## Variables de entorno
Crea un archivo `.env` basado en `.env.example`:

```
REACT_APP_API_URL=http://localhost:5000/api
```

## Scripts
- `npm install`
- `npm start`
- `npm run build`

## Notas
- Cliente HTTP tipado en `src/utils/apiClient.ts`.
- Tailwind habilitado (ver `tailwind.config.js`).
