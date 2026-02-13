"use client";

interface PermissionCheckProps {
  role: string;
  allowedRoles: string[];
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export function PermissionCheck({
  role,
  allowedRoles,
  children,
  fallback = null,
}: PermissionCheckProps) {
  if (allowedRoles.length === 0 || allowedRoles.includes(role)) {
    return <>{children}</>;
  }
  return <>{fallback}</>;
}
