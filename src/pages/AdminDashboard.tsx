import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Menu, ChevronLeft, ChevronRight, Edit2, Trash2, LayoutDashboard, FolderOpen, FileText, Lock, Palette, Search, Moon, Sun, LayoutGrid, ChevronDown } from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [darkMode, setDarkMode] = useState(true);
  const [showColumnMenu, setShowColumnMenu] = useState(false);
  const [visibleColumns, setVisibleColumns] = useState({
    projId: true,
    projectName: true,
    changeId: true,
    gamp: true,
    csvCsa: true,
    status: true,
    createdBy: false,
    createdDate: false,
    modifiedBy: false,
    modifiedDate: false,
  });
  const [expandedMenu, setExpandedMenu] = useState({
    projects: true,
    templates: false,
    accessControl: false,
  });

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    navigate("/");
  };

  const toggleColumn = (columnKey) => {
    setVisibleColumns(prev => ({
      ...prev,
      [columnKey]: !prev[columnKey]
    }));
  };

  const projects = [
    {
      id: "PRJ-2023-001",
      name: "LIMS Integration Phase 2",
      updated: "Updated 2h ago",
      changeId: "CHG-8821",
      category: "category 5",
      csvCsa: "CSV",
      status: "ACTIVE",
    },
    {
      id: "PRJ-2023-021",
      name: "Quality Audit Portal",
      updated: "Updated 1d ago",
      changeId: "CHG-9071",
      category: "category 4",
      csvCsa: "CSA",
      status: "ACTIVE",
    },
    {
      id: "PRJ-2023-231",
      name: "LIMS Integration Phase 1",
      updated: "Updated 3d ago",
      changeId: "CHG-2341",
      category: "category 7",
      csvCsa: "CSV",
      status: "INACTIVE",
    },
    {
      id: "PRJ-2023-451",
      name: "Cloud Storage Validation",
      updated: "Updated last week",
      changeId: "CHG-4561",
      category: "category 2",
      csvCsa: "CSA",
      status: "ACTIVE",
    },
  ];

  return (
    <div className={`min-h-screen ${darkMode ? "bg-[#DAE0F1]" : "bg-gray-100"}`}>
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
              <button className="text-sm text-gray-300 hover:text-white text-left transition">
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
          {/* Title and Button */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-[#1F1B16]">Admin Dashboard</h1>
            <button className="px-8 py-3 bg-[#11172B] text-white rounded-full font-semibold hover:opacity-90 transition flex items-center gap-2">
              <span className="text-lg">+</span>
              Create Project
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Active Projects Card */}
            <div className="bg-white rounded-xl p-6 border border-[#3A4E92] shadow-lg">
              <p className="text-xs font-bold text-[#504539] tracking-widest uppercase mb-4">
                Active Projects
              </p>
              <p className="text-5xl font-semibold text-[#6D81C5]">12</p>
            </div>

            {/* Decommissioned Projects Card */}
            <div className="bg-white rounded-xl p-6 border border-[#3A4E92] shadow-lg">
              <p className="text-xs font-bold text-[#504539] tracking-widest uppercase mb-4">
                Deactive / Decommissioned Projects
              </p>
              <p className="text-5xl font-semibold text-[#1F1B16]">08</p>
            </div>

            {/* Upcoming/Draft Projects Card */}
            <div className="bg-white rounded-xl p-6 border border-[#3A4E92] shadow-lg">
              <p className="text-xs font-bold text-[#504539] tracking-widest uppercase mb-4">
                Upcoming / Draft Projects
              </p>
              <p className="text-5xl font-semibold text-[#30628A]">02</p>
            </div>
          </div>

          {/* Projects Table */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            {/* Table Header */}
            <div className="flex items-center justify-between px-6 py-6 border-b border-[#B6C0E2]">
              <h2 className="text-2xl font-bold text-[#1F1B16]">Project List</h2>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-4 bg-[#DAE0F1] rounded-full px-4 py-2">
                  <span className="text-sm font-semibold text-gray-700">Search</span>
                  <Search size={18} className="text-gray-700" />
                </div>
                {/* Column Toggle Button */}
                <div className="relative">
                  <button
                    onClick={() => setShowColumnMenu(!showColumnMenu)}
                    className="flex items-center justify-center w-10 h-10 bg-[#DAE0F1] rounded hover:bg-[#B6C0E2] transition"
                    title="Toggle Columns"
                  >
                    <LayoutGrid size={18} className="text-gray-700" />
                  </button>
                  
                  {/* Column Menu Dropdown */}
                  {showColumnMenu && (
                    <div className="absolute right-0 top-12 bg-white border border-gray-300 rounded-lg shadow-lg z-50 w-64 p-4">
                      <div className="flex items-center gap-2 mb-4">
                        <LayoutGrid size={18} className="text-gray-700" />
                        <h3 className="text-sm font-bold text-gray-800">Columns</h3>
                      </div>
                      <div className="space-y-3">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={visibleColumns.projId}
                            onChange={() => toggleColumn('projId')}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-gray-700">Proj - ID</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={visibleColumns.projectName}
                            onChange={() => toggleColumn('projectName')}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-gray-700">Project Name</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={visibleColumns.changeId}
                            onChange={() => toggleColumn('changeId')}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-gray-700">Change ID</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={visibleColumns.gamp}
                            onChange={() => toggleColumn('gamp')}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-gray-700">GAMP</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={visibleColumns.csvCsa}
                            onChange={() => toggleColumn('csvCsa')}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-gray-700">CSV / CSA</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={visibleColumns.status}
                            onChange={() => toggleColumn('status')}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-gray-700">Status</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={visibleColumns.createdBy}
                            onChange={() => toggleColumn('createdBy')}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-gray-700">Project created by</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={visibleColumns.createdDate}
                            onChange={() => toggleColumn('createdDate')}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-gray-700">Created date</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={visibleColumns.modifiedBy}
                            onChange={() => toggleColumn('modifiedBy')}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-gray-700">Last modified by</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={visibleColumns.modifiedDate}
                            onChange={() => toggleColumn('modifiedDate')}
                            className="w-4 h-4"
                          />
                          <span className="text-sm text-gray-700">Last modified date</span>
                        </label>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Table Column Headers */}
            <div className="bg-[#B6C0E2] grid gap-4 px-6 py-3 text-xs font-bold text-[#504539] uppercase tracking-wider"
              style={{gridTemplateColumns: `repeat(${Object.values(visibleColumns).filter(Boolean).length + 1}, minmax(80px, 1fr))`}}>
              {visibleColumns.projId && <div>Proj - ID</div>}
              {visibleColumns.projectName && <div>Project Name</div>}
              {visibleColumns.changeId && <div>Change ID</div>}
              {visibleColumns.gamp && <div>GAMP</div>}
              {visibleColumns.csvCsa && <div>CSV/CSA</div>}
              {visibleColumns.status && <div>Status</div>}
              {visibleColumns.createdBy && <div>Created By</div>}
              {visibleColumns.createdDate && <div>Created Date</div>}
              {visibleColumns.modifiedBy && <div>Modified By</div>}
              {visibleColumns.modifiedDate && <div>Modified Date</div>}
              <div>Action</div>
            </div>

            {/* Table Rows */}
            <div className="divide-y divide-gray-200">
              {projects.map((project) => (
                <div key={project.id} className="grid gap-4 px-6 py-4 items-center hover:bg-gray-50 transition"
                  style={{gridTemplateColumns: `repeat(${Object.values(visibleColumns).filter(Boolean).length + 1}, minmax(80px, 1fr))`}}>
                  {visibleColumns.projId && (
                    <div className="text-sm font-medium text-[#504539] uppercase">
                      {project.id}
                    </div>
                  )}
                  {visibleColumns.projectName && (
                    <div>
                      <p className="font-bold text-sm text-[#504539]">{project.name}</p>
                      <p className="text-xs text-gray-500">{project.updated}</p>
                    </div>
                  )}
                  {visibleColumns.changeId && (
                    <div className="text-sm text-[#504539] uppercase">
                      {project.changeId}
                    </div>
                  )}
                  {visibleColumns.gamp && (
                    <div className="text-sm text-[#504539] lowercase">
                      {project.category}
                    </div>
                  )}
                  {visibleColumns.csvCsa && (
                    <div className="text-sm text-[#504539] uppercase">
                      {project.csvCsa}
                    </div>
                  )}
                  {visibleColumns.status && (
                    <div>
                      <span
                        className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${
                          project.status === "ACTIVE"
                            ? "bg-[#DCFCE7] text-[#15803D]"
                            : "bg-[#FCDCDD] text-[#A71C1F]"
                        }`}
                      >
                        {project.status}
                      </span>
                    </div>
                  )}
                  {visibleColumns.createdBy && (
                    <div className="text-sm text-[#504539]">-</div>
                  )}
                  {visibleColumns.createdDate && (
                    <div className="text-sm text-[#504539]">-</div>
                  )}
                  {visibleColumns.modifiedBy && (
                    <div className="text-sm text-[#504539]">-</div>
                  )}
                  {visibleColumns.modifiedDate && (
                    <div className="text-sm text-[#504539]">-</div>
                  )}
                  <div className="flex items-center gap-2">
                    <button className="p-2 hover:bg-gray-100 rounded transition">
                      <Edit2 size={18} className="text-[#504539]" />
                    </button>
                    <button className="p-2 hover:bg-gray-100 rounded transition">
                      <Trash2 size={18} className="text-[#504539]" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-300">
              <p className="text-xs font-semibold text-[#504539]">Showing 4 of 12 active projects</p>
              <div className="flex items-center gap-2">
                <button className="p-1 border border-gray-300 rounded hover:bg-gray-50 transition">
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs font-semibold text-[#504539]">1</span>
                <button className="p-1 border border-gray-300 rounded hover:bg-gray-50 transition">
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
