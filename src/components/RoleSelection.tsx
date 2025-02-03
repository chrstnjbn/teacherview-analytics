import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export const RoleSelection = () => {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto p-4">
      <Card className="p-6 hover:shadow-lg transition-shadow animate-fadeIn">
        <h2 className="text-2xl font-bold text-primary mb-4">For Students</h2>
        <p className="text-gray-600 mb-6">
          Provide valuable feedback to help improve teaching quality and learning experience.
        </p>
        <Button 
          className="w-full bg-secondary hover:bg-secondary/90"
          onClick={() => navigate("/student")}
        >
          Enter as Student
        </Button>
      </Card>

      <Card className="p-6 hover:shadow-lg transition-shadow animate-fadeIn">
        <h2 className="text-2xl font-bold text-primary mb-4">For Teachers</h2>
        <p className="text-gray-600 mb-6">
          Access your profile, view feedback, and track your professional development.
        </p>
        <Button 
          className="w-full"
          onClick={() => navigate("/teacher/login")}
        >
          Teacher Login
        </Button>
      </Card>
    </div>
  );
};