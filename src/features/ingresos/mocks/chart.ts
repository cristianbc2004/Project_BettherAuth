import type { MonthlyIncomePoint } from "@/features/ingresos/mocks/types";

export const incomeChart: MonthlyIncomePoint[] = [
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
];
