"use client";

import { useState } from "react";
import { Cpu, Loader2 } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function BuildAdvisor({ machineId }: { machineId?: string | null }) {
  const [budget, setBudget] = useState("");
  const [workload, setWorkload] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!budget || !workload) return;
    setLoading(true);
    setResponse(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8001";
      const res = await fetch(`${apiUrl}/api/upgrade`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ machine_id: machineId || "unknown", budget, workload }),
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
    <div className="flex flex-col h-full glass-panel rounded-2xl p-4 md:p-8 relative overflow-hidden">
      <h2 className="text-xl md:text-2xl font-bold mb-2 text-white flex items-center gap-3">
        <Cpu className="w-7 h-7 text-[var(--color-brand-purple-glow)]" /> Build Advisor
      </h2>
      <p className="text-[#94a3b8] mb-6 md:mb-8 text-sm">
        This tool analyzes your current system metrics (CPU load, memory allocation) to recommend the perfect new machine or upgrade parts tailored to your specific workflow.
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <label className="block text-xs font-semibold text-[#cbd5e1] mb-2 tracking-wider">TARGET BUDGET</label>
          <input
            type="text"
            value={budget}
            onChange={(e) => setBudget(e.target.value)}
            placeholder="e.g., $1500, ₦1,200,000"
            className="w-full bg-[rgba(0,0,0,0.3)] border border-[var(--color-brand-border)] rounded-xl p-4 text-white focus:border-[var(--color-brand-purple)] focus:ring-1 focus:ring-[var(--color-brand-purple)] outline-none transition-all placeholder-[#475569]"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#cbd5e1] mb-2 tracking-wider">PRIMARY WORKLOAD</label>
          <input
            type="text"
            value={workload}
            onChange={(e) => setWorkload(e.target.value)}
            placeholder="e.g., 1440p Gaming, 4K Video Editing"
            className="w-full bg-[rgba(0,0,0,0.3)] border border-[var(--color-brand-border)] rounded-xl p-4 text-white focus:border-[var(--color-brand-purple)] focus:ring-1 focus:ring-[var(--color-brand-purple)] outline-none transition-all placeholder-[#475569]"
          />
        </div>
      </div>

      <button
        onClick={handleAnalyze}
        disabled={loading || !budget || !workload}
        className="bg-[var(--color-brand-purple)] hover:bg-[var(--color-brand-purple-dim)] text-white font-bold py-4 px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] disabled:opacity-50 disabled:shadow-none w-full md:w-auto self-start"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" /> Analyzing Current Specs...
          </span>
        ) : (
          "GENERATE BUILD RECOMMENDATION"
        )}
      </button>

      {response && (
        <div className="mt-10 bg-[rgba(0,0,0,0.2)] p-8 rounded-2xl border border-[var(--color-brand-border)] font-sans text-sm leading-relaxed max-w-none custom-markdown-container">
          <span className="text-[var(--color-brand-purple-glow)] font-semibold mb-6 block tracking-widest text-xs flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-[var(--color-brand-purple-glow)] glow-purple animate-pulse"></div>
            ANALYSIS COMPLETE
          </span>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {response}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}
