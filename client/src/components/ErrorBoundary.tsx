import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import { Component, ReactNode } from "react";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(114,92,255,0.2),transparent_32%),radial-gradient(circle_at_80%_10%,rgba(32,212,201,0.12),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.03),transparent_24%)]" />
          <Card className="glass-panel relative z-10 w-full max-w-3xl rounded-[2rem] border-white/10 bg-white/5 shadow-[0_30px_120px_rgba(2,6,23,0.34)]">
            <CardContent className="p-8 md:p-10">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-destructive/25 bg-destructive/10 text-destructive">
                <AlertTriangle className="h-10 w-10" />
              </div>

              <div className="mt-8 text-center">
                <p className="text-xs uppercase tracking-[0.3em] text-white/45">System fallback</p>
                <h1 className="mt-4 text-3xl font-semibold tracking-[-0.05em] text-white md:text-4xl">เกิดข้อผิดพลาดที่ไม่คาดคิดในแอป</h1>
                <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                  ระบบหยุดเพื่อป้องกันความเสียหายต่อ session ปัจจุบัน คุณสามารถรีโหลดหน้าเพื่อเริ่มต้นใหม่ หรือส่งรายละเอียดด้านล่างให้ทีมพัฒนาตรวจสอบต่อได้
                </p>
              </div>

              <div className="mt-8 rounded-[1.6rem] border border-white/10 bg-black/25 p-4 md:p-5">
                <p className="text-xs uppercase tracking-[0.24em] text-white/45">Error details</p>
                <pre className="mt-4 max-h-[320px] overflow-auto whitespace-pre-wrap break-words text-sm leading-6 text-muted-foreground">
                  {this.state.error?.stack ?? this.state.error?.message ?? "Unknown application error"}
                </pre>
              </div>

              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
                <Button className="rounded-full px-6" onClick={() => window.location.reload()}>
                  <RefreshCcw className="mr-2 h-4 w-4" />
                  Reload application
                </Button>
                <Button
                  variant="outline"
                  className="rounded-full border-white/10 bg-white/5 px-6 hover:bg-white/8"
                  onClick={() => (window.location.href = "/")}
                >
                  กลับสู่หน้าแรก
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
