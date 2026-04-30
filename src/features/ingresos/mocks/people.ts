import type { IncomePerson } from "@/features/ingresos/mocks/types";

export const incomePeople: IncomePerson[] = [
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
];
