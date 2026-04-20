import { useTheme } from "@/contexts/ThemeContext";
import type { CSSProperties } from "react";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      richColors
      toastOptions={{
        classNames: {
          toast:
            "border border-white/10 bg-popover/95 text-popover-foreground shadow-[0_24px_80px_rgba(2,6,23,0.34)] backdrop-blur-2xl",
          title: "text-sm font-medium text-foreground",
          description: "text-sm text-muted-foreground",
          actionButton: "bg-primary text-primary-foreground",
          cancelButton: "bg-white/8 text-white",
        },
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--success-bg": "color-mix(in oklab, var(--popover) 82%, #10b981 18%)",
          "--success-text": "var(--popover-foreground)",
          "--success-border": "color-mix(in oklab, var(--border) 62%, #10b981 38%)",
          "--error-bg": "color-mix(in oklab, var(--popover) 82%, #ef4444 18%)",
          "--error-text": "var(--popover-foreground)",
          "--error-border": "color-mix(in oklab, var(--border) 62%, #ef4444 38%)",
        } as CSSProperties
      }
      {...props}
    />
  );
};

export { Toaster };
