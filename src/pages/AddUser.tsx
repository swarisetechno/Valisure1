import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, LogOut, Moon, Sun, LayoutDashboard, FolderOpen, FileText, Lock, Search, Trash2, Edit2, ChevronDown, Briefcase, CheckCircle2, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

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
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [deleteMessage, setDeleteMessage] = useState("");
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  useEffect(() => {
    loadUsers();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    navigate("/");
  };

  const loadUsers = () => {
    const storedUsers = JSON.parse(localStorage.getItem("users") || "[]");
    setUsers(storedUsers);
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this user?")) {
      const updatedUsers = users.filter((user) => user.id !== id);
      localStorage.setItem("users", JSON.stringify(updatedUsers));
      setUsers(updatedUsers);
      setDeleteMessage("User deleted successfully!");
      setTimeout(() => setDeleteMessage(""), 3000);
    }
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
            Back
          </button>

          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-[#1F1B16] mb-2">Add User</h1>
            <p className="text-gray-600">Activate a user from your identity provider</p>
          </div>

          {/* Step Indicator */}
          <div className="flex items-center justify-center gap-8 mb-12">
            {/* Step 1: Select User */}
            <div className="flex flex-col items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
                currentStep >= 1 ? "bg-[#6D81C5] text-white" : "bg-gray-200 text-gray-500"
              }`}>
                <Users size={24} />
              </div>
              <span className={`text-sm font-semibold ${currentStep >= 1 ? "text-[#1F1B16]" : "text-gray-500"}`}>
                Select User
              </span>
            </div>

            {/* Connector Line 1 */}
            <div className={`w-16 h-1 rounded transition ${
              currentStep >= 2 ? "bg-[#6D81C5]" : "bg-gray-200"
            }`}></div>

            {/* Step 2: Choose Projects */}
            <div className="flex flex-col items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
                currentStep >= 2 ? "bg-[#6D81C5] text-white" : "bg-gray-200 text-gray-500"
              }`}>
                <Briefcase size={24} />
              </div>
              <span className={`text-sm font-semibold ${currentStep >= 2 ? "text-[#1F1B16]" : "text-gray-500"}`}>
                Choose Projects
              </span>
            </div>

            {/* Connector Line 2 */}
            <div className={`w-16 h-1 rounded transition ${
              currentStep >= 3 ? "bg-[#6D81C5]" : "bg-gray-200"
            }`}></div>

            {/* Step 3: Assign Roles */}
            <div className="flex flex-col items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
                currentStep >= 3 ? "bg-[#6D81C5] text-white" : "bg-gray-200 text-gray-500"
              }`}>
                <Lock size={24} />
              </div>
              <span className={`text-sm font-semibold ${currentStep >= 3 ? "text-[#1F1B16]" : "text-gray-500"}`}>
                Assign Roles
              </span>
            </div>

            {/* Connector Line 3 */}
            <div className={`w-16 h-1 rounded transition ${
              currentStep >= 4 ? "bg-[#6D81C5]" : "bg-gray-200"
            }`}></div>

            {/* Step 4: Review & Activate */}
            <div className="flex flex-col items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center transition ${
                currentStep >= 4 ? "bg-[#6D81C5] text-white" : "bg-gray-200 text-gray-500"
              }`}>
                <CheckCircle2 size={24} />
              </div>
              <span className={`text-sm font-semibold ${currentStep >= 4 ? "text-[#1F1B16]" : "text-gray-500"}`}>
                Review & Activate
              </span>
            </div>
          </div>

          {/* Step 1: Select User */}
          {currentStep === 1 && (
            <div>
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-[#1F1B16] mb-2">Select User from Identity Provider</h2>
                <p className="text-gray-600 text-sm">Search and select a user from your organization's identity provider</p>
              </div>

              {/* Search and Filters */}
              <div className="bg-white rounded-lg p-6 mb-6 border border-[#E5E5E5]">
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
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-4 py-3 bg-[#DAE0F1] rounded-lg text-gray-700 text-sm font-medium focus:outline-none w-48"
                  >
                    <option value="All Status">All Status</option>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                  </select>

                  {/* Department Filter */}
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="px-4 py-3 bg-[#DAE0F1] rounded-lg text-gray-700 text-sm font-medium focus:outline-none w-48"
                  >
                    <option value="All Departments">All Departments</option>
                    <option value="Quality Assurance">Quality Assurance</option>
                    <option value="Regulatory Affairs">Regulatory Affairs</option>
                    <option value="IT">IT</option>
                    <option value="Operations">Operations</option>
                    <option value="Management">Management</option>
                  </select>
                </div>
              </div>

              {/* Users Table */}
              <div className="bg-white rounded-lg overflow-hidden border border-[#CFCBC8]">
                {/* Table Headers */}
                <div className="grid grid-cols-5 gap-8 px-8 py-4 bg-gray-50 border-b border-[#CFCBC8]">
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
                        onClick={() => setSelectedUser(user)}
                        className={`grid grid-cols-5 gap-8 px-8 py-4 items-center cursor-pointer transition ${
                          selectedUser?.id === user.id
                            ? "bg-[#DAE0F1]"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        <div>
                          <p className="text-sm font-semibold text-[#1F1B16]">{user.name}</p>
                          <p className="text-xs text-gray-500">Not yet activated · Will be created on activation</p>
                        </div>
                        <div className="text-sm text-[#504539]">{user.email}</div>
                        <div className="text-sm text-[#504539]">{user.department}</div>
                        <div className="text-sm text-[#504539]">{user.title}</div>
                        <div>
                          <span className={`px-3 py-1 rounded text-xs font-semibold ${
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

              {/* Navigation Buttons */}
              <div className="flex items-center justify-between mt-8">
                <button
                  onClick={() => navigate("/manage-user")}
                  className="flex items-center gap-2 px-6 py-3 border border-[#A9A4A0] rounded-lg text-[#1D2749] hover:bg-gray-100 transition font-medium"
                >
                  <ChevronLeft size={18} />
                  Back
                </button>
                <button
                  onClick={() => selectedUser && setCurrentStep(2)}
                  disabled={!selectedUser}
                  className={`flex items-center gap-2 px-8 py-3 rounded-lg text-white transition font-medium ${
                    selectedUser
                      ? "bg-[#6D81C5] hover:bg-[#5a6fb3]"
                      : "bg-gray-300 cursor-not-allowed"
                  }`}
                >
                  Next
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Step 2: Choose Projects (Placeholder) */}
          {currentStep === 2 && (
            <div className="text-center py-12">
              <p className="text-gray-600">Choose Projects - Coming Soon</p>
              <div className="flex items-center justify-between mt-8">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex items-center gap-2 px-6 py-3 border border-[#A9A4A0] rounded-lg text-[#1D2749] hover:bg-gray-100 transition font-medium"
                >
                  <ChevronLeft size={18} />
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="flex items-center gap-2 px-8 py-3 bg-[#6D81C5] text-white rounded-lg hover:bg-[#5a6fb3] transition font-medium"
                >
                  Next
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Assign Roles (Placeholder) */}
          {currentStep === 3 && (
            <div className="text-center py-12">
              <p className="text-gray-600">Assign Roles - Coming Soon</p>
              <div className="flex items-center justify-between mt-8">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="flex items-center gap-2 px-6 py-3 border border-[#A9A4A0] rounded-lg text-[#1D2749] hover:bg-gray-100 transition font-medium"
                >
                  <ChevronLeft size={18} />
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(4)}
                  className="flex items-center gap-2 px-8 py-3 bg-[#6D81C5] text-white rounded-lg hover:bg-[#5a6fb3] transition font-medium"
                >
                  Next
                  <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* Step 4: Review & Activate (Placeholder) */}
          {currentStep === 4 && (
            <div className="text-center py-12">
              <p className="text-gray-600">Review & Activate - Coming Soon</p>
              <div className="flex items-center justify-between mt-8">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="flex items-center gap-2 px-6 py-3 border border-[#A9A4A0] rounded-lg text-[#1D2749] hover:bg-gray-100 transition font-medium"
                >
                  <ChevronLeft size={18} />
                  Back
                </button>
                <button
                  onClick={() => navigate("/manage-user")}
                  className="flex items-center gap-2 px-8 py-3 bg-[#15803D] text-white rounded-lg hover:bg-[#0f6928] transition font-medium"
                >
                  Activate
                  <CheckCircle2 size={18} />
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
