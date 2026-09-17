import { db } from "@/lib/db";
import { ok, fail, requireSession } from "@/lib/api";
import type { DashboardStats } from "@/lib/orbital";

export async function GET() {
  const session = await requireSession();
  if (!session) return fail("UNAUTHORIZED", "Not signed in", 401);

  const now = new Date();

  const [totalTasks, doneTasks, blockedTasks, overdueTasks, activeGoals] = await Promise.all([
    db.task.count(),
    db.task.count({ where: { status: "done" } }),
    db.task.count({ where: { status: "blocked" } }),
    db.task.count({
      where: {
        status: { not: "done" },
        deadline: { lt: now },
      },
    }),
    db.goal.count({ where: { status: "active" } }),
  ]);

  const stats: DashboardStats = {
    totalTasks,
    doneTasks,
    blockedTasks,
    overdueTasks,
    activeGoals,
    completionRate: totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100),
  };

  return ok(stats);
}
