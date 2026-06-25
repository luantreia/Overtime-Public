# Análisis y Mejoras: Public Page

## 📊 Estado Actual
- **Avance**: Activa y funcional. Reemplaza a la versión legacy JS.

## 🛑 Funcionalidades Faltantes
1.  **SEO (Search Engine Optimization)**: Al ser una SPA (Single Page App), el SEO es débil. Se necesita Server-Side Rendering (SSR) o pre-rendering para que Google indexe los perfiles de jugadores.
2.  **Live Score**: Widget de "Partido en Vivo" que consuma datos de la mesa de control en tiempo real.
3.  **Ranked Leaderboards**: Página pública dedicada al ranking ELO global.

## 💡 Plan de Mejoras
1.  **Open Graph Tags**: Añadir meta tags dinámicos para que al compartir un link de partido en WhatsApp salga la info correcta (con `react-helmet-async`, sin necesidad de SSR).
2.  **Modo Oscuro/Claro**: Toggle de tema para mejor lectura.

## 🔗 Integración
- Debe ser extremadamente resiliente. Si la API está lenta, esta página debe mostrar "esqueletos" de carga o datos cacheados, nunca pantallas blancas de error.
