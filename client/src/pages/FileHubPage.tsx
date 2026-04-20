import { useRef, useState } from "react";
import WorkspaceShell from "@/components/WorkspaceShell";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { trpc } from "@/lib/trpc";
import { CheckCircle2, FolderKanban, Loader2, Upload } from "lucide-react";

export default function FileHubPage() {
  const utils = trpc.useUtils();
  const filesQuery = trpc.files.list.useQuery();
  const uploadMutation = trpc.files.upload.useMutation({
    onSuccess: async () => {
      await utils.files.list.invalidate();
    },
  });
  const inputRef = useRef<HTMLInputElement>(null);
  const [moduleName, setModuleName] = useState("canvas");

  const uploadFile = async (file?: File) => {
    if (!file) {
      return;
    }

    const buffer = await file.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    let binary = "";
    bytes.forEach(byte => {
      binary += String.fromCharCode(byte);
    });
    const contentBase64 = btoa(binary);

    uploadMutation.mutate({
      fileName: file.name,
      contentType: file.type || "application/octet-stream",
      contentBase64,
      module: moduleName,
    });
  };

  return (
    <WorkspaceShell
      title="File Hub"
      description="พื้นที่กลางสำหรับจัดการไฟล์ที่เกี่ยวข้องกับ canvas, workflow และ assets ต่าง ๆ ของแพลตฟอร์ม"
      actions={
        <>
          <input
            value={moduleName}
            onChange={event => setModuleName(event.target.value)}
            className="h-10 rounded-full border border-white/10 bg-white/5 px-4 text-sm text-white outline-none transition-colors focus:border-primary/40"
            aria-label="Module name"
          />
          <input
            ref={inputRef}
            type="file"
            className="hidden"
            onChange={event => uploadFile(event.target.files?.[0] ?? undefined)}
          />
          <Button className="rounded-full px-5" disabled={uploadMutation.isPending} onClick={() => inputRef.current?.click()}>
            {uploadMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Upload flow asset
          </Button>
        </>
      }
    >
      {filesQuery.isLoading ? (
        <div className="glass-panel flex min-h-[240px] items-center justify-center rounded-[2rem] border border-white/10 bg-white/5 text-muted-foreground">
          <div className="flex items-center gap-3">
            <Loader2 className="h-4 w-4 animate-spin" />
            Loading assets...
          </div>
        </div>
      ) : null}

      {filesQuery.data ? (
        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card className="glass-panel border-white/10 bg-white/5">
            <CardHeader className="p-6">
              <CardTitle className="text-2xl font-semibold tracking-[-0.04em] text-white">Managed assets</CardTitle>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                รายการไฟล์ทั้งหมดที่เชื่อมกับ workflow surfaces และ boards พร้อมจุดเข้าถึงสำหรับ preview หรือแนบต่อไปยังโมดูลอื่น
              </p>
            </CardHeader>
            <CardContent className="space-y-3 p-6 pt-0">
              {filesQuery.data.items.length ? (
                filesQuery.data.items.map(file => {
                  const moduleLabel = "module" in file ? file.module : "library";
                  const fileUrl = "url" in file ? file.url : undefined;

                  return (
                    <div key={file.id} className="flex flex-col justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-4 transition-all duration-300 hover:border-white/16 hover:bg-white/6 md:flex-row md:items-center">
                      <div>
                        <p className="font-medium text-white">{file.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {file.kind} · {file.size} · {moduleLabel}
                        </p>
                      </div>
                      {fileUrl ? (
                        <a
                          href={fileUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex h-10 items-center justify-center rounded-full border border-white/10 bg-white/5 px-4 text-sm text-white transition-colors hover:bg-white/10"
                        >
                          Open
                        </a>
                      ) : (
                        <Button variant="outline" className="rounded-full border-white/10 bg-white/5">
                          Attach
                        </Button>
                      )}
                    </div>
                  );
                })
              ) : (
                <Empty className="rounded-[1.75rem] border border-dashed border-white/12 bg-black/20 p-8">
                  <EmptyHeader>
                    <EmptyMedia variant="icon" className="bg-white/10 text-white">
                      <FolderKanban className="h-5 w-5" />
                    </EmptyMedia>
                    <EmptyTitle className="text-white">ยังไม่มีไฟล์ใน File Hub</EmptyTitle>
                    <EmptyDescription className="text-muted-foreground">
                      เริ่มอัปโหลด asset แรกของคุณเพื่อเชื่อมงานระหว่าง canvas, workflows และพื้นที่ทำงานร่วมกัน
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </CardContent>
          </Card>

          <Card className="glass-panel border-white/10 bg-white/5">
            <CardHeader className="p-6">
              <CardTitle className="text-xl font-semibold text-white">Storage overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-6 pt-0 text-sm leading-6 text-muted-foreground">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p>Total tracked assets</p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">{filesQuery.data.total}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <p className="font-medium text-white">Upload target</p>
                <p className="mt-2">ไฟล์ใหม่จะถูกเชื่อมกับโมดูล <span className="text-white">{moduleName || "canvas"}</span> เพื่อให้ติดตามต่อได้ง่ายขึ้นใน workspace</p>
              </div>
              <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4 text-white/70">
                {uploadMutation.isPending
                  ? "กำลังอัปโหลดไฟล์เข้าสู่ storage..."
                  : uploadMutation.data
                    ? `อัปโหลดสำเร็จ: ${uploadMutation.data.name}`
                    : "File Hub เชื่อมต่อ storage layer แล้วและพร้อมรับไฟล์จากผู้ใช้"}
              </div>
              {uploadMutation.data ? (
                <div className="flex items-center gap-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-emerald-100">
                  <CheckCircle2 className="h-4 w-4" />
                  Asset พร้อมถูกเรียกใช้จากโมดูลอื่นในแพลตฟอร์ม
                </div>
              ) : null}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </WorkspaceShell>
  );
}
