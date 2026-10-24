# Remolino Folklórico — Sitio web oficial

Sitio web del ballet folclórico **Remolino Folklórico**, un grupo integrado por mujeres que lleva el folclor a cada escenario. Incluye sitio público, panel de administración, galería, eventos, página de contrataciones y gestión de mensajes.

## 🚀 Stack

- **Framework:** [Astro](https://astro.build) 7 (modo híbrido: sitio público estático + panel SSR)
- **UI:** React (solo para componentes interactivos del panel)
- **Base de datos:** [Neon](https://neon.tech) (Postgres serverless)
- **ORM:** [Drizzle](https://orm.drizzle.team)
- **Autenticación:** [Better Auth](https://better-auth.com) (email + contraseña)
- **Almacenamiento de imágenes:** [Vercel Blob](https://vercel.com/docs/storage/vercel-blob)
- **3D:** [Three.js](https://threejs.org) (remolino de partículas en el hero)
- **Deploy:** [Vercel](https://vercel.com)
- **Tipografías:** Fraunces (títulos) e Inter (cuerpo), vía Google Fonts

## 📁 Estructura del proyecto

/
├── public/                    # Archivos estáticos (favicon, og-default.jpeg, robots.txt)
├── src/
│   ├── components/            # Componentes reutilizables
│   │   ├── RemolinoCanvas.astro   # Remolino 3D con Three.js
│   │   └── ScrollReveal.astro     # Animaciones de scroll
│   ├── db/                    # Base de datos
│   │   ├── index.js               # Conexión a Neon con Drizzle
│   │   └── schema.js              # Tablas: user, session, account, eventos, galeria, mensajes
│   ├── layouts/               # Layouts
│   │   ├── layout.astro           # Layout público (header, footer, Open Graph)
│   │   └── AdminLayout.astro      # Layout del panel (navbar, badge de no leídos)
│   ├── lib/
│   │   └── auth.js                # Configuración de Better Auth
│   ├── pages/                 # Rutas del sitio
│   │   ├── index.astro            # Inicio (hero con remolino 3D, imagen destacada)
│   │   ├── nosotros.astro         # Historia del grupo (reseña completa)
│   │   ├── galeria.astro          # Galería pública con imagen destacada
│   │   ├── eventos.astro          # Próximos eventos
│   │   ├── contrataciones.astro   # Servicios + formulario de contacto
│   │   ├── login.astro            # Login del panel
│   │   ├── admin/                 # Panel de administración
│   │   │   ├── index.astro            # Listado de eventos
│   │   │   ├── galeria.astro          # Gestión de galería
│   │   │   ├── mensajes.astro         # Gestión de consultas
│   │   │   └── eventos/
│   │   │       ├── nuevo.astro        # Crear evento
│   │   │       └── [id].astro         # Editar evento
│   │   └── api/                   # Endpoints
│   │       ├── auth/[...all].js       # Handler de Better Auth
│   │       ├── eventos/
│   │       │   ├── index.js           # POST crear evento
│   │       │   └── [id].js            # PUT editar / DELETE borrar
│   │       ├── galeria/
│   │       │   ├── index.js           # POST crear imagen
│   │       │   └── [id].js            # PATCH sección / DELETE borrar
│   │       ├── mensajes/[id].js       # PATCH marcar leído / DELETE borrar
│   │       ├── upload.js              # Subida de imágenes a Vercel Blob
│   │       └── contacto.js            # POST formulario de contrataciones
│   ├── styles/
│   │   └── global.css             # Variables CSS, tipografía, utilidades
│   ├── middleware.js              # Protección de /admin
│   └── env.d.ts                   # Tipos de Astro.locals
├── astro.config.mjs
├── drizzle.config.js
├── package.json
└── tsconfig.json

⚙️ Variables de entorno
Creá un archivo .env en la raíz con estas variables:


# Base de datos (Neon)
DATABASE_URL="postgresql://user:pass@host/db?sslmode=require"

# Better Auth
BETTER_AUTH_SECRET="string-largo-aleatorio-de-minimo-32-caracteres"
BETTER_AUTH_URL="http://localhost:4321"

# Vercel Blob (subida de imágenes)
BLOB_READ_WRITE_TOKEN="vercel_blob_rw_..."
BLOB_STORE_ID="store_..."
En producción (Vercel), cambiá BETTER_AUTH_URL por la URL real del sitio:
BETTER_AUTH_URL="https://remolino-folklorico.vercel.app"

🗄️ Base de datos
Tablas
Tabla	Descripción
user	Usuarios del panel (Better Auth)
session	Sesiones activas (Better Auth)
account	Cuentas y credenciales (Better Auth)
verification	Verificaciones de email (Better Auth)
eventos	Próximas presentaciones (título, lugar, fecha, hora)
galeria	Imágenes (alt, url, sección: inicio, nosotros, galeria_destacada, eventos)
mensajes	Consultas del formulario de contrataciones (con estado leído/no leído)
Migraciones
Después de modificar src/db/schema.js:


npx drizzle-kit push
Eso sincroniza el esquema con Neon y crea/modifica las tablas necesarias.

Crear el usuario admin
Better Auth no crea usuarios por defecto. Para crear el primero, con el servidor corriendo, ejecutá en la consola del navegador (en http://localhost:4321/login):


fetch('/api/auth/sign-up/email', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'tu@email.com',
    password: 'contraseña-segura',
    name: 'Nombre',
  }),
})
  .then((r) => r.json())
  .then(console.log);
Una vez creado, podés deshabilitar el registro público en src/lib/auth.js:


emailAndPassword: {
  enabled: true,
  disableSignUp: true,
},
🧞 Comandos
Todos los comandos se ejecutan desde la raíz del proyecto:

Comando	Acción
npm install	Instala dependencias
npm run dev	Inicia el servidor de desarrollo en localhost:4321
npm run build	Genera el build de producción en ./dist/
npm run preview	Previsualiza el build localmente
npx drizzle-kit push	Sincroniza el esquema con Neon
npm run astro ...	Ejecuta comandos del CLI de Astro
npm run astro -- --help	Ayuda del CLI de Astro

🎨 Funcionalidades del sitio público
Inicio: hero con remolino 3D (Three.js) que reacciona al mouse, texto con entrada escalonada, sección de esencia con imagen destacada desde la galería, CTA de contrataciones con botón de WhatsApp y link a la página completa.

Nosotros: historia completa del grupo dividida en secciones (origen, iniciativa, primeros pasos, presente) con frases destacadas y valores reales (Amistad, Iniciativa, Comunidad).

Galería: imagen destacada grande + grilla de imágenes, todas desde Neon.

Eventos: listado de próximas presentaciones desde Neon, ordenadas por fecha.

Contrataciones: servicios ofrecidos, qué incluye, formulario de contacto que guarda en Neon, y botón de WhatsApp.

Animaciones: scroll reveal, entrada escalonada del hero, nav con subrayado animado, hover en botones e imágenes.

Accesibilidad: prefers-reduced-motion respetado (las animaciones se desactivan si el usuario lo pide).

🔐 Panel de administración
Accesible en /admin (requiere login). Incluye:

Eventos: crear, editar y eliminar presentaciones.

Galería: subir imágenes (arrastrar o seleccionar), elegir sección donde se muestran (Inicio, Nosotros, Destacada en Galería, Eventos, o solo galería), cambiar la sección de una imagen ya subida, y eliminar.

Mensajes: ver consultas del formulario, marcar como leído, borrar, responder por email o WhatsApp. Badge con cantidad de no leídos en el navbar.

🌐 SEO y Open Graph
Open Graph + Twitter Card en el Layout.astro, con imagen por defecto og-default.jpeg (1200×630).

Canonical en cada página.

Favicon completo (apple-touch-icon, favicon-32x32, favicon-16x16, manifest).

Tagline en el footer: "Mujeres unidas por la danza, la amistad y el amor por nuestras tradiciones."

Para verificar cómo se ve la tarjeta al compartir, usá el Facebook Sharing Debugger o el LinkedIn Post Inspector. Si la imagen no aparece, hacé clic en "Scrape Again" para forzar la relectura.

🚢 Deploy en Vercel
Conectá el repositorio de GitHub a Vercel.

Vercel detecta Astro automáticamente.

Configurá las variables de entorno en Settings → Environment Variables:

DATABASE_URL

BETTER_AUTH_SECRET

BETTER_AUTH_URL (con la URL de producción)

BLOB_READ_WRITE_TOKEN

Hacé clic en Deploy.

Cada push a main redeploya automáticamente.

📝 Notas técnicas
Modo híbrido: el sitio público se genera estático en el build (rápido, cacheado en CDN), pero las páginas que consultan Neon (/, /galeria, /nosotros, /eventos, /contrataciones, /admin/*) usan export const prerender = false; para renderizarse en el servidor y reflejar los cambios al instante.

Imágenes: se suben a Vercel Blob (almacenamiento público) y se guarda la URL en Neon. No se suben al repositorio.

Auth: la sesión se guarda en una cookie better-auth.session_token. El middleware protege /admin y redirige a /login si no hay sesión.

3D: el remolino usa Three.js con partículas en espiral. Se pausa cuando no está en viewport y respeta prefers-reduced-motion.

👀 Más información
Documentación de Astro

Documentación de Drizzle

Documentación de Better Auth

Documentación de Neon

Documentación de Vercel Blob
