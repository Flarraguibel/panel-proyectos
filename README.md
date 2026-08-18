# Panel de Proyectos

Panel web para ver y actualizar el % de avance de tus proyectos de práctica. Tú y tu tutor podéis entrar a la misma URL y ver los mismos datos, actualizados al instante.

## Cómo está organizado

- `app/page.js` — el panel (tarjetas por proyecto, agrupadas por estado según el % de avance)
- `app/api/projects/route.js` — lista y crea proyectos
- `app/api/projects/[id]/route.js` — actualiza el % o borra un proyecto
- Los datos se guardan en **Vercel KV** (una base de datos gratuita), así que persisten y las ve cualquiera que abra la URL.

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

5. Ve a la pestaña **Deployments** y haz **Redeploy** del último deploy (para que recoja las nuevas variables de entorno).

6. Listo. Vercel te da una URL tipo `https://panel-proyectos-tuusuario.vercel.app` — compártela con tu tutor. Los dos podéis entrar, mover el % de cualquier proyecto o añadir uno nuevo con el botón **+ Añadir proyecto**, y se guarda al momento para ambos.

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
