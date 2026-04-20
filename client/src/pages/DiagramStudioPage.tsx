import { useEffect, useMemo, useRef, useState } from "react";
import type { PointerEvent as ReactPointerEvent } from "react";
import WorkspaceShell from "@/components/WorkspaceShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { GitBranch, Network } from "lucide-react";

type NodeKind = "root" | "process" | "decision" | "insight";

type DiagramNode = {
  id: string;
  title: string;
  x: number;
  y: number;
  kind: NodeKind;
};

type DiagramEdge = { id: string; from: string; to: string };

type DiagramState = { nodes: DiagramNode[]; edges: DiagramEdge[] };

const STORAGE_KEY = "whisperx-diagram-state-v2";
const CHANNEL_KEY = "whisperx-diagram-channel";

const initialState: DiagramState = {
  nodes: [
    { id: "root", title: "Core Objective", x: 64, y: 100, kind: "root" },
    { id: "n2", title: "Research", x: 320, y: 80, kind: "process" },
    { id: "n3", title: "Decision", x: 320, y: 250, kind: "decision" },
    { id: "n4", title: "Publish", x: 560, y: 170, kind: "insight" },
  ],
  edges: [
    { id: "e1", from: "root", to: "n2" },
    { id: "e2", from: "n2", to: "n3" },
    { id: "e3", from: "n3", to: "n4" },
  ],
};

const kindStyles: Record<NodeKind, string> = {
  root: "border-primary/40 bg-primary/12",
  process: "border-cyan-400/25 bg-cyan-400/10",
  decision: "border-amber-400/25 bg-amber-400/10",
  insight: "border-emerald-400/25 bg-emerald-400/10",
};

function loadState(): DiagramState {
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
  const [diagramState, setDiagramState] = useState<DiagramState>(loadState);
  const [selected, setSelected] = useState<string[]>([]);
  const [dragState, setDragState] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<BroadcastChannel | null>(null);

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
    };

    const handleUp = () => setDragState(null);
    window.addEventListener("pointermove", handleMove);
    window.addEventListener("pointerup", handleUp);
    return () => {
      window.removeEventListener("pointermove", handleMove);
      window.removeEventListener("pointerup", handleUp);
    };
  }, [dragState]);

  const nodeMap = useMemo(() => Object.fromEntries(diagramState.nodes.map(node => [node.id, node])), [diagramState.nodes]);

  const addNode = () => {
    const count = diagramState.nodes.length + 1;
    const id = `n${count}`;
    setDiagramState(current => ({
      ...current,
      nodes: [...current.nodes, { id, title: `Node ${count}`, x: 120 + count * 36, y: 80 + count * 28, kind: "process" }],
    }));
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
      edges: [...current.edges, { id: `e${Date.now()}`, from, to }],
    }));
    setSelected([]);
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
          <Button className="rounded-full px-5" onClick={addNode}>
            Add node
          </Button>
          <Button
            variant="outline"
            className="rounded-full border-white/10 bg-white/5 px-5"
            onClick={connectSelected}
            disabled={selected.length !== 2}
          >
            Connect selection
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
                  คลิกเพื่อ select โหนด ลากเพื่อจัด layout และใช้ connect selection เพื่อสร้างความสัมพันธ์ใหม่ระหว่างส่วนต่าง ๆ ของระบบ
                </p>
              </div>
              <div className="rounded-full border border-white/10 bg-black/20 px-4 py-2 text-xs uppercase tracking-[0.24em] text-white/60">
                {selected.length}/2 nodes selected
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 md:p-6">
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
                    <path
                      key={edge.id}
                      d={`M ${source.x + 84} ${source.y + 32} C ${source.x + 180} ${source.y + 32}, ${target.x - 90} ${target.y + 32}, ${target.x} ${target.y + 32}`}
                      fill="none"
                      stroke="rgba(125, 211, 252, 0.7)"
                      strokeWidth="2.5"
                      strokeDasharray="8 8"
                    />
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
                <span className="font-medium">Selection guidance</span>
              </div>
              <p className="mt-2">
                เลือกสองโหนดแล้วกด Connect selection เพื่อสร้าง relation ใหม่ จากนั้นลากโหนดเพื่อสำรวจทั้ง flowchart และ mind-map layout บน surface เดียวกัน
              </p>
            </div>
            <div className="rounded-2xl border border-primary/20 bg-primary/10 p-4 text-white/75">
              โครง diagram นี้ถูกออกแบบให้ทำงานควบคู่กับ Canvas Studio เพื่อให้การคิดเชิงโครงสร้างและการสเก็ตช์ภาพรวมไหลต่อกันได้อย่างเป็นธรรมชาติ
            </div>
          </CardContent>
        </Card>
      </div>
    </WorkspaceShell>
  );
}
