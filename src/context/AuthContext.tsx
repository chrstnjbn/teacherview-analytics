
import { createContext, useContext, ReactNode } from 'react';
import { useRoleAuth, UserWithRole } from '@/hooks/useRoleAuth';

interface AuthContextType {
  currentUser: UserWithRole | null;
  isLoading: boolean;
  userRole: string | null;
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  setUserRole: (role: string) => Promise<void>;
  checkUserAccess: (allowedRoles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const auth = useRoleAuth();
  
  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
