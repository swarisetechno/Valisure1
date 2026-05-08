import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, Plus, Moon, Sun, LogOut, LayoutDashboard, FolderOpen, FileText, Upload, Download, ArrowLeft, CheckCircle } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { projectApi, documentApi } from '../services/api';

export default function BulkUserRequirements() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [expandedMenu, setExpandedMenu] = useState({ projects: true, artifacts: true });

  // ── Read project and artifact from navigation state ────────────────
  const incomingProject = location.state?.projectData || null;
  const incomingArtifact = location.state?.selectedArtifact || 'URS - User Request Specification';

  const [selectedProject, setSelectedProject] = useState<any>(incomingProject);
  const [selectedArtifact] = useState<string>(incomingArtifact);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [projects, setProjects] = useState<any[]>([]);
  useEffect(() => {
    projectApi.list().then(res => {
      if (res && res.projects) setProjects(res.projects);
    }).catch(console.error);
  }, []);

  const [formData, setFormData] = useState({
    ursId: '', ursTitle: '', ursDescription: '', ursEnhanced: '', selectedTab: 'allow'
  });
  const [versions, setVersions] = useState<Array<{id: number, content: string, timestamp: string}>>([]);
  const [selectedVersionId, setSelectedVersionId] = useState<number | null>(null);
  const [showToast, setShowToast] = useState(false);

  const [gxpData, setGxpData] = useState({
    gxpYesNo: '',
    gxpReference: '',
    gxpRisk: '',
    gxpRiskLevel: '',
    testingApproach: ''
  });

  const [showGxPBox, setShowGxPBox] = useState(false);

  // ── Auto-generate URS ID scoped to this project ────────────────────
  const generateUrsId = () => {
    const pid = selectedProject?.id || incomingProject?.id || 'PROJ001';
    try {
      const existing = JSON.parse(localStorage.getItem(`requirementsData_${pid}`) || '[]');
      const counter = existing.length + 1;
      return `URS_${String(counter).padStart(3, '0')}`;
    } catch { return 'URS_001'; }
  };

  // ── Load draft data if editing an existing requirement ─────────────
  const loadDraftData = () => {
    const state = location.state as any;
    if (state?.draftData) {
      setFormData(prev => ({
        ...prev,
        ursId: state.draftData.id,
        ursTitle: state.draftData.title,
        ursDescription: state.draftData.description,
        ursEnhanced: state.draftData.ursEnhanced || ''
      }));
      setGxpData({
        gxpYesNo: state.draftData.gxp || '',
        gxpReference: state.draftData.gxpReference || '',
        gxpRisk: state.draftData.risk || '',
        gxpRiskLevel: state.draftData.riskLevel || '',
        testingApproach: state.draftData.testing || ''
      });
      if (state.draftData.versions && Array.isArray(state.draftData.versions)) {
        setVersions(state.draftData.versions);
      } else {
        setVersions([]);
      }
      setEditingId(state.draftData.id);
      setShowGxPBox(false);
    }
  };

  // ── Initialize on mount: load draft OR auto-generate URS ID ────────
  useEffect(() => {
    loadDraftData();
    const state = location.state as any;
    if (!state?.draftData) {
      setFormData(prev => ({ ...prev, ursId: generateUrsId() }));
    }
  }, []);

  // ── Artifacts list based on project methodology ────────────────────
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
    if (!selectedProject) return csvArtifacts;
    const raw = selectedProject?.details?.methodologies || selectedProject.csvCsa || selectedProject.methodology;
    if (!raw) return csvArtifacts;
    if (typeof raw === 'object' && !Array.isArray(raw)) return (raw.csa && !raw.csv) ? csaArtifacts : csvArtifacts;
    const str = Array.isArray(raw) ? (raw[0] || 'CSV') : String(raw);
    return str.toUpperCase().includes('CSA') && !str.toUpperCase().includes('CSV') ? csaArtifacts : csvArtifacts;
  };

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    navigate("/");
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // ── Submit: save to per-project localStorage + backend ─────────────
  const handleSubmit = async (status = 'Draft') => {
    if (!formData.ursTitle.trim() || !formData.ursDescription.trim()) {
      alert('Please fill in URS Title and URS Requirements');
      return;
    }
    const projectId = selectedProject?.id || incomingProject?.id || 'PROJ001';
    const key = `requirementsData_${projectId}`;
    console.log('[handleSubmit] Using Project ID:', projectId);

    try {
      const existing = JSON.parse(localStorage.getItem(key) || '[]');
      const ursId = formData.ursId || generateUrsId();

      const newRequirement = {
        id: ursId,
        title: formData.ursTitle,
        description: formData.ursDescription,
        ursEnhanced: formData.ursEnhanced,
        gxp: gxpData.gxpYesNo || 'Yes',
        gxpReference: gxpData.gxpReference,
        risk: gxpData.gxpRisk || 'Medium',
        riskLevel: gxpData.gxpRiskLevel || 'Risk - 2',
        testing: gxpData.testingApproach || 'Unscripted',
        status: status,
        versions: versions,
        createdAt: editingId
          ? (existing.find((r: any) => r.id === editingId)?.createdAt || new Date().toISOString())
          : new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        dbEntryId: editingId ? existing.find((r: any) => r.id === editingId)?.dbEntryId : undefined
      };

      // Remove old entry if editing
      let updated = editingId ? existing.filter((r: any) => r.id !== editingId) : existing;
      updated.unshift(newRequirement);
      localStorage.setItem(key, JSON.stringify(updated));

      // Save to backend document
      const artifactNameMap: Record<string, string> = {
        urs: "URS - User Requirements Specification",
      };
      const docName = artifactNameMap[selectedArtifact] || selectedArtifact;
      const numericProjectId = typeof projectId === 'number' ? projectId : parseInt(String(projectId), 10);

      if (status === 'Submitted') {
        if (!numericProjectId || isNaN(numericProjectId)) {
          alert('Error: No active project selected. Cannot write to document.');
          return;
        }
        const descriptionText = formData.ursEnhanced || formData.ursDescription;
        try {
          const result = await documentApi.addUnder(
            docName,
            "8.0 USER REQUIREMENTS",
            descriptionText,
            numericProjectId,
            {
              urs_id: ursId,
              urs_title: formData.ursTitle,
              gxp: gxpData.gxpYesNo || 'Yes',
              gxp_reference: gxpData.gxpReference || '',
              gxp_risk: gxpData.gxpRisk || 'Medium'
            }
          );
          console.log('[addUnder] Successfully written to document, entry_id:', result?.entry_id);
          // Store the backend entry_id so we can delete it from DB later
          if (result?.entry_id) {
            newRequirement.dbEntryId = result.entry_id;
            const existingForUpdate = JSON.parse(localStorage.getItem(key) || '[]');
            const idx = existingForUpdate.findIndex((r: any) => r.id === ursId);
            if (idx !== -1) existingForUpdate[idx].dbEntryId = result.entry_id;
            localStorage.setItem(key, JSON.stringify(existingForUpdate));
          }
        } catch (e: any) {
          const errMsg: string = e?.message || '';
          if (errMsg.includes('FILE_LOCKED') || e?.status === 423) {
            // Word is open — save as Draft, don't write to doc yet
            const existingForUpdate = JSON.parse(localStorage.getItem(key) || '[]');
            const idx = existingForUpdate.findIndex((r: any) => r.id === ursId);
            if (idx !== -1) existingForUpdate[idx].status = 'Draft';
            localStorage.setItem(key, JSON.stringify(existingForUpdate));
            alert('⚠️ The Word document is currently open in Microsoft Word.\n\nYour requirement has been saved as DRAFT.\n\nTo finalize it:\n 1. Close the Word document\n 2. Re-open this requirement\n 3. Click Finalize → Submit again');
          } else {
            console.error('Document addUnder failed:', e);
            alert(`Warning: Requirement saved but could not write to Word document.\nReason: ${errMsg || 'Heading not found in document'}`);
          }
        }
      }

      // Navigate back with full context
      navigate("/project-artifact-overview", {
        state: { projectData: selectedProject || incomingProject, selectedArtifact }
      });
    } catch (error) {
      console.error('Error saving requirement:', error);
      alert('Error saving requirement. Please try again.');
    }
  };

  const refineContent = (text: string) => {
    const cleanText = text.trim();
    const capitalizedText = cleanText.charAt(0).toUpperCase() + cleanText.slice(1).toLowerCase();
    return `The system shall provide ${capitalizedText} with full traceability and audit trail capabilities to ensure regulatory compliance.`;
  };

  const handleGenerate = () => {
    if (!formData.ursDescription.trim()) return;
    const refinedContent = refineContent(formData.ursDescription);
    
    handleInputChange('ursEnhanced', refinedContent);
    
    const newVersion = {
      id: Date.now(),
      content: refinedContent,
      timestamp: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    };
    
    setVersions(prev => [newVersion, ...prev]);
    setSelectedVersionId(newVersion.id);
    setShowToast(true);
    
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleVersionClick = (versionId: number) => {
    setSelectedVersionId(versionId);
    const selected = versions.find(v => v.id === versionId);
    if (selected) {
      handleInputChange('ursEnhanced', selected.content);
    }
  };

  const handleFinalize = () => {
    setShowGxPBox(true);
  };

  return (
    <div className={`min-h-screen ${darkMode ? "bg-[#DAE0F1]" : "bg-gray-100"}`}>
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen bg-[#1D2749] transition-all duration-300 z-40 ${sidebarOpen ? "w-64" : "w-24"}`}>
        <div className={`flex items-center border-b border-[#6D81C5] px-5 py-6 ${sidebarOpen ? "justify-between" : "justify-center"}`}>
          {sidebarOpen && <h1 className="text-white font-bold text-lg">ValiSure</h1>}
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#91A1D4]">
            <span className="text-white font-bold text-sm">VS</span>
          </div>
        </div>

        <nav className={`flex flex-col gap-3 ${sidebarOpen ? "px-7 py-10" : "px-3 py-10"}`}>
          <button onClick={() => navigate("/author-dashboard")} className={`flex items-center gap-3 rounded-lg px-4 py-3 text-white hover:bg-[#2d3a5a] transition ${!sidebarOpen ? "justify-center" : ""}`} title="Author Dashboard">
            <LayoutDashboard size={24} />
            {sidebarOpen && <span className="text-sm font-medium">Author Dashboard</span>}
          </button>

          {/* Projects */}
          <button onClick={() => setExpandedMenu(p => ({ ...p, projects: !p.projects }))} className={`flex items-center gap-3 rounded-lg px-4 py-3 text-white hover:bg-[#2d3a5a] transition w-full ${!sidebarOpen ? "justify-center" : ""}`} title="Projects">
            <FolderOpen size={20} />
            {sidebarOpen && <span className="text-sm font-medium flex-1 text-left">Projects</span>}
            {sidebarOpen && <ChevronDown size={18} className={`transition-transform ${expandedMenu.projects ? "rotate-180" : ""}`} />}
          </button>
          {sidebarOpen && expandedMenu.projects && (
            <div className="pl-12 pr-2 py-3">
              {selectedProject && (
                <p className="text-xs text-[#91A1D4] font-semibold mb-2 truncate">📁 {selectedProject.name}</p>
              )}
              <select
                value={selectedProject?.id || ''}
                onChange={(e) => {
                  const p = projects.find(p => String(p.id) === String(e.target.value));
                  setSelectedProject(p || null);
                }}
                className="w-full bg-[#2d3a5a] border border-[#6D81C5] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#91A1D4] transition"
              >
                <option value="">Choose project</option>
                {projects.map((p: any) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          )}

          {/* Artifacts — selected one highlighted */}
          <button onClick={() => setExpandedMenu(p => ({ ...p, artifacts: !p.artifacts }))} className={`flex items-center gap-3 rounded-lg px-4 py-3 text-white hover:bg-[#2d3a5a] transition w-full ${!sidebarOpen ? "justify-center" : ""}`} title="Artifacts">
            <FileText size={20} />
            {sidebarOpen && <span className="text-sm font-medium flex-1 text-left">Artifacts</span>}
            {sidebarOpen && <ChevronDown size={18} className={`transition-transform ${expandedMenu.artifacts ? "rotate-180" : ""}`} />}
          </button>
          {sidebarOpen && expandedMenu.artifacts && (
            <div className="flex flex-col gap-1 pl-12 pr-2 py-2 max-h-72 overflow-y-auto">
              {getArtifactsForProject().map((artifact) => (
                <button
                  key={artifact.id}
                  className={`flex items-center justify-between text-xs transition py-2 px-2 rounded text-left ${artifact.name === selectedArtifact ? 'bg-[#3A4E92] text-white font-semibold' : 'text-gray-300 hover:text-white hover:bg-[#2d3a5a]'}`}
                >
                  <span className="truncate flex-1">{artifact.name}</span>
                  {!artifact.checked && <Plus size={14} className="text-orange-400 flex-shrink-0 ml-2" />}
                </button>
              ))}
            </div>
          )}
        </nav>

        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 px-3">
          {sidebarOpen && (
            <button onClick={() => setDarkMode(!darkMode)} className="flex items-center justify-center gap-3 px-4 py-3 text-white hover:bg-[#2d3a5a] rounded-lg transition">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          )}
          <button onClick={handleLogout} className="flex items-center justify-center gap-3 px-4 py-3 text-white bg-red-500 hover:bg-red-600 rounded-lg transition" title="Logout">
            <LogOut size={20} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "lg:ml-24"}`}>
        <header className={`bg-[#1D2749] text-white h-20 flex items-center justify-between px-5 lg:px-8 fixed lg:absolute top-0 left-0 right-0 z-30 ${sidebarOpen ? "lg:left-64" : "lg:left-24"} transition-all duration-300`}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="flex items-center justify-center w-6 h-6 bg-[#DAE0F1] rounded-full hover:opacity-80 transition">
            {sidebarOpen ? <ChevronLeft size={16} className="text-[#3A4E92]" /> : <ChevronRight size={16} className="text-[#3A4E92]" />}
          </button>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <p className="text-sm font-semibold text-[#F7F7F7]">Welcome, {localStorage.getItem("userName") || "Author"}</p>
              <p className="text-xs text-gray-300">{selectedProject ? selectedProject.name : "No project"} — {selectedArtifact}</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full border-2 border-[#FAC277]"></div>
          </div>
        </header>

        <main className="p-8 pt-24">
          <div className="max-w-full">
            {/* Toast Notification */}
            {showToast && (
              <div className="fixed bottom-8 right-8 z-50 flex flex-col justify-center items-center p-2.5 gap-2.5" style={{width: '343px', height: '47px', background: '#F7F7F7', border: '1px solid #CFCBC8', boxShadow: '0px 4px 4px rgba(0, 0, 0, 0.04)', borderRadius: '2px'}}>
                <div className="flex flex-row items-end p-0 gap-0.5" style={{width: '323px', height: '17px'}}>
                  <div className="flex flex-col justify-center items-center p-0" style={{width: '16px', height: '16px', background: '#11172B', borderRadius: '999px'}}>
                    <CheckCircle size={16} className="text-white" />
                  </div>
                  <div className="flex flex-row justify-center items-center p-2.5 gap-2.5" style={{width: '179px', height: '17px'}}>
                    <span className="font-medium" style={{width: '159px', height: '20px', fontSize: '14px', fontWeight: 500, lineHeight: '20px', color: '#000000'}}>New Version Generated</span>
                  </div>
                </div>
              </div>
            )}

            <div className="flex items-center gap-3 mb-6 text-gray-600">
              <button onClick={() => navigate(-1)} className="flex items-center gap-2 hover:text-gray-900 transition">
                <ArrowLeft size={16} />
                <span className="text-sm">Back to Requirements</span>
              </button>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              {editingId ? 'Edit Requirement' : 'Add User Requirements'}
            </h1>
            {selectedProject && (
              <p className="text-sm text-gray-500 mb-8">
                Project: <strong>{selectedProject.name}</strong> — Artifact: <strong>{selectedArtifact}</strong>
              </p>
            )}

            {/* Tabs */}
            <div className="flex gap-2 mb-8 items-center bg-gray-300 px-2 py-2 rounded-full w-fit">
              <button onClick={() => handleInputChange('selectedTab', 'allow')} className={`px-6 py-2 rounded-full font-semibold transition ${formData.selectedTab === 'allow' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-700 hover:text-gray-900'}`}>
                Allow User Requirements
              </button>
              <button onClick={() => handleInputChange('selectedTab', 'upload')} className={`px-6 py-2 rounded-full font-semibold transition ${formData.selectedTab === 'upload' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-700 hover:text-gray-900'}`}>
                Upload User Requirements
              </button>
            </div>

            <div className="bg-white rounded-lg overflow-hidden">
              {formData.selectedTab === 'allow' && (
                <div className="flex justify-between items-stretch gap-6 p-8">
                  {/* Left - URS Fields */}
                  <div className="flex-1 flex flex-col gap-6">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">URS-ID</label>
                      <input
                        type="text"
                        placeholder="Enter URS-ID"
                        value={formData.ursId}
                        onChange={(e) => handleInputChange('ursId', e.target.value)}
                        className="w-full bg-blue-100 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">URS-TITLE</label>
                      <input type="text" placeholder="Enter URS Title" value={formData.ursTitle} onChange={(e) => handleInputChange('ursTitle', e.target.value)} className="w-full bg-blue-100 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none" />
                    </div>
                    <div className="flex-1 flex flex-col">
                      <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">URS-REQUIREMENTS</label>
                      <textarea placeholder="Enter Requirements description" value={formData.ursDescription} onChange={(e) => handleInputChange('ursDescription', e.target.value)} className="w-full bg-blue-100 border-2 border-blue-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none resize-none flex-1 min-h-72" />
                    </div>
                  </div>

                  <div className="w-0.5 bg-gray-400 flex-shrink-0"></div>

                  {/* Middle - Enhanced */}
                  <div className="flex-1 flex flex-col gap-3">
                    <div className="flex items-center justify-center px-4 py-2 bg-blue-100 border-2 border-blue-200 rounded-lg">
                      <span className="text-sm font-semibold text-gray-900">URS- Descriptions Enhanced</span>
                    </div>
                    <textarea placeholder="Enhanced description will appear here..." value={formData.ursEnhanced} onChange={(e) => handleInputChange('ursEnhanced', e.target.value)} className="w-full bg-blue-100 border-2 border-blue-200 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none resize-none flex-1 min-h-72" />
                    <div className="flex gap-3 pt-4">
                      <button onClick={handleGenerate} className="flex-1 px-6 py-3 bg-gray-400 text-gray-800 rounded-lg font-semibold hover:bg-gray-500 transition">Generate</button>
                      <button onClick={handleFinalize} className="flex-1 px-6 py-3 bg-[#3A4E92] text-white rounded-lg font-semibold hover:bg-[#2d3a5a] transition">Finalize</button>
                    </div>

                    {/* GxP Box - Shows when Finalize is clicked */}
                    {showGxPBox && (
                      <div className="mt-6 p-6 rounded-lg" style={{
                        background: '#F7F7F7',
                        border: '1px solid #CFCBC8',
                        boxShadow: '1px 1px 3px rgba(0, 0, 0, 0.05)',
                        borderRadius: '7px'
                      }}>
                        <h3 className="font-semibold text-base text-gray-900 mb-8">GxP Assessment</h3>
                        
                        {/* GxP Fields - Row Layout */}
                        <div className="flex flex-col gap-8">
                          <div className="flex items-center justify-between">
                            <label className="font-bold text-base text-gray-900">GxP (Yes / No)</label>
                            <div className="px-6 py-3 rounded" style={{ background: '#DAE0F1', minWidth: '200px', textAlign: 'right' }}>
                              <span className="text-sm text-gray-900">{gxpData.gxpYesNo || '----'}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <label className="font-bold text-base text-gray-900">GxP Reference</label>
                            <div className="px-6 py-3 rounded" style={{ background: '#DAE0F1', minWidth: '200px', textAlign: 'right' }}>
                              <span className="text-sm text-gray-900">{gxpData.gxpReference || '----'}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <label className="font-bold text-base text-gray-900">GxP Risk</label>
                            <div className="px-6 py-3 rounded" style={{ background: '#DAE0F1', minWidth: '200px', textAlign: 'right' }}>
                              <span className="text-sm text-gray-900">{gxpData.gxpRisk || '----'}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <label className="font-bold text-base text-gray-900">GxP Risk - Level</label>
                            <div className="px-6 py-3 rounded" style={{ background: '#DAE0F1', minWidth: '200px', textAlign: 'right' }}>
                              <span className="text-sm text-gray-900">{gxpData.gxpRiskLevel || '----'}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <label className="font-bold text-base text-gray-900">Testing Approach</label>
                            <div className="px-6 py-3 rounded" style={{ background: '#DAE0F1', minWidth: '200px', textAlign: 'right' }}>
                              <span className="text-sm text-gray-900">{gxpData.testingApproach || '----'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="w-0.5 bg-gray-400 flex-shrink-0"></div>

                  {/* Right - Versions */}
                  <div className="flex-1 flex flex-col gap-3">
                    <div className="flex items-center justify-center px-4 py-2 bg-blue-100 border-2 border-blue-200 rounded-lg">
                      <span className="text-sm font-semibold text-gray-900">Versions ({versions.length})</span>
                    </div>
                    {versions.length === 0 ? (
                      <div className="border-2 border-dashed border-blue-400 rounded-lg px-6 py-8 flex items-center justify-center bg-blue-50 h-48">
                        <div className="text-center">
                          <p className="text-sm text-gray-600 font-medium">No versions yet</p>
                          <p className="text-xs text-gray-500">Click Generate to create versions</p>
                        </div>
                      </div>
                    ) : (
                      <div className={`flex flex-col gap-3 ${versions.length > 4 ? 'max-h-96 overflow-y-auto' : ''}`}>
                        {versions.map((version, idx) => (
                          <button
                            key={version.id}
                            onClick={() => handleVersionClick(version.id)}
                            className={`text-left px-4 py-4 rounded-lg transition border-2 border-dashed ${
                              selectedVersionId === version.id
                                ? 'bg-blue-100 border-blue-500'
                                : 'bg-white border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <div className="font-semibold text-gray-900 text-sm">Version {versions.length - idx}</div>
                              <div className="text-xs text-gray-600">{version.timestamp}</div>
                            </div>
                            <div className="text-xs text-gray-700 leading-relaxed">{version.content}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {formData.selectedTab === 'upload' && (
                <div className="p-12 py-32 flex flex-col items-center justify-center gap-6">
                  <div className="w-24 h-24 bg-blue-200 rounded-full flex items-center justify-center">
                    <Upload size={48} className="text-[#3A4E92]" />
                  </div>
                  <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Drag & drop your requirements</h2>
                    <p className="text-gray-600 mb-1">Select and upload your document (PDF or DOC).</p>
                    <p className="text-gray-500 text-sm">Files larger than 50 MB may not be supported</p>
                  </div>
                </div>
              )}

              {/* Footer */}
              <div className={`flex items-center ${formData.selectedTab === 'upload' ? 'justify-end' : 'justify-between'} px-8 py-6 border-t-2 border-gray-300`}>
                {formData.selectedTab === 'allow' && (
                  <button className="flex items-center gap-2 px-6 py-2 border-2 border-green-600 text-green-600 rounded-full font-semibold hover:bg-green-50 transition">
                    <Download size={20} /> Download Excel
                  </button>
                )}
                <div className="flex gap-4">
                  <button onClick={() => navigate(-1)} className="px-8 py-2 border-2 border-gray-400 text-gray-700 rounded-full font-semibold hover:bg-gray-100 transition">Cancel</button>
                  <button onClick={() => handleSubmit(showGxPBox ? 'Submitted' : 'Draft')} className="px-8 py-2 bg-[#1D2749] text-white rounded-full font-semibold hover:bg-[#11172B] transition">
                    {editingId ? 'Update' : 'Submit'}
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
