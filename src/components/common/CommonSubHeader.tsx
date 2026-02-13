"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface CommonSubHeaderProps {
  userName: string;
  role: "creator" | "editor";
  variant?: "default" | "compact";
  className?: string;
}

export function CommonSubHeader({
  userName,
  role,
  variant = "default",
  className,
}: CommonSubHeaderProps) {
  if (variant === "compact") {
    return (
      <div className={cn("flex items-center gap-3 py-3", className)}>
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">
            {userName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="text-sm font-medium">{userName}</p>
          <Badge variant="secondary" className="text-xs px-2 py-0 h-5">
            {role}
          </Badge>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex items-center justify-between py-4", className)}>
      <div className="flex items-center gap-4">
        <Avatar className="h-12 w-12">
          <AvatarFallback className="text-lg">
            {userName.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h1 className="text-2xl font-bold">{userName}</h1>
          <Badge variant="secondary" className="mt-1">
            {role}
          </Badge>
        </div>
      </div>
    </div>
  );
}
