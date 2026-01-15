import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Share2, 
  Check, 
  Trash2, 
  Edit3, 
  UploadCloud, 
  ShieldAlert, 
  UserPlus, 
  ChevronLeft 
} from "lucide-react";
import { Modal } from "../components/Modal";

export default function SharedFile() {
  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const { id } = useParams();
  const navigate = useNavigate();

  const userString = localStorage.getItem("user");
  const currentUser = userString ? JSON.parse(userString) : null;
  
  const [file, setFile] = useState(null);
  const [access, setAccess] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState("view");
  const [isUpdating, setIsUpdating] = useState(false);
  const [copied, setCopied] = useState(false); 

  /* ================= MODAL STATES ================= */
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: "",
    description: "",
    confirmText: "Confirm",
    danger: false,
    type: "" 
  });

  const [renameValue, setRenameValue] = useState("");
  const [targetRevokeId, setTargetRevokeId] = useState(null);

  const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });

  /* ================= FETCH DATA ================= */
  const fetchFile = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/files/showfile/${id}`, {
        headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
      });
      if (res.status === 401) return navigate("/auth");
      const data = await res.json();
      if (!res.ok) {
        if (data.access === "none") return setAccess("none");
        throw new Error(data.message || "Failed to load file");
      }
      setFile(data.file);
      setAccess(data.access);
      setRenameValue(data.file.originalName);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchFile(); }, [id]);

  /* ================= PERMISSION LOGIC (HEAVY SCAN) ================= */
  const isAdmin = currentUser?.role === "admin";
  const isOwner = access === "owner";
  
  // SCANNER: Manually find current user in the shared list to prevent "Viewer" bug
  const checkManualPermission = () => {
    if (!file || !file.sharedWith) return access;
    // Check by ID match
    const self = file.sharedWith.find(item => 
      (item.user?._id || item.user) === currentUser?._id
    );
    return self ? self.permission : access;
  };

  const effectivePermission = checkManualPermission();
  const isEditor = effectivePermission === "edit";
  const isViewer = effectivePermission === "view";

  // --- LOGIC RULES ---
  // 1. Rename/Update: Only Owner or explicit Editor
  const canEdit = isOwner || isEditor; 

  // 2. Delete: Owner, Editor, or Admin (Admin is system fallback)
  const canDelete = isOwner || isEditor || isAdmin;

  const getPermissionLabel = () => {
    if (isOwner) return "Owner";
    
    if (isEditor) return "Editor";
    if (isAdmin && !isOwner && !isEditor && !isViewer) return "System Admin";
    if (isViewer) return "Viewer";
    return "Guest";
  };

  /* ================= ACTION LOGIC ================= */
  
  const handleShareLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      showErrorModal("Failed to copy link");
    }
  };

  const confirmRename = async () => {
    if (!renameValue || renameValue === file.originalName) return closeModal();
    setIsUpdating(true);
    try {
      const res = await fetch(`${BASE_URL}/api/files/rename/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json",
           Authorization: `Bearer ${localStorage.getItem("token")}`,
         },
        body: JSON.stringify({ newName: renameValue }),

      });
      if (!res.ok) throw new Error("Rename failed");
      await fetchFile();
      closeModal();
    } catch (err) {
      showErrorModal(err.message);
    } finally { setIsUpdating(false); }
  };

  const confirmDelete = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch(`${BASE_URL}/api/files/delete/${id}`, {
        method: "DELETE",
        headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Delete failed");
      closeModal();
      navigate("/dashboard");
    } catch (err) {
      showErrorModal(err.message);
    } finally { setIsUpdating(false); }
  };

  const confirmRevoke = async () => {
    if (!targetRevokeId) return;
    setIsUpdating(true);
    try {
      const res = await fetch(`${BASE_URL}/api/files/revoke/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" ,
            Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ userId: targetRevokeId }),

      });
      if (!res.ok) throw new Error("Revoke failed");
      await fetchFile();
      closeModal();
    } catch (err) {
      showErrorModal(err.message);
    } finally { setIsUpdating(false); setTargetRevokeId(null); }
  };

  /* ================= TRIGGERS ================= */
  
  const handleRenameTrigger = () => {
    setRenameValue(file?.originalName || "");
    setModalConfig({
      isOpen: true,
      title: "Rename File",
      description: "Enter new name for this resource:",
      confirmText: "Rename",
      danger: false,
      type: "rename"
    });
  };

  const handleDeleteTrigger = () => {
    setModalConfig({
      isOpen: true,
      title: "Delete File",
      description: "Permanently delete this file from the vault? This cannot be undone.",
      confirmText: "Delete",
      danger: true,
      type: "delete"
    });
  };

  const handleRevokeTrigger = (userId) => {
    setTargetRevokeId(userId);
    setModalConfig({
      isOpen: true,
      title: "Revoke Access",
      description: "Disconnect this collaborator from the file node?",
      confirmText: "Revoke",
      danger: true,
      type: "revoke"
    });
  };

  const showErrorModal = (message) => {
    setModalConfig({
      isOpen: true,
      title: "Error",
      description: message,
      confirmText: "Close",
      danger: false,
      type: "error"
    });
  };

  const handleUpdateFile = async (e) => {
    const newFile = e.target.files[0];
    if (!newFile) return;
    const formData = new FormData();
    formData.append("file", newFile);
    setIsUpdating(true);
    try {
      const res = await fetch(`${BASE_URL}/api/files/update-content/${id}`, {
        method: "PUT",
        body: formData,
        headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
      });
      if (!res.ok) throw new Error("Update failed");
      fetchFile();
    } catch (err) { showErrorModal(err.message); }
    finally { setIsUpdating(false); }
  };

  const handleUpdatePermission = async (e) => {
  e.preventDefault();
  setIsUpdating(true);
  try {
    const res = await fetch(`${BASE_URL}/api/files/share/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json",
           Authorization: `Bearer ${localStorage.getItem("token")}`,
       },
      body: JSON.stringify({ email: newUserEmail, role: newUserRole }),
    });

    const data = await res.json(); // 1. Parse the response first

    if (!res.ok) {
      // 2. Use the message from the backend, or a fallback
      throw new Error(data.message || "Failed to update permissions");
    }

    setNewUserEmail("");
    fetchFile(); 
  } catch (err) { 
    showErrorModal(err.message); // 3. Now this will show "User with this email not found"
  } finally { 
    setIsUpdating(false); 
  }
};

  if (loading) return <div className="text-zinc-500 font-mono text-xs p-10 animate-pulse uppercase tracking-[0.2em]">Initialising_Stream...</div>;

  const getConfirmAction = () => {
    switch(modalConfig.type) {
      case "rename": return confirmRename;
      case "delete": return confirmDelete;
      case "revoke": return confirmRevoke;
      default: return closeModal;
    }
  };

  if (access === "none") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-6">
          <div className="mx-auto w-20 h-20 bg-red-500/10 border border-red-500/20 rounded-3xl flex items-center justify-center">
            <ShieldAlert size={40} className="text-red-500" />
          </div>
          <h1 className="text-3xl font-black text-white italic uppercase tracking-tighter">Access Denied</h1>
          <p className="text-zinc-500 text-sm font-medium">Clearance level insufficient for this directory.</p>
          <button onClick={() => navigate("/dashboard")} className="bg-white text-black px-8 py-3 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-yellow-400 transition-all active:scale-95">Return to Vault</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-4 md:p-10 pb-24">
        
      <Modal 
        isOpen={modalConfig.isOpen}
        onClose={closeModal}
        title={modalConfig.title}
        description={modalConfig.description}
        confirmText={modalConfig.confirmText}
        onConfirm={getConfirmAction()}
        danger={modalConfig.danger}
        loading={isUpdating}
      >
        {modalConfig.type === "rename" && (
          <input 
            type="text"
            autoFocus
            className="w-full mt-4 bg-zinc-900 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-yellow-400 text-white font-medium"
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && confirmRename()}
          />
        )}
      </Modal>

      <div className="max-w-4xl mx-auto">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8 group">
          <ChevronLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          <span className="text-[10px] uppercase font-black tracking-widest">Back</span>
        </button>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div className="space-y-1">
            <h1 className="text-3xl font-black flex items-center gap-3 tracking-tighter uppercase italic">
              {file?.originalName}
              {/* Badge for Admins strictly overriding without an invited role */}
              {isAdmin && !isOwner && !isEditor && (
                <span className="text-[9px] bg-red-600 text-white px-2 py-0.5 rounded font-black tracking-tighter shadow-lg shadow-red-900/20">ADMIN_OVERRIDE</span>
              )}
            </h1>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]"></div>
              <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">
                Permission: <span className="text-white">{getPermissionLabel()}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <button 
              onClick={handleShareLink}
              className={`p-3 rounded-xl border transition-all flex items-center justify-center ${
                copied 
                ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400" 
                : "bg-zinc-900 border-white/10 text-zinc-400 hover:text-white hover:border-white/30"
              }`}
            >
              {copied ? <Check size={18} /> : <Share2 size={18} />}
            </button>

            {canEdit && (
              <>
                <button onClick={handleRenameTrigger} className="p-3 bg-zinc-900 border border-white/10 rounded-xl hover:bg-zinc-800 transition text-zinc-400 hover:text-white">
                  <Edit3 size={18} />
                </button>
                <label className="flex items-center gap-2 px-4 py-3 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-yellow-400 cursor-pointer transition active:scale-95">
                  <UploadCloud size={16} />
                  <span className="hidden sm:inline">{isUpdating ? "Processing..." : "Update"}</span>
                  <input type="file" className="hidden" onChange={handleUpdateFile} disabled={isUpdating} />
                </label>
              </>
            )}

            {canDelete && (
              <button onClick={handleDeleteTrigger} className="p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl hover:bg-red-500 hover:text-white transition">
                <Trash2 size={18} />
              </button>
            )}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/5 bg-[#0a0a0a] p-4 md:p-8 mb-10 shadow-2xl overflow-hidden">
          {file?.mimeType?.startsWith("image") ? (
            <div className="relative group rounded-2xl overflow-hidden bg-black flex justify-center">
              <img src={file.url} className="max-h-[600px] w-auto object-contain transition-opacity group-hover:opacity-90" alt="Preview" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <a href={file.url} target="_blank" rel="noreferrer" className="bg-white text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl">View_Full_Res</a>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 py-20">
              <div className="w-24 h-24 bg-zinc-900 rounded-[2rem] flex items-center justify-center border border-white/5 shadow-inner">
                <span className="text-3xl text-zinc-600 font-mono font-black uppercase">.{file?.mimeType?.split('/')[1] || 'DATA'}</span>
              </div>
              <a href={file.url} target="_blank" rel="noreferrer" className="bg-zinc-800 text-white px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.2em] border border-white/5 hover:border-yellow-400 transition-all hover:shadow-[0_0_20px_rgba(250,204,21,0.15)]">Open</a>
            </div>
          )}
        </div>

        {isOwner && (
          <div className="rounded-[2rem] border border-white/5 bg-[#0a0a0a] p-6 md:p-10">
            <div className="flex items-center gap-3 mb-8">
              <UserPlus size={20} className="text-yellow-400" />
              <h2 className="text-lg font-black uppercase tracking-tighter italic">Manage Access</h2>
            </div>

            <form onSubmit={handleUpdatePermission} className="flex flex-col sm:flex-row gap-3 mb-10">
              <input
                type="email" placeholder="Search user by email..." required
                value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)}
                className="flex-1 bg-black border border-white/10 rounded-xl px-4 py-3 text-xs focus:border-yellow-400 outline-none font-mono"
              />
              <select 
                value={newUserRole} onChange={(e) => setNewUserRole(e.target.value)}
                className="bg-black border border-white/10 rounded-xl px-3 py-3 text-[10px] font-black uppercase tracking-widest outline-none"
              >
                <option value="view">Viewer</option>
                <option value="edit">Editor</option>
              </select>
              <button disabled={isUpdating} className="bg-yellow-400 text-black px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-yellow-300 transition-colors">Grant_Access</button>
            </form>

            <div className="space-y-3">
              {file.sharedWith?.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/[0.03] group hover:border-white/10 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 font-black text-xs uppercase">{item.user?.username?.charAt(0) || "?"}</div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-zinc-200">{item.user?.email}</span>
                      <span className={`text-[9px] font-black tracking-widest uppercase ${item.permission === 'edit' ? 'text-blue-400' : 'text-emerald-400'}`}>{item.permission}</span>
                    </div>
                  </div>
                  <button onClick={() => handleRevokeTrigger(item.user?._id)} className="p-2 text-zinc-600 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
              {(!file.sharedWith || file.sharedWith.length === 0) && (
                <div className="text-center py-10">
                  <p className="text-zinc-700 text-[10px] font-black uppercase tracking-widest">No active collaborators linked.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}