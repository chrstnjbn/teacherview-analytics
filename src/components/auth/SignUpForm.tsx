import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { auth } from "@/lib/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { AuthHeader } from "./AuthHeader";
import { GoogleIcon } from "@/components/ui/icons";

interface SignUpFormProps {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  onGoogleSignIn: () => void;
  isAdminRoute?: boolean;
}

interface SignUpFormData {
  firstName: string;
  lastName: string;
  email: string;
  mobile: string;
  password: string;
  confirmPassword: string;
  collegeCode: string;
  staffId: string;
}

export const SignUpForm = ({
  isLoading,
  setIsLoading,
  onGoogleSignIn,
  isAdminRoute = false,
}: SignUpFormProps) => {
  const [formData, setFormData] = useState<SignUpFormData>({
    firstName: "",
    lastName: "",
    email: "",
    mobile: "",
    password: "",
    confirmPassword: "",
    collegeCode: "",
    staffId: "",
  });
  const [savedStaffCode, setSavedStaffCode] = useState("");
  const [savedStaffId, setSavedStaffId] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();

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


  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (formData.password !== formData.confirmPassword) {
        throw new Error("Passwords do not match");
      }

      if (isAdminRoute && !formData.staffId.trim()) {
        throw new Error("staff-id-required");
      }

      const enteredCode = formData.collegeCode.trim().toUpperCase();

      if (!savedStaffCode || enteredCode.startsWith(savedStaffCode)) {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );

        const profileData = {
          teacherId: isAdminRoute ? formData.staffId : "",
          department: "",
          subjects: "",
          courses: "",
          researchPapers: "",
          displayName: `${formData.firstName} ${formData.lastName}`,
          email: formData.email,
          mobile: formData.mobile,
          uid: userCredential.user.uid,
          collegeCode: enteredCode,
        };

        const userData = {
          uid: userCredential.user.uid,
          email: userCredential.user.email,
          displayName: `${formData.firstName} ${formData.lastName}`,
          collegeCode: enteredCode,
          staffId: isAdminRoute ? formData.staffId : "",
        };

        if (isAdminRoute && formData.staffId.trim()) {
          localStorage.setItem("adminStaffId", formData.staffId.trim());
        }

        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("teacherProfile", JSON.stringify(profileData));

        const existingTeachersData = localStorage.getItem("allTeachers");
        const teachers = existingTeachersData
          ? JSON.parse(existingTeachersData)
          : [];
        teachers.push(profileData);
        localStorage.setItem("allTeachers", JSON.stringify(teachers));

        toast({
          title: "Success",
          description:
            "Account created successfully. Please complete your profile.",
        });

        navigate(isAdminRoute ? "/admin/dashboard" : "/teacher/profile");
      } else {
        throw new Error("invalid-college-code");
      }
    } catch (error) {
      console.error("Sign Up Error:", error);
      let errorMessage = "Failed to create account. Please try again.";

      if (error instanceof Error) {
        if (error.message.includes("auth/email-already-in-use")) {
          errorMessage =
            "Email is already registered. Please use a different email.";
        } else if (error.message === "Passwords do not match") {
          errorMessage = error.message;
        } else if (error.message === "invalid-college-code") {
          errorMessage = `Invalid college code. Must start with ${savedStaffCode}`;
        } else if (error.message === "staff-id-required") {
          errorMessage = "Staff ID is required for admin registration.";
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
        title={
          isAdminRoute ? "Administrator Registration" : "Faculty Registration"
        }
        subtitle="Join your institution's academic portal"
        isLoading={isLoading}
      />

      <div className="bg-white p-6 rounded-lg border shadow-sm space-y-4">
        <div className="p-3 bg-blue-50 border border-blue-100 rounded-md">
          <p className="text-sm text-center text-blue-700">
            Register using your institutional email address
          </p>
        </div>

        <Button
          variant="outline"
          className="w-full h-11 font-medium relative"
          onClick={onGoogleSignIn}
          disabled={isLoading}
          type="button"
        >
          {!isLoading && <GoogleIcon />}
          <span className="mx-auto">
            {isLoading ? "Setting up account..." : "Register with Google"}
          </span>
        </Button>

        <div className="text-xs text-center space-y-1 text-muted-foreground">
          <p>Only institutional email addresses are allowed</p>
          {isAdminRoute && (
            <p className="font-medium">
              Administrative access requires approval
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
