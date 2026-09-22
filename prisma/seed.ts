// Seed: mirrors the reference app's demo workspace (ORBITAL).
// Idempotent: clears domain tables, then inserts the canonical demo data.
// Run: bunx tsx prisma/seed.ts  (or: bun prisma/seed.ts)

import { PrismaClient } from "@prisma/client";
import { scryptSync, randomBytes } from "crypto";

const db = new PrismaClient();

function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function d(iso: string): Date {
  return new Date(iso);
}

async function main() {
  // Idempotency: wipe domain data, keep schema.
  await db.activityLog.deleteMany();
  await db.taskUpdate.deleteMany();
  await db.task.deleteMany();
  await db.goal.deleteMany();
  await db.teamMember.deleteMany();
  await db.person.deleteMany();
  await db.user.deleteMany();
  await db.workspaceSetting.deleteMany();

  await db.workspaceSetting.create({
    data: { id: "singleton", name: "My Team", workStart: "09:00", workEnd: "17:00", pingFrequency: "once_daily", aiTone: "friendly" },
  });

  const demoUser = await db.user.create({
    data: {
      email: "demo@orbital.app",
      name: "Demo User",
      passwordHash: hashPassword("Demo1234!"),
      avatarColor: "#FFCBDE",
    },
  });

  const avatarPalette: Record<string, string> = {
    "Shelly Genosar": "#996CE4",
    "Priya Sharma": "#2ECC8A",
    "Sarah Johnson": "#FF8077",
    "Dev Team": "#C4996A",
    "QA Team": "#C9B3F5",
    "Ran Ezra": "#FFCBDE",
    "Marcus Lee": "#996CE4",
    "Ella Head Glazer": "#2ECC8A",
    "Growth Team": "#FF8077",
    // v2.5 (measured on the live's regenerated plans): two new assignees —
    // goal 3's A/B task (Templates Base44) and goal 2's blog-posts task
    // (Content Team). Avatar colors are unobservable in the live UI (its
    // assignees are free text — the add-task select lists only
    // "— Unassigned —"), so these continue the palette rotation.
    "Templates Base44": "#C9B3F5",
    "Content Team": "#996CE4",
    "Demo User": "#FF8077",
  };

  const personNames = [
    "Shelly Genosar",
    "Priya Sharma",
    "Sarah Johnson",
    "Dev Team",
    "QA Team",
    "Ran Ezra",
    "Marcus Lee",
    "Ella Head Glazer",
    "Growth Team",
    "Templates Base44",
    "Content Team",
  ];

  const people: Record<string, string> = {};
  for (const name of personNames) {
    const p = await db.person.create({
      data: { name, avatarColor: avatarPalette[name] ?? "#996CE4" },
    });
    people[name] = p.id;
  }
  const demoPerson = await db.person.create({
    data: { name: "Demo User", avatarColor: "#FFCBDE", userId: demoUser.id },
  });

  // ---- Goal 1: Product Onboarding Redesign (active, 8/12 done, 2 blocked) ----
  const goal1 = await db.goal.create({
    data: {
      title: "Product Onboarding Redesign",
      description: "Redesign the user onboarding flow to improve activation rates.",
      status: "active",
      targetDate: d("2026-09-01T00:00:00Z"),
      sortOrder: 1,
      createdAt: d("2026-05-04T09:00:00Z"),
    },
  });

  const g1tasks: Array<{
    title: string;
    description?: string;
    status: string;
    deadline?: string;
    assignee: string;
    hours: number;
    ai: boolean;
  }> = [
    { title: "Review Q3 project milestones", description: "Go over all Q3 milestones and ensure each team member is aligned with the delivery timeline.", status: "blocked", assignee: "Shelly Genosar", hours: 2, ai: false },
    { title: "User research interviews (10 users)", status: "done", deadline: "2026-06-20T00:00:00Z", assignee: "Priya Sharma", hours: 10, ai: true },
    { title: "Analyse drop-off points in current flow", status: "done", deadline: "2026-06-25T00:00:00Z", assignee: "Priya Sharma", hours: 6, ai: true },
    { title: "Map new onboarding journey", status: "done", deadline: "2026-07-01T00:00:00Z", assignee: "Priya Sharma", hours: 5, ai: true },
    { title: "Design high-fidelity mockups", status: "done", deadline: "2026-07-08T00:00:00Z", assignee: "Sarah Johnson", hours: 12, ai: true },
    { title: "Prototype and usability testing", status: "done", deadline: "2026-07-15T00:00:00Z", assignee: "Priya Sharma", hours: 8, ai: true },
    { title: "Frontend implementation", status: "done", deadline: "2026-07-22T00:00:00Z", assignee: "Dev Team", hours: 20, ai: true },
    { title: "QA and edge-case testing", status: "done", deadline: "2026-08-10T00:00:00Z", assignee: "QA Team", hours: 8, ai: true },
    { title: "Go-live and monitor activation metrics", status: "pending", deadline: "2026-09-01T00:00:00Z", assignee: "Priya Sharma", hours: 4, ai: true },
    { title: "Write onboarding welcome email sequence", description: "Create a 3-part email sequence for new users covering key features.", status: "done", deadline: "2026-07-15T00:00:00Z", assignee: "Ella Head Glazer", hours: 4, ai: true },
    { title: "Design interactive product tour", description: "Build a step-by-step in-app tour for first-time users highlighting core workflows.", status: "pending", deadline: "2026-07-20T00:00:00Z", assignee: "Ran Ezra", hours: 8, ai: true },
    { title: "Audit current onboarding drop-off points", description: "Analyze funnel data to identify where users abandon the onboarding flow.", status: "blocked", deadline: "2026-07-12T00:00:00Z", assignee: "Ran Ezra", hours: 6, ai: true },
  ];

  let order = 0;
  for (const t of g1tasks) {
    order += 1;
    await db.task.create({
      data: {
        goalId: goal1.id,
        title: t.title,
        description: t.description ?? null,
        status: t.status,
        deadline: t.deadline ? d(t.deadline) : null,
        assigneeId: people[t.assignee]!,
        estimatedHours: t.hours,
        createdByAi: t.ai,
        sortOrder: order,
        createdAt: d("2026-05-04T09:30:00Z"),
      },
    });
  }

  // ---- Goal 2: Q3 Content Marketing Campaign (completed, 10/10) ----
  // v2.5: the live regenerated this plan — new description + new task set
  // (measured 2026-09-22), incl. the manual no-AI "Draft Q3 blog post
  // calendar" task rendered last (sortOrder 10).
  const goal2 = await db.goal.create({
    data: {
      title: "Q3 Content Marketing Campaign",
      description: "Plan and execute a full content marketing campaign including blog posts, social and email.",
      status: "done",
      targetDate: d("2026-08-15T00:00:00Z"),
      sortOrder: 3,
      createdAt: d("2026-05-06T10:00:00Z"),
    },
  });

  const g2tasks: Array<{ title: string; description?: string; status: string; deadline: string; assignee: string; hours: number; ai?: boolean }> = [
    { title: "Define content calendar for July–August", status: "done", deadline: "2026-06-28T00:00:00Z", assignee: "Marcus Lee", hours: 4 },
    { title: "Write 4 long-form blog posts", status: "done", deadline: "2026-07-05T00:00:00Z", assignee: "Content Team", hours: 16 },
    { title: "Design social media assets", status: "done", deadline: "2026-07-08T00:00:00Z", assignee: "Sarah Johnson", hours: 8 },
    { title: "Set up email drip campaign", status: "done", deadline: "2026-07-10T00:00:00Z", assignee: "Marcus Lee", hours: 6 },
    { title: "Publish LinkedIn thought-leadership posts", status: "done", deadline: "2026-07-15T00:00:00Z", assignee: "Marcus Lee", hours: 3 },
    { title: "Launch paid social ads", status: "done", deadline: "2026-07-18T00:00:00Z", assignee: "Growth Team", hours: 5 },
    { title: "A/B test email subject lines", status: "done", deadline: "2026-07-25T00:00:00Z", assignee: "Marcus Lee", hours: 4 },
    { title: "Compile mid-campaign analytics report", status: "done", deadline: "2026-08-01T00:00:00Z", assignee: "Growth Team", hours: 5 },
    { title: "Final campaign wrap-up and learnings doc", status: "done", deadline: "2026-08-15T00:00:00Z", assignee: "Marcus Lee", hours: 3 },
    { title: "Draft Q3 blog post calendar", description: "Plan 12 blog post topics aligned with campaign themes and assign writers.", status: "done", deadline: "2026-07-05T00:00:00Z", assignee: "Ella Head Glazer", hours: 2, ai: false },
  ];

  order = 0;
  for (const t of g2tasks) {
    order += 1;
    await db.task.create({
      data: {
        goalId: goal2.id,
        title: t.title,
        description: t.description ?? null,
        status: t.status,
        deadline: d(t.deadline),
        assigneeId: people[t.assignee]!,
        estimatedHours: t.hours,
        createdByAi: t.ai ?? true,
        sortOrder: order,
        createdAt: d("2026-05-06T10:30:00Z"),
      },
    });
  }

  // ---- Goal 3: Launch new landing page (active, 8/9, 1 overdue) ----
  // v2.5: the live regenerated this plan too — new description + new task
  // set (measured 2026-09-22), incl. Templates Base44's overdue in-progress
  // A/B task.
  const goal3 = await db.goal.create({
    data: {
      title: "Launch new landing page",
      description: "Design, build and deploy a new marketing landing page for the Q3 campaign.",
      status: "active",
      targetDate: d("2026-07-30T00:00:00Z"),
      sortOrder: 2,
      createdAt: d("2026-05-08T11:00:00Z"),
    },
  });

  const g3tasks: Array<{ title: string; description?: string; status: string; deadline: string; assignee: string; hours: number }> = [
    { title: "Design hero section wireframes", status: "done", deadline: "2026-07-05T00:00:00Z", assignee: "Sarah Johnson", hours: 6 },
    { title: "Write homepage copy", status: "done", deadline: "2026-07-07T00:00:00Z", assignee: "Marcus Lee", hours: 4 },
    { title: "Develop responsive layout", status: "done", deadline: "2026-07-10T00:00:00Z", assignee: "Dev Team", hours: 12 },
    { title: "Integrate analytics tracking", status: "done", deadline: "2026-07-12T00:00:00Z", assignee: "Dev Team", hours: 3 },
    { title: "SEO optimization and meta tags", status: "done", deadline: "2026-07-14T00:00:00Z", assignee: "Sarah Johnson", hours: 4 },
    { title: "Cross-browser testing", status: "done", deadline: "2026-07-18T00:00:00Z", assignee: "QA Team", hours: 8 },
    { title: "Performance optimization", status: "done", deadline: "2026-07-20T00:00:00Z", assignee: "Dev Team", hours: 5 },
    { title: "Final sign-off and deploy", status: "done", deadline: "2026-07-30T00:00:00Z", assignee: "Sarah Johnson", hours: 2 },
    { title: "Set up A/B test for landing page hero", description: "Configure two hero variants and define success metrics for the test.", status: "in_progress", deadline: "2026-07-10T00:00:00Z", assignee: "Templates Base44", hours: 3 },
  ];

  order = 0;
  for (const t of g3tasks) {
    order += 1;
    await db.task.create({
      data: {
        goalId: goal3.id,
        title: t.title,
        description: t.description ?? null,
        status: t.status,
        deadline: d(t.deadline),
        assigneeId: people[t.assignee]!,
        estimatedHours: t.hours,
        createdByAi: true,
        sortOrder: order,
        createdAt: d("2026-05-08T11:30:00Z"),
      },
    });
  }

  // ---- Agent activity log (mirrors the reference feed, v2.5) ----
  // The live's workspace was regenerated: "Online · 36" — 3 goal_analyzed +
  // 3 tasks_generated (12/9/10) + 30 task_assigned, ALL stamped 2026-07-16
  // (a single "Thu Jul 16 2026" group, every row "2 months ago"), newest
  // first in exactly the order below. Timestamps sit mid-day UTC so the
  // local-calendar-day grouping lands on Jul 16 in any sane timezone.
  const activity: Array<{ type: string; message: string; detail: string; at: string }> = [
    { type: "goal_analyzed", message: "Analyzed goal: Product Onboarding Redesign", detail: "AI analyzed the goal \"Product Onboarding Redesign\" and prepared to generate tasks.", at: "2026-07-16T14:00:00Z" },
    { type: "tasks_generated", message: "Generated 12 tasks for \"Product Onboarding Redesign\"", detail: "AI generated 12 tasks for the goal \"Product Onboarding Redesign\".", at: "2026-07-16T13:55:00Z" },
    { type: "goal_analyzed", message: "Analyzed goal: Launch new landing page", detail: "AI analyzed the goal \"Launch new landing page\" and prepared to generate tasks.", at: "2026-07-16T13:50:00Z" },
    { type: "tasks_generated", message: "Generated 9 tasks for \"Launch new landing page\"", detail: "AI generated 9 tasks for the goal \"Launch new landing page\".", at: "2026-07-16T13:45:00Z" },
    { type: "goal_analyzed", message: "Analyzed goal: Q3 Content Marketing Campaign", detail: "AI analyzed the goal \"Q3 Content Marketing Campaign\" and prepared to generate tasks.", at: "2026-07-16T13:40:00Z" },
    { type: "tasks_generated", message: "Generated 10 tasks for \"Q3 Content Marketing Campaign\"", detail: "AI generated 10 tasks for the goal \"Q3 Content Marketing Campaign\".", at: "2026-07-16T13:35:00Z" },
    { type: "task_assigned", message: "Ran Ezra assigned to \"Review Q3 project milestones\"", detail: "AI assigned \"Review Q3 project milestones\" to Ran Ezra.", at: "2026-07-16T13:30:00Z" },
    { type: "task_assigned", message: "Ella Head Glazer assigned to \"Write onboarding welcome email sequence\"", detail: "AI assigned \"Write onboarding welcome email sequence\" to Ella Head Glazer.", at: "2026-07-16T13:25:00Z" },
    { type: "task_assigned", message: "Ran Ezra assigned to \"Design interactive product tour\"", detail: "AI assigned \"Design interactive product tour\" to Ran Ezra.", at: "2026-07-16T13:20:00Z" },
    { type: "task_assigned", message: "Templates Base44 assigned to \"Set up A/B test for landing page hero\"", detail: "AI assigned \"Set up A/B test for landing page hero\" to Templates Base44.", at: "2026-07-16T13:15:00Z" },
    { type: "task_assigned", message: "Ran Ezra assigned to \"Audit current onboarding drop-off points\"", detail: "AI assigned \"Audit current onboarding drop-off points\" to Ran Ezra.", at: "2026-07-16T13:10:00Z" },
    { type: "task_assigned", message: "Sarah Johnson assigned to \"Design hero section wireframes\"", detail: "AI assigned \"Design hero section wireframes\" to Sarah Johnson.", at: "2026-07-16T13:05:00Z" },
    { type: "task_assigned", message: "Sarah Johnson assigned to \"Final sign-off and deploy\"", detail: "AI assigned \"Final sign-off and deploy\" to Sarah Johnson.", at: "2026-07-16T13:00:00Z" },
    { type: "task_assigned", message: "Marcus Lee assigned to \"Publish LinkedIn thought-leadership posts\"", detail: "AI assigned \"Publish LinkedIn thought-leadership posts\" to Marcus Lee.", at: "2026-07-16T12:55:00Z" },
    { type: "task_assigned", message: "QA Team assigned to \"QA and edge-case testing\"", detail: "AI assigned \"QA and edge-case testing\" to QA Team.", at: "2026-07-16T12:50:00Z" },
    { type: "task_assigned", message: "Dev Team assigned to \"Integrate analytics tracking\"", detail: "AI assigned \"Integrate analytics tracking\" to Dev Team.", at: "2026-07-16T12:45:00Z" },
    { type: "task_assigned", message: "QA Team assigned to \"Cross-browser testing\"", detail: "AI assigned \"Cross-browser testing\" to QA Team.", at: "2026-07-16T12:40:00Z" },
    { type: "task_assigned", message: "Marcus Lee assigned to \"Define content calendar for July–August\"", detail: "AI assigned \"Define content calendar for July–August\" to Marcus Lee.", at: "2026-07-16T12:35:00Z" },
    { type: "task_assigned", message: "Growth Team assigned to \"Launch paid social ads\"", detail: "AI assigned \"Launch paid social ads\" to Growth Team.", at: "2026-07-16T12:30:00Z" },
    { type: "task_assigned", message: "Priya Sharma assigned to \"Map new onboarding journey\"", detail: "AI assigned \"Map new onboarding journey\" to Priya Sharma.", at: "2026-07-16T12:25:00Z" },
    { type: "task_assigned", message: "Dev Team assigned to \"Frontend implementation\"", detail: "AI assigned \"Frontend implementation\" to Dev Team.", at: "2026-07-16T12:20:00Z" },
    { type: "task_assigned", message: "Marcus Lee assigned to \"Set up email drip campaign\"", detail: "AI assigned \"Set up email drip campaign\" to Marcus Lee.", at: "2026-07-16T12:15:00Z" },
    { type: "task_assigned", message: "Dev Team assigned to \"Develop responsive layout\"", detail: "AI assigned \"Develop responsive layout\" to Dev Team.", at: "2026-07-16T12:10:00Z" },
    { type: "task_assigned", message: "Priya Sharma assigned to \"Go-live and monitor activation metrics\"", detail: "AI assigned \"Go-live and monitor activation metrics\" to Priya Sharma.", at: "2026-07-16T12:05:00Z" },
    { type: "task_assigned", message: "Marcus Lee assigned to \"Write homepage copy\"", detail: "AI assigned \"Write homepage copy\" to Marcus Lee.", at: "2026-07-16T11:55:00Z" },
    { type: "task_assigned", message: "Sarah Johnson assigned to \"Design high-fidelity mockups\"", detail: "AI assigned \"Design high-fidelity mockups\" to Sarah Johnson.", at: "2026-07-16T11:50:00Z" },
    { type: "task_assigned", message: "Priya Sharma assigned to \"Analyse drop-off points in current flow\"", detail: "AI assigned \"Analyse drop-off points in current flow\" to Priya Sharma.", at: "2026-07-16T11:45:00Z" },
    { type: "task_assigned", message: "Priya Sharma assigned to \"Prototype and usability testing\"", detail: "AI assigned \"Prototype and usability testing\" to Priya Sharma.", at: "2026-07-16T11:40:00Z" },
    { type: "task_assigned", message: "Dev Team assigned to \"Performance optimization\"", detail: "AI assigned \"Performance optimization\" to Dev Team.", at: "2026-07-16T11:35:00Z" },
    { type: "task_assigned", message: "Priya Sharma assigned to \"User research interviews (10 users)\"", detail: "AI assigned \"User research interviews (10 users)\" to Priya Sharma.", at: "2026-07-16T11:30:00Z" },
    { type: "task_assigned", message: "Sarah Johnson assigned to \"SEO optimization and meta tags\"", detail: "AI assigned \"SEO optimization and meta tags\" to Sarah Johnson.", at: "2026-07-16T11:25:00Z" },
    { type: "task_assigned", message: "Marcus Lee assigned to \"A/B test email subject lines\"", detail: "AI assigned \"A/B test email subject lines\" to Marcus Lee.", at: "2026-07-16T11:20:00Z" },
    { type: "task_assigned", message: "Marcus Lee assigned to \"Final campaign wrap-up and learnings doc\"", detail: "AI assigned \"Final campaign wrap-up and learnings doc\" to Marcus Lee.", at: "2026-07-16T11:15:00Z" },
    { type: "task_assigned", message: "Content Team assigned to \"Write 4 long-form blog posts\"", detail: "AI assigned \"Write 4 long-form blog posts\" to Content Team.", at: "2026-07-16T11:10:00Z" },
    { type: "task_assigned", message: "Growth Team assigned to \"Compile mid-campaign analytics report\"", detail: "AI assigned \"Compile mid-campaign analytics report\" to Growth Team.", at: "2026-07-16T11:05:00Z" },
    { type: "task_assigned", message: "Sarah Johnson assigned to \"Design social media assets\"", detail: "AI assigned \"Design social media assets\" to Sarah Johnson.", at: "2026-07-16T11:00:00Z" },
  ];

  for (const a of activity) {
    await db.activityLog.create({
      data: { type: a.type, message: a.message, detail: a.detail, createdAt: d(a.at) },
    });
  }

  const counts = {
    goals: await db.goal.count(),
    tasks: await db.task.count(),
    people: await db.person.count(),
    activity: await db.activityLog.count(),
  };
  console.log("Seeded:", counts, "demo person id:", demoPerson.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
