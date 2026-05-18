"use client";

import { useEffect, useState } from "react";
import Gauge from "@/components/Gauge";
import Chat from "@/components/Chat";
import Navigation, { ViewState } from "@/components/Navigation";
import BuildAdvisor from "@/components/BuildAdvisor";
import RamInfographic from "@/components/RamInfographic";
import SystemSpecsInfographic from "@/components/SystemSpecsInfographic";
import PrivacyPopup from "@/components/PrivacyPopup";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

interface TelemetryData {
  timestamp: number;
  system: { hostname: string; os: string };
  cpu: { total: number; cores: number[]; count: number };
  memory: { total: number; available: number; percent: number; used: number };
  storage: { total: number; used: number; free: number; percent: number };
  battery: { percent: number; plugged_in: boolean };
}

export default function Home() {
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [connected, setConnected] = useState(false);
  const [view, setView] = useState<ViewState>("dashboard");
  const [machineId, setMachineId] = useState<string | null>(null);
  const [machines, setMachines] = useState<{id: string, hostname: string}[]>([]);
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [pairingCode, setPairingCode] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.push('/login');
      } else {
        setSession(session);
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) router.push('/login');
    });

    return () => subscription.unsubscribe();
  }, [router]);  const handlePairing = async () => {
    if (!session) return;
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://helios-2-0.onrender.com";
      const res = await fetch(`${apiUrl}/api/pairing/generate`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${session.access_token}`
        }
      });
      const data = await res.json();
      if (data.code) {
        setPairingCode(data.code);
      }
    } catch (err) {
      console.error("Failed to generate pairing code:", err);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const fetchMachine = async () => {
      if (!session) return;
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://helios-2-0.onrender.com";
        const res = await fetch(`${apiUrl}/api/machines`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`
          }
        });
        const data = await res.json();
        if (data.machines && data.machines.length > 0) {
          setMachines(data.details || []);
          if (!machineId) setMachineId(data.machines[0]);
        }
      } catch (err) {
        console.error("Failed to fetch machines:", err);
      }
    };

    if (!machineId) {
      fetchMachine();
      interval = setInterval(fetchMachine, 5000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [machineId, session]);

  useEffect(() => {
    if (!machineId || !session) return;

    // Use NEXT_PUBLIC_WS_URL for production (e.g. wss://api.helios.com/ws/telemetry)
    const wsUrl = process.env.NEXT_PUBLIC_WS_URL 
      ? `${process.env.NEXT_PUBLIC_WS_URL}/${machineId}?token=${session.access_token}`
      : `wss://helios-2-0.onrender.com/ws/telemetry/${machineId}?token=${session.access_token}`;
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => setConnected(true);
    ws.onclose = () => setConnected(false);
    ws.onerror = (error) => console.error("WebSocket Error: ", error);
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        setTelemetry(data);
      } catch (err) {
        console.error("Failed to parse telemetry:", err);
      }
    };

    return () => ws.close();
  }, [machineId]);

  return (
    <main className="min-h-screen bg-[var(--color-brand-bg)] p-4 md:p-8 flex flex-col relative overflow-hidden">
      {/* Ambient Background Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-[var(--color-brand-purple)] opacity-20 blur-[150px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[var(--color-brand-blue)] opacity-10 blur-[150px] rounded-full pointer-events-none"></div>

      <PrivacyPopup />

      <div className="relative z-10 flex flex-col flex-1 max-w-7xl mx-auto w-full">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8 pb-4 md:pb-6 border-b border-[var(--color-brand-border)]">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="text-glow-purple text-[var(--color-brand-purple-glow)]">Helios</span> AI
            </h1>
            <p className="text-sm text-[#94a3b8] mt-1 font-medium">EVENT DASHBOARD</p>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 self-start md:self-auto">
            <a 
              href="/HeliosConnector.exe" 
              download
              className="glass-panel px-4 py-2 rounded-full text-xs font-semibold text-white tracking-wide hover:bg-[var(--color-brand-purple)]/20 transition-colors flex items-center gap-2 border border-[var(--color-brand-purple)]/30"
            >
              ⬇ Download Connector
            </a>
            <button 
              onClick={() => supabase.auth.signOut()}
              className="glass-panel px-4 py-2 rounded-full text-xs font-semibold text-[#ef4444] tracking-wide hover:bg-[#ef4444]/10 transition-colors border border-[#ef4444]/30"
            >
              Sign Out
            </button>
            <div className="flex items-center gap-3 glass-panel px-4 py-2 rounded-full">
              <div className={`w-2.5 h-2.5 rounded-full ${connected ? 'bg-[#10b981] shadow-[0_0_10px_#10b981]' : 'bg-[#ef4444] shadow-[0_0_10px_#ef4444]'}`}></div>
              <span className="text-xs font-semibold text-[#cbd5e1] tracking-wide">{connected ? "SYSTEM ONLINE" : "OFFLINE"}</span>
            </div>
          </div>
        </header>

        {pairingCode && (
          <div className="mb-6 p-4 md:p-6 glass-panel border border-[var(--color-brand-purple)]/50 rounded-xl relative bg-[var(--color-brand-purple)]/10">
            <button 
              onClick={() => setPairingCode(null)}
              className="absolute top-4 right-4 text-[#94a3b8] hover:text-white transition-colors"
            >
              ✕
            </button>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div className="flex-1">
                <h3 className="text-white font-bold text-lg mb-2">Pair New Device (Windows Only)</h3>
                <ol className="text-sm text-[#cbd5e1] list-decimal list-inside space-y-2">
                  <li>Download the <a href="/HeliosConnector.exe" download className="text-[var(--color-brand-purple-glow)] hover:underline font-semibold">Helios Connector</a> executable.</li>
                  <li>Run the downloaded <code className="bg-black/30 px-1 py-0.5 rounded text-[var(--color-brand-purple-glow)]">HeliosConnector.exe</code> file.</li>
                  <li>If Windows SmartScreen appears, click <strong className="text-white">"More info"</strong> and then <strong className="text-white">"Run anyway"</strong>.</li>
                  <li>When prompted in the terminal, enter the pairing code shown on the right.</li>
                  <li>Keep the terminal open to continuously send telemetry data.</li>
                </ol>
              </div>
              <div className="flex flex-col items-center gap-2 bg-black/40 p-4 rounded-xl border border-[var(--color-brand-purple)]/50 min-w-[200px]">
                <span className="text-xs text-[#94a3b8] font-semibold tracking-wider">YOUR PAIRING CODE</span>
                <div className="text-[var(--color-brand-purple-glow)] font-mono text-3xl tracking-[0.2em] font-bold">
                  {pairingCode}
                </div>
              </div>
            </div>
          </div>
        )}

        {machines.length > 0 ? (
          <div className="mb-6 flex gap-2">
            {machines.map((m) => (
              <button
                key={m.id}
                onClick={() => setMachineId(m.id)}
                className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all border ${machineId === m.id ? 'bg-[var(--color-brand-purple)]/20 text-white border-[var(--color-brand-purple)]' : 'glass-panel text-[#94a3b8] border-transparent hover:text-white'}`}
              >
                {m.hostname || m.id}
              </button>
            ))}
            <button
              onClick={handlePairing}
              className="px-4 py-2 rounded-lg text-xs font-semibold transition-all glass-panel text-[#94a3b8] border-transparent hover:text-white flex items-center gap-2"
            >
              + Pair New Device
            </button>
          </div>
        ) : (
          <div className="mb-6 text-center py-12 glass-panel rounded-xl border border-dashed border-[#475569]">
            <h3 className="text-white font-medium mb-2">No devices connected</h3>
            <p className="text-sm text-[#94a3b8] mb-4">You need to pair a machine to see telemetry.</p>
            <button
              onClick={handlePairing}
              className="bg-[var(--color-brand-purple)] hover:bg-[#a855f7] text-white px-6 py-2 rounded-full text-sm font-semibold transition-colors"
            >
              Pair New Device
            </button>
          </div>
        )}

        <Navigation currentView={view} onViewChange={setView} />

        <div className="flex-1 mt-6">
          {view === "dashboard" && (
            <div className="flex flex-col gap-6">
              <h2 className="text-xl font-semibold text-white tracking-wide">System Analyzer</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <Gauge label="CPU LOAD" value={telemetry?.cpu?.total || 0} colorClass="brand-purple" />
                <Gauge label="DISK USAGE" value={telemetry?.storage?.percent || 0} colorClass="brand-blue" />
                <Gauge label="BATTERY" value={telemetry?.battery?.percent || 0} colorClass="brand-purple" />
              </div>
              <div className="grid grid-cols-1 gap-6">
                <RamInfographic
                  total={telemetry?.memory?.total || 0}
                  used={telemetry?.memory?.used || 0}
                  available={telemetry?.memory?.available || 0}
                  percent={telemetry?.memory?.percent || 0}
                />
              </div>

              <SystemSpecsInfographic
                system={telemetry?.system}
                cpu={telemetry?.cpu}
                battery={telemetry?.battery}
                storage={telemetry?.storage}
              />
            </div>
          )}

          {view === "troubleshooter" && (
            <div className="h-[650px]">
              <Chat machineId={machineId} />
            </div>
          )}

          {view === "advisor" && (
            <div className="max-w-4xl mx-auto w-full">
              <BuildAdvisor machineId={machineId} />
            </div>
          )}
        </div>

        {/* Footer */}
        <footer className="mt-12 pt-6 border-t border-[var(--color-brand-border)] text-center text-sm text-[#94a3b8]">
          CREATED BY <a href="https://small-piece.lovable.app/hyper" target="_blank" rel="noopener noreferrer" className="text-[var(--color-brand-purple-glow)] hover:text-white transition-colors font-semibold">Small Piece - HYPER SOLUTIONS</a>
        </footer>
      </div>
    </main>
  );
}
