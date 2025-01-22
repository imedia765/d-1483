import { ReactNode } from 'react';
import { useRoleAccess } from '@/hooks/useRoleAccess';
import type { Database } from "@/integrations/supabase/types";

type UserRole = Database['public']['Enums']['app_role'];

interface RoleBasedRendererProps {
  children: ReactNode;
  allowedRoles?: UserRole[];
  requireAllRoles?: boolean;
  fallback?: ReactNode;
}

const RoleBasedRenderer = ({
  children,
  allowedRoles = [],
  requireAllRoles = false,
  fallback = null
}: RoleBasedRendererProps) => {
  const { hasRole, hasAnyRole } = useRoleAccess();

  if (!allowedRoles.length) {
    console.log('[RoleRenderer] No roles required, rendering children');
    return <>{children}</>;
  }

  const hasAccess = requireAllRoles
    ? allowedRoles.every(role => hasRole(role))
    : hasAnyRole(allowedRoles);

  console.log('[RoleRenderer] Access check:', {
    allowedRoles,
    requireAllRoles,
    hasAccess,
    timestamp: new Date().toISOString()
  });

  return <>{hasAccess ? children : fallback}</>;
};

export default RoleBasedRenderer;