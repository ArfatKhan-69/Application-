import React, { useEffect, useRef } from 'react';
import { OrbState } from '../types';
import { Lightbulb, X, Volume2, Sparkles, Mic, Loader2, Hand } from 'lucide-react';

interface VoiceOrbProps {
  orbState: OrbState;
  subtitle: string;
  interimTranscript: string;
  hintText: string;
  showHint: boolean;
  onCloseHint: () => void;
  onOrbClick: () => void;
}

export const VoiceOrb: React.FC<VoiceOrbProps> = ({
  orbState,
  subtitle,
  interimTranscript,
  hintText,
  showHint,
  onCloseHint,
  onOrbClick,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const phaseRef = useRef<number>(0);
  const orbStateRef = useRef<OrbState>(orbState);

  useEffect(() => {
    orbStateRef.current = orbState;
  }, [orbState]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      const parent = canvas.parentElement;
      if (!parent) return;

      const rect = parent.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      // Update canvas dimensions if changed
      if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }

      const width = rect.width;
      const height = rect.height;
      const cx = width / 2;
      const cy = height / 2;
      const baseRadius = Math.min(width, height) * 0.31;

      ctx.clearRect(0, 0, width, height);

      const currentState = orbStateRef.current;
      let speed = 0.03;
      let waveAmp = 4;
      let colorPrimary = 'rgba(99, 102, 241, 0.85)';
      let colorSecondary = 'rgba(56, 189, 248, 0.55)';
      let coreGradStart = '#818cf8';
      let coreGradEnd = '#312e81';

      if (currentState === 'listening') {
        speed = 0.08;
        waveAmp = 12;
        colorPrimary = 'rgba(16, 185, 129, 0.85)';
        colorSecondary = 'rgba(6, 182, 212, 0.65)';
        coreGradStart = '#34d399';
        coreGradEnd = '#065f46';
      } else if (currentState === 'thinking') {
        speed = 0.11;
        waveAmp = 9;
        colorPrimary = 'rgba(217, 70, 239, 0.85)';
        colorSecondary = 'rgba(139, 92, 246, 0.65)';
        coreGradStart = '#e879f9';
        coreGradEnd = '#4c1d95';
      } else if (currentState === 'speaking') {
        speed = 0.095;
        waveAmp = 16;
        colorPrimary = 'rgba(56, 189, 248, 0.9)';
        colorSecondary = 'rgba(129, 140, 248, 0.7)';
        coreGradStart = '#38bdf8';
        coreGradEnd = '#3730a3';
      }

      phaseRef.current += speed;
      const phase = phaseRef.current;

      // Draw 3 harmonic organic wave layers
      for (let layer = 0; layer < 3; layer++) {
        ctx.beginPath();
        const layerOffset = layer * 1.3;
        const radiusScale = 1 + layer * 0.11;

        for (let angle = 0; angle <= Math.PI * 2; angle += 0.06) {
          const harmonic =
            Math.sin(angle * 4 + phase + layerOffset) * waveAmp * 0.6 +
            Math.cos(angle * 3 - phase * 1.2 + layer) * waveAmp * 0.4;
          const r = baseRadius * radiusScale + harmonic;
          const x = cx + Math.cos(angle) * r;
          const y = cy + Math.sin(angle) * r;
          if (angle === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = layer % 2 === 0 ? colorPrimary : colorSecondary;
        ctx.lineWidth = 2.2 - layer * 0.4;
        ctx.stroke();

        ctx.fillStyle = layer === 0 ? colorPrimary.replace('0.85', '0.14') : 'transparent';
        ctx.fill();
      }

      // Draw Glowing Inner Core Sphere
      const coreGrad = ctx.createRadialGradient(
        cx - baseRadius * 0.25,
        cy - baseRadius * 0.25,
        baseRadius * 0.1,
        cx,
        cy,
        baseRadius * 0.95
      );
      coreGrad.addColorStop(0, coreGradStart);
      coreGrad.addColorStop(0.65, colorPrimary);
      coreGrad.addColorStop(1, coreGradEnd);

      ctx.beginPath();
      const pulseCore = baseRadius * (0.88 + Math.sin(phase * 1.4) * 0.04);
      ctx.arc(cx, cy, pulseCore, 0, Math.PI * 2);
      ctx.fillStyle = coreGrad;
      ctx.fill();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  // Visual classes based on current state
  const backdropClass =
    orbState === 'listening'
      ? 'orb-backdrop-listening'
      : orbState === 'thinking'
      ? 'orb-backdrop-thinking'
      : orbState === 'speaking'
      ? 'orb-backdrop-speaking'
      : 'orb-backdrop-idle';

  return (
    <div className="relative flex-1 flex flex-col items-center justify-center my-2 py-4 select-none">
      {/* Dynamic Radial Glow Backdrop */}
      <div
        className={`absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full transition-all duration-700 pointer-events-none ${backdropClass}`}
      />

      {/* State Badge Above Orb */}
      <div className="z-10 mb-3 flex items-center gap-2 px-3.5 py-1 rounded-full bg-slate-900/90 border border-slate-700/80 shadow-inner">
        {orbState === 'listening' ? (
          <>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-semibold tracking-wide text-emerald-300 uppercase flex items-center gap-1.5">
              <Mic className="w-3.5 h-3.5 animate-pulse" />
              Listening to you... Speak naturally
            </span>
          </>
        ) : orbState === 'thinking' ? (
          <>
            <span className="w-2.5 h-2.5 rounded-full bg-fuchsia-400 animate-ping" />
            <span className="text-xs font-semibold tracking-wide text-fuchsia-300 uppercase flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Nova is crafting a response...
            </span>
          </>
        ) : orbState === 'speaking' ? (
          <>
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-xs font-semibold tracking-wide text-cyan-300 uppercase flex items-center gap-1.5">
              <Volume2 className="w-3.5 h-3.5" />
              Nova is Speaking • Tap Orb to Interrupt
            </span>
          </>
        ) : (
          <>
            <span className="w-2 h-2 rounded-full bg-indigo-400" />
            <span className="text-xs font-semibold tracking-wide text-indigo-200 uppercase flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Nova • Ready to Talk
            </span>
          </>
        )}
      </div>

      {/* Interactive 60FPS HTML5 Canvas Orb */}
      <div
        className="relative flex items-center justify-center w-52 h-52 sm:w-64 sm:h-64 cursor-pointer group"
        onClick={onOrbClick}
        title={
          orbState === 'speaking'
            ? 'Click to interrupt Nova'
            : orbState === 'listening'
            ? 'Click to finish speaking'
            : 'Click to start speaking'
        }
      >
        <canvas ref={canvasRef} className="w-full h-full z-10" />
        <div className="absolute inset-4 rounded-full border border-indigo-500/20 group-hover:border-indigo-400/50 transition-all duration-300 pointer-events-none animate-pulse-ring" />
      </div>

      {/* Nova's Current Spoken Subtitle Display */}
      <div className="z-10 max-w-xl w-full text-center mt-3 px-3">
        <p className="text-sm sm:text-base font-medium text-slate-100 leading-relaxed bg-slate-900/75 border border-slate-800/90 rounded-2xl px-4 py-3 shadow-lg backdrop-blur-md">
          "{subtitle}"
        </p>
      </div>

      {/* Live User Speech Interim Transcript Preview */}
      <div className="z-10 mt-2.5 min-h-[28px] flex items-center justify-center px-4">
        {interimTranscript ? (
          <span className="text-xs sm:text-sm italic text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-3 py-1 rounded-full animate-pulse">
            "{interimTranscript}"
          </span>
        ) : orbState === 'listening' ? (
          <span className="text-xs sm:text-sm italic text-emerald-300/80 bg-emerald-950/40 border border-emerald-500/20 px-3 py-0.5 rounded-full">
            Listening...
          </span>
        ) : null}
      </div>

      {/* Collapsible Hint Box */}
      {showHint && (
        <div className="z-10 mt-2 max-w-lg w-full bg-amber-500/10 border border-amber-500/30 rounded-xl px-3.5 py-2 text-xs text-amber-200 flex items-start justify-between gap-2 shadow-lg backdrop-blur-sm animate-in fade-in slide-in-from-top-2">
          <div className="flex-1">
            <span className="font-bold text-amber-400 flex items-center gap-1.5 mb-0.5">
              <Lightbulb className="w-3.5 h-3.5" />
              Try saying:
            </span>
            <span className="italic text-amber-100">"{hintText}"</span>
          </div>
          <button
            onClick={onCloseHint}
            className="text-amber-300 hover:text-white p-1 rounded transition"
            title="Close hint"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
