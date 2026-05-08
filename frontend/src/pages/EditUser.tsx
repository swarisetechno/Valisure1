import { useState, useEffect } from "react";
import { ChevronLeft, LogOut, Moon, Sun, LayoutDashboard, Search, ChevronDown, Edit2, ChevronRight, Lock, FolderOpen, FileText, MoreVertical } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { userApi } from "@/services/api";

interface AssignedProject {
  project_id: number;
  project_name: string;
  role_id: number;
  role_name: string;
}

interface User {
  id: number;
  name: string;
  email: string;
  status: string;
  createdDate: string;
  phone?: string;
  department?: string;
  title?: string;
  manager?: string;
  lastLoginDate?: string;
  role_id?: number;
  role_name?: string;
  project_allocations?: AssignedProject[];
}

const EditUser = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [expandedMenu, setExpandedMenu] = useState({
    projects: false,
    templates: false,
    accessControl: true,
  });
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<User | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [selectedUserForDisable, setSelectedUserForDisable] = useState<User | null>(null);
  const [projects, setProjects] = useState<AssignedProject[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("All Roles");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [currentProjectPage, setCurrentProjectPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [globalRoles, setGlobalRoles] = useState<any[]>([]);

  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const { roleApi } = await import("@/services/api");
        const data = await roleApi.list();
        setGlobalRoles(data.roles || []);
      } catch (err) {
        console.error("Failed to fetch roles", err);
      }
    };
    fetchRoles();
  }, []);


  useEffect(() => {
    const userData = (location.state as any)?.user;
    if (userData) {
      setUser(userData);
      setFormData(userData);
      // Load assigned project allocations from the user state
      if (userData.project_allocations && userData.project_allocations.length > 0) {
        setProjects(userData.project_allocations);
      }
    }
  }, [location]);

  const handleLogout = async () => {
    try {
      const { authApi } = await import("@/services/api");
      await authApi.logout().catch(() => {});
    } catch {}
    import("@/services/api").then(({ clearAuthSession }) => clearAuthSession());
    navigate("/");
  };

  const handleSave = async () => {
    if (formData) {
      try {
        await userApi.update(formData.id, {
          username: formData.name,
          email: formData.email,
          phone: formData.phone,
          department: formData.department,
          title: formData.title,
          status: formData.status,
          role_id: formData.role_id,
        });
        setIsEditing(false);
        setUser(formData); // Update local active state
      } catch (err: any) {
        alert(err.message || "Failed to update user");
      }
    }
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleDisableClick = () => {
    setSelectedUserForDisable(formData);
    setDisableDialogOpen(true);
  };

  const handleConfirmDisable = async () => {
    if (selectedUserForDisable) {
      try {
        await userApi.update(selectedUserForDisable.id, {
          username: selectedUserForDisable.name,
          status: "Inactive",
        });
        setDisableDialogOpen(false);
        navigate("/manage-user");
      } catch (err: any) {
        alert(err.message || "Failed to disable user");
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCancel = () => {
    if (isEditing) {
      setIsEditing(false);
      setFormData(user);
    } else {
      navigate("/manage-user");
    }
  };

  if (!formData) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

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
                className="text-sm text-gray-300 hover:text-white text-left transition font-semibold"
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
          {/* Back Button */}
          <button
            onClick={() => navigate("/manage-user")}
            className="flex items-center gap-2 text-[#1D2749] hover:opacity-70 transition mb-8 font-semibold"
          >
            <ChevronLeft size={20} />
            Back to Manage User
          </button>

          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-2 mb-8 text-sm">
            <span className="text-[#504539]">Access control</span>
            <span className="text-[#504539]">/</span>
            <span className="text-[#504539]">Manage user</span>
            <span className="text-[#504539]">/</span>
            <span className="text-[#504539]">Users</span>
            <span className="text-[#504539]">/</span>
            <span className="text-[#1F1B16] font-semibold">{formData.name}</span>
          </div>

          {/* User Header with Name, Email and Status */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-[#3C3A39] mb-2">{formData.name}</h1>
              <div className="flex items-center gap-5">
                <span className="text-sm text-[#5E5C59]">{formData.email}</span>
                <span className={`px-3 py-1 rounded text-xs font-semibold ${
                  formData.status === "Active"
                    ? "bg-[#15803D] text-white"
                    : "bg-[#837F7C] text-white"
                }`}>
                  {formData.status}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="px-6 py-2 bg-[#1D2749] text-white border border-[#2B3B6E] rounded-full hover:bg-[#2a3a5a] transition font-medium text-sm"
                  >
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="px-6 py-2 border border-[#A9A4A0] rounded-full text-[#281A04] hover:bg-gray-100 transition font-medium text-sm"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleEditClick}
                    className="flex items-center gap-2 px-6 py-2 bg-[#1D2749] text-white border border-[#2B3B6E] rounded-full hover:bg-[#2a3a5a] transition font-medium text-sm"
                  >
                    <Edit2 size={16} />
                    Edit user
                  </button>
                  <button
                    onClick={handleDisableClick}
                    className="px-6 py-2 border border-[#A9A4A0] rounded-full text-[#281A04] hover:bg-gray-100 transition font-medium text-sm"
                  >
                    Disable user
                  </button>
                </>
              )}
            </div>
          </div>

          {/* User Details Section */}
          <div className="bg-white rounded-lg p-6 mb-8">
            <h3 className="text-sm font-semibold text-[#1D1C1B] mb-8">User Details</h3>
            
            {isEditing ? (
              /* Edit Mode - Form Fields */
              <div className="grid grid-cols-2 gap-16">
                {/* Left Column */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#5E5C59] mb-2">User ID</label>
                    <input
                      type="text"
                      value={formData?.id || ""}
                      disabled
                      className="w-full px-4 py-2 border border-[#B6C0E2] rounded-lg bg-gray-100 text-gray-600 cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#5E5C59] mb-2">Email ID</label>
                    <input
                      type="email"
                      name="email"
                      value={formData?.email || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-[#B6C0E2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6D81C5]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#5E5C59] mb-2">Phone</label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData?.phone || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-[#B6C0E2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6D81C5]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#5E5C59] mb-2">Department</label>
                    <select
                      name="department"
                      value={formData?.department || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-[#B6C0E2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6D81C5]"
                    >
                      <option value="">Select Department</option>
                      <option value="Quality Assurance">Quality Assurance</option>
                      <option value="Regulatory Affairs">Regulatory Affairs</option>
                      <option value="IT">IT</option>
                      <option value="Operations">Operations</option>
                      <option value="Management">Management</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#5E5C59] mb-2">System Role</label>
                    <select
                      name="role_id"
                      value={formData?.role_id || ""}
                      onChange={(e) => setFormData(prev => ({ ...prev!, role_id: e.target.value ? Number(e.target.value) : undefined }))}
                      className="w-full px-4 py-2 border border-[#B6C0E2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6D81C5]"
                    >
                      <option value="">No Global Role</option>
                      {globalRoles.map(r => (
                        <option key={r.id} value={r.id}>{r.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-[#5E5C59] mb-2">Name</label>
                    <input
                      type="text"
                      name="name"
                      value={formData?.name || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-[#B6C0E2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6D81C5]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#5E5C59] mb-2">Title</label>
                    <select
                      name="title"
                      value={formData?.title || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-[#B6C0E2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6D81C5]"
                    >
                      <option value="">Select Title</option>
                      <option value="QA Lead">QA Lead</option>
                      <option value="QA Manager">QA Manager</option>
                      <option value="Compliance Specialist">Compliance Specialist</option>
                      <option value="Senior Validator">Senior Validator</option>
                      <option value="System Administrator">System Administrator</option>
                      <option value="Analyst">Analyst</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#5E5C59] mb-2">Manager</label>
                    <input
                      type="text"
                      name="manager"
                      value={formData?.manager || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-[#B6C0E2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6D81C5]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#5E5C59] mb-2">Account Status</label>
                    <select
                      name="status"
                      value={formData?.status || ""}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-[#B6C0E2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6D81C5]"
                    >
                      <option value="Active">Active</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>
            ) : (
              /* View Mode - Text Display */
              <div className="grid grid-cols-2 gap-16">
                {/* Left Column */}
                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-semibold text-[#5E5C59] mb-1">User ID</p>
                    <p className="text-sm text-[#1F1B16]">{formData?.id}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#5E5C59] mb-1">Email ID</p>
                    <p className="text-sm text-[#1F1B16]">{formData?.email || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#5E5C59] mb-1">Phone</p>
                    <p className="text-sm text-[#1F1B16]">{formData?.phone || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#5E5C59] mb-1">Department</p>
                    <p className="text-sm text-[#1F1B16]">{formData?.department || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#5E5C59] mb-1">System Role</p>
                    <p className="text-sm text-[#1F1B16]">
                      {globalRoles.find(r => r.id === formData?.role_id)?.name || formData?.role_name || "No Global Role"}
                    </p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div>
                    <p className="text-xs font-semibold text-[#5E5C59] mb-1">Title</p>
                    <p className="text-sm text-[#1F1B16]">{formData?.title || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#5E5C59] mb-1">Manager</p>
                    <p className="text-sm text-[#1F1B16]">{formData?.manager || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#5E5C59] mb-1">Last Logged in</p>
                    <p className="text-sm text-[#1F1B16]">{formData?.lastLoginDate || "Never"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-[#5E5C59] mb-1">Account Status</p>
                    <p className="text-sm text-[#1F1B16]">{formData?.status}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Assigned Projects Section */}
          <div>
            <h3 className="text-sm font-semibold text-[#1D1C1B] mb-6">Assigned Projects</h3>
            
            {/* Search and Filters */}
            <div className="bg-white rounded-lg p-6 mb-6 border border-[#E5E5E5]">
              <div className="flex items-center gap-4">
                {/* Search Bar */}
                <div className="flex-1 flex items-center gap-2 bg-[#F5F5F5] rounded-full px-4 py-2 border border-[#E0E0E0]">
                  <Search size={18} className="text-[#A9A4A0]" />
                  <input
                    type="text"
                    placeholder="Search by project name/ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="flex-1 bg-transparent text-sm text-[#504539] placeholder-[#A9A4A0] outline-none"
                  />
                </div>

                {/* Role Filter */}
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="px-4 py-2 border border-[#D4C4B3] rounded-lg bg-white text-sm text-[#504539] font-medium cursor-pointer"
                >
                  <option>All Roles</option>
                  <option>Admin</option>
                  <option>Reviewer-Approver</option>
                  <option>Editor</option>
                  <option>Viewer</option>
                </select>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-[#D4C4B3] rounded-lg bg-white text-sm text-[#504539] font-medium cursor-pointer"
                >
                  <option>All Status</option>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
            </div>

            {/* Projects Table */}
            <div className="bg-white rounded-lg border border-[#CFCBC8] overflow-hidden">
              {/* Table Header */}
              <div className="grid grid-cols-5 gap-8 px-8 py-4 bg-[#F9F9F9] border-b border-[#CFCBC8]">
                <div className="text-xs font-semibold text-[#504539] uppercase tracking-wider">Project Name</div>
                <div className="text-xs font-semibold text-[#504539] uppercase tracking-wider">Role</div>
                <div className="text-xs font-semibold text-[#504539] uppercase tracking-wider">Status</div>
                <div className="text-xs font-semibold text-[#504539] uppercase tracking-wider">Last Access</div>
                <div className="text-xs font-semibold text-[#504539] uppercase tracking-wider text-center">Actions</div>
              </div>

              {/* Table Rows */}
              {projects.length > 0 ? (
                projects
                  .filter(p => {
                    const matchesSearch = !searchTerm ||
                      p.project_name.toLowerCase().includes(searchTerm.toLowerCase());
                    const matchesRole = roleFilter === "All Roles" || p.role_name === roleFilter;
                    return matchesSearch && matchesRole;
                  })
                  .map((project) => (
                  <div key={project.project_id} className="grid grid-cols-5 gap-8 px-8 py-5 border-b border-[#CFCBC8] hover:bg-gray-50 items-center">
                    <div>
                      <p className="text-sm font-medium text-[#3C3A39]">{project.project_name}</p>
                      <p className="text-xs text-[#A9A4A0]">ID: {project.project_id}</p>
                    </div>
                    <div>
                      <span className={`px-3 py-1 rounded text-xs font-semibold text-white ${
                        project.role_name?.toLowerCase().includes("admin")
                          ? "bg-[#6D81C5]"
                          : project.role_name?.toLowerCase().includes("approver")
                          ? "bg-[#FAC277] text-gray-800"
                          : project.role_name?.toLowerCase().includes("author")
                          ? "bg-[#30628A]"
                          : "bg-[#91A1D4]"
                      }`}>
                        {project.role_name || "N/A"}
                      </span>
                    </div>
                    <div>
                      <span className="px-3 py-1 rounded text-xs font-semibold text-white bg-[#15803D]">
                        Active
                      </span>
                    </div>
                    <div className="text-sm text-[#504539]">—</div>
                    <div className="flex justify-center">
                      <button className="p-1 rounded hover:bg-gray-200 transition">
                        <MoreVertical size={18} className="text-[#504539]" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="px-8 py-8 text-center border-t border-[#CFCBC8]">
                  <p className="text-sm text-gray-500">No projects assigned to this user</p>
                </div>
              )}

              {/* Table Footer */}
              <div className="flex items-center justify-between px-8 py-3 bg-[#F9F9F9] border-t border-[#CFCBC8] text-xs text-[#504539] font-semibold">
                <span>Rows per page: 10</span>
                <div className="flex items-center gap-2">
                  <button className="p-1 border border-[#D4C4B3] rounded hover:bg-gray-100 disabled:opacity-50">
                    <ChevronLeft size={14} />
                  </button>
                  <span>1</span>
                  <button className="p-1 border border-[#D4C4B3] rounded hover:bg-gray-100 disabled:opacity-50">
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Disable User Confirmation Dialog */}
          {disableDialogOpen && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-8 max-w-sm mx-4 shadow-lg">
                <h2 className="text-lg font-semibold text-[#1F1B16] mb-2">Disable User?</h2>
                <p className="text-sm text-[#504539] mb-6">
                  Are you sure you want to disable {selectedUserForDisable?.name}? They will not be able to access the system.
                </p>
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={() => setDisableDialogOpen(false)}
                    className="px-6 py-2 border border-[#A9A4A0] rounded-lg text-[#281A04] hover:bg-gray-100 transition font-medium text-sm"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDisable}
                    className="px-6 py-2 bg-[#1D2749] text-white border border-[#2B3B6E] rounded-lg hover:bg-[#2a3a5a] transition font-medium text-sm"
                  >
                    Disable
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default EditUser;
