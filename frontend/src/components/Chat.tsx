"use client";

import { useState } from "react";
import { Send, Loader2 } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function Chat({ machineId }: { machineId?: string | null }) {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResponse(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://helios-2-0.onrender.com";
      const res = await fetch(`${apiUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ machine_id: machineId || "unknown", query }),
      });
      const data = await res.json();
      setResponse(data.response);
    } catch (error) {
      console.error(error);
      setResponse("Connection to The Brain (API) failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full glass-panel rounded-2xl p-4 md:p-6 relative overflow-hidden">
      <h2 className="text-xl font-bold mb-4 md:mb-6 text-white flex items-center gap-2 tracking-wide">
        <span className="text-[var(--color-brand-purple-glow)] text-glow-purple">Troubleshooter</span> Engine
      </h2>
      
      <div className="flex-1 overflow-y-auto mb-6 bg-[rgba(0,0,0,0.2)] p-6 rounded-xl border border-[var(--color-brand-border)] font-sans text-sm leading-relaxed max-w-none custom-markdown-container">
        {loading ? (
          <div className="flex items-center text-[var(--color-brand-purple-glow)] font-medium tracking-wide">
            <Loader2 className="w-5 h-5 mr-3 animate-spin" />
            Analyzing telemetry & system logs...
          </div>
        ) : response ? (
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {response}
          </ReactMarkdown>
        ) : (
          <div className="text-[#64748b] italic flex h-full items-center justify-center text-center">
            Awaiting input... Describe the issue you&apos;re experiencing.
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 bg-[rgba(0,0,0,0.3)] border border-[var(--color-brand-border)] rounded-xl p-2 transition-all focus-within:border-[var(--color-brand-purple)] focus-within:ring-1 focus-within:ring-[var(--color-brand-purple)]">
        <span className="text-[var(--color-brand-purple-glow)] font-bold pl-3">{">"}</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          placeholder="E.g., My screen flickers when I open Godot..."
          className="flex-1 bg-transparent border-none outline-none text-white placeholder-[#475569] font-medium py-2 px-1"
        />
        <button 
          onClick={handleSend}
          disabled={loading || !query.trim()}
          className="bg-[var(--color-brand-purple)] hover:bg-[var(--color-brand-purple-dim)] text-white p-3 rounded-lg transition-all shadow-[0_0_15px_rgba(124,58,237,0.3)] disabled:opacity-50 disabled:shadow-none"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
