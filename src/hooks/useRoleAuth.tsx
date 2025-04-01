
import { useState, useEffect, useCallback } from 'react';
import { auth, db, ROLES, COLLECTIONS } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export interface UserWithRole extends User {
  role?: string;
  collegeCode?: string;
  staffId?: string;
  name?: string;
}

interface UseRoleAuthReturn {
  currentUser: UserWithRole | null;
  isLoading: boolean;
  userRole: string | null;
  isAdmin: boolean;
  isTeacher: boolean;
  isStudent: boolean;
  setUserRole: (role: string) => Promise<void>;
  checkUserAccess: (allowedRoles: string[]) => boolean;
}

export const useRoleAuth = (): UseRoleAuthReturn => {
  const [currentUser, setCurrentUser] = useState<UserWithRole | null>(null);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const saveUserRole = useCallback(async (user: User, role: string): Promise<void> => {
    if (!user) return;

    try {
      const userRef = doc(db, COLLECTIONS.USERS, user.uid);
      await setDoc(userRef, {
        email: user.email,
        displayName: user.displayName,
        role: role,
        updatedAt: new Date()
      }, { merge: true });
    } catch (error) {
      console.error("Error saving user role:", error);
      toast({
        title: "Error",
        description: "Failed to save user role",
        variant: "destructive",
      });
    }
  }, [toast]);

  const setUserRoleFunction = async (role: string): Promise<void> => {
    if (!currentUser) return;
    
    try {
      await saveUserRole(currentUser, role);
      setUserRole(role);
      
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      userData.role = role;
      localStorage.setItem('user', JSON.stringify(userData));
      
      toast({
        title: "Success",
        description: `Role updated to ${role}`,
      });
    } catch (error) {
      console.error("Error setting user role:", error);
    }
  };

  const checkUserAccess = (allowedRoles: string[]): boolean => {
    if (isLoading) return false;
    if (!currentUser) return false;
    if (!userRole) return false;
    return allowedRoles.includes(userRole);
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          const userRef = doc(db, COLLECTIONS.USERS, user.uid);
          const userDoc = await getDoc(userRef);
          
          let role = null;
          if (userDoc.exists()) {
            role = userDoc.data().role;
          } else {
            const userData = JSON.parse(localStorage.getItem('user') || '{}');
            role = userData.role;
            
            if (role) {
              await saveUserRole(user, role);
            }
          }
          
          const userWithRole: UserWithRole = user;
          userWithRole.role = role;
          
          const userData = JSON.parse(localStorage.getItem('user') || '{}');
          userWithRole.collegeCode = userData.collegeCode;
          userWithRole.staffId = userData.staffId;
          
          setCurrentUser(userWithRole);
          setUserRole(role);
        } else {
          setCurrentUser(null);
          setUserRole(null);
        }
      } catch (error) {
        console.error("Error in auth state changed:", error);
      } finally {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [saveUserRole]);

  return {
    currentUser,
    isLoading,
    userRole,
    isAdmin: userRole === ROLES.ADMIN,
    isTeacher: userRole === ROLES.TEACHER,
    isStudent: userRole === ROLES.STUDENT,
    setUserRole: setUserRoleFunction,
    checkUserAccess,
  };
};
