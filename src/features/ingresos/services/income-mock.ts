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

export const mockIngresos = {
  general: {
    periodo: "Abril 2026",
    personaConMayorIngreso: "Lucía Fernández",
    personaConMenorIngreso: "Sofía Herrera",
    promedioPorPersona: 4612.5,
    titulo: "Ingresos generados por persona",
    totalIngresos: 18450,
  },
  grafica: [
    {
      ingresos: 6200,
      persona: "Lucía Fernández",
    },
    {
      ingresos: 4850,
      persona: "Carlos Mendoza",
    },
    {
      ingresos: 4300,
      persona: "Valeria Torres",
    },
    {
      ingresos: 3100,
      persona: "Sofía Herrera",
    },
  ],
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
