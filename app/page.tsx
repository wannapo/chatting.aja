"use client";
export default function LandingPage() {
  return (
    <>
      <style>{`
        html, body { height: 100%; margin: 0; padding: 0; }
        .root-wrap {
          min-height: 100vh;
          width: 100%;
          background: var(--bg);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          position: relative;
          overflow: hidden;
          text-align: center;
          padding: 24px 20px;
          box-sizing: border-box;
        }
        .root-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
          background-size: 44px 44px;
          mask-image: radial-gradient(ellipse 60% 50% at 50% 40%, black, transparent);
        }
        .root-glow {
          position: absolute; inset: 0; pointer-events: none;
          background: radial-gradient(ellipse at 30% 20%, color-mix(in srgb, var(--accent) 25%, transparent), transparent 55%),
                      radial-gradient(ellipse at 75% 60%, color-mix(in srgb, var(--accent2) 18%, transparent), transparent 55%);
        }
        .root-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 6px 14px;
          border-radius: 999px;
          border: 1px solid var(--border);
          background: var(--surface);
          color: var(--muted);
          font-size: 13px;
          font-weight: 500;
          margin-bottom: 28px;
        }
        .root-dot {
          width: 6px; height: 6px; border-radius: 999px;
          background: var(--green);
          box-shadow: 0 0 8px var(--green);
        }
        .root-title {
          font-weight: 800;
          font-size: clamp(36px, 10vw, 88px);
          background: var(--brand-gradient);
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          letter-spacing: clamp(-1.5px, -0.5vw, -3px);
          line-height: 1.05;
          margin-bottom: 18px;
          word-break: break-word;
          max-width: 100%;
        }
        .root-sub {
          font-size: clamp(14px, 4vw, 18px);
          color: var(--muted);
          font-weight: 400;
          margin-bottom: 44px;
          max-width: 360px;
          line-height: 1.6;
          text-align: center;
          margin-left: auto;
          margin-right: auto;
        }
        .root-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: clamp(12px, 3vw, 15px) clamp(26px, 8vw, 44px);
          border-radius: 12px;
          background: var(--bubble-mine);
          color: white;
          font-weight: 600;
          font-size: clamp(14px, 4vw, 16px);
          text-decoration: none;
          box-shadow: 0 4px 24px color-mix(in srgb, var(--accent) 35%, transparent);
          transition: transform 0.15s ease, box-shadow 0.15s ease;
          white-space: nowrap;
        }
        .root-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 32px color-mix(in srgb, var(--accent) 50%, transparent); }
      `}</style>
      <div className="root-wrap">
        <div className="root-grid" />
        <div className="root-glow" />
        <div style={{ position: "relative", zIndex: 1, width: "100%" }}>
          <span className="root-badge">
            <span className="root-dot" />
            Tanpa nomor telepon, tanpa email
          </span>
          <h1 className="root-title">chatting.aja</h1>
          <p className="root-sub">Chat cepat, privasi rapat, tanpa ribet.</p>
          <a href="/landing.html" className="root-btn">Mulai sekarang →</a>
        </div>
      </div>
    </>
  );
}
