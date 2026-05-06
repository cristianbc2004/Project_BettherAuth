export type IncomePersonLocation = {
  lastUpdatedAt: string;
  latitude: number;
  longitude: number;
  status: "moving" | "offline" | "online";
};

export type IncomePerson = {
  cargo: string;
  comision: number;
  id: number;
  ingresos: number;
  location: IncomePersonLocation;
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
