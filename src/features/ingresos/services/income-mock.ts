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

export const mockIngresos = {
  general: {
    periodo: "Enero - Abril 2026",
    personaConMayorIngreso: "Lucía Fernández",
    personaConMenorIngreso: "Sofía Herrera",
    promedioPorPersona: 4612.5,
    titulo: "Ingresos generados por persona",
    totalIngresos: 18450,
  },
  grafica: [
    {
      fecha: "2026-01-01",
      ingresosPorPersona: [
        { ingresos: 4200, persona: "Lucía Fernández", personaId: 1 },
        { ingresos: 3600, persona: "Carlos Mendoza", personaId: 2 },
        { ingresos: 3150, persona: "Valeria Torres", personaId: 3 },
        { ingresos: 2450, persona: "Sofía Herrera", personaId: 4 },
      ],
      mes: "Ene",
    },
    {
      fecha: "2026-02-01",
      ingresosPorPersona: [
        { ingresos: 4750, persona: "Lucía Fernández", personaId: 1 },
        { ingresos: 3920, persona: "Carlos Mendoza", personaId: 2 },
        { ingresos: 3400, persona: "Valeria Torres", personaId: 3 },
        { ingresos: 2700, persona: "Sofía Herrera", personaId: 4 },
      ],
      mes: "Feb",
    },
    {
      fecha: "2026-03-01",
      ingresosPorPersona: [
        { ingresos: 5400, persona: "Lucía Fernández", personaId: 1 },
        { ingresos: 4400, persona: "Carlos Mendoza", personaId: 2 },
        { ingresos: 3950, persona: "Valeria Torres", personaId: 3 },
        { ingresos: 2950, persona: "Sofía Herrera", personaId: 4 },
      ],
      mes: "Mar",
    },
    {
      fecha: "2026-04-01",
      ingresosPorPersona: [
        { ingresos: 6200, persona: "Lucía Fernández", personaId: 1 },
        { ingresos: 4850, persona: "Carlos Mendoza", personaId: 2 },
        { ingresos: 4300, persona: "Valeria Torres", personaId: 3 },
        { ingresos: 3100, persona: "Sofía Herrera", personaId: 4 },
      ],
      mes: "Abr",
    },
  ] satisfies MonthlyIncomePoint[],
  detalles: [
    {
      cargo: "Ejecutiva de ventas",
      comision: 930,
      id: 1,
      ingresos: 6200,
      nombre: "Lucía Fernández",
      observacion: "Mayor generación de ingresos del periodo",
      porcentajeDelTotal: 33.6,
      ventasRealizadas: 31,
    },
    {
      cargo: "Consultor comercial",
      comision: 727.5,
      id: 2,
      ingresos: 4850,
      nombre: "Carlos Mendoza",
      observacion: "Buen rendimiento en ventas corporativas",
      porcentajeDelTotal: 26.3,
      ventasRealizadas: 24,
    },
    {
      cargo: "Representante de cuentas",
      comision: 645,
      id: 3,
      ingresos: 4300,
      nombre: "Valeria Torres",
      observacion: "Desempeño estable durante el mes",
      porcentajeDelTotal: 23.3,
      ventasRealizadas: 21,
    },
    {
      cargo: "Asesora comercial",
      comision: 465,
      id: 4,
      ingresos: 3100,
      nombre: "Sofía Herrera",
      observacion: "Menor ingreso, pero con potencial de crecimiento",
      porcentajeDelTotal: 16.8,
      ventasRealizadas: 16,
    },
  ] satisfies IncomePerson[],
} as const;
