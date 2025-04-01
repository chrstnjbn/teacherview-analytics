import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ROLES } from "@/lib/firebase";
import { Toaster as ReactHotToast } from "react-hot-toast";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import StudentEntry from "./pages/StudentEntry";
import TeacherAuth from "./pages/TeacherAuth";
import TeacherProfileForm from "./pages/TeacherProfileForm";
import StudentFeedback from "./pages/StudentFeedback";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminDashboard from "./pages/AdminDashboard";

const queryClient = new QueryClient();

const App = () => (
  <AuthProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <div className="min-h-screen font-sans">
            <ReactHotToast position="center" />
            <Toaster />
            <Sonner />
            <Routes>
              <Route path="/" element={<Index />} />

              {/* Student routes */}
              <Route path="/student" element={<StudentEntry />} />
              <Route
                path="/student/feedback"
                element={
                  <ProtectedRoute
                    allowedRoles={[ROLES.STUDENT]}
                    redirectPath="/student"
                  >
                    <StudentFeedback />
                  </ProtectedRoute>
                }
              />

              {/* Teacher routes */}
              <Route path="/teacher/login" element={<TeacherAuth />} />
              <Route
                path="/teacher/profile"
                element={
                  <ProtectedRoute
                    allowedRoles={[ROLES.TEACHER]}
                    redirectPath="/teacher/login"
                  >
                    <TeacherProfileForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/teacher/dashboard"
                element={
                  <ProtectedRoute
                    allowedRoles={[ROLES.TEACHER]}
                    redirectPath="/teacher/login"
                  >
                    <TeacherDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Admin routes */}
              <Route path="/admin/login" element={<TeacherAuth />} />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute
                    allowedRoles={[ROLES.ADMIN]}
                    redirectPath="/admin/login"
                  >
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />

              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  </AuthProvider>
);

export default App;
