import { useState, useEffect } from 'react';
import {
  ChevronRight, Eye, LogOut, LayoutDashboard, FolderOpen, FileText,
  Search, Moon, Sun, ChevronLeft, ChevronDown, Plus,
  BookOpen, User,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { projectApi } from '../services/api';

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
interface CommonRequirement {
  id: string;
  title: string;
  description: string;
  ursEnhanced: string;
  gxp: string;
  gxpReference: string;
  risk: string;
  riskLevel: string;
  testing: string;
  status: string;
  projectName: string; // which project this requirement belongs to
  projectId: string | number;
}



export default function AuthorDashboard() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [activeView, setActiveView] = useState<'dashboard' | 'common-requirements'>('dashboard');
  const [expandedMenu, setExpandedMenu] = useState({
    projects: false,
    artifacts: false,
    commonReqs: false,
  });
  const [projects, setProjects] = useState<any[]>([]);

  // ── Common Requirements state ──────────────────────────────────────
  const [commonReqs, setCommonReqs] = useState<CommonRequirement[]>([]);
  const [crsSearch, setCrsSearch] = useState('');

  // ── Projects fetch ────────────────────────────────────────────────
  useEffect(() => {
    projectApi.list()
      .then(res => { if (res?.projects) setProjects(res.projects); })
      .catch(console.error);
  }, []);

  // Aggregate user requirements from all projects
  useEffect(() => {
    const aggregated: CommonRequirement[] = [];
    projects.forEach(proj => {
      try {
        const stored = localStorage.getItem(`requirementsData_${proj.id}`);
        if (stored) {
          const reqs = JSON.parse(stored);
          if (Array.isArray(reqs)) {
            reqs.forEach((r: any) => {
              aggregated.push({
                ...r,
                projectName: proj.name,
                projectId: proj.id
              });
            });
          }
        }
      } catch (e) {
        console.error(`Error parsing requirements for project ${proj.id}:`, e);
      }
    });
    setCommonReqs(aggregated);
  }, [projects]);

  // ── Artifacts list ────────────────────────────────────────────────
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
    const raw = selectedProject?.details?.methodologies || selectedProject.csvCsa || selectedProject.methodology;
    if (!raw) return csvArtifacts;
    if (typeof raw === 'object' && !Array.isArray(raw)) {
      if (raw.csa && !raw.csv) return csaArtifacts;
      return csvArtifacts;
    }
    const str = Array.isArray(raw) ? (raw[0] || 'CSV') : raw;
    return String(str).toUpperCase().includes('CSA') && !String(str).toUpperCase().includes('CSV')
      ? csaArtifacts : csvArtifacts;
  };

  // ── Dashboard documents (static sample) ───────────────────────────
  const documents = [
    { id: 'DOC001', projectName: 'Customer Portal', documentName: 'User Requirements Specification', dueDate: '2023-10-25', priority: 'High' as const, status: 'Draft' as const },
    { id: 'DOC042', projectName: 'LIMS Upgrade', documentName: 'Validation Summary Report', dueDate: '2023-11-02', priority: 'Medium' as const, status: 'Submitted' as const },
    { id: 'DOC089', projectName: 'Cloud Migration', documentName: 'Risk Assessment Matrix', dueDate: '2023-09-30', priority: 'High' as const, status: 'Revision required' as const },
    { id: 'DOC112', projectName: 'Pharma LIMS', documentName: 'System Design Document', dueDate: '2023-11-15', priority: 'Low' as const, status: 'Draft' as const },
  ];

  const getPriorityStyles = (p: string) =>
    p === 'High' ? 'bg-red-100 text-red-700' : p === 'Medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-200 text-gray-600';
  const getDocStatusStyles = (s: string) =>
    s === 'Draft' ? 'bg-blue-100 text-blue-700' : s === 'Submitted' ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700';
  const getReqStatusColor = (s: string) =>
    ['Submitted', 'Approved', 'Finalized'].includes(s) ? 'bg-green-600 text-white' : 'bg-amber-500 text-white';
  const getRiskColor = (r: string) =>
    r === 'High' ? 'bg-red-100 text-red-700 font-semibold' : r === 'Medium' ? 'bg-amber-50 text-amber-700 font-semibold' : 'bg-green-50 text-green-700 font-semibold';

  const handleLogout = () => {
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    navigate('/');
  };

  const filteredCommonReqs = commonReqs.filter(r =>
    (r.id || '').toLowerCase().includes(crsSearch.toLowerCase()) ||
    (r.projectName || '').toLowerCase().includes(crsSearch.toLowerCase()) ||
    (r.title || '').toLowerCase().includes(crsSearch.toLowerCase()) ||
    (r.description || '').toLowerCase().includes(crsSearch.toLowerCase()) ||
    (r.ursEnhanced || '').toLowerCase().includes(crsSearch.toLowerCase())
  );
  
  return (
    <div className={`min-h-screen ${darkMode ? 'bg-[#DAE0F1]' : 'bg-gray-100'}`}>

      {/* â”€â”€ SIDEBAR â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <aside className={`fixed left-0 top-0 h-screen bg-[#1D2749] transition-all duration-300 z-40 flex flex-col ${sidebarOpen ? 'w-64' : 'w-24'}`}>
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
        <nav className={`flex flex-col gap-3 flex-1 overflow-y-auto ${sidebarOpen ? "px-7 py-10" : "px-3 py-10"}`}>

          {/* Dashboard */}
          <button
            onClick={() => setActiveView('dashboard')}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-white transition w-full ${!sidebarOpen ? 'justify-center' : ''} ${activeView === 'dashboard' ? 'bg-[#3A4E92]' : 'hover:bg-[#2d3a5a]'}`}
            title="Author Dashboard"
          >
            <LayoutDashboard size={22} />
            {sidebarOpen && <span className="text-sm font-medium">Author Dashboard</span>}
          </button>

          {/* Projects */}
          <button
            onClick={() => setExpandedMenu(p => ({ ...p, projects: !p.projects }))}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-white hover:bg-[#2d3a5a] transition w-full ${!sidebarOpen ? 'justify-center' : ''}`}
            title="Projects"
          >
            <FolderOpen size={20} />
            {sidebarOpen && <span className="text-sm font-medium flex-1 text-left">Projects</span>}
            {sidebarOpen && <ChevronDown size={16} className={`transition-transform ${expandedMenu.projects ? 'rotate-180' : ''}`} />}
          </button>
          {sidebarOpen && expandedMenu.projects && (
            <div className="pl-10 pr-2 py-2">
              <select
                value={selectedProject?.id || ''}
                onChange={e => {
                  const project = projects.find(p => String(p.id) === e.target.value);
                  setSelectedProject(project || null);
                  if (project) setExpandedMenu(p => ({ ...p, artifacts: true }));
                }}
                className="w-full bg-[#2d3a5a] border border-[#6D81C5] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#91A1D4]"
              >
                <option value="">Choose project</option>
                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          )}

          {/* Artifacts */}
          {selectedProject && (
            <>
              <button
                onClick={() => setExpandedMenu(p => ({ ...p, artifacts: !p.artifacts }))}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-white hover:bg-[#2d3a5a] transition w-full ${!sidebarOpen ? 'justify-center' : ''}`}
                title="Artifacts"
              >
                <FileText size={20} />
                {sidebarOpen && <span className="text-sm font-medium flex-1 text-left">Artifacts</span>}
                {sidebarOpen && <ChevronDown size={16} className={`transition-transform ${expandedMenu.artifacts ? 'rotate-180' : ''}`} />}
              </button>
              {sidebarOpen && expandedMenu.artifacts && (
                <div className="flex flex-col gap-0.5 pl-10 pr-2 py-1 max-h-60 overflow-y-auto">
                  {getArtifactsForProject().map(artifact => (
                    <button
                      key={artifact.id}
                      onClick={() => navigate('/project-artifact-overview', { state: { projectData: selectedProject, selectedArtifact: artifact.name } })}
                      className="flex items-center justify-between text-xs text-gray-300 hover:text-white transition py-2 px-2 rounded hover:bg-[#2d3a5a] text-left"
                    >
                      <span className="truncate flex-1">{artifact.name}</span>
                      {!artifact.checked && <Plus size={13} className="text-orange-400 flex-shrink-0 ml-2" />}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}

          {/* €€ Common Requirements (always visible, below Artifacts) €€ */}
          <button
            onClick={() => {
              setActiveView('common-requirements');
              setExpandedMenu(p => ({ ...p, commonReqs: !p.commonReqs }));
            }}
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-white transition w-full ${!sidebarOpen ? 'justify-center' : ''} ${activeView === 'common-requirements' ? 'bg-[#3A4E92]' : 'hover:bg-[#2d3a5a]'}`}
            title="Common Requirements"
          >
            <BookOpen size={20} />
            {sidebarOpen && <span className="text-sm font-medium flex-1 text-left">Common Requirements</span>}
            {sidebarOpen && (
              <span className="bg-[#6D81C5] text-white text-xs font-bold px-2 py-0.5 rounded-full min-w-[22px] text-center">
                {commonReqs.length}
              </span>
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

      {/* â”€â”€ MAIN CONTENT â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      <div className={`transition-all duration-300 ${sidebarOpen ? 'lg:ml-64' : 'lg:ml-24'}`}>
        {/* Top Header */}
        <header className={`bg-[#1D2749] text-white h-20 flex items-center justify-between px-5 lg:px-8 fixed lg:absolute top-0 left-0 right-0 z-30 ${sidebarOpen ? 'lg:left-64' : 'lg:left-24'} transition-all duration-300`}>
          <button
            onClick={() => setSidebarOpen(o => !o)}
            className="flex items-center justify-center w-6 h-6 bg-[#DAE0F1] rounded-full hover:opacity-80 transition"
          >
            {sidebarOpen ? <ChevronLeft size={16} className="text-[#3A4E92]" /> : <ChevronRight size={16} className="text-[#3A4E92]" />}
          </button>
          <div className="flex items-center gap-4">
            <p className="text-sm font-semibold text-[#F7F7F7]">Welcome, {localStorage.getItem('userName') || 'Author'}</p>
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full border-2 border-[#FAC277] flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
          </div>
        </header>

        {/* â”€â”€ DASHBOARD VIEW â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
        {activeView === 'dashboard' && (
          <main className="p-8 pt-24">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Author Dashboard</h2>
            </div>

            {/* Active Projects Card */}
            <div className="mb-8">
              <div style={{ boxSizing: 'border-box', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '24px', gap: '21px', width: '298px', height: '152px', background: '#FDFDFD', border: '1px solid #3A4E92', boxShadow: '0px 20px 40px rgba(31, 27, 22, 0.06)', borderRadius: '12px' }}>
                <span style={{ fontWeight: '700', fontSize: '12px', lineHeight: '16px', letterSpacing: '1.2px', textTransform: 'uppercase', color: '#504539' }}>Active Projects</span>
                <span style={{ fontWeight: '600', fontSize: '36px', lineHeight: '40px', color: '#6D81C5' }}>
                  {String(projects.length).padStart(2, '0')}
                </span>
              </div>
            </div>

            {/* Project Table */}
            <div className="bg-white rounded-lg shadow-lg">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h3 className="text-2xl font-bold text-gray-900">Project Artifacts/Deliverables</h3>
                <div className="flex items-center gap-3 rounded-full px-5 py-2 w-80" style={{ backgroundColor: '#DAE0F1' }}>
                  <input type="text" placeholder="Search" className="bg-transparent text-sm outline-none flex-1" style={{ color: 'rgba(0,0,0,0.7)' }} />
                  <Search size={18} className="text-gray-600" />
                </div>
              </div>
              <div className="grid px-8 py-3 text-xs font-bold uppercase tracking-wide text-gray-700" style={{ backgroundColor: '#B8C5E0', gridTemplateColumns: '1fr 1fr 1.5fr 1fr 1fr 1fr 0.6fr' }}>
                <div>Document ID</div><div>Project Name</div><div>Document Name</div>
                <div>Due Date</div><div>Priority</div><div>Status</div><div className="text-center">View</div>
              </div>
              <div className="divide-y divide-gray-200">
                {documents.map((doc, idx) => (
                  <div key={idx} className="grid px-8 py-4 hover:bg-gray-50 transition items-center" style={{ gridTemplateColumns: '1fr 1fr 1.5fr 1fr 1fr 1fr 0.6fr' }}>
                    <div className="text-sm font-medium text-gray-700">{doc.id}</div>
                    <div className="text-sm font-semibold text-gray-900">{doc.projectName}</div>
                    <div className="text-sm font-semibold text-gray-900">{doc.documentName}</div>
                    <div className="text-sm text-gray-700">{doc.dueDate}</div>
                    <div><span className={`text-xs font-semibold px-3 py-1 rounded-full ${getPriorityStyles(doc.priority)}`}>{doc.priority}</span></div>
                    <div><span className={`text-xs font-semibold px-3 py-1 rounded-full ${getDocStatusStyles(doc.status)}`}>{doc.status}</span></div>
                    <div className="flex justify-center"><Eye size={20} className="text-gray-600 cursor-pointer hover:text-gray-900 transition" /></div>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between px-6 py-4 border-t border-gray-300">
                <p className="text-xs font-semibold text-[#504539]">
                  Showing {documents.length} of {documents.length} active projects
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
          </main>
        )}

        {/* ── COMMON REQUIREMENTS VIEW ───────────────────────────── */}
        {activeView === 'common-requirements' && (
          <main className="p-8 pt-24">
            <div className="mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Common Requirements</h2>
              <p className="text-sm text-gray-500 mt-1">
                All user requirements across all projects — {commonReqs.length} total
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              {/* Toolbar */}
              <div className="px-8 py-5 flex items-center gap-4 border-b border-gray-200 flex-wrap">
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border-2 border-blue-100 rounded-lg">
                  <BookOpen size={16} className="text-[#3A4E92]" />
                  <span className="text-sm font-semibold text-[#1D2749]">
                    {commonReqs.length} Requirement{commonReqs.length !== 1 ? 's' : ''} across {projects.length} Project{projects.length !== 1 ? 's' : ''}
                  </span>
                </div>
                <div className="ml-auto flex items-center gap-2 bg-blue-50 px-5 py-2 rounded-full border-2 border-blue-200">
                  <input
                    type="text"
                    placeholder="Search by ID, title, project…"
                    value={crsSearch}
                    onChange={e => setCrsSearch(e.target.value)}
                    className="bg-transparent px-2 py-1 text-sm focus:outline-none w-52 placeholder-gray-500 text-gray-700"
                  />
                  <Search size={18} className="text-blue-600" />
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead style={{ backgroundColor: '#B8C5E0' }}>
                    <tr className="text-xs font-bold uppercase tracking-wide text-gray-700">
                      <th className="px-5 py-4 text-left">URS ID</th>
                      <th className="px-5 py-4 text-left">Project Name</th>
                      <th className="px-5 py-4 text-left">URS Title</th>
                      <th className="px-5 py-4 text-left">URS Description</th>
                      <th className="px-5 py-4 text-left">GxP (Y/N)</th>
                      <th className="px-5 py-4 text-left">GxP Risk</th>
                      <th className="px-5 py-4 text-left">Risk Level</th>
                      <th className="px-5 py-4 text-left">Testing Approach</th>
                      <th className="px-5 py-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredCommonReqs.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="px-6 py-16 text-center text-gray-400">
                          <BookOpen size={40} className="mx-auto mb-3 opacity-40" />
                          <p className="text-sm font-medium text-gray-600">No requirements found</p>
                          <p className="text-xs mt-1 text-gray-400">
                            {commonReqs.length === 0
                              ? 'Add user requirements via Projects → Artifacts → URS to see them here'
                              : 'No results match your search'}
                          </p>
                        </td>
                      </tr>
                    ) : (
                      filteredCommonReqs.map((req) => (
                        <tr
                          key={req.id}
                          onClick={() => {
                            const proj = projects.find(p => String(p.id) === String(req.projectId));
                            if (proj) {
                              navigate('/project-artifact-overview', { state: { projectData: proj, selectedArtifact: 'URS - User Request Specification' } });
                            }
                          }}
                          className="hover:bg-blue-50/50 cursor-pointer transition-colors text-sm"
                          title="Click to view requirement in project"
                        >
                          <td className="px-6 py-4 text-gray-900 font-semibold">{req.id}</td>
                          <td className="px-6 py-4 text-gray-900 font-semibold max-w-[150px]">
                            <span className="truncate block" title={req.projectName}>{req.projectName}</span>
                          </td>
                          <td className="px-6 py-4 text-gray-900 font-semibold max-w-[160px]">
                            <span className="truncate block" title={req.title}>{req.title}</span>
                          </td>
                          <td className="px-6 py-4 text-gray-600 max-w-[200px]">
                            <span className="line-clamp-2 block" title={req.ursEnhanced || req.description}>
                              {req.ursEnhanced || req.description}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1.5 rounded-full text-xs font-semibold border-2 ${req.gxp === 'Yes' ? 'border-blue-400 text-blue-700 bg-blue-50' : 'border-gray-300 text-gray-700 bg-gray-50'}`}>
                              {req.gxp || '—'}
                            </span>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${req.risk ? getRiskColor(req.risk) : 'text-gray-400'}`}>
                              {req.risk || '—'}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-gray-900 font-medium">{req.riskLevel || '—'}</td>
                          <td className="px-6 py-4 text-gray-900 font-medium">{req.testing || '—'}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-semibold ${getReqStatusColor(req.status)}`}>
                              {req.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Footer */}
              {filteredCommonReqs.length > 0 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-300">
                  <p className="text-xs font-semibold text-[#504539]">
                    Showing {filteredCommonReqs.length} of {commonReqs.length} requirements
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
              )}
            </div>
          </main>
        )}
      </div>


    </div>
  );
}
