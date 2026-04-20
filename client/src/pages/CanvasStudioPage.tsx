import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import WorkspaceShell from "@/components/WorkspaceShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { CheckCheck, CloudOff, Loader2, PenTool, Save, Shapes, StickyNote, Type } from "lucide-react";

type ToolMode = "select" | "pen" | "note" | "text" | "shape";

type CanvasElement = {
  id: string;
  type: "note" | "text" | "shape";
  x: number;
  y: number;
  width: number;
  height: number;
  text: string;
  color: string;
};

type CanvasLine = {
  id: string;
  path: string;
  color: string;
  width: number;
};

type CanvasState = {
  elements: CanvasElement[];
  lines: CanvasLine[];
};

const STORAGE_KEY = "whisperx-canvas-state-v3";
const CHANNEL_KEY = "whisperx-canvas-channel";
const initialState: CanvasState = {
  elements: [
    { id: "n1", type: "note", x: 48, y: 52, width: 170, height: 130, text: "Vision cluster", color: "rgba(168,85,247,0.24)" },
    { id: "t1", type: "text", x: 280, y: 100, width: 190, height: 90, text: "Launch narrative", color: "rgba(34,211,238,0.18)" },
    { id: "s1", type: "shape", x: 170, y: 260, width: 210, height: 120, text: "Delivery scope", color: "rgba(251,191,36,0.18)" },
  ],
  lines: [],
};

const toolMeta: Record<ToolMode, { label: string; description: string; icon: typeof PenTool }> = {
  select: { label: "Select", description: "เลือกและจัดตำแหน่งวัตถุบนบอร์ด", icon: PenTool },
  pen: { label: "Pen", description: "วาดเส้นอิสระสำหรับ brainstorming", icon: PenTool },
  note: { label: "Sticky", description: "เพิ่ม sticky note เพื่อจับประเด็น", icon: StickyNote },
  text: { label: "Text", description: "วางข้อความอธิบายหรือ heading", icon: Type },
  shape: { label: "Shape", description: "เพิ่มพื้นที่ block หรือ grouped scope", icon: Shapes },
};

function loadLocalState(): CanvasState {
  if (typeof window === "undefined") {
    return initialState;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CanvasState) : initialState;
  } catch {
    return initialState;
  }
}

function toPath(points: Array<{ x: number; y: number }>) {
  return points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)},${point.y.toFixed(1)}`).join(" ");
}

export default function CanvasStudioPage() {
  const utils = trpc.useUtils();
  const documentQuery = trpc.canvas.document.useQuery();
  const presenceQuery = trpc.collaboration.presence.useQuery();
  const saveMutation = trpc.canvas.save.useMutation({
    onSuccess: async result => {
      await Promise.all([utils.canvas.document.invalidate(), utils.collaboration.presence.invalidate()]);
      setLastSavedAt(Date.now());
      setHasLocalChanges(result.conflict ? true : false);
    },
  });
  const heartbeatMutation = trpc.collaboration.heartbeat.useMutation();

  const [canvasState, setCanvasState] = useState<CanvasState>(loadLocalState);
  const [mode, setMode] = useState<ToolMode>("select");
  const [draftLabel, setDraftLabel] = useState("New sticky note");
  const [strokeColor, setStrokeColor] = useState("#8b5cf6");
  const [activePoints, setActivePoints] = useState<Array<{ x: number; y: number }> | null>(null);
  const [dragState, setDragState] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (documentQuery.data && !hasHydrated) {
      const incomingState = {
        elements: documentQuery.data.elements,
        lines: documentQuery.data.lines,
      } satisfies CanvasState;
      setCanvasState(incomingState);
      setLastSavedAt(documentQuery.data.updatedAt);
      setHasHydrated(true);
    }
  }, [documentQuery.data, hasHydrated]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(canvasState));
    channelRef.current?.postMessage(canvasState);
  }, [canvasState]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
      return;
    }

    const channel = new BroadcastChannel(CHANNEL_KEY);
    channelRef.current = channel;
    channel.onmessage = event => {
      if (event.data) {
        setCanvasState(event.data as CanvasState);
      }
    };

    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, []);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      const rect = boardRef.current?.getBoundingClientRect();
      if (!rect) {
        return;
      }

      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      if (activePoints) {
        setActivePoints(current => (current ? [...current, { x, y }] : current));
      }

      if (dragState) {
        setCanvasState(current => ({
          ...current,
          elements: current.elements.map(element =>
            element.id === dragState.id
              ? { ...element, x: x - dragState.offsetX, y: y - dragState.offsetY }
              : element,
          ),
        }));
        setHasLocalChanges(true);
      }
    };

    const handlePointerUp = () => {
      if (activePoints && activePoints.length > 1) {
        setCanvasState(current => ({
          ...current,
          lines: [
            ...current.lines,
            {
              id: `line-${Date.now()}`,
              path: toPath(activePoints),
              color: strokeColor,
              width: 3,
            },
          ],
        }));
        setHasLocalChanges(true);
      }
      setActivePoints(null);
      setDragState(null);
    };

    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      window.removeEventListener("pointerup", handlePointerUp);
    };
  }, [activePoints, dragState, strokeColor]);

  useEffect(() => {
    heartbeatMutation.mutate({ module: "Canvas Studio", state: hasLocalChanges ? "editing" : "reviewing" });
    const intervalId = window.setInterval(() => {
      heartbeatMutation.mutate({ module: "Canvas Studio", state: hasLocalChanges ? "editing" : "reviewing" });
    }, 20000);

    return () => window.clearInterval(intervalId);
  }, [hasLocalChanges]);

  useEffect(() => {
    if (!hasHydrated || !hasLocalChanges) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      saveMutation.mutate({
        baseRevision: documentQuery.data?.revision,
        elements: canvasState.elements,
        lines: canvasState.lines,
      });
    }, 900);

    return () => window.clearTimeout(timeoutId);
  }, [canvasState, hasHydrated, hasLocalChanges]);

  const stats = useMemo(
    () => ({
      total: canvasState.elements.length + canvasState.lines.length,
      notes: canvasState.elements.filter(item => item.type === "note").length,
      shapes: canvasState.elements.filter(item => item.type === "shape").length,
      lines: canvasState.lines.length,
    }),
    [canvasState],
  );
  const selectedElement = useMemo(
    () => canvasState.elements.find(item => item.id === selectedElementId) ?? null,
    [canvasState.elements, selectedElementId],
  );

  const saveLabel = saveMutation.isPending
    ? "Autosaving…"
    : saveMutation.data?.conflict
      ? "Conflict detected"
      : saveMutation.error
        ? "Save delayed"
        : hasLocalChanges
          ? "Unsaved changes"
          : lastSavedAt
            ? `Saved ${new Date(lastSavedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
            : "Ready";

  const addElement = (type: CanvasElement["type"]) => {
    setCanvasState(current => ({
      ...current,
      elements: [
        ...current.elements,
        {
          id: `${type}-${Date.now()}`,
          type,
          x: 96 + current.elements.length * 16,
          y: 96 + current.elements.length * 14,
          width: type === "shape" ? 220 : 180,
          height: type === "shape" ? 120 : 130,
          text: type === "text" ? draftLabel || "Text block" : draftLabel || "Sticky note",
          color:
            type === "shape"
              ? "rgba(56,189,248,0.18)"
              : type === "text"
                ? "rgba(16,185,129,0.18)"
                : "rgba(168,85,247,0.24)",
        },
      ],
    }));
    setHasLocalChanges(true);
  };

  const startDrawing = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (mode !== "pen") {
      return;
    }
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }
    setActivePoints([{ x: event.clientX - rect.left, y: event.clientY - rect.top }]);
  };

  const startDragging = (event: ReactPointerEvent<HTMLButtonElement>, id: string) => {
    if (mode !== "select") {
      return;
    }
    const rect = boardRef.current?.getBoundingClientRect();
    const element = canvasState.elements.find(item => item.id === id);
    if (!rect || !element) {
      return;
    }
    setDragState({
      id,
      offsetX: event.clientX - rect.left - element.x,
      offsetY: event.clientY - rect.top - element.y,
    });
  };

  const updateSelectedElement = (patch: Partial<CanvasElement>) => {
    if (!selectedElementId) {
      return;
    }
    setCanvasState(current => ({
      ...current,
      elements: current.elements.map(element => (element.id === selectedElementId ? { ...element, ...patch } : element)),
    }));
    setHasLocalChanges(true);
  };

  const duplicateSelectedElement = () => {
    if (!selectedElement) {
      return;
    }
    const duplicate = {
      ...selectedElement,
      id: `${selectedElement.type}-${Date.now()}`,
      x: selectedElement.x + 24,
      y: selectedElement.y + 24,
    };
    setCanvasState(current => ({
      ...current,
      elements: [...current.elements, duplicate],
    }));
    setSelectedElementId(duplicate.id);
    setHasLocalChanges(true);
  };

  const deleteSelectedElement = () => {
    if (!selectedElementId) {
      return;
    }
    setCanvasState(current => ({
      ...current,
      elements: current.elements.filter(element => element.id !== selectedElementId),
    }));
    setSelectedElementId(null);
    setHasLocalChanges(true);
  };

  const resetBoard = () => {
    setCanvasState(initialState);
    setSelectedElementId(null);
    setHasLocalChanges(true);
  };

  const activeTool = toolMeta[mode];

  return (
    <WorkspaceShell
      title="Canvas Studio"
      description="whiteboard แบบ interactive สำหรับจัดวางแนวคิด วาดโครงสร้างงาน และสร้างบริบทการทำงานร่วมกันในหน้าเดียว"
      actions={
        <>
          <Input
            value={draftLabel}
            onChange={event => setDraftLabel(event.target.value)}
            className="w-56 rounded-full border-white/10 bg-white/5 focus-visible:border-primary/40"
          />
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
            <span className="text-xs uppercase tracking-[0.2em] text-white/50">Ink</span>
            <input
              type="color"
              value={strokeColor}
              onChange={event => setStrokeColor(event.target.value)}
              className="h-7 w-7 rounded-full border-0 bg-transparent"
            />
          </div>
          <Button
            variant="outline"
            className="rounded-full border-white/10 bg-white/5"
            disabled={saveMutation.isPending}
            onClick={() =>
              saveMutation.mutate({
                elements: canvasState.elements,
                lines: canvasState.lines,
              })
            }
          >
            {saveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save now
          </Button>
        </>
      }
    >
      <div className="grid gap-4 xl:grid-cols-4">
        <Card className="glass-panel border-white/10 bg-white/5 xl:col-span-3">
          <CardHeader className="flex flex-col gap-4 p-4 md:p-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-white">Interactive board</CardTitle>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  ใช้เครื่องมือด้านล่างเพื่อวาด จัดวาง sticky notes และจัดองค์ประกอบภาพรวมของ session ให้มองเห็นได้ชัดขึ้น พร้อม sync สถานะเข้าสู่ backend ของ workspace
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs uppercase tracking-[0.24em] text-white/60">
                  Active tool · {activeTool.label}
                </Badge>
                <Badge
                  className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.24em] ${
                    saveMutation.error || saveMutation.data?.conflict
                      ? "border-destructive/30 bg-destructive/10 text-destructive-foreground"
                      : hasLocalChanges
                        ? "border-amber-400/20 bg-amber-400/10 text-amber-100"
                        : "border-emerald-400/20 bg-emerald-400/10 text-emerald-100"
                  }`}
                >
                  {saveLabel}
                </Badge>
              </div>
            </div>
            <div className="grid gap-2 md:grid-cols-5">
              {(["select", "pen", "note", "text", "shape"] as ToolMode[]).map(tool => {
                const toolInfo = toolMeta[tool];
                const Icon = toolInfo.icon;
                const isActive = mode === tool;

                return (
                  <button
                    key={tool}
                    type="button"
                    onClick={() => setMode(tool)}
                    className={`rounded-[1.35rem] border p-4 text-left transition-all duration-300 ${
                      isActive
                        ? "border-primary/35 bg-primary/12 shadow-[0_18px_40px_rgba(109,92,246,0.18)]"
                        : "border-white/10 bg-black/20 hover:border-white/16 hover:bg-white/6"
                    }`}
                  >
                    <div className="flex items-center gap-3 text-white">
                      <Icon className="h-4 w-4 text-primary" />
                      <span className="font-medium">{toolInfo.label}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{toolInfo.description}</p>
                  </button>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-2">
              <Button className="rounded-full" onClick={() => addElement(mode === "shape" ? "shape" : mode === "text" ? "text" : "note")}>
                Insert item
              </Button>
              <Button variant="outline" className="rounded-full border-white/10 bg-white/5" onClick={resetBoard}>
                Reset board
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 md:p-6">
            {documentQuery.isLoading && !hasHydrated ? (
              <div className="flex min-h-[560px] items-center justify-center rounded-[2rem] border border-white/10 bg-black/20 text-muted-foreground">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading board state...
                </div>
              </div>
            ) : documentQuery.error && !hasHydrated ? (
              <div className="flex min-h-[560px] items-center justify-center rounded-[2rem] border border-destructive/20 bg-destructive/10 p-8 text-center text-sm leading-6 text-destructive-foreground/85">
                ไม่สามารถโหลดสถานะล่าสุดจาก backend ได้ในขณะนี้ ระบบจะแสดง local draft ล่าสุดแทนเพื่อให้คุณทำงานต่อได้
              </div>
            ) : (
              <div
                ref={boardRef}
                onPointerDown={startDrawing}
                className="relative min-h-[560px] overflow-hidden rounded-[2rem] border border-white/10 bg-[radial-gradient(circle_at_top,rgba(109,92,246,0.2),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))]"
              >
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.05)_1px,transparent_1px)] bg-[size:40px_40px] opacity-35" />
                <div className="absolute left-4 top-4 z-10 rounded-full border border-white/10 bg-black/25 px-3 py-2 text-xs text-white/70 backdrop-blur-xl">
                  {activeTool.description}
                </div>
                <svg className="pointer-events-none absolute inset-0 h-full w-full">
                  {canvasState.lines.map(line => (
                    <path
                      key={line.id}
                      d={line.path}
                      fill="none"
                      stroke={line.color}
                      strokeWidth={line.width}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ))}
                  {activePoints && activePoints.length > 1 ? (
                    <path
                      d={toPath(activePoints)}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={3}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  ) : null}
                </svg>
                {canvasState.elements.map(item => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedElementId(item.id)}
                    onPointerDown={event => startDragging(event, item.id)}
                    className={`absolute rounded-[1.4rem] border p-4 text-left shadow-[0_24px_60px_rgba(0,0,0,0.25)] transition-transform hover:-translate-y-1 ${selectedElementId === item.id ? "border-primary/50 ring-2 ring-primary/30" : "border-white/10"}`}
                    style={{ left: item.x, top: item.y, width: item.width, height: item.height, backgroundColor: item.color }}
                  >
                    <Badge className="rounded-full border border-white/12 bg-black/20 text-[10px] uppercase tracking-[0.24em] text-white/75">
                      {item.type}
                    </Badge>
                    <p className="mt-4 text-base font-medium text-white">{item.text}</p>
                    <p className="mt-2 text-xs leading-5 text-white/65">
                      {mode === "select" ? "ลากเพื่อย้ายตำแหน่ง" : "สลับไป select เพื่อจัดวาง"}
                    </p>
                  </button>
                ))}
                {!canvasState.elements.length && !canvasState.lines.length ? (
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <Empty className="rounded-[1.75rem] border border-dashed border-white/12 bg-black/20 p-8">
                      <EmptyHeader>
                        <EmptyMedia variant="icon" className="bg-white/10 text-white">
                          <PenTool className="h-5 w-5" />
                        </EmptyMedia>
                        <EmptyTitle className="text-white">เริ่มวางองค์ประกอบแรกของบอร์ด</EmptyTitle>
                        <EmptyDescription className="text-muted-foreground">
                          ใช้ pen เพื่อสเก็ตช์ หรือเพิ่ม sticky note / shape เพื่อสร้างโครง narrative ของ session นี้
                        </EmptyDescription>
                      </EmptyHeader>
                    </Empty>
                  </div>
                ) : null}
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="glass-panel border-white/10 bg-white/5">
          <CardHeader className="p-6">
            <CardTitle className="text-xl font-semibold text-white">Board inspector</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6 pt-0">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-sm text-muted-foreground">Renderable items</p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">{stats.total}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-muted-foreground">Sticky notes</p>
                <p className="mt-2 text-2xl font-semibold text-white">{stats.notes}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <p className="text-sm text-muted-foreground">Shapes</p>
                <p className="mt-2 text-2xl font-semibold text-white">{stats.shapes}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4 sm:col-span-2 xl:col-span-1">
                <p className="text-sm text-muted-foreground">Ink paths</p>
                <p className="mt-2 text-2xl font-semibold text-white">{stats.lines}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-muted-foreground">
              <div className="flex items-center justify-between gap-3">
                <span>Sync state</span>
                <Badge className="rounded-full border border-emerald-400/20 bg-emerald-400/10 text-emerald-200">
                  {presenceQuery.data?.syncState ?? "loading"}
                </Badge>
              </div>
              <div className="mt-4 space-y-2">
                {presenceQuery.isLoading ? (
                  <div className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/5 px-3 py-3 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading collaboration presence...
                  </div>
                ) : null}
                {saveMutation.error ? (
                  <div className="flex items-center gap-3 rounded-xl border border-destructive/25 bg-destructive/10 px-3 py-3 text-destructive-foreground/85">
                    <CloudOff className="h-4 w-4" />
                    Presence feed ชะลอตัวชั่วคราว แต่ editor ยังทำงานต่อได้ตามปกติ
                  </div>
                ) : null}
                {saveMutation.data?.conflict ? (
                  <div className="rounded-xl border border-amber-400/25 bg-amber-400/10 px-3 py-3 text-xs text-amber-100">
                    มีคนอื่นบันทึกบอร์ดก่อนหน้า revision นี้แล้ว กรุณาตรวจข้อมูลล่าสุดก่อนกด Save now ซ้ำอีกครั้ง
                  </div>
                ) : null}

                {presenceQuery.data?.events?.slice(0, 2).map(event => (
                  <div key={event.id} className="rounded-xl border border-white/8 bg-white/5 px-3 py-3">
                    <p className="text-sm font-medium text-white">{event.detail}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{event.actor} · {event.module}</p>
                  </div>
                ))}
                {presenceQuery.data?.members?.length ? (
                  presenceQuery.data.members.map(member => (
                    <div key={member.name} className="flex items-center justify-between gap-2 rounded-xl border border-white/8 bg-white/5 px-3 py-2">
                      <span className="text-white/85">{member.name}</span>
                      <span className="text-xs text-muted-foreground">{member.state}</span>
                    </div>
                  ))
                ) : null}
                {!presenceQuery.isLoading && !presenceQuery.data?.members?.length ? (
                  <div className="rounded-xl border border-dashed border-white/10 bg-white/5 px-3 py-3 text-xs text-muted-foreground">
                    ยังไม่พบสมาชิกที่ active อยู่บนบอร์ดนี้ในขณะนี้
                  </div>
                ) : null}
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-medium text-white">Selection inspector</p>
                {selectedElement ? (
                  <Badge className="rounded-full border border-white/10 bg-white/5 text-white/70">{selectedElement.type}</Badge>
                ) : null}
              </div>
              {selectedElement ? (
                <div className="mt-4 space-y-3">
                  <Input
                    value={selectedElement.text}
                    onChange={event => updateSelectedElement({ text: event.target.value })}
                    className="rounded-2xl border-white/10 bg-white/5 focus-visible:border-primary/40"
                  />
                  <div className="grid gap-3 sm:grid-cols-2">
                    <label className="space-y-2 text-xs uppercase tracking-[0.18em] text-white/45">
                      Width
                      <Input
                        type="number"
                        value={selectedElement.width}
                        onChange={event => updateSelectedElement({ width: Number(event.target.value) || selectedElement.width })}
                        className="rounded-2xl border-white/10 bg-white/5 focus-visible:border-primary/40"
                      />
                    </label>
                    <label className="space-y-2 text-xs uppercase tracking-[0.18em] text-white/45">
                      Height
                      <Input
                        type="number"
                        value={selectedElement.height}
                        onChange={event => updateSelectedElement({ height: Number(event.target.value) || selectedElement.height })}
                        className="rounded-2xl border-white/10 bg-white/5 focus-visible:border-primary/40"
                      />
                    </label>
                  </div>
                  <label className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs uppercase tracking-[0.18em] text-white/45">
                    Color
                    <input
                      type="color"
                      value={selectedElement.color.startsWith("#") ? selectedElement.color : strokeColor}
                      onChange={event => updateSelectedElement({ color: event.target.value })}
                      className="h-8 w-8 rounded-full border-0 bg-transparent"
                    />
                  </label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <Button variant="outline" className="rounded-full border-white/10 bg-white/5" onClick={duplicateSelectedElement}>
                      Duplicate
                    </Button>
                    <Button variant="outline" className="rounded-full border-destructive/30 bg-destructive/10 text-destructive-foreground hover:bg-destructive/20" onClick={deleteSelectedElement}>
                      Delete
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="mt-4 rounded-xl border border-dashed border-white/10 bg-white/5 px-3 py-4 text-sm text-muted-foreground">
                  เลือกองค์ประกอบบนบอร์ดเพื่อแก้ข้อความ สี ขนาด หรือทำซ้ำ/ลบจาก inspector นี้
                </div>
              )}
            </div>
            <div
              className={`flex items-center gap-3 rounded-2xl border p-4 text-sm ${
                saveMutation.error || saveMutation.data?.conflict
                  ? "border-destructive/30 bg-destructive/10 text-destructive-foreground/85"
                  : "border-primary/20 bg-primary/10 text-white/80"
              }`}
            >
              {saveMutation.error || saveMutation.data?.conflict ? <CloudOff className="h-4 w-4" /> : <CheckCheck className="h-4 w-4 text-primary" />}
              {saveMutation.data?.conflict
                ? "ตรวจพบ revision conflict จาก backend กรุณาโหลด state ล่าสุดแล้วบันทึกใหม่เพื่อลดการเขียนทับระหว่างผู้ร่วมงาน"
                : saveMutation.error
                  ? "Autosave ล้มเหลวชั่วคราว ข้อมูล local draft ยังถูกเก็บไว้และสามารถกด Save now ได้อีกครั้ง"
                  : "Board state ถูกเก็บทั้งแบบ local draft และ backend revision พร้อมรองรับ inspector edits สำหรับข้อความ สี ขนาด และการจัดองค์ประกอบ"}
            </div>
          </CardContent>
        </Card>
      </div>
    </WorkspaceShell>
  );
}
