import { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Plus, Moon, Sun, LogOut, LayoutDashboard, FolderOpen, FileText, Search, Upload, Download, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BulkUserRequirements() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [expandedMenu, setExpandedMenu] = useState({
    dashboard: true,
    projects: false,
    artifacts: false,
  });

  const [formData, setFormData] = useState({
    ursId: '',
    ursTitle: '',
    ursDescription: '',
    ursEnhanced: '',
    versions: '',
    selectedTab: 'allow'
  });

  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedProject, setSelectedProject] = useState<any>(null);

  const getProjects = () => {
    try {
      const projects = JSON.parse(localStorage.getItem("projects") || "[]");
      return projects;
    } catch (error) {
      console.error("Error loading projects:", error);
      return [];
    }
  };

  const projects = getProjects();

  // Define artifacts based on methodology
  const csvArtifacts = [
    { id: 'urs', name: 'URS - User Request Specification', checked: true },
    { id: 'gxp', name: 'GxP Assessment', checked: true },
    { id: 'cfr', name: 'CFR Part 11 (ERES) Assessment', checked: true },
    { id: 'srs', name: 'SRS System risk Assessment', checked: false },
    { id: 'val-plan', name: 'Validation Plan', checked: false },
    { id: 'frs', name: 'FRS - Functional Requirements', checked: false },
    { id: 'frs-risk', name: 'FRS - Functional Risk Assessment', checked: false },
    { id: 'ds', name: 'DS - Design Specification', checked: false },
    { id: 'iq', name: 'IQ Test Script', checked: false },
    { id: 'oq', name: 'OQ Test Script', checked: false },
    { id: 'pq', name: 'PQ Test Script', checked: false },
    { id: 'rtm', name: 'RTM - Requirement Traceability', checked: false },
    { id: 'val-sum', name: 'Validation Summary Report', checked: false },
  ];

  const csaArtifacts = [
    { id: 'config-doc', name: 'Configuration Documentation', checked: true },
    { id: 'test-plan', name: 'Test Plan', checked: true },
    { id: 'security-assess', name: 'Security Assessment', checked: false },
    { id: 'risk-assess', name: 'Risk Assessment', checked: false },
    { id: 'deployment-plan', name: 'Deployment Plan', checked: false },
    { id: 'user-guide', name: 'User Guide', checked: false },
  ];

  const getArtifactsForProject = () => {
    if (!selectedProject) return [];
    const methodology = selectedProject.csvCsa || selectedProject.methodology;
    return methodology === 'CSV' ? csvArtifacts : csaArtifacts;
  };

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    navigate("/");
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className={`min-h-screen ${darkMode ? "bg-[#DAE0F1]" : "bg-gray-100"}`}>
      {/* Sidebar - Fixed */}
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
          {/* Dashboard */}
          <button
            onClick={() => navigate("/author-dashboard")}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-white hover:bg-[#2d3a5a] transition ${!sidebarOpen ? "justify-center" : ""}`}
            title="Author Dashboard"
          >
            <LayoutDashboard size={24} />
            {sidebarOpen && <span className="text-sm font-medium">Author Dashboard</span>}
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
            <div className="pl-12 pr-2 py-3">
              <select
                value={selectedProject?.id || ''}
                onChange={(e) => {
                  const project = projects.find(p => p.id === e.target.value);
                  setSelectedProject(project || null);
                }}
                className="w-full bg-[#2d3a5a] border border-[#6D81C5] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#91A1D4] transition"
              >
                <option value="">Choose project</option>
                {projects.map((project: any) => (
                  <option key={project.id} value={project.id}>
                    {project.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Artifacts */}
          {selectedProject && (
            <>
              <button
                onClick={() => setExpandedMenu({ ...expandedMenu, artifacts: !expandedMenu.artifacts })}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-white hover:bg-[#2d3a5a] transition w-full ${!sidebarOpen ? "justify-center" : ""}`}
                title="Artifacts"
              >
                <FileText size={20} />
                {sidebarOpen && <span className="text-sm font-medium flex-1 text-left">Artifacts</span>}
                {sidebarOpen && (
                  <ChevronDown
                    size={18}
                    className={`transition-transform ${expandedMenu.artifacts ? "rotate-180" : ""}`}
                  />
                )}
              </button>
              {sidebarOpen && expandedMenu.artifacts && (
                <div className="flex flex-col gap-1 pl-12 pr-2 py-2 max-h-72 overflow-y-auto">
                  {getArtifactsForProject().map((artifact) => (
                    <button
                      key={artifact.id}
                      className="flex items-center justify-between text-xs text-gray-300 hover:text-white transition py-2 px-2 rounded hover:bg-[#2d3a5a] text-left"
                    >
                      <span className="truncate flex-1">{artifact.name}</span>
                      {!artifact.checked && (
                        <Plus size={14} className="text-orange-400 flex-shrink-0 ml-2" />
                      )}
                    </button>
                  ))}
                </div>
              )}
            </>
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
              <ChevronLeft size={16} className="text-[#3A4E92]" />
            )}
          </button>

          {/* Right Side Content */}
          <div className="flex items-center gap-4">
            <div className="w-6 h-6 bg-[#DAE0F1] rounded-full flex items-center justify-center">
              <Search size={16} className="text-[#3A4E92]" />
            </div>
            <div className="flex flex-col items-end">
              <p className="text-sm font-semibold text-[#F7F7F7]">Welcome, Author</p>
              <p className="text-xs text-gray-300">Bulk Requirements</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full border-2 border-[#FAC277]"></div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8 pt-24">
          <div className="max-w-full">
            {/* Breadcrumb */}
            <div className="flex items-center gap-3 mb-6 text-gray-600">
              <button onClick={() => navigate(-1)} className="flex items-center gap-2 hover:text-gray-900 transition">
                <ArrowLeft size={16} />
                <span className="text-sm">Back to Requirements</span>
              </button>
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold text-gray-900 mb-8">Add User Requirements</h1>

            {/* Switch Tabs */}
            <div className="flex gap-2 mb-8 items-center bg-gray-300 px-2 py-2 rounded-full w-fit">
              <button
                onClick={() => handleInputChange('selectedTab', 'allow')}
                className={`px-6 py-2 rounded-full font-semibold transition ${
                  formData.selectedTab === 'allow'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Allow User Requirements
              </button>
              <button
                onClick={() => handleInputChange('selectedTab', 'upload')}
                className={`px-6 py-2 rounded-full font-semibold transition ${
                  formData.selectedTab === 'upload'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-700 hover:text-gray-900'
                }`}
              >
                Upload User Requirements
              </button>
            </div>

            {/* Main Container - Form + Footer */}
            <div className="bg-white rounded-lg overflow-hidden">
              {/* Form Content - Allow Tab */}
              {formData.selectedTab === 'allow' && (
                <div className="overflow-hidden">
                  {/* 3-Column Layout */}
                  <div className="flex justify-between items-stretch gap-6 p-8">
                    {/* Left Column - URS Fields */}
                    <div className="flex-1 flex flex-col gap-6">
                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">URS-ID</label>
                        <input
                          type="text"
                          placeholder="Enter URS-ID"
                          value={formData.ursId}
                          onChange={(e) => handleInputChange('ursId', e.target.value)}
                          className="w-full bg-blue-100 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">URS-TITLE</label>
                        <input
                          type="text"
                          placeholder="Enter URS-Title"
                          value={formData.ursTitle}
                          onChange={(e) => handleInputChange('ursTitle', e.target.value)}
                          className="w-full bg-blue-100 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none"
                        />
                      </div>

                      <div className="flex-1 flex flex-col">
                        <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">URS-REQUIREMENTS</label>
                        <textarea
                          placeholder="Enter Requirements description"
                          value={formData.ursDescription}
                          onChange={(e) => handleInputChange('ursDescription', e.target.value)}
                          className="w-full bg-blue-100 border-2 border-blue-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none resize-none flex-1 min-h-72"
                        />
                      </div>
                    </div>

                    {/* Left Divider */}
                    <div className="w-0.5 bg-gray-400 flex-shrink-0"></div>

                    {/* Middle Column - Enhanced Description */}
                    <div className="flex-1 flex flex-col gap-3">
                      <div className="flex items-center justify-center px-4 py-2 bg-blue-100 border-2 border-blue-200 rounded-lg">
                        <span className="text-sm font-semibold text-gray-900">URS- Descriptions Enhanced</span>
                      </div>
                      <textarea
                        placeholder="Enhanced description will appear here..."
                        value={formData.ursEnhanced}
                        onChange={(e) => handleInputChange('ursEnhanced', e.target.value)}
                        className="w-full bg-blue-100 border-2 border-blue-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none resize-none flex-1 min-h-72"
                      />

                      {/* Action Buttons */}
                      <div className="flex gap-3 pt-4">
                        <button className="flex-1 px-6 py-3 bg-gray-400 text-gray-800 rounded-lg font-semibold hover:bg-gray-500 transition">
                          Generate
                        </button>
                        <button className="flex-1 px-6 py-3 bg-[#3A4E92] text-white rounded-lg font-semibold hover:bg-[#2d3a5a] transition">
                          Finalize
                        </button>
                      </div>
                    </div>

                    {/* Right Divider */}
                    <div className="w-0.5 bg-gray-400 flex-shrink-0"></div>

                    {/* Right Column - Versions */}
                    <div className="flex-1 flex flex-col gap-3">
                      <div className="flex items-center justify-center px-4 py-2 bg-blue-100 border-2 border-blue-200 rounded-lg">
                        <span className="text-sm font-semibold text-gray-900">Versions (0)</span>
                      </div>
                      <div className="border-2 border-dashed border-blue-400 rounded-lg px-6 py-8 flex items-center justify-center bg-blue-50 h-48">
                        <div className="text-center">
                          <p className="text-sm text-gray-600 font-medium">No versions yet</p>
                          <p className="text-xs text-gray-500">Click rephase to generate versions</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Form Content - Upload Tab */}
              {formData.selectedTab === 'upload' && (
                <div className="p-12 py-32 flex flex-col items-center justify-center gap-6">
                  {/* Upload Icon */}
                  <div className="w-24 h-24 bg-blue-200 rounded-full flex items-center justify-center">
                    <Upload size={48} className="text-[#3A4E92]" />
                  </div>
                  
                  {/* Content */}
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Drag & drop your requirements</h2>
                    <p className="text-gray-600 mb-1">Select and upload your document (PDF or DOC).</p>
                    <p className="text-gray-500 text-sm">Files larger than 50 MB may not be supported</p>
                  </div>
                </div>
              )}

              {/* Footer Actions */}
              <div className={`flex items-center ${formData.selectedTab === 'upload' ? 'justify-end' : 'justify-between'} px-8 py-6 border-t-2 border-gray-300`}>
                {formData.selectedTab === 'allow' && (
                  <button className="flex items-center gap-2 px-6 py-2 border-2 border-green-600 text-green-600 rounded-full font-semibold hover:bg-green-50 transition">
                    <Download size={20} />
                    Download Excel
                  </button>
                )}

                <div className="flex gap-4">
                  <button className="px-8 py-2 border-2 border-gray-400 text-gray-700 rounded-full font-semibold hover:bg-gray-100 transition">
                    Cancel
                  </button>
                  <button className="px-8 py-2 bg-[#1D2749] text-white rounded-full font-semibold hover:bg-[#11172B] transition">
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
