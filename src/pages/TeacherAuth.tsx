import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

const TeacherAuth = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSignIn = (e: React.FormEvent, role: 'teacher' | 'admin') => {
    e.preventDefault();
    setIsLoading(true);
    toast({
      title: "Coming Soon",
      description: `${role === 'admin' ? 'Administrator' : 'Teacher'} sign in functionality will be implemented soon.`,
    });
    setIsLoading(false);
  };

  const handleSignUp = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    toast({
      title: "Coming Soon",
      description: "Sign up functionality will be implemented soon.",
    });
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-md mx-auto">
        <Card className="p-6">
          <Tabs defaultValue="teacher" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="teacher">Teacher</TabsTrigger>
              <TabsTrigger value="admin">Administrator</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            
            <TabsContent value="teacher">
              <form onSubmit={(e) => handleSignIn(e, 'teacher')} className="space-y-4">
                <Input type="email" placeholder="Email" required />
                <Input type="password" placeholder="Password" required />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  Sign In as Teacher
                </Button>
                <div className="text-center">
                  <Button variant="outline" className="w-full mt-2">
                    Continue with Google
                  </Button>
                </div>
              </form>
            </TabsContent>

            <TabsContent value="admin">
              <form onSubmit={(e) => handleSignIn(e, 'admin')} className="space-y-4">
                <Input type="email" placeholder="Admin Email" required />
                <Input type="password" placeholder="Admin Password" required />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  Sign In as Administrator
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <Input placeholder="First Name" required />
                <Input placeholder="Last Name" required />
                <Input type="email" placeholder="Email" required />
                <Input type="tel" placeholder="Mobile Number" required />
                <Input type="password" placeholder="Password" required />
                <Input type="password" placeholder="Confirm Password" required />
                <Button type="submit" className="w-full" disabled={isLoading}>
                  Sign Up
                </Button>
                <div className="text-center">
                  <Button variant="outline" className="w-full mt-2">
                    Sign up with Google
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default TeacherAuth;