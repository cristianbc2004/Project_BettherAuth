export type ExpenseCategory = {
  amount: number;
  label: string;
  matchCategories: string[];
  tone: string;
};

export const expenseCategories: ExpenseCategory[] = [
  { amount: 230, label: "Alimentacion", matchCategories: ["Alimentacion", "Cafe y desayuno"], tone: "#7c35e8" },
  { amount: 110, label: "Ocio", matchCategories: ["Ocio", "Deporte", "Compras"], tone: "#f59e0b" },
  { amount: 85, label: "Transporte", matchCategories: ["Transporte", "Gasolina"], tone: "#0ea5e9" },
  { amount: 42, label: "Suscripciones", matchCategories: ["Suscripcion", "Tecnologia"], tone: "#10b981" },
  { amount: 68, label: "Otros", matchCategories: ["Salud", "Hogar"], tone: "#64748b" },
];

export function getExpenseCategoryByLabel(label?: string) {
  return expenseCategories.find((category) => category.label === label);
}
