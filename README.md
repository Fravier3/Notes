# Notes

Cuadernos digitales para iPad y Apple Pencil. Notes parte de [Inknote](https://github.com/ahilgalib/inknote/tree/203f743be88dff3ddc00779611c11064e016108f), con licencia MIT. El editor admite escritura con presión, rechazo de palma, plantillas, carpetas y anotación de PDF. OpenNotes y OwlLuna se usaron como referencias de producto.

Abre Notes en Safari y usa **Compartir → Añadir a pantalla de inicio**. Puedes escribir sin cuenta. Para sincronizar, abre **Sincronización y cuenta** e inicia sesión en todos tus dispositivos con la misma cuenta de Notes. Los cambios se guardan primero en IndexedDB. Cerrar sesión pausa la sincronización y conserva la copia local. La app vincula esa copia a la primera cuenta que uses en ese perfil de navegador.

## Desarrollo

Usa Node 22. Ejecuta `npm install`, `npm run dev` o `npm run build`. Vite publica `dist/`. El lector PDF se carga bajo demanda.

La conexión configurada usa la clave publicable de Supabase. Para usar otro proyecto, define `VITE_SUPABASE_URL` y `VITE_SUPABASE_PUBLISHABLE_KEY` y aplica las migraciones de `supabase/migrations`. Configura la URL de producción como Site URL de Supabase Auth para que el enlace de confirmación de correo regrese a Notes.
