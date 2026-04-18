# Guía de Deployment - Landing Page DeGrow

Esta guía te ayudará a publicar la landing page de DeGrow para cumplir con los requisitos de App Store y Google Play.

---

## 📁 Estructura de Archivos

```
landingPage/
├── index.html              # Página principal ⭐
├── privacy.html            # Política de privacidad
├── terms.html              # Términos de servicio
├── README.md               # Documentación técnica
└── DEPLOYMENT_GUIDE.md     # Esta guía
```

---

## 🚀 Opciones de Deployment

### Opción 1: Vercel (Recomendado - Gratis)

**Ventajas**: Gratis, rápido, SSL automático, dominio personalizado

**Pasos**:
```bash
# 1. Instalar Vercel CLI
npm i -g vercel

# 2. Ir a la carpeta
cd landingPage

# 3. Deploy
vercel

# 4. Seguir las instrucciones en pantalla
# - Login con GitHub/GitLab/Bitbucket
# - Confirmar configuración
# - ¡Listo!
```

**Resultado**: Tu landing estará en `https://tu-proyecto.vercel.app`

**Dominio personalizado**:
```bash
vercel domains add degrow.app
```

---

### Opción 2: Netlify (Gratis)

**Ventajas**: Gratis, fácil, SSL automático, CI/CD

**Pasos**:
```bash
# 1. Instalar Netlify CLI
npm i -g netlify-cli

# 2. Ir a la carpeta
cd landingPage

# 3. Deploy
netlify deploy

# 4. Para producción
netlify deploy --prod
```

**O usar la interfaz web**:
1. Ir a https://netlify.com
2. Drag & drop la carpeta `landingPage`
3. ¡Listo!

---

### Opción 3: GitHub Pages (Gratis)

**Ventajas**: Gratis, integrado con GitHub

**Pasos**:
```bash
# 1. Crear repositorio en GitHub
# 2. Subir archivos de landingPage/

git init
git add .
git commit -m "Add landing page"
git remote add origin https://github.com/tu-usuario/degrow-landing.git
git push -u origin main

# 3. En GitHub:
# Settings → Pages → Source: main branch → Save
```

**Resultado**: `https://tu-usuario.github.io/degrow-landing`

---

### Opción 4: Firebase Hosting (Gratis)

**Ventajas**: Gratis, rápido, integrado con Firebase

**Pasos**:
```bash
# 1. Instalar Firebase CLI
npm i -g firebase-tools

# 2. Login
firebase login

# 3. Inicializar
firebase init hosting

# Seleccionar:
# - Public directory: landingPage
# - Single-page app: No
# - GitHub actions: No (opcional)

# 4. Deploy
firebase deploy --only hosting
```

---

## 🔗 Actualizar URLs de las Tiendas

**IMPORTANTE**: Antes de publicar, actualizar estos links en `index.html`:

### Buscar y reemplazar:

```html
<!-- Línea ~52 y ~56 -->
<a href="https://apps.apple.com/app/degrow">
<!-- Cambiar a: -->
<a href="https://apps.apple.com/app/degrow/id[TU_APP_ID]">

<!-- Línea ~54 y ~58 -->
<a href="https://play.google.com/store/apps/details?id=com.degrow">
<!-- Cambiar a: -->
<a href="https://play.google.com/store/apps/details?id=[TU_PACKAGE_ID]">
```

### Cómo obtener los IDs:

**iOS App Store**:
1. Publicar app en App Store Connect
2. Obtener App ID de la URL: `https://apps.apple.com/app/id[ESTE_NUMERO]`

**Google Play**:
1. Publicar app en Google Play Console
2. El Package ID es el que definiste en `app.json`: `com.degrow` o similar

---

## 📝 Checklist Pre-Deployment

### Contenido:
- [ ] Actualizar URLs de App Store y Google Play
- [ ] Verificar que todos los links funcionen
- [ ] Revisar ortografía y gramática
- [ ] Actualizar estadísticas si es necesario (10K+, 4.8, etc.)

### Técnico:
- [ ] Probar en Chrome, Safari, Firefox
- [ ] Probar en móvil (responsive)
- [ ] Probar modo oscuro
- [ ] Verificar que `privacy.html` y `terms.html` funcionen
- [ ] Verificar meta tags (SEO)

### Legal:
- [ ] Revisar Privacy Policy
- [ ] Revisar Terms of Service
- [ ] Actualizar email de contacto si es necesario

---

## 🎨 Personalización Rápida

### Cambiar Colores:

En `index.html`, buscar `:root` (línea ~20):
```css
:root {
    --bg-light: #F3F4F8;      /* Fondo claro */
    --surface-light: #FFFFFF;  /* Tarjetas claras */
    --text-light: #111315;     /* Texto claro */
    /* ... */
}
```

### Cambiar Estadísticas:

Buscar "Stats" (línea ~150):
```html
<div class="stat-value">10K+</div>  <!-- Cambiar aquí -->
<div class="stat-label">Active Users</div>
```

### Cambiar Testimonios:

Buscar "Testimonials" (línea ~250):
```html
<p class="testimonial-quote">Tu testimonio aquí...</p>
<div class="testimonial-author">Nombre</div>
<div class="testimonial-role">Rol</div>
```

---

## 📊 Agregar Google Analytics (Opcional)

1. Crear cuenta en https://analytics.google.com
2. Obtener ID de medición (G-XXXXXXXXXX)
3. Agregar antes de `</head>` en `index.html`:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

---

## 🔍 SEO Básico

### Sitemap (Opcional):

Crear `sitemap.xml`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://degrow.app/</loc>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://degrow.app/privacy.html</loc>
    <priority>0.5</priority>
  </url>
  <url>
    <loc>https://degrow.app/terms.html</loc>
    <priority>0.5</priority>
  </url>
</urlset>
```

### Robots.txt:

Crear `robots.txt`:
```
User-agent: *
Allow: /
Sitemap: https://degrow.app/sitemap.xml
```

---

## 📱 Para App Store Submission

### Información Requerida:

1. **App URL**: `https://tu-dominio.com` (tu landing page)
2. **Privacy Policy URL**: `https://tu-dominio.com/privacy.html`
3. **Terms of Service URL**: `https://tu-dominio.com/terms.html`
4. **Support URL**: `https://tu-dominio.com` o email

### Screenshots:

Tomar screenshots de:
- Hero section
- Features section
- How it works
- Testimonials

Usar para:
- App Store preview
- Google Play preview
- Marketing materials

---

## 🧪 Testing Local

### Método 1: Abrir directamente
```bash
# Abrir index.html en el navegador
open landingPage/index.html  # macOS
start landingPage/index.html # Windows
xdg-open landingPage/index.html # Linux
```

### Método 2: Servidor local
```bash
# Python
cd landingPage
python -m http.server 8000

# Node.js
npx http-server landingPage

# PHP
cd landingPage
php -S localhost:8000
```

Luego visitar: `http://localhost:8000`

---

## 🌍 Dominio Personalizado

### Comprar Dominio:
- Namecheap: https://namecheap.com
- GoDaddy: https://godaddy.com
- Google Domains: https://domains.google

### Configurar DNS:

**Para Vercel**:
```
Type: CNAME
Name: @
Value: cname.vercel-dns.com
```

**Para Netlify**:
```
Type: CNAME
Name: @
Value: [tu-sitio].netlify.app
```

**Para GitHub Pages**:
```
Type: A
Name: @
Value: 185.199.108.153
```

---

## ✅ Checklist Final

### Antes de Publicar:
- [ ] URLs de stores actualizadas
- [ ] Contenido revisado
- [ ] Links probados
- [ ] Responsive verificado
- [ ] Dark mode verificado
- [ ] SEO optimizado
- [ ] Analytics configurado (opcional)

### Después de Publicar:
- [ ] Verificar que el sitio cargue
- [ ] Probar todos los links
- [ ] Verificar en diferentes dispositivos
- [ ] Compartir URL con equipo
- [ ] Agregar URL a App Store/Google Play

---

## 📞 Soporte

### Problemas Comunes:

**"Los links no funcionan"**
- Verificar que `privacy.html` y `terms.html` estén en la misma carpeta

**"El sitio no se ve bien en móvil"**
- Verificar que el viewport meta tag esté presente
- Probar en diferentes tamaños de pantalla

**"Dark mode no funciona"**
- Verificar que el navegador soporte `prefers-color-scheme`
- Probar en diferentes navegadores

### Recursos:
- HTML/CSS: https://developer.mozilla.org/
- Vercel Docs: https://vercel.com/docs
- Netlify Docs: https://docs.netlify.com
- Firebase Docs: https://firebase.google.com/docs/hosting

---

## 🎉 ¡Listo!

Tu landing page está lista para:
- ✅ Submissions a App Store
- ✅ Submissions a Google Play
- ✅ Marketing y publicidad
- ✅ Compartir en redes sociales

**Próximos pasos**:
1. Elegir plataforma de hosting
2. Actualizar URLs de stores
3. Deploy
4. Agregar URL a submissions de apps

**¡Éxito con el lanzamiento!** 🚀
