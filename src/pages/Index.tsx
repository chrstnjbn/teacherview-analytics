import { RoleSelection } from "@/components/RoleSelection";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">PerformEdge</h1>
          <p className="text-xl text-gray-600">
            Empowering Educational Excellence Through Data-Driven Insights
          </p>
        </div>

        <RoleSelection />
      </div>
    </div>
  );
};

export default Index;