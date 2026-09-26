export type MobilePlan = {
  id: string;
  title: string;
  plan_date: string;
  start_time: string | null;
  estimated_minutes: number | null;
  priority: string;
  status: string;
  notes: string;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

const STORAGE_KEY = "my-own-app-plan-items";

function readPlans(): MobilePlan[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writePlans(plans: MobilePlan[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(plans));
}

function makeId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function getMobilePlans(): MobilePlan[] {
  return readPlans();
}

export function createMobilePlan(
  input: Omit<MobilePlan, "id" | "created_at" | "updated_at">
): MobilePlan {
  const now = new Date().toISOString();

  const plan: MobilePlan = {
    ...input,
    id: makeId(),
    created_at: now,
    updated_at: now,
  };

  const plans = readPlans();
  plans.push(plan);
  writePlans(plans);

  return plan;
}

export function updateMobilePlan(
  id: string,
  input: Partial<Omit<MobilePlan, "id" | "created_at">>
): MobilePlan | null {
  const plans = readPlans();
  const index = plans.findIndex((plan) => plan.id === id);

  if (index === -1) return null;

  const updated: MobilePlan = {
    ...plans[index],
    ...input,
    updated_at: new Date().toISOString(),
  };

  plans[index] = updated;
  writePlans(plans);

  return updated;
}

export function completeMobilePlan(id: string): MobilePlan | null {
  return updateMobilePlan(id, {
    status: "done",
    completed_at: new Date().toISOString(),
  });
}

export function postponeMobilePlan(
  id: string,
  planDate: string
): MobilePlan | null {
  return updateMobilePlan(id, {
    plan_date: planDate,
    status: "todo",
  });
}

export function deleteMobilePlan(id: string): boolean {
  const plans = readPlans();
  const next = plans.filter((plan) => plan.id !== id);

  if (next.length === plans.length) return false;

  writePlans(next);
  return true;
}
