import type React from "react";
import { useEffect, useState } from "react";
import Chart from "chart.js/auto";

interface NavItem {
  icon: string;
  label: string;
  href: string;
}

const AdminDashboard: React.FC = () => {
  const [activeNav, setActiveNav] = useState("dashboard");
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    initCharts();
  }, []);

  const initCharts = () => {
    const performanceCtx = document.getElementById(
      "performanceChart"
    ) as HTMLCanvasElement;
    const ratingCtx = document.getElementById(
      "ratingChart"
    ) as HTMLCanvasElement;

    if (performanceCtx && ratingCtx) {
      new Chart(performanceCtx, {
        type: "line",
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          datasets: [
            {
              label: "Computer Science",
              data: [3.8, 4.0, 4.2, 4.3, 4.5, 4.4],
              borderColor: "#4f46e5",
              backgroundColor: "rgba(79, 70, 229, 0.1)",
              tension: 0.3,
              fill: true,
            },
            {
              label: "Mathematics",
              data: [3.5, 3.7, 3.9, 4.0, 4.1, 4.0],
              borderColor: "#f97316",
              backgroundColor: "rgba(249, 115, 22, 0.1)",
              tension: 0.3,
              fill: true,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
            },
          },
        },
      });

      new Chart(ratingCtx, {
        type: "doughnut",
        data: {
          labels: ["5 Stars", "4 Stars", "3 Stars", "2 Stars", "1 Star"],
          datasets: [
            {
              data: [45, 30, 15, 7, 3],
              backgroundColor: [
                "#10b981",
                "#4f46e5",
                "#f59e0b",
                "#f97316",
                "#ef4444",
              ],
              borderWidth: 0,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "right",
            },
          },
          cutout: "70%",
        },
      });
    }
  };

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    label: string
  ) => {
    e.preventDefault();
    setActiveNav(label.toLowerCase());
  };

  const renderNavItem = ({ icon, label, href }: NavItem) => (
    <a
      key={label}
      href={href}
      onClick={(e) => handleNavClick(e, label)}
      className={`flex items-center px-4 py-3 text-gray-700 rounded-lg mb-2 transition-colors ${
        activeNav === label.toLowerCase() ? "bg-gray-100" : "hover:bg-gray-100"
      }`}
      aria-label={label}
    >
      <i className={`${icon} w-5`} />
      <span className="ml-3">{label}</span>
    </a>
  );

  const navItems: NavItem[] = [
    { icon: "fas fa-home", label: "Dashboard", href: "#" },
    { icon: "fas fa-chart-line", label: "Analytics", href: "#" },
    { icon: "fas fa-users", label: "Students", href: "#" },
    { icon: "fas fa-chalkboard-teacher", label: "Faculty", href: "#" },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-100">
      <button
        type="button"
        className="md:hidden fixed top-4 left-4 z-20 p-3 rounded-lg bg-white shadow-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-all duration-200"
        onClick={() => setSidebarOpen(!isSidebarOpen)}
      >
        <div className="w-6 h-5 relative flex flex-col justify-between">
          <span
            className={`w-full h-0.5 bg-gray-600 rounded-full transform transition-all duration-300 ${
              isSidebarOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`w-full h-0.5 bg-gray-600 rounded-full transition-all duration-300 ${
              isSidebarOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`w-full h-0.5 bg-gray-600 rounded-full transform transition-all duration-300 ${
              isSidebarOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </div>
      </button>

      <div
        className={`
        fixed md:static inset-y-0 left-0 transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }
        md:translate-x-0 transition-transform duration-300 ease-in-out
        w-64 bg-white shadow-xl z-10
      `}
      >
        <div className="flex items-center p-6 border-b">
          <img
            className="w-12 h-12 rounded-full"
            src="https://ui-avatars.com/api/?name=Christina&background=4f46e5&color=fff"
            alt="User"
          />
          <div className="ml-4">
            <h3 className="font-semibold text-gray-800">Christina</h3>
            <p className="text-sm text-gray-600">Administrator</p>
          </div>
        </div>
        <nav className="p-4">
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-4">
            Main
          </div>
          {navItems.slice(0, 2).map(renderNavItem)}
          <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-4 mt-6">
            Management
          </div>
          {navItems.slice(2).map(renderNavItem)}
        </nav>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="sticky top-0 bg-white border-b px-4 md:px-8 py-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0">
            <div className="relative w-full md:w-64">
              <i className="fas fa-search absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                className="w-full pl-10 pr-4 py-2 rounded-lg border focus:outline-none focus:border-indigo-500"
                placeholder="Search..."
              />
            </div>
            <div className="flex items-center justify-between md:space-x-4">
              <div className="relative">
                <i className="fas fa-bell text-gray-600" />
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  3
                </span>
              </div>
              <div className="flex items-center">
                <img
                  className="w-10 h-10 rounded-full"
                  src="https://ui-avatars.com/api/?name=Christina&background=4f46e5&color=fff"
                  alt="User"
                />
                <div className="ml-3">
                  <div className="text-sm font-semibold text-gray-800">
                    Christina
                  </div>
                  <div className="text-xs text-gray-600">Administrator</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 md:p-8">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center space-y-4 md:space-y-0 mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Dashboard Overview
              </h1>
              <p className="text-gray-600">
                Welcome back, Christina! Here's what's happening today.
              </p>
            </div>
            <button
              type="button"
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Generate Report
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-gray-600 text-sm font-medium">
                  Total Students
                </h3>
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <i className="fas fa-users text-indigo-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-2">1,248</div>
              <div className="flex items-center text-green-500 text-sm">
                <i className="fas fa-arrow-up mr-1" />
                12% from last month
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-gray-600 text-sm font-medium">
                  Faculty Members
                </h3>
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <i className="fas fa-chalkboard-teacher text-indigo-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-2">86</div>
              <div className="flex items-center text-green-500 text-sm">
                <i className="fas fa-arrow-up mr-1" /> 4 new additions
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-gray-600 text-sm font-medium">
                  Average Rating
                </h3>
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <i className="fas fa-star text-indigo-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-2">4.2</div>
              <div className="flex items-center text-green-500 text-sm">
                <i className="fas fa-arrow-up mr-1" /> 0.3 increase
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-gray-600 text-sm font-medium">
                  Departments
                </h3>
                <div className="bg-indigo-100 p-2 rounded-lg">
                  <i className="fas fa-building text-indigo-600" />
                </div>
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-2">12</div>
              <div className="flex items-center text-gray-500 text-sm">
                <i className="fas fa-minus mr-1" /> No change
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-8">
            <div className="bg-white rounded-lg shadow p-4 md:p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Faculty Performance Trend
                </h3>
                <select className="border rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500">
                  <option>Last 6 Months</option>
                  <option>Last Year</option>
                  <option>All Time</option>
                </select>
              </div>
              <div className="h-80">
                <canvas id="performanceChart" />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-4 md:p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Rating Distribution
                </h3>
                <select className="border rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500">
                  <option>Current Term</option>
                  <option>Last Term</option>
                </select>
              </div>
              <div className="h-80">
                <canvas id="ratingChart" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Recent Activity
                </h3>
                <a
                  href="#"
                  className="text-indigo-600 hover:text-indigo-700 text-sm"
                >
                  View All
                </a>
              </div>
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="bg-indigo-100 p-3 rounded-lg">
                    <i className="fas fa-comment text-indigo-600" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-semibold text-gray-800">
                      New Faculty Reviews
                    </h4>
                    <p className="text-sm text-gray-600">
                      Dr. Smith received 5 new student reviews
                    </p>
                    <span className="text-xs text-gray-500">2 hours ago</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-red-100 p-3 rounded-lg">
                    <i className="fas fa-exclamation-triangle text-red-600" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-semibold text-gray-800">
                      Performance Alert
                    </h4>
                    <p className="text-sm text-gray-600">
                      CS101 course ratings below threshold
                    </p>
                    <span className="text-xs text-gray-500">5 hours ago</span>
                  </div>
                </div>
                <div className="flex items-center">
                  <div className="bg-yellow-100 p-3 rounded-lg">
                    <i className="fas fa-file-alt text-yellow-600" />
                  </div>
                  <div className="ml-4">
                    <h4 className="text-sm font-semibold text-gray-800">
                      Monthly Report Generated
                    </h4>
                    <p className="text-sm text-gray-600">
                      May 2023 performance report is ready
                    </p>
                    <span className="text-xs text-gray-500">1 day ago</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Quick Actions
                </h3>
              </div>
              <div className="space-y-4">
                <button
                  type="button"
                  className="flex items-center justify-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <i className="fas fa-user-plus mr-2" />
                  <span>Add Faculty</span>
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <i className="fas fa-file-export mr-2" aria-hidden="true" />
                  <span>Export Data</span>
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <i className="fas fa-cog mr-2" aria-hidden="true" />
                  <span>Settings</span>
                </button>
                <button
                  type="button"
                  className="flex items-center justify-center bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  <i
                    className="fas fa-question-circle mr-2"
                    aria-hidden="true"
                  />
                  <span>Help</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
