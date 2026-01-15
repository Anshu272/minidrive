import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, ExternalLink, ShieldAlert, X, Loader2, User } from "lucide-react";

export default function AdminDashboard() {
  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchAllFiles = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/files/admin/all-files`, {
        headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
      });
      const data = await res.json();
      setFiles(data.files || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAllFiles(); }, []);

  const openDeleteModal = (file) => {
    setFileToDelete(file);
    setIsModalOpen(true);
  };

  const confirmDelete = async () => {
    if (!fileToDelete) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`${BASE_URL}/api/files/delete/${fileToDelete._id}`, {
        method: "DELETE",
        headers: {
    Authorization: `Bearer ${localStorage.getItem("token")}`,
  },
      });
      
      if (res.ok) {
        setFiles(files.filter(f => f._id !== fileToDelete._id));
        setIsModalOpen(false);
      } else {
        alert("Delete failed on server");
      }
    } catch (err) {
      alert("Network error: Delete failed");
    } finally {
      setIsDeleting(false);
      setFileToDelete(null);
    }
  };

  if (loading) return <div className="p-10 text-zinc-400 font-mono animate-pulse">Initializing Admin Access...</div>;

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <header className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-yellow-400 flex items-center gap-2">
          <ShieldAlert /> Admin File Control
        </h1>
        <p className="text-zinc-500 font-mono text-[10px] uppercase tracking-widest mt-2">
          Total Objects: {files.length}
        </p>
      </header>
      
      {/* --- DESKTOP TABLE VIEW (Visible on md and up) --- */}
      <div className="hidden md:block overflow-hidden rounded-xl border border-white/10 bg-[#0a0a0a]">
        <table className="w-full text-left text-sm border-collapse">
          <thead className="bg-white/5 text-zinc-400 uppercase text-[10px] tracking-widest">
            <tr>
              <th className="px-6 py-4">Preview</th>
              <th className="px-6 py-4">File Name</th>
              <th className="px-6 py-4">Owner</th>
              <th className="px-6 py-4">Type</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {files.map((file) => (
              <tr key={file._id} className="hover:bg-white/[0.02] transition group">
                <td className="px-6 py-4">
                  <div className="w-12 h-12 rounded-lg overflow-hidden bg-zinc-900 border border-white/5 flex items-center justify-center">
                    {file.mimeType?.startsWith("image") ? (
                      <img src={file.url} alt="thumb" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl">📄</span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 font-medium max-w-[200px]">
                  <Link to={`/file/${file._id}`} className="text-zinc-200 hover:text-yellow-400 transition block truncate">
                    {file.originalName}
                  </Link>
                </td>
                <td className="px-6 py-4 text-zinc-400">
                  <div className="flex flex-col">
                    <span className="font-semibold text-zinc-300">{file.user?.username}</span>
                    <span className="text-[10px] text-zinc-500">{file.user?.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                   <span className="px-2 py-1 rounded bg-zinc-800 text-[10px] text-zinc-400 border border-white/5">
                    {file.mimeType?.split('/')[1]?.toUpperCase() || "FILE"}
                   </span>
                </td>
                <td className="px-6 py-4 text-right space-x-4">
                  <a href={file.url} target="_blank" rel="noreferrer" className="text-blue-400 hover:text-blue-300">
                    <ExternalLink size={18} className="inline" />
                  </a>
                  <button onClick={() => openDeleteModal(file)} className="text-red-500/50 group-hover:text-red-500 transition-colors">
                    <Trash2 size={18} className="inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- MOBILE CARD VIEW (Visible only on small screens) --- */}
      <div className="md:hidden space-y-4">
        {files.map((file) => (
          <div key={file._id} className="bg-[#0a0a0a] border border-white/10 rounded-xl p-4 space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-lg overflow-hidden bg-zinc-900 border border-white/5 flex items-center justify-center shrink-0">
                {file.mimeType?.startsWith("image") ? (
                  <img src={file.url} alt="thumb" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-2xl">📄</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <Link to={`/file/${file._id}`} className="text-white font-anton uppercase tracking-wider block truncate">
                  {file.originalName}
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[8px] text-zinc-400 border border-white/5 uppercase">
                    {file.mimeType?.split('/')[1] || "FILE"}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-white/5 pt-4">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-yellow-400/10 flex items-center justify-center">
                  <User size={14} className="text-yellow-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-zinc-300 font-bold leading-none">{file.user?.username}</span>
                  <span className="text-[8px] text-zinc-500">{file.user?.email}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <a href={file.url} target="_blank" rel="noreferrer" className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                  <ExternalLink size={18} />
                </a>
                <button onClick={() => openDeleteModal(file)} className="p-2 bg-red-500/10 text-red-500 rounded-lg">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="absolute inset-0 bg-black/90 backdrop-blur-md" onClick={() => !isDeleting && setIsModalOpen(false)} />
          
          <div className="relative bg-[#111] border-t md:border border-white/10 w-full max-w-md rounded-t-3xl md:rounded-2xl p-6 md:p-8 shadow-2xl animate-in slide-in-from-bottom duration-300">
            {!isDeleting && (
              <button onClick={() => setIsModalOpen(false)} className="absolute top-4 right-4 text-zinc-500">
                <X size={24} />
              </button>
            )}

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-2">
                {isDeleting ? <Loader2 className="animate-spin" size={32} /> : <Trash2 size={32} />}
              </div>
              <h3 className="text-xl font-bold text-white">
                {isDeleting ? "Wiping Data..." : "Confirm Deletion"}
              </h3>
              <p className="text-zinc-400 text-sm leading-relaxed px-4">
                {isDeleting 
                  ? "Removing file shards from the mesh network." 
                  : <>Removing <span className="text-white">"{fileToDelete?.originalName}"</span> from the global registry.</>
                }
              </p>
            </div>

            <div className="flex flex-col md:flex-row gap-3 mt-8">
              <button 
                onClick={() => setIsModalOpen(false)}
                disabled={isDeleting}
                className="flex-1 order-2 md:order-1 px-4 py-4 md:py-3 rounded-xl bg-zinc-800 text-white font-semibold hover:bg-zinc-700 transition"
              >
                Back
              </button>
              <button 
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 order-1 md:order-2 px-4 py-4 md:py-3 rounded-xl bg-red-600 text-white font-semibold flex items-center justify-center gap-2"
              >
                {isDeleting ? <Loader2 size={18} className="animate-spin" /> : "Delete Permanently"}
              </button>
            </div>
          </div>
        </div>
      )}

      {files.length === 0 && !loading && (
        <div className="p-20 text-center text-zinc-600 font-mono text-xs tracking-widest uppercase">
          [ No data found in registry ]
        </div>
      )}
    </div>
  );
}