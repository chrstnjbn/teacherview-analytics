
import { Navigate } from 'react-router-dom';
import { useRoleAuth } from '@/hooks/useRoleAuth';
import { useToast } from '@/hooks/use-toast';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: string[];
  redirectPath?: string;
}

export const ProtectedRoute = ({ 
  children, 
  allowedRoles, 
  redirectPath = '/' 
}: ProtectedRouteProps) => {
  const { currentUser, isLoading, checkUserAccess } = useRoleAuth();
  const { toast } = useToast();
  
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen">Loading...</div>;
  }
  
  // Not logged in
  if (!currentUser) {
    toast({
      title: "Authentication Required",
      description: "Please sign in to access this page",
      variant: "destructive",
    });
    return <Navigate to="/login" replace />;
  }
  
  // Check if user has permission
  if (!checkUserAccess(allowedRoles)) {
    toast({
      title: "Access Denied",
      description: "You don't have permission to access this page",
      variant: "destructive",
    });
    return <Navigate to={redirectPath} replace />;
  }
  
  return <>{children}</>;
};
