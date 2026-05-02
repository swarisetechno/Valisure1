import { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Plus, Moon, Sun, LogOut, LayoutDashboard, FolderOpen, FileText, Search, AlertCircle, X, CheckCircle2 } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function ProjectArtifactOverview() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [expandedMenu, setExpandedMenu] = useState({
    projects: true,
    artifacts: true,
  });
  const [selectedArtifact, setSelectedArtifact] = useState(() => {
    return location.state?.selectedArtifact || 'URS - User Request Specification';
  });
  const [activeTab, setActiveTab] = useState('Overview');
  const [selectedProject, setSelectedProject] = useState<any>(location.state?.projectData || null);

  // Get projects from localStorage
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

  const getArtifactsForProject = () => {
    if (!selectedProject) return [];
    const methodology = selectedProject.csvCsa || selectedProject.methodology;
    return methodology === 'CSV' ? csvArtifactsList : csaArtifactsList;
  };

  // Get project data from location state
  const csvArtifactsList = [
    { id: 'URS-PPT-001', name: 'URS - User Request Specification', checked: true },
    { id: 'GXP-001', name: 'GxP Assessment', checked: true },
    { id: 'CFR-001', name: 'CFR Part 11 (ERES) Assessment', checked: true },
    { id: 'SRS-001', name: 'SRS System risk Assessment', checked: false },
    { id: 'VAL-001', name: 'Validation Plan', checked: false },
    { id: 'FRS-001', name: 'FRS - Functional Requirements', checked: false },
    { id: 'FRS-002', name: 'FRS - Functional Risk Assessment', checked: false },
    { id: 'DS-001', name: 'DS - Design Specification', checked: false },
    { id: 'IQ-001', name: 'IQ Test Script', checked: false },
    { id: 'OQ-001', name: 'OQ Test Script', checked: false },
    { id: 'PQ-001', name: 'PQ Test Script', checked: false },
    { id: 'RTM-001', name: 'RTM - Requirement Traceability', checked: false },
    { id: 'VAL-SUM-001', name: 'Validation Summary Report', checked: false },
  ];

  const csaArtifactsList = [
    { id: 'CONFIG-001', name: 'Configuration Documentation', checked: true },
    { id: 'TEST-001', name: 'Test Plan', checked: true },
    { id: 'SEC-001', name: 'Security Assessment', checked: false },
    { id: 'RISK-001', name: 'Risk Assessment', checked: false },
    { id: 'DEPLOY-001', name: 'Deployment Plan', checked: false },
    { id: 'USER-001', name: 'User Guide', checked: false },
  ];

  const incomingProjectData = location.state?.projectData;
  
  const projectData = incomingProjectData ? {
    id: incomingProjectData.id || 'PROJ001',
    name: incomingProjectData.name || 'Pharma LIMS Modernization',
    projectId: incomingProjectData.projectId || 'PRJ109090',
    changeId: incomingProjectData.changeId || 'CHG633747839',
    systemName: incomingProjectData.systemName || 'eDHR',
    gampCategory: incomingProjectData.gamp || 'Category 4',
    methodology: incomingProjectData.csvCsa || 'CSV',
    regulatoryCoverage: incomingProjectData.regulatoryCoverage || 'CFR Part 11 and CFR Part 820',
    artifacts: (incomingProjectData.csvCsa || 'CSV') === 'CSV' ? csvArtifactsList : csaArtifactsList
  } : {
    id: 'PROJ001',
    name: 'Pharma LIMS Modernization',
    projectId: 'PRJ109090',
    changeId: 'CHG633747839',
    systemName: 'eDHR',
    gampCategory: 'Category 4',
    methodology: 'CSV',
    regulatoryCoverage: 'CFR Part 11 and CFR Part 820',
    artifacts: csvArtifactsList
  };

  // Requirements data
  const requirementsData = [
    { id: 'UR_AD_01', title: 'Admin login', description: 'The system shall users to login in as admin...', gxp: 'Yes', risk: 'High', riskLevel: 'Risk - 1', testing: 'Scripted', status: 'Approved' },
    { id: 'UR_AD_02', title: 'Admin Authorised', description: 'The system shall users to login in as admin...', gxp: 'Yes', risk: 'Medium', riskLevel: 'Risk - 1', testing: 'Unscripted', status: 'Draft' },
    { id: 'UR_AD_03', title: 'Forgot Login', description: 'The system shall users to login in as admin...', gxp: 'NO', risk: 'Low', riskLevel: 'Risk - 2', testing: 'Unscripted', status: 'Approval in progress' },
    { id: 'UR_AD_04', title: 'Admin home page', description: 'Upon system shall users to login in as admin...', gxp: 'Yes', risk: 'High', riskLevel: 'Risk - 3', testing: 'Scripted', status: 'Approved' },
    { id: 'UR_AD_05', title: 'Admin Authorised', description: 'The system shall users to login in as admin...', gxp: 'Yes', risk: 'Medium', riskLevel: 'Risk - 1', testing: 'Unscripted', status: 'Draft' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Approved':
        return 'bg-green-50 text-green-700 font-semibold';
      case 'Draft':
        return 'bg-amber-100 text-amber-700 font-semibold';
      case 'Approval in progress':
        return 'bg-amber-100 text-amber-700 font-semibold';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'High':
        return 'bg-red-100 text-red-700 font-semibold';
      case 'Medium':
        return 'bg-amber-50 text-amber-700 font-semibold';
      case 'Low':
        return 'bg-green-50 text-green-700 font-semibold';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    navigate("/");
  };

  // Get artifact ID from name
  const getArtifactId = (artifactName: string) => {
    const artifact = projectData.artifacts.find(a => a.name === artifactName);
    return artifact?.id || '';
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
        <div className={`flex items-center justify-center border-b border-[#6D81C5] px-5 h-20`}>
          {sidebarOpen && <h1 className="text-white font-bold text-lg">ValiSure</h1>}
          {!sidebarOpen && (
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-[#91A1D4]">
              <span className="text-white font-bold text-sm">VS</span>
            </div>
          )}
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
            {sidebarOpen && <span className="text-sm font-medium">Dashboard</span>}
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
              {sidebarOpen && expandedMenu.artifacts && selectedProject && (
                <div className="flex flex-col gap-1 pl-12 pr-2 py-2 max-h-72 overflow-y-auto">
                  {getArtifactsForProject().map((artifact) => (
                    <button
                      key={artifact.id}
                      onClick={() => setSelectedArtifact(artifact.name)}
                      className={`flex items-center justify-between text-xs py-2 px-2 rounded transition text-left ${
                        selectedArtifact === artifact.name
                          ? 'bg-[#6D81C5] text-white'
                          : 'text-gray-300 hover:text-white hover:bg-[#2d3a5a]'
                      }`}
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
        <header className={`bg-[#1D2749] text-white h-20 flex items-center justify-between px-5 lg:px-8 fixed lg:absolute top-0 left-0 right-0 z-30 border-b border-[#6D81C5] ${sidebarOpen ? "lg:left-64" : "lg:left-24"} transition-all duration-300`}>
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
            <p className="text-sm font-semibold text-[#F7F7F7]">Welcome, Author</p>
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full border-2 border-[#FAC277]"></div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8 pt-24">
          <div className="max-w-full">
            {/* Breadcrumb */}
            <p className="text-sm text-gray-600 mb-4">
              Projects/ {projectData.name}/ {selectedArtifact.split(' - ')[0] || selectedArtifact}/ {getArtifactId(selectedArtifact)}
            </p>

            {/* Title */}
            <h1 className="text-4xl font-bold text-gray-900 mb-8">{selectedArtifact}</h1>

            {/* Project Details */}
            <div className="bg-white rounded-lg shadow-sm p-8 mb-8 border border-gray-200">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Project Details</h2>
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">PROJECT ID</label>
                  <input type="text" value={projectData.projectId} readOnly className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700 font-medium" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">CHANGE ID</label>
                  <input type="text" value={projectData.changeId} readOnly className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700 font-medium" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">PROJECT/SYSTEM NAME</label>
                  <input type="text" value={projectData.systemName} readOnly className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700 font-medium" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">GAMP CATEGORY</label>
                  <input type="text" value={projectData.gampCategory} readOnly className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700 font-medium" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">METHODOLOGY</label>
                  <input type="text" value={projectData.methodology} readOnly className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700 font-medium" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-2">REGULATORY COVERAGE</label>
                  <input type="text" value={projectData.regulatoryCoverage} readOnly className="w-full bg-gray-50 border border-gray-200 rounded-lg px-4 py-3 text-gray-700 font-medium" />
                </div>
              </div>
            </div>

            {/* Tabs Navigation */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-8 flex gap-4 items-center justify-start">
              {['Overview', 'User Requirements', 'User Requirement Specification'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 font-semibold text-sm rounded-lg transition whitespace-nowrap flex-1 ${
                    activeTab === tab
                      ? 'bg-white text-gray-900 border-2 border-blue-600'
                      : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'User Requirements' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Requirements Header */}
                <div className="px-8 py-6 flex items-center justify-start gap-4 border-b border-gray-200">
                  <button onClick={() => navigate("/bulk-user-requirements")} className="flex items-center gap-2 bg-[#1D2749] text-white px-6 py-3 rounded-full hover:bg-[#2d3a5a] transition font-semibold whitespace-nowrap">
                    <Plus size={18} />
                    Add Requirement
                  </button>
                  <button className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-full hover:bg-green-700 transition font-semibold whitespace-nowrap">
                    📄 Document Viewer
                  </button>
                  <button className="border-2 border-gray-300 text-gray-900 px-6 py-3 rounded-full hover:bg-gray-50 transition font-semibold whitespace-nowrap bg-white">
                    Import
                  </button>
                  <button className="border-2 border-gray-300 text-gray-900 px-6 py-3 rounded-full hover:bg-gray-50 transition font-semibold whitespace-nowrap bg-white">
                    Export
                  </button>
                  <div className="ml-auto flex items-center gap-2 bg-blue-100 px-5 py-2 rounded-full border-2 border-blue-200">
                    <input
                      type="text"
                      placeholder="Search"
                      className="bg-transparent px-2 py-1 text-sm focus:outline-none w-32 placeholder-gray-500 text-gray-700"
                    />
                    <Search size={18} className="text-blue-600" />
                  </div>
                </div>

                {/* Requirements Table */}
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-white border-b border-gray-300">
                      <tr className="text-sm font-bold text-gray-900">
                        <th className="px-6 py-4 text-left">URS ID</th>
                        <th className="px-6 py-4 text-left">URS Title</th>
                        <th className="px-6 py-4 text-left">URS Description</th>
                        <th className="px-6 py-4 text-left">GxP (Y/N)</th>
                        <th className="px-6 py-4 text-left">GxP Risk</th>
                        <th className="px-6 py-4 text-left">Risk Level</th>
                        <th className="px-6 py-4 text-left">Testing Approach</th>
                        <th className="px-6 py-4 text-center">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {requirementsData.map((req, idx) => (
                        <tr key={idx} className="hover:bg-gray-50 transition text-sm">
                          <td className="px-6 py-4 text-gray-900 font-semibold">{req.id}</td>
                          <td className="px-6 py-4 text-gray-900 font-semibold">{req.title}</td>
                          <td className="px-6 py-4 text-gray-600">{req.description}</td>
                          <td className="px-6 py-4 text-left">
                            <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${req.gxp === 'Yes' ? 'border-blue-300 text-blue-700 bg-blue-50' : 'border-gray-300 text-gray-700 bg-gray-50'}`}>
                              {req.gxp}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-left">
                            <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${getRiskColor(req.risk)}`}>
                              {req.risk}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-left text-gray-900 font-semibold">{req.riskLevel}</td>
                          <td className="px-6 py-4 text-left text-gray-900 font-semibold">{req.testing}</td>
                          <td className="px-6 py-4 text-left">
                            <span className={`w-full block text-center px-5 py-2 rounded-full text-sm font-semibold text-white ${req.status === 'Approved' ? 'bg-green-600' : 'bg-amber-500'}`}>
                              {req.status === 'Approved' ? 'Finalized' : 'Draft'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer */}
                <div className="px-8 py-5 bg-white border-t border-gray-200 flex items-center justify-between text-sm text-gray-600">
                  <p>Showing 5 of 12 active projects</p>
                  <div className="flex gap-2">
                    <button className="border border-gray-300 w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition text-gray-600">‹</button>
                    <span className="w-8 h-8 flex items-center justify-center text-gray-900 font-semibold">1</span>
                    <button className="border border-gray-300 w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100 transition text-gray-600">›</button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'Overview' && (
              <div className="space-y-6">
                {/* Artifact Summary */}
                <div style={{ background: '#F7F7F7', borderRadius: '4px' }} className="p-6">
                  <div style={{ marginBottom: '29px' }}>
                    <span className="block font-semibold text-lg text-gray-900">
                      Artifact Summary
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-0">
                    {/* PROJECT Column */}
                    <div style={{ position: 'relative', paddingBottom: '2px' }}>
                      <div style={{ marginBottom: '4px' }}>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          PROJECT
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-base text-gray-900">
                          {projectData.name}
                        </span>
                      </div>
                    </div>

                    {/* ARTIFACT Column */}
                    <div style={{ position: 'relative', paddingBottom: '2px', paddingLeft: '53px' }}>
                      <div style={{ marginBottom: '4px' }}>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          ARTIFACT
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-base text-gray-900">
                          {selectedArtifact.split(' - ')[0]}
                        </span>
                      </div>
                    </div>

                    {/* # REQUIREMENTS Column */}
                    <div style={{ position: 'relative', paddingBottom: '2px', paddingLeft: '26px' }}>
                      <div style={{ marginBottom: '4px' }}>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          # REQUIREMENTS
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-base text-gray-900">
                          72
                        </span>
                      </div>
                    </div>

                    {/* WORKFLOW STATUS Column */}
                    <div style={{ position: 'relative', paddingBottom: '0px', paddingLeft: '32px' }}>
                      <div style={{ marginBottom: '8px' }}>
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                          WORKFLOW STATUS
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', padding: '2px 10px', gap: '10px', width: '89px', height: '22px', background: '#CFCBC8', border: '1px solid #A9A4A0', borderRadius: '12px' }}>
                        <span className="font-medium text-xs text-gray-700">
                          Not Started
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Changes, Open Reviews, Quality Gates - 3 Column Layout */}
                <div className="grid grid-cols-3 gap-6">
                  {/* Recent Changes */}
                  <div style={{ background: '#F5F5F5', borderRadius: '6px', padding: '24px 32px' }}>
                    <div style={{ marginBottom: '32px' }}>
                      <span className="block font-bold text-2xl text-gray-900">
                        Recent Changes
                      </span>
                    </div>
                    
                    <div className="space-y-8">
                      <div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span className="font-bold text-lg text-gray-900">
                            URS-001
                          </span>
                          <span style={{ background: '#EFF6FF', border: '1px solid #BFDBFE', borderRadius: '4px', padding: '4px 12px' }} className="font-medium text-sm text-blue-600">
                            Draft
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          Updated 2h ago by J. Smith
                        </span>
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span className="font-bold text-lg text-gray-900">
                            URS-002
                          </span>
                          <span style={{ background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '4px', padding: '4px 12px' }} className="font-medium text-sm text-amber-600">
                            In Review
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          Submitted 1d ago by M. Lee
                        </span>
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span className="font-bold text-lg text-gray-900">
                            URS-003
                          </span>
                          <span style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '4px', padding: '4px 12px' }} className="font-medium text-sm text-green-600">
                            Approved
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          Approved 3d ago by QA
                        </span>
                      </div>

                      <div>
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '4px' }}>
                          <span className="font-bold text-lg text-gray-900">
                            URS-004
                          </span>
                          <span style={{ background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '4px', padding: '4px 12px' }} className="font-medium text-sm text-green-600">
                            Approved
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          Approved 4d ago by QA
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Open Reviews */}
                  <div style={{ background: '#F7F7F7', borderRadius: '6px', padding: '24px 32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                      <span className="block font-bold text-2xl text-gray-900">
                        Open Reviews
                      </span>
                      <button className="text-blue-600 font-semibold text-sm hover:text-blue-700">
                        View All
                      </button>
                    </div>
                    <div style={{ marginBottom: '20px' }}>
                      <span className="text-sm text-gray-600">
                        URS items awaiting approval from QA/CSV.
                      </span>
                    </div>

                    <div className="space-y-3 flex flex-col">
                      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', padding: '8px 16px', background: '#F3F3F3', border: '1px solid #D1D1D1', borderRadius: '20px', width: 'fit-content' }}>
                        <span className="text-sm text-gray-700">
                          R-012 {'>'}' Request
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', padding: '8px 16px', background: '#F3F3F3', border: '1px solid #D1D1D1', borderRadius: '20px', width: 'fit-content' }}>
                        <span className="text-sm text-gray-700">
                          R-013 {'>'}' Request
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', padding: '8px 16px', background: '#F3F3F3', border: '1px solid #D1D1D1', borderRadius: '20px', width: 'fit-content' }}>
                        <span className="text-sm text-gray-700">
                          R-019 {'>'}' Request
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quality Gates */}
                  <div style={{ background: '#F7F7F7', borderRadius: '6px', padding: '24px 32px' }}>
                    <div style={{ marginBottom: '24px' }}>
                      <span className="block font-bold text-2xl text-gray-900">
                        Quality Gates
                      </span>
                    </div>

                    <div className="space-y-5">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <AlertCircle size={24} className="text-red-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700">
                          All GxP impacting URS must have risk assessment
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EF4444', borderRadius: '50%', color: 'white' }}>
                          <X size={16} />
                        </div>
                        <span className="text-sm text-gray-700">
                          Every URS must trace to ≥1 SRS and ≥1 Test
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <CheckCircle2 size={24} className="text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700">
                          Approved baseline required before QC plan
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'User Requirement Specification' && (
              <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
                <p className="text-gray-600">User Requirement Specification content will be displayed here.</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
