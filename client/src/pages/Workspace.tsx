import WorkspaceShell from "@/components/WorkspaceShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { dashboardSignals } from "@/lib/platform";
import { trpc } from "@/lib/trpc";
import { ArrowRight, BellRing, CirclePlay, Loader2, Sparkles } from "lucide-react";
import { Link } from "wouter";

export default function Workspace() {
  const overviewQuery = trpc.platform.overview.useQuery();
  const overview = overviewQuery.data;

  return (
    <WorkspaceShell
      title="Platform Overview"
      description="ศูนย์กลางสำหรับดูภาพรวมของทุกโมดูล สถานะการทำงานร่วมกัน และทางลัดสู่พื้นที่ทำงานเชิงปฏิบัติการทั้งหมด"
      actions={
        <>
          <Button className="rounded-full px-5">Create workspace asset</Button>
          <Button variant="outline" className="rounded-full border-white/10 bg-white/5 px-5 hover:bg-white/8">Review activity</Button>
        </>
      }
    >
      {overviewQuery.isLoading ? (
        <div className="glass-panel flex min-h-[320px] items-center justify-center rounded-[2rem] border border-white/10 bg-white/5">
          <div className="flex items-center gap-3 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading workspace overview...
          </div>
        </div>
      ) : null}

      {!overviewQuery.isLoading && !overview ? (
        <div className="surface-outline rounded-[2rem] p-8 text-center">
          <p className="text-sm uppercase tracking-[0.28em] text-white/45">Overview unavailable</p>
          <h3 className="mt-4 text-2xl font-semibold tracking-[-0.04em] text-white">ยังไม่พบข้อมูลภาพรวมของ workspace</h3>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
            โปรดลองรีเฟรชอีกครั้งหรือกลับไปที่โมดูลหลักเพื่อเริ่มสร้างงานในระบบ แล้วข้อมูลสรุปจะกลับมาปรากฏที่หน้านี้
          </p>
        </div>
      ) : null}

      {overview ? (
        <>
          <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <div className="surface-outline overflow-hidden rounded-[2rem] p-6 md:p-8">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div className="max-w-2xl">
                  <p className="text-xs uppercase tracking-[0.28em] text-white/42">Operational cockpit</p>
                  <h3 className="mt-4 text-balance text-3xl font-semibold tracking-[-0.05em] text-white md:text-4xl">
                    Unified command view สำหรับ orchestrate ทุกโมดูลจากจุดเดียว
                  </h3>
                  <p className="mt-4 text-sm leading-7 text-muted-foreground md:text-base">
                    ภาพรวมนี้เชื่อมสถิติ โมดูล ทีม และกิจกรรมล่าสุดเข้าไว้ด้วยกัน เพื่อช่วยให้ผู้ใช้เห็นทั้งสถานะระบบและทางลัดสู่การลงมือทำจริงโดยไม่ต้องสลับบริบท
                  </p>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full border border-emerald-400/24 bg-emerald-400/10 px-4 py-2 text-xs uppercase tracking-[0.22em] text-emerald-100">
                  <span className="h-2 w-2 rounded-full bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.85)]" />
                  Team sync active
                </div>
              </div>
              <div className="mt-8 grid gap-3 md:grid-cols-3">
                {dashboardSignals.map(signal => (
                  <div key={signal.title} className="rounded-[1.5rem] border border-white/10 bg-black/18 p-4">
                    <p className="text-sm font-medium text-white">{signal.title}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{signal.description}</p>
                  </div>
                ))}
              </div>
            </div>

            <Card className="glass-panel border-white/10 bg-white/5">
              <CardHeader className="p-6">
                <CardTitle className="text-2xl font-semibold tracking-[-0.04em] text-white">Collaboration pulse</CardTitle>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">มุมมองการทำงานร่วมกันสำหรับทีมที่กำลัง active อยู่ในระบบขณะนี้</p>
              </CardHeader>
              <CardContent className="space-y-3 p-6 pt-0">
                {overview.presence.map(member => (
                  <div key={member.name} className="flex items-center justify-between gap-4 rounded-2xl border border-white/8 bg-white/5 px-4 py-4 transition-colors hover:bg-white/8">
                    <div>
                      <p className="font-medium text-white">{member.name}</p>
                      <p className="mt-1 text-sm text-muted-foreground">{member.state}</p>
                    </div>
                    <Badge className="rounded-full border border-white/10 bg-white/5 text-white/70">{member.role}</Badge>
                  </div>
                ))}
              </CardContent>
            </Card>
          </section>

          <section className="grid gap-4 xl:grid-cols-4">
            {overview.stats.map(tile => (
              <Card key={tile.title} className="glass-panel border-white/10 bg-white/5 transition-all duration-300 hover:-translate-y-1 hover:border-white/14 hover:bg-white/8">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm text-muted-foreground">{tile.title}</p>
                    <Badge className="rounded-full border border-emerald-400/20 bg-emerald-400/10 text-emerald-200">{tile.delta}</Badge>
                  </div>
                  <p className="mt-4 text-4xl font-semibold tracking-[-0.05em] text-white">{tile.value}</p>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{tile.detail}</p>
                </CardContent>
              </Card>
            ))}
          </section>

          <section className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
            <Card className="glass-panel border-white/10 bg-white/5">
              <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 p-6">
                <div>
                  <CardTitle className="text-2xl font-semibold tracking-[-0.04em] text-white">Quick access to core modules</CardTitle>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">ทุกโมดูลเชื่อมต่อกันภายใต้ workspace เดียว เพื่อให้ลำดับการทำงานจาก ideation ไปสู่ execution ราบรื่นขึ้น</p>
                </div>
                <Sparkles className="h-5 w-5 text-primary" />
              </CardHeader>
              <CardContent className="grid gap-4 p-6 pt-0 md:grid-cols-2">
                {overview.modules.map(module => (
                  <div key={module.title} className="rounded-[1.5rem] border border-white/10 bg-black/20 p-5 transition-all duration-300 hover:border-white/16 hover:bg-white/6 hover:shadow-[0_20px_50px_rgba(2,6,23,0.24)]">
                    <h3 className="text-lg font-medium text-white">{module.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-muted-foreground">{module.description}</p>
                    <Link href={module.path} className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-primary">
                      Open module <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                ))}
              </CardContent>
            </Card>

            <div className="grid gap-6">
              <Card className="glass-panel border-white/10 bg-white/5">
                <CardHeader className="p-6">
                  <CardTitle className="text-2xl font-semibold tracking-[-0.04em] text-white">Activity stream</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 p-6 pt-0">
                  {overview.activities.map(activity => (
                    <div key={activity.title} className="rounded-[1.4rem] border border-white/8 bg-black/20 p-4 transition-colors hover:bg-white/5">
                      <p className="text-sm font-medium text-white">{activity.title}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{activity.meta}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                <Card className="glass-panel border-white/10 bg-white/5">
                  <CardHeader className="p-6">
                    <CardTitle className="text-xl font-semibold text-white">AI acceleration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 p-6 pt-0 text-sm leading-6 text-muted-foreground">
                    <p>Workflow suggestions, prompt templates และ guided operations ถูกออกแบบให้เชื่อมถึงกันโดยไม่ทำให้ทีมต้องสลับ context ระหว่างเครื่องมือหลายตัว</p>
                    <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4 text-primary-foreground/90">
                      <div className="flex items-center gap-3 text-primary">
                        <CirclePlay className="h-4 w-4" />
                        <span className="font-medium">Start with Workflow Studio</span>
                      </div>
                      <p className="mt-2 text-sm leading-6 text-white/70">จัดลำดับงานอัตโนมัติและแปลงเป็น reusable skills ได้จากโมดูลเดียวกัน</p>
                    </div>
                  </CardContent>
                </Card>
                <Card className="glass-panel border-white/10 bg-white/5">
                  <CardHeader className="p-6">
                    <CardTitle className="text-xl font-semibold text-white">Notification channel</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 p-6 pt-0 text-sm leading-6 text-muted-foreground">
                    <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                      <BellRing className="h-4 w-4 text-primary" />
                      <span>Board sync updates พร้อมรองรับ operational alerts</span>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                      <p className="font-medium text-white">Owner-ready communications</p>
                      <p className="mt-2">แจ้งเตือนกิจกรรมสำคัญ เช่น workflow completion, file upload state และ collaboration events ได้จากพื้นฐานเดียวกัน</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </section>
        </>
      ) : null}
    </WorkspaceShell>
  );
}
