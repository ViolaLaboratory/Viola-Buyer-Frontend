import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import API_ENDPOINTS from "@/config/api";

const License = () => {
  const location = useLocation();
  const initial = useMemo(
    () => (location.state || {}) as { orderId?: string; email?: string; name?: string },
    [location.state]
  );
  const [orderId, setOrderId] = useState(initial.orderId || "");
  const [email, setEmail] = useState(initial.email || "");
  const [fullName, setFullName] = useState(initial.name || "");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleInitiate = async () => {
    setIsLoading(true);
    setMessage("");
    try {
      const res = await fetch(API_ENDPOINTS.LICENSE_INITIATE, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_id: orderId, email, full_name: fullName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Failed to initiate license");
      setMessage(data.signing_url ? `DocuSign URL: ${data.signing_url}` : data.message || "License created.");
    } catch {
      setMessage("Failed to initialize signing flow.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadSigned = async (file: File) => {
    setIsLoading(true);
    setMessage("");
    try {
      const formData = new FormData();
      formData.append("order_id", orderId);
      formData.append("email", email);
      formData.append("file", file);
      const res = await fetch(API_ENDPOINTS.LICENSE_UPLOAD_SIGNED, {
        method: "POST",
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error("Failed to upload signed file");
      setMessage(`Signed license uploaded: ${data.file_path}`);
    } catch {
      setMessage("Failed to upload signed document.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-screen overflow-y-auto px-8 py-6 text-white">
      <h1 className="text-5xl font-dm mb-6">License</h1>
      <div className="max-w-3xl rounded-2xl border border-white/20 bg-black/35 p-6 space-y-4">
        <input value={orderId} onChange={(e) => setOrderId(e.target.value)} placeholder="Order ID" className="w-full rounded bg-white/10 border border-white/20 px-4 py-3" />
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full Name" className="w-full rounded bg-white/10 border border-white/20 px-4 py-3" />
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded bg-white/10 border border-white/20 px-4 py-3" />
        <button onClick={handleInitiate} disabled={isLoading || !orderId || !email} className="rounded-full bg-[#cfaeff] text-black px-5 py-2 font-medium disabled:opacity-50">
          {isLoading ? "Processing..." : "Start DocuSign Flow"}
        </button>
        <label className="block rounded-xl border border-white/20 bg-white/5 px-4 py-3 cursor-pointer">
          Upload signed PDF
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleUploadSigned(file);
            }}
          />
        </label>
        {message && <p className="text-white/80 text-sm">{message}</p>}
      </div>
    </div>
  );
};

export default License;
