import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, LogOut, Moon, Sun, LayoutDashboard, FolderOpen, FileText, Lock, Search, ChevronDown, User, ClipboardList, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auditApi, AuditLogEntry, clearAuthSession } from "@/services/api";

const AuditLog = () => {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(true);
  const [expandedMenu, setExpandedMenu] = useState({
    projects: false,
    templates: false,
    accessControl: false,
  });
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalFiltered, setTotalFiltered] = useState(0);

  const userName = localStorage.getItem("userName") || "Admin";

  useEffect(() => {
    loadLogs();
  }, [currentPage, searchTerm]);

  const loadLogs = async () => {
    setLoading(true);
    setError("");
    try {
      // Pass pagination and search to backend or load all and filter
      const data = await auditApi.getLogs({
        limit: rowsPerPage,
        offset: (currentPage - 1) * rowsPerPage,
      });
      // Filter logically if api doesn't support generic search term
      let filtered = data.logs || [];
      if (searchTerm) {
        const lowerSearch = searchTerm.toLowerCase();
        filtered = filtered.filter(l => 
          l.actor_id.toLowerCase().includes(lowerSearch) || 
          l.action.toLowerCase().includes(lowerSearch) ||
          l.resource_type.toLowerCase().includes(lowerSearch)
        );
      }
      setLogs(filtered);
      setTotalFiltered(data.total || filtered.length);
    } catch (err: any) {
      setError(err.message || "Failed to load audit logs");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const { authApi } = await import("@/services/api");
      await authApi.logout().catch(() => {});
    } catch {}
    clearAuthSession();
    navigate("/");
  };

  const totalPages = Math.ceil(totalFiltered / rowsPerPage) || 1;

  return (
    <div className={`min-h-screen ${darkMode ? "bg-[#DAE0F1]" : "bg-gray-100"}`}>
      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen bg-[#1D2749] transition-all duration-300 z-40 ${
          sidebarOpen ? "w-64" : "w-24"
        }`}
      >
        {/* Sidebar Header */}
        <div className="flex items-center justify-center border-b border-[#6D81C5] px-5 h-20">
          {sidebarOpen && <h1 className="text-white font-bold text-lg">ValiSure</h1>}
          {!sidebarOpen && (
            <div className={`flex items-center justify-center w-10 h-10 rounded-full bg-[#91A1D4]`}>
              <span className="text-white font-bold text-sm">VS</span>
            </div>
          )}
        </div>

        {/* Navigation Links */}
        <nav className={`flex flex-col gap-3 ${sidebarOpen ? "px-7 py-10" : "px-3 py-10"}`}>
          <button onClick={() => navigate("/admin")} className="flex items-center gap-3 rounded-lg px-4 py-3 text-white hover:bg-[#2d3a5a] transition w-full" title="Admin Dashboard">
            <LayoutDashboard size={24} />
            {sidebarOpen && <span className="text-sm font-medium flex-1 text-left">Admin Dashboard</span>}
          </button>
          
          <button onClick={() => setExpandedMenu({ ...expandedMenu, projects: !expandedMenu.projects })} className="flex items-center gap-3 rounded-lg px-4 py-3 text-white hover:bg-[#2d3a5a] transition w-full" title="Projects">
            <FolderOpen size={20} />
            {sidebarOpen && <span className="text-sm font-medium flex-1 text-left">Projects</span>}
            {sidebarOpen && <ChevronDown size={18} className={`transition-transform ${expandedMenu.projects ? "rotate-180" : ""}`} />}
          </button>
          {sidebarOpen && expandedMenu.projects && (
            <div className="flex flex-col gap-2 pl-12 pr-4 py-2">
              <button onClick={() => navigate("/create-project")} className="text-sm text-gray-300 hover:text-white text-left transition">New projects</button>
              <button onClick={() => navigate("/admin")} className="text-sm text-gray-300 hover:text-white text-left transition">Existing project</button>
            </div>
          )}

          <button onClick={() => setExpandedMenu({ ...expandedMenu, templates: !expandedMenu.templates })} className="flex items-center gap-3 rounded-lg px-4 py-3 text-white hover:bg-[#2d3a5a] transition w-full" title="Templates">
            <FileText size={20} />
            {sidebarOpen && <span className="text-sm font-medium flex-1 text-left">Templates</span>}
            {sidebarOpen && <ChevronDown size={18} className={`transition-transform ${expandedMenu.templates ? "rotate-180" : ""}`} />}
          </button>
          {sidebarOpen && expandedMenu.templates && (
            <div className="flex flex-col gap-2 pl-12 pr-4 py-2">
              <button onClick={() => navigate("/csa-template")} className="text-sm text-gray-300 hover:text-white text-left transition">CSA</button>
              <button onClick={() => navigate("/csv-template")} className="text-sm text-gray-300 hover:text-white text-left transition">CSV</button>
            </div>
          )}

          <button onClick={() => setExpandedMenu({ ...expandedMenu, accessControl: !expandedMenu.accessControl })} className="flex items-center gap-3 rounded-lg px-4 py-3 text-white hover:bg-[#2d3a5a] transition w-full" title="Access Control">
            <Lock size={20} />
            {sidebarOpen && <span className="text-sm font-medium flex-1 text-left">Access Control</span>}
            {sidebarOpen && <ChevronDown size={18} className={`transition-transform ${expandedMenu.accessControl ? "rotate-180" : ""}`} />}
          </button>
          {sidebarOpen && expandedMenu.accessControl && (
            <div className="flex flex-col gap-2 pl-12 pr-4 py-2">
              <button onClick={() => navigate("/create-user")} className="text-sm text-gray-300 hover:text-white text-left transition">Create User</button>
              <button onClick={() => navigate("/add-user")} className="text-sm text-gray-300 hover:text-white text-left transition">Add User</button>
              <button onClick={() => navigate("/manage-user")} className="text-sm text-gray-300 hover:text-white text-left transition">Manage User</button>
            </div>
          )}

          <button onClick={() => navigate("/audit-log")} className="flex items-center gap-3 rounded-lg px-4 py-3 text-white bg-[#2d3a5a] transition w-full" title="Audit Trail">
            <ClipboardList size={20} />
            {sidebarOpen && <span className="text-sm font-medium flex-1 text-left">Audit Trail</span>}
          </button>
        </nav>

        {/* Footer - Theme & Logout */}
        <div className="absolute bottom-6 left-0 right-0 flex justify-center gap-2 px-3">
          {sidebarOpen && (
            <button onClick={() => setDarkMode(!darkMode)} className="flex items-center justify-center gap-3 px-4 py-3 text-white hover:bg-[#2d3a5a] rounded-lg transition" title={darkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}>
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
        {/* Top Header */}
        <header className={`bg-[#1D2749] text-white h-20 flex items-center justify-between px-5 lg:px-8 fixed lg:absolute top-0 left-0 right-0 z-30 ${sidebarOpen ? "lg:left-64" : "lg:left-24"} transition-all duration-300`}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="flex items-center justify-center w-6 h-6 bg-[#DAE0F1] rounded-full hover:opacity-80 transition" title={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}>
            {sidebarOpen ? <ChevronLeft size={16} className="text-[#3A4E92]" /> : <ChevronRight size={16} className="text-[#3A4E92]" />}
          </button>

          <div className="flex items-center gap-4">
            <p className="text-sm font-semibold text-[#F7F7F7]">Welcome, {userName}</p>
            <div className="w-8 h-8 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full border-2 border-[#FAC277] flex items-center justify-center">
              <User size={16} className="text-white" />
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-8 pt-24">
          <button onClick={() => navigate("/admin")} className="flex items-center gap-2 text-[#1D2749] hover:opacity-70 transition mb-8 font-semibold">
            <ChevronLeft size={20} /> Back to Admin Dashboard
          </button>

          <div className="flex items-center justify-between mb-8">
            <h1 className="text-4xl font-bold text-[#1F1B16]">Audit Trail</h1>
            <p className="text-sm text-gray-600 bg-white px-4 py-2 rounded-full font-medium border border-gray-300">21 CFR Part 11 Compliant Audit Log</p>
          </div>

          {error && (
            <div className="bg-amber-50 border border-amber-300 rounded-lg p-4 mb-6 flex items-center justify-between">
              <p className="text-sm text-amber-800">⚠️ {error} — Showing cached data</p>
              <button onClick={loadLogs} className="text-sm text-amber-900 font-semibold hover:underline">Retry</button>
            </div>
          )}

          <div className="flex items-end gap-8 mb-8 bg-white rounded-lg p-6 border border-[#CFCBC8]">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-[#504539] mb-2">Search logs</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search by User, Action, or Resource"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#DAE0F1] rounded-lg text-gray-700 outline-none text-sm"
                />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-[#CFCBC8] overflow-hidden">
            <div className="overflow-x-auto">
              <div className="min-w-[1000px]">
                <div className="grid grid-cols-6 gap-4 px-6 py-4 bg-white border-b border-[#A9A4A0]">
                  <div className="text-xs font-semibold text-[#504539] uppercase tracking-wider">Timestamp</div>
                  <div className="text-xs font-semibold text-[#3C3A39] uppercase tracking-wider">User (Actor)</div>
                  <div className="text-xs font-semibold text-[#3C3A39] uppercase tracking-wider">Action</div>
                  <div className="text-xs font-semibold text-[#3C3A39] uppercase tracking-wider">Resource</div>
                  <div className="text-xs font-semibold text-[#3C3A39] uppercase tracking-wider">IP Address</div>
                  <div className="text-xs font-semibold text-[#3C3A39] uppercase tracking-wider text-right">Details</div>
                </div>

                {loading ? (
                  <div className="flex items-center justify-center space-x-2 p-12">
                     <div className="w-8 h-8 border-4 border-[#6D81C5] border-t-transparent rounded-full animate-spin"></div>
                     <p className="text-gray-500 font-medium">Loading audit logs...</p>
                  </div>
                ) : logs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-[#504539]">
                    <p className="text-lg font-medium mb-1">No logs found</p>
                    <p className="text-sm text-[#837F7C]">Try clearing the search filter</p>
                  </div>
                ) : (
                  <div className="divide-y divide-[#E5E5E5] bg-[#F7F7F7]">
                    {logs.map((log) => (
                      <div key={log.id} className="grid grid-cols-6 gap-4 px-6 py-4 items-center hover:bg-white transition-colors">
                        <div className="text-sm text-[#1F1B16] font-medium whitespace-nowrap">
                          {log.timestamp ? new Date(log.timestamp).toLocaleString() : new Date(log.created_at || '').toLocaleString()}
                        </div>
                        <div className="text-sm text-[#1F1B16]">
                          <span className="font-semibold">{log.actor_name || log.actor_id}</span>
                          {log.actor_role && <span className="block text-xs text-gray-500">{log.actor_role}</span>}
                          {log.actor_name && log.actor_name !== log.actor_id && (
                            <span className="block text-xs text-gray-400">ID: {log.actor_id}</span>
                          )}
                        </div>
                        <div className="text-sm text-[#504539] font-medium break-words">
                          {log.action}
                        </div>
                        <div className="text-sm text-[#504539]">
                          <span className="font-semibold text-gray-700">{log.resource_type}</span>
                          <span className="text-xs block text-gray-500 truncate max-w-[150px]">ID: {log.resource_id}</span>
                        </div>
                        <div className="text-sm text-[#504539]">
                          {log.ip_address || "N/A"}
                        </div>
                        <div className="flex justify-end">
                          <button 
                            className="p-2 text-[#3A4E92] hover:bg-[#DAE0F1] hover:text-[#1D2749] rounded-lg transition-colors flex items-center gap-2 text-sm font-semibold"
                            onClick={() => alert(JSON.stringify(log.payload, null, 2))}
                          >
                            <Eye size={16} /> <span className="hidden xl:inline">Payload</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between px-6 py-4 bg-white border-t border-[#A9A4A0]">
              <p className="text-xs font-semibold text-[#504539]">
                Showing {logs.length} of {totalFiltered} log entries
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="p-1 border border-[#CFCBC8] rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-[#504539]"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs font-medium text-[#1F1B16] min-w-[60px] text-center">
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1 border border-[#CFCBC8] rounded-md hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-[#504539]"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default AuditLog;
