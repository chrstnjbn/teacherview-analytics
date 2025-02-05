import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import StudentEntry from "./pages/StudentEntry";
import TeacherAuth from "./pages/TeacherAuth";
import TeacherProfileForm from "./pages/TeacherProfileForm";
import StudentFeedback from "./pages/StudentFeedback";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <div className="min-h-screen font-sans">
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/student" element={<StudentEntry />} />
            <Route path="/student/feedback" element={<StudentFeedback />} />
            <Route path="/teacher/login" element={<TeacherAuth />} />
            <Route path="/teacher/profile" element={<TeacherProfileForm />} />
            <Route path="/admin/login" element={<TeacherAuth />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </div>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;