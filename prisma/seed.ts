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
      avatarColor: "#FF8077",
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
  ];

  const people: Record<string, string> = {};
  for (const name of personNames) {
    const p = await db.person.create({
      data: { name, avatarColor: avatarPalette[name] ?? "#996CE4" },
    });
    people[name] = p.id;
  }
  const demoPerson = await db.person.create({
    data: { name: "Demo User", avatarColor: "#FF8077", userId: demoUser.id },
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
  const goal2 = await db.goal.create({
    data: {
      title: "Q3 Content Marketing Campaign",
      description: "Drive 25% more organic traffic with a coordinated Q3 content push across blog, social and email.",
      status: "done",
      targetDate: d("2026-08-15T00:00:00Z"),
      sortOrder: 2,
      createdAt: d("2026-05-06T10:00:00Z"),
    },
  });

  const g2tasks: Array<{ title: string; status: string; deadline: string; assignee: string; hours: number }> = [
    { title: "Define campaign messaging and pillars", status: "done", deadline: "2026-06-05T00:00:00Z", assignee: "Growth Team", hours: 6 },
    { title: "Draft content calendar (12 weeks)", status: "done", deadline: "2026-06-10T00:00:00Z", assignee: "Growth Team", hours: 8 },
    { title: "Write cornerstone blog post", status: "done", deadline: "2026-06-18T00:00:00Z", assignee: "Ella Head Glazer", hours: 10 },
    { title: "Design social media assets", status: "done", deadline: "2026-06-24T00:00:00Z", assignee: "Sarah Johnson", hours: 12 },
    { title: "Set up email nurture sequence", status: "done", deadline: "2026-06-30T00:00:00Z", assignee: "Ella Head Glazer", hours: 6 },
    { title: "Publish week-1 blog and social posts", status: "done", deadline: "2026-07-03T00:00:00Z", assignee: "Marcus Lee", hours: 4 },
    { title: "Publish LinkedIn thought-leadership posts", status: "done", deadline: "2026-07-10T00:00:00Z", assignee: "Marcus Lee", hours: 5 },
    { title: "Compile mid-campaign analytics report", status: "done", deadline: "2026-07-20T00:00:00Z", assignee: "Growth Team", hours: 8 },
    { title: "Run retargeting ad experiment", status: "done", deadline: "2026-08-01T00:00:00Z", assignee: "Growth Team", hours: 10 },
    { title: "Final campaign wrap-up and learnings doc", status: "done", deadline: "2026-08-15T00:00:00Z", assignee: "Marcus Lee", hours: 6 },
  ];

  order = 0;
  for (const t of g2tasks) {
    order += 1;
    await db.task.create({
      data: {
        goalId: goal2.id,
        title: t.title,
        status: t.status,
        deadline: d(t.deadline),
        assigneeId: people[t.assignee]!,
        estimatedHours: t.hours,
        createdByAi: true,
        sortOrder: order,
        createdAt: d("2026-05-06T10:30:00Z"),
      },
    });
  }

  // ---- Goal 3: Launch new landing page (active, 8/9, 1 overdue) ----
  const goal3 = await db.goal.create({
    data: {
      title: "Launch new landing page",
      description: "Ship a redesigned marketing landing page with clearer positioning and a stronger call to action.",
      status: "active",
      targetDate: d("2026-07-30T00:00:00Z"),
      sortOrder: 3,
      createdAt: d("2026-05-08T11:00:00Z"),
    },
  });

  const g3tasks: Array<{ title: string; status: string; deadline: string; assignee: string; hours: number }> = [
    { title: "Audit current landing page performance", status: "done", deadline: "2026-06-02T00:00:00Z", assignee: "Growth Team", hours: 4 },
    { title: "Define messaging and value proposition", status: "done", deadline: "2026-06-06T00:00:00Z", assignee: "Ella Head Glazer", hours: 5 },
    { title: "Wireframe key sections", status: "done", deadline: "2026-06-12T00:00:00Z", assignee: "Sarah Johnson", hours: 8 },
    { title: "Design final visuals and hero", status: "done", deadline: "2026-06-20T00:00:00Z", assignee: "Sarah Johnson", hours: 14 },
    { title: "Build page and CMS wiring", status: "done", deadline: "2026-06-28T00:00:00Z", assignee: "Dev Team", hours: 18 },
    { title: "Integrate analytics and event tracking", status: "done", deadline: "2026-07-05T00:00:00Z", assignee: "Dev Team", hours: 6 },
    { title: "Cross-browser and mobile QA", status: "done", deadline: "2026-07-12T00:00:00Z", assignee: "QA Team", hours: 8 },
    { title: "SEO review and metadata pass", status: "done", deadline: "2026-07-18T00:00:00Z", assignee: "Ella Head Glazer", hours: 4 },
    { title: "Set up A/B test variants", status: "pending", deadline: "2026-08-20T00:00:00Z", assignee: "Growth Team", hours: 6 },
  ];

  order = 0;
  for (const t of g3tasks) {
    order += 1;
    await db.task.create({
      data: {
        goalId: goal3.id,
        title: t.title,
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

  // ---- Agent activity log (mirrors the reference feed) ----
  const activity: Array<{ type: string; message: string; detail: string; at: string }> = [
    { type: "goal_created", message: "Product Onboarding Redesign created", detail: "AI created the goal \"Product Onboarding Redesign\".", at: "2026-05-04T09:00:00Z" },
    { type: "tasks_generated", message: "Generated 10 tasks for \"Product Onboarding Redesign\"", detail: "AI generated 10 tasks for the goal \"Product Onboarding Redesign\".", at: "2026-05-04T09:05:00Z" },
    { type: "task_assigned", message: "Priya Sharma assigned to \"User research interviews (10 users)\"", detail: "AI assigned \"User research interviews (10 users)\" to Priya Sharma.", at: "2026-07-16T10:00:00Z" },
    { type: "goal_created", message: "Q3 Content Marketing Campaign created", detail: "AI created the goal \"Q3 Content Marketing Campaign\".", at: "2026-05-06T10:00:00Z" },
    { type: "tasks_generated", message: "Generated 10 tasks for \"Q3 Content Marketing Campaign\"", detail: "AI generated 10 tasks for the goal \"Q3 Content Marketing Campaign\".", at: "2026-05-06T10:05:00Z" },
    { type: "task_assigned", message: "Growth Team assigned to \"Compile mid-campaign analytics report\"", detail: "AI assigned \"Compile mid-campaign analytics report\" to Growth Team.", at: "2026-05-06T10:10:00Z" },
    { type: "task_assigned", message: "Sarah Johnson assigned to \"Design social media assets\"", detail: "AI assigned \"Design social media assets\" to Sarah Johnson.", at: "2026-05-06T10:12:00Z" },
    { type: "goal_created", message: "Launch new landing page created", detail: "AI created the goal \"Launch new landing page\".", at: "2026-05-08T11:00:00Z" },
    { type: "tasks_generated", message: "Generated 9 tasks for \"Launch new landing page\"", detail: "AI generated 9 tasks for the goal \"Launch new landing page\".", at: "2026-05-08T11:05:00Z" },
    { type: "task_assigned", message: "Ran Ezra assigned to \"Audit current onboarding drop-off points\"", detail: "AI assigned \"Audit current onboarding drop-off points\" to Ran Ezra.", at: "2026-05-08T11:08:00Z" },
    { type: "task_assigned", message: "Marcus Lee assigned to \"Publish LinkedIn thought-leadership posts\"", detail: "AI assigned \"Publish LinkedIn thought-leadership posts\" to Marcus Lee.", at: "2026-05-10T09:00:00Z" },
    { type: "task_assigned", message: "QA Team assigned to \"QA and edge-case testing\"", detail: "AI assigned \"QA and edge-case testing\" to QA Team.", at: "2026-05-12T09:30:00Z" },
    { type: "task_assigned", message: "Marcus Lee assigned to \"Final campaign wrap-up and learnings doc\"", detail: "AI assigned \"Final campaign wrap-up and learnings doc\" to Marcus Lee.", at: "2026-05-14T10:00:00Z" },
    { type: "task_assigned", message: "Dev Team assigned to \"Frontend implementation\"", detail: "AI assigned \"Frontend implementation\" to Dev Team.", at: "2026-05-15T14:00:00Z" },
    { type: "task_assigned", message: "Ella Head Glazer assigned to \"Write onboarding welcome email sequence\"", detail: "AI assigned \"Write onboarding welcome email sequence\" to Ella Head Glazer.", at: "2026-05-20T09:15:00Z" },
    { type: "task_assigned", message: "Sarah Johnson assigned to \"Design high-fidelity mockups\"", detail: "AI assigned \"Design high-fidelity mockups\" to Sarah Johnson.", at: "2026-05-22T13:00:00Z" },
    { type: "task_assigned", message: "Priya Sharma assigned to \"Prototype and usability testing\"", detail: "AI assigned \"Prototype and usability testing\" to Priya Sharma.", at: "2026-05-28T11:00:00Z" },
    { type: "status_update", message: "Ran Ezra checked in on \"Audit current onboarding drop-off points\"", detail: "Ran Ezra posted a status update: Blocked.", at: "2026-06-30T16:00:00Z" },
    { type: "status_update", message: "Shelly Genosar checked in on \"Review Q3 project milestones\"", detail: "Shelly Genosar posted a status update: Blocked.", at: "2026-07-02T15:30:00Z" },
    { type: "status_update", message: "Dev Team marked \"Build page and CMS wiring\" as done", detail: "Dev Team posted a status update: Done.", at: "2026-07-05T17:00:00Z" },
    { type: "status_update", message: "QA Team marked \"Cross-browser and mobile QA\" as done", detail: "QA Team posted a status update: Done.", at: "2026-07-12T12:00:00Z" },
    { type: "status_update", message: "Priya Sharma marked \"Go-live and monitor activation metrics\" as pending", detail: "Priya Sharma posted a status update: On Track.", at: "2026-07-16T09:45:00Z" },
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
