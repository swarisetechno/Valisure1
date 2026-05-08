import { useState, useEffect } from 'react';
import { ChevronRight, Eye, LogOut, LayoutDashboard, FolderOpen, FileText, Lock, Palette, Search, Moon, Sun, ChevronLeft, ChevronDown, FileStack, Hourglass, CheckCircle2, AlertCircle, Plus, FilePen } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { projectApi } from '../services/api';

interface DocumentRow {
  id: string;
  projectName: string;
  documentName: string;
  dueDate: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Draft' | 'Submitted' | 'Revision required';
}

export default function AuthorDashboard() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [expandedMenu, setExpandedMenu] = useState({
    dashboard: true,
    projects: false,
    artifacts: false,
  });

  const [projects, setProjects] = useState<any[]>([]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await projectApi.list();
        if (response && response.projects) {
          setProjects(response.projects);
        }
      } catch (err) {
        console.error("Failed to fetch projects", err);
      }
    };
    fetchProjects();
  }, []);

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
    const raw = selectedProject?.details?.methodologies ||
      selectedProject.csvCsa || selectedProject.methodology;
    if (!raw) return csvArtifacts;
    // Object case from backend: {csv: true, csa: false}
    if (typeof raw === 'object' && !Array.isArray(raw)) {
      if (raw.csa && !raw.csv) return csaArtifacts;
      return csvArtifacts; // default to CSV (or both)
    }
    // Array or string
    const str = Array.isArray(raw) ? (raw[0] || 'CSV') : raw;
    return String(str).toUpperCase().includes('CSA') && !String(str).toUpperCase().includes('CSV')
      ? csaArtifacts : csvArtifacts;
  };

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    navigate("/");
  };

  const activeProjectsCount = projects.length || 0;

  const documents: DocumentRow[] = [
    {
      id: 'DOC001',
      projectName: 'Customer Portal',
      documentName: 'User requirements  specification',
      dueDate: '2023-10-25',
      priority: 'High',
      status: 'Draft'
    },
    {
      id: 'DOC042',
      projectName: 'LIMS Upgrade',
      documentName: 'Validation summer Report',
      dueDate: '2023-11-02',
      priority: 'Medium',
      status: 'Submitted'
    },
    {
      id: 'DOC089',
      projectName: 'Cloud Migration',
      documentName: 'Risk Assessment  Matrix',
      dueDate: '2023-09-30',
      priority: 'High',
      status: 'Revision required'
    },
    {
      id: 'DOC112',
      projectName: 'Pharma LIMS',
      documentName: 'System design Document',
      dueDate: '2023-11-15',
      priority: 'Low',
      status: 'Draft'
    }
  ];

  const filteredDocuments = documents.filter(doc =>
    doc.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doc.documentName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPriorityStyles = (priority: string) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-700';
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700';
      case 'Low':
        return 'bg-gray-200 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'Draft':
        return 'bg-blue-100 text-blue-700';
      case 'Submitted':
        return 'bg-orange-100 text-orange-700';
      case 'Revision required':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
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
          {sidebarOpen && (
            <div className={`flex items-center justify-center w-8 h-8 rounded-full bg-[#91A1D4]`}>
              <span className="text-white font-bold text-sm">VS</span>
            </div>
          )}
          {!sidebarOpen && (
            <div className={`flex items-center justify-center w-10 h-10 rounded-full bg-[#91A1D4]`}>
              <span className="text-white font-bold text-sm">VS</span>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className={`flex flex-col gap-3 ${sidebarOpen ? "px-7 py-10" : "px-3 py-10"}`}>
          {/* Dashboard */}
          <a
            href="#"
            className={`flex items-center gap-3 rounded-lg px-4 py-3 text-white hover:bg-[#2d3a5a] transition ${!sidebarOpen ? "justify-center" : ""}`}
            title="Author Dashboard"
          >
            <LayoutDashboard size={24} />
            {sidebarOpen && <span className="text-sm font-medium">Author Dashboard</span>}
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
            <div className="pl-12 pr-2 py-3">
              <select
                value={selectedProject?.id || ''}
                onChange={(e) => {
                  const val = e.target.value;
                  const project = projects.find(p => String(p.id) === String(val));
                  setSelectedProject(project || null);
                  // Auto-expand artifacts when a project is chosen
                  if (project) setExpandedMenu(prev => ({ ...prev, artifacts: true }));
                }}
                className="w-full bg-[#2d3a5a] border border-[#6D81C5] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#91A1D4] transition"
              >
                <option value="">Choose project</option>
                {projects.map((project) => (
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
                      onClick={() => navigate("/project-artifact-overview", { state: { projectData: selectedProject, selectedArtifact: artifact.name } })}
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
              <ChevronRight size={16} className="text-[#3A4E92]" />
            )}
          </button>

          {/* Right Side Content */}
          <div className="flex items-center gap-4">
            <p className="text-sm font-semibold text-[#F7F7F7]">Welcome, {localStorage.getItem("userName") || "Author"}</p>
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full border-2 border-[#FAC277]"></div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8 pt-24">
        {/* Title Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900"> Author Dashboard</h2>
        </div>

        {/* Active Projects Card */}
        <div className="mb-8">
          <div style={{
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            padding: '24px',
            gap: '21px',
            width: '298px',
            height: '152px',
            background: '#FDFDFD',
            border: '1px solid #3A4E92',
            boxShadow: '0px 20px 40px rgba(31, 27, 22, 0.06)',
            borderRadius: '12px'
          }}>
            {/* Label */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '0px', width: '250px', height: '16px' }}>
              <span style={{ width: '129px', height: '16px', fontWeight: '700', fontSize: '12px', lineHeight: '16px', display: 'flex', alignItems: 'center', letterSpacing: '1.2px', textTransform: 'uppercase', color: '#504539' }}>
                Active Projects
              </span>
            </div>
            {/* Number */}
            <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'baseline', padding: '0px', gap: '8px', width: '250px', height: '40px' }}>
              <span style={{ width: '48px', height: '40px', fontWeight: '600', fontSize: '36px', lineHeight: '40px', display: 'flex', alignItems: 'center', color: '#6D81C5' }}>
                {String(activeProjectsCount).padStart(2, '0')}
              </span>
            </div>
          </div>
        </div>

        {/* Project Table */}
        <div className="bg-white rounded-lg shadow-lg">
          {/* Title and Search Row */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h3 className="text-2xl font-bold text-gray-900">Project Artifacts/Deliverables</h3>
            <div
              className="flex items-center gap-3 rounded-full px-5 py-2 w-80"
              style={{ backgroundColor: '#DAE0F1' }}
            >
              <input
                type="text"
                placeholder="Search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent text-sm outline-none flex-1"
                style={{ color: 'rgba(0, 0, 0, 0.7)' }}
              />
              <Search size={18} className="text-gray-600" />
            </div>
          </div>

          {/* Column Headers */}
          <div
            className="grid px-8 py-3 text-xs font-bold uppercase tracking-wide text-gray-700"
            style={{ backgroundColor: '#B8C5E0', gridTemplateColumns: '1fr 1fr 1.5fr 1fr 1fr 1fr 0.6fr' }}
          >
            <div>Document ID</div>
            <div>Project Name</div>
            <div>Document Name</div>
            <div>Due Date</div>
            <div>Priority</div>
            <div>Status</div>
            <div className="text-center">View</div>
          </div>

          {/* Table Rows */}
          <div className="divide-y divide-gray-200">
            {filteredDocuments.map((doc, idx) => (
              <div
                key={idx}
                className="grid px-8 py-4 hover:bg-gray-50 transition items-center"
                style={{ gridTemplateColumns: '1fr 1fr 1.5fr 1fr 1fr 1fr 0.6fr' }}
              >
                <div className="text-sm font-medium text-gray-700">{doc.id}</div>
                <div className="text-sm font-semibold text-gray-900">{doc.projectName}</div>
                <div className="text-sm font-semibold text-gray-900">{doc.documentName}</div>
                <div className="text-sm text-gray-700">{doc.dueDate}</div>
                <div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getPriorityStyles(doc.priority)}`}>
                    {doc.priority}
                  </span>
                </div>
                <div>
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full ${getStatusStyles(doc.status)}`}>
                    {doc.status}
                  </span>
                </div>
                <div className="flex justify-center">
                  <Eye size={20} className="text-gray-600 cursor-pointer hover:text-gray-900 transition" />
                </div>
              </div>
            ))}
          </div>

          {/* Table Footer */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
            <p className="text-sm font-medium text-gray-700">
              Showing {filteredDocuments.length} of {documents.length} active projects
            </p>
            <div className="flex gap-3">
              <button className="w-8 h-8 border border-gray-400 rounded hover:bg-gray-200 text-sm font-semibold transition flex items-center justify-center">
                ΓÇ╣
              </button>
              <span className="px-3 py-1 text-sm font-medium text-gray-700">1</span>
              <button className="w-8 h-8 border border-gray-400 rounded hover:bg-gray-200 text-sm font-semibold transition flex items-center justify-center">
                ΓÇ║
              </button>
            </div>
          </div>
        </div>
      </main>
      </div>
    </div>
  );
}
