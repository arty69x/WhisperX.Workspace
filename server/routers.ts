import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";
import { systemRouter } from "./_core/systemRouter";
import { storagePut } from "./storage";
import { adminProcedure, protectedProcedure, publicProcedure, router } from "./_core/trpc";

const overviewStats = [
  {
    title: "Active boards",
    value: "24",
    delta: "+8%",
    detail: "visual workspaces ที่กำลังถูกใช้งานในรอบ 7 วันล่าสุด",
  },
  {
    title: "Workflow executions",
    value: "1,248",
    delta: "+19%",
    detail: "งานที่ผ่าน AI orchestration และ automation pipeline",
  },
  {
    title: "Skill templates",
    value: "83",
    delta: "+11%",
    detail: "prompt และ skill patterns ที่ reusable ภายในองค์กร",
  },
  {
    title: "Collaboration sync",
    value: "12 teams",
    delta: "Stable",
    detail: "ทีมที่มีการทำงานร่วมกันบน canvas และ diagram ภายใน workspace",
  },
] as const;

const moduleCards = [
  {
    title: "Canvas Studio",
    description: "whiteboard แบบ interactive สำหรับคิดงาน วางแผน และ annotate ร่วมกัน",
    path: "/workspace/canvas",
  },
  {
    title: "Diagram Builder",
    description: "เชื่อมต่อ flowchart และ mind map ด้วย nodes, ports และ relationship map",
    path: "/workspace/diagram",
  },
  {
    title: "AI Workflow",
    description: "ประกอบ LLM steps, routing rules และ execution states ภายในหน้าจอเดียว",
    path: "/workspace/workflows",
  },
  {
    title: "Skill Creator",
    description: "จัดการ reusable prompt systems พร้อมทดสอบผลลัพธ์ก่อนเผยแพร่",
    path: "/workspace/skills",
  },
] as const;

const activityFeed = [
  {
    title: "Canvas board “Launch Architecture” อัปเดต sticky cluster ใหม่",
    meta: "2 นาทีที่แล้ว · Collaborative board",
  },
  {
    title: "Workflow “Insight Summarizer” ผ่าน test run ด้วย confidence สูง",
    meta: "18 นาทีที่แล้ว · AI Workflow",
  },
  {
    title: "Diagram “Revenue Loop” เพิ่ม decision branch และ connector ใหม่",
    meta: "41 นาทีที่แล้ว · Diagram Builder",
  },
  {
    title: "Skill template “Executive Memo Writer” ถูกเผยแพร่เป็น shared template",
    meta: "1 ชั่วโมงที่แล้ว · Skill Creator",
  },
] as const;

const collaborationPresence = [
  { name: "Nara", role: "admin", state: "Reviewing workflows" },
  { name: "Keen", role: "user", state: "Editing board elements" },
  { name: "Mali", role: "user", state: "Preparing analytics snapshots" },
  { name: "Pim", role: "user", state: "Uploading source assets" },
] as const;

const runtimeFileAssets: Array<{ id: number; name: string; kind: string; size: string; module: string; url?: string }> = [];

const fileAssets = [
  { id: 1, name: "launch-board-assets.zip", kind: "archive", size: "18.4 MB" },
  { id: 2, name: "mindmap-reference.png", kind: "image", size: "4.2 MB" },
  { id: 3, name: "executive-brief.md", kind: "document", size: "124 KB" },
] as const;

const teamMembers = [
  { id: 1, name: "Nara V.", role: "admin", status: "Controls access and global templates" },
  { id: 2, name: "Keen S.", role: "user", status: "Builds whiteboards and workflow assets" },
  { id: 3, name: "Mali T.", role: "user", status: "Reviews analytics and delivery metrics" },
] as const;

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
    }),
  }),
  platform: router({
    landing: publicProcedure.query(() => ({
      headline: "All-in-One visual intelligence platform",
      stats: overviewStats,
      modules: moduleCards,
    })),
    overview: protectedProcedure.query(({ ctx }) => ({
      user: {
        name: ctx.user.name ?? "Workspace User",
        role: ctx.user.role,
      },
      stats: overviewStats,
      modules: moduleCards,
      activities: activityFeed,
      presence: collaborationPresence,
    })),
  }),
  workflows: router({
    suggest: protectedProcedure
      .input(
        z.object({
          goal: z.string().min(6),
        }),
      )
      .mutation(async ({ input }) => {
        try {
          const response = await invokeLLM({
            messages: [
              {
                role: "system",
                content:
                  "You design concise automation workflows for a professional all-in-one workspace. Return JSON only.",
              },
              {
                role: "user",
                content: `Create a short workflow plan for this goal: ${input.goal}`,
              },
            ],
            response_format: {
              type: "json_schema",
              json_schema: {
                name: "workflow_plan",
                strict: true,
                schema: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    steps: {
                      type: "array",
                      items: { type: "string" },
                      minItems: 3,
                    },
                    outcome: { type: "string" },
                  },
                  required: ["name", "steps", "outcome"],
                  additionalProperties: false,
                },
              },
            },
          });

          const content = response.choices[0]?.message?.content;
          const raw = typeof content === "string" ? content : JSON.stringify(content ?? {});
          const parsed = JSON.parse(raw) as {
            name: string;
            steps: string[];
            outcome: string;
          };

          return {
            source: "llm" as const,
            ...parsed,
          };
        } catch (error) {
          console.warn("[workflows.suggest] falling back to deterministic plan", error);
          return {
            source: "fallback" as const,
            name: "Operational workflow draft",
            steps: [
              "Collect input from canvas, files หรือข้อความต้นทาง",
              "ประมวลผลและจัดโครงผลลัพธ์ด้วย LLM layer",
              "ส่งออกเป็น summary, action items และ notification สำหรับทีม",
            ],
            outcome: `สร้าง workflow ตั้งต้นสำหรับเป้าหมาย: ${input.goal}`,
          };
        }
      }),
  }),
  skills: router({
    validateTemplate: protectedProcedure
      .input(
        z.object({
          name: z.string().min(3),
          prompt: z.string().min(12),
        }),
      )
      .mutation(({ input }) => {
        const checks = [
          {
            label: "Prompt length",
            passed: input.prompt.length >= 40,
            detail: "มีรายละเอียดมากพอสำหรับควบคุมพฤติกรรมของระบบ",
          },
          {
            label: "Named template",
            passed: input.name.trim().length >= 5,
            detail: "มีชื่อที่เหมาะกับการ reuse ใน workspace",
          },
          {
            label: "Operational intent",
            passed: /action|summary|output|json|analy/i.test(input.prompt),
            detail: "ระบุผลลัพธ์ที่คาดหวังชัดเจนสำหรับ test runner",
          },
        ];

        return {
          score: checks.filter(item => item.passed).length,
          checks,
          recommendation:
            checks.every(item => item.passed)
              ? "Template พร้อมสำหรับการใช้งานร่วมกับ workflow และ shared skills"
              : "ควรเพิ่มข้อกำหนดของ output และรูปแบบคำตอบให้ชัดเจนขึ้น",
        };
      }),
  }),
  files: router({
    list: protectedProcedure.query(() => {
      const items = [...runtimeFileAssets, ...fileAssets];
      return {
        items,
        total: items.length,
      };
    }),
    upload: protectedProcedure
      .input(
        z.object({
          fileName: z.string().min(1),
          contentType: z.string().min(3),
          contentBase64: z.string().min(8),
          module: z.string().min(2),
        }),
      )
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.contentBase64, "base64");
        const uploaded = await storagePut(`workspace/${input.module}/${input.fileName}`, buffer, input.contentType);
        const asset = {
          id: Date.now(),
          name: input.fileName,
          kind: input.contentType.split("/")[0] ?? "file",
          size: `${(buffer.byteLength / 1024).toFixed(1)} KB`,
          module: input.module,
          url: uploaded.url,
        };
        runtimeFileAssets.unshift(asset);
        return asset;
      }),
  }),
  collaboration: router({
    presence: protectedProcedure.query(() => ({
      members: collaborationPresence,
      syncState: "live-ready" as const,
      notificationChannel: "owner-ops" as const,
    })),
    notify: adminProcedure
      .input(
        z.object({
          title: z.string().min(3),
          content: z.string().min(8),
        }),
      )
      .mutation(async ({ input }) => {
        const delivered = await notifyOwner(input);
        return {
          success: delivered,
        };
      }),
  }),
  members: router({
    list: adminProcedure.query(() => teamMembers),
    currentAccess: protectedProcedure.query(({ ctx }) => ({
      role: ctx.user.role,
      canManageMembers: ctx.user.role === "admin",
    })),
  }),
  diagnostics: router({
    adminPing: adminProcedure.query(() => ({ ok: true })),
    protectedPing: protectedProcedure.query(() => ({ ok: true })),
    forbidGuests: publicProcedure.query(({ ctx }) => {
      if (!ctx.user) {
        throw new TRPCError({ code: "UNAUTHORIZED", message: "Authentication required" });
      }
      return { ok: true };
    }),
  }),
});

export type AppRouter = typeof appRouter;
