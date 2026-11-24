# Estado

Última actualización: 2026-11-24, Codex.

- Objetivo: PWA para notas con Apple Pencil y sincronización privada en FraviOrg 2.
- Stack: Inknote, Vite, IndexedDB, PDF.js y Supabase Auth, Postgres y Storage.
- Implementado: editor, biblioteca, PWA y adaptador de sincronización.
- Verificado en Supabase: creación, edición, detección de conflictos, cambios incrementales y aislamiento entre cuentas.
- La compilación de producción pasó en Vercel. El proyecto se publica mediante despliegue directo porque la integración Git de Vercel no tiene acceso a Notes.
- Verificado en Chrome contra https://notes-fran.vercel.app/: creación de nota, trazo con ratón y recuperación visible del trazo después de recargar.
- Pendiente: verificar registro, sincronización entre dispositivos, instalación y trazos con Apple Pencil físico.
- Pruebas: `npm install`, `npm run build`, `npm run preview`. Crear una nota sin red, cerrar y reabrir. Iniciar sesión en dos dispositivos y comprobar cambios y archivos adjuntos.
