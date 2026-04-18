# DeGrow Landing Page

Landing page estática para DeGrow, separada de la aplicación móvil.

## 📁 Estructura

```
landingPage/
├── index.html          # Página principal
├── privacy.html        # Política de privacidad
├── terms.html          # Términos de servicio
├── README.md           # Este archivo
└── assets/             # Imágenes y recursos (crear si es necesario)
```

## 🚀 Deployment

### Opción 1: Vercel (Recomendado)
```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy desde la carpeta landingPage
cd landingPage
vercel
```

### Opción 2: Netlify
```bash
# Instalar Netlify CLI
npm i -g netlify-cli

# Deploy
cd landingPage
netlify deploy
```

### Opción 3: GitHub Pages
1. Crear repositorio en GitHub
2. Subir contenido de `landingPage/`
3. Activar GitHub Pages en Settings
4. Seleccionar rama y carpeta

### Opción 4: Firebase Hosting
```bash
# Instalar Firebase CLI
npm i -g firebase-tools

# Inicializar
firebase init hosting

# Deploy
firebase deploy --only hosting
```

## 🔗 URLs a Actualizar

Antes de publicar, actualizar estos links en `index.html`:

```html
<!-- App Store -->
<a href="https://apps.apple.com/app/degrow/id[TU_APP_ID]">

<!-- Google Play -->
<a href="https://play.google.com/store/apps/details?id=com.degrow">
```

## 🎨 Personalización

### Colores
Los colores están definidos en `:root` en el `<style>`:
```css
:root {
    --bg-light: #F3F4F8;
    --surface-light: #FFFFFF;
    --text-light: #111315;
    /* ... */
}
```

### Contenido
Editar directamente el HTML para cambiar:
- Títulos y descripciones
- Estadísticas (10K+, 4.8, 100K+)
- Features
- Testimonios
- Links del footer

### Imágenes
Para agregar imágenes:
1. Crear carpeta `assets/`
2. Agregar imágenes
3. Referenciar en HTML: `<img src="assets/screenshot.png">`

## 📱 Responsive

La landing page es completamente responsive:
- Desktop: Grid de 3 columnas
- Tablet: Grid de 2 columnas
- Mobile: 1 columna

## 🌓 Dark Mode

Soporta dark mode automático basado en preferencias del sistema:
```css
@media (prefers-color-scheme: dark) {
    /* Estilos dark mode */
}
```

## 📊 Analytics (Opcional)

Para agregar Google Analytics, añadir antes de `</head>`:

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

## 🔍 SEO

La página incluye:
- ✅ Meta tags básicos
- ✅ Open Graph (Facebook)
- ✅ Twitter Cards
- ✅ Descripción y keywords
- ✅ Título optimizado

Para mejorar SEO:
1. Agregar `sitemap.xml`
2. Agregar `robots.txt`
3. Optimizar imágenes (WebP, lazy loading)
4. Agregar structured data (JSON-LD)

## 🧪 Testing

### Local
Abrir `index.html` directamente en el navegador.

### Con servidor local
```bash
# Python
python -m http.server 8000

# Node.js
npx http-server

# PHP
php -S localhost:8000
```

Luego visitar: `http://localhost:8000`

## ✅ Checklist Pre-Launch

- [ ] Actualizar URLs de App Store y Google Play
- [ ] Actualizar estadísticas con datos reales
- [ ] Agregar screenshots de la app
- [ ] Crear páginas de Privacy y Terms
- [ ] Configurar dominio personalizado
- [ ] Agregar Google Analytics
- [ ] Probar en diferentes navegadores
- [ ] Probar en diferentes dispositivos
- [ ] Optimizar imágenes
- [ ] Configurar SSL/HTTPS

## 📞 Soporte

Para modificaciones o preguntas, consultar:
- HTML/CSS: https://developer.mozilla.org/
- Deployment: Documentación de cada plataforma
- SEO: https://developers.google.com/search

## 🎉 Resultado

Landing page lista para:
- ✅ Submissions a App Store
- ✅ Submissions a Google Play
- ✅ Marketing y publicidad
- ✅ Redes sociales
- ✅ Campañas de email

**¡Lista para lanzamiento!** 🚀
