import { incomeChart } from "@/features/ingresos/mocks/chart";
import { incomeGeneral } from "@/features/ingresos/mocks/general";
import { incomePeople } from "@/features/ingresos/mocks/people";

export const mockIngresos = {
  general: incomeGeneral,
  grafica: incomeChart,
  detalles: incomePeople,
} as const;

export { incomeChart, incomeGeneral, incomePeople };
export type { IncomePerson, MonthlyIncomePoint } from "@/features/ingresos/mocks/types";
