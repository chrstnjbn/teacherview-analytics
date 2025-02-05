import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface TeacherInfo {
  displayName: string;
  department: string;
  subjects: string;
}

const StudentEntry = () => {
  const [name, setName] = useState("");
  const [teacherInfo, setTeacherInfo] = useState<TeacherInfo[]>([]);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Get teacher information from localStorage
    const storedTeacherInfo = localStorage.getItem('teacherProfile');
    if (storedTeacherInfo) {
      const teacherData = JSON.parse(storedTeacherInfo);
      setTeacherInfo([teacherData]);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      sessionStorage.setItem("studentName", name.trim());
      toast({
        title: "Welcome!",
        description: "You can now provide feedback.",
      });
      navigate("/student/feedback");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        <Card className="p-6">
          <h1 className="text-2xl font-bold text-center mb-6">Welcome Student!</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full"
              />
            </div>
            <Button type="submit" className="w-full">
              Continue
            </Button>
          </form>
        </Card>

        {teacherInfo.length > 0 && (
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Available Teachers</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Department</TableHead>
                  <TableHead>Subjects</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teacherInfo.map((teacher, index) => (
                  <TableRow key={index}>
                    <TableCell>{teacher.displayName}</TableCell>
                    <TableCell>{teacher.department}</TableCell>
                    <TableCell>{teacher.subjects}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StudentEntry;