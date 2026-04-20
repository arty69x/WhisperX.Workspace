import { useState } from "react";
import WorkspaceShell from "@/components/WorkspaceShell";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { CheckCheck, Loader2, Sparkles } from "lucide-react";

const testCases = [
  "Executive summary generation",
  "Workflow-ready JSON extraction",
  "High-context prompt template validation",
];

export default function SkillCreatorPage() {
  const [skillName, setSkillName] = useState("Executive Insight Operator");
  const [template, setTemplate] = useState(
    "You are an executive analyst. Return concise, structured output with action points and risks.",
  );
  const validateTemplate = trpc.skills.validateTemplate.useMutation();
  const isInvalid = !skillName.trim() || !template.trim();

  return (
    <WorkspaceShell
      title="Skill Creator"
      description="สร้างและจัดการ skill templates, reusable prompts และ test cases เพื่อให้ AI behavior มีความสม่ำเสมอและตรวจสอบได้"
      actions={
        <>
          <Button className="rounded-full px-5" variant="outline" disabled>
            Save template
          </Button>
          <Button
            variant="outline"
            className="rounded-full border-white/10 bg-white/5 px-5 hover:bg-white/8"
            disabled={isInvalid || validateTemplate.isPending}
            onClick={() => validateTemplate.mutate({ name: skillName, prompt: template })}
          >
            {validateTemplate.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
            Run validation
          </Button>
        </>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1.02fr_0.98fr]">
        <Card className="glass-panel border-white/10 bg-white/5">
          <CardHeader className="p-6">
            <CardTitle className="text-2xl font-semibold tracking-[-0.04em] text-white">Template editor</CardTitle>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              ปรับชื่อ skill และ prompt system ให้ชัดเจน จากนั้นรัน validation เพื่อดูว่า template มีโครงสร้างพร้อมต่อยอดสู่ workflow มากน้อยเพียงใด
            </p>
          </CardHeader>
          <CardContent className="space-y-4 p-6 pt-0">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Skill name</label>
              <Input
                value={skillName}
                onChange={event => setSkillName(event.target.value)}
                className="rounded-2xl border-white/10 bg-white/5 focus-visible:border-primary/40"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Prompt template</label>
              <Textarea
                value={template}
                onChange={event => setTemplate(event.target.value)}
                className="min-h-56 rounded-[1.5rem] border-white/10 bg-white/5 focus-visible:border-primary/40"
              />
            </div>
            {isInvalid ? (
              <div className="rounded-[1.5rem] border border-amber-400/20 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
                โปรดระบุทั้งชื่อ skill และ prompt template ก่อนเริ่ม validation
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <Card className="glass-panel border-white/10 bg-white/5">
            <CardHeader className="p-6">
              <CardTitle className="text-xl font-semibold text-white">Test runner presets</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 p-6 pt-0">
              {testCases.map(test => (
                <div key={test} className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-muted-foreground transition-colors hover:bg-white/5">
                  <p className="font-medium text-white">{test}</p>
                  <p className="mt-2 leading-6">ใช้ตรวจสอบความเสถียรของ output ก่อนนำไปใช้จริงใน workflow หรือระบบ collaboration</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="glass-panel border-white/10 bg-white/5">
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 p-6">
              <CardTitle className="text-xl font-semibold text-white">Validation result</CardTitle>
              <Badge className="rounded-full border border-white/10 bg-white/5 text-white/70">Prompt quality</Badge>
            </CardHeader>
            <CardContent className="space-y-4 p-6 pt-0 text-sm leading-6 text-muted-foreground">
              <p>
                Skill Creator ถูกออกแบบให้เชื่อมต่อกับ AI Workflow Studio โดยตรง เพื่อให้ prompt template ที่ผ่านการทดสอบสามารถนำไปใช้งานซ้ำในระบบอัตโนมัติได้ทันที
              </p>

              {validateTemplate.isPending ? (
                <div className="flex min-h-[200px] items-center justify-center rounded-[1.5rem] border border-white/10 bg-black/20 text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    กำลังประเมิน template...
                  </div>
                </div>
              ) : null}

              {validateTemplate.error ? (
                <div className="rounded-[1.5rem] border border-destructive/30 bg-destructive/10 p-4 text-white/80">
                  ไม่สามารถประเมิน template ได้ในขณะนี้ โปรดลองอีกครั้งด้วยโครง prompt ที่ชัดเจนขึ้น
                </div>
              ) : null}

              {validateTemplate.data ? (
                <div className="rounded-[1.4rem] border border-primary/20 bg-primary/10 p-4 text-white/75">
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-medium text-white">Validation score: {validateTemplate.data.score}/3</p>
                    <CheckCheck className="h-4 w-4 text-primary" />
                  </div>
                  <p className="mt-2">{validateTemplate.data.recommendation}</p>
                </div>
              ) : null}

              {!validateTemplate.isPending && !validateTemplate.error && !validateTemplate.data ? (
                <Empty className="rounded-[1.75rem] border border-dashed border-white/12 bg-black/20 p-8">
                  <EmptyHeader>
                    <EmptyMedia variant="icon" className="bg-white/10 text-white">
                      <Sparkles className="h-5 w-5" />
                    </EmptyMedia>
                    <EmptyTitle className="text-white">รอผลการตรวจสอบ template</EmptyTitle>
                    <EmptyDescription className="text-muted-foreground">
                      เมื่อคุณรัน validation ระบบจะแสดงคะแนนและคำแนะนำเพื่อช่วยปรับ prompt ให้พร้อมต่อยอดสู่ production workflows
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </WorkspaceShell>
  );
}
