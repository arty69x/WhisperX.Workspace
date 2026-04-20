import { useState } from "react";
import WorkspaceShell from "@/components/WorkspaceShell";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import { Loader2, Sparkles, Workflow } from "lucide-react";

const stages = [
  { title: "Capture input", detail: "รับข้อความหรือไฟล์เข้าระบบ" },
  { title: "LLM reasoning", detail: "วิเคราะห์ สรุป หรือจัดประเภทข้อมูล" },
  { title: "Action routing", detail: "เลือกเส้นทางงานและส่งต่อผลลัพธ์" },
  { title: "Notify + store", detail: "บันทึกผลและแจ้งเตือนผู้เกี่ยวข้อง" },
];

export default function WorkflowStudioPage() {
  const [workflowName, setWorkflowName] = useState("Insight Synthesizer");
  const [prompt, setPrompt] = useState(
    "Summarize the uploaded notes, extract opportunities, and create an executive action brief.",
  );
  const suggestWorkflow = trpc.workflows.suggest.useMutation();
  const isInvalid = !workflowName.trim() || !prompt.trim();

  return (
    <WorkspaceShell
      title="AI Workflow Studio"
      description="ออกแบบ workflow ที่ผสานขั้นตอนเชิงตรรกะ การประมวลผลด้วย LLM และการจัดการผลลัพธ์อย่างเป็นระบบภายในหน้าจอเดียว"
      actions={
        <Button
          className="rounded-full px-5"
          disabled={isInvalid || suggestWorkflow.isPending}
          onClick={() => suggestWorkflow.mutate({ goal: prompt })}
        >
          {suggestWorkflow.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Workflow className="mr-2 h-4 w-4" />}
          Run test workflow
        </Button>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[0.92fr_1.08fr]">
        <Card className="glass-panel border-white/10 bg-white/5">
          <CardHeader className="p-6">
            <CardTitle className="text-2xl font-semibold tracking-[-0.04em] text-white">Workflow composer</CardTitle>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              ใช้ส่วนนี้เพื่อกำหนดชื่อ เป้าหมาย และ prompt foundation สำหรับ workflow ก่อนส่งให้ระบบช่วยสร้าง run structure
            </p>
          </CardHeader>
          <CardContent className="space-y-4 p-6 pt-0">
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">Workflow name</label>
              <Input
                value={workflowName}
                onChange={event => setWorkflowName(event.target.value)}
                className="rounded-2xl border-white/10 bg-white/5 focus-visible:border-primary/40"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-muted-foreground">System prompt</label>
              <Textarea
                value={prompt}
                onChange={event => setPrompt(event.target.value)}
                className="min-h-44 rounded-[1.5rem] border-white/10 bg-white/5 focus-visible:border-primary/40"
              />
            </div>
            <div className="rounded-[1.5rem] border border-primary/20 bg-primary/10 p-4 text-sm leading-6 text-white/70">
              ใช้ส่วนนี้เป็นจุดตั้งต้นสำหรับประกอบ prompt layers, fallback branches, routing rules และ execution policies ได้ต่อไป
            </div>
            {isInvalid ? (
              <div className="rounded-[1.5rem] border border-amber-400/20 bg-amber-400/10 p-4 text-sm leading-6 text-amber-100">
                โปรดใส่ชื่อ workflow และ prompt ให้ครบก่อนเริ่มทดสอบ
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="grid gap-4">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
            {stages.map((stage, index) => (
              <Card key={stage.title} className="glass-panel border-white/10 bg-white/5 transition-all duration-300 hover:-translate-y-1">
                <CardContent className="flex items-start gap-4 p-6">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-black/20 text-lg font-semibold text-primary">
                    0{index + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-white">{stage.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{stage.detail}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="glass-panel border-white/10 bg-white/5">
            <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 p-6">
              <CardTitle className="text-xl font-semibold text-white">Suggested run</CardTitle>
              <Badge className="rounded-full border border-white/10 bg-white/5 text-white/70">LLM-assisted</Badge>
            </CardHeader>
            <CardContent className="p-6 pt-0 text-sm leading-6 text-muted-foreground">
              {suggestWorkflow.isPending ? (
                <div className="flex min-h-[220px] items-center justify-center rounded-[1.5rem] border border-white/10 bg-black/20 text-muted-foreground">
                  <div className="flex items-center gap-3">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    กำลังสร้าง workflow suggestion...
                  </div>
                </div>
              ) : null}

              {suggestWorkflow.error ? (
                <div className="rounded-[1.5rem] border border-destructive/30 bg-destructive/10 p-4 text-white/80">
                  ไม่สามารถสร้าง workflow suggestion ได้ในขณะนี้ โปรดลองอีกครั้งพร้อม prompt ที่ชัดเจนขึ้น
                </div>
              ) : null}

              {suggestWorkflow.data ? (
                <div className="space-y-4 rounded-[1.4rem] border border-white/10 bg-black/20 p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.24em] text-white/45">Source</p>
                      <p className="mt-2 font-medium text-white">{suggestWorkflow.data.source}</p>
                    </div>
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-white">{suggestWorkflow.data.name}</p>
                    <p className="mt-2">{suggestWorkflow.data.outcome}</p>
                  </div>
                  <ol className="list-decimal space-y-2 pl-5 text-white/75">
                    {suggestWorkflow.data.steps.map(step => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </div>
              ) : null}

              {!suggestWorkflow.isPending && !suggestWorkflow.error && !suggestWorkflow.data ? (
                <Empty className="rounded-[1.75rem] border border-dashed border-white/12 bg-black/20 p-8">
                  <EmptyHeader>
                    <EmptyMedia variant="icon" className="bg-white/10 text-white">
                      <Workflow className="h-5 w-5" />
                    </EmptyMedia>
                    <EmptyTitle className="text-white">ยังไม่มี suggested run</EmptyTitle>
                    <EmptyDescription className="text-muted-foreground">
                      เมื่อทดสอบ workflow ระบบจะสร้างโครงขั้นตอนอัตโนมัติจากเป้าหมายที่คุณระบุ พร้อมลำดับขั้นที่พร้อมนำไปต่อยอด
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
