import React from "react";
import { Persona } from "~/models/persona";

interface PermissionCheckProps {
  children: React.ReactNode;
  role: Persona | string;
  allowedRoles?: (Persona | string)[];
  currentUserRole?: Persona | string;
  fallback?: React.ReactNode;
}

export const PermissionCheck = ({
  children,
  role,
  allowedRoles = [],
  currentUserRole,
  fallback = null,
}: PermissionCheckProps) => {
  if (allowedRoles.length === 0) {
    return <>{children}</>;
  }

  const userRole = currentUserRole || role;
  const hasPermission = allowedRoles.includes(userRole);

  return hasPermission ? <>{children}</> : <>{fallback}</>;
};

export const RoleBasedRender = ({
  children,
  role,
  allowedRoles = [],
  fallback = null,
}: Omit<PermissionCheckProps, "currentUserRole">) => {
  if (allowedRoles.length === 0) {
    return <>{children}</>;
  }

  const hasPermission = allowedRoles.includes(role);
  return hasPermission ? <>{children}</> : <>{fallback}</>;
};

export const hasPermission = (
  userRole: Persona | string,
  allowedRoles: (Persona | string)[]
): boolean => {
  if (allowedRoles.length === 0) return true;
  return allowedRoles.includes(userRole);
};
