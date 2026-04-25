import { useState } from "react";
import { ChevronLeft, ChevronRight, LogOut, Menu, Moon, Sun, LayoutDashboard, FolderOpen, FileText, Lock, Palette, Search, ChevronDown, User } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CreateUser = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [expandedMenu, setExpandedMenu] = useState({
    projects: false,
    templates: false,
    accessControl: true,
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    department: "",
    title: "",
    status: "Active",
  });

  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    navigate("/");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validation
    if (
      !formData.name ||
      !formData.email ||
      !formData.password ||
      !formData.phone ||
      !formData.department ||
      !formData.title
    ) {
      setErrorMessage("All fields are required");
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setErrorMessage("Invalid email format");
      return;
    }

    // Password validation (at least 6 characters)
    if (formData.password.length < 6) {
      setErrorMessage("Password must be at least 6 characters");
      return;
    }

    // Get existing users from localStorage
    const existingUsers = JSON.parse(localStorage.getItem("users") || "[]");

    // Check if email already exists
    if (existingUsers.some((user: any) => user.email === formData.email)) {
      setErrorMessage("User with this email already exists");
      return;
    }

    // Generate sequential ID
    const nextId = existingUsers.length > 0 
      ? Math.max(...existingUsers.map((u: any) => u.id)) + 1 
      : 1;

    // Create new user
    const newUser = {
      id: nextId,
      ...formData,
      createdDate: new Date().toLocaleString(),
    };

    // Save to localStorage
    const updatedUsers = [...existingUsers, newUser];
    localStorage.setItem("users", JSON.stringify(updatedUsers));

    setSuccessMessage("User created successfully!");
    setErrorMessage("");

    // Reset form
    setFormData({
      name: "",
      email: "",
      password: "",
      phone: "",
      department: "",
      title: "",
      status: "Active",
    });

    // Redirect to Manage User page after 2 seconds
    setTimeout(() => {
      navigate("/manage-user");
    }, 2000);
  };

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
                className="text-sm text-gray-300 hover:text-white text-left transition font-semibold"
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
            Back to Manage User
          </button>

          {/* Form Container */}
          <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 border border-[#3A4E92]">
            <h1 className="text-4xl font-bold text-[#1F1B16] mb-8">Create User</h1>

            {/* Success Message */}
            {successMessage && (
              <div className="mb-6 p-4 bg-green-100 border border-green-400 rounded-lg text-green-800">
                {successMessage}
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 rounded-lg text-red-800">
                {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Field */}
              <div>
                <label className="block text-sm font-semibold text-[#504539] mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Enter full name"
                  className="w-full px-4 py-2 border border-[#B6C0E2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6D81C5] text-gray-700"
                />
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-[#504539] mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter email address"
                  className="w-full px-4 py-2 border border-[#B6C0E2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6D81C5] text-gray-700"
                />
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-[#504539] mb-2">
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  placeholder="Enter password (min 6 characters)"
                  className="w-full px-4 py-2 border border-[#B6C0E2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6D81C5] text-gray-700"
                />
              </div>

              {/* Phone Field */}
              <div>
                <label className="block text-sm font-semibold text-[#504539] mb-2">
                  Phone <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Enter phone number"
                  className="w-full px-4 py-2 border border-[#B6C0E2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6D81C5] text-gray-700"
                />
              </div>

              {/* Department Field */}
              <div>
                <label className="block text-sm font-semibold text-[#504539] mb-2">
                  Department <span className="text-red-500">*</span>
                </label>
                <select
                  name="department"
                  value={formData.department}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-[#B6C0E2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6D81C5] text-gray-700"
                >
                  <option value="">Select Department</option>
                  <option value="Quality Assurance">Quality Assurance</option>
                  <option value="Regulatory Affairs">Regulatory Affairs</option>
                  <option value="IT">IT</option>
                  <option value="Operations">Operations</option>
                  <option value="Management">Management</option>
                </select>
              </div>

              {/* Title Field */}
              <div>
                <label className="block text-sm font-semibold text-[#504539] mb-2">
                  Title <span className="text-red-500">*</span>
                </label>
                <select
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-[#B6C0E2] rounded-lg focus:outline-none focus:ring-2 focus:ring-[#6D81C5] text-gray-700"
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

              {/* Status Field */}
              <div>
                <label className="block text-sm font-semibold text-[#504539] mb-2">
                  Status <span className="text-red-500">*</span>
                </label>
                <div className="flex gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="Active"
                      checked={formData.status === "Active"}
                      onChange={handleInputChange}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">Active</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="status"
                      value="Inactive"
                      checked={formData.status === "Inactive"}
                      onChange={handleInputChange}
                      className="w-4 h-4"
                    />
                    <span className="text-sm text-gray-700">Inactive</span>
                  </label>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex gap-4 pt-6">
                <button
                  type="submit"
                  className="flex-1 px-8 py-3 bg-[#11172B] text-white rounded-lg font-semibold hover:opacity-90 transition"
                >
                  Create User
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/manage-user")}
                  className="flex-1 px-8 py-3 bg-gray-300 text-gray-700 rounded-lg font-semibold hover:opacity-90 transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CreateUser;
