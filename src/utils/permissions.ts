import React from "react";
import { Persona } from "@/models/navlinks";

interface PermissionCheckProps {
  children: React.ReactNode;
  userRole: Persona | string;
  allowedRoles?: (Persona | string)[];
  fallback?: React.ReactNode;
}

export const RoleBasedRender = ({
  children,
  userRole,
  allowedRoles = [],
  fallback = null,
}: PermissionCheckProps) => {
  if (allowedRoles.length === 0) {
    return <>{children}</>;
  }

  const hasPerm = allowedRoles.includes(userRole);
  return hasPerm ? <>{children}</> : <>{fallback}</>;
};

export const hasPermission = (
  userRole: Persona | string,
  allowedRoles: (Persona | string)[]
): boolean => {
  if (allowedRoles.length === 0) return true;
  return allowedRoles.includes(userRole);
};
