import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Menu, ChevronLeft, ChevronRight, LayoutDashboard, FolderOpen, FileText, Lock, Search, Moon, Sun, ChevronDown, RefreshCcwDot } from "lucide-react";

const CSVTemplate = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [expandedMenu, setExpandedMenu] = useState({
    projects: true,
    templates: true,
    accessControl: false,
  });

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    navigate("/");
  };

  return (
    <div className={`flex min-h-screen ${darkMode ? "bg-[#DAE0F1]" : "bg-white"}`}>
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
          {/* Admin Dashboard */}
          <a
            href="#"
            onClick={() => navigate("/admin-dashboard")}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-white hover:bg-[#2d3a5a] transition ${!sidebarOpen ? "justify-center" : ""}`}
            title="Admin Dashboard"
          >
            <LayoutDashboard size={24} />
            {sidebarOpen && <span className="text-sm font-medium">Admin Dashboard</span>}
          </a>

          {/* Projects */}
          <button
            onClick={() => setExpandedMenu({ ...expandedMenu, projects: !expandedMenu.projects })}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-white hover:bg-[#2d3a5a] transition w-full ${!sidebarOpen ? "justify-center" : ""}`}
            title="Projects"
          >
            <FolderOpen size={20} />
            {sidebarOpen && <span className="text-sm font-medium flex-1 text-left">Projects</span>}
            {sidebarOpen && (
              <ChevronDown
                size={18}
                className={`transition-transform ${expandedMenu.projects ? "rotate-180" : ""}`}
              />
            )}
          </button>
          {sidebarOpen && expandedMenu.projects && (
            <div className="flex flex-col gap-2 pl-12 pr-4 py-2">
              <button 
                onClick={() => navigate("/create-project")}
                className="text-sm text-gray-300 hover:text-white text-left transition"
              >
                New projects
              </button>
              <button className="text-sm text-gray-300 hover:text-white text-left transition">
                Existing project
              </button>
            </div>
          )}

          {/* Templates */}
          <button
            onClick={() => setExpandedMenu({ ...expandedMenu, templates: !expandedMenu.templates })}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-white hover:bg-[#2d3a5a] transition w-full ${!sidebarOpen ? "justify-center" : ""}`}
            title="Templates"
          >
            <FileText size={20} />
            {sidebarOpen && <span className="text-sm font-medium flex-1 text-left">Templates</span>}
            {sidebarOpen && (
              <ChevronDown
                size={18}
                className={`transition-transform ${expandedMenu.templates ? "rotate-180" : ""}`}
              />
            )}
          </button>
          {sidebarOpen && expandedMenu.templates && (
            <div className="flex flex-col gap-2 pl-12 pr-4 py-2">
              <button 
                onClick={() => navigate("/csa-template")}
                className="text-sm text-gray-300 hover:text-white text-left transition"
              >
                CSA
              </button>
              <button 
                onClick={() => navigate("/csv-template")}
                className="text-sm text-gray-300 hover:text-white text-left transition"
              >
                CSV
              </button>
            </div>
          )}

          {/* Access Control */}
          <button
            onClick={() => setExpandedMenu({ ...expandedMenu, accessControl: !expandedMenu.accessControl })}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-white hover:bg-[#2d3a5a] transition w-full ${!sidebarOpen ? "justify-center" : ""}`}
            title="Access Control"
          >
            <Lock size={20} />
            {sidebarOpen && <span className="text-sm font-medium flex-1 text-left">Access Control</span>}
            {sidebarOpen && (
              <ChevronDown
                size={18}
                className={`transition-transform ${expandedMenu.accessControl ? "rotate-180" : ""}`}
              />
            )}
          </button>
          {sidebarOpen && expandedMenu.accessControl && (
            <div className="flex flex-col gap-2 pl-12 pr-4 py-2">
              <button 
                onClick={() => navigate("/create-user")}
                className="text-sm text-gray-300 hover:text-white text-left transition"
              >
                Create User
              </button>
              <button 
                onClick={() => navigate("/add-user")}
                className="text-sm text-gray-300 hover:text-white text-left transition"
              >
                Add User
              </button>
              <button 
                onClick={() => navigate("/manage-user")}
                className="text-sm text-gray-300 hover:text-white text-left transition"
              >
                Manage User
              </button>
            </div>
          )}
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
      <div className={`transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "lg:ml-24"}  flex-1`}>
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
            <div className="w-6 h-6 bg-[#DAE0F1] rounded-full flex items-center justify-center">
              <Search size={16} className="text-[#3A4E92]" />
            </div>
            <div className="flex flex-col items-end">
              <p className="text-sm font-semibold text-[#F7F7F7]">Welcome, Admin</p>
              <p className="text-xs text-gray-300">Administrator</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full border-2 border-[#FAC277]"></div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8 pt-24">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm mb-8">
            <button
              onClick={() => navigate("/admin-dashboard")}
              className="text-[#504539] hover:text-[#1F1B16] transition"
            >
              Templates
            </button>
            <span className="text-gray-400">/</span>
            <span className="text-[#1F1B16] font-semibold">CSV</span>
          </div>

          <h1 className="text-4xl font-bold text-[#1F1B16] mb-8">Admin CSV</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Existing Templates - CSV */}
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <FileText size={24} className="text-[#2B3B6E]" />
                <h2 className="text-lg font-bold text-[#1D1C1B]">Existing Templates</h2>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {[
                  "URS-User Request Specification",
                  "URRA-User Requirement Risk Assessment",
                  "QxP Assessment",
                  "CRF Part 11 (ERES)",
                  "SRS-System Risk Assessment",
                  "Validation Plan",
                  "FRS-Functional Requirement Specification",
                  "FRA-Functional Risk Assessment",
                  "DS-Design Specification",
                  "IQ Scripted Test Script",
                  "IQ Unscripted Test Script",
                  "OQ Scripted Test Script",
                  "OQ Unscripted Test Script",
                  "PQ Scripted Test Script",
                  "PQ Unscripted Test Script",
                  "RTM-Requirements Traceability Matrix",
                  "Validation Summary Report",
                ].map((template, index) => (
                  <div key={index} className="text-sm text-[#504539] py-2 px-3 hover:bg-gray-50 rounded transition">
                    {template}
                  </div>
                ))}
              </div>
            </div>

            {/* Replace New Templates - CSV */}
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <RefreshCcwDot size={24} className="text-[#2B3B6E]" />
                <h2 className="text-lg font-bold text-[#1F1B16]">Replace New Templates</h2>
              </div>

              <div className="space-y-3 max-h-96 overflow-y-auto">
                {[
                  "URS-User Request Specification",
                  "URRA-User Requirement Risk Assessment",
                  "QxP Assessment",
                  "CRF Part 11 (ERES) Assessment",
                  "SRS-System Risk Assessment",
                  "Sys - System Risk",
                  "FRS-Functional Requirement Specification",
                  "DRS - Design Specification",
                  "IQ Scripted Test Script",
                  "OQ Scripted Test Script",
                  "PQ Scripted Test Script",
                  "RTM-Requirements Traceability Matrix",
                  "Validation Summary Report",
                ].map((template, index) => (
                  <label key={index} className="flex items-center gap-3 py-2 px-3 rounded hover:bg-gray-50 cursor-pointer transition">
                    <input type="checkbox" className="w-4 h-4 rounded" />
                    <span className="text-sm text-[#504539]">{template}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Add New Templates - CSV */}
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">⊕</span>
                <h3 className="text-lg font-bold text-[#1D1C1B]">Add New Templates</h3>
              </div>

              <div className="space-y-3">
                <div className="bg-[#DAE0F1] rounded-lg p-4">
                  <span className="font-semibold text-[#1D1C1B]">QP - Quality Plan</span>
                </div>
                <div className="flex justify-center">
                  <button className="px-4 py-2 bg-[#11172B] text-white rounded font-semibold hover:opacity-90 transition text-sm">
                    + Add
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CSVTemplate;
