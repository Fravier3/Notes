# Estado

Última actualización: 2026-11-24, Codex.

- Objetivo: PWA para notas con Apple Pencil y sincronización privada en FraviOrg 2.
- Stack: Inknote, Vite, IndexedDB, PDF.js y Supabase Auth, Postgres y Storage.
- Implementado: editor, biblioteca, PWA y adaptador de sincronización.
- Verificado en Supabase: creación, edición, detección de conflictos, cambios incrementales y aislamiento entre cuentas.
- Publicación automática en GitHub Pages desde main mediante GitHub Actions. Vercel conserva un despliegue directo anterior.
- Verificado en Chrome contra https://notes-fran.vercel.app/: creación de nota, trazo con ratón y recuperación visible del trazo después de recargar.
- Apple Pencil usa las coordenadas reales en la curva, con un máximo de 2 px de predicción nativa cuando la dirección es estable. Verificados el límite, la supresión en giros y el punto real con entradas simuladas.
- Vista previa de tinta Apple Pencil en el evento de entrada, con repintado limitado al área variable del trazo. Punto de previsualización cuando el navegador entrega eventos de lápiz sin contacto. Verificadas ambas rutas con entradas simuladas.
- Corregido un error que detenía la creación del editor al intentar ocultar el cursor antes de crearlo. El estado de repintado se reinicia al redimensionar el lienzo.
- La pluma normal usa el canal Touch Events de Safari cuando identifica un lápiz, con Pointer Events de respaldo. Pinta segmentos nuevos en lugar de recalcular la curva completa en vivo. Validado con muestras simuladas.
- Pendiente: verificar registro, sincronización entre dispositivos, instalación y trazos con Apple Pencil físico.
- Pruebas: `npm install`, `npm run build`, `npm run preview`. Crear una nota sin red, cerrar y reabrir. Iniciar sesión en dos dispositivos y comprobar cambios y archivos adjuntos.
