import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import WorkspaceShell from "@/components/WorkspaceShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { CheckCheck, CloudOff, GitBranch, Loader2, Network, Plus, Save, Unplug } from "lucide-react";

type NodeKind = "root" | "process" | "decision" | "insight";

type DiagramNode = {
  id: string;
  title: string;
  x: number;
  y: number;
  kind: NodeKind;
};

type DiagramEdge = { id: string; from: string; to: string; label?: string };

type DiagramState = { nodes: DiagramNode[]; edges: DiagramEdge[] };

const STORAGE_KEY = "whisperx-diagram-state-v3";
const CHANNEL_KEY = "whisperx-diagram-channel";

const initialState: DiagramState = {
  nodes: [
    { id: "root", title: "Core Objective", x: 64, y: 100, kind: "root" },
    { id: "n2", title: "Research", x: 320, y: 80, kind: "process" },
    { id: "n3", title: "Decision", x: 320, y: 250, kind: "decision" },
    { id: "n4", title: "Publish", x: 560, y: 170, kind: "insight" },
  ],
  edges: [
    { id: "e1", from: "root", to: "n2", label: "discover" },
    { id: "e2", from: "n2", to: "n3", label: "evaluate" },
    { id: "e3", from: "n3", to: "n4", label: "ship" },
  ],
};

const kindStyles: Record<NodeKind, string> = {
  root: "border-primary/40 bg-primary/12",
  process: "border-cyan-400/25 bg-cyan-400/10",
  decision: "border-amber-400/25 bg-amber-400/10",
  insight: "border-emerald-400/25 bg-emerald-400/10",
};

function loadLocalState(): DiagramState {
  if (typeof window === "undefined") {
    return initialState;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as DiagramState) : initialState;
  } catch {
    return initialState;
  }
}

export default function DiagramStudioPage() {
  const utils = trpc.useUtils();
  const documentQuery = trpc.diagram.document.useQuery();
  const presenceQuery = trpc.collaboration.presence.useQuery();
  const saveMutation = trpc.diagram.save.useMutation({
    onSuccess: async result => {
      await Promise.all([utils.diagram.document.invalidate(), utils.collaboration.presence.invalidate()]);
      setLastSavedAt(Date.now());
      setHasLocalChanges(result.conflict ? true : false);
    },
  });
  const heartbeatMutation = trpc.collaboration.heartbeat.useMutation();

  const [diagramState, setDiagramState] = useState<DiagramState>(loadLocalState);
  const [selected, setSelected] = useState<string[]>([]);
  const [dragState, setDragState] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const [connectorLabel, setConnectorLabel] = useState("supports");
  const [hasHydrated, setHasHydrated] = useState(false);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState<number | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);

  useEffect(() => {
    if (documentQuery.data && !hasHydrated) {
      setDiagramState({
        nodes: documentQuery.data.nodes,
        edges: documentQuery.data.edges,
      });
      setLastSavedAt(documentQuery.data.updatedAt);
      setHasHydrated(true);
    }
  }, [documentQuery.data, hasHydrated]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(diagramState));
    channelRef.current?.postMessage(diagramState);
  }, [diagramState]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
      return;
    }
    const channel = new BroadcastChannel(CHANNEL_KEY);
    channelRef.current = channel;
    channel.onmessage = event => {
      if (event.data) {
        setDiagramState(event.data as DiagramState);
      }
    };
    return () => {
      channel.close();
      channelRef.current = null;
    };
  }, []);

  useEffect(() => {
    const handleMove = (event: PointerEvent) => {
      const rect = boardRef.current?.getBoundingClientRect();
      if (!rect || !dragState) {
        return;
      }
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      setDiagramState(current => ({
        ...current,
        nodes: current.nodes.map(node =>
          node.id === dragState.id ? { ...node, x: x - dragState.offsetX, y: y - dragState.offsetY } : node,
        ),
      }));
      setHasLocalChanges(true);
    };

    const handleUp = () => setDragState(null);
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [dragState]);

  useEffect(() => {
    heartbeatMutation.mutate({ module: "Diagram Builder", state: hasLocalChanges ? "editing connectors" : "reviewing map" });
    const intervalId = window.setInterval(() => {
      heartbeatMutation.mutate({ module: "Diagram Builder", state: hasLocalChanges ? "editing connectors" : "reviewing map" });
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
        nodes: diagramState.nodes,
        edges: diagramState.edges,
      });
    }, 900);

    return () => window.clearTimeout(timeoutId);
  }, [diagramState, hasHydrated, hasLocalChanges]);

  const nodeMap = useMemo(() => Object.fromEntries(diagramState.nodes.map(node => [node.id, node])), [diagramState.nodes]);
  const selectedEdges = useMemo(
    () => diagramState.edges.filter(edge => selected.includes(edge.from) && selected.includes(edge.to)),
    [diagramState.edges, selected],
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

  const addNode = () => {
    const count = diagramState.nodes.length + 1;
    const id = `n${count}`;
    setDiagramState(current => ({
      ...current,
      nodes: [...current.nodes, { id, title: `Node ${count}`, x: 120 + count * 36, y: 80 + count * 28, kind: "process" }],
    }));
    setHasLocalChanges(true);
  };

  const connectSelected = () => {
    if (selected.length !== 2) {
      return;
    }
    const [from, to] = selected;
    const exists = diagramState.edges.some(edge => edge.from === from && edge.to === to);
    if (exists) {
      return;
    }
    setDiagramState(current => ({
      ...current,
      edges: [...current.edges, { id: `e${Date.now()}`, from, to, label: connectorLabel || "supports" }],
    }));
    setSelected([]);
    setHasLocalChanges(true);
  };

  const disconnectSelected = () => {
    if (selected.length !== 2) {
      return;
    }
    const [from, to] = selected;
    setDiagramState(current => ({
      ...current,
      edges: current.edges.filter(edge => !(edge.from === from && edge.to === to)),
    }));
    setHasLocalChanges(true);
  };

  const updateSelectedConnectorLabel = () => {
    if (selected.length !== 2) {
      return;
    }
    const [from, to] = selected;
    setDiagramState(current => ({
      ...current,
      edges: current.edges.map(edge =>
        edge.from === from && edge.to === to
          ? { ...edge, label: connectorLabel || edge.label || "supports" }
          : edge,
      ),
    }));
    setHasLocalChanges(true);
  };

  const toggleSelected = (id: string) => {
    setSelected(current => (current.includes(id) ? current.filter(item => item !== id) : [...current.slice(-1), id]));
  };

  const startDragging = (event: ReactPointerEvent<HTMLButtonElement>, node: DiagramNode) => {
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) {
      return;
    }
    setDragState({
      id: node.id,
      offsetX: event.clientX - rect.left - node.x,
      offsetY: event.clientY - rect.top - node.y,
    });
  };

  return (
    <WorkspaceShell
      title="Diagram Builder"
      description="สร้าง flowchart และ mind map ด้วยโครงเชื่อมต่อแบบ node-based เพื่อให้ logic, dependencies และ decision branches มองเห็นได้อย่างเป็นระบบ"
      actions={
        <>
          <Input
            value={connectorLabel}
            onChange={event => setConnectorLabel(event.target.value)}
            className="w-44 rounded-full border-white/10 bg-white/5 focus-visible:border-primary/40"
          />
          <Button className="rounded-full px-5" onClick={addNode}>
            <Plus className="mr-2 h-4 w-4" />
            Add node
          </Button>
          <Button
            variant="outline"
            className="rounded-full border-white/10 bg-white/5 px-5"
            onClick={() => saveMutation.mutate({ nodes: diagramState.nodes, edges: diagramState.edges })}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Save now
          </Button>
        </>
      }
    >
      <div className="grid gap-6 xl:grid-cols-[1.18fr_0.82fr]">
        <Card className="glass-panel border-white/10 bg-white/5">
          <CardHeader className="p-6">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <CardTitle className="text-xl font-semibold text-white">Node canvas</CardTitle>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  คลิกเพื่อ select โหนด ลากเพื่อจัด layout และใช้แผง connector controls เพื่อเพิ่ม แก้ label หรือถอดความสัมพันธ์ระหว่างโหนดแบบ backend-backed
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs uppercase tracking-[0.24em] text-white/60">
                  {selected.length}/2 nodes selected
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
          </CardHeader>
          <CardContent className="p-4 pt-0 md:p-6">
            {documentQuery.isLoading && !hasHydrated ? (
              <div className="flex min-h-[560px] items-center justify-center rounded-[2rem] border border-white/10 bg-black/20 text-muted-foreground">
                <div className="flex items-center gap-3">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Loading diagram state...
                </div>
              </div>
            ) : documentQuery.error && !hasHydrated ? (
              <div className="flex min-h-[560px] items-center justify-center rounded-[2rem] border border-destructive/20 bg-destructive/10 p-8 text-center text-sm leading-6 text-destructive-foreground/85">
                ไม่สามารถโหลดโครง diagram ล่าสุดจาก backend ได้ในขณะนี้ ระบบจะแสดง local draft ล่าสุดเพื่อให้ทำงานต่อได้
              </div>
            ) : (
              <div
                ref={boardRef}
                className="relative min-h-[560px] overflow-hidden rounded-[2rem] border border-white/10 bg-[linear-gradient(180deg,rgba(109,92,246,0.08),rgba(255,255,255,0.02))]"
              >
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(34,197,94,0.08),transparent_25%),linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:auto,36px_36px,36px_36px]" />
                <svg className="absolute inset-0 h-full w-full">
                  {diagramState.edges.map(edge => {
                    const source = nodeMap[edge.from];
                    const target = nodeMap[edge.to];
                    if (!source || !target) {
                      return null;
                    }
                    return (
                      <g key={edge.id}>
                        <path
                          d={`M ${source.x + 84} ${source.y + 32} C ${source.x + 180} ${source.y + 32}, ${target.x - 90} ${target.y + 32}, ${target.x} ${target.y + 32}`}
                          fill="none"
                          stroke="rgba(125, 211, 252, 0.7)"
                          strokeWidth="2.5"
                          strokeDasharray="8 8"
                        />
                        <text
                          x={(source.x + target.x) / 2 + 24}
                          y={(source.y + target.y) / 2 + 20}
                          fill="rgba(255,255,255,0.72)"
                          fontSize="12"
                        >
                          {edge.label ?? "linked"}
                        </text>
                      </g>
                    );
                  })}
                </svg>
                {diagramState.nodes.map(node => (
                  <button
                    key={node.id}
                    onClick={() => toggleSelected(node.id)}
                    onPointerDown={event => startDragging(event, node)}
                    className={`absolute w-44 rounded-[1.35rem] border p-4 text-left shadow-[0_20px_50px_rgba(0,0,0,0.3)] transition-transform hover:-translate-y-1 ${selected.includes(node.id) ? "border-primary bg-primary/15" : `${kindStyles[node.kind]} border-white/10`}`}
                    style={{ left: node.x, top: node.y }}
                  >
                    <Badge className="rounded-full border border-white/10 bg-white/5 text-[10px] uppercase tracking-[0.24em] text-white/70">
                      {node.kind}
                    </Badge>
                    <p className="mt-4 text-base font-medium text-white">{node.title}</p>
                    <p className="mt-2 text-xs leading-5 text-muted-foreground">คลิกเพื่อ select และลากเพื่อ reposition</p>
                  </button>
                ))}
                {!diagramState.nodes.length ? (
                  <div className="absolute inset-0 flex items-center justify-center p-8">
                    <Empty className="rounded-[1.75rem] border border-dashed border-white/12 bg-black/20 p-8">
                      <EmptyHeader>
                        <EmptyMedia variant="icon" className="bg-white/10 text-white">
                          <Network className="h-5 w-5" />
                        </EmptyMedia>
                        <EmptyTitle className="text-white">ยังไม่มีโหนดบนผังนี้</EmptyTitle>
                        <EmptyDescription className="text-muted-foreground">
                          เริ่มต้นด้วยการเพิ่ม node ใหม่ แล้วค่อยลากจัดโครงสร้าง flow หรือ mind map ให้ตรงกับลำดับความคิดของคุณ
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
            <CardTitle className="text-xl font-semibold text-white">Diagram insights</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 p-6 pt-0 text-sm leading-6 text-muted-foreground">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p>Active nodes</p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">{diagramState.nodes.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <p>Editable connectors</p>
              <p className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-white">{diagramState.edges.length}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-3 text-white">
                <GitBranch className="h-4 w-4 text-primary" />
                <span className="font-medium">Connector controls</span>
              </div>
              <p className="mt-2">
                เลือกสองโหนด จากนั้นเพิ่ม relation ใหม่ ปรับ label ของ connector เดิม หรือยกเลิกการเชื่อมต่อเพื่อสำรวจได้ทั้ง flowchart และ mind map layout บน surface เดียวกัน
              </p>
              <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-1">
                <Button className="rounded-full" disabled={selected.length !== 2} onClick={connectSelected}>
                  Connect selection
                </Button>
                <Button variant="outline" className="rounded-full border-white/10 bg-white/5" disabled={selected.length !== 2} onClick={updateSelectedConnectorLabel}>
                  Update connector label
                </Button>
                <Button variant="outline" className="rounded-full border-white/10 bg-white/5" disabled={selected.length !== 2} onClick={disconnectSelected}>
                  <Unplug className="mr-2 h-4 w-4" />
                  Disconnect
                </Button>
              </div>
            </div>
            <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4 text-white/75">
              โครง diagram นี้ถูกออกแบบให้ทำงานควบคู่กับ Canvas Studio เพื่อให้การคิดเชิงโครงสร้างและการสเก็ตช์ภาพรวมไหลต่อกันได้อย่างเป็นธรรมชาติ
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center justify-between gap-3">
                <span>Presence feed</span>
                <Badge className="rounded-full border border-emerald-400/20 bg-emerald-400/10 text-emerald-200">
                  {presenceQuery.data?.syncState ?? "loading"}
                </Badge>
              </div>
              <div className="mt-4 space-y-2">
                {presenceQuery.error ? (
                  <div className="flex items-center gap-3 rounded-xl border border-destructive/25 bg-destructive/10 px-3 py-3 text-destructive-foreground/85">
                    <CloudOff className="h-4 w-4" />
                    Presence feed ชะลอตัวชั่วคราว แต่ diagram draft ยังทำงานได้ต่อเนื่อง
                  </div>
                ) : null}
                {saveMutation.data?.conflict ? (
                  <div className="rounded-xl border border-amber-400/25 bg-amber-400/10 px-3 py-3 text-xs text-amber-100">
                    diagram revision ล่าสุดถูกแก้โดยผู้ร่วมงานคนอื่นแล้ว กรุณาโหลด state ใหม่ก่อนบันทึกซ้ำ
                  </div>
                ) : null}
                {presenceQuery.data?.events?.slice(0, 3).map(event => (
                  <div key={event.id} className="rounded-xl border border-white/8 bg-white/5 px-3 py-3">
                    <p className="text-sm font-medium text-white">{event.detail}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{event.actor} · {event.module}</p>
                  </div>
                ))}
                {!presenceQuery.isLoading && !presenceQuery.data?.events?.length ? (
                  <div className="rounded-xl border border-dashed border-white/10 bg-white/5 px-3 py-3 text-xs text-muted-foreground">
                    เมื่อมีการแก้ไข diagram หรือ collaboration events ใหม่ ระบบจะแสดงที่นี่
                  </div>
                ) : null}
              </div>
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
                ? "ตรวจพบ revision conflict จาก backend กรุณาโหลด state ล่าสุดก่อนอัปเดต connector หรือ layout ซ้ำอีกครั้ง"
                : saveMutation.error
                  ? "Autosave ล้มเหลวชั่วคราว แต่ local draft ยังถูกเก็บไว้และสามารถบันทึกใหม่ได้"
                  : selectedEdges.length
                    ? `Selected connectors: ${selectedEdges.map(edge => edge.label ?? `${edge.from} → ${edge.to}`).join(", ")}`
                    : "Diagram state ถูกเก็บทั้ง local draft และ backend revision เพื่อรองรับการกลับมาแก้ไขต่อ"}
            </div>
          </CardContent>
        </Card>
      </div>
    </WorkspaceShell>
  );
}
