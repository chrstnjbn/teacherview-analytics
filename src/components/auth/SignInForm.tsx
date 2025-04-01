import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { auth, ROLES, COLLECTIONS, db } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useAuth } from "@/context/AuthContext";
import { doc, setDoc } from "firebase/firestore";
import { AuthHeader } from "./AuthHeader";
import { GoogleIcon } from "@/components/ui/icons";

interface SignInFormProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onGoogleSignIn: () => void;
  isAdminRoute?: boolean;
}

interface SignInFormData {
  email: string;
  password: string;
  collegeCode: string;
  staffId: string;
}

export const SignInForm = ({
  isLoading,
  setIsLoading,
  onGoogleSignIn,
  isAdminRoute = false,
}: SignInFormProps) => {
  const [signInData, setSignInData] = useState<SignInFormData>({
    email: "",
    password: "",
    collegeCode: "",
    staffId: "",
  });
  const [savedStaffCode, setSavedStaffCode] = useState("");
  const [savedStaffId, setSavedStaffId] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const { setUserRole } = useAuth();

  useEffect(() => {
    const storedStaffCode = localStorage.getItem("collegeStaffCode");
    if (storedStaffCode) {
      setSavedStaffCode(storedStaffCode);
    }

    const storedStaffId = localStorage.getItem("adminStaffId");
    if (storedStaffId) {
      setSavedStaffId(storedStaffId);
    }
  }, []);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const enteredCode = signInData.collegeCode.trim().toUpperCase();

      if (isAdminRoute && !signInData.staffId.trim()) {
        throw new Error("staff-id-required");
      }

      if (!savedStaffCode || enteredCode.startsWith(savedStaffCode)) {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          signInData.email,
          signInData.password
        );

        const role = isAdminRoute ? ROLES.ADMIN : ROLES.TEACHER;

        await setDoc(
          doc(db, COLLECTIONS.USERS, userCredential.user.uid),
          {
            email: userCredential.user.email,
            role: role,
            collegeCode: enteredCode,
            staffId: isAdminRoute ? signInData.staffId : "",
            updatedAt: new Date(),
          },
          { merge: true }
        );

        await setUserRole(role);

        const existingTeachersData = localStorage.getItem("allTeachers");
        const teachers = existingTeachersData
          ? JSON.parse(existingTeachersData)
          : [];
        let teacher = teachers.find(
          (t: any) => t.email === userCredential.user.email
        );

        if (!teacher) {
          teacher = {
            teacherId: isAdminRoute ? signInData.staffId : "",
            department: "",
            subjects: "",
            courses: "",
            researchPapers: "",
            displayName:
              userCredential.user.displayName || signInData.email.split("@")[0],
            email: userCredential.user.email,
            uid: userCredential.user.uid,
            collegeCode: enteredCode,
            role: role,
          };

          teachers.push(teacher);
          localStorage.setItem("allTeachers", JSON.stringify(teachers));
        } else {
          if (!teacher.collegeCode) {
            teacher.collegeCode = enteredCode;
          }

          if (isAdminRoute && !teacher.teacherId && signInData.staffId) {
            teacher.teacherId = signInData.staffId;
          }

          teacher.role = role;

          localStorage.setItem("allTeachers", JSON.stringify(teachers));
        }

        if (isAdminRoute && signInData.staffId.trim()) {
          localStorage.setItem("adminStaffId", signInData.staffId.trim());
        }

        localStorage.setItem("teacherProfile", JSON.stringify(teacher));
        localStorage.setItem(
          "user",
          JSON.stringify({
            uid: userCredential.user.uid,
            email: userCredential.user.email,
            displayName: teacher.displayName,
            collegeCode: enteredCode,
            staffId: isAdminRoute
              ? teacher.teacherId || signInData.staffId
              : "",
            role: role,
          })
        );

        if (teacher.teacherId) {
          navigate(isAdminRoute ? "/admin/dashboard" : "/teacher/dashboard");
        } else {
          navigate("/teacher/profile");
        }

        toast({
          title: "Success",
          description: "Signed in successfully",
        });
      } else {
        throw new Error("invalid-college-code");
      }
    } catch (error) {
      console.error("Sign In Error:", error);
      let errorMessage = "Invalid email or password. Please try again.";

      if (error instanceof Error) {
        if (error.message.includes("auth/user-not-found")) {
          errorMessage =
            "No account found with this email. Please sign up first.";
        } else if (error.message.includes("auth/wrong-password")) {
          errorMessage = "Incorrect password. Please try again.";
        } else if (error.message.includes("auth/invalid-email")) {
          errorMessage = "Invalid email format. Please check your email.";
        } else if (error.message === "invalid-college-code") {
          errorMessage = `Invalid college code. Must start with ${savedStaffCode}`;
        } else if (error.message === "staff-id-required") {
          errorMessage = "Staff ID is required for admin login.";
        }
      }

      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <AuthHeader
        title={isAdminRoute ? "Administrator Access" : "Faculty Portal"}
        subtitle={`Welcome back to ${
          savedStaffCode || "your institution"
        }'s portal`}
        isLoading={isLoading}
      />

      <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
        <div className="p-3 bg-blue-50 border border-blue-100 rounded-md">
          <p className="text-sm text-center text-blue-700">
            Sign in with your institutional email address
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          className="w-full h-11 font-medium relative"
          onClick={onGoogleSignIn}
          disabled={isLoading}
        >
          {!isLoading && <GoogleIcon />}
          <span className="mx-auto">
            {isLoading ? "Authenticating..." : "Sign in with Google"}
          </span>
        </Button>

        {isAdminRoute && (
          <p className="text-xs text-center text-muted-foreground">
            Administrator access requires additional verification
          </p>
        )}
      </div>
    </div>
  );
};
