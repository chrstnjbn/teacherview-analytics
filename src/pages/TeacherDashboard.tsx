import React, { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

const TeacherDashboard: React.FC = () => {
  const performanceChartRef = useRef<HTMLCanvasElement>(null);
  const ratingChartRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    initCharts();
  }, []);

  const initCharts = () => {
    if (performanceChartRef.current && ratingChartRef.current) {
      new Chart(performanceChartRef.current, {
        type: "line",
        data: {
          labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
          datasets: [
            {
              label: "My Performance",
              data: [4.2, 4.3, 4.4, 4.5, 4.5, 4.6],
              borderColor: "#4f46e5",
              backgroundColor: "rgba(79, 70, 229, 0.1)",
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
              display: false,
            },
          },
        },
      });

      new Chart(ratingChartRef.current, {
        type: "doughnut",
        data: {
          labels: ["5 Stars", "4 Stars", "3 Stars", "2 Stars", "1 Star"],
          datasets: [
            {
              data: [50, 30, 15, 4, 1],
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

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between py-2 sm:py-4 md:h-16 md:py-0">
            <div className="flex items-center w-full md:w-auto mb-2 md:mb-0">
              <div className="relative w-full md:w-64">
                <input
                  type="text"
                  placeholder="Search reviews..."
                  className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
                <svg
                  className="h-5 w-5 text-gray-400 absolute left-3 top-3"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="flex items-center justify-between md:justify-end">
              <div className="relative mr-4">
                <svg
                  className="h-6 w-6 text-gray-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.5V11a6 6 0 10-12 0v3.5c0 .538-.214 1.055-.595 1.405L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                  />
                </svg>
                <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                  2
                </span>
              </div>
              <div className="flex items-center">
                <img
                  className="w-10 h-10 rounded-full"
                  src="https://ui-avatars.com/api/?name=Priya+Kumar&background=ec4899&color=fff"
                  alt="Teacher"
                />
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">
                    Dr. Priya Kumar
                  </div>
                  <div className="text-xs text-gray-500">Professor</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-2 sm:py-4 md:py-8">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-4 md:mb-8">
          <div className="mb-4 md:mb-0">
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">
              My Teaching Dashboard
            </h1>
            <p className="text-sm md:text-base text-gray-600">
              Track your performance and student feedback
            </p>
          </div>
          <button className="w-full md:w-auto bg-pink-600 text-white px-4 py-2 rounded-lg hover:bg-pink-700 transition-colors">
            <svg
              className="h-5 w-5 inline-block mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Download Reports
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-600 text-sm font-medium">My Rating</h3>
              <div className="bg-pink-100 p-2 rounded-lg">
                <svg
                  className="h-5 w-5 text-pink-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.036 6.29a1 1 0 00.95.69h6.6c.969 0 1.371 1.24.588 1.81l-5.347 3.89a1 1 0 00-.364 1.118l2.036 6.29c.3.921-.755 1.688-1.54 1.118l-5.347-3.89a1 1 0 00-1.176 0l-5.347 3.89c-.784.57-1.838-.197-1.54-1.118l2.036-6.29a1 1 0 00-.364-1.118L2.414 11.717c-.783-.57-.381-1.81.588-1.81h6.6a1 1 0 00.95-.69l2.036-6.29z"
                  />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">4.5</div>
            <div className="flex items-center text-green-500 text-sm">
              <svg
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
              0.2 from last term
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-600 text-sm font-medium">
                Total Reviews
              </h3>
              <div className="bg-blue-100 p-2 rounded-lg">
                <svg
                  className="h-5 w-5 text-blue-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 8h2a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V10a2 2 0 012-2h2m4-4h4m-4 0a2 2 0 00-2 2v4a2 2 0 002 2h4a2 2 0 002-2V6a2 2 0 00-2-2m-4 0h4"
                  />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">128</div>
            <div className="flex items-center text-green-500 text-sm">
              <svg
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
              15 new this week
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-600 text-sm font-medium">
                Response Rate
              </h3>
              <div className="bg-green-100 p-2 rounded-lg">
                <svg
                  className="h-5 w-5 text-green-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h11M9 21V3m-6 6l6-6m0 0l6 6m-6-6v18"
                  />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">92%</div>
            <div className="flex items-center text-green-500 text-sm">
              <svg
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 15l7-7 7 7"
                />
              </svg>
              5% from last month
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-600 text-sm font-medium">
                Active Courses
              </h3>
              <div className="bg-yellow-100 p-2 rounded-lg">
                <svg
                  className="h-5 w-5 text-yellow-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-bold text-gray-900 mb-2">4</div>
            <div className="flex items-center text-gray-500 text-sm">
              <svg
                className="h-5 w-5 mr-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
              Same as last term
            </div>
          </div>
        </div>

        <div className="mt-4 sm:mt-6 md:mt-8 grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <h3 className="text-gray-600 text-sm font-medium mb-2 sm:mb-0">
                Performance Trend
              </h3>
              <select className="w-full sm:w-auto text-sm border rounded-lg px-2 py-1">
                <option>Last 6 Months</option>
                <option>Last Year</option>
                <option>All Time</option>
              </select>
            </div>
            <div className="relative h-40 sm:h-48 md:h-64">
              <canvas ref={performanceChartRef}></canvas>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
              <h3 className="text-gray-600 text-sm font-medium mb-2 sm:mb-0">
                My Rating Distribution
              </h3>
              <select className="w-full sm:w-auto text-sm border rounded-lg px-2 py-1">
                <option>Current Term</option>
                <option>Last Term</option>
              </select>
            </div>
            <div className="relative h-40 sm:h-48 md:h-64">
              <canvas ref={ratingChartRef}></canvas>
            </div>
          </div>
        </div>

        <div className="mt-4 sm:mt-6 md:mt-8 grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
          <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-600 text-sm font-medium">
                Latest Student Feedback
              </h3>
              <a href="#" className="text-sm text-pink-600 hover:underline">
                View All
              </a>
            </div>
            <div>
              <div className="border-b pb-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                    CS301
                  </span>
                  <div className="flex items-center text-yellow-500">
                    <svg
                      className="h-5 w-5 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.036 6.29a1 1 0 00.95.69h6.6c.969 0 1.371 1.24.588 1.81l-5.347 3.89a1 1 0 00-.364 1.118l2.036 6.29c.3.921-.755 1.688-1.54 1.118l-5.347-3.89a1 1 0 00-1.176 0l-5.347 3.89c-.784.57-1.838-.197-1.54-1.118l2.036-6.29a1 1 0 00-.364-1.118L2.414 11.717c-.783-.57-.381-1.81.588-1.81h6.6a1 1 0 00.95-.69l2.036-6.29z"
                      />
                    </svg>
                    <span>4.8</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  "Excellent teaching methodology and very clear explanations."
                </p>
                <span className="text-xs text-gray-400">2 days ago</span>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                    CS401
                  </span>
                  <div className="flex items-center text-yellow-500">
                    <svg
                      className="h-5 w-5 mr-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l2.036 6.29a1 1 0 00.95.69h6.6c.969 0 1.371 1.24.588 1.81l-5.347 3.89a1 1 0 00-.364 1.118l2.036 6.29c.3.921-.755 1.688-1.54 1.118l-5.347-3.89a1 1 0 00-1.176 0l-5.347 3.89c-.784.57-1.838-.197-1.54-1.118l2.036-6.29a1 1 0 00-.364-1.118L2.414 11.717c-.783-.57-.381-1.81.588-1.81h6.6a1 1 0 00.95-.69l2.036-6.29z"
                      />
                    </svg>
                    <span>4.5</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">
                  "Great course structure and engaging assignments."
                </p>
                <span className="text-xs text-gray-400">4 days ago</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-3 sm:p-4 md:p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-600 text-sm font-medium">
                Upcoming Classes
              </h3>
              <a href="#" className="text-sm text-pink-600 hover:underline">
                Full Schedule
              </a>
            </div>
            <div>
              <div className="border-b pb-4 mb-4">
                <div className="flex items-center mb-2">
                  <svg
                    className="h-5 w-5 text-gray-400 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm text-gray-600">09:00 AM</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    Advanced Algorithms
                  </h4>
                  <p className="text-xs text-gray-500">CS401 - Room 302</p>
                </div>
                <span className="text-xs text-green-500">Upcoming</span>
              </div>
              <div>
                <div className="flex items-center mb-2">
                  <svg
                    className="h-5 w-5 text-gray-400 mr-2"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm text-gray-600">11:30 AM</span>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-gray-900">
                    Data Structures
                  </h4>
                  <p className="text-xs text-gray-500">CS301 - Room 205</p>
                </div>
                <span className="text-xs text-green-500">Upcoming</span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default TeacherDashboard;
