# Panel de Proyectos

Panel web para ver y actualizar el % de avance de tus proyectos de práctica. Tú y tu tutor podéis entrar a la misma URL y ver los mismos datos, actualizados al instante.

## Cómo está organizado

- `app/page.js` — el panel (tarjetas por proyecto, agrupadas por estado según el % de avance)
- `app/api/projects/route.js` — lista y crea proyectos
- `app/api/projects/[id]/route.js` — actualiza el % o borra un proyecto
- `app/api/projects/[id]/files/route.js` — sube un archivo adjunto a un proyecto
- `app/api/projects/[id]/files/[fileId]/route.js` — borra un archivo adjunto
- `app/api/projects/[id]/comments/route.js` — añade una nota/comentario a un proyecto
- `app/api/projects/[id]/comments/[commentId]/route.js` — borra un comentario
- Los datos se guardan en **Vercel KV** (una base de datos gratuita), así que persisten y las ve cualquiera que abra la URL.
- Los archivos adjuntos se guardan en **Vercel Blob** (almacenamiento de archivos, también gratuito).

Estados según el % de avance:

| % | Estado |
|---|---|
| 0% | 🔴 Sin empezar |
| 1–39% | 🟠 En riesgo |
| 40–84% | 🔵 En curso |
| 85–99% | 🟢 A punto de terminar |
| 100% | ✅ Completado |

## Desplegar en Vercel (paso a paso)

1. **Crea una cuenta gratuita** en [vercel.com](https://vercel.com), lo más fácil es entrar con tu cuenta de GitHub.

2. **Sube esta carpeta (`panel-proyectos/`) a un repositorio de GitHub.** Si no sabes cómo, dile a Claude "sube panel-proyectos a un repo nuevo de GitHub" y te guía.

3. En vercel.com → **Add New → Project** → selecciona ese repositorio → **Deploy**.
   - No hace falta configurar nada más en este paso, Vercel detecta que es un proyecto Next.js automáticamente.
   - El primer deploy dará un error o mostrará el panel vacío/roto porque todavía no hay base de datos conectada — es normal, se soluciona en el paso 4.

4. Dentro del proyecto ya creado en Vercel, ve a la pestaña **Storage → Create Database → KV** (Upstash). Créala y pulsa **Connect** para conectarla a este proyecto. Esto añade automáticamente las variables `KV_REST_API_URL` y `KV_REST_API_TOKEN`.

5. Para poder adjuntar archivos, ve otra vez a **Storage → Create Database** y esta vez elige **Blob**. Créala y **Connect** al proyecto (no hace falta prefijo personalizado aquí, usa el nombre por defecto `BLOB_READ_WRITE_TOKEN`).

6. Ve a la pestaña **Deployments** y haz **Redeploy** del último deploy (para que recoja las nuevas variables de entorno de KV y de Blob).

7. Listo. Vercel te da una URL tipo `https://panel-proyectos-tuusuario.vercel.app` — compártela con tu tutor. Los dos podéis entrar, mover el % de cualquier proyecto, adjuntar archivos o añadir un proyecto nuevo con el botón **+ Añadir proyecto**, y se guarda al momento para ambos.

## Sobre los archivos adjuntos

Se pueden subir archivos de cualquier tipo, varios por proyecto, y borrarlos cuando quieras. Un límite a tener en cuenta: al pasar por una función serverless de Vercel, cada archivo individual no puede superar unos **4.5 MB** (límite del plan gratuito). Para documentos y capturas normales es más que suficiente; si en algún momento necesitas subir archivos más grandes, dile a Claude "los archivos adjuntos son muy grandes, súbelos directo desde el navegador" y se puede migrar a subida directa sin ese límite.

## Probarlo en tu ordenador antes de subirlo (opcional)

Necesitas [Node.js](https://nodejs.org) instalado. Luego:

```bash
npm install
npm run dev
```

Se abre en `http://localhost:3000`. Ojo: en local, sin conectar la base de datos, los cambios no se guardan de forma permanente (solo en memoria hasta que reinicies). Para probar con la base de datos real en local, después de conectar el KV en Vercel ejecuta:

```bash
vercel link
vercel env pull .env.local
```

y vuelve a lanzar `npm run dev`.
