// Contador global compartido por todos los modales de la app (tanto los que usan
// el componente `Modal` como los que implementan su propio overlay `fixed inset-0`).
// Cada vez que un modal se abre pide el próximo valor, así el último abierto
// siempre queda arriba sin importar su posición en el árbol de componentes.
let counter = 100;

export const getNextModalZIndex = (): number => {
  counter += 10;
  return counter;
};
