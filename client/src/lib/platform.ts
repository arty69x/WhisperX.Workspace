import {
  Activity,
  BrainCircuit,
  ChartNoAxesCombined,
  FolderKanban,
  LayoutDashboard,
  Network,
  PanelTop,
  PenTool,
  ShieldCheck,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";

export type NavigationItem = {
  icon: LucideIcon;
  label: string;
  path: string;
  description: string;
  adminOnly?: boolean;
};

export const platformNavigation: NavigationItem[] = [
  {
    icon: LayoutDashboard,
    label: "Overview",
    path: "/workspace",
    description: "ภาพรวมของโมดูลทั้งหมด สถานะทีม และสัญญาณการทำงานหลัก",
  },
  {
    icon: PenTool,
    label: "Canvas Studio",
    path: "/workspace/canvas",
    description: "surface สำหรับ whiteboard, freehand sketch และ collaborative annotations",
  },
  {
    icon: Network,
    label: "Diagram Builder",
    path: "/workspace/diagram",
    description: "สร้าง flowchart และ mind map ด้วย nodes, links และ visual structure",
  },
  {
    icon: BrainCircuit,
    label: "AI Workflow",
    path: "/workspace/workflows",
    description: "ประกอบ orchestration flows, LLM steps และ execution guidance",
  },
  {
    icon: Sparkles,
    label: "Skill Creator",
    path: "/workspace/skills",
    description: "จัดการ prompt systems, reusable skills และ validation routines",
  },
  {
    icon: ChartNoAxesCombined,
    label: "Analytics",
    path: "/workspace/analytics",
    description: "สรุป performance, activity signals และ operational metrics ของแพลตฟอร์ม",
  },
  {
    icon: FolderKanban,
    label: "File Hub",
    path: "/workspace/files",
    description: "จัดเก็บและเชื่อมไฟล์สำหรับ canvas, workflow runs และ shared assets",
  },
  {
    icon: Users,
    label: "Members",
    path: "/workspace/members",
    description: "ดูสมาชิก สิทธิ์การเข้าถึง และการควบคุมบทบาทแบบ admin-first",
    adminOnly: true,
  },
];

export const landingHighlights = [
  {
    eyebrow: "One workspace, many engines",
    title: "Canvas, workflows, diagrams และ collaboration ทำงานเป็นระบบเดียว",
    description:
      "แพลตฟอร์มนี้เชื่อม visual thinking, AI orchestration และ operational visibility เข้าด้วยกันอย่างต่อเนื่อง เพื่อให้ทีมออกแบบ วางแผน สร้าง และวัดผลได้จากที่เดียว",
  },
  {
    eyebrow: "Elegant by default",
    title: "ประสบการณ์ใช้งานระดับเครื่องมือมืออาชีพด้วย hierarchy ที่อ่านง่ายและนิ่งพอสำหรับงานจริง",
    description:
      "ตั้งแต่ landing page ไปจนถึง workspace shell ทุกระยะของ typography, spacing, motion และ contrast ถูกจัดให้รองรับทั้งการนำเสนอและการใช้งานระยะยาว",
  },
  {
    eyebrow: "Built for governed scale",
    title: "มีทั้ง role-based access, analytics, file hub และ collaboration ในแกนเดียวกัน",
    description:
      "ระบบสิทธิ์ การมองเห็นข้อมูล และ operational surfaces ถูกจัดวางตั้งแต่ต้น เพื่อให้การขยายจาก personal workspace ไปสู่ทีมทำงานจริงเกิดขึ้นได้อย่างมั่นคง",
  },
];

export const luxuryMetrics = [
  { label: "Workspace modules", value: "7", caption: "ครอบคลุม visual, AI orchestration, analytics และ governed operations" },
  { label: "Operational visibility", value: "99%", caption: "สัญญาณสำคัญและ activity summaries ถูกรวมใน dashboard เดียว" },
  { label: "Collaboration readiness", value: "Live", caption: "รองรับ shared surfaces, presence และ notification-oriented flows" },
];

export const overviewTiles = [
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
];

export const moduleSpotlights = [
  {
    title: "Canvas Studio",
    description: "whiteboard แบบ interactive สำหรับคิดงาน วางแผน annotate และจัดองค์ประกอบร่วมกัน",
    path: "/workspace/canvas",
  },
  {
    title: "Diagram Builder",
    description: "เชื่อมต่อ flowchart, mind map และ decision structures ผ่าน visual nodes",
    path: "/workspace/diagram",
  },
  {
    title: "AI Workflow",
    description: "ประกอบ LLM steps, routing rules และ execution states ภายในหน้าจอเดียว",
    path: "/workspace/workflows",
  },
  {
    title: "Skill Creator",
    description: "จัดการ reusable prompt systems พร้อมทดสอบผลลัพธ์ก่อนเผยแพร่สู่ทีม",
    path: "/workspace/skills",
  },
];

export const recentActivities = [
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
];

export const memberPresence = [
  { name: "Nara", role: "admin", state: "Reviewing workflows" },
  { name: "Keen", role: "user", state: "Editing board elements" },
  { name: "Mali", role: "user", state: "Preparing analytics snapshots" },
  { name: "Pim", role: "user", state: "Uploading source assets" },
];

export const workspaceCommandPills = [
  "Canvas + Diagram coherence",
  "LLM-assisted workflows",
  "Role-governed operations",
  "Shared file surfaces",
];

export const dashboardSignals = [
  {
    title: "Cross-module continuity",
    description: "ผู้ใช้สามารถไล่งานจาก ideation ไปสู่ execution โดยไม่หลุดบริบทระหว่างโมดูล",
  },
  {
    title: "Designed operationally",
    description: "ทั้ง overview, collaboration feed และ action surfaces ถูกจัดลำดับเพื่อรองรับการใช้งานต่อเนื่องทั้งวัน",
  },
  {
    title: "Admin-aware shell",
    description: "sidebar และ permissions ถูกออกแบบให้ขยายสู่ทีมจริงได้โดยไม่เพิ่มภาระ cognitive load",
  },
];
