import WorkspaceShell from "@/components/WorkspaceShell";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, ChartNoAxesCombined, Sparkles } from "lucide-react";

const bars = [72, 86, 64, 91, 78, 88, 94];
const summaryCards = [
  ["Workflow success rate", "94.2%", "เสถียรและพร้อมสำหรับ automation ที่ซับซ้อนขึ้น"],
  ["Collaboration response", "126 ms", "การแลกเปลี่ยนสถานะในระบบเร็วพอสำหรับการทำงานร่วมกันแบบสด"],
  ["Asset readiness", "312 files", "ไฟล์ที่พร้อมใช้งานใน canvas และ workflow hub"],
] as const;

export default function AnalyticsPage() {
  return (
    <WorkspaceShell
      title="Analytics Dashboard"
      description="ตรวจสอบ performance ของโมดูล กิจกรรมในระบบ และสัญญาณเชิงปฏิบัติการผ่านมุมมองที่อ่านง่ายและเชื่อมโยงกับ workflow จริง"
    >
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card className="glass-panel border-white/10 bg-white/5">
          <CardHeader className="p-6">
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle className="text-2xl font-semibold tracking-[-0.04em] text-white">Weekly platform activity</CardTitle>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  มุมมองรายสัปดาห์สำหรับติดตามความหนาแน่นของการใช้งานและสัญญาณการเคลื่อนไหวของแพลตฟอร์มในแต่ละวัน
                </p>
              </div>
              <Badge className="rounded-full border border-white/10 bg-white/5 text-white/70">Live summary</Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="rounded-[1.8rem] border border-white/10 bg-black/20 p-5">
              <div className="mb-5 flex items-center gap-3 text-sm text-muted-foreground">
                <Activity className="h-4 w-4 text-primary" />
                Activity intensity across operational surfaces
              </div>
              <div className="flex h-72 items-end gap-3">
                {bars.map((value, index) => (
                  <div key={index} className="flex flex-1 flex-col items-center gap-3">
                    <div
                      className="w-full rounded-t-[1rem] bg-gradient-to-t from-primary via-blue-400/90 to-cyan-300/85 shadow-[0_16px_40px_rgba(55,65,255,0.18)]"
                      style={{ height: `${value}%` }}
                    />
                    <span className="text-xs uppercase tracking-[0.2em] text-white/45">D{index + 1}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
            {summaryCards.map(item => (
              <Card key={item[0]} className="glass-panel border-white/10 bg-white/5 transition-all duration-300 hover:-translate-y-1 hover:border-white/14 hover:bg-white/8">
                <CardContent className="p-6">
                  <p className="text-sm text-muted-foreground">{item[0]}</p>
                  <p className="mt-3 text-4xl font-semibold tracking-[-0.04em] text-white">{item[1]}</p>
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">{item[2]}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="glass-panel border-white/10 bg-white/5">
            <CardHeader className="p-6">
              <CardTitle className="text-xl font-semibold text-white">Operational reading</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 p-6 pt-0 md:grid-cols-2">
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <div className="flex items-center gap-3 text-white">
                  <ChartNoAxesCombined className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">Stable execution trend</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  กิจกรรมโดยรวมมีแนวโน้มสม่ำเสมอและเหมาะกับการจัดวาง workflow ที่อาศัยการทำงานต่อเนื่องหลายโมดูล
                </p>
              </div>
              <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
                <div className="flex items-center gap-3 text-white">
                  <Sparkles className="h-4 w-4 text-primary" />
                  <span className="text-sm font-medium">High asset readiness</span>
                </div>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  จำนวน asset ที่พร้อมใช้งานสะท้อนว่าระบบมีความพร้อมสำหรับการทดลองเชิงสร้างสรรค์และงาน collaborative sessions
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </WorkspaceShell>
  );
}
