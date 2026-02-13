import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface FutureFeatureProps {
  children: ReactNode;
  className?: string;
}

export function FutureFeature({ children, className }: FutureFeatureProps) {
  return (
    <div className={cn("relative", className)}>
      {children}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-xs flex items-center justify-center border-2 border-dashed border-muted-foreground/50 rounded-lg">
        <div className="text-foreground/80 font-medium text-lg tracking-widest">
          FUTURE FEATURE
        </div>
        <svg
          className="absolute inset-0 w-full h-full pointer-events-none"
          viewBox="0 0 200 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M20 20 L180 20 M20 80 L180 80 M20 20 L20 80 M180 20 L180 80"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="3,3"
            className="text-muted-foreground/30"
          />
          <path
            d="M20 20 L180 80 M20 80 L180 20"
            stroke="currentColor"
            strokeWidth="1"
            strokeDasharray="3,3"
            className="text-muted-foreground/30"
          />
        </svg>
      </div>
    </div>
  );
}