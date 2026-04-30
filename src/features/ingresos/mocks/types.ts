export type IncomePerson = {
  cargo: string;
  comision: number;
  id: number;
  ingresos: number;
  nombre: string;
  observacion: string;
  porcentajeDelTotal: number;
  ventasRealizadas: number;
};

export type MonthlyIncomePoint = {
  fecha: string;
  ingresosPorPersona: Array<{
    ingresos: number;
    persona: string;
    personaId: number;
  }>;
  mes: string;
};
