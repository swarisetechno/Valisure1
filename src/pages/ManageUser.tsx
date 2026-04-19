import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, LogOut, Moon, Sun, LayoutDashboard, FolderOpen, FileText, Lock, Search, MoreVertical, ChevronDown, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  status: string;
  createdDate: string;
  lastLoginDate?: string;
}

const ManageUser = () => {
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
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [disableDialogOpen, setDisableDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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
    // Add some mock data for demonstration with lastLoginDate
    const usersWithLoginData = storedUsers.map((user: any, index: number) => ({
      ...user,
      lastLoginDate:
        index % 2 === 0
          ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toLocaleString()
          : "Never",
    }));
    setUsers(usersWithLoginData);
  };

  const handleViewEdit = (user: User) => {
    navigate("/edit-user", { state: { user } });
    setOpenMenuId(null);
  };

  const handleDisableClick = (user: User) => {
    setSelectedUser(user);
    setDisableDialogOpen(true);
    setOpenMenuId(null);
  };

  const handleConfirmDisable = () => {
    if (selectedUser) {
      // Update user status to inactive
      const updatedUsers = users.map((u) =>
        u.id === selectedUser.id ? { ...u, status: "Inactive" } : u
      );
      setUsers(updatedUsers);
      localStorage.setItem("users", JSON.stringify(updatedUsers));
      setDisableDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const handleDeleteClick = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
    setOpenMenuId(null);
  };

  const handleConfirmDelete = () => {
    if (selectedUser) {
      // Delete user
      const updatedUsers = users.filter((u) => u.id !== selectedUser.id);
      setUsers(updatedUsers);
      localStorage.setItem("users", JSON.stringify(updatedUsers));
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  };

  const filteredUsers = users.filter((user) => {
    const matchesSearch =
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All Status" || user.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const totalPages = Math.ceil(filteredUsers.length / rowsPerPage);

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
            onClick={() => navigate("/admin")}
            className="flex items-center gap-2 text-[#1D2749] hover:opacity-70 transition mb-8 font-semibold"
          >
            <ChevronLeft size={20} />
            Back to Admin Dashboard
          </button>

          {/* Page Header with Title */}
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-[#1F1B16]">User Management</h1>
          </div>

          {/* Filter Section */}
          <div className="flex items-end gap-8 mb-8 bg-white rounded-lg p-6 border border-[#CFCBC8]">
            {/* Search Input */}
            <div className="flex-1">
              <label className="block text-sm font-semibold text-[#504539] mb-2">
                Search by name or email
              </label>
              <input
                type="text"
                placeholder="Enter name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-5 py-3 bg-[#DAE0F1] rounded-lg text-gray-700 outline-none text-sm"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-semibold text-[#504539] mb-2">
                Filter by status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-5 py-3 bg-[#DAE0F1] rounded-lg text-gray-700 text-sm font-medium focus:outline-none w-64"
              >
                <option value="All Status">All Status</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-lg border border-[#CFCBC8] relative z-0">
            {/* Table Header */}
            <div className="grid grid-cols-5 gap-8 px-8 py-4 bg-white border-b border-[#A9A4A0]">
              <div className="text-xs font-semibold text-[#504539] uppercase tracking-wider">Name</div>
              <div className="text-xs font-semibold text-[#3C3A39] uppercase tracking-wider">Email</div>
              <div className="text-xs font-semibold text-[#3C3A39] uppercase tracking-wider">Status</div>
              <div className="text-xs font-semibold text-[#3C3A39] uppercase tracking-wider">Last logged in</div>
              <div className="text-xs font-semibold text-[#3C3A39] uppercase tracking-wider text-right">Actions</div>
            </div>

            {/* Table Rows */}
            {paginatedUsers.length > 0 ? (
              <div className="divide-y divide-gray-200 overflow-visible relative">
                {paginatedUsers.map((user) => (
                  <div
                    key={user.id}
                    className="grid grid-cols-5 gap-8 px-8 py-4 items-center hover:bg-gray-50 transition"
                  >
                    <div className="text-sm text-[#1F1B16]">{user.name}</div>

                    <div className="text-sm text-[#504539]">{user.email}</div>

                    <div>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          user.status === "Active"
                            ? "bg-[#15803D] text-white"
                            : "bg-[#837F7C] text-white"
                        }`}
                      >
                        {user.status}
                      </span>
                    </div>

                    <div className="text-sm text-[#504539]">
                      {user.lastLoginDate || "Never"}
                    </div>

                    <div className="flex items-center justify-end relative z-50 overflow-visible">
                      <button
                        onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)}
                        className="p-2 hover:bg-gray-100 rounded transition"
                        title="More actions"
                      >
                        <MoreVertical size={20} className="text-[#504539]" />
                      </button>

                      {/* Dropdown Menu */}
                      {openMenuId === user.id && (
                        <div className="absolute right-0 top-full mt-2 bg-white border border-[#CFCBC8] rounded-lg shadow-lg z-50 min-w-max">
                          <button
                            onClick={() => handleViewEdit(user)}
                            className="flex items-center w-full px-4 py-2 text-left text-sm text-[#504539] hover:bg-[#DAE0F1] transition border-b border-[#CFCBC8]"
                          >
                            View/edit
                          </button>
                          <button
                            onClick={() => handleDisableClick(user)}
                            className="flex items-center w-full px-4 py-2 text-left text-sm text-[#504539] hover:bg-[#DAE0F1] transition border-b border-[#CFCBC8]"
                          >
                            Disable User
                          </button>
                          <button
                            onClick={() => handleDeleteClick(user)}
                            className="flex items-center w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition gap-2"
                          >
                            <Trash2 size={16} />
                            Delete User
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="px-8 py-12 text-center">
                <p className="text-gray-500 text-sm">No users found.</p>
              </div>
            )}

            {/* Table Footer with Pagination */}
            {filteredUsers.length > 0 && (
              <div className="flex items-center justify-between px-8 py-4 bg-white border-t border-[#CFCBC8]">
                <p className="text-xs font-semibold text-[#504539]">
                  Showing {filteredUsers.length} of {users.length} users
                </p>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="p-1 border border-[#D4C4B3] rounded hover:bg-gray-100 disabled:opacity-50 transition"
                  >
                    <ChevronLeft size={16} className="text-[#1F1B16]" />
                  </button>
                  <span className="text-xs font-semibold text-[#1F1B16]">
                    {currentPage} / {totalPages || 1}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1 border border-[#D4C4B3] rounded hover:bg-gray-100 disabled:opacity-50 transition"
                  >
                    <ChevronRight size={16} className="text-[#1F1B16]" />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Delete User Confirmation Dialog */}
          {deleteDialogOpen && selectedUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
                <h2 className="text-lg font-semibold text-[#1D1C1B] mb-3">Delete User?</h2>
                <p className="text-sm text-[#504539] mb-6">
                  Are you sure you want to delete {selectedUser.name}? This action cannot be undone.
                </p>
                <div className="flex items-center gap-3 justify-end">
                  <button
                    onClick={() => {
                      setDeleteDialogOpen(false);
                      setSelectedUser(null);
                    }}
                    className="px-6 py-2 border border-[#B6C0E2] rounded-lg text-[#504539] hover:bg-gray-100 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Disable User Confirmation Dialog */}
          {disableDialogOpen && selectedUser && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
                <h2 className="text-lg font-semibold text-[#1D1C1B] mb-3">Disable User?</h2>
                <p className="text-sm text-[#504539] mb-6">
                  Are you sure you want to disable access for {selectedUser.name}?
                </p>
                <div className="flex items-center gap-3 justify-end">
                  <button
                    onClick={() => {
                      setDisableDialogOpen(false);
                      setSelectedUser(null);
                    }}
                    className="px-6 py-2 border border-[#B6C0E2] rounded-lg text-[#504539] hover:bg-gray-100 transition font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleConfirmDisable}
                    className="px-6 py-2 bg-[#1D2749] text-white rounded-lg hover:bg-[#2a3a5a] transition font-medium"
                  >
                    Confirm
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

export default ManageUser;
