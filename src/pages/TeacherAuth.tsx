import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { auth, googleProvider, ROLES, db } from "@/lib/firebase";
import { signInWithPopup } from "firebase/auth";
import { getDoc, doc } from "firebase/firestore";
import { SignInForm } from "@/components/auth/SignInForm";
import { SignUpForm } from "@/components/auth/SignUpForm";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";

const TeacherAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [collegeCode, setCollegeCode] = useState("");
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminRoute = location.pathname.includes("/admin");
  const { setUserRole } = useAuth();

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      const result = await signInWithPopup(auth, googleProvider);

      const role = isAdminRoute ? ROLES.ADMIN : ROLES.TEACHER;

      if (setUserRole) {
        setUserRole(role);
      }

      const userDocRef = doc(db, "users", result.user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (!userDocSnap.exists() || userDocSnap.data().role !== role) {
        navigate(isAdminRoute ? "/admin/login" : "/teacher/login");
        toast({
          title: "Account Not Found",
          description: "Please sign up to create an account.",
          variant: "destructive",
        });
        return;
      }
      navigate(isAdminRoute ? "/admin/dashboard" : "/teacher/dashboard");
      toast({
        title: `Welcome back${
          result.user.displayName ? ` ${result.user.displayName}` : ""
        }!`,
        description: "Successfully signed in.",
      });
    } catch (error) {
      console.error("Google Sign In Error:", error);
      let errorMessage = "Failed to sign in with Google. Please try again.";

      if (error instanceof Error) {
        if (error.message.includes("popup-closed-by-user")) {
          errorMessage = "Sign-in cancelled. Please try again.";
        } else if (error.message.includes("auth/network-request-failed")) {
          errorMessage =
            "Network error. Please check your internet connection.";
        } else if (error.message.includes("auth/popup-blocked")) {
          errorMessage =
            "Popup was blocked. Please allow popups for this site.";
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

  const handleVerifyCollegeCodes = () => {
    if (collegeCode.trim().length < 3) {
      toast({
        title: "Invalid College Code",
        description: "College code must be at least 3 characters.",
        variant: "destructive",
      });
      return;
    }

    const codePrefix = collegeCode.trim().substring(0, 3).toUpperCase();

    setIsVerified(true);
    toast({
      title: "Success",
      description: "College code verified. You can now proceed with login.",
    });
  };

  if (!isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
        <div className="max-w-md mx-auto">
          <Card className="p-6">
            <h1 className="text-2xl font-bold text-center mb-6">
              {isAdminRoute ? "Admin Verification" : "Teacher Verification"}
            </h1>
            <p className="text-gray-600 mb-6 text-center">
              Please enter the college code to proceed.
            </p>

            <div className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="collegeCode">College Code </Label>
                <Input
                  id="collegeCode"
                  placeholder="Enter college code"
                  value={collegeCode}
                  onChange={(e) => setCollegeCode(e.target.value.slice(0, 10))}
                  maxLength={10}
                  className="uppercase"
                />
              </div>

              <Button
                onClick={handleVerifyCollegeCodes}
                className="w-full"
                disabled={isLoading}
              >
                Verify & Continue
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-md mx-auto">
        <Card className="p-6">
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <SignInForm
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                onGoogleSignIn={handleGoogleSignIn}
                isAdminRoute={isAdminRoute}
              />
            </TabsContent>

            <TabsContent value="signup">
              <SignUpForm
                isLoading={isLoading}
                setIsLoading={setIsLoading}
                onGoogleSignIn={handleGoogleSignIn}
                isAdminRoute={isAdminRoute}
              />
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default TeacherAuth;
