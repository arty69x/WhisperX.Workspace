import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import {
  landingHighlights,
  luxuryMetrics,
  moduleSpotlights,
  platformNavigation,
  workspaceCommandPills,
} from "@/lib/platform";
import {
  ArrowRight,
  BrainCircuit,
  ChartNoAxesCombined,
  Network,
  PanelTop,
  PenTool,
  ShieldCheck,
  Sparkles,
  Workflow,
} from "lucide-react";
import { Link } from "wouter";

const icons = [PenTool, Network, BrainCircuit, ChartNoAxesCombined];

export default function Home() {
  const { user, isAuthenticated } = useAuth();

  const primaryHref = isAuthenticated ? "/workspace" : getLoginUrl();
  const secondaryHref = isAuthenticated ? "/workspace/canvas" : "/workspace";

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(114,92,255,0.24),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(32,212,201,0.16),transparent_26%),radial-gradient(circle_at_50%_100%,rgba(255,255,255,0.08),transparent_24%)]" />
      <div className="absolute inset-x-0 top-0 h-96 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),transparent)]" />
      <div className="absolute left-1/2 top-24 h-72 w-72 -translate-x-1/2 rounded-full bg-primary/18 blur-[120px]" />

      <header className="relative z-10">
        <div className="container py-6">
          <div className="glass-panel flex items-center justify-between rounded-full px-4 py-3 md:px-6">
            <div>
              <p className="text-xs uppercase tracking-[0.34em] text-white/45">WhisperX Nexus Omega</p>
              <p className="mt-1 text-sm font-medium text-foreground">Elegant orchestration workspace</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/workspace" className="hidden text-sm text-muted-foreground transition-colors hover:text-foreground md:inline-flex">
                Explore workspace
              </Link>
              <Button
                className="rounded-full px-5 shadow-[0_20px_50px_rgba(70,84,255,0.25)]"
                onClick={() => {
                  window.location.href = primaryHref;
                }}
              >
                {user ? "Open dashboard" : "Sign in"}
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="container grid gap-8 pb-16 pt-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-end lg:gap-10 lg:pb-24 lg:pt-12">
          <div className="space-y-8">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="rounded-full border border-white/12 bg-white/8 px-4 py-1.5 text-xs uppercase tracking-[0.26em] text-white/80">
                All-in-One visual intelligence platform
              </Badge>
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/24 bg-emerald-400/10 px-4 py-1.5 text-xs uppercase tracking-[0.22em] text-emerald-100">
                <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.85)]" />
                Workspace online
              </div>
            </div>

            <div className="max-w-4xl">
              <h1 className="text-balance text-5xl font-semibold tracking-[-0.07em] text-white md:text-7xl xl:text-[5.55rem] xl:leading-[0.9]">
                สร้าง คิด วิเคราะห์ และทำงานร่วมกันใน workspace เดียวที่ออกแบบมาอย่างพิถีพิถัน
              </h1>
              <p className="mt-6 max-w-2xl text-pretty text-base leading-8 text-white/68 md:text-lg">
                WhisperX Nexus Omega รวม Canvas Editor, Diagram Builder, AI Workflow Studio, Skill Creator, Analytics, File Hub และระบบจัดการผู้ใช้เข้าไว้ด้วยกัน พร้อมภาษาออกแบบที่นิ่ง หรู และพร้อมสำหรับการใช้งานระดับมืออาชีพ
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="rounded-full px-7 shadow-[0_20px_70px_rgba(109,92,246,0.35)]"
                onClick={() => {
                  window.location.href = primaryHref;
                }}
              >
                {user ? "Continue to workspace" : "Launch secure workspace"}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full border-white/12 bg-white/5 px-7 hover:bg-white/8"
                onClick={() => {
                  window.location.href = secondaryHref;
                }}
              >
                Preview modules
              </Button>
            </div>

            <div className="flex flex-wrap gap-3">
              {workspaceCommandPills.map(item => (
                <div key={item} className="rounded-full border border-white/10 bg-black/18 px-4 py-2 text-sm text-white/74 backdrop-blur-xl">
                  {item}
                </div>
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {luxuryMetrics.map(metric => (
                <div key={metric.label} className="glass-panel rounded-[1.5rem] p-5 transition-transform duration-300 hover:-translate-y-1">
                  <p className="text-sm text-white/50">{metric.label}</p>
                  <p className="mt-3 text-3xl font-semibold tracking-[-0.04em] text-white">{metric.value}</p>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{metric.caption}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-4 lg:translate-y-6">
            <div className="glass-panel overflow-hidden rounded-[2rem] p-5 md:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.26em] text-white/45">Workspace surface</p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">Unified operational cockpit</h2>
                </div>
                <div className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-xs text-emerald-200">
                  Live collaboration ready
                </div>
              </div>
              <div className="mt-6 grid gap-3">
                {moduleSpotlights.map((spotlight, index) => {
                  const Icon = icons[index] ?? Sparkles;
                  return (
                    <div key={spotlight.title} className="group rounded-[1.35rem] border border-white/10 bg-black/20 p-4 transition-all duration-300 hover:border-white/18 hover:bg-white/6 hover:shadow-[0_22px_60px_rgba(2,6,23,0.28)]">
                      <div className="flex items-start gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/8 text-primary transition-transform duration-300 group-hover:scale-105">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-3">
                            <h3 className="text-base font-medium text-white">{spotlight.title}</h3>
                            <Link href={spotlight.path} className="text-xs uppercase tracking-[0.24em] text-white/42 transition-colors hover:text-white/80">
                              Open
                            </Link>
                          </div>
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">{spotlight.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[0.9fr_1.1fr]">
              <div className="glass-panel rounded-[1.75rem] p-5">
                <p className="text-xs uppercase tracking-[0.26em] text-white/45">Access governance</p>
                <div className="mt-4 flex items-center gap-3">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  <p className="text-sm font-medium text-white">Role-based control พร้อม admin surface และ user-safe routes</p>
                </div>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  การเข้าถึงถูกออกแบบให้มีทั้ง protected workflows, shared modules และพื้นที่สำหรับการจัดการสมาชิกใน workspace เดียว
                </p>
              </div>
              <div className="glass-panel rounded-[1.75rem] p-5">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs uppercase tracking-[0.26em] text-white/45">Module navigation</p>
                  <Workflow className="h-4 w-4 text-primary" />
                </div>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  {platformNavigation.slice(0, 6).map(item => (
                    <div key={item.path} className="rounded-2xl border border-white/10 bg-white/5 px-3 py-3 text-sm text-muted-foreground transition-all duration-300 hover:border-white/16 hover:bg-white/8">
                      <div className="font-medium text-white">{item.label}</div>
                      <div className="mt-1 leading-6">{item.description}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container pb-8">
          <div className="surface-outline grid gap-5 rounded-[2rem] p-6 lg:grid-cols-[1.2fr_0.8fr] lg:p-8">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-white/45">Executive summary</p>
              <h3 className="mt-4 max-w-2xl text-3xl font-semibold tracking-[-0.05em] text-white md:text-4xl">
                จาก ideation ไปสู่ execution ด้วย design language เดียวกันและการเชื่อมต่อเชิงปฏิบัติการที่ชัดเจน
              </h3>
              <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                ระบบนี้ไม่ได้เป็นเพียงการรวมหลายเครื่องมือไว้หน้าเดียว แต่จัดลำดับการใช้งานให้ทุกโมดูลมีจุดเชื่อมต่อที่ชัด ทั้งในมุมการคิดงาน การจัดการไฟล์ การสั่งงาน AI และการติดตามผล
              </p>
            </div>
            <div className="grid gap-3">
              <div className="rounded-[1.5rem] border border-white/10 bg-black/18 p-4">
                <div className="flex items-center gap-3 text-white">
                  <PanelTop className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Asymmetric landing with guided CTA</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">ออกแบบให้ผู้ใช้เข้าใจโครงสร้างแพลตฟอร์มตั้งแต่แรกเห็น พร้อมทางเข้าสู่ workspace ที่ชัดเจน</p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-black/18 p-4">
                <div className="flex items-center gap-3 text-white">
                  <ShieldCheck className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Governed collaboration</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">ทั้งสิทธิ์ผู้ใช้และการทำงานร่วมกันถูกจัดวางให้อยู่ใน shell เดียวเพื่อลดความสับสนในการใช้งาน</p>
              </div>
            </div>
          </div>
        </section>

        <section className="container pb-20 pt-8">
          <div className="grid gap-5 lg:grid-cols-3">
            {landingHighlights.map(highlight => (
              <Card key={highlight.title} className="glass-panel rounded-[1.75rem] border-white/10 bg-white/5 transition-all duration-300 hover:-translate-y-1 hover:border-white/14 hover:bg-white/8">
                <CardContent className="p-6">
                  <p className="text-xs uppercase tracking-[0.28em] text-white/45">{highlight.eyebrow}</p>
                  <h3 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-white">{highlight.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground">{highlight.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
