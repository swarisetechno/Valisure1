import { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  LogOut, ChevronLeft, ChevronRight, LayoutDashboard, FolderOpen,
  FileText, Lock, Search, Moon, Sun, ChevronDown, RefreshCcwDot,
  PlusCircle, CheckCircle, AlertCircle, Upload, Trash2
} from "lucide-react";

const API_BASE = "http://localhost:8000";

function getAuthHeaders(): Record<string, string> {
  const token = localStorage.getItem("authToken");
  const headers: Record<string, string> = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;
  return headers;
}

const DEFAULT_CSA_TEMPLATES = [
  "URS - User Requirements Specification",
  "QxP Assessment",
  "CRF Part 11 (ERES)",
  "SRS-System Risk Assessment",
  "Validation Plan",
  "FRS-Functional Requirement Specification",
  "FRA-Functional Risk Assessment",
  "DRS-Design Specification",
  "IQ Test Script",
  "OQ Test Script",
  "PQ Test Script",
  "RTM-Requirements Traceability Matrix",
  "Validation Summary Report",
];

const CSATemplate = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [expandedMenu, setExpandedMenu] = useState({ projects: true, templates: true, accessControl: false });

  // Replace panel state
  const [checkedReplace, setCheckedReplace] = useState<Set<number>>(new Set());
  const [replaceFiles, setReplaceFiles] = useState<Record<number, File>>({});
  const [replaceStatus, setReplaceStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [replaceMsg, setReplaceMsg] = useState("");

  // Add new template state
  const [existingTemplates, setExistingTemplates] = useState<string[]>(DEFAULT_CSA_TEMPLATES);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateFile, setNewTemplateFile] = useState<File | null>(null);
  const [addStatus, setAddStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [addMsg, setAddMsg] = useState("");
  const addFileRef = useRef<HTMLInputElement>(null);

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("authToken");
    navigate("/");
  };

  const toggleReplace = (idx: number) => {
    setCheckedReplace(prev => {
      const next = new Set(prev);
      if (next.has(idx)) {
        next.delete(idx);
        setReplaceFiles(f => { const copy = { ...f }; delete copy[idx]; return copy; });
      } else {
        next.add(idx);
      }
      return next;
    });
    setReplaceStatus("idle");
    setReplaceMsg("");
  };

  const handleReplaceFileChange = (idx: number, file: File | null) => {
    if (!file) return;
    setReplaceFiles(prev => ({ ...prev, [idx]: file }));
  };

  const handleReplace = async () => {
    const selected = Array.from(checkedReplace);
    if (selected.length === 0) { setReplaceMsg("Please select at least one template to replace."); setReplaceStatus("error"); return; }
    const missing = selected.filter(idx => !replaceFiles[idx]);
    if (missing.length > 0) { setReplaceMsg(`Please upload a .docx file for each selected template (${missing.length} missing).`); setReplaceStatus("error"); return; }
    setReplaceStatus("loading"); setReplaceMsg("Replacing templates...");
    try {
      for (const idx of selected) {
        const formData = new FormData();
        formData.append("file", replaceFiles[idx]);
        formData.append("template_name", DEFAULT_CSA_TEMPLATES[idx]);
        formData.append("category", "CSA");
        const res = await fetch(`${API_BASE}/templates/upload`, { method: "POST", headers: getAuthHeaders(), body: formData });
        if (!res.ok) { const err = await res.json().catch(() => ({ detail: "Upload failed" })); throw new Error(err.detail || "Upload failed"); }
      }
      setReplaceStatus("success");
      setReplaceMsg(`✓ Successfully replaced ${selected.length} template(s).`);
      setCheckedReplace(new Set());
      setReplaceFiles({});
    } catch (err: any) { setReplaceStatus("error"); setReplaceMsg(err.message || "Failed to replace templates."); }
  };

  const handleAddTemplate = async () => {
    if (!newTemplateName.trim()) { setAddMsg("Please enter a template name."); setAddStatus("error"); return; }
    if (!newTemplateFile) { setAddMsg("Please upload a .docx file for the new template."); setAddStatus("error"); return; }
    setAddStatus("loading"); setAddMsg("Adding template...");
    try {
      const formData = new FormData();
      formData.append("file", newTemplateFile);
      formData.append("template_name", newTemplateName.trim());
      formData.append("category", "CSA");
      const res = await fetch(`${API_BASE}/templates/upload`, { method: "POST", headers: getAuthHeaders(), body: formData });
      if (!res.ok) { const err = await res.json().catch(() => ({ detail: "Upload failed" })); throw new Error(err.detail || "Upload failed"); }
      setExistingTemplates(prev => [...prev, newTemplateName.trim()]);
      setAddStatus("success"); setAddMsg(`✓ "${newTemplateName.trim()}" added to CSA templates.`);
      setNewTemplateName(""); setNewTemplateFile(null);
      if (addFileRef.current) addFileRef.current.value = "";
    } catch (err: any) { setAddStatus("error"); setAddMsg(err.message || "Failed to add template."); }
  };

  return (
    <div className={`flex min-h-screen ${darkMode ? "bg-[#DAE0F1]" : "bg-white"}`}>
      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-screen bg-[#1D2749] transition-all duration-300 z-40 ${sidebarOpen ? "w-64" : "w-24"}`}>
        <div className={`flex items-center border-b border-[#6D81C5] px-5 py-6 ${sidebarOpen ? "justify-between" : "justify-center"}`}>
          {sidebarOpen && <h1 className="text-white font-bold text-lg">ValiSure</h1>}
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#91A1D4]">
            <span className="text-white font-bold text-sm">VS</span>
          </div>
        </div>
        <nav className={`flex flex-col gap-3 ${sidebarOpen ? "px-7 py-10" : "px-3 py-10"}`}>
          <button onClick={() => navigate("/admin")} className="flex items-center gap-3 rounded-lg px-4 py-3 text-white hover:bg-[#2d3a5a] transition w-full" title="Admin Dashboard">
            <LayoutDashboard size={24} />
            {sidebarOpen && <span className="text-sm font-medium">Admin Dashboard</span>}
          </button>
          <button onClick={() => setExpandedMenu(m => ({ ...m, projects: !m.projects }))} className="flex items-center gap-3 rounded-lg px-4 py-3 text-white hover:bg-[#2d3a5a] transition w-full">
            <FolderOpen size={20} />
            {sidebarOpen && <><span className="text-sm font-medium flex-1 text-left">Projects</span><ChevronDown size={18} className={`transition-transform ${expandedMenu.projects ? "rotate-180" : ""}`} /></>}
          </button>
          {sidebarOpen && expandedMenu.projects && (
            <div className="flex flex-col gap-2 pl-12 pr-4 py-2">
              <button onClick={() => navigate("/create-project")} className="text-sm text-gray-300 hover:text-white text-left">New projects</button>
              <button onClick={() => navigate("/admin")} className="text-sm text-gray-300 hover:text-white text-left">Existing project</button>
            </div>
          )}
          <button onClick={() => setExpandedMenu(m => ({ ...m, templates: !m.templates }))} className="flex items-center gap-3 rounded-lg px-4 py-3 text-white bg-[#2d3a5a] transition w-full">
            <FileText size={20} />
            {sidebarOpen && <><span className="text-sm font-medium flex-1 text-left">Templates</span><ChevronDown size={18} className={`transition-transform ${expandedMenu.templates ? "rotate-180" : ""}`} /></>}
          </button>
          {sidebarOpen && expandedMenu.templates && (
            <div className="flex flex-col gap-2 pl-12 pr-4 py-2">
              <button onClick={() => navigate("/csa-template")} className="text-sm text-white font-semibold text-left">CSA</button>
              <button onClick={() => navigate("/csv-template")} className="text-sm text-gray-300 hover:text-white text-left">CSV</button>
            </div>
          )}
          <button onClick={() => setExpandedMenu(m => ({ ...m, accessControl: !m.accessControl }))} className="flex items-center gap-3 rounded-lg px-4 py-3 text-white hover:bg-[#2d3a5a] transition w-full">
            <Lock size={20} />
            {sidebarOpen && <><span className="text-sm font-medium flex-1 text-left">Access Control</span><ChevronDown size={18} className={`transition-transform ${expandedMenu.accessControl ? "rotate-180" : ""}`} /></>}
          </button>
          {sidebarOpen && expandedMenu.accessControl && (
            <div className="flex flex-col gap-2 pl-12 pr-4 py-2">
              <button onClick={() => navigate("/create-user")} className="text-sm text-gray-300 hover:text-white text-left">Create User</button>
              <button onClick={() => navigate("/add-user")} className="text-sm text-gray-300 hover:text-white text-left">Add User</button>
              <button onClick={() => navigate("/manage-user")} className="text-sm text-gray-300 hover:text-white text-left">Manage User</button>
            </div>
          )}
        </nav>
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 px-3">
          {sidebarOpen && (
            <button onClick={() => setDarkMode(d => !d)} className="flex items-center justify-center px-4 py-3 text-white hover:bg-[#2d3a5a] rounded-lg transition">
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          )}
          <button onClick={handleLogout} className="flex items-center justify-center px-4 py-3 text-white bg-red-500 hover:bg-red-600 rounded-lg transition">
            <LogOut size={20} />
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-300 ${sidebarOpen ? "lg:ml-64" : "lg:ml-24"} flex-1`}>
        <header className={`bg-[#1D2749] text-white h-20 flex items-center justify-between px-5 lg:px-8 fixed lg:absolute top-0 left-0 right-0 z-30 ${sidebarOpen ? "lg:left-64" : "lg:left-24"} transition-all duration-300`}>
          <button onClick={() => setSidebarOpen(s => !s)} className="flex items-center justify-center w-6 h-6 bg-[#DAE0F1] rounded-full hover:opacity-80 transition">
            {sidebarOpen ? <ChevronLeft size={16} className="text-[#3A4E92]" /> : <ChevronRight size={16} className="text-[#3A4E92]" />}
          </button>
          <div className="flex items-center gap-4">
            <div className="w-6 h-6 bg-[#DAE0F1] rounded-full flex items-center justify-center"><Search size={16} className="text-[#3A4E92]" /></div>
            <div className="flex flex-col items-end">
              <p className="text-sm font-semibold text-[#F7F7F7]">Welcome, Admin</p>
              <p className="text-xs text-gray-300">Administrator</p>
            </div>
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full border-2 border-[#FAC277]" />
          </div>
        </header>

        <main className="p-8 pt-24">
          <div className="flex items-center gap-2 text-sm mb-8">
            <button onClick={() => navigate("/admin")} className="text-[#504539] hover:text-[#1F1B16] transition">Templates</button>
            <span className="text-gray-400">/</span>
            <span className="text-[#1F1B16] font-semibold">CSA</span>
          </div>
          <h1 className="text-4xl font-bold text-[#1F1B16] mb-8">Admin CSA</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            {/* Column 1: Existing Templates */}
            <div className="bg-white rounded-xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-6">
                <FileText size={24} className="text-[#2B3B6E]" />
                <h2 className="text-lg font-bold text-[#1D1C1B]">Existing Templates</h2>
              </div>
              <div className="space-y-1 max-h-[420px] overflow-y-auto pr-1">
                {existingTemplates.map((template, index) => (
                  <div key={index} className="flex items-center justify-between text-sm text-[#504539] py-2 px-3 hover:bg-gray-50 rounded transition group">
                    <span>{template}</span>
                    {!DEFAULT_CSA_TEMPLATES.includes(template) && (
                      <button onClick={() => setExistingTemplates(prev => prev.filter(t => t !== template))} className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition" title="Remove">
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Column 2: Replace New Templates */}
            <div className="bg-white rounded-xl p-6 shadow-lg flex flex-col">
              <div className="flex items-center gap-3 mb-2">
                <RefreshCcwDot size={24} className="text-[#2B3B6E]" />
                <h2 className="text-lg font-bold text-[#1F1B16]">Replace New Templates</h2>
              </div>
              <p className="text-xs text-gray-500 mb-4">Check templates to replace, then upload a new <code>.docx</code> for each.</p>

              <div className="space-y-2 max-h-[320px] overflow-y-auto flex-1 pr-1">
                {DEFAULT_CSA_TEMPLATES.map((template, idx) => (
                  <div key={idx} className={`rounded-lg border transition ${checkedReplace.has(idx) ? "border-[#3A4E92] bg-[#f0f3fc]" : "border-gray-100 hover:border-[#DAE0F1]"}`}>
                    <label className="flex items-center gap-3 py-2 px-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={checkedReplace.has(idx)}
                        onChange={() => toggleReplace(idx)}
                        className="w-4 h-4 accent-[#1D2749] rounded"
                      />
                      <span className={`text-sm flex-1 ${checkedReplace.has(idx) ? "text-[#1D2749] font-semibold" : "text-[#504539]"}`}>{template}</span>
                    </label>
                    {checkedReplace.has(idx) && (
                      <div className="px-3 pb-3">
                        <label className="flex items-center gap-2 cursor-pointer bg-white border border-dashed border-[#6D81C5] rounded px-3 py-2 text-xs text-[#3A4E92] hover:bg-[#DAE0F1] transition">
                          <Upload size={14} />
                          {replaceFiles[idx]
                            ? <span className="truncate max-w-[160px] text-green-700 font-medium">✓ {replaceFiles[idx].name}</span>
                            : "Upload new .docx"}
                          <input type="file" accept=".docx" className="hidden" onChange={e => handleReplaceFileChange(idx, e.target.files?.[0] || null)} />
                        </label>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {replaceMsg && (
                <div className={`mt-3 flex items-center gap-2 text-xs rounded px-3 py-2 ${replaceStatus === "success" ? "bg-green-50 text-green-700" : replaceStatus === "error" ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"}`}>
                  {replaceStatus === "success" ? <CheckCircle size={14} /> : replaceStatus === "error" ? <AlertCircle size={14} /> : null}
                  {replaceMsg}
                </div>
              )}

              <button
                onClick={handleReplace}
                disabled={replaceStatus === "loading" || checkedReplace.size === 0}
                className="mt-4 w-full py-2 bg-[#1D2749] text-white rounded-lg font-semibold hover:bg-[#2d3a5a] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                <RefreshCcwDot size={16} />
                {replaceStatus === "loading" ? "Replacing..." : `Replace${checkedReplace.size > 0 ? ` (${checkedReplace.size})` : ""}`}
              </button>
            </div>

            {/* Column 3: Add New Template */}
            <div className="bg-white rounded-xl p-6 shadow-lg flex flex-col">
              <div className="flex items-center gap-3 mb-2">
                <PlusCircle size={24} className="text-[#2B3B6E]" />
                <h2 className="text-lg font-bold text-[#1D1C1B]">Add New Template</h2>
              </div>
              <p className="text-xs text-gray-500 mb-5">Enter the template name and upload a <code>.docx</code> file. It will be available when creating a new project.</p>

              <div className="space-y-4 flex-1">
                <div>
                  <label className="block text-xs font-semibold text-[#504539] mb-1">Template Name</label>
                  <input
                    type="text"
                    value={newTemplateName}
                    onChange={e => setNewTemplateName(e.target.value)}
                    placeholder="e.g. QP - Quality Plan"
                    className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm text-[#1F1B16] outline-none focus:border-[#3A4E92] focus:ring-1 focus:ring-[#DAE0F1] transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#504539] mb-1">Upload .docx File</label>
                  <label className="flex items-center gap-2 cursor-pointer bg-[#f5f7fc] border border-dashed border-[#6D81C5] rounded-lg px-3 py-3 text-sm text-[#3A4E92] hover:bg-[#DAE0F1] transition">
                    <Upload size={16} />
                    {newTemplateFile
                      ? <span className="truncate max-w-[180px] font-medium text-green-700">✓ {newTemplateFile.name}</span>
                      : "Click to upload .docx template"}
                    <input type="file" accept=".docx" ref={addFileRef} className="hidden" onChange={e => setNewTemplateFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
                {newTemplateName.trim() && (
                  <div className="bg-[#DAE0F1] rounded-lg p-3">
                    <p className="text-xs text-gray-500 mb-1">Preview</p>
                    <span className="font-semibold text-[#1D1C1B] text-sm">{newTemplateName.trim()}</span>
                  </div>
                )}
              </div>

              {addMsg && (
                <div className={`mt-3 flex items-center gap-2 text-xs rounded px-3 py-2 ${addStatus === "success" ? "bg-green-50 text-green-700" : addStatus === "error" ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"}`}>
                  {addStatus === "success" ? <CheckCircle size={14} /> : addStatus === "error" ? <AlertCircle size={14} /> : null}
                  {addMsg}
                </div>
              )}

              <button
                onClick={handleAddTemplate}
                disabled={addStatus === "loading"}
                className="mt-4 w-full py-2 bg-[#11172B] text-white rounded-lg font-semibold hover:bg-[#1D2749] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                <PlusCircle size={16} />
                {addStatus === "loading" ? "Adding..." : "+ Add Template"}
              </button>
            </div>

          </div>
        </main>
      </div>
    </div>
  );
};

export default CSATemplate;
