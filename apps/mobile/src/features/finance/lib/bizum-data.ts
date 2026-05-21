import {
  bizumGetResponseSchema,
  fetchBizumRequest,
  type BizumContact,
} from "@/features/finance/lib/bizum-api";

export type BizumMovement = {
  amount: string;
  date: string;
  id: string;
  initials: string;
  name: string;
  tone: "income" | "outcome";
};

function formatMovementDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Now";
  }

  return new Intl.DateTimeFormat("en-US", {
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    month: "2-digit",
  }).format(date);
}

export async function loadBizumOverviewData() {
  const response = await fetchBizumRequest();

  if (!response.ok) {
    throw new Error("Could not load Bizum. Please try again.");
  }

  const payload = bizumGetResponseSchema.parse(await response.json());

  return {
    availableBalanceCents: payload.availableBalanceCents ?? 0,
    movements: (payload.movements ?? []).map((movement) => ({
      amount: movement.amount,
      date: formatMovementDate(movement.createdAt),
      id: movement.id,
      initials: movement.initials,
      name: movement.name,
      tone: movement.tone,
    })) satisfies BizumMovement[],
  };
}

export async function loadBizumActionData(): Promise<{
  availableBalanceCents: number;
  contacts: BizumContact[];
}> {
  const response = await fetchBizumRequest();

  if (!response.ok) {
    throw new Error("Could not load Bizum. Please try again.");
  }

  const payload = bizumGetResponseSchema.parse(await response.json());

  return {
    availableBalanceCents: payload.availableBalanceCents ?? 0,
    contacts: payload.contacts ?? [],
  };
}
