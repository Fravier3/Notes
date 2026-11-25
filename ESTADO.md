# Estado

Última actualización: 2026-11-24, Codex.

- Objetivo: PWA para notas con Apple Pencil y sincronización privada en FraviOrg 2.
- Stack: Inknote, Vite, IndexedDB, PDF.js y Supabase Auth, Postgres y Storage.
- Implementado: editor, biblioteca, PWA y adaptador de sincronización.
- Verificado en Supabase: creación, edición, detección de conflictos, cambios incrementales y aislamiento entre cuentas.
- Publicación automática en GitHub Pages desde main mediante GitHub Actions. Vercel conserva un despliegue directo anterior.
- Verificado en Chrome contra https://notes-fran.vercel.app/: creación de nota, trazo con ratón y recuperación visible del trazo después de recargar.
- Apple Pencil usa las coordenadas reales en la curva, con un máximo de 2 px de predicción nativa cuando la dirección es estable. Verificados el límite, la supresión en giros y el punto real con entradas simuladas.
- Pendiente: verificar registro, sincronización entre dispositivos, instalación y trazos con Apple Pencil físico.
- Pruebas: `npm install`, `npm run build`, `npm run preview`. Crear una nota sin red, cerrar y reabrir. Iniciar sesión en dos dispositivos y comprobar cambios y archivos adjuntos.
