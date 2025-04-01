import { Navigate } from "react-router-dom";
import { useRoleAuth } from "@/hooks/useRoleAuth";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectPath?: string;
}

export const ProtectedRoute = ({
  children,
  allowedRoles,
  redirectPath = "/",
}: ProtectedRouteProps) => {
  const { currentUser, isLoading, checkUserAccess } = useRoleAuth();
  const { toast } = useToast();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isLoading && currentUser) {
      const access = checkUserAccess(allowedRoles);
      setHasAccess(access);
    }
  }, [isLoading, currentUser, checkUserAccess, allowedRoles]);

  useEffect(() => {
    if (!isLoading && !currentUser) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to access this page",
        variant: "destructive",
      });
    }
  }, [isLoading, currentUser, toast]);

  useEffect(() => {
    if (!isLoading && currentUser && hasAccess === false) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page",
        variant: "destructive",
      });
    }
  }, [isLoading, currentUser, hasAccess, toast]);

  if (isLoading || hasAccess === null) {
    return (
      <div className="flex justify-center items-center h-screen">
        Loading...
      </div>
    );
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (!hasAccess) {
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
};
