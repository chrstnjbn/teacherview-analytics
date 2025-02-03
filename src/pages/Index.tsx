import { RoleSelection } from "@/components/RoleSelection";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100">
      <div className="container py-12">
        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-4xl font-bold text-primary mb-4">
            Performance Management System
          </h1>
          <p className="text-xl text-gray-600">
            Welcome! Please select your role to continue.
          </p>
        </div>
        <RoleSelection />
      </div>
    </div>
  );
};

export default Index;