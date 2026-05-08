import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, LogOut, Moon, Sun, LayoutDashboard, FolderOpen, FileText, Lock, Search, Trash2, Edit2, ChevronDown, Briefcase, CheckCircle2, Users, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { userApi, projectApi, roleApi } from "@/services/api";

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  department: string;
  title: string;
  status: string;
  createdDate: string;
}

interface Project {
  id: string;
  name: string;
  csvCsa: string;
  status: string;
}

const AddUser = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [expandedMenu, setExpandedMenu] = useState({
    projects: false,
    templates: false,
    accessControl: true,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("All Departments");
  const [departmentFilterDropdownOpen, setDepartmentFilterDropdownOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [statusFilterDropdownOpen, setStatusFilterDropdownOpen] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProjects, setSelectedProjects] = useState<Set<string>>(new Set());
  const [projectRoles, setProjectRoles] = useState<Record<string, string>>({});
  const [quickAssignRole, setQuickAssignRole] = useState("");
  const [quickAssignRoleDropdownOpen, setQuickAssignRoleDropdownOpen] = useState(false);

  useEffect(() => {
    loadUsers();
    loadProjects();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    navigate("/");
  };

  const loadUsers = async () => {
    try {
      const data = await userApi.list();
      const mappedUsers = (data.users || []).map((u: any) => ({
        id: u.id,
        name: u.username,
        email: u.email || "-",
        department: u.department || "N/A",
        title: u.title || "N/A",
        status: u.status || "Active",
        phone: u.phone,
        createdDate: u.created_at || new Date().toISOString()
      }));
      setUsers(mappedUsers);
    } catch (err) {
      console.error("Failed to load users", err);
    }
  };

  const loadProjects = async () => {
    try {
      const data = await projectApi.list();
      const mappedProjects = (data.projects || []).map((p: any) => ({
        id: String(p.id),
        name: p.name,
        csvCsa: p.description || "",
        status: "Active"
      }));
      setProjects(mappedProjects);
    } catch (error) {
      console.error("Error loading projects:", error);
      setProjects([]);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      try {
        await userApi.delete(id);
        const updatedUsers = users.filter((user) => user.id !== id);
        setUsers(updatedUsers);
        setDeleteMessage("User deleted successfully!");
        setTimeout(() => setDeleteMessage(""), 3000);
      } catch (err) {
        console.error("Failed to delete user", err);
      }
    }
  };

  const toggleProjectSelection = (projectId: string) => {
    const newSelected = new Set(selectedProjects);
    if (newSelected.has(projectId)) {
      newSelected.delete(projectId);
    } else {
      newSelected.add(projectId);
    }
    setSelectedProjects(newSelected);
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment =
      departmentFilter === "All Departments" || user.department === departmentFilter;
    const matchesStatus =
      statusFilter === "All Status" || user.status === statusFilter;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  return (
    <div className={`min-h-screen ${darkMode ? "bg-[#DAE0F1]" : "bg-gray-100"}`}>
      {/* Sidebar - Full and Minimal View */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-[#1D2749] transition-all duration-300 z-40 ${
          sidebarOpen ? "w-64" : "w-24"
        }`}
      >
        {/* Sidebar Header */}
        <div className={`flex items-center justify-center border-b border-[#6D81C5] px-5 h-20`}>
          {sidebarOpen && <h1 className="text-white font-bold text-lg">ValiSure</h1>}
          {!sidebarOpen && (
            <div className={`flex items-center justify-center w-10 h-10 rounded-full bg-[#91A1D4]`}>
              <span className="text-white font-bold text-sm">VS</span>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className={`flex flex-col gap-3 ${sidebarOpen ? "px-7 py-10" : "px-3 py-10"}`}>
          {/* Admin Dashboard */}
          <button
            onClick={() => navigate("/admin")}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-white hover:bg-[#2d3a5a] transition ${!sidebarOpen ? "justify-center" : ""}`}
            title="Admin Dashboard"
          >
            <LayoutDashboard size={24} />
            {sidebarOpen && <span className="text-sm font-medium">Admin Dashboard</span>}
          </button>

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
              <button onClick={() => navigate("/admin")} className="text-sm text-gray-300 hover:text-white text-left transition">
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
                className="text-sm text-gray-300 hover:text-white text-left transition font-semibold"
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
            <p className="text-sm font-semibold text-[#F7F7F7]">Welcome, Admin</p>
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full border-2 border-[#FAC277] flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8 pt-24">
          {/* Back Button */}
          <button
            onClick={() => navigate("/manage-user")}
            className="flex items-center gap-2 text-[#1D2749] hover:opacity-70 transition mb-8 font-semibold"
          >
            <ChevronLeft size={20} />
            Back
          </button>

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#1F1B16] mb-2">Add User</h1>
            <p className="text-gray-600">Activate a user from your identity provider</p>
          </div>

          {/* Step Indicator */}
          <div className="mb-12">
            <div className="flex items-start justify-between px-8 mb-6">
              {[1, 2, 3, 4].map((step, index) => (
                <div key={step} className="flex flex-col items-center flex-1 relative">
                  {/* Connecting Line */}
                  {index < 3 && (
                    <div
                      className={`absolute top-6 left-1/2 w-full h-1.5 ${
                        step < currentStep ? "bg-green-500" : "bg-gray-300"
                      }`}
                      style={{
                        width: "calc(100% - 24px)",
                        left: "calc(50% + 24px)",
                      }}
                    />
                  )}
                  
                  {/* Circle */}
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-semibold text-lg z-10 ${
                      step < currentStep
                        ? "bg-green-500 text-white"
                        : step === currentStep
                        ? "bg-[#2B3B6E] text-white"
                        : "bg-gray-300 text-gray-600"
                    }`}
                  >
                    {step === 1 && <Users size={24} />}
                    {step === 2 && <Briefcase size={24} />}
                    {step === 3 && <Lock size={24} />}
                    {step === 4 && <CheckCircle2 size={24} />}
                  </div>
                  
                  {/* Label */}
                  <span className="text-xs font-medium text-gray-600 mt-3 text-center">
                    {step === 1 && "Select User"}
                    {step === 2 && "Choose Projects"}
                    {step === 3 && "Assign Roles"}
                    {step === 4 && "Review & Activate"}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Step 1: Select User */}
          {currentStep === 1 && (
            <div className="px-8 pb-12">
              {/* Heading outside container */}
              <h2 className="text-xl font-bold text-[#1F1B16] mb-2">Select User from Identity Provider</h2>
              <p className="text-gray-600 text-sm mb-8">Search and select a user from your organization's identity provider</p>

              {/* Search and Filters Container */}
              <div className="bg-white rounded-lg p-6 border border-[#A9A4A0] mb-6">
                <div className="flex items-center gap-4">
                  {/* Search Bar */}
                  <div className="flex items-center gap-2 bg-[#DAE0F1] rounded-lg px-4 py-3 flex-1">
                    <Search size={18} className="text-[#504539]" />
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="bg-transparent text-gray-700 outline-none text-sm placeholder-gray-500 flex-1"
                    />
                  </div>

                  {/* Status Filter */}
                  <div className="relative w-48">
                    <button
                      onClick={() => setStatusFilterDropdownOpen(!statusFilterDropdownOpen)}
                      className="w-full px-4 py-3 bg-[#DAE0F1] border border-gray-300 rounded-lg flex items-center justify-between hover:bg-blue-50 text-left"
                    >
                      <span className="text-gray-700">{statusFilter}</span>
                      <ChevronDown
                        size={18}
                        className={`text-gray-600 transition ${statusFilterDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {/* Status Filter Dropdown Menu */}
                    {statusFilterDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 overflow-hidden">
                        {["All Status", "Active", "Inactive"].map((status) => (
                          <label
                            key={status}
                            className="flex items-center justify-between p-4 border-b border-gray-300 hover:bg-gray-50 cursor-pointer last:border-b-0"
                          >
                            <span className="text-sm text-gray-900">{status}</span>
                            <input
                              type="radio"
                              name="status"
                              checked={statusFilter === status}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setStatusFilter(status);
                                  setStatusFilterDropdownOpen(false);
                                }
                              }}
                              className="w-5 h-5 cursor-pointer"
                            />
                          </label>
                        ))}
                      </div>
                    )}

                    {/* Close dropdown when clicking outside */}
                    {statusFilterDropdownOpen && (
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setStatusFilterDropdownOpen(false)}
                      />
                    )}
                  </div>

                  {/* Department Filter */}
                  <div className="relative w-48">
                    <button
                      onClick={() => setDepartmentFilterDropdownOpen(!departmentFilterDropdownOpen)}
                      className="w-full px-4 py-3 bg-[#DAE0F1] border border-gray-300 rounded-lg flex items-center justify-between hover:bg-blue-50 text-left"
                    >
                      <span className="text-gray-700">{departmentFilter}</span>
                      <ChevronDown
                        size={18}
                        className={`text-gray-600 transition ${departmentFilterDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {/* Department Filter Dropdown Menu */}
                    {departmentFilterDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 overflow-hidden">
                        {["All Departments", "Quality Assurance", "Regulatory Affairs", "IT", "Operations", "Management"].map((dept) => (
                          <label
                            key={dept}
                            className="flex items-center justify-between p-4 border-b border-gray-300 hover:bg-gray-50 cursor-pointer last:border-b-0"
                          >
                            <span className="text-sm text-gray-900">{dept}</span>
                            <input
                              type="radio"
                              name="department"
                              checked={departmentFilter === dept}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setDepartmentFilter(dept);
                                  setDepartmentFilterDropdownOpen(false);
                                }
                              }}
                              className="w-5 h-5 cursor-pointer"
                            />
                          </label>
                        ))}
                      </div>
                    )}

                    {/* Close dropdown when clicking outside */}
                    {departmentFilterDropdownOpen && (
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setDepartmentFilterDropdownOpen(false)}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white rounded-lg overflow-hidden border border-[#A9A4A0] mb-8">
                {/* Table Headers */}
                <div className="grid grid-cols-6 px-8 py-4 bg-gray-50 border-b border-[#CFCBC8]" style={{gridTemplateColumns: "50px 1.5fr 1.5fr 1fr 1fr 1fr"}}>
                  <div className="flex items-center"></div>
                  <div className="text-xs font-semibold text-[#504539] uppercase tracking-wider">Name</div>
                  <div className="text-xs font-semibold text-[#504539] uppercase tracking-wider">Email</div>
                  <div className="text-xs font-semibold text-[#504539] uppercase tracking-wider">Department</div>
                  <div className="text-xs font-semibold text-[#504539] uppercase tracking-wider">Title</div>
                  <div className="text-xs font-semibold text-[#504539] uppercase tracking-wider">Status</div>
                </div>

                {/* Table Rows */}
                {filteredUsers.length > 0 ? (
                  <div className="divide-y divide-gray-200">
                    {filteredUsers.map((user) => (
                      <div
                        key={user.id}
                        className={`grid grid-cols-6 px-8 py-4 items-center transition ${
                          selectedUser?.id === user.id
                            ? "bg-[#DAE0F1]"
                            : "hover:bg-gray-50"
                        }`}
                        style={{gridTemplateColumns: "50px 1.5fr 1.5fr 1fr 1fr 1fr"}}
                      >
                        {/* Checkbox */}
                        <div className="flex items-center justify-center">
                          <input
                            type="checkbox"
                            checked={selectedUser?.id === user.id}
                            onChange={() => setSelectedUser(selectedUser?.id === user.id ? null : user)}
                            className="w-5 h-5 rounded-full border-2 border-gray-400 cursor-pointer accent-[#2B3B6E]"
                          />
                        </div>

                        {/* Name */}
                        <div className="pr-4">
                          <p className="text-sm font-semibold text-[#1F1B16]">{user.name}</p>
                          <p className="text-xs text-gray-500">Not yet activated · Will be created on activation</p>
                        </div>

                        {/* Email */}
                        <div className="text-sm text-[#504539] pr-4">{user.email}</div>

                        {/* Department */}
                        <div className="text-sm text-[#504539] pr-4">{user.department}</div>

                        {/* Title */}
                        <div className="text-sm text-[#504539] pr-4">{user.title}</div>

                        {/* Status */}
                        <div>
                          <span className={`px-3 py-1 rounded text-xs font-semibold inline-block ${
                            user.status === "Active"
                              ? "bg-[#15803D] text-white"
                              : "bg-[#837F7C] text-white"
                          }`}>
                            {user.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-8 py-12 text-center">
                    <p className="text-gray-500 text-sm">No users found.</p>
                  </div>
                )}
              </div>

              {/* Navigation Buttons - Outside Container */}
              <div className="flex items-center justify-between mt-8">
                <button
                  onClick={() => navigate("/manage-user")}
                  className="px-6 py-2 text-gray-700 border border-gray-400 rounded-full hover:bg-gray-50 font-semibold"
                >
                  Back
                </button>
                <button
                  onClick={() => selectedUser && setCurrentStep(2)}
                  disabled={!selectedUser}
                  className={`px-6 py-2 rounded-full text-white transition font-semibold ${selectedUser ? "bg-[#11172B] hover:opacity-90" : "bg-gray-300 cursor-not-allowed disabled:opacity-50"}`}
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Choose Projects */}
          {currentStep === 2 && (
            <div className="px-8 pb-12">
              <div className="bg-white rounded-lg p-8 border border-[#A9A4A0]">
              <h2 className="text-lg font-bold text-gray-900 mb-2">Choose Projects</h2>
              <p className="text-sm text-gray-600 mb-6">
                Select one or more projects to assign {selectedUser?.name || "the user"} to
              </p>

              {/* Search Projects */}
              <div className="mb-8">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search projects..."
                    className="w-full px-4 py-3 bg-[#DAE0F1] rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B3B6E] pr-10"
                  />
                  <Search size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600" />
                </div>
              </div>

              {/* Projects Grid */}
              <div className="space-y-3 mb-8">
                {projects.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-gray-600 mb-4">No projects found</p>
                    <p className="text-sm text-gray-500">Create a project first in <strong>Projects → New projects</strong></p>
                  </div>
                ) : (
                  projects.map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-4 border border-[#A9A4A0] rounded-lg hover:bg-gray-50 transition">
                      <div className="flex items-center gap-4 flex-1">
                        <input
                          type="checkbox"
                          checked={selectedProjects.has(project.id)}
                          onChange={() => toggleProjectSelection(project.id)}
                          className="w-5 h-5 rounded border border-gray-400 cursor-pointer"
                        />
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{project.name}</p>
                          <p className="text-xs text-gray-600">{project.id}</p>
                        </div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#15803D] text-white">
                        {project.status}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Selected Projects Display */}
              {selectedProjects.size > 0 && (
                <div className="border-t border-gray-300 pt-6 mb-8">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">
                    Selected {selectedProjects.size} Projects
                  </h3>
                  <div className="space-y-2">
                    {projects
                      .filter(p => selectedProjects.has(p.id))
                      .map((project) => (
                        <div key={project.id} className="flex items-center justify-between p-3 bg-[#DAE0F1] rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{project.name}</p>
                            <p className="text-xs text-gray-600">{project.id}</p>
                          </div>
                          <button
                            onClick={() => toggleProjectSelection(project.id)}
                            className="text-gray-400 hover:text-gray-600 text-lg font-semibold"
                            title="Remove project"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons - Outside Container */}
            <div className="flex items-center justify-between mt-8">
              <button
                onClick={() => {
                  setCurrentStep(1);
                  setSelectedProjects(new Set());
                }}
                className="px-6 py-2 text-gray-700 border border-gray-400 rounded-full hover:bg-gray-50 font-semibold"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentStep(3)}
                disabled={selectedProjects.size === 0}
                className="px-6 py-2 bg-[#11172B] text-white rounded-full hover:opacity-90 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            </div>
          )}

          {/* Step 3: Assign Roles */}
          {currentStep === 3 && (
            <div className="px-8 pb-12">
              <div className="bg-white rounded-lg p-8 border border-[#A9A4A0]">
              <h2 className="text-xl font-bold text-[#1F1B16] mb-2">Assign Roles</h2>
              <p className="text-gray-600 text-sm mb-8">
                Choose a role for {selectedUser?.name || "the user"} in each selected project
              </p>

              {/* Quick Assign Section */}
              <div className="bg-white rounded-lg p-6 mb-8 border border-[#E5E5E5]">
                <h3 className="text-sm font-semibold text-[#1F1B16] mb-1">Quick Assign</h3>
                <p className="text-xs text-gray-600 mb-4">Apply the same role to all selected projects</p>
                
                <div className="flex items-center gap-4">
                  <div className="relative flex-1">
                    <button
                      onClick={() => setQuickAssignRoleDropdownOpen(!quickAssignRoleDropdownOpen)}
                      className="w-full px-4 py-3 bg-[#DAE0F1] border border-gray-300 rounded-lg flex items-center justify-between hover:bg-blue-50 text-left"
                    >
                      <span className="text-gray-700">{quickAssignRole || "Select role for all projects"}</span>
                      <ChevronDown
                        size={18}
                        className={`text-gray-600 transition ${quickAssignRoleDropdownOpen ? "rotate-180" : ""}`}
                      />
                    </button>

                    {/* Quick Assign Role Dropdown Menu */}
                    {quickAssignRoleDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 overflow-hidden">
                        {["Admin", "Reviewer", "Reviewer - Approver"].map((role) => (
                          <label
                            key={role}
                            className="flex items-center justify-between p-4 border-b border-gray-300 hover:bg-gray-50 cursor-pointer last:border-b-0"
                          >
                            <span className="text-sm text-gray-900">{role}</span>
                            <input
                              type="radio"
                              name="quickAssignRole"
                              checked={quickAssignRole === role}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setQuickAssignRole(role);
                                  setQuickAssignRoleDropdownOpen(false);
                                }
                              }}
                              className="w-5 h-5 cursor-pointer"
                            />
                          </label>
                        ))}
                      </div>
                    )}

                    {/* Close dropdown when clicking outside */}
                    {quickAssignRoleDropdownOpen && (
                      <div
                        className="fixed inset-0 z-10"
                        onClick={() => setQuickAssignRoleDropdownOpen(false)}
                      />
                    )}
                  </div>
                  <button
                    onClick={() => {
                      if (quickAssignRole) {
                        const updatedRoles = { ...projectRoles };
                        selectedProjects.forEach(projectId => {
                          updatedRoles[projectId] = quickAssignRole;
                        });
                        setProjectRoles(updatedRoles);
                      }
                    }}
                    disabled={!quickAssignRole}
                    className="px-6 py-3 bg-[#6D81C5] text-white rounded-lg hover:bg-[#5a6fb3] transition font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                  >
                    Apply to all
                  </button>
                </div>
              </div>

              {/* Role Assignments Section */}
              <div className="bg-white rounded-lg p-6 border border-[#E5E5E5]">
                <h3 className="text-sm font-semibold text-[#1F1B16] mb-4">Role Assignments</h3>
                
                {/* Projects Role Assignment */}
                <div className="space-y-3">
                  {projects
                    .filter(p => selectedProjects.has(p.id))
                    .map((project) => (
                      <div key={project.id} className="border border-[#E5E5E5] rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          {/* Project Name */}
                          <div>
                            <p className="text-sm font-semibold text-[#1F1B16]">{project.name}</p>
                            <p className="text-xs text-gray-500">{project.id}</p>
                          </div>
                          
                          {/* Role Options */}
                          <div className="flex items-center gap-8">
                            <button
                              onClick={() => {
                                const updatedRoles = { ...projectRoles };
                                updatedRoles[project.id] = "Admin";
                                setProjectRoles(updatedRoles);
                              }}
                              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition"
                            >
                              {projectRoles[project.id] === "Admin" && <span className="text-lg">•</span>}
                              {projectRoles[project.id] !== "Admin" && <span className="text-lg text-transparent">•</span>}
                              <span>Admin</span>
                            </button>
                            
                            <button
                              onClick={() => {
                                const updatedRoles = { ...projectRoles };
                                updatedRoles[project.id] = "Reviewer";
                                setProjectRoles(updatedRoles);
                              }}
                              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition"
                            >
                              {projectRoles[project.id] === "Reviewer" && <span className="text-lg">•</span>}
                              {projectRoles[project.id] !== "Reviewer" && <span className="text-lg text-transparent">•</span>}
                              <span>Reviewer</span>
                            </button>
                            
                            <button
                              onClick={() => {
                                const updatedRoles = { ...projectRoles };
                                updatedRoles[project.id] = "Reviewer - Approver";
                                setProjectRoles(updatedRoles);
                              }}
                              className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition"
                            >
                              {projectRoles[project.id] === "Reviewer - Approver" && <span className="text-lg">•</span>}
                              {projectRoles[project.id] !== "Reviewer - Approver" && <span className="text-lg text-transparent">•</span>}
                              <span>Reviewer - Approver</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </div>

            {/* Navigation Buttons - Outside Container */}
            <div className="flex items-center justify-between mt-8">
              <button
                onClick={() => setCurrentStep(2)}
                className="px-6 py-2 text-gray-700 border border-gray-400 rounded-full hover:bg-gray-50 font-semibold"
              >
                Previous
              </button>
              <button
                onClick={() => {
                  const allRolesAssigned = Array.from(selectedProjects).every(
                    projectId => projectRoles[projectId]
                  );
                  if (allRolesAssigned) {
                    setCurrentStep(4);
                  }
                }}
                disabled={!Array.from(selectedProjects).every(projectId => projectRoles[projectId])}
                className="px-6 py-2 bg-[#11172B] text-white rounded-full hover:opacity-90 transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
            </div>
          )}

          {/* Step 4: Review & Activate */}
          {currentStep === 4 && (
            <div className="px-8 pb-12">
              <div className="bg-white rounded-lg p-8 border border-[#A9A4A0]">
              <h2 className="text-2xl font-bold text-[#1F1B16] mb-2">Review & Activate</h2>
              <p className="text-gray-600 text-sm mb-8">Review the details and confirm user activation</p>

              {/* User Details Section */}
              <div className="bg-white rounded-lg p-8 mb-6 border border-[#E5E5E5]">
                <h3 className="text-sm font-semibold text-[#1F1B16] mb-6">User Details</h3>
                
                <div className="grid grid-cols-2 gap-8">
                  {/* Left Column */}
                  <div className="space-y-6">
                    {/* Name */}
                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-1">Name</p>
                      <p className="text-sm font-semibold text-[#1F1B16]">{selectedUser?.name || "N/A"}</p>
                    </div>
                    
                    {/* Department */}
                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-1">Department</p>
                      <p className="text-sm font-semibold text-[#1F1B16]">{selectedUser?.department || "N/A"}</p>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="space-y-6">
                    {/* Email */}
                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-1">Email</p>
                      <p className="text-sm font-semibold text-[#1F1B16]">{selectedUser?.email || "N/A"}</p>
                    </div>
                    
                    {/* Status from (IDP) */}
                    <div>
                      <p className="text-xs text-gray-600 font-medium mb-1">Status from (IDP)</p>
                      <span className={`px-3 py-1 rounded text-xs font-semibold inline-block ${
                        selectedUser?.status === "Active"
                          ? "bg-[#15803D] text-white"
                          : "bg-[#837F7C] text-white"
                      }`}>
                        {selectedUser?.status || "N/A"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Project Assignments Section */}
              <div className="bg-white rounded-lg p-8 border border-[#E5E5E5]">
                <h3 className="text-sm font-semibold text-[#1F1B16] mb-6">Project Assignments</h3>
                
                {/* Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-[#CFCBC8]">
                        <th className="px-6 py-4 text-left text-xs font-semibold text-[#504539] uppercase tracking-wider">Project</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-[#504539] uppercase tracking-wider">Project ID</th>
                        <th className="px-6 py-4 text-left text-xs font-semibold text-[#504539] uppercase tracking-wider">Role</th>
                      </tr>
                    </thead>
                    <tbody>
                      {projects
                        .filter(p => selectedProjects.has(p.id))
                        .map((project) => (
                          <tr key={project.id} className="border-b border-[#E5E5E5] hover:bg-gray-50 transition">
                            <td className="px-6 py-4">
                              <p className="text-sm font-semibold text-[#1F1B16]">{project.name}</p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-[#504539]">{project.id}</p>
                            </td>
                            <td className="px-6 py-4">
                              <span className="px-3 py-1 rounded text-xs font-semibold bg-[#15803D] text-white inline-block">
                                {projectRoles[project.id] || "N/A"}
                              </span>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Navigation Buttons - Outside Container */}
            <div className="flex items-center justify-between mt-8">
              <button
                onClick={() => setCurrentStep(3)}
                className="px-6 py-2 text-gray-700 border border-gray-400 rounded-full hover:bg-gray-50 font-semibold"
              >
                Previous
              </button>
              <button
                onClick={async () => {
                  try {
                    // Fetch roles directly to get IDs for names
                    let roleList: any[] = [];
                    try {
                      const rolesData = await roleApi.list();
                      roleList = rolesData.roles || [];
                    } catch (e) {
                      console.error("Could not load roles", e);
                    }
                    
                    const allocations = Array.from(selectedProjects).map(projectId => {
                      const roleName = projectRoles[projectId];
                      let roleObj = roleList.find(r => r.name === roleName);
                      // If role not found, fallback to generic ID or 1
                      return {
                        project_id: parseInt(projectId),
                        role_id: roleObj ? roleObj.id : 1
                      };
                    });

                    await userApi.update(selectedUser!.id, {
                        username: selectedUser!.name,
                        project_allocations: allocations
                    });
                    navigate("/manage-user");
                  } catch (err) {
                    console.error("Failed to activate user assignments", err);
                    alert("Failed to activate user");
                  }
                }}
                className="px-6 py-2 bg-[#11172B] text-white rounded-full hover:opacity-90 transition font-semibold"
              >
                Activate User
              </button>
            </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AddUser;
