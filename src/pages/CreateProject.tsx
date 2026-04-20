import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LogOut, Menu, ChevronLeft, ChevronRight, LayoutDashboard, FolderOpen, FileText, Lock, Palette, Search, Moon, Sun, ChevronDown, LayoutGrid, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CreateProject = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [expandedMenu, setExpandedMenu] = useState({
    projects: true,
    templates: false,
    accessControl: false,
  });
  
  const [expandedMethodology, setExpandedMethodology] = useState(true);
  const [methodologyDropdownOpen, setMethodologyDropdownOpen] = useState(false);
  const [methodologySearch, setMethodologySearch] = useState("");

  // Step 2 - Select Users State
  const [userSearch, setUserSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [departmentFilter, setDepartmentFilter] = useState("All Departments");
  const [selectedUsers, setSelectedUsers] = useState(new Set());

  // Step 3 - Assign Roles State
  const [userRoles, setUserRoles] = useState<{ [key: number]: string }>({});
  const [userActions, setUserActions] = useState<{ [key: number]: { [key: string]: boolean } }>({});
  const [roleDropdownOpen, setRoleDropdownOpen] = useState<{ [key: number]: boolean }>({});

  // Fetch users from localStorage
  const getAllUsers = () => {
    try {
      const users = JSON.parse(localStorage.getItem("users") || "[]");
      return users;
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  };

  const allUsers = getAllUsers();

  // Filter users based on search and filters
  const getFilteredUsers = (): any[] => {
    let filtered = allUsers;

    // Search filter
    if (userSearch) {
      filtered = filtered.filter(
        (user: any) =>
          user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
          user.email.toLowerCase().includes(userSearch.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== "All Status") {
      filtered = filtered.filter((user: any) => user.status === statusFilter);
    }

    // Department filter
    if (departmentFilter !== "All Departments") {
      filtered = filtered.filter((user: any) => user.department === departmentFilter);
    }

    return filtered;
  };

  // Get unique departments
  const getDepartments = (): string[] => {
    const depts = allUsers
      .filter((u: any) => u.department && typeof u.department === "string")
      .map((u: any) => u.department as string);
    const uniqueDepts = [...new Set(depts)] as string[];
    return ["All Departments", ...uniqueDepts.sort()];
  };

  // Toggle user selection
  const toggleUserSelection = (userId: number) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  // Form state
  const [formData, setFormData] = useState({
    projectId: "PRJ-2024-0812",
    changeNumber: "",
    systemApplicationName: "",
    selectedMethodologies: {
      csv: false,
      csa: false,
    },
    description: "Briefly describe the business purpose and functions of the system...",
    gampCategories: {
      category1: false,
      category2: false,
      category3: false,
      category4: false,
    },
    regulations: {
      cfr211: false,
      cfr820: false,
      annexure11: false,
      iso13485: false,
      crf210: false,
      crf211_2: false,
    },
    csvDeliverables: {
      urs: false,
      gap: false,
      crf: false,
      srs: false,
      valPlan: false,
      frs: false,
      fra: false,
      ds: false,
      iq: false,
      oq: false,
      pq: false,
      rtm: false,
      vsr: false,
    },
    csaDeliverables: {
      ubs: false,
      urra: false,
      gap: false,
      crf: false,
      srs: false,
      valPlan: false,
      frs: false,
      fra: false,
      ds: false,
      iqScripted: false,
      iqUnscripted: false,
      oqScripted: false,
      oqUnscripted: false,
      pqScripted: false,
      pqUnscripted: false,
      rtm: false,
      vsr: false,
    },
  });

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    navigate("/");
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCheckboxChange = (category, key) => {
    setFormData(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: !prev[category][key]
      }
    }));
  };

  const handleMethodologyChange = (methodType) => {
    setFormData(prev => ({
      ...prev,
      selectedMethodologies: {
        ...prev.selectedMethodologies,
        [methodType]: !prev.selectedMethodologies[methodType]
      }
    }));
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className={`min-h-screen ${darkMode ? "bg-[#DAE0F1]" : "bg-gray-100"}`}>
      {/* Sidebar */}
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
      <main 
        className="transition-all duration-300"
        style={{
          marginLeft: sidebarOpen ? "256px" : "96px",
        }}
      >
        {/* Top Header */}
        <header 
          className="bg-[#1D2749] text-white h-20 flex items-center justify-between px-5 lg:px-8 fixed top-0 right-0 z-30 transition-all duration-300"
          style={{
            left: sidebarOpen ? "256px" : "96px",
          }}
        >
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
          <div className="text-sm text-gray-600 mb-4">
            <span className="text-gray-500">Projects</span>
            <span className="mx-2">&gt;</span>
            <span className="font-semibold text-gray-700">New Project</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Create a New project</h1>
        </main>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-start justify-between px-8 mb-6">
            {[1, 2, 3, 4].map((step, index) => (
              <div key={step} className="flex flex-col items-center flex-1 relative">
                {/* Connecting Line */}
                {index < 3 && (
                  <div
                    className={`absolute top-6 left-1/2 w-full h-1.5 ${
                      step < currentStep ? "bg-[#2B3B6E]" : "bg-gray-300"
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
                    step <= currentStep
                      ? "bg-[#2B3B6E] text-white"
                      : "bg-gray-300 text-gray-600"
                  }`}
                >
                  {step}
                </div>
                
                {/* Label */}
                <span className="text-xs font-medium text-gray-600 mt-3 text-center">
                  {step === 1 && "Project details"}
                  {step === 2 && "Select Users"}
                  {step === 3 && "Assign Roles"}
                  {step === 4 && "Review & Activate"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Form Content */}
        {currentStep === 1 && (
          <div className="px-8 pb-12">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Project Details</h2>

              <div className="grid grid-cols-3 gap-6 mb-8">
                {/* Project ID */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-700 mb-2 tracking-wide">
                    Project ID
                  </label>
                  <input
                    type="text"
                    name="projectId"
                    value={formData.projectId}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#DAE0F1] rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B3B6E]"
                  />
                </div>

                {/* Change Number */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-700 mb-2 tracking-wide">
                    Change Number
                  </label>
                  <input
                    type="text"
                    name="changeNumber"
                    placeholder="e.g. CHG-452221"
                    value={formData.changeNumber}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#DAE0F1] rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B3B6E]"
                  />
                </div>

                {/* System/Application Name */}
                <div>
                  <label className="block text-xs font-semibold uppercase text-gray-700 mb-2 tracking-wide">
                    System/Application Name
                  </label>
                  <input
                    type="text"
                    name="systemApplicationName"
                    placeholder="Enter formal system name"
                    value={formData.systemApplicationName}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#DAE0F1] rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B3B6E]"
                  />
                </div>
              </div>

              {/* Methodology & Description - Two Column Layout */}
              <div className="flex gap-8 mb-8">
                {/* Methodology - Left Column */}
                <div className="flex-1">
                  <label className="block text-xs font-semibold uppercase text-gray-700 mb-2 tracking-wide">
                    Methodology
                  </label>
                  <div className="bg-[#DAE0F1] rounded-lg p-4">
                    {/* Methodology Dropdown */}
                    <div className="relative mb-4">
                      <button
                        onClick={() => setMethodologyDropdownOpen(!methodologyDropdownOpen)}
                        className="w-full px-4 py-3 bg-white rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B3B6E] text-left flex items-center justify-between"
                      >
                        <span className="text-sm font-medium text-gray-900">
                          {formData.selectedMethodologies.csv && formData.selectedMethodologies.csa
                            ? "2 selected"
                            : formData.selectedMethodologies.csv
                            ? "1 selected"
                            : formData.selectedMethodologies.csa
                            ? "2 selected"
                            : "Select methodologies"}
                        </span>
                        <ChevronDown size={18} className="text-gray-600" />
                      </button>

                      {/* Dropdown Menu */}
                      {methodologyDropdownOpen && (
                        <div className="absolute z-50 w-full mt-2 bg-white border border-gray-300 rounded-lg shadow-lg p-3">
                          {/* Search Input */}
                          <div className="flex items-center gap-2 mb-3 px-2 py-2 bg-gray-50 rounded">
                            <Search size={16} className="text-gray-400" />
                            <input
                              type="text"
                              placeholder="Search methodologies..."
                              value={methodologySearch}
                              onChange={(e) => setMethodologySearch(e.target.value.toLowerCase())}
                              className="flex-1 bg-transparent text-sm outline-none text-gray-700"
                            />
                          </div>

                          {/* Options */}
                          <div className="space-y-2">
                            {(methodologySearch === "" || "csv (computer system validation)".includes(methodologySearch)) && (
                              <label className="flex items-center gap-3 px-2 py-2 hover:bg-gray-50 rounded cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={formData.selectedMethodologies.csv}
                                  onChange={() => {
                                    handleMethodologyChange("csv");
                                  }}
                                  className="w-4 h-4 rounded border border-gray-400"
                                />
                                <span className="text-sm text-gray-900">CSV (Computer System Validation)</span>
                              </label>
                            )}
                            {(methodologySearch === "" || "csa (computer software assurance)".includes(methodologySearch)) && (
                              <label className="flex items-center gap-3 px-2 py-2 hover:bg-gray-50 rounded cursor-pointer">
                                <input
                                  type="checkbox"
                                  checked={formData.selectedMethodologies.csa}
                                  onChange={() => {
                                    handleMethodologyChange("csa");
                                  }}
                                  className="w-4 h-4 rounded border border-gray-400"
                                />
                                <span className="text-sm text-gray-900">CSA (Computer Software Assurance)</span>
                              </label>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Close dropdown when clicking outside */}
                      {methodologyDropdownOpen && (
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setMethodologyDropdownOpen(false)}
                        />
                      )}
                    </div>

                    {/* CSV Only - When only CSV is selected */}
                    {formData.selectedMethodologies.csv && !formData.selectedMethodologies.csa && (
                      <div className="mt-4 bg-white rounded-lg p-4 max-h-96 overflow-y-auto">
                        <h4 className="font-bold text-gray-900 mb-3">CSV Deliverables</h4>
                        <div className="space-y-3">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.csvDeliverables.urs} onChange={() => handleCheckboxChange("csvDeliverables", "urs")} className="w-4 h-4 rounded border border-gray-400" />
                            <span className="text-sm text-gray-700">URS – User Requirements Specification</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.csvDeliverables.gap} onChange={() => handleCheckboxChange("csvDeliverables", "gap")} className="w-4 h-4 rounded border border-gray-400" />
                            <span className="text-sm text-gray-700">GxP Assessment</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.csvDeliverables.crf} onChange={() => handleCheckboxChange("csvDeliverables", "crf")} className="w-4 h-4 rounded border border-gray-400" />
                            <span className="text-sm text-gray-700">CFR Part 11 (ERES) Assessment</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.csvDeliverables.srs} onChange={() => handleCheckboxChange("csvDeliverables", "srs")} className="w-4 h-4 rounded border border-gray-400" />
                            <span className="text-sm text-gray-700">SRS – System Risk Assessment</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.csvDeliverables.valPlan} onChange={() => handleCheckboxChange("csvDeliverables", "valPlan")} className="w-4 h-4 rounded border border-gray-400" />
                            <span className="text-sm text-gray-700">Validation Plan</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.csvDeliverables.frs} onChange={() => handleCheckboxChange("csvDeliverables", "frs")} className="w-4 h-4 rounded border border-gray-400" />
                            <span className="text-sm text-gray-700">FRS – Functional Requirement Specification</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.csvDeliverables.fra} onChange={() => handleCheckboxChange("csvDeliverables", "fra")} className="w-4 h-4 rounded border border-gray-400" />
                            <span className="text-sm text-gray-700">FRA – Functional Risk Assessment</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.csvDeliverables.ds} onChange={() => handleCheckboxChange("csvDeliverables", "ds")} className="w-4 h-4 rounded border border-gray-400" />
                            <span className="text-sm text-gray-700">DS – Design Specification</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.csvDeliverables.iq} onChange={() => handleCheckboxChange("csvDeliverables", "iq")} className="w-4 h-4 rounded border border-gray-400" />
                            <span className="text-sm text-gray-700">IQ Test Script</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.csvDeliverables.oq} onChange={() => handleCheckboxChange("csvDeliverables", "oq")} className="w-4 h-4 rounded border border-gray-400" />
                            <span className="text-sm text-gray-700">OQ Test Script</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.csvDeliverables.pq} onChange={() => handleCheckboxChange("csvDeliverables", "pq")} className="w-4 h-4 rounded border border-gray-400" />
                            <span className="text-sm text-gray-700">PQ Test Script</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.csvDeliverables.rtm} onChange={() => handleCheckboxChange("csvDeliverables", "rtm")} className="w-4 h-4 rounded border border-gray-400" />
                            <span className="text-sm text-gray-700">RTM – Requirement Traceability Matrix</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.csvDeliverables.vsr} onChange={() => handleCheckboxChange("csvDeliverables", "vsr")} className="w-4 h-4 rounded border border-gray-400" />
                            <span className="text-sm text-gray-700">Validation Summary Report</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* CSA Only - When only CSA is selected */}
                    {formData.selectedMethodologies.csa && !formData.selectedMethodologies.csv && (
                      <div className="mt-4 bg-white rounded-lg p-4 max-h-96 overflow-y-auto">
                        <h4 className="font-bold text-gray-900 mb-3">CSA Deliverables</h4>
                        <div className="space-y-3">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.csaDeliverables.ubs} onChange={() => handleCheckboxChange("csaDeliverables", "ubs")} className="w-4 h-4 rounded border border-gray-400" />
                            <span className="text-sm text-gray-700">URS - User Request Specification</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.csaDeliverables.urra} onChange={() => handleCheckboxChange("csaDeliverables", "urra")} className="w-4 h-4 rounded border border-gray-400" />
                            <span className="text-sm text-gray-700">URRA - User Requirement Risk Assessment</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.csaDeliverables.gap} onChange={() => handleCheckboxChange("csaDeliverables", "gap")} className="w-4 h-4 rounded border border-gray-400" />
                            <span className="text-sm text-gray-700">GxP Assessment</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.csaDeliverables.crf} onChange={() => handleCheckboxChange("csaDeliverables", "crf")} className="w-4 h-4 rounded border border-gray-400" />
                            <span className="text-sm text-gray-700">CFR Part 11 (ERES) Assessment</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.csaDeliverables.srs} onChange={() => handleCheckboxChange("csaDeliverables", "srs")} className="w-4 h-4 rounded border border-gray-400" />
                            <span className="text-sm text-gray-700">SRS - System Risk Assessment</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.csaDeliverables.valPlan} onChange={() => handleCheckboxChange("csaDeliverables", "valPlan")} className="w-4 h-4 rounded border border-gray-400" />
                            <span className="text-sm text-gray-700">Validation Plan</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.csaDeliverables.frs} onChange={() => handleCheckboxChange("csaDeliverables", "frs")} className="w-4 h-4 rounded border border-gray-400" />
                            <span className="text-sm text-gray-700">FRS - Functional Requirement Specification</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.csaDeliverables.fra} onChange={() => handleCheckboxChange("csaDeliverables", "fra")} className="w-4 h-4 rounded border border-gray-400" />
                            <span className="text-sm text-gray-700">FRA - Functional Risk Assessment</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.csaDeliverables.ds} onChange={() => handleCheckboxChange("csaDeliverables", "ds")} className="w-4 h-4 rounded border border-gray-400" />
                            <span className="text-sm text-gray-700">DS - Design Specification</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.csaDeliverables.iqScripted} onChange={() => handleCheckboxChange("csaDeliverables", "iqScripted")} className="w-4 h-4 rounded border border-gray-400" />
                            <span className="text-sm text-gray-700">IQ Scripted Test Script</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.csaDeliverables.iqUnscripted} onChange={() => handleCheckboxChange("csaDeliverables", "iqUnscripted")} className="w-4 h-4 rounded border border-gray-400" />
                            <span className="text-sm text-gray-700">IQ Unscripted Test Script</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.csaDeliverables.oqScripted} onChange={() => handleCheckboxChange("csaDeliverables", "oqScripted")} className="w-4 h-4 rounded border border-gray-400" />
                            <span className="text-sm text-gray-700">OQ Scripted Test Script</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.csaDeliverables.oqUnscripted} onChange={() => handleCheckboxChange("csaDeliverables", "oqUnscripted")} className="w-4 h-4 rounded border border-gray-400" />
                            <span className="text-sm text-gray-700">OQ Unscripted Test Script</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.csaDeliverables.pqScripted} onChange={() => handleCheckboxChange("csaDeliverables", "pqScripted")} className="w-4 h-4 rounded border border-gray-400" />
                            <span className="text-sm text-gray-700">PQ Scripted Test Script</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.csaDeliverables.pqUnscripted} onChange={() => handleCheckboxChange("csaDeliverables", "pqUnscripted")} className="w-4 h-4 rounded border border-gray-400" />
                            <span className="text-sm text-gray-700">PQ Unscripted Test Script</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.csaDeliverables.rtm} onChange={() => handleCheckboxChange("csaDeliverables", "rtm")} className="w-4 h-4 rounded border border-gray-400" />
                            <span className="text-sm text-gray-700">RTM – Requirement Traceability Matrix</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input type="checkbox" checked={formData.csaDeliverables.vsr} onChange={() => handleCheckboxChange("csaDeliverables", "vsr")} className="w-4 h-4 rounded border border-gray-400" />
                            <span className="text-sm text-gray-700">Validation Summary Report</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Both CSV and CSA - When both are selected */}
                    {formData.selectedMethodologies.csv && formData.selectedMethodologies.csa && (
                      <div className="mt-4 bg-white rounded-lg p-4 max-h-96 overflow-y-auto">
                        <div className="grid grid-cols-2 gap-6">
                          {/* CSV Deliverables */}
                          <div>
                            <h4 className="font-bold text-gray-900 mb-3">CSV Deliverables</h4>
                            <div className="space-y-3">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={formData.csvDeliverables.urs} onChange={() => handleCheckboxChange("csvDeliverables", "urs")} className="w-4 h-4 rounded border border-gray-400" />
                                <span className="text-sm text-gray-700">URS – User Requirements Specification</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={formData.csvDeliverables.gap} onChange={() => handleCheckboxChange("csvDeliverables", "gap")} className="w-4 h-4 rounded border border-gray-400" />
                                <span className="text-sm text-gray-700">GxP Assessment</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={formData.csvDeliverables.crf} onChange={() => handleCheckboxChange("csvDeliverables", "crf")} className="w-4 h-4 rounded border border-gray-400" />
                                <span className="text-sm text-gray-700">CFR Part 11 (ERES) Assessment</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={formData.csvDeliverables.srs} onChange={() => handleCheckboxChange("csvDeliverables", "srs")} className="w-4 h-4 rounded border border-gray-400" />
                                <span className="text-sm text-gray-700">SRS – System Risk Assessment</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={formData.csvDeliverables.valPlan} onChange={() => handleCheckboxChange("csvDeliverables", "valPlan")} className="w-4 h-4 rounded border border-gray-400" />
                                <span className="text-sm text-gray-700">Validation Plan</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={formData.csvDeliverables.frs} onChange={() => handleCheckboxChange("csvDeliverables", "frs")} className="w-4 h-4 rounded border border-gray-400" />
                                <span className="text-sm text-gray-700">FRS – Functional Requirement Specification</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={formData.csvDeliverables.fra} onChange={() => handleCheckboxChange("csvDeliverables", "fra")} className="w-4 h-4 rounded border border-gray-400" />
                                <span className="text-sm text-gray-700">FRA – Functional Risk Assessment</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={formData.csvDeliverables.ds} onChange={() => handleCheckboxChange("csvDeliverables", "ds")} className="w-4 h-4 rounded border border-gray-400" />
                                <span className="text-sm text-gray-700">DS – Design Specification</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={formData.csvDeliverables.iq} onChange={() => handleCheckboxChange("csvDeliverables", "iq")} className="w-4 h-4 rounded border border-gray-400" />
                                <span className="text-sm text-gray-700">IQ Test Script</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={formData.csvDeliverables.oq} onChange={() => handleCheckboxChange("csvDeliverables", "oq")} className="w-4 h-4 rounded border border-gray-400" />
                                <span className="text-sm text-gray-700">OQ Test Script</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={formData.csvDeliverables.pq} onChange={() => handleCheckboxChange("csvDeliverables", "pq")} className="w-4 h-4 rounded border border-gray-400" />
                                <span className="text-sm text-gray-700">PQ Test Script</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={formData.csvDeliverables.rtm} onChange={() => handleCheckboxChange("csvDeliverables", "rtm")} className="w-4 h-4 rounded border border-gray-400" />
                                <span className="text-sm text-gray-700">RTM – Requirement Traceability Matrix</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={formData.csvDeliverables.vsr} onChange={() => handleCheckboxChange("csvDeliverables", "vsr")} className="w-4 h-4 rounded border border-gray-400" />
                                <span className="text-sm text-gray-700">Validation Summary Report</span>
                              </label>
                            </div>
                          </div>

                          {/* CSA Deliverables */}
                          <div>
                            <h4 className="font-bold text-gray-900 mb-3">CSA Deliverables</h4>
                            <div className="space-y-3">
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={formData.csaDeliverables.ubs} onChange={() => handleCheckboxChange("csaDeliverables", "ubs")} className="w-4 h-4 rounded border border-gray-400" />
                                <span className="text-sm text-gray-700">URS - User Request Specification</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={formData.csaDeliverables.urra} onChange={() => handleCheckboxChange("csaDeliverables", "urra")} className="w-4 h-4 rounded border border-gray-400" />
                                <span className="text-sm text-gray-700">URRA - User Requirement Risk Assessment</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={formData.csaDeliverables.gap} onChange={() => handleCheckboxChange("csaDeliverables", "gap")} className="w-4 h-4 rounded border border-gray-400" />
                                <span className="text-sm text-gray-700">GxP Assessment</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={formData.csaDeliverables.crf} onChange={() => handleCheckboxChange("csaDeliverables", "crf")} className="w-4 h-4 rounded border border-gray-400" />
                                <span className="text-sm text-gray-700">CFR Part 11 (ERES) Assessment</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={formData.csaDeliverables.srs} onChange={() => handleCheckboxChange("csaDeliverables", "srs")} className="w-4 h-4 rounded border border-gray-400" />
                                <span className="text-sm text-gray-700">SRS - System Risk Assessment</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={formData.csaDeliverables.valPlan} onChange={() => handleCheckboxChange("csaDeliverables", "valPlan")} className="w-4 h-4 rounded border border-gray-400" />
                                <span className="text-sm text-gray-700">Validation Plan</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={formData.csaDeliverables.frs} onChange={() => handleCheckboxChange("csaDeliverables", "frs")} className="w-4 h-4 rounded border border-gray-400" />
                                <span className="text-sm text-gray-700">FRS - Functional Requirement Specification</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={formData.csaDeliverables.fra} onChange={() => handleCheckboxChange("csaDeliverables", "fra")} className="w-4 h-4 rounded border border-gray-400" />
                                <span className="text-sm text-gray-700">FRA - Functional Risk Assessment</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={formData.csaDeliverables.ds} onChange={() => handleCheckboxChange("csaDeliverables", "ds")} className="w-4 h-4 rounded border border-gray-400" />
                                <span className="text-sm text-gray-700">DS - Design Specification</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={formData.csaDeliverables.iqScripted} onChange={() => handleCheckboxChange("csaDeliverables", "iqScripted")} className="w-4 h-4 rounded border border-gray-400" />
                                <span className="text-sm text-gray-700">IQ Scripted Test Script</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={formData.csaDeliverables.iqUnscripted} onChange={() => handleCheckboxChange("csaDeliverables", "iqUnscripted")} className="w-4 h-4 rounded border border-gray-400" />
                                <span className="text-sm text-gray-700">IQ Unscripted Test Script</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={formData.csaDeliverables.oqScripted} onChange={() => handleCheckboxChange("csaDeliverables", "oqScripted")} className="w-4 h-4 rounded border border-gray-400" />
                                <span className="text-sm text-gray-700">OQ Scripted Test Script</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={formData.csaDeliverables.oqUnscripted} onChange={() => handleCheckboxChange("csaDeliverables", "oqUnscripted")} className="w-4 h-4 rounded border border-gray-400" />
                                <span className="text-sm text-gray-700">OQ Unscripted Test Script</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={formData.csaDeliverables.pqScripted} onChange={() => handleCheckboxChange("csaDeliverables", "pqScripted")} className="w-4 h-4 rounded border border-gray-400" />
                                <span className="text-sm text-gray-700">PQ Scripted Test Script</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={formData.csaDeliverables.pqUnscripted} onChange={() => handleCheckboxChange("csaDeliverables", "pqUnscripted")} className="w-4 h-4 rounded border border-gray-400" />
                                <span className="text-sm text-gray-700">PQ Unscripted Test Script</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={formData.csaDeliverables.rtm} onChange={() => handleCheckboxChange("csaDeliverables", "rtm")} className="w-4 h-4 rounded border border-gray-400" />
                                <span className="text-sm text-gray-700">RTM – Requirement Traceability Matrix</span>
                              </label>
                              <label className="flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={formData.csaDeliverables.vsr} onChange={() => handleCheckboxChange("csaDeliverables", "vsr")} className="w-4 h-4 rounded border border-gray-400" />
                                <span className="text-sm text-gray-700">Validation Summary Report</span>
                              </label>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Description - Right Column */}
                <div className="flex-1">
                  <label className="block text-xs font-semibold uppercase text-gray-700 mb-2 tracking-wide">
                    System/Application Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={12}
                    placeholder="Briefly describe the business purpose and functions of the system..."
                    className="w-full px-4 py-3 bg-[#DAE0F1] rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B3B6E] resize-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-8">
                {/* GAMP Category */}
                <div className="bg-[#DAE0F1] p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">GAMP Category</h3>
                  <div className="space-y-5">
                    {[1, 2, 3, 4].map((cat) => (
                      <label key={cat} className="flex items-center gap-4 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.gampCategories[`category${cat}`] || false}
                          onChange={() => handleCheckboxChange("gampCategories", `category${cat}`)}
                          className="w-4 h-4 rounded border border-gray-400"
                        />
                        <span className="text-sm font-medium text-gray-900">Category {cat}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Regulation Coverage */}
                <div className="bg-[#DAE0F1] p-6 rounded-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Regulation Coverage</h3>
                  <div className="space-y-5">
                    <label className="flex items-center gap-4 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.regulations.cfr211 || false}
                        onChange={() => handleCheckboxChange("regulations", "cfr211")}
                        className="w-4 h-4 rounded border border-gray-400"
                      />
                      <span className="text-sm font-medium text-gray-900">CFR Part11</span>
                    </label>
                    <label className="flex items-center gap-4 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.regulations.cfr820 || false}
                        onChange={() => handleCheckboxChange("regulations", "cfr820")}
                        className="w-4 h-4 rounded border border-gray-400"
                      />
                      <span className="text-sm font-medium text-gray-900">CFR Part 820</span>
                    </label>
                    <label className="flex items-center gap-4 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.regulations.annexure11 || false}
                        onChange={() => handleCheckboxChange("regulations", "annexure11")}
                        className="w-4 h-4 rounded border border-gray-400"
                      />
                      <span className="text-sm font-medium text-gray-900">Annexure 11</span>
                    </label>
                    <label className="flex items-center gap-4 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.regulations.iso13485 || false}
                        onChange={() => handleCheckboxChange("regulations", "iso13485")}
                        className="w-4 h-4 rounded border border-gray-400"
                      />
                      <span className="text-sm font-medium text-gray-900">ISO 13485</span>
                    </label>
                    <label className="flex items-center gap-4 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.regulations.crf210 || false}
                        onChange={() => handleCheckboxChange("regulations", "crf210")}
                        className="w-4 h-4 rounded border border-gray-400"
                      />
                      <span className="text-sm font-medium text-gray-900">CRF Part 210</span>
                    </label>
                    <label className="flex items-center gap-4 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.regulations.crf211_2 || false}
                        onChange={() => handleCheckboxChange("regulations", "crf211_2")}
                        className="w-4 h-4 rounded border border-gray-400"
                      />
                      <span className="text-sm font-medium text-gray-900">CRF Part 211</span>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                onClick={() => navigate("/admin-dashboard")}
                className="px-6 py-2 text-gray-700 border border-gray-400 rounded-full hover:bg-gray-50 font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-white text-gray-900 border border-gray-400 rounded-full hover:bg-gray-50 font-semibold"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Steps 2-4 Placeholder */}
        {currentStep === 2 && (
          <div className="px-8 pb-12">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-8">Select User for Projects</h2>

              {allUsers.length === 0 && (
                <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    No users found. Please create users in <strong>Access Control → Create User</strong> first.
                  </p>
                </div>
              )}

              {/* Filters Section */}
              <div className="flex gap-8 mb-8" style={{ opacity: allUsers.length === 0 ? 0.5 : 1, pointerEvents: allUsers.length === 0 ? "none" : "auto" }}>
                {/* Search Input */}
                <div className="flex-1">
                  <label className="block text-xs font-semibold uppercase text-gray-700 mb-2 tracking-wide">
                    Search by name or email id
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Enter your name/email id"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      className="w-full px-4 py-3 bg-[#DAE0F1] rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B3B6E] pr-10"
                      disabled={allUsers.length === 0}
                    />
                    <Search size={18} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600" />
                  </div>
                </div>

                {/* Status Filter */}
                <div className="flex-1">
                  <label className="block text-xs font-semibold uppercase text-gray-700 mb-2 tracking-wide">
                    Filter by status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-3 bg-[#DAE0F1] rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B3B6E] appearance-none cursor-pointer"
                    disabled={allUsers.length === 0}
                  >
                    <option>All Status</option>
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </div>

                {/* Department Filter */}
                <div className="flex-1">
                  <label className="block text-xs font-semibold uppercase text-gray-700 mb-2 tracking-wide">
                    Department
                  </label>
                  <select
                    value={departmentFilter}
                    onChange={(e) => setDepartmentFilter(e.target.value)}
                    className="w-full px-4 py-3 bg-[#DAE0F1] rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#2B3B6E] appearance-none cursor-pointer"
                    disabled={allUsers.length === 0}
                  >
                    {getDepartments().map((dept: string) => (
                      <option key={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Users Table */}
              <div className="border border-gray-300 rounded-lg">
                {/* Table Header */}
                <div className="bg-[#DAE0F1] border-b border-gray-300 flex items-center px-4 py-3">
                  <div className="w-10">
                    <input
                      type="checkbox"
                      checked={getFilteredUsers().length > 0 && selectedUsers.size === getFilteredUsers().length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          const newSelected = new Set(selectedUsers);
                          getFilteredUsers().forEach(u => newSelected.add(u.id));
                          setSelectedUsers(newSelected);
                        } else {
                          const newSelected = new Set(selectedUsers);
                          getFilteredUsers().forEach(u => newSelected.delete(u.id));
                          setSelectedUsers(newSelected);
                        }
                      }}
                      className="w-4 h-4 rounded border border-gray-400 cursor-pointer"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold uppercase text-gray-600 tracking-wider">Name</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold uppercase text-gray-600 tracking-wider">Email</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold uppercase text-gray-600 tracking-wider">Department</p>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-semibold uppercase text-gray-600 tracking-wider">Title</p>
                  </div>
                  <div className="w-24">
                    <p className="text-xs font-semibold uppercase text-gray-600 tracking-wider">Status</p>
                  </div>
                </div>

                {/* Table Body */}
                <div className="divide-y divide-gray-300">
                  {getFilteredUsers().map((user) => (
                    <div key={user.id} className="flex items-center hover:bg-gray-50 transition px-4 py-3">
                      <div className="w-10">
                        <input
                          type="checkbox"
                          checked={selectedUsers.has(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="w-4 h-4 rounded border border-gray-400 cursor-pointer"
                        />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-900">{user.name}</p>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">{user.department}</p>
                      </div>
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">{user.title}</p>
                      </div>
                      <div className="w-24">
                        <span
                          className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${
                            user.status === "Active"
                              ? "bg-green-100 text-green-800"
                              : "bg-gray-300 text-gray-700"
                          }`}
                        >
                          {user.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* No Results Message */}
              {getFilteredUsers().length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-600">No users found matching your criteria</p>
                </div>
              )}
            </div>

            {/* Selected Users Section */}
            {selectedUsers.size > 0 && (
              <div className="mt-8 bg-white rounded-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-gray-900">
                    Selected Users ({selectedUsers.size})
                  </h3>
                  <button
                    onClick={() => setSelectedUsers(new Set())}
                    className="px-4 py-1 border border-[#837F7C] rounded-full text-sm font-semibold text-[#281A04] hover:bg-gray-50"
                  >
                    Clear All
                  </button>
                </div>
                <div className="space-y-3">
                  {allUsers
                    .filter(user => selectedUsers.has(user.id))
                    .map(user => (
                      <div
                        key={user.id}
                        className="border border-gray-300 rounded-lg p-4 flex items-center justify-between hover:bg-gray-50 transition"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-gray-900">{user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                        <div className="flex items-center gap-8">
                          <p className="text-sm text-gray-700">{user.department}</p>
                          <p className="text-sm text-gray-700">{user.title}</p>
                          <span
                            className={`inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold whitespace-nowrap ${
                              user.status === "Active"
                                ? "bg-green-100 text-green-800"
                                : "bg-gray-300 text-gray-700"
                            }`}
                          >
                            {user.status}
                          </span>
                          <button
                            onClick={() => toggleUserSelection(user.id)}
                            className="text-gray-400 hover:text-gray-600 text-lg font-semibold"
                            title="Remove user"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                onClick={handlePrevious}
                className="px-6 py-2 text-gray-700 border border-gray-400 rounded-full hover:bg-gray-50 font-semibold"
              >
                Previous
              </button>
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-white text-gray-900 border border-gray-400 rounded-full hover:bg-gray-50 font-semibold disabled:opacity-50"
                disabled={selectedUsers.size === 0}
                title={selectedUsers.size === 0 ? "Please select at least one user" : ""}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* Step 3 - Assign Roles */}
        {currentStep === 3 && (
          <div className="px-8 pb-12">
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-6">
                Assign Roles & Actions
              </h2>

              {/* User Role Assignment Cards */}
              <div className="space-y-6">
                {allUsers
                  .filter(user => selectedUsers.has(user.id))
                  .map(user => (
                    <div
                      key={user.id}
                      className="border border-gray-300 rounded-lg p-6"
                    >
                      {/* User Info */}
                      <div className="mb-6">
                        <p className="font-bold text-gray-900 text-sm">{user.name}</p>
                        <p className="text-xs text-gray-600">{user.email} - {user.department}</p>
                      </div>

                      {/* Role Selection Dropdown */}
                      <div className="mb-6 relative">
                        <label className="block text-sm font-bold text-gray-900 mb-4">
                          Role <span className="text-red-500">*</span>
                        </label>
                        <button
                          onClick={() =>
                            setRoleDropdownOpen({
                              ...roleDropdownOpen,
                              [user.id]: !roleDropdownOpen[user.id],
                            })
                          }
                          className="w-full px-4 py-3 bg-[#DAE0F1] border border-gray-300 rounded-lg flex items-center justify-between hover:bg-blue-50 text-left"
                        >
                          <span className="text-gray-700">
                            {userRoles[user.id] || "Select role"}
                          </span>
                          <ChevronDown
                            size={18}
                            className={`text-gray-600 transition ${
                              roleDropdownOpen[user.id] ? "rotate-180" : ""
                            }`}
                          />
                        </button>

                        {/* Dropdown Menu */}
                        {roleDropdownOpen[user.id] && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-10 overflow-hidden">
                            {["PM/Project Manager", "Business Owners", "Stakeholders", "CSV/CSA PM", "CSV/CSA Validation Lead"].map((role) => (
                              <label
                                key={role}
                                className="flex items-center justify-between p-4 border-b border-gray-300 hover:bg-gray-50 cursor-pointer last:border-b-0"
                              >
                                <span className="text-sm text-gray-900">{role}</span>
                                <input
                                  type="radio"
                                  name={`role-${user.id}`}
                                  checked={userRoles[user.id] === role}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setUserRoles({
                                        ...userRoles,
                                        [user.id]: role,
                                      });
                                      setRoleDropdownOpen({
                                        ...roleDropdownOpen,
                                        [user.id]: false,
                                      });
                                    }
                                  }}
                                  className="w-5 h-5 cursor-pointer"
                                />
                              </label>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Actions Checkboxes */}
                      <div>
                        <label className="block text-sm font-bold text-gray-900 mb-4">
                          Actions <span className="text-red-500">*</span>
                        </label>
                        <div className="grid grid-cols-2 gap-6">
                          {["Admin", "Author", "Reviewer", "Approver"].map((action) => (
                            <label key={action} className="flex items-center gap-3 cursor-pointer">
                              <input
                                type="checkbox"
                                checked={
                                  userActions[user.id]?.[action] || false
                                }
                                onChange={(e) =>
                                  setUserActions({
                                    ...userActions,
                                    [user.id]: {
                                      ...userActions[user.id],
                                      [action]: e.target.checked,
                                    },
                                  })
                                }
                                className="w-4 h-4 rounded border border-gray-400 cursor-pointer"
                              />
                              <span className="text-sm text-gray-900 font-medium">{action}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>

              {/* Navigation Buttons */}
              <div className="flex justify-between mt-8">
                <button
                  onClick={handlePrevious}
                  className="px-6 py-2 text-gray-700 border border-gray-400 rounded-full hover:bg-gray-50 font-semibold"
                >
                  Previous
                </button>
                <button
                  onClick={handleNext}
                  className="px-6 py-2 bg-[#2B3B6E] text-white rounded-full hover:bg-[#1D2749] font-semibold disabled:opacity-50"
                  disabled={allUsers.some(
                    (user: any) =>
                      selectedUsers.has(user.id) && !userRoles[user.id]
                  )}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Step 4 - Review & Activate */}
        {currentStep === 4 && (
          <div className="px-8 pb-12">
            {/* Project Details Section */}
            <div className="bg-white rounded-lg p-8 mb-8 border border-[#A9A4A0]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Project Details</h3>
                <button
                  onClick={() => setCurrentStep(1)}
                  className="px-4 py-1 border border-[#837F7C] rounded-full text-sm font-semibold text-[#281A04] hover:bg-gray-50"
                >
                  Edit
                </button>
              </div>

              <div className="grid grid-cols-2 gap-8">
                {/* Project ID */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-[#837F7C]">Project ID</label>
                  <div className="bg-[#DAE0F1] rounded px-3 py-2 text-sm font-semibold text-[#504539]">
                    {formData.projectId}
                  </div>
                </div>

                {/* Change Number */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-[#837F7C]">Change Number</label>
                  <div className="bg-[#DAE0F1] rounded px-3 py-2 text-sm font-semibold text-[#504539]">
                    {formData.changeNumber || formData.projectId}
                  </div>
                </div>

                {/* System Name */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-[#837F7C]">System Name</label>
                  <div className="bg-[#DAE0F1] rounded px-3 py-2 text-sm font-semibold text-[#3C3A39]">
                    {formData.systemApplicationName || "N/A"}
                  </div>
                </div>

                {/* Methodology */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-[#837F7C]">Methodology</label>
                  <div className="bg-[#DAE0F1] rounded px-3 py-2 text-sm font-semibold text-[#3C3A39]">
                    {Object.entries(formData.selectedMethodologies)
                      .filter(([_, selected]) => selected)
                      .map(([key, _]) => key.toUpperCase())
                      .join(", ") || "N/A"}
                  </div>
                </div>

                {/* Project Description */}
                <div className="col-span-2 flex flex-col gap-2">
                  <label className="text-xs font-bold text-[#837F7C]">Project Description</label>
                  <div className="bg-[#DAE0F1] rounded p-3 text-sm text-[#504539] max-h-20 overflow-y-auto">
                    {formData.description}
                  </div>
                </div>

                {/* GAMP Categories */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-[#837F7C]">GAMP Categories</label>
                  <div className="bg-[#DAE0F1] rounded px-3 py-2 text-sm font-semibold text-[#3C3A39]">
                    {Object.entries(formData.gampCategories)
                      .filter(([_, selected]) => selected)
                      .length > 0
                      ? Object.entries(formData.gampCategories)
                          .filter(([_, selected]) => selected)
                          .map(([key, _]) => key)
                          .join(", ")
                      : "N/A"}
                  </div>
                </div>

                {/* Regulatory Coverages */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-[#837F7C]">Regulatory Coverages</label>
                  <div className="bg-[#DAE0F1] rounded px-3 py-2 text-sm font-semibold text-[#3C3A39]">
                    {Object.entries(formData.regulations)
                      .filter(([_, selected]) => selected)
                      .length > 0
                      ? Object.entries(formData.regulations)
                          .filter(([_, selected]) => selected)
                          .map(([key, _]) => {
                            const labels: { [key: string]: string } = {
                              cfr211: "CFR Part 211",
                              cfr820: "CFR Part 820",
                              annexure11: "Annexure 11",
                              iso13485: "ISO 13485",
                              crf210: "CFR Part 210",
                              crf211_2: "CFR Part 211 (2)",
                            };
                            return labels[key] || key;
                          })
                          .join(", ")
                      : "N/A"}
                  </div>
                </div>
              </div>
            </div>

            {/* Assigned Users Section */}
            <div className="bg-white rounded-lg p-8 border border-[#A9A4A0]">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  Assigned Users ({selectedUsers.size})
                </h3>
                <button
                  onClick={() => setCurrentStep(2)}
                  className="px-4 py-1 border border-[#837F7C] rounded-full text-sm font-semibold text-[#281A04] hover:bg-gray-50"
                >
                  Edit
                </button>
              </div>

              {/* Users Table */}
              <div className="border border-[#A9A4A0] rounded-lg overflow-hidden">
                {/* Table Header */}
                <div className="flex border-b border-[#A9A4A0] bg-gray-50">
                  <div className="flex-1 px-6 py-3 text-xs font-semibold text-[#3C3A39]">Name</div>
                  <div className="flex-1 px-6 py-3 text-xs font-semibold text-[#3C3A39]">Email</div>
                  <div className="w-32 px-6 py-3 text-xs font-semibold text-[#3C3A39]">Role</div>
                  <div className="w-32 px-6 py-3 text-xs font-semibold text-[#3C3A39]">Action</div>
                </div>

                {/* Table Body */}
                {Array.from(selectedUsers).map((userId: any) => {
                  const userId_num = userId as number;
                  const user = allUsers.find((u: any) => u.id === userId_num);
                  if (!user) return null;

                  const actions = userActions[userId_num] || {};
                  const actionNames = Object.entries(actions)
                    .filter(([_, value]) => value)
                    .map(([key, _]) => key)
                    .join(", ");

                  return (
                    <div key={userId_num} className="flex border-b border-[#A9A4A0] hover:bg-gray-50">
                      <div className="flex-1 px-6 py-4 text-sm text-gray-900">{user.name}</div>
                      <div className="flex-1 px-6 py-4 text-sm text-gray-900">{user.email}</div>
                      <div className="w-32 px-6 py-4 text-sm text-gray-900">
                        {userRoles[userId_num] || "-"}
                      </div>
                      <div className="w-32 px-6 py-4 text-sm text-gray-900">
                        {actionNames || "-"}
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedUsers.size === 0 && (
                <div className="text-center py-8 text-[#837F7C]">
                  No users selected
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8">
              <button
                onClick={handlePrevious}
                className="flex items-center gap-2 px-6 py-2 bg-gray-200 text-gray-900 rounded-full hover:bg-gray-300 font-semibold"
              >
                <ChevronLeft size={20} />
                Previous
              </button>
              <button
                onClick={() => {
                  // Save project to localStorage
                  const projects = JSON.parse(localStorage.getItem("projects") || "[]");
                  const newProject = {
                    id: formData.projectId,
                    name: formData.systemApplicationName || "Untitled Project",
                    changeId: formData.changeNumber || formData.projectId,
                    gamp: Object.entries(formData.gampCategories)
                      .filter(([_, selected]) => selected)
                      .map(([key, _]) => key)
                      .join(", ") || "N/A",
                    csvCsa: Object.entries(formData.selectedMethodologies)
                      .filter(([_, selected]) => selected)
                      .map(([key, _]) => key.toUpperCase())
                      .join(", ") || "N/A",
                    status: "ACTIVE",
                    createdBy: localStorage.getItem("userName") || "Admin",
                    createdDate: new Date().toLocaleDateString(),
                    description: formData.description,
                    selectedUsers: Array.from(selectedUsers),
                    userRoles,
                    userActions,
                  };
                  
                  projects.push(newProject);
                  localStorage.setItem("projects", JSON.stringify(projects));
                  
                  console.log("Project Created:", newProject);
                  navigate("/admin-dashboard");
                }}
                className="px-8 py-2 bg-[#11172B] text-white rounded-full hover:bg-[#0D0F1F] font-semibold"
              >
                Create Project
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CreateProject;
