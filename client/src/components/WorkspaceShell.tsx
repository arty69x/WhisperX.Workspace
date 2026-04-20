import DashboardLayout from "@/components/DashboardLayout";
import { Badge } from "@/components/ui/badge";
import { platformNavigation } from "@/lib/platform";
import type { ReactNode } from "react";


type WorkspaceShellProps = {
  title: string;
  description: string;
  eyebrow?: string;
  actions?: ReactNode;
  children: ReactNode;
};

export default function WorkspaceShell({
  title,
  description,
  eyebrow = "Unified workspace",
  actions,
  children,
}: WorkspaceShellProps) {
  return (
    <DashboardLayout title={title} description={description} navigation={platformNavigation}>
      <div className="mx-auto flex w-full max-w-[1500px] flex-col gap-6">
        <section className="surface-outline rounded-[2rem] p-5 md:p-7">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl space-y-4">
              <Badge className="rounded-full border border-white/10 bg-white/6 px-4 py-1 text-[11px] uppercase tracking-[0.28em] text-white/70 shadow-[0_0_0_1px_rgba(255,255,255,0.03)]">
                {eyebrow}
              </Badge>
              <div>
                <h2 className="text-balance text-3xl font-semibold tracking-[-0.05em] text-white md:text-4xl xl:text-[2.75rem]">
                  {title}
                </h2>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-muted-foreground md:text-base md:leading-8">
                  {description}
                </p>
              </div>
            </div>
            {actions ? (
              <div className="flex flex-wrap items-center gap-3 rounded-[1.5rem] border border-white/10 bg-black/18 p-2 backdrop-blur-xl">
                {actions}
              </div>
            ) : null}
          </div>
        </section>
        <div className="space-y-6">{children}</div>
      </div>
    </DashboardLayout>
  );
}
