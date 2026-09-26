import {
  completeMobilePlan,
  createMobilePlan,
  deleteMobilePlan,
  getMobilePlans,
  postponeMobilePlan,
  updateMobilePlan,
  type MobilePlan,
} from "./mobileStore";
import {
  cancelPlanReminder,
  schedulePlanReminder,
} from "./mobileNotifications";

export async function mobileGetPlans() {
  return getMobilePlans();
}

export async function mobileCreatePlan(
  input: Omit<MobilePlan, "id" | "created_at" | "updated_at">
) {
  const plan = createMobilePlan(input);
  await schedulePlanReminder(plan);
  return plan;
}

export async function mobileUpdatePlan(
  id: string,
  input: Partial<Omit<MobilePlan, "id" | "created_at">>
) {
  const plan = updateMobilePlan(id, input);

  if (plan) {
    await cancelPlanReminder(id);
    await schedulePlanReminder(plan);
  }

  return plan;
}

export async function mobileCompletePlan(id: string) {
  const plan = completeMobilePlan(id);

  if (plan) {
    await cancelPlanReminder(id);
  }

  return plan;
}

export async function mobilePostponePlan(
  id: string,
  planDate: string
) {
  const plan = postponeMobilePlan(id, planDate);

  if (plan) {
    await cancelPlanReminder(id);
    await schedulePlanReminder(plan);
  }

  return plan;
}

export async function mobileDeletePlan(id: string) {
  await cancelPlanReminder(id);
  return deleteMobilePlan(id);
}
