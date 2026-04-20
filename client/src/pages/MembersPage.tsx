import { useAuth } from "@/_core/hooks/useAuth";
import WorkspaceShell from "@/components/WorkspaceShell";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { BellRing, Loader2, ShieldCheck, Users } from "lucide-react";

export default function MembersPage() {
  const { user } = useAuth();
  const accessQuery = trpc.members.currentAccess.useQuery(undefined, { enabled: !!user });
  const membersQuery = trpc.members.list.useQuery(undefined, {
    enabled: user?.role === "admin",
    retry: false,
  });
  const notifyMutation = trpc.collaboration.notify.useMutation();
  const isAdmin = user?.role === "admin";

  return (
    <WorkspaceShell
      title="Members & Access"
      description="พื้นที่สำหรับมองเห็นสมาชิกในระบบ บทบาทการเข้าถึง และความพร้อมในการกำกับดูแล workspace ระดับทีม"
      eyebrow="Role-based governance"
      actions={
        isAdmin ? (
          <Button
            className="rounded-full px-5"
            disabled={notifyMutation.isPending}
            onClick={() =>
              notifyMutation.mutate({
                title: "Workspace update",
                content: "Admin reviewed member access and collaboration readiness.",
              })
            }
          >
            {notifyMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BellRing className="mr-2 h-4 w-4" />}
            Send ops notification
          </Button>
        ) : undefined
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1.04fr_0.96fr]">
        <Card className="glass-panel border-white/10 bg-white/5">
          <CardHeader className="p-6">
            <CardTitle className="text-2xl font-semibold tracking-[-0.04em] text-white">Role directory</CardTitle>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              รายชื่อสมาชิกและสถานะบทบาทถูกจัดไว้เพื่อให้ทีม admin ตรวจสอบการเข้าถึงและความพร้อมของการทำงานร่วมกันได้จากหน้าจอเดียว
            </p>
          </CardHeader>
          <CardContent className="space-y-3 p-6 pt-0">
            {isAdmin && membersQuery.isLoading ? (
              <div className="flex min-h-[220px] items-center justify-center rounded-[1.6rem] border border-white/10 bg-black/20 text-sm text-muted-foreground">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading member directory...
                </div>
              </div>
            ) : null}

            {isAdmin && membersQuery.error ? (
              <div className="rounded-[1.6rem] border border-destructive/30 bg-destructive/10 p-4 text-sm leading-6 text-destructive-foreground/85">
                ไม่สามารถโหลดรายชื่อสมาชิกได้ในขณะนี้ กรุณาลองใหม่อีกครั้งเมื่อระบบพร้อม
              </div>
            ) : null}

            {isAdmin && membersQuery.data?.length ? (
              membersQuery.data.map(member => (
                <div key={member.id} className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4 transition-all duration-300 hover:border-white/16 hover:bg-white/6">
                  <div className="flex items-center justify-between gap-4">
                    <div>
                      <p className="font-medium text-white">{member.name}</p>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{member.status}</p>
                    </div>
                    <Badge className="rounded-full border border-white/10 bg-white/5 text-white/75">{member.role}</Badge>
                  </div>
                </div>
              ))
            ) : null}

            {isAdmin && !membersQuery.isLoading && !membersQuery.error && !membersQuery.data?.length ? (
              <Empty className="rounded-[1.75rem] border border-dashed border-white/12 bg-black/20 p-8">
                <EmptyHeader>
                  <EmptyMedia variant="icon" className="bg-white/10 text-white">
                    <Users className="h-5 w-5" />
                  </EmptyMedia>
                  <EmptyTitle className="text-white">ยังไม่มีรายการสมาชิกสำหรับแสดงผล</EmptyTitle>
                  <EmptyDescription className="text-muted-foreground">
                    เมื่อระบบมีสมาชิกเพิ่มเติม รายการและบทบาทจะปรากฏบนแผงนี้โดยอัตโนมัติ
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : null}

            {!isAdmin ? (
              <Empty className="rounded-[1.75rem] border border-dashed border-white/12 bg-black/20 p-8">
                <EmptyHeader>
                  <EmptyMedia variant="icon" className="bg-white/10 text-white">
                    <ShieldCheck className="h-5 w-5" />
                  </EmptyMedia>
                  <EmptyTitle className="text-white">Member directory ถูกจำกัดไว้สำหรับ admin</EmptyTitle>
                  <EmptyDescription className="text-muted-foreground">
                    ผู้ใช้ทั่วไปยังสามารถเห็นสถานะสิทธิ์และความพร้อมของบัญชีตัวเองได้จากแผงด้านขวาโดยไม่ต้องเข้าถึงข้อมูลสมาชิกทั้งหมด
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : null}
          </CardContent>
        </Card>

        <Card className="glass-panel border-white/10 bg-white/5">
          <CardHeader className="p-6">
            <CardTitle className="text-xl font-semibold text-white">Current access state</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6 pt-0 text-sm leading-6 text-muted-foreground">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p className="text-muted-foreground">Signed-in role</p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">{accessQuery.data?.role ?? user?.role ?? "guest"}</p>
            </div>

            <div className={`rounded-2xl border p-4 ${isAdmin ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-100" : "border-amber-400/20 bg-amber-400/10 text-amber-100"}`}>
              {accessQuery.data?.canManageMembers
                ? "บัญชีปัจจุบันมีสิทธิ์ admin และสามารถเห็น member management routes ได้"
                : "บัญชีปัจจุบันอยู่ในระดับ user และควรเข้าถึงได้เฉพาะโมดูลที่ไม่ใช่ admin-only"}
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-black/20 p-4">
              <p className="font-medium text-white">Access interpretation</p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                สิทธิ์ของบัญชีนี้จะมีผลต่อการแสดง navigation, การเข้าถึง member routes และการส่ง notification เชิงปฏิบัติการจากแผงบริหารจัดการ
              </p>
            </div>

            {notifyMutation.error ? (
              <div className="rounded-2xl border border-destructive/30 bg-destructive/10 p-4 text-white/80">
                ไม่สามารถส่ง operational notification ได้ในขณะนี้ โปรดลองอีกครั้ง
              </div>
            ) : null}

            {notifyMutation.data ? (
              <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4 text-white/75">
                ระบบส่ง notification สำหรับ operational channel แล้ว: {notifyMutation.data.success ? "สำเร็จ" : "ยังไม่สำเร็จ"}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </WorkspaceShell>
  );
}
