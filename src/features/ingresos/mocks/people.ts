import type { IncomePerson, IncomePersonSale, IncomeSaleLocation } from "@/shared/types/ingresos";

type SaleLocationSeed = IncomeSaleLocation & {
  clientPrefix: string;
};

const saleLocationSeeds: SaleLocationSeed[] = [
  {
    address: "Calle de Alcala 42",
    city: "Madrid",
    clientPrefix: "Retail Centro",
    latitude: 40.4187,
    longitude: -3.6987,
  },
  {
    address: "Paseo de la Castellana 81",
    city: "Madrid",
    clientPrefix: "Oficina Norte",
    latitude: 40.4493,
    longitude: -3.6919,
  },
  {
    address: "Calle de Serrano 56",
    city: "Madrid",
    clientPrefix: "Boutique Serrano",
    latitude: 40.4288,
    longitude: -3.6869,
  },
  {
    address: "Gran Via 28",
    city: "Madrid",
    clientPrefix: "Local Gran Via",
    latitude: 40.4202,
    longitude: -3.7026,
  },
  {
    address: "Calle de Atocha 115",
    city: "Madrid",
    clientPrefix: "Cuenta Atocha",
    latitude: 40.4098,
    longitude: -3.6934,
  },
  {
    address: "Calle de Orense 12",
    city: "Madrid",
    clientPrefix: "Empresa Orense",
    latitude: 40.4484,
    longitude: -3.6952,
  },
  {
    address: "Plaza de Santa Ana 3",
    city: "Madrid",
    clientPrefix: "Hosteleria Centro",
    latitude: 40.4141,
    longitude: -3.7015,
  },
  {
    address: "Calle de Goya 73",
    city: "Madrid",
    clientPrefix: "Comercio Goya",
    latitude: 40.4241,
    longitude: -3.6749,
  },
];

function buildSales(personId: number, count: number, total: number, startDay: number): IncomePersonSale[] {
  const baseAmount = Math.floor(total / count);
  let accumulated = 0;

  return Array.from({ length: count }, (_, index) => {
    const locationSeed = saleLocationSeeds[(index + personId) % saleLocationSeeds.length];
    const variance = ((index % 5) - 2) * 12;
    const importe = index === count - 1 ? total - accumulated : baseAmount + variance;
    accumulated += importe;

    return {
      cliente: `${locationSeed.clientPrefix} ${index + 1}`,
      fecha: `2026-05-${String(startDay + (index % 12)).padStart(2, "0")}T${String(9 + (index % 8)).padStart(2, "0")}:30:00Z`,
      id: `sale-${personId}-${index + 1}`,
      importe,
      location: {
        address: locationSeed.address,
        city: locationSeed.city,
        latitude: locationSeed.latitude + index * 0.0003,
        longitude: locationSeed.longitude - index * 0.0002,
      },
    };
  });
}

const luciaSales = buildSales(1, 31, 6200, 1);
const carlosSales = buildSales(2, 24, 4850, 2);
const valeriaSales = buildSales(3, 21, 4300, 3);
const sofiaSales = buildSales(4, 16, 3100, 4);

export const incomePeople: IncomePerson[] = [
  {
    cargo: "Ejecutiva de ventas",
    comision: 930,
    id: 1,
    ingresos: 6200,
    location: {
      lastUpdatedAt: "2026-05-06T08:45:00Z",
      latitude: 40.4168,
      longitude: -3.7038,
      status: "online",
    },
    nombre: "Lucía Fernández",
    observacion: "Mayor generación de ingresos del periodo",
    porcentajeDelTotal: 33.6,
    ventas: luciaSales,
    ventasRealizadas: luciaSales.length,
  },
  {
    cargo: "Consultor comercial",
    comision: 727.5,
    id: 2,
    ingresos: 4850,
    location: {
      lastUpdatedAt: "2026-05-06T08:41:00Z",
      latitude: 40.4282,
      longitude: -3.7026,
      status: "moving",
    },
    nombre: "Carlos Mendoza",
    observacion: "Buen rendimiento en ventas corporativas",
    porcentajeDelTotal: 26.3,
    ventas: carlosSales,
    ventasRealizadas: carlosSales.length,
  },
  {
    cargo: "Representante de cuentas",
    comision: 645,
    id: 3,
    ingresos: 4300,
    location: {
      lastUpdatedAt: "2026-05-06T08:32:00Z",
      latitude: 40.4379,
      longitude: -3.6874,
      status: "online",
    },
    nombre: "Valeria Torres",
    observacion: "Desempeño estable durante el mes",
    porcentajeDelTotal: 23.3,
    ventas: valeriaSales,
    ventasRealizadas: valeriaSales.length,
  },
  {
    cargo: "Asesora comercial",
    comision: 465,
    id: 4,
    ingresos: 3100,
    location: {
      lastUpdatedAt: "2026-05-06T07:58:00Z",
      latitude: 40.4014,
      longitude: -3.6932,
      status: "offline",
    },
    nombre: "Sofía Herrera",
    observacion: "Menor ingreso, pero con potencial de crecimiento",
    porcentajeDelTotal: 16.8,
    ventas: sofiaSales,
    ventasRealizadas: sofiaSales.length,
  },
];
