import { LocalNotifications } from "@capacitor/local-notifications";
import type { MobilePlan } from "./mobileStore";

const CHANNEL_ID = "plan-reminders";

function notificationId(planId: string): number {
  let hash = 0;

  for (let i = 0; i < planId.length; i += 1) {
    hash = (hash * 31 + planId.charCodeAt(i)) | 0;
  }

  return Math.abs(hash) || 1;
}

function getPlanDate(plan: MobilePlan): Date | null {
  if (!plan.start_time) return null;

  const [year, month, day] = plan.plan_date.split("-").map(Number);
  const [hour, minute] = plan.start_time.split(":").map(Number);

  if (
    !year ||
    !month ||
    !day ||
    Number.isNaN(hour) ||
    Number.isNaN(minute)
  ) {
    return null;
  }

  const date = new Date(year, month - 1, day, hour, minute, 0, 0);

  if (Number.isNaN(date.getTime())) return null;

  return date;
}

async function ensureNotificationPermission() {
  const current = await LocalNotifications.checkPermissions();

  if (current.display === "granted") {
    return true;
  }

  const requested = await LocalNotifications.requestPermissions();

  return requested.display === "granted";
}

async function ensureChannel() {
  try {
    await LocalNotifications.createChannel({
      id: CHANNEL_ID,
      name: "日程提醒",
      description: "今日计划的时间提醒",
      importance: 4,
    });
  } catch {
    // 通道已经存在时可以忽略
  }
}

export async function schedulePlanReminder(plan: MobilePlan) {
  if (!plan.start_time || plan.status === "done") {
    return;
  }

  const date = getPlanDate(plan);

  if (!date || date.getTime() <= Date.now()) {
    return;
  }

  const allowed = await ensureNotificationPermission();

  if (!allowed) {
    return;
  }

  await ensureChannel();

  const id = notificationId(plan.id);

  await LocalNotifications.cancel({
    notifications: [{ id }],
  }).catch(() => undefined);

  await LocalNotifications.schedule({
    notifications: [
      {
        id,
        title: "今日计划提醒",
        body: plan.title,
        schedule: {
          at: date,
          allowWhileIdle: true,
        },
        channelId: CHANNEL_ID,
        autoCancel: true,
      },
    ],
  });
}

export async function cancelPlanReminder(planId: string) {
  const id = notificationId(planId);

  await LocalNotifications.cancel({
    notifications: [{ id }],
  }).catch(() => undefined);
}
