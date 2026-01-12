import { useState, useRef } from "react";
import { Upload as UploadIcon, FileText, ImageIcon, X, CheckCircle2, AlertCircle, ShieldCheck } from "lucide-react";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("idle");
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setStatus("idle");
      setMessage("");
    }
  };

  const removeFile = (e) => {
    e.stopPropagation();
    setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setStatus("uploading");
      const res = await fetch("http://localhost:5000/api/files/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "UPLOAD_FAILED");
        setStatus("error");
      } else {
        setMessage("FILE_SYNC_SUCCESSFUL");
        setStatus("success");
        setFile(null);
      }
    } catch (err) {
      setMessage("CONNECTIVITY_ERROR");
      setStatus("error");
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      {/* CONTAINER: Sharp edges, clean border */}
      <div className="w-full max-w-6xl border border-white/10 bg-[#0a0a0a] p-8 md:p-16 relative overflow-hidden">
        
        {/* Subtle Background Badge */}
        <div className="absolute top-0 right-0 p-8 opacity-10 hidden md:block">
          <ShieldCheck size={120} className="text-white" />
        </div>

        <div className="grid md:grid-cols-2 gap-16 items-center">
          
          {/* LEFT SIDE: Info */}
          <div className="space-y-8">
            <header>
              <span className="text-yellow-400 font-mono text-[10px] tracking-[0.5em] uppercase mb-4 block underline underline-offset-8">
                [ INGESTION_MODULE ]
              </span>
              <h2 className="text-7xl font-anton text-white leading-[0.9] uppercase italic">
                Ready to <br />
                <span className="text-yellow-400">Sync?</span>
              </h2>
            </header>
            
            <p className="text-zinc-500 font-mono text-xs leading-loose uppercase tracking-widest max-w-sm">
              Fragment and encrypt your data. We support high-fidelity images and document PDFs. All shards are distributed across the private mesh.
            </p>
            
            <div className="flex items-center gap-8 pt-4 border-t border-white/5 uppercase font-mono text-[10px] text-zinc-600 tracking-widest">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-yellow-400" /> AES_256_ACTIVE
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-white/20" /> SHARD_LOCK
              </div>
            </div>
          </div>

          {/* RIGHT SIDE: Upload Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            <div 
              onClick={() => !file && fileInputRef.current.click()}
              className={`group relative min-h-[350px] border border-d border-white/10 transition-all duration-500 flex flex-col items-center justify-center p-10
                ${!file 
                  ? "bg-white/[0.02] cursor-pointer hover:border-yellow-400/50 hover:bg-yellow-400/[0.02]" 
                  : "bg-white/[0.01] cursor-default"
                }`}
            >
              <input 
                ref={fileInputRef}
                type="file" 
                accept=".pdf,image/*" 
                onChange={handleFileChange} 
                className="hidden" 
              />

              {!file ? (
                <div className="text-center space-y-6">
                  <div className="w-24 h-24 border border-white/10 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 group-hover:border-yellow-400 transition-all duration-500">
                    <UploadIcon className="text-white group-hover:text-yellow-400 w-8 h-8 transition-colors" />
                  </div>
                  <div>
                    <p className="font-anton text-2xl text-white uppercase tracking-widest">Browse_Files</p>
                    <p className="text-zinc-600 font-mono text-[10px] uppercase tracking-[0.3em] mt-2">Support: IMG_PDF</p>
                  </div>
                </div>
              ) : (
                <div className="w-full space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                  <div className="border border-white/10 bg-black p-8 relative">
                    <button 
                      type="button"
                      onClick={removeFile}
                      className="absolute top-4 right-4 text-zinc-600 hover:text-red-500 transition-colors"
                    >
                      <X size={20} />
                    </button>
                    
                    <div className="flex items-center gap-6">
                      <div className="w-16 h-16 border border-white/10 flex items-center justify-center bg-white/5 shrink-0">
                        {file.type.includes("image") ? <ImageIcon className="text-yellow-400 w-8 h-8" /> : <FileText className="text-yellow-400 w-8 h-8" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white font-anton text-xl uppercase truncate tracking-tight">{file.name}</p>
                        <p className="font-mono text-[9px] text-zinc-500 uppercase tracking-widest mt-1">
                          Size: {(file.size / 1024 / 1024).toFixed(2)} MB // Type: {file.type.split('/')[1]}
                        </p>
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={status === "uploading"}
                    className="relative w-full border border-white/10 py-6 overflow-hidden group"
                  >
                    <span className="relative z-10 font-anton text-2xl uppercase tracking-widest group-hover:text-black transition-colors duration-500 text-white">
                      {status === "uploading" ? "Syncing..." : "Push to Drive"}
                    </span>
                    {/* YELLOW FILL TRANSITION */}
                    <div className="absolute inset-0 bg-yellow-400 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out" />
                  </button>
                </div>
              )}
            </div>

            {/* STATUS NOTIFICATION: Sharp and Technical */}
            {message && (
              <div className={`flex items-center gap-4 px-6 py-5 border font-mono text-[10px] tracking-widest uppercase transition-all
                ${status === "success" 
                  ? "bg-emerald-500/5 border-emerald-500/30 text-emerald-400" 
                  : "bg-red-500/5 border-red-500/30 text-red-400"
                }`}>
                {status === "success" ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                <span>Status: {message}</span>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}