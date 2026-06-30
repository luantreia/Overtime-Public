# Ideas — Overtime Public

## 0. Partidos en vivo (PRIORIDAD)

**El gancho de adquisición más fuerte disponible ahora mismo.**

Durante un partido en el club hay 25 personas con el teléfono en la mano. Si pueden ver el marcador en vivo, la app está abierta mientras juegan o miran — y se la muestran a los que no la tienen.

La arquitectura ya existe y está casi lista para conectar:
- `Overtime-Partido` opera el scoreboard desde la cancha vía Socket.IO
- El backend ya tiene `roomRegistry` para broadcast entre rooms
- `Overtime-Public` ya tiene el cliente de socket (`src/shared/utils/socket.ts`)

Lo que falta: que `Overtime-Public` se suscriba a los eventos del partido en curso y muestre el marcador en vivo en la página del partido. El operador sigue usando `Overtime-Partido` como siempre — solo se agrega un canal de salida más.

**Por qué primero:** es el único momento donde la adquisición pasa sola. La gente que no tiene la app la descarga en el momento porque quiere ver el score.

## 1. Mostrar el deporte, no la base de datos

El sitio hoy es listas y números. Nadie se engancha con una base de datos. La gente se engancha viendo a otros divertirse.

**Ideas:**

1. **Videos de partidos en cada página de Partido** — agregar un campo `youtube_url` al modelo `Partido`. Si está cargado, mostrar el video embedido arriba de las estadísticas. El usuario que carga el partido (o el admin) puede pegar el link de YouTube. Bajo esfuerzo, alto impacto visual.

2. **"Últimos highlights" en la landing** — sección debajo del hero que muestre los 3-5 partidos más recientes que tienen video, como cards con thumbnail de YouTube. Sin video cargado, la sección no aparece (no hay estado vacío feo).

3. **Galería/videos en el perfil de Equipo** — además de stats, cada equipo puede tener links a sus mejores videos. Lo cargan ellos mismos. Convierte la página de equipo en algo que da ganas de mostrar.

4. **Página "¿Qué es dodgeball?"** — una sola página estática con 2-3 videos curados (jugadas épicas, momentos divertidos, algo de una competencia local) + descripción breve del deporte. No necesita backend, es contenido fijo que se puede actualizar cada tanto.

5. **Partido destacado de la semana** — un partido manual o automático (el más visto, el de mayor puntaje, el más reciente con video) que aparece destacado en la landing. Si tiene video, se muestra grande. Genera el hábito de volver a ver qué hay nuevo.

---

## 2. Mensaje de por qué jugar dodgeball

Hoy no hay ningún texto en el sitio que convenza a alguien de probar. Se asume que ya querés jugar.

**El mensaje central debería ser:** dodgeball es fácil de empezar, físicamente accesible, social, y más competitivo de lo que parece.

**Ideas:**

1. **Sección "3 razones para jugar" en la landing** — tres cards visuales, simples:
   - 🏃 *Sin experiencia previa* — "Aprendés jugando. El primer partido es el mejor tutorial."
   - 👥 *Es un deporte de equipo de verdad* — "Estrategia, comunicación, y risas garantizadas."
   - 🏆 *Tan casual o competitivo como quieras* — "Desde un pickup en el parque hasta ligas con ranking ELO."

2. **Testimonios reales de jugadores** — 2-3 quotes cortas de personas que empezaron sin saber nada. "Vine a probar una vez y ya llevo 2 años jugando." Datos reales, fotos reales, nombres reales. Se pueden sacar de jugadores ya en la plataforma.

3. **"Preguntas frecuentes" para no jugadores** — sección colapsable con dudas reales: ¿Necesito estar en forma? ¿Qué ropa uso? ¿Cuánto cuesta? ¿Puedo ir solo? Las respuestas son tranquilizadoras y eliminan fricción antes de que alguien llegue al primer partido.

4. **El "viaje del jugador" en la landing** — un pequeño diagrama o stepper de 3 pasos: *Encontrá un partido → Probá gratis → Sumáte a un equipo*. Muestra que hay un camino claro desde cero. La Plaza es el paso 1.

5. **Contador de jugadores nuevos este mes** — "Este mes se sumaron X jugadores nuevos a Overtime." Si el número es bueno, genera FOMO y prueba social. Va bien cerca del CTA de registro.

---

## 3. La Plaza como puerta de entrada principal

La Plaza es el único feature que puede convertir a alguien que nunca jugó en alguien que juega este fin de semana. Hoy está enterrada en un dropdown.

El potencial extra: los equipos tienen canchas fijas donde entrenan, los partidos oficiales se juegan en lugares reales. Toda esa información geográfica podría estar en un solo mapa.

**Ideas:**

1. **Mapa de canchas y espacios de juego** — un mapa (ya tenemos Leaflet) que muestre no solo lobbies activos de La Plaza, sino también las sedes donde entrenan equipos y se juegan partidos oficiales. Cada equipo podría tener una `sede` con dirección y coordenadas. El mapa se ve sin login: "Hay dodgeball a X km de tu casa."

2. **Horarios de juego abierto por equipo** — cada equipo puede publicar sus horarios de entrenamiento abierto (días, hora, lugar). Se muestra en su página de perfil y se agrega a una vista de agenda semanal global: "Esta semana podés jugar en estos horarios." No requiere registro para verlo.

3. **"Jugá este fin de semana" en la landing** — widget que muestra los próximos lobbies de La Plaza + horarios de juego abierto de equipos, ordenados por proximidad (si el usuario permite GPS) o por fecha. Visible sin login. Es la respuesta concreta a "¿cómo empiezo?".

4. **Directorio de "Espacios de juego"** — una sección nueva (o parte de La Plaza) con las canchas/gimnasios/parques donde se practica dodgeball: dirección, fotos, qué equipos entrenan ahí, si hay juego abierto, costo si lo hay. Útil para alguien que quiere ir a ver antes de jugar.

5. **CTA en la landing vinculado al mapa** — en lugar del botón genérico "Explorar" o "Registrarme", un botón que diga "Ver partidos cerca tuyo →" y abra el mapa de La Plaza centrado en la ubicación del usuario (o Buenos Aires por defecto). Hace tangible en 2 segundos que hay actividad real cerca.

---

## 4. Calendario de actividades

El mapa te sitúa **espacialmente** (dónde hay dodgeball), el calendario te sitúa **temporalmente** (cuándo podés ir). Son complementarios y juntos responden la pregunta completa de alguien que quiere empezar a jugar o seguir la actividad.

**Qué mostraría:**
- Partidos oficiales de competencias (ya están en la base de datos)
- Entrenamientos abiertos de equipos (horario fijo semanal, lo cargan los DTs)
- Lobbies de La Plaza confirmados
- Eventos especiales (torneos, clínicas, exhibiciones)

**Ideas:**

1. **Vista de agenda semanal en la landing** — una semana hacia adelante con todo lo que está programado, sin login. "Esta semana en Overtime" como sección debajo del hero. Hace que la plataforma se sienta viva incluso con pocos usuarios.

2. **Calendario mensual en una página dedicada** — vista tipo Google Calendar con los distintos tipos de actividad en colores diferentes. Clickeable: cada evento abre el partido, el lobby, o el perfil del equipo correspondiente.

3. **Filtros por tipo y zona** — el calendario acepta los mismos filtros que el mapa (ciudad, modalidad, categoría) para que cada usuario vea solo lo relevante para él.

4. **"Agregar a mi calendario"** — botón para exportar un partido o entrenamiento como `.ics` (compatible con Google Calendar, Apple Calendar). El usuario no tiene que acordarse de volver — el evento le aparece en su calendario personal.

5. **Mapa + Calendario como dos vistas del mismo contenido** — una sola página "Actividad" con toggle entre vista mapa y vista calendario, mostrando los mismos datos. El usuario elige cómo prefiere explorar.

---

## 5. Convertir usuarios en canal de distribución

Los 25 usuarios actuales son el mejor canal de marketing disponible. Cada uno tiene amigos que juegan o podrían jugar. El objetivo es darles algo que quieran compartir.

1. **Card de ranking compartible** — botón "Compartir mi posición" que genera una imagen lista para Instagram (nombre, foto, posición actual, ELO). Ya tenemos `html-to-image`. Si alguien está 3ro en el ranking, lo quiere postear. Cada post llega a audiencia segmentada con amigos que probablemente también juegan.

2. **Card de resultado compartible** — al cargar un resultado, generar automáticamente una imagen con el marcador final y los jugadores. El equipo ganador siempre la postea. Reemplaza las capturas de pantalla que ya circulan por WhatsApp e Instagram.

3. **Página de partido como hub pre y post** — antes del partido: "El sábado juegan X vs Y" con URL shareable para generar anticipación. Después: resultado, stats individuales, destacados. Que esa URL sea lo que se comparte, no una captura.

4. **QR en el club** — poster o sticker en la cancha: "Seguí el partido en vivo →" con QR que abre directo a la página del partido activo. Puente físico-digital en el momento de mayor engagement. Costo: imprimir un papel.

5. **Invitación directa** — desde el perfil o desde el ranking, un botón "Invitá a un amigo" que genera un link con contexto: "Luan te invita a unirte a Overtime — ya hay X jugadores en tu zona." Reduce la fricción de explicar qué es la plataforma.

---

## 6. Retención — que la gente vuelva sola

1. **Notificaciones de resultado** — cuando se carga un resultado, los jugadores de ese partido reciben una notificación automática. No tienen que acordarse de abrir la app, la app los llama cuando hay algo nuevo para ellos.

2. **Ranking con movimiento visible** — mostrar flechas de variación (↑3 ↓1), racha actual ("5 victorias seguidas"), y puntos de diferencia con el siguiente puesto. El ranking deja de ser un dato estático y se convierte en una historia que avanza. La gente vuelve a mirar.

3. **Feed de actividad reciente** — en la landing o sección propia: "Hace 2h — Equipo X ganó 3-1 · Jugador Y subió al top 5 · Nuevo torneo anunciado". Hace que la plataforma se sienta viva aunque haya pocos usuarios. El contenido lo genera la actividad que ya existe.

4. **"Seguir" equipos o jugadores** — suscribirse a un equipo para recibir notificaciones de sus resultados y próximos partidos. Crea el hábito de volver sin depender de que el usuario se acuerde.

5. **Onboarding post-registro** — hoy alguien se registra y llega a un perfil vacío sin saber qué hacer. Un flujo de 3 pasos: "Buscate en el directorio → Reclamá tu perfil → Ya estás en el ranking." Cierra el loop entre registrarse y sentirse parte de la comunidad.

---

## 7. Engagement y comunidad

1. **Logros y badges** — hitos desbloqueables por actividad: "Primer partido", "10 victorias", "MVP 3 veces seguidas", "Temporada completa sin ausencias". No afectan el ranking pero dan satisfacción personal y algo para mostrar en el perfil. Enganchan especialmente a jugadores nuevos que están lejos del top pero sí pueden coleccionar logros.

2. **Head-to-head entre equipos** — en la página de partido o equipo, mostrar el historial directo: "Club X vs Club Y — 4 victorias, 2 derrotas, último partido hace 3 semanas". Convierte cada partido en algo con historia y stakes. Muy shareable antes de un clásico.

3. **Comparación de jugadores** — elegís dos jugadores y ves sus stats lado a lado. Clásico de apps deportivas (FIFA, NBA). Genera debate, es fácil de compartir, y hace que la gente explore perfiles que no son el propio.

4. **Widget "Tu próximo partido"** — para usuarios logueados, un banner persistente siempre visible: "Próximo partido — Sábado 14:00 vs Equipo Y · Faltan 3 días". Crea anticipación y trae a la gente de vuelta sin notificación push. Si hay un partido en vivo, lo reemplaza con el marcador en tiempo real.

5. **Resumen de temporada** — al cerrar una competencia, una página autogenerada con la historia de la temporada: evolución del ranking semana a semana, racha más larga, goleadores, partido más reñido. Algo para compartir que celebra la temporada completa. Los jugadores la guardan, la muestran, y los que no participaron quieren estar en la próxima.

6. **Botón "Quiero jugar"** — en la página de un equipo o competencia, un botón simple que registra el interés y notifica al DT o al organizador, sin abrir el flujo completo de solicitud. Convierte visitantes pasivos en leads concretos sin fricción.

---

## 8. Gamificación y comunidad interactiva

Ideas para que la gente participe aunque no esté jugando un partido ese día.

1. **Pronósticos de partidos** — antes de cada partido, los usuarios predicen quién gana. Se muestra quiénes están participando y qué porcentaje elige a cada equipo. Después del resultado, los acertadores suman puntos a una tabla de pronósticos. Genera engagement antes del partido, no solo después.

2. **Apuestas por porotos** — moneda virtual ganada dentro de la app (por actividad, logros, pronósticos correctos) que se puede apostar en partidos. Sin dinero real, solo status. Una tabla de los mejores apostadores crea su propia competencia paralela.

3. **Comentarios en partidos, perfiles y competencias** — sección de comentarios en las páginas de partido y competencia. El lugar donde se da la discusión que hoy pasa en WhatsApp o Instagram. Mantiene a la gente en la plataforma y genera contenido orgánico.

4. **Minijuegos de dodgeball** — juegos casuales en el navegador con mecánicas del deporte (esquivar, apuntar, timing). Tabla de puntajes global y potencialmente multijugador. Bajo umbral de entrada para alguien que todavía no juega en la vida real pero llegó al sitio con curiosidad.

5. **Trivia de dodgeball** — preguntas diarias sobre reglas del deporte, jugadas históricas, o datos de la propia plataforma ("¿Quién tiene más victorias este mes?"). Con puntos y tabla propia. Engancha incluso a los que no están jugando una temporada activa.

6. **Draft / equipo ideal** — elegís jugadores reales de la plataforma y armás tu equipo soñado. Puntúa según el rendimiento real de esos jugadores durante la semana. Fantasy sports versión dodgeball.

7. **Votación MVP post-partido** — después de cada partido, los participantes votan al mejor jugador. El MVP queda registrado en la página del partido y suma un badge al perfil del jugador. Simple, social, y da razón para revisar resultados.
