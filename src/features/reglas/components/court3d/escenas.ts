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
  /** Altura sobre el piso: >0 solo mientras está en el aire (jugada de sacrificio). */
  y: number;
  estado: EstadoJugador;
  /** Hacia dónde mira: 1 = hacia +X, -1 = hacia -X. Cada equipo mira al rival. */
  mira: 1 | -1;
  /**
   * Rumbo libre en radianes, para cuando mirar al rival no alcanza: el shagger que se agacha a
   * juntar una pelota tiene que mirarla a ella, no al otro lado de la cancha. Si no está, manda
   * `mira`. 0 = hacia +Z (el frente de la cámara), π/2 = hacia +X.
   */
  rumbo?: number;
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
): JugadorFrame => ({ id, equipo, x, z, y: 0, estado: 'vivo', mira: miraDe(equipo), manos: 0, pulso: 0, ...extra });

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
//
// Desde dónde se tira cambia con el formato. En Foam el límite es la línea del medio. En Cloth
// la zona neutra es de los dos: el tirador entra a la franja y enfrente hay un azul parado en
// la misma franja, que es lo que hace entender que el espacio es compartido (Rule 1.4.2).
// ---------------------------------------------------------------------------

const escenaLanzamiento = (t: number, fmt: Formato): Frame => {
  const spec = FORMATOS[fmt];
  const nz = spec.zonaNeutra;
  const rojos = enJuego('rojo');
  const azules = enJuego('azul');
  const tirador = rojos[1];
  const objetivo = azules[1];
  const vecino = azules[0]; // el azul que comparte la zona neutra con el tirador

  // En Cloth los dos se meten en la franja; en Foam cada uno se queda en su mitad.
  const entra = tramo(t, 0.2, 1.2);
  const xTirador = nz === null ? tirador.x : mezcla(tirador.x, -0.8, entra);
  const posVecino =
    nz === null ? { x: vecino.x, z: vecino.z } : { x: mezcla(vecino.x, 0.9, entra), z: mezcla(vecino.z, -1.6, entra) };

  const carga = tramo(t, 1.2, 1.7);
  const suelta = tramo(t, 1.7, 2.0);
  const vuelo = lineal(t, 1.9, 2.8);
  const pegado = t >= 2.8;
  const salida = tramo(t, 3.1, 5.4);
  const destino = puestoCola('azul', 0);

  const jugadores = [
    ...rojos.map((j) =>
      j.id === tirador.id
        ? { ...j, x: xTirador - 0.35 * carga + 0.55 * suelta, manos: campana(lineal(t, 1.2, 2.2)) }
        : j
    ),
    ...azules.map((j) => {
      if (j.id === vecino.id) return { ...j, ...posVecino };
      if (j.id !== objetivo.id) return j;
      if (!pegado) return j;
      const p = camino(salida, [{ x: j.x, z: j.z }, destino]);
      return { ...j, x: p.x, z: p.z, estado: 'eliminado' as const, pulso: campana(lineal(t, 2.8, 3.4)) };
    }),
    ...shaggers(),
  ];

  const salidaX = xTirador + 0.7;
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

  let nota: string;
  if (t < 1.9)
    nota =
      nz === null
        ? 'Tirás desde tu mitad, sin pisar la línea del medio.'
        : 'La zona neutra es de los dos: podés entrar y tirar desde ahí.';
  else if (t < 3.4) nota = 'Si te pega directo, sin picar antes, quedás eliminado.';
  else if (t < 5.8) nota = 'Cuenta todo el cuerpo: también la ropa y el pelo.';
  else if (nz === null || t < 7.4) nota = 'El eliminado se va a la cola de su equipo y espera ahí.';
  else nota = 'Eso sí: en la zona neutra no puede haber contacto. El que choca queda out.';

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
//
// El límite no es el mismo en los dos formatos. En Foam la línea del medio te frena. En Cloth
// hay una zona neutra de 4 m (Rule 1.4.2) en la que se puede entrar: lo que elimina es tocar
// la línea de zona neutra del rival (Rule 26.4). Por eso Cloth agrega al final la jugada de
// sacrificio (Rule 28), la única forma legal de cruzar esa línea.
// ---------------------------------------------------------------------------

const escenaLinea = (t: number, fmt: Formato): Frame => {
  const spec = FORMATOS[fmt];
  const nz = spec.zonaNeutra;
  const rojos = enJuego('rojo');
  const azules = enJuego('azul');
  const cruza = rojos[1];
  const sale = rojos[2];
  const sacrifica = rojos[0];
  const blanco = azules[4];

  // Hasta dónde puede llegar el rojo sin quedar out, y dónde está la línea que lo elimina.
  const limiteLegal = nz === null ? -0.55 : -0.35;
  const lineaQueElimina = nz === null ? 0.45 : nz;

  const avanza = tramo(t, 0.8, 2.2);
  const invade = tramo(t, 2.4, 3.3);
  const castigoCruce = t >= 3.3;
  const salidaCruce = tramo(t, 3.6, 5.0);

  const derrapa = tramo(t, 5.4, 6.6);
  const castigoSalida = t >= 6.6;
  const salidaFuera = tramo(t, 7.0, 9.2);

  // Jugada de sacrificio, solo Cloth: carrera, vuelo cruzando la línea rival, tiro y vuelta.
  const carrera = tramo(t, 9.8, 10.6);
  const vuelo = lineal(t, 10.6, 11.9);
  const regreso = tramo(t, 11.9, 13.2);
  const enElAire = spec.sacrificio && t >= 10.6 && t < 11.9;
  const yaTiro = spec.sacrificio && t >= 11.2;

  const xSacrificio = spec.sacrificio
    ? t < 10.6
      ? mezcla(sacrifica.x, 1.5, carrera)
      : t < 11.9
        ? mezcla(1.5, 3.6, vuelo)
        : mezcla(3.6, nz === null ? 1.5 : nz - 0.5, regreso)
    : sacrifica.x;
  // Se corre hacia el centro del ancho antes de saltar: pegado al borde, el salto se confunde
  // con estar fuera de la cancha.
  const zSacrificio = mezcla(sacrifica.z, -1.1, carrera);

  const jugadores = [
    ...rojos.map((j) => {
      if (j.id === cruza.id) {
        const x = mezcla(mezcla(j.x, limiteLegal, avanza), lineaQueElimina, invade);
        if (!castigoCruce) return { ...j, x, manos: avanza * 0.8 };
        const p = camino(salidaCruce, [{ x, z: j.z }, puestoCola('rojo', 0)]);
        return { ...j, x: p.x, z: p.z, estado: 'eliminado' as const, pulso: campana(lineal(t, 3.3, 3.9)) };
      }
      if (j.id === sale.id) {
        const z = mezcla(j.z, 5.1, derrapa);
        if (!castigoSalida) return { ...j, z };
        const p = camino(salidaFuera, [{ x: j.x, z }, puestoCola('rojo', 1)]);
        return { ...j, x: p.x, z: p.z, estado: 'eliminado' as const, pulso: campana(lineal(t, 6.6, 7.2)) };
      }
      if (j.id === sacrifica.id && spec.sacrificio && t >= 9.8) {
        // Despega al cruzar la línea del rival y aterriza recién de vuelta en la zona neutra.
        return {
          ...j,
          x: xSacrificio,
          z: zSacrificio,
          y: enElAire ? campana(vuelo) * 1.1 : 0,
          manos: yaTiro ? 0.2 : 0.9,
        };
      }
      return j;
    }),
    ...azules.map((j) =>
      j.id === blanco.id && yaTiro && t < 13.2
        ? { ...j, estado: 'eliminado' as const, pulso: campana(lineal(t, 11.5, 12.1)) }
        : j
    ),
    ...shaggers(),
  ];

  const pelotas = [pelota('p0', mezcla(-1.4, 0.9, tramo(t, 0.4, 2.2)), 0, { duenio: 'libre' })];
  if (spec.sacrificio && t >= 9.8) {
    // La pelota va con el que salta hasta que la suelta, y después vuela al rival.
    const disparo = lineal(t, 11.2, 11.8);
    const xPelota = yaTiro ? mezcla(xSacrificio, blanco.x, disparo) : xSacrificio + 0.5;
    const zPelota = yaTiro ? mezcla(zSacrificio, blanco.z, disparo) : zSacrificio;
    pelotas[0] = pelota('p0', xPelota, zPelota, {
      duenio: 'rojo',
      y: yaTiro ? campana(disparo) * 0.9 : enElAire ? campana(vuelo) * 1.1 : 0.4,
    });
  }

  let nota: string;
  if (t < 2.3)
    nota =
      nz === null
        ? 'La línea del medio es tu límite. La pelota se busca hasta ahí.'
        : 'La franja del medio es zona neutra: los dos equipos pueden estar ahí.';
  else if (t < 3.3)
    nota = nz === null ? 'Pero pisarla o cruzarla te elimina.' : 'Lo que te elimina es tocar la línea de zona neutra del rival.';
  else if (t < 5.2) nota = 'Quedó out: se va a la cola.';
  else if (t < 7.0) nota = 'Irte de la cancha por el costado, también te elimina.';
  else if (!spec.sacrificio) nota = 'Única excepción: en la arrancada sí podés pisar el centro.';
  else if (t < 10.6) nota = 'Hay una sola forma legal de cruzar: la jugada de sacrificio.';
  else if (t < 11.9) nota = 'Cruzás por el aire, sin tocar el piso del rival, y tirás.';
  else if (t < 13.2) nota = 'Si le pegás, volvés a la zona neutra. Si errás, quedás out vos.';
  else nota = 'Solo un jugador por equipo puede estar en el aire a la vez.';

  return { jugadores, pelotas, nota };
};

// ---------------------------------------------------------------------------
// Escena 7: los shaggers (ball retrievers)
//
// Cloth Rule 4 y 31 · Foam Rule 4: hasta 3 por equipo, salen de los jugadores que no arrancan
// el set, solo juntan pelotas de afuera de las líneas, no pueden pasar la línea del medio y
// devuelven la pelota detrás de la línea de ataque de su propio equipo.
// ---------------------------------------------------------------------------

const escenaShaggers = (t: number, fmt: Formato): Frame => {
  const spec = FORMATOS[fmt];
  const rojos = enJuego('rojo');
  const azules = enJuego('azul');
  const receptor = rojos[5]; // el más retrasado: está detrás de la línea de ataque

  const sePierde = tramo(t, 0.3, 1.7);
  const vaABuscar = tramo(t, 2.0, 3.6);
  const laTrae = tramo(t, 3.8, 5.6);
  const devuelve = lineal(t, 5.8, 6.8);
  const seAsoma = tramo(t, 7.4, 8.6);
  const retrocede = tramo(t, 9.4, 10.4);

  // Todo el recorrido se mide desde la línea del equipo, no en metros fijos. La de Foam está a
  // 3 m y la de Cloth a 5.5: con valores absolutos el mismo tramo daba 3.2 m en Cloth y 0.7 m en
  // Foam, y encima en Foam la pelota ya caía detrás de la línea, así que el beat no mostraba lo
  // único que tiene que mostrar — cruzarla. Anclado a la línea, el recorrido es idéntico en los
  // dos formatos: la pelota nace 0.9 m delante y se devuelve 0.9 m detrás.
  const L = spec.activacion;
  const xAfuera = -(L - 0.9);
  const xDevolucion = -(L + 0.9);
  const xPuesto = -(L + 2.2);
  // La pelota queda delante de la fila de shaggers, si no el cuerpo del que la lleva la tapa.
  // Tiene que seguir fuera de la línea lateral (-4.5): ahí adentro el shagger no puede tocarla.
  const Z_PELOTA_AFUERA = Z_SHAGGERS + 0.9;

  const shagger = (id: string, x: number, extra: Partial<JugadorFrame> = {}) =>
    jugador(id, 'rojo', x, Z_SHAGGERS, { estado: 'shagger', ...extra });

  const xBuscador =
    t < 2.0 ? xPuesto : t < 3.8 ? mezcla(xPuesto, xAfuera, vaABuscar) : mezcla(xAfuera, xDevolucion, laTrae);

  // El que se asoma frena antes de la línea del medio y después vuelve a su puesto. Frena a 1 m
  // y no pegado al centro: ahí arriba está el rótulo "shaggers" y se pisan. Su puesto sí es fijo
  // —este beat habla de la línea del medio, no de la del equipo— pero deja al menos 0.9 m con
  // todo lo demás en los dos formatos, que es donde Foam queda más apretado.
  const xTope = -1.1;
  const xPuestoAsoma = -3.0;
  const xLimite =
    t < 7.4
      ? xPuestoAsoma
      : t < 9.4
        ? mezcla(xPuestoAsoma, xTope, seAsoma)
        : mezcla(xTope, xPuestoAsoma, retrocede);

  // A dónde mira el que junta la pelota: primero a la pelota (mientras va, la levanta y la
  // lleva) y después al compañero al que se la devuelve. Sin esto queda mirando al otro lado
  // de la cancha con las manos estiradas a la derecha, mientras la pelota le queda de costado.
  const xEntrega = receptor.x + 0.6;
  const zEntrega = receptor.z - 0.5;
  const rumboBuscador =
    t < 2.0 || t >= 6.8
      ? undefined
      : t < 5.8
        ? Math.atan2((t < 3.8 ? xAfuera : xBuscador) - xBuscador, Z_PELOTA_AFUERA - Z_SHAGGERS)
        : Math.atan2(xEntrega - xDevolucion, zEntrega - Z_SHAGGERS);

  // Estira a agarrarla, la lleva contra el cuerpo, y vuelve a estirar para devolverla.
  const manosBuscador = t < 3.4 || t >= 6.8 ? 0 : t < 4.2 || t >= 5.8 ? 0.85 : 0.5;

  const jugadores = [
    ...rojos,
    ...azules,
    // Detrás del que junta, también anclado a la línea: con un puesto fijo los dos cuerpos se
    // superponen justo en el momento del pase, en un formato o en el otro.
    shagger('sr0', xPuesto - 1.4),
    shagger('sr1', xLimite, { manos: t >= 8.4 && t < 9.4 ? 0.5 : 0 }),
    shagger('sr2', xBuscador, { manos: manosBuscador, rumbo: rumboBuscador }),
    ...[2, 4.6, 7.2].map((x, i) => jugador(`sa${i}`, 'azul', x, Z_SHAGGERS, { estado: 'shagger' })),
  ];

  // La pelota: sale de la cancha, la junta el shagger, y vuelve a un compañero habilitado.
  let p: PelotaFrame;
  if (t < 1.7) {
    p = pelota('p0', mezcla(-2.6, xAfuera, sePierde), mezcla(-1.8, Z_PELOTA_AFUERA, sePierde), { duenio: 'rojo' });
  } else if (t < 3.8) {
    // Sin `muerta`: afuera y en manos del shagger la pelota sigue en posesión del equipo, y
    // gris sobre el fondo blanco se perdía de vista justo en la parte que hay que seguir.
    p = pelota('p0', xAfuera, Z_PELOTA_AFUERA, { duenio: 'rojo' });
  } else if (t < 5.8) {
    p = pelota('p0', xBuscador, Z_PELOTA_AFUERA, { duenio: 'rojo' });
  } else {
    // Cae al costado del receptor, no encima: si comparten posición la pelota queda tapada.
    p =
      t < 6.8
        ? pelota('p0', mezcla(xDevolucion, xEntrega, devuelve), mezcla(Z_PELOTA_AFUERA, zEntrega, devuelve), {
            duenio: 'rojo',
            y: campana(devuelve) * 0.8,
          })
        : pelota('p0', xEntrega, zEntrega, { duenio: 'rojo' });
  }

  let nota: string;
  if (t < 1.9) nota = 'Cada equipo puede tener hasta 3 shaggers: los que no arrancan el set.';
  else if (t < 3.8) nota = 'Van a buscar las pelotas que salen, siempre por fuera de las líneas.';
  else if (t < 5.8) nota = `La traen hasta detrás de su ${spec.nombreLinea}.`;
  else if (t < 7.4) nota = 'Y se la pasan a un compañero, o la apoyan ahí mismo en la cancha.';
  else if (t < 9.4) nota = 'Nunca cruzan la línea del medio: cada uno junta solo de su mitad.';
  else nota = 'No pueden pisar una línea ni tocar una pelota viva adentro de la cancha.';

  return { jugadores, pelotas: [p], nota };
};

// ---------------------------------------------------------------------------
// Escena 8: cómo se gana
// ---------------------------------------------------------------------------

const escenaGana = (t: number, fmt: Formato): Frame => {
  const spec = FORMATOS[fmt];
  const rojos = enJuego('rojo');
  const azules = enJuego('azul');

  // Primer tramo: el rojo limpia la cancha. Segundo: se acaba el tiempo con 4 contra 2.
  // El primero anuncia de entrada cuántas vías hay, porque si no la nota de la eliminación se
  // lee como si fuera la única y en Cloth no lo es.
  if (t < 5.6) {
    const caidas = [0.8, 1.4, 2.0, 2.6, 3.2, 3.8];
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
    let nota: string;
    if (t < 4.2)
      nota = spec.ganaPorTiempo
        ? 'Hay dos formas de ganar el set. Una: eliminar a los 6 del rival.'
        : 'La única forma de ganar el set es eliminar a los 6 del rival.';
    else nota = 'Set para el rojo: no le queda nadie en cancha al azul.';

    return { jugadores, pelotas: [pelota('p0', 3.2, -1.2, { duenio: 'rojo' })], nota };
  }

  // Segundo tramo: 4 contra 2 y el reloj del set llegando a cero. Acá los formatos se separan:
  // Cloth define el set por cantidad de jugadores vivos (Rule 10.2.1), Foam no lo define nunca
  // por tiempo — el set sigue, sin bloqueos, hasta que un equipo se quede sin nadie (Rule 28).
  const jugadores = [
    ...rojos.slice(0, 4),
    ...rojos.slice(4).map((j, i) => ({ ...j, ...puestoCola('rojo', i), estado: 'eliminado' as const })),
    ...azules.slice(0, 2),
    ...azules.slice(2).map((j, i) => ({ ...j, ...puestoCola('azul', i), estado: 'eliminado' as const })),
    ...shaggers(),
  ];

  let nota: string;
  if (spec.ganaPorTiempo) {
    nota =
      t < 8.0
        ? 'La otra: que se acaben los 3 minutos del set y tengas más jugadores vivos.'
        : t < 9.8
          ? '4 contra 2 cuando suena: el set es del rojo, sin haberlo eliminado.'
          : 'Si quedan iguales es empate. El set ganado da 2 puntos; el empatado, 1 para cada uno.';
  } else {
    nota =
      t < 8.0
        ? 'En Foam tener más no alcanza: el set no se gana por tiempo.'
        : t < 9.8
          ? 'Si se acaba el tiempo sin definir, el árbitro canta "No-Blocking".'
          : 'Ahí la pelota que tenés en la mano ya no bloquea: cuenta como tu cuerpo.';
  }

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
      return escenaLanzamiento(t, fmt);
    case 'catch':
      return escenaCatch(t);
    case 'bloqueo':
      return escenaBloqueo(t, fmt);
    case 'linea':
      return escenaLinea(t, fmt);
    case 'shaggers':
      return escenaShaggers(t, fmt);
    case 'gana':
      return escenaGana(t, fmt);
    default:
      return escenaPosiciones(t, fmt);
  }
};

/** Cuántos slots tiene que reservar la escena 3D para no crear/destruir mallas por frame. */
export const MAX_JUGADORES = 18;
export const MAX_PELOTAS = 6;
