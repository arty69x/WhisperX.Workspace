import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, ArrowLeft, Home } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, setLocation] = useLocation();

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(114,92,255,0.2),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(32,212,201,0.12),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_24%)]" />
      <Card className="glass-panel relative z-10 w-full max-w-2xl rounded-[2rem] border-white/10 bg-white/5 shadow-[0_30px_120px_rgba(2,6,23,0.34)]">
        <CardContent className="p-8 text-center md:p-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-destructive/25 bg-destructive/10 text-destructive">
            <AlertCircle className="h-10 w-10" />
          </div>

          <p className="mt-8 text-xs uppercase tracking-[0.3em] text-white/45">WhisperX Nexus Omega</p>
          <h1 className="mt-4 text-5xl font-semibold tracking-[-0.08em] text-white md:text-6xl">404</h1>
          <h2 className="mt-3 text-2xl font-semibold tracking-[-0.04em] text-white md:text-3xl">ไม่พบหน้าที่คุณกำลังค้นหา</h2>

          <p className="mx-auto mt-4 max-w-xl text-sm leading-7 text-muted-foreground md:text-base">
            เส้นทางนี้อาจถูกย้าย ลบออก หรือยังไม่ได้เปิดใช้งานใน workspace รุ่นปัจจุบัน คุณสามารถกลับไปที่ landing page หรือเข้าสู่ dashboard หลักเพื่อทำงานต่อได้ทันที
          </p>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button className="rounded-full px-6" onClick={() => setLocation("/")}>
              <Home className="mr-2 h-4 w-4" />
              กลับสู่หน้าแรก
            </Button>
            <Button
              variant="outline"
              className="rounded-full border-white/10 bg-white/5 px-6 hover:bg-white/8"
              onClick={() => setLocation("/workspace")}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              ไปที่ workspace
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
