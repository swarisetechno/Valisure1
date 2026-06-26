import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Plus, Moon, Sun, LogOut, LayoutDashboard, FolderOpen, FileText, Search, X, MoreVertical, AlertCircle, CheckCircle2, Eye, User, BookOpen } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { projectApi, documentApi } from '../services/api';

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
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number }>({ top: 0, right: 0 });

  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    projectApi.list().then(res => {
      if (res && res.projects) setProjects(res.projects);
    }).catch(console.error);
  }, []);

  const getArtifactsForProject = () => {
    if (!selectedProject) return [];
    // Backend stores methodologies as JSON (array or string); normalize it
    let raw = selectedProject?.details?.methodologies ||
      selectedProject.csvCsa || selectedProject.methodology || 'CSV';
    if (Array.isArray(raw)) raw = raw[0] || 'CSV';
    const methodology = String(raw).toUpperCase();
    return methodology.includes('CSA') ? csaArtifactsList : csvArtifactsList;
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

  // ── Helpers to decode backend JSON boolean-keyed objects ──────────
  const getMethodologyStr = (data: any): string => {
    const raw = data?.csvCsa || data?.details?.methodologies || data?.methodology;
    if (!raw) return 'CSV';
    if (typeof raw === 'string') return raw.toUpperCase().includes('CSA') ? 'CSA' : 'CSV';
    if (Array.isArray(raw)) { const s = (raw[0] || '').toString(); return s.toUpperCase().includes('CSA') ? 'CSA' : 'CSV'; }
    if (typeof raw === 'object') {
      const parts: string[] = [];
      if (raw.csv) parts.push('CSV');
      if (raw.csa) parts.push('CSA');
      return parts.join(' & ') || 'CSV';
    }
    return 'CSV';
  };

  const getGampStr = (val: any): string => {
    if (!val) return '-';
    if (typeof val === 'string') return val;
    if (Array.isArray(val)) return val.join(', ');
    if (typeof val === 'object') {
      const map: Record<string, string> = { category1: 'Category 1', category2: 'Category 2', category3: 'Category 3', category4: 'Category 4', category5: 'Category 5' };
      return Object.entries(val).filter(([, v]) => v).map(([k]) => map[k] || k).join(', ') || '-';
    }
    return '-';
  };

  const getRegulationStr = (val: any): string => {
    if (!val) return '-';
    if (typeof val === 'string') return val;
    if (Array.isArray(val)) return val.join(', ');
    if (typeof val === 'object') {
      const map: Record<string, string> = { cfr211: '21 CFR Part 211', cfr820: '21 CFR Part 820', annexure11: 'EU Annex 11', iso13485: 'ISO 13485', crf210: '21 CFR Part 210', crf211_2: '21 CFR Part 211' };
      return Object.entries(val).filter(([, v]) => v).map(([k]) => map[k] || k).join(', ') || '-';
    }
    return '-';
  };

  // ── Build project display data from any raw project object ────────
  const buildProjectData = (raw: any) => {
    if (!raw) return null;
    const meth = getMethodologyStr(raw);
    return {
      id: raw.id || 'PROJ001',
      name: raw.name || '-',
      projectId: String(raw.id || 'PROJ001'),
      changeId: raw?.details?.change_number || raw.changeId || '-',
      systemName: raw?.details?.system_application_name || raw.systemName || raw.name || '-',
      gampCategory: getGampStr(raw?.details?.gamp_categories) || raw.gamp || '-',
      methodology: meth,
      regulatoryCoverage: getRegulationStr(raw?.details?.regulations) || raw.regulatoryCoverage || '-',
      artifacts: meth.includes('CSA') ? csaArtifactsList : csvArtifactsList,
    };
  };

  // ── Active project: sidebar selection takes priority over nav state ─
  const activeRaw = selectedProject || incomingProjectData;
  const projectData = buildProjectData(activeRaw) || {
    id: 'PROJ001', name: 'No Project Selected', projectId: '-', changeId: '-',
    systemName: '-', gampCategory: '-', methodology: 'CSV',
    regulatoryCoverage: '-', artifacts: csvArtifactsList
  };

  // ── Requirements: per-project from localStorage, reactive to selection ─
  const [requirementsData, setRequirementsData] = useState<any[]>(() => {
    const pid = activeRaw?.id || 'PROJ001';
    try { return JSON.parse(localStorage.getItem(`requirementsData_${pid}`) || '[]'); }
    catch { return []; }
  });

  // Common Requirements modal states
  const [showCommonReqsModal, setShowCommonReqsModal] = useState(false);
  const [commonReqs, setCommonReqs] = useState<any[]>([]);
  const [selectedCommonReqIds, setSelectedCommonReqIds] = useState<string[]>([]);

  // Load common requirements from localStorage when modal is opened
  useEffect(() => {
    if (showCommonReqsModal) {
      try {
        const stored = localStorage.getItem('commonRequirementsData');
        if (stored) {
          setCommonReqs(JSON.parse(stored));
        } else {
          setCommonReqs([]);
        }
      } catch {
        setCommonReqs([]);
      }
    }
  }, [showCommonReqsModal]);

  const handleAddCommonReqsToProject = () => {
    if (selectedCommonReqIds.length === 0) {
      alert('Please select at least one requirement to add.');
      return;
    }

    const pid = selectedProject?.id || incomingProjectData?.id || 'PROJ001';
    const key = `requirementsData_${pid}`;
    let existing = [];
    try {
      existing = JSON.parse(localStorage.getItem(key) || '[]');
    } catch {
      existing = [];
    }

    const toAdd = commonReqs.filter(cr => selectedCommonReqIds.includes(cr.id));
    
    const newRequirements = toAdd.map((cr, index) => {
      const counter = existing.length + index + 1;
      const ursId = `URS_${String(counter).padStart(3, '0')}`;
      return {
        id: ursId,
        title: cr.title,
        description: cr.description,
        ursEnhanced: cr.ursEnhanced || cr.description,
        gxp: cr.gxp || 'Yes',
        gxpReference: cr.gxpReference || '',
        risk: cr.risk || 'Medium',
        riskLevel: cr.riskLevel || 'Risk - 2',
        testing: cr.testing || 'Unscripted',
        status: 'Draft',
        versions: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
    });

    const updated = [...existing, ...newRequirements];
    localStorage.setItem(key, JSON.stringify(updated));
    setRequirementsData(updated);
    setShowCommonReqsModal(false);
    setSelectedCommonReqIds([]);
    alert(`Successfully added ${newRequirements.length} requirement(s) to this project!`);
  };

  // Reload requirements whenever the active project changes
  useEffect(() => {
    const pid = (selectedProject?.id || incomingProjectData?.id || 'PROJ001');
    try {
      setRequirementsData(JSON.parse(localStorage.getItem(`requirementsData_${pid}`) || '[]'));
    } catch { setRequirementsData([]); }
  }, [selectedProject]);

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

  const handleDeleteRequirement = async (reqId: string) => {
    if (!confirm('Delete this requirement? This will also remove it from the document.')) return;
    const pid = selectedProject?.id || incomingProjectData?.id || 'PROJ001';
    const key = `requirementsData_${pid}`;
    try {
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      const reqToDelete = existing.find((r: any) => r.id === reqId);
      
      // Delete from backend DB if we have an entry ID
      if (reqToDelete?.dbEntryId) {
        try {
          await documentApi.deleteEntry(reqToDelete.dbEntryId);
          console.log('[deleteEntry] Removed from DB, entry_id:', reqToDelete.dbEntryId);
        } catch (e) {
          console.warn('[deleteEntry] Could not remove from DB:', e);
        }
      }

      const updated = existing.filter((r: any) => r.id !== reqId);
      localStorage.setItem(key, JSON.stringify(updated));
      setRequirementsData(updated);
      setOpenMenuId(null);
    } catch (error) {
      console.error('Error deleting requirement:', error);
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
            <div className={`flex items-center justify-center w-10 h-10 rounded-full bg-[#91A1D4]`}>
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
                  const val = e.target.value;
                  const project = projects.find(p => String(p.id) === String(val));
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
            <p className="text-sm font-semibold text-[#F7F7F7]">Welcome, {localStorage.getItem("userName") || "Author"}</p>
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full border-2 border-[#FAC277] flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
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
              </div>
              <div className="grid grid-cols-3 gap-6 mt-6">
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
                  <button
                    onClick={() => navigate("/bulk-user-requirements", {
                      state: { projectData: activeRaw, selectedArtifact }
                    })}
                    className="flex items-center gap-2 bg-[#1D2749] text-white px-6 py-3 rounded-full hover:bg-[#2d3a5a] transition font-semibold whitespace-nowrap"
                  >
                    <Plus size={18} />
                    Add Requirement
                  </button>
                  <button
                    onClick={() => setShowCommonReqsModal(true)}
                    className="flex items-center gap-2 bg-[#3A4E92] text-white px-6 py-3 rounded-full hover:bg-[#4a5f9f] transition font-semibold whitespace-nowrap"
                  >
                    <BookOpen size={18} />
                    Common Requirements
                  </button>
                  <button className="flex items-center gap-2 bg-green-600 text-white px-6 py-3 rounded-full hover:bg-green-700 transition font-semibold whitespace-nowrap">
                    <Eye size={18} />
                    Document Viewer
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
                        <th className="px-6 py-4 text-center">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {requirementsData.map((req, idx) => (
                        <tr
                          key={idx}
                          className={`text-sm relative ${req.status === 'Draft' ? 'hover:bg-blue-50 transition' : 'hover:bg-gray-50 transition'}`}
                        >
                          <td
                            className="px-6 py-4 text-gray-900 font-semibold cursor-pointer"
                            onClick={() => req.status === 'Draft' && navigate('/bulk-user-requirements', { state: { projectData: activeRaw, selectedArtifact, draftData: req } })}
                          >
                            {req.id}
                          </td>
                          <td
                            className="px-6 py-4 text-gray-900 font-semibold cursor-pointer"
                            onClick={() => req.status === 'Draft' && navigate('/bulk-user-requirements', { state: { projectData: activeRaw, selectedArtifact, draftData: req } })}
                          >
                            {req.title}
                          </td>
                          <td className="px-6 py-4 text-gray-600">{req.ursEnhanced || req.description}</td>
                          <td className="px-6 py-4 text-left">
                            <span className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${req.gxp === 'Yes' ? 'border-blue-400 text-blue-700 bg-blue-50' : 'border-gray-400 text-gray-700 bg-gray-50'}`}>
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
                            <span className={`w-full block text-center px-5 py-2 rounded-full text-sm font-semibold text-white ${['Submitted', 'Approved', 'Finalized'].includes(req.status) ? 'bg-green-600' : 'bg-amber-500'}`}>
                              {req.status === 'Draft' ? 'Draft' : req.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="relative inline-block text-left">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(openMenuId === req.id ? null : req.id);
                                }}
                                className="inline-flex items-center justify-center w-8 h-8 hover:bg-gray-200 rounded-full transition relative z-20"
                              >
                                <MoreVertical size={18} className="text-gray-600" />
                              </button>
                              
                              {openMenuId === req.id && (
                                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
                                  <div className="py-1" role="menu" aria-orientation="vertical">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        navigate('/bulk-user-requirements', { state: { projectData: activeRaw, selectedArtifact, draftData: req } });
                                      }}
                                      className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                                      role="menuitem"
                                    >
                                      <FileText size={16} className="mr-3 text-gray-400" />
                                      Edit
                                    </button>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleDeleteRequirement(req.id);
                                      }}
                                      className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left font-semibold"
                                      role="menuitem"
                                    >
                                      <X size={16} className="mr-3 text-red-500" />
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Table Footer */}
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-300">
                  <p className="text-xs font-semibold text-[#504539]">
                    Showing {requirementsData.length} of {requirementsData.length} active requirements
                  </p>
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
            )}

            {activeTab === 'Overview' && (
              <div className="space-y-6">
                {/* Artifact Summary */}
                <div style={{ background: '#F7F7F7', borderRadius: '4px' }} className="p-6">
                  <div style={{ marginBottom: '29px' }}>
                    <span className="block font-semibold text-lg text-gray-900">Artifact Summary</span>
                  </div>
                  <div className="grid grid-cols-4 gap-0">
                    <div style={{ position: 'relative', paddingBottom: '2px' }}>
                      <div style={{ marginBottom: '4px' }}><span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">PROJECT</span></div>
                      <div><span className="font-medium text-base text-gray-900">{projectData.name}</span></div>
                    </div>
                    <div style={{ position: 'relative', paddingBottom: '2px', paddingLeft: '53px' }}>
                      <div style={{ marginBottom: '4px' }}><span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">ARTIFACT</span></div>
                      <div><span className="font-medium text-base text-gray-900">{selectedArtifact.split(' - ')[0]}</span></div>
                    </div>
                    <div style={{ position: 'relative', paddingBottom: '2px', paddingLeft: '26px' }}>
                      <div style={{ marginBottom: '4px' }}><span className="text-xs font-semibold text-gray-500 uppercase tracking-wider"># REQUIREMENTS</span></div>
                      <div><span className="font-medium text-base text-gray-900">{requirementsData.length}</span></div>
                    </div>
                    <div style={{ position: 'relative', paddingBottom: '0px', paddingLeft: '32px' }}>
                      <div style={{ marginBottom: '8px' }}><span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">WORKFLOW STATUS</span></div>
                      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', padding: '2px 10px', gap: '10px', width: '89px', height: '22px', background: '#CFCBC8', border: '1px solid #A9A4A0', borderRadius: '12px' }}>
                        <span className="font-medium text-xs text-gray-700">Not Started</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Changes, Open Reviews, Quality Gates */}
                <div className="grid grid-cols-3 gap-6">
                  {/* Recent Changes */}
                  <div style={{ background: '#F5F5F5', borderRadius: '6px', padding: '24px 32px' }}>
                    <div style={{ marginBottom: '32px' }}><span className="block font-bold text-2xl text-gray-900">Recent Changes</span></div>
                    <div className="space-y-8">
                      {[{ id: 'URS-001', status: 'Draft', time: 'Updated 2h ago by J. Smith', style: { background: '#EFF6FF', border: '1px solid #BFDBFE', color: '#2563EB' } },
                        { id: 'URS-002', status: 'In Review', time: 'Submitted 1d ago by M. Lee', style: { background: '#FFFBEB', border: '1px solid #FDE68A', color: '#D97706' } },
                        { id: 'URS-003', status: 'Approved', time: 'Approved 3d ago by QA', style: { background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#059669' } },
                        { id: 'URS-004', status: 'Approved', time: 'Approved 4d ago by QA', style: { background: '#ECFDF5', border: '1px solid #A7F3D0', color: '#059669' } }
                      ].map(item => (
                        <div key={item.id}>
                          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '4px' }}>
                            <span className="font-bold text-lg text-gray-900">{item.id}</span>
                            <span style={{ ...item.style, borderRadius: '4px', padding: '4px 12px', fontSize: '14px', fontWeight: 500 }}>{item.status}</span>
                          </div>
                          <span className="text-sm text-gray-500">{item.time}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Open Reviews */}
                  <div style={{ background: '#F7F7F7', borderRadius: '6px', padding: '24px 32px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                      <span className="block font-bold text-2xl text-gray-900">Open Reviews</span>
                      <button className="text-blue-600 font-semibold text-sm hover:text-blue-700">View All</button>
                    </div>
                    <div style={{ marginBottom: '20px' }}><span className="text-sm text-gray-600">URS items awaiting approval from QA/CSV.</span></div>
                    <div className="space-y-3 flex flex-col">
                      {['R-012', 'R-013', 'R-019'].map(r => (
                        <div key={r} style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'flex-start', padding: '8px 16px', background: '#F3F3F3', border: '1px solid #D1D1D1', borderRadius: '20px', width: 'fit-content' }}>
                          <span className="text-sm text-gray-700">{r} &gt; Request</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Quality Gates */}
                  <div style={{ background: '#F7F7F7', borderRadius: '6px', padding: '24px 32px' }}>
                    <div style={{ marginBottom: '24px' }}><span className="block font-bold text-2xl text-gray-900">Quality Gates</span></div>
                    <div className="space-y-5">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <AlertCircle size={24} className="text-red-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700">All GxP impacting URS must have risk assessment</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#EF4444', borderRadius: '50%', color: 'white' }}>
                          <X size={16} />
                        </div>
                        <span className="text-sm text-gray-700">Every URS must trace to ≥1 SRS and ≥1 Test</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <CheckCircle2 size={24} className="text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700">Approved baseline required before QC plan</span>
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

            {/* Common Requirements Selector Modal */}
            {showCommonReqsModal && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-2xl shadow-xl border border-gray-200 max-w-6xl w-full max-h-[90vh] overflow-y-auto flex flex-col">
                  {/* Modal Header */}
                  <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <BookOpen size={24} className="text-[#3A4E92]" />
                      <div>
                        <h3 className="text-xl font-bold text-gray-900">Select Common Requirements</h3>
                        <p className="text-xs text-gray-500 mt-0.5">Select global requirements to import into this project</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        setShowCommonReqsModal(false);
                        setSelectedCommonReqIds([]);
                      }}
                      className="text-gray-400 hover:text-gray-600 transition text-lg font-bold"
                    >
                      ✕
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div className="p-8 overflow-y-auto flex-1">
                    {commonReqs.length === 0 ? (
                      <div className="text-center py-16 text-gray-400">
                        <BookOpen size={48} className="mx-auto mb-3 opacity-30" />
                        <p className="text-base font-semibold text-gray-700">No Common Requirements Available</p>
                        <p className="text-xs mt-1 text-gray-500">Go to Author Dashboard → Common Requirements to manually add them first.</p>
                      </div>
                    ) : (
                      <div className="overflow-x-auto border border-gray-200 rounded-lg">
                        <table className="w-full">
                          <thead className="bg-white border-b border-gray-300">
                            <tr className="text-sm font-bold text-gray-900">
                              <th className="px-6 py-4 text-center w-12">
                                <input
                                  type="checkbox"
                                  checked={selectedCommonReqIds.length === commonReqs.length}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setSelectedCommonReqIds(commonReqs.map(r => r.id));
                                    } else {
                                      setSelectedCommonReqIds([]);
                                    }
                                  }}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                              </th>
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
                            {commonReqs.map((cr) => {
                              const isChecked = selectedCommonReqIds.includes(cr.id);
                              return (
                                <tr 
                                  key={cr.id} 
                                  className={`text-sm relative transition hover:bg-gray-50 cursor-pointer ${isChecked ? 'bg-blue-50/30 hover:bg-blue-50/50' : ''}`}
                                  onClick={() => {
                                    if (isChecked) {
                                      setSelectedCommonReqIds(prev => prev.filter(id => id !== cr.id));
                                    } else {
                                      setSelectedCommonReqIds(prev => [...prev, cr.id]);
                                    }
                                  }}
                                >
                                  <td className="px-6 py-4 text-center" onClick={e => e.stopPropagation()}>
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      onChange={(e) => {
                                        if (e.target.checked) {
                                          setSelectedCommonReqIds(prev => [...prev, cr.id]);
                                        } else {
                                          setSelectedCommonReqIds(prev => prev.filter(id => id !== cr.id));
                                        }
                                      }}
                                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                  </td>
                                  <td className="px-6 py-4 text-gray-900 font-semibold">{cr.id}</td>
                                  <td className="px-6 py-4 text-gray-900 font-semibold">{cr.title}</td>
                                  <td className="px-6 py-4 text-gray-600">{cr.ursEnhanced || cr.description}</td>
                                  <td className="px-6 py-4 text-left">
                                    <span className={`px-4 py-2 rounded-full text-sm font-semibold border-2 ${cr.gxp === 'Yes' ? 'border-blue-400 text-blue-700 bg-blue-50' : 'border-gray-400 text-gray-700 bg-gray-50'}`}>
                                      {cr.gxp || '—'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-left">
                                    <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${getRiskColor(cr.risk)}`}>
                                      {cr.risk || '—'}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-left text-gray-900 font-semibold">{cr.riskLevel || '—'}</td>
                                  <td className="px-6 py-4 text-left text-gray-900 font-semibold">{cr.testing || '—'}</td>
                                  <td className="px-6 py-4 text-left">
                                    <span className={`w-full block text-center px-5 py-2 rounded-full text-sm font-semibold text-white ${['Submitted', 'Approved', 'Finalized'].includes(cr.status) ? 'bg-green-600' : 'bg-amber-500'}`}>
                                      {cr.status || 'Draft'}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* Modal Footer */}
                  <div className="px-8 py-5 bg-gray-50 border-t border-gray-100 flex items-center justify-between rounded-b-2xl">
                    <span className="text-xs text-gray-500 font-semibold">
                      {selectedCommonReqIds.length} requirement(s) selected
                    </span>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => {
                          setShowCommonReqsModal(false);
                          setSelectedCommonReqIds([]);
                        }}
                        className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 hover:bg-gray-100 transition"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleAddCommonReqsToProject}
                        disabled={selectedCommonReqIds.length === 0}
                        className={`px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition ${selectedCommonReqIds.length === 0 ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                      >
                        Add to Project
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
