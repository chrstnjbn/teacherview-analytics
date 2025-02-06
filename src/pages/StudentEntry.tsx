import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";

const StudentEntry = () => {
  const [name, setName] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      sessionStorage.setItem("studentName", name.trim());
      toast({
        title: "Success",
        description: "Welcome! You can now provide feedback.",
      });
      navigate("/student/feedback");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card className="p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Student Entry</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Continue
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default StudentEntry;