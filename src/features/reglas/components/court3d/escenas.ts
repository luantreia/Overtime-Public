import {
  FONDO_ROJO,
  FONDO_AZUL,
  FORMATOS,
  Z_COLA,
  Z_SHAGGERS,
  ZS_JUGADORES,
  posicionesPelotas,
  duenioPelota,
  type CourtMode,
  type Formato,
} from './constants';

// Cada escena es una función pura (tiempo, formato) -> qué se ve en ese instante.
// El componente 3D solo dibuja lo que sale de acá, así que toda la coreografía vive
// en este archivo y se puede leer (y corregir contra el reglamento) sin tocar three.js.

export type Equipo = 'rojo' | 'azul';
export type EstadoJugador = 'vivo' | 'eliminado' | 'shagger';

export interface JugadorFrame {
  id: string;
  equipo: Equipo;
  x: number;
  z: number;
  estado: EstadoJugador;
  /** Hacia dónde mira: 1 = hacia +X, -1 = hacia -X. Cada equipo mira al rival. */
  mira: 1 | -1;
  /** 0 = manos al costado; 1 = brazos estirados adelante (agarrar, tirar, atajar, bloquear). */
  manos: number;
  /** 0..1, destello momentáneo del cuerpo (impacto, atajada). */
  pulso: number;
}

export interface PelotaFrame {
  id: string;
  x: number;
  z: number;
  /** Altura sobre el piso: >0 solo mientras vuela. */
  y: number;
  duenio: Equipo | 'libre';
  /** Una pelota sin activar se puede atajar pero no elimina (arrancada). */
  activada: boolean;
  /** Ya no puede eliminar a nadie: se dibuja apagada. */
  muerta: boolean;
}

export interface Frame {
  jugadores: JugadorFrame[];
  pelotas: PelotaFrame[];
  /** Texto corto que acompaña este instante de la animación. */
  nota: string;
}

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const suave = (k: number) => k * k * (3 - 2 * k);
/** Progreso 0..1 con arranque y frenada suaves dentro de la ventana [desde, hasta]. */
const tramo = (t: number, desde: number, hasta: number) => suave(clamp01((t - desde) / (hasta - desde)));
/** Progreso 0..1 a velocidad constante: para el vuelo de una pelota, que no desacelera. */
const lineal = (t: number, desde: number, hasta: number) => clamp01((t - desde) / (hasta - desde));
const mezcla = (a: number, b: number, k: number) => a + (b - a) * k;
/** Campana 0 -> 1 -> 0: sirve para el arco de un tiro y para los destellos. */
const campana = (k: number) => Math.sin(Math.PI * clamp01(k));

/** Recorrido por varios puntos encadenados, con k de 0 a 1 sobre el total. */
const camino = (k: number, puntos: { x: number; z: number }[]) => {
  if (puntos.length === 1) return puntos[0];
  const avance = clamp01(k) * (puntos.length - 1);
  const i = Math.min(Math.floor(avance), puntos.length - 2);
  const f = avance - i;
  return { x: mezcla(puntos[i].x, puntos[i + 1].x, f), z: mezcla(puntos[i].z, puntos[i + 1].z, f) };
};

const miraDe = (equipo: Equipo): 1 | -1 => (equipo === 'rojo' ? 1 : -1);
const fondoDe = (equipo: Equipo) => (equipo === 'rojo' ? FONDO_ROJO + 0.5 : FONDO_AZUL - 0.5);

const jugador = (
  id: string,
  equipo: Equipo,
  x: number,
  z: number,
  extra: Partial<JugadorFrame> = {}
): JugadorFrame => ({ id, equipo, x, z, estado: 'vivo', mira: miraDe(equipo), manos: 0, pulso: 0, ...extra });

const pelota = (id: string, x: number, z: number, extra: Partial<PelotaFrame> = {}): PelotaFrame => ({
  id,
  x,
  z,
  y: 0,
  duenio: 'libre',
  activada: true,
  muerta: false,
  ...extra,
});

/** Los 6 de cada equipo parados sobre su línea de fondo, como arranca cada set. */
const enLineaDeFondo = (equipo: Equipo): JugadorFrame[] =>
  ZS_JUGADORES.map((z, i) => jugador(`${equipo}${i}`, equipo, fondoDe(equipo), z));

/** Reparto típico durante el juego: 3 adelante, 2 al medio, 1 atrás. */
const formacionJuego = (equipo: Equipo): { x: number; z: number }[] => {
  const s = equipo === 'rojo' ? -1 : 1;
  return [
    { x: s * 2.4, z: -3.2 },
    { x: s * 2.6, z: 0 },
    { x: s * 2.4, z: 3.2 },
    { x: s * 5.1, z: -1.8 },
    { x: s * 5.3, z: 1.8 },
    { x: s * 7.3, z: 0 },
  ];
};

const enJuego = (equipo: Equipo): JugadorFrame[] =>
  formacionJuego(equipo).map((p, i) => jugador(`${equipo}${i}`, equipo, p.x, p.z));

const shaggers = (): JugadorFrame[] => [
  ...[-7.2, -4.6, -2].map((x, i) => jugador(`sr${i}`, 'rojo', x, Z_SHAGGERS, { estado: 'shagger' })),
  ...[2, 4.6, 7.2].map((x, i) => jugador(`sa${i}`, 'azul', x, Z_SHAGGERS, { estado: 'shagger' })),
];

/** Puesto en la cola: el 0 es el frente, el próximo en volver a entrar. */
const puestoCola = (equipo: Equipo, i: number) => ({
  x: (equipo === 'rojo' ? -1 : 1) * (4.9 + i * 1.15),
  z: Z_COLA,
});

// ---------------------------------------------------------------------------
// Escena 1: posiciones iniciales
// ---------------------------------------------------------------------------

const escenaPosiciones = (t: number, fmt: Formato): Frame => {
  const respirar = Math.sin(t * 2.2) * 0.08;
  const zs = posicionesPelotas(fmt);

  const jugadores = [
    ...enLineaDeFondo('rojo').map((j) => ({ ...j, x: j.x + respirar })),
    ...enLineaDeFondo('azul').map((j) => ({ ...j, x: j.x - respirar })),
    ...shaggers(),
  ];

  const pelotas = zs.map((z, i) =>
    pelota(`p${i}`, 0, z, { duenio: duenioPelota(fmt, z), activada: false })
  );

  const nota =
    t < 2.6
      ? '6 jugadores por equipo, con un pie en su línea de fondo.'
      : t < 5.2
        ? 'Arriba, los shaggers: juntan las pelotas que se van afuera.'
        : `Abajo, la cola: ahí espera el que queda eliminado. Las ${zs.length} pelotas van en el centro.`;

  return { jugadores, pelotas, nota };
};

// ---------------------------------------------------------------------------
// Escena 2: la arrancada (opening rush)
// ---------------------------------------------------------------------------

/** A cada pelota le asigna el jugador libre más cercano en Z. */
const asignarPelotas = (jugadores: JugadorFrame[], objetivos: number[]) => {
  const disponibles = [...jugadores];
  const mapa = new Map<string, number>();
  objetivos.forEach((bz) => {
    if (!disponibles.length) return;
    let mejor = 0;
    disponibles.forEach((j, idx) => {
      if (Math.abs(j.z - bz) < Math.abs(disponibles[mejor].z - bz)) mejor = idx;
    });
    mapa.set(disponibles.splice(mejor, 1)[0].id, bz);
  });
  return mapa;
};

const escenaApertura = (t: number, fmt: Formato): Frame => {
  const spec = FORMATOS[fmt];
  const zs = posicionesPelotas(fmt);
  const act = spec.activacion;

  const corre = tramo(t, 1.0, 2.7);
  const vuelve = tramo(t, 3.0, 4.9);

  const disputada = zs.find((z) => duenioPelota(fmt, z) === 'libre');
  const objetivosDe = (equipo: Equipo) => {
    const propias = zs.filter((z) => duenioPelota(fmt, z) === equipo);
    // La pelota del medio (solo Cloth) la van a buscar los dos equipos.
    return disputada !== undefined ? [...propias, disputada] : propias;
  };

  const baseRojo = enLineaDeFondo('rojo');
  const baseAzul = enLineaDeFondo('azul');
  const asignRojo = asignarPelotas(baseRojo, objetivosDe('rojo'));
  const asignAzul = asignarPelotas(baseAzul, objetivosDe('azul'));

  const posiciones = new Map<string, { x: number; z: number }>();

  const moverEquipo = (base: JugadorFrame[], asign: Map<string, number>): JugadorFrame[] => {
    const s = base[0].equipo === 'rojo' ? -1 : 1;
    return base.map((j) => {
      const objetivo = asign.get(j.id);
      const inicio = fondoDe(j.equipo);
      let x: number;
      let z: number;
      let manos = 0;

      if (objetivo !== undefined) {
        // Va a buscar su pelota al centro y se la lleva bien atrás de su línea: la que tiene que
        // cruzarla del todo es la pelota, que va adelante del cuerpo en sus manos.
        x = mezcla(mezcla(inicio, s * 0.6, corre), s * (act + 1.7), vuelve);
        z = mezcla(mezcla(j.z, objetivo, corre), mezcla(objetivo, j.z, 0.6), vuelve);
        manos = Math.max(campana(lineal(t, 2.1, 3.4)), t > 2.8 ? 0.45 : 0);
      } else {
        // Los demás avanzan y se abren detrás de la línea.
        x = mezcla(inicio, s * (act + 0.5), corre);
        z = j.z;
      }
      posiciones.set(j.id, { x, z });
      return { ...j, x, z, manos };
    });
  };

  const jugadores = [...moverEquipo(baseRojo, asignRojo), ...moverEquipo(baseAzul, asignAzul), ...shaggers()];

  const llevaLaPelota = (z: number): string | undefined => {
    const duenio = duenioPelota(fmt, z);
    // La disputada se la termina llevando el rojo; el azul llega tarde y vuelve sin nada.
    const mapa = duenio === 'azul' ? asignAzul : asignRojo;
    const entrada = Array.from(mapa.entries()).find(([, bz]) => bz === z);
    return entrada?.[0];
  };

  const agarre = tramo(t, 2.5, 3.0);
  const pelotas = zs.map((z, i) => {
    const duenio = duenioPelota(fmt, z);
    const portador = llevaLaPelota(z);
    const destino = portador ? posiciones.get(portador) : undefined;
    // Una vez agarrada va en las manos: adelante del cuerpo, del lado del rival. Si la dejáramos
    // en la misma posición que el jugador quedaría escondida adentro del cuerpo.
    const frente = duenio === 'azul' ? -0.85 : 0.85;
    const x = destino ? mezcla(0, destino.x + frente, agarre) : 0;
    const zz = destino ? mezcla(z, destino.z, agarre) : z;
    // Se activa recién cuando cruzó del todo su línea (Cloth 13.11.1 / Foam 13.1).
    const lado = duenio === 'azul' ? 1 : -1;
    const activada = lado === -1 ? x <= -act : x >= act;
    return pelota(`p${i}`, x, zz, { duenio, activada, y: 0.25 * agarre });
  });

  const nota =
    t < 1.0
      ? 'Todos arrancan desde su línea de fondo, al silbato.'
      : t < 3.0
        ? spec.pelotaDisputada
          ? 'Cada equipo va por sus 2 pelotas; la del medio la pelean los dos.'
          : 'Las 6 pelotas están repartidas 3 y 3: ninguna se pelea.'
        : t < 5.2
          ? `Con la pelota hay que volver y cruzar la ${spec.nombreLinea}.`
          : t < 8.0
            ? `Recién ahí se activa y puede eliminar: está a ${act} m del centro.`
            : 'Antes de cruzarla se la puede atajar, pero no elimina a nadie.';

  return { jugadores, pelotas, nota };
};

// ---------------------------------------------------------------------------
// Escena 3: el tiro (eliminar por impacto directo)
// ---------------------------------------------------------------------------

const escenaLanzamiento = (t: number): Frame => {
  const rojos = enJuego('rojo');
  const azules = enJuego('azul');
  const tirador = rojos[1];
  const objetivo = azules[1];

  const carga = tramo(t, 1.2, 1.7);
  const suelta = tramo(t, 1.7, 2.0);
  const vuelo = lineal(t, 1.9, 2.8);
  const pegado = t >= 2.8;
  const salida = tramo(t, 3.1, 5.4);
  const destino = puestoCola('azul', 0);

  const jugadores = [
    ...rojos.map((j) =>
      j.id === tirador.id
        ? { ...j, x: j.x - 0.35 * carga + 0.55 * suelta, manos: campana(lineal(t, 1.2, 2.2)) }
        : j
    ),
    ...azules.map((j) => {
      if (j.id !== objetivo.id) return j;
      if (!pegado) return j;
      const p = camino(salida, [{ x: j.x, z: j.z }, destino]);
      return { ...j, x: p.x, z: p.z, estado: 'eliminado' as const, pulso: campana(lineal(t, 2.8, 3.4)) };
    }),
    ...shaggers(),
  ];

  const salidaX = tirador.x + 0.7;
  const pelotas = [
    pelota(
      'p0',
      pegado ? mezcla(objetivo.x, objetivo.x + 1.6, tramo(t, 2.8, 3.8)) : mezcla(salidaX, objetivo.x, vuelo),
      pegado ? objetivo.z - 0.5 : mezcla(tirador.z, objetivo.z, vuelo),
      {
        y: pegado ? 0 : campana(vuelo) * 1.1,
        duenio: 'rojo',
        muerta: pegado,
      }
    ),
  ];

  const nota =
    t < 1.9
      ? 'Tirás desde tu mitad, sin pisar la línea del medio.'
      : t < 3.4
        ? 'Si te pega directo, sin picar antes, quedás eliminado.'
        : t < 5.8
          ? 'Cuenta todo el cuerpo: también la ropa y el pelo.'
          : 'El eliminado se va a la cola de su equipo y espera ahí.';

  return { jugadores, pelotas, nota };
};

// ---------------------------------------------------------------------------
// Escena 4: la atajada (catch)
// ---------------------------------------------------------------------------

const escenaCatch = (t: number): Frame => {
  // El rojo juega con 4 en cancha y 2 esperando en la cola: así se ve la vuelta.
  const rojosEnCancha = enJuego('rojo').slice(0, 4);
  const azules = enJuego('azul');
  const tirador = azules[1];
  const atajador = rojosEnCancha[1];

  const carga = tramo(t, 0.9, 1.4);
  const suelta = tramo(t, 1.4, 1.7);
  const vuelo = lineal(t, 1.6, 2.6);
  const atajada = t >= 2.6;
  const salida = tramo(t, 3.0, 5.2);
  const vuelta = tramo(t, 3.4, 6.4);

  const destinoTirador = puestoCola('azul', 0);
  const entrando = camino(vuelta, [
    puestoCola('rojo', 0),
    { x: FONDO_ROJO + 0.8, z: 4.4 },
    { x: -6.4, z: 2.0 },
  ]);

  const jugadores = [
    ...rojosEnCancha.map((j) =>
      j.id === atajador.id
        ? { ...j, manos: Math.max(campana(lineal(t, 2.0, 3.2)), atajada ? 0.35 : 0), pulso: campana(lineal(t, 2.6, 3.2)) }
        : j
    ),
    // El primero de la cola vuelve a entrar (sigue eliminado hasta que arranca a volver);
    // el otro adelanta un puesto.
    jugador('rojo4', 'rojo', entrando.x, entrando.z, { estado: vuelta > 0.02 ? 'vivo' : 'eliminado' }),
    jugador('rojo5', 'rojo', mezcla(puestoCola('rojo', 1).x, puestoCola('rojo', 0).x, vuelta), Z_COLA, {
      estado: 'eliminado',
    }),
    ...azules.map((j) => {
      if (j.id !== tirador.id) return { ...j, manos: 0 };
      const manos = campana(lineal(t, 0.9, 1.9));
      if (!atajada) return { ...j, x: j.x + 0.35 * carga - 0.55 * suelta, manos };
      const p = camino(salida, [{ x: j.x, z: j.z }, destinoTirador]);
      return { ...j, x: p.x, z: p.z, estado: 'eliminado' as const, pulso: campana(lineal(t, 2.6, 3.2)) };
    }),
    ...shaggers(),
  ];

  const pelotas = [
    pelota('p0', atajada ? atajador.x + 0.85 : mezcla(tirador.x - 0.7, atajador.x + 0.85, vuelo), atajador.z, {
      y: atajada ? 0.5 : campana(vuelo) * 1.0,
      duenio: atajada ? 'rojo' : 'azul',
    }),
  ];

  const nota =
    t < 2.6
      ? 'Si la agarrás en el aire, antes de que toque el piso...'
      : t < 4.4
        ? '...el que tiró queda eliminado.'
        : t < 7.2
          ? 'Y además vuelve a entrar el primero de tu cola.'
          : 'Atajar es la única forma de recuperar jugadores en el set.';

  return { jugadores, pelotas, nota };
};

// ---------------------------------------------------------------------------
// Escena 5: el bloqueo
// ---------------------------------------------------------------------------

const escenaBloqueo = (t: number, fmt: Formato): Frame => {
  const rojos = enJuego('rojo');
  const azules = enJuego('azul');
  const tirador = azules[1];
  const bloqueador = rojos[1];

  const suelta = tramo(t, 1.2, 1.6);
  const vuelo = lineal(t, 1.5, 2.4);
  const bloqueado = t >= 2.4;
  const rebote = tramo(t, 2.4, 3.6);

  const jugadores = [
    ...rojos.map((j) =>
      j.id === bloqueador.id ? { ...j, manos: Math.max(0.45, campana(lineal(t, 1.8, 3.0))) } : j
    ),
    ...azules.map((j) =>
      j.id === tirador.id ? { ...j, x: j.x - 0.5 * suelta, manos: campana(lineal(t, 0.8, 1.8)) } : j
    ),
    ...shaggers(),
  ];

  const pelotas = [
    // La que sostiene el rojo: es la que bloquea, queda en sus manos.
    pelota('p0', bloqueador.x + 0.85, bloqueador.z, { y: 0.5, duenio: 'rojo' }),
    // La que viene tirada: rebota y sigue viva.
    pelota(
      'p1',
      bloqueado
        ? mezcla(bloqueador.x + 1.2, bloqueador.x + 3.4, rebote)
        : mezcla(tirador.x - 0.7, bloqueador.x + 1.1, vuelo),
      bloqueado ? mezcla(bloqueador.z, bloqueador.z + 2.2, rebote) : bloqueador.z,
      { y: bloqueado ? 0 : campana(vuelo) * 0.9, duenio: 'azul' }
    ),
  ];

  const nota =
    t < 2.4
      ? 'Con una pelota en la mano podés bloquear el tiro que viene.'
      : t < 4.6
        ? 'Nadie queda afuera: la pelota bloqueada sigue viva.'
        : fmt === 'foam'
          ? 'Ojo: en Foam, sobre el final del set se corta el bloqueo (No-Blocking).'
          : 'Si se te escapa de las manos al bloquear, ahí sí quedás eliminado.';

  return { jugadores, pelotas, nota };
};

// ---------------------------------------------------------------------------
// Escena 6: las líneas
// ---------------------------------------------------------------------------

const escenaLinea = (t: number): Frame => {
  const rojos = enJuego('rojo');
  const azules = enJuego('azul');
  const cruza = rojos[1];
  const sale = rojos[2];

  const persigue = tramo(t, 0.8, 2.3);
  const castigoCruce = t >= 2.3;
  const salidaCruce = tramo(t, 2.7, 4.8);

  const derrapa = tramo(t, 5.2, 6.6);
  const castigoSalida = t >= 6.6;
  const salidaFuera = tramo(t, 7.0, 9.2);

  const jugadores = [
    ...rojos.map((j) => {
      if (j.id === cruza.id) {
        const x = mezcla(j.x, 0.45, persigue);
        if (!castigoCruce) return { ...j, x, manos: persigue * 0.8 };
        const p = camino(salidaCruce, [{ x, z: j.z }, puestoCola('rojo', 0)]);
        return { ...j, x: p.x, z: p.z, estado: 'eliminado' as const, pulso: campana(lineal(t, 2.3, 2.9)) };
      }
      if (j.id === sale.id) {
        const z = mezcla(j.z, 5.1, derrapa);
        if (!castigoSalida) return { ...j, z };
        const p = camino(salidaFuera, [{ x: j.x, z }, puestoCola('rojo', 1)]);
        return { ...j, x: p.x, z: p.z, estado: 'eliminado' as const, pulso: campana(lineal(t, 6.6, 7.2)) };
      }
      return j;
    }),
    ...azules,
    ...shaggers(),
  ];

  const pelotas = [pelota('p0', mezcla(-1.4, 0.9, tramo(t, 0.4, 2.2)), 0, { duenio: 'libre' })];

  const nota =
    t < 2.3
      ? 'La línea del medio es tu límite: la pelota se busca hasta ahí.'
      : t < 5.0
        ? 'Pisarla o cruzarla te elimina.'
        : t < 7.0
          ? 'Irte de la cancha por el costado, también.'
          : 'Única excepción: en la arrancada sí podés pisar el centro.';

  return { jugadores, pelotas, nota };
};

// ---------------------------------------------------------------------------
// Escena 7: cómo se gana
// ---------------------------------------------------------------------------

const escenaGana = (t: number, fmt: Formato): Frame => {
  const rojos = enJuego('rojo');
  const azules = enJuego('azul');

  // Primer tramo: el rojo limpia la cancha. Segundo: se acaba el tiempo con 4 contra 2.
  if (t < 6.2) {
    const caidas = [0.9, 1.6, 2.3, 3.0, 3.7, 4.4];
    const jugadores = [
      ...rojos,
      ...azules.map((j, i) => {
        const cuando = caidas[i];
        if (t < cuando) return j;
        const salida = tramo(t, cuando + 0.2, cuando + 1.5);
        const p = camino(salida, [{ x: j.x, z: j.z }, puestoCola('azul', 5 - i)]);
        return { ...j, x: p.x, z: p.z, estado: 'eliminado' as const, pulso: campana(lineal(t, cuando, cuando + 0.5)) };
      }),
      ...shaggers(),
    ];
    return {
      jugadores,
      pelotas: [pelota('p0', 3.2, -1.2, { duenio: 'rojo' })],
      nota:
        t < 4.6 ? 'Ganás el set si eliminás a los 6 del rival.' : 'Set para el rojo: no le queda nadie en cancha al azul.',
    };
  }

  // Segundo tramo: partido detenido, se compara cuántos quedan de cada lado.
  const jugadores = [
    ...rojos.slice(0, 4),
    ...rojos.slice(4).map((j, i) => ({ ...j, ...puestoCola('rojo', i), estado: 'eliminado' as const })),
    ...azules.slice(0, 2),
    ...azules.slice(2).map((j, i) => ({ ...j, ...puestoCola('azul', i), estado: 'eliminado' as const })),
    ...shaggers(),
  ];

  const nota =
    t < 8.8
      ? 'O si al terminar el tiempo tenés más jugadores en cancha.'
      : t < 10.4
        ? '4 contra 2: el set es del rojo.'
        : fmt === 'cloth'
          ? 'En Cloth el set ganado vale 2 puntos, y 1 para cada uno si empatan.'
          : 'En Foam cada set vale 1 punto y nunca termina empatado.';

  return { jugadores, pelotas: [pelota('p0', -3.0, 1.4, { duenio: 'rojo' })], nota };
};

// ---------------------------------------------------------------------------

export const calcularFrame = (mode: CourtMode, t: number, fmt: Formato): Frame => {
  switch (mode) {
    case 'posiciones':
      return escenaPosiciones(t, fmt);
    case 'apertura':
      return escenaApertura(t, fmt);
    case 'lanzamiento':
      return escenaLanzamiento(t);
    case 'catch':
      return escenaCatch(t);
    case 'bloqueo':
      return escenaBloqueo(t, fmt);
    case 'linea':
      return escenaLinea(t);
    case 'gana':
      return escenaGana(t, fmt);
    default:
      return escenaPosiciones(t, fmt);
  }
};

/** Cuántos slots tiene que reservar la escena 3D para no crear/destruir mallas por frame. */
export const MAX_JUGADORES = 18;
export const MAX_PELOTAS = 6;
