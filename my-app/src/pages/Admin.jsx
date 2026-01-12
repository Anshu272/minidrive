import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Trash2, ExternalLink, ShieldAlert, X, Loader2 } from "lucide-react";

export default function AdminDashboard() {
  const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // MODAL & ACTION STATES
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [fileToDelete, setFileToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false); // NEW STATE

  const fetchAllFiles = async () => {
    try {
      const res = await fetch(`${BASE_URL}/api/files/admin/all-files`, {
        credentials: "include",
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
    
    setIsDeleting(true); // START LOADING
    try {
      const res = await fetch(`${BASE_URL}/api/files/delete/${fileToDelete._id}`, {
        method: "DELETE",
        credentials: "include",
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
      setIsDeleting(false); // STOP LOADING
      setFileToDelete(null);
    }
  };

  if (loading) return <div className="p-10 text-zinc-400 font-mono">Loading master files...</div>;

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-yellow-400 flex items-center gap-2">
        <ShieldAlert /> Admin File Control
      </h1>
      
      <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0a0a0a]">
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

                <td className="px-6 py-4 font-medium">
                  <Link to={`/file/${file._id}`} className="text-zinc-200 hover:text-yellow-400 transition">
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
                  <button 
                    onClick={() => openDeleteModal(file)}
                    className="text-red-500/50 group-hover:text-red-500 transition-colors"
                  >
                    <Trash2 size={18} className="inline" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- DELETE CONFIRMATION MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => !isDeleting && setIsModalOpen(false)} />
          
          <div className="relative bg-[#111] border border-white/10 w-full max-w-md rounded-2xl p-8 shadow-2xl">
            {!isDeleting && (
              <button 
                onClick={() => setIsModalOpen(false)}
                className="absolute top-4 right-4 text-zinc-500 hover:text-white"
              >
                <X size={20} />
              </button>
            )}

            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                {isDeleting ? <Loader2 className="animate-spin" size={32} /> : <Trash2 className="cursor-pointer" size={32} />}
              </div>
              <h3 className="text-xl font-bold text-white">
                {isDeleting ? "Deleting File..." : "Delete File?"}
              </h3>
              <p className="text-zinc-400 text-sm">
                {isDeleting 
                  ? "Please wait while we remove the data from our nodes." 
                  : <>Are you sure you want to delete <span className="text-white font-semibold">"{fileToDelete?.originalName}"</span>? This cannot be undone.</>
                }
              </p>
            </div>

            <div className="flex gap-3 mt-8">
              <button 
                onClick={() => setIsModalOpen(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 cursor-pointer rounded-xl bg-zinc-800 text-white font-semibold hover:bg-zinc-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-3 rounded-xl bg-red-600 text-white font-semibold hover:bg-red-500 transition disabled:bg-red-800 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isDeleting && <Loader2 size={16} className="animate-spin" />}
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}

      {files.length === 0 && !loading && (
        <div className="p-20 text-center text-zinc-600">No files found.</div>
      )}
    </div>
  );
}