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
        {currentStep > 1 && (
          <div className="px-8 pb-12">
            <div className="bg-white rounded-lg shadow-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Step {currentStep}
              </h2>
              <p className="text-gray-600 mb-8">
                Step {currentStep} content coming soon...
              </p>
              <div className="flex justify-between">
                <button
                  onClick={handlePrevious}
                  className="px-6 py-2 bg-gray-200 text-gray-900 rounded-full hover:bg-gray-300 font-semibold"
                >
                  Previous
                </button>
                {currentStep < 4 ? (
                  <button
                    onClick={handleNext}
                    className="px-6 py-2 bg-[#2B3B6E] text-white rounded-full hover:bg-[#1D2749] font-semibold"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={() => navigate("/admin-dashboard")}
                    className="px-6 py-2 bg-[#2B3B6E] text-white rounded-full hover:bg-[#1D2749] font-semibold"
                  >
                    Complete
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CreateProject;
