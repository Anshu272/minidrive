import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { 
  File, 
  Image as ImageIcon, 
  Share2, 
  Trash2, 
  ExternalLink, 
  Plus, 
  FolderOpen,
  Loader2
} from "lucide-react";
import { Modal } from "../components/Modal"; 

export default function MyDrive() {
    const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [copiedId, setCopiedId] = useState(null);
    const [isActionLoading, setIsActionLoading] = useState(false);

    /* ================= MODAL STATE ================= */
    const [modalConfig, setModalConfig] = useState({
        isOpen: false,
        title: "",
        description: "",
        confirmText: "Confirm",
        danger: false,
        onConfirm: () => {},
    });

    const closeModal = () => setModalConfig((prev) => ({ ...prev, isOpen: false }));

    /* ================= FETCH DATA ================= */
    const fetchFiles = async () => {
        try {
            const res = await fetch(`${BASE_URL}/api/files/my-files`, {
               headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.message || "Failed to load files");
            setFiles(Array.isArray(data.files) ? data.files : []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchFiles(); }, []);

    /* ================= ACTIONS ================= */
    const confirmDelete = async (id) => {
        setIsActionLoading(true);
        try {
            const res = await fetch(`${BASE_URL}/api/files/delete/${id}`, {
                method: "DELETE",
                headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
            });
            if (!res.ok) throw new Error("Delete failed");
            setFiles((prev) => prev.filter((file) => file._id !== id));
            closeModal();
        } catch (err) { 
            alert(err.message); 
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDeleteTrigger = (file) => {
        setModalConfig({
            isOpen: true,
            title: "Delete File?",
            description: `Are you sure you want to permanently delete "${file.originalName}"? This action cannot be undone.`,
            confirmText: "Delete Permanently",
            danger: true,
            onConfirm: () => confirmDelete(file._id),
        });
    };

    const shareFile = async (fileId) => {
        const link = `${window.location.origin}/file/${fileId}`;
        await navigator.clipboard.writeText(link);
        setCopiedId(fileId);
        setTimeout(() => setCopiedId(null), 2000);
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 text-yellow-400 animate-spin" />
                <p className="text-zinc-500 font-mono text-xs uppercase tracking-[0.2em] animate-pulse">Accessing_Vault...</p>
            </div>
        </div>
    );

    if (error) return (
        <div className="p-8 rounded-3xl bg-red-500/5 border border-red-500/20 text-red-400 text-center">
            <p className="font-bold uppercase tracking-tight">Error Loading Drive</p>
            <p className="text-xs opacity-80 font-mono mt-2">{error}</p>
        </div>
    );

    return (
        <div className="max-w-[1400px] mx-auto pb-20">
            
            <Modal 
                isOpen={modalConfig.isOpen}
                onClose={closeModal}
                title={modalConfig.title}
                description={modalConfig.description}
                confirmText={modalConfig.confirmText}
                onConfirm={modalConfig.onConfirm}
                danger={modalConfig.danger}
                loading={isActionLoading}
            />

            {/* TOP BAR */}
            <div className="flex items-center justify-between gap-6 mb-8 md:mb-12 px-2">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight flex items-center gap-3 italic uppercase">
                        My <span className="text-yellow-400">Vault</span>
                    </h1>
                    <p className="text-zinc-500 text-xs md:text-sm mt-1 font-medium">SECURE_CLOUD_STORAGE_NODE</p>
                </div>

                <Link to="/dashboard/upload" className="bg-yellow-400 hover:bg-yellow-300 text-black p-3 md:p-4 rounded-2xl transition-all active:scale-90 shadow-xl shadow-yellow-400/10 group">
                    <Plus size={24} className="group-hover:rotate-90 transition-transform duration-300" />
                </Link>
            </div>

            {/* GRID CONTENT */}
            {files.length === 0 ? (
                <div className="min-h-[50vh] flex flex-col items-center justify-center text-center p-10 border border-white/5 rounded-[2.5rem] bg-white/[0.01]">
                    <div className="w-20 h-20 bg-zinc-900 rounded-[1.5rem] flex items-center justify-center mb-6 border border-white/5">
                        <FolderOpen size={32} className="text-zinc-700" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 italic uppercase">Node Empty</h3>
                    <p className="text-zinc-500 text-xs max-w-[200px] mb-8 leading-relaxed">
                        No encrypted data found in this directory.
                    </p>
                    <Link 
                        to="/dashboard/upload" 
                        className="bg-white text-black px-8 py-4 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-yellow-400 transition-colors"
                    >
                        Initialize Upload
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                    {files.map((file) => (
                        <div
                            key={file._id}
                            className="group relative rounded-[2rem] border border-white/30 bg-[#0a0a0a] overflow-hidden hover:border-yellow-400/30 transition-all duration-500"
                        >
                            {/* PREVIEW CONTAINER (Clickable for Mobile & Desktop) */}
                            <div className="relative h-48 bg-black/40 overflow-hidden">
                                <Link 
                                    to={`/file/${file._id}`} 
                                    className="w-full h-full flex items-center justify-center z-10"
                                >
                                    {file?.mimeType?.startsWith("image") && file?.url ? (
                                        <img
                                            src={file.url}
                                            alt={file.originalName}
                                            className="h-full w-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-105 transition-all duration-700"
                                        />
                                    ) : (
                                        <div className="flex flex-col items-center gap-3 transition-transform group-hover:scale-110 duration-500">
                                            <div className="w-14 h-14 rounded-2xl bg-zinc-900 flex items-center justify-center border border-white/5">
                                                <File size={28} className="text-zinc-600" />
                                            </div>
                                            <span className="text-[9px] uppercase tracking-[0.2em] text-zinc-500 font-black">
                                                {file?.mimeType?.split('/')[1] || 'DATA'}
                                            </span>
                                        </div>
                                    )}
                                </Link>
                                
                                {/* DESKTOP HOVER OVERLAY (Hidden on Mobile) */}
                                <div className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-all duration-300 hidden md:flex items-center justify-center gap-4 backdrop-blur-md z-20 pointer-events-none group-hover:pointer-events-auto">
                                    <button 
                                        onClick={(e) => { e.preventDefault(); shareFile(file._id); }}
                                        className={`p-4 rounded-2xl transition-all ${copiedId === file._id ? 'bg-emerald-500 text-white' : 'bg-white/5 hover:bg-yellow-400 hover:text-black text-white'}`}
                                    >
                                        <Share2 size={20} />
                                    </button>
                                    <button 
                                        onClick={(e) => { e.preventDefault(); handleDeleteTrigger(file); }}
                                        className="p-4 bg-white/5 hover:bg-red-600 text-white rounded-2xl transition-all"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>

                                {/* MOBILE-ONLY DELETE SHORTCUT */}
                                <button 
                                    onClick={(e) => { e.preventDefault(); handleDeleteTrigger(file); }}
                                    className="md:hidden absolute top-4 right-4 z-30 p-2.5 bg-black/50 backdrop-blur-xl border border-white/10 rounded-xl text-red-500 active:scale-90 transition-transform"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            {/* FILE METADATA (Clickable) */}
                            <Link to={`/file/${file._id}`} className="p-6 block border-t border-white/5 active:bg-white/[0.02]">
                                <div className="flex justify-between items-start gap-4 mb-2">
                                    <h3 className="text-sm font-bold text-zinc-200 truncate leading-tight uppercase tracking-tight group-hover:text-white transition-colors">
                                        {file.originalName}
                                    </h3>
                                    <span className="text-[10px] text-zinc-600 font-mono shrink-0">
                                        {(file.size / 1024).toFixed(0)}KB
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 opacity-60">
                                    <div className="w-1 h-1 rounded-full bg-yellow-400"></div>
                                    <span className="text-[9px] text-zinc-500 uppercase tracking-widest font-bold">
                                        {new Date(file.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            )}
            
            {/* SUCCESS TOAST REPLACEMENT (Simple Logic) */}
            {copiedId && (
                <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[200] bg-emerald-500 text-black px-6 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-emerald-500/20 animate-in fade-in slide-in-from-bottom-5">
                    Link_Copied_to_Clipboard
                </div>
            )}
        </div>
    );
}