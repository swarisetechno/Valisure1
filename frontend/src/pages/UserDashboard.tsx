import { useNavigate } from "react-router-dom";
import { LogOut, Menu, LayoutDashboard, ChevronLeft, ChevronRight, Sun, Moon } from "lucide-react";
import { useState } from "react";

const UserDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(true);

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    navigate("/");
  };

  const dashboards = [
    { name: "Admin Dashboard", path: "/admin-dashboard" },
    { name: "Author Dashboard", path: "/author-dashboard" },
    { name: "User Dashboard", path: "#", current: true },
    { name: "Approval Dashboard", path: "/approval-dashboard" },
  ];

  return (
    <div className="min-h-screen bg-[#DAE0F1]">
      {/* Sidebar - Full and Minimal View */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-[#1D2749] transition-all duration-300 z-40 ${
          sidebarOpen ? "w-64" : "w-24"
        }`}
      >
        {/* Sidebar Header */}
        <div className={`flex items-center border-b border-[#6D81C5] px-5 py-6 ${sidebarOpen ? "justify-between" : "justify-center"}`}>
          {sidebarOpen && <h1 className="text-white font-bold text-lg">ValiSure</h1>}
          <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-[#91A1D4] ${!sidebarOpen ? "w-10 h-10" : ""}`}>
            <span className="text-white font-bold text-sm">VS</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className={`flex flex-col gap-3 ${sidebarOpen ? "px-7 py-10" : "px-3 py-10"}`}>
          {dashboards.map((dashboard) => (
            <a
              key={dashboard.name}
              href={dashboard.path}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 transition ${
                dashboard.current
                  ? "bg-[#2d3a5a] text-white"
                  : "text-white hover:bg-[#2d3a5a]"
              } ${!sidebarOpen ? "justify-center" : ""}`}
              title={dashboard.name}
            >
              <LayoutDashboard size={24} />
              {sidebarOpen && <span className="text-sm font-medium">{dashboard.name}</span>}
            </a>
          ))}
        </nav>

        {/* Footer - Theme & Logout */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 px-3">
          {sidebarOpen && (
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="flex items-center justify-center gap-3 px-4 py-3 text-white hover:bg-[#2d3a5a] rounded-lg transition"
              title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-3 px-4 py-3 text-white bg-red-500 hover:bg-red-600 rounded-lg transition"
            title="Logout"
          >
            <LogOut size={20} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "lg:ml-24"}`}>
        {/* Top Header */}
        <header className={`bg-[#1D2749] text-white h-20 flex items-center justify-between px-5 lg:px-8 fixed lg:absolute top-0 left-0 right-0 z-30 ${sidebarOpen ? "lg:left-64" : "lg:left-24"} transition-all duration-300`}>
          {/* Left Arrow Toggle */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex items-center justify-center w-6 h-6 bg-[#DAE0F1] rounded-full hover:opacity-80 transition"
            title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
          >
            {sidebarOpen ? (
              <ChevronLeft size={16} className="text-[#3A4E92]" />
            ) : (
              <ChevronRight size={16} className="text-[#3A4E92]" />
            )}
          </button>

          {/* Right Side Content */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <p className="text-sm font-semibold text-[#F7F7F7]">Welcome, User</p>
              <p className="text-xs text-gray-300">Standard User</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-full border-2 border-[#DAE0F1]"></div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8 pt-24">
          <div className="bg-white rounded-xl shadow-lg p-12">
            <h1 className="text-4xl font-bold text-[#1D2749] mb-4">User Dashboard</h1>
            <p className="text-lg text-gray-600 mb-6">
              Welcome to the User Dashboard! This section is under development.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-green-100 to-green-50 rounded-lg p-6 border border-[#3A4E92]">
                <h3 className="text-xl font-semibold text-[#1D2749] mb-2">My Projects</h3>
                <p className="text-gray-600">Access all your assigned projects</p>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-lg p-6 border border-[#3A4E92]">
                <h3 className="text-xl font-semibold text-[#1D2749] mb-2">Tasks</h3>
                <p className="text-gray-600">View and manage your tasks</p>
              </div>
              
              <div className="bg-gradient-to-br from-indigo-100 to-indigo-50 rounded-lg p-6 border border-[#3A4E92]">
                <h3 className="text-xl font-semibold text-[#1D2749] mb-2">Reports</h3>
                <p className="text-gray-600">Check your activity reports</p>
              </div>
            </div>

            <div className="mt-8 p-4 bg-green-50 border-l-4 border-[#30628A] rounded">
              <p className="text-[#1D2749] font-semibold">Navigation</p>
              <ul className="mt-3 space-y-2">
                {dashboards.map((dashboard) => (
                  <li key={dashboard.name}>
                    <a
                      href={dashboard.path}
                      className={`${
                        dashboard.current ? "font-bold text-[#30628A]" : "text-blue-600 hover:text-blue-800"
                      }`}
                    >
                      <ChevronRight size={14} className="inline mr-1 align-middle" /> {dashboard.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UserDashboard;
