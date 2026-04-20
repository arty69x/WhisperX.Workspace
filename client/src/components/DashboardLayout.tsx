import { useAuth } from "@/_core/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { getLoginUrl } from "@/const";
import { useIsMobile } from "@/hooks/useMobile";
import type { NavigationItem } from "@/lib/platform";
import { ChevronRight, LogOut, PanelLeft, ShieldCheck, Sparkles } from "lucide-react";
import type { CSSProperties } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { DashboardLayoutSkeleton } from "./DashboardLayoutSkeleton";

type DashboardLayoutProps = {
  children: React.ReactNode;
  title: string;
  description: string;
  navigation: NavigationItem[];
};

const SIDEBAR_WIDTH_KEY = "whisperx-sidebar-width";
const DEFAULT_WIDTH = 288;
const MIN_WIDTH = 224;
const MAX_WIDTH = 420;

export default function DashboardLayout({ children, title, description, navigation }: DashboardLayoutProps) {
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    if (typeof window === "undefined") {
      return DEFAULT_WIDTH;
    }

    const saved = window.localStorage.getItem(SIDEBAR_WIDTH_KEY);
    return saved ? Number.parseInt(saved, 10) : DEFAULT_WIDTH;
  });
  const { loading, user } = useAuth();

  useEffect(() => {
    if (typeof window !== "undefined") {
      window.localStorage.setItem(SIDEBAR_WIDTH_KEY, String(sidebarWidth));
    }
  }, [sidebarWidth]);

  if (loading) {
    return <DashboardLayoutSkeleton />;
  }

  if (!user) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-6 py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(111,92,255,0.22),transparent_30%),radial-gradient(circle_at_85%_10%,rgba(25,198,196,0.14),transparent_24%),radial-gradient(circle_at_50%_100%,rgba(255,255,255,0.06),transparent_22%)]" />
        <div className="relative z-10 surface-outline max-w-xl rounded-[2rem] p-8 md:p-10">
          <Badge className="mb-5 rounded-full border border-white/15 bg-white/10 px-4 py-1 text-xs font-medium uppercase tracking-[0.24em] text-white/80">
            Secured workspace
          </Badge>
          <h1 className="text-balance text-3xl font-semibold tracking-[-0.05em] text-white md:text-4xl">
            Sign in to access the unified workspace.
          </h1>
          <p className="mt-4 max-w-lg text-sm leading-7 text-muted-foreground md:text-base">
            WhisperX Nexus Omega รวมทุกโมดูลสำหรับ visual collaboration, AI orchestration และ analytics ไว้ในพื้นที่ทำงานเดียว การเข้าสู่ระบบจะเปิดใช้งานสิทธิ์ตามบทบาทของคุณโดยอัตโนมัติ
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button
              size="lg"
              className="min-w-44 rounded-full bg-primary px-7 shadow-[0_20px_60px_rgba(109,92,246,0.35)]"
              onClick={() => {
                window.location.href = getLoginUrl();
              }}
            >
              Enter workspace
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="min-w-44 rounded-full border-white/15 bg-white/5"
              onClick={() => {
                window.location.href = "/";
              }}
            >
              Back to landing
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const filteredNavigation = navigation.filter(item => !item.adminOnly || user.role === "admin");

  return (
    <SidebarProvider style={{ "--sidebar-width": `${sidebarWidth}px` } as CSSProperties}>
      <DashboardLayoutContent
        navigation={filteredNavigation}
        title={title}
        description={description}
        setSidebarWidth={setSidebarWidth}
      >
        {children}
      </DashboardLayoutContent>
    </SidebarProvider>
  );
}

type DashboardLayoutContentProps = {
  children: React.ReactNode;
  title: string;
  description: string;
  navigation: NavigationItem[];
  setSidebarWidth: (width: number) => void;
};

function DashboardLayoutContent({
  children,
  title,
  description,
  navigation,
  setSidebarWidth,
}: DashboardLayoutContentProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { state, toggleSidebar } = useSidebar();
  const isCollapsed = state === "collapsed";
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();

  const activeItem = useMemo(() => navigation.find(item => item.path === location) ?? navigation[0], [location, navigation]);

  useEffect(() => {
    if (isCollapsed) {
      setIsResizing(false);
    }
  }, [isCollapsed]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!isResizing) {
        return;
      }

      const sidebarLeft = sidebarRef.current?.getBoundingClientRect().left ?? 0;
      const width = event.clientX - sidebarLeft;
      if (width >= MIN_WIDTH && width <= MAX_WIDTH) {
        setSidebarWidth(width);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "col-resize";
      document.body.style.userSelect = "none";
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isResizing, setSidebarWidth]);

  return (
    <>
      <div className="relative" ref={sidebarRef}>
        <Sidebar collapsible="icon" className="border-r border-white/8 bg-sidebar/82 backdrop-blur-2xl supports-[backdrop-filter]:bg-sidebar/78">
          <SidebarHeader className="border-b border-white/8 px-3 py-4">
            <div className="flex items-center gap-3 px-2 transition-all">
              <button
                onClick={toggleSidebar}
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-muted-foreground transition-all hover:border-white/20 hover:bg-white/10 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Toggle navigation"
              >
                <PanelLeft className="h-4 w-4" />
              </button>
              {!isCollapsed ? (
                <div className="min-w-0">
                  <p className="text-xs uppercase tracking-[0.28em] text-white/45">WhisperX Nexus Omega</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="truncate text-sm font-semibold text-foreground">All-in-One Workspace</span>
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                </div>
              ) : null}
            </div>
          </SidebarHeader>

          <SidebarContent className="gap-0 px-2 py-4">
            <div className="mb-4 px-2 group-data-[collapsible=icon]:hidden">
              <div className="rounded-[1.6rem] border border-white/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.09),rgba(255,255,255,0.04))] p-4 shadow-[0_22px_48px_rgba(2,6,23,0.2)]">
                <p className="text-xs uppercase tracking-[0.24em] text-white/40">Workspace mode</p>
                <p className="mt-3 text-sm font-medium text-foreground">Governed collaboration</p>
                <p className="mt-2 text-xs leading-6 text-muted-foreground">
                  ทุกโมดูลแชร์ข้อมูล สิทธิ์ และ operational context ร่วมกันภายใน shell เดียว
                </p>
              </div>
            </div>
            <SidebarMenu className="gap-1 px-1">
              {navigation.map(item => {
                const isActive = location === item.path;
                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      isActive={isActive}
                      tooltip={item.label}
                      onClick={() => setLocation(item.path)}
                      className="group h-auto min-h-12 rounded-2xl px-3 py-3 text-left transition-all duration-200 hover:translate-x-[2px] hover:border-white/10 hover:bg-white/8 data-[active=true]:border data-[active=true]:border-primary/30 data-[active=true]:bg-primary/12 data-[active=true]:shadow-[0_18px_40px_rgba(109,92,246,0.16)]"
                    >
                      <item.icon className={`mt-0.5 h-4 w-4 shrink-0 transition-colors ${isActive ? "text-primary" : "text-muted-foreground group-hover:text-white"}`} />
                      <div className="min-w-0 group-data-[collapsible=icon]:hidden">
                        <div className="text-sm font-medium text-foreground">{item.label}</div>
                        <div className="mt-1 line-clamp-2 text-xs leading-5 text-muted-foreground">
                          {item.description}
                        </div>
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarContent>

          <SidebarFooter className="border-t border-white/8 p-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center gap-3 rounded-2xl border border-white/8 bg-white/5 px-3 py-3 text-left transition-all hover:border-white/14 hover:bg-white/8 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring group-data-[collapsible=icon]:justify-center">
                  <Avatar className="h-10 w-10 border border-white/12 shadow-[0_10px_30px_rgba(2,6,23,0.28)]">
                    <AvatarFallback className="bg-primary/15 text-sm font-semibold text-primary">
                      {user?.name?.charAt(0).toUpperCase() ?? "U"}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-foreground">{user?.name ?? "Workspace User"}</p>
                      {user?.role === "admin" ? (
                        <Badge className="rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] text-primary">
                          Admin
                        </Badge>
                      ) : null}
                    </div>
                    <p className="mt-1 truncate text-xs text-muted-foreground">{user?.email || "Authenticated member"}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground group-data-[collapsible=icon]:hidden" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 rounded-2xl border-white/10 bg-popover/95 backdrop-blur-xl">
                <DropdownMenuItem className="gap-2 rounded-xl">
                  <ShieldCheck className="h-4 w-4" />
                  <span>{user?.role === "admin" ? "Admin access active" : "User workspace active"}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout} className="gap-2 rounded-xl text-destructive focus:text-destructive">
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>
        <div
          className={`absolute right-0 top-0 h-full w-1 cursor-col-resize transition-colors hover:bg-primary/30 ${isCollapsed ? "hidden" : ""}`}
          onMouseDown={() => {
            if (!isCollapsed) {
              setIsResizing(true);
            }
          }}
          style={{ zIndex: 50 }}
        />
      </div>

      <SidebarInset className="relative bg-background">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,rgba(114,92,255,0.14),transparent_56%)]" />
        <div className="sticky top-0 z-40 border-b border-white/8 bg-background/82 backdrop-blur-2xl">
          <div className="flex items-start justify-between gap-4 px-4 py-4 md:px-8">
            <div className="flex min-w-0 items-start gap-3">
              {isMobile ? <SidebarTrigger className="mt-1 h-10 w-10 rounded-xl border border-white/10 bg-white/5" /> : null}
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.28em] text-white/35">{activeItem?.label ?? "Workspace"}</p>
                <h1 className="mt-1 text-balance text-xl font-semibold tracking-[-0.03em] text-foreground md:text-2xl">{title}</h1>
                <p className="mt-1 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
              </div>
            </div>
            <div className="hidden items-center gap-3 md:flex">
              <div className="rounded-full border border-white/8 bg-white/5 px-3 py-2 text-xs text-muted-foreground">
                <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_18px_rgba(52,211,153,0.85)]" />
                Unified workspace online
              </div>
              <Badge className="rounded-full border border-white/8 bg-white/5 px-3 py-2 text-[11px] uppercase tracking-[0.24em] text-white/72">
                {user?.role === "admin" ? "Admin session" : "Member session"}
              </Badge>
            </div>
          </div>
        </div>
        <main className="relative z-10 flex-1 px-4 py-6 md:px-8 md:py-8">{children}</main>
      </SidebarInset>
    </>
  );
}
