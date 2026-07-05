export type CompetenciaEstadoVariante = 'proximamente' | 'en_curso' | 'finalizada';

export const mapEstadoVariante = (estado: any): CompetenciaEstadoVariante => {
  if (!estado) return 'proximamente';

  const estadoStr = String(estado).toLowerCase().trim();

  if (estadoStr.includes('en_curso') || estadoStr.includes('en curso') || estadoStr.includes('activa') || (estadoStr.includes('en') && estadoStr.includes('curso'))) {
    return 'en_curso';
  }
  if (estadoStr.includes('finalizada') || estadoStr.includes('finalizado') || estadoStr.includes('terminada') || estadoStr.includes('completada')) {
    return 'finalizada';
  }

  return 'proximamente';
};
