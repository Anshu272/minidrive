export function Modal({ isOpen, onClose, title, description, confirmText = "Confirm", cancelText = "Cancel", onConfirm, danger = false, loading = false, children }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-xl bg-[#0a0a0a] border border-white/10 p-6 shadow-2xl">
        <h2 className="text-lg font-bold text-white mb-2">{title}</h2>
        <p className="text-sm text-zinc-400 mb-2">{description}</p>
        {children}
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-4 py-2 rounded-lg text-sm bg-zinc-800 hover:bg-zinc-700 transition" disabled={loading}>{cancelText}</button>
          <button onClick={onConfirm} disabled={loading} className={`px-4 py-2  cursor-pointer rounded-lg text-sm font-semibold transition ${danger ? "bg-red-500/20 text-red-400 hover:bg-red-500/30" : "bg-yellow-400 text-black hover:bg-yellow-300"}`}>
            {loading ? "Please wait..." : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}