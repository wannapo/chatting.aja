export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <style>{`
        html, body { height: 100%; margin: 0; padding: 0; }
        .auth-wrap {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #0a0a10;
          padding: 24px 16px;
          position: relative;
          overflow: hidden;
        }
        .auth-grid {
          position: absolute; inset: 0; pointer-events: none;
          background-image:
            linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
          background-size: 44px 44px;
          mask-image: radial-gradient(ellipse 60% 50% at 50% 40%, black, transparent);
        }
        .auth-glow {
          position: absolute;
          inset: 0;
          pointer-events: none;
          background:
            radial-gradient(ellipse at 25% 30%, rgba(168,85,247,0.22), transparent 55%),
            radial-gradient(ellipse at 75% 60%, rgba(217,70,239,0.16), transparent 55%);
        }
        .auth-card {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
          background: #111116;
          border: 1px solid #2a2a35;
          border-radius: 20px;
          padding: 36px 32px;
        }
        @media (max-width: 480px) {
          .auth-card { padding: 28px 20px; border-radius: 16px; }
        }
      `}</style>
      <div className="auth-wrap">
        <div className="auth-grid" />
        <div className="auth-glow" />
        <div className="auth-card">
          {children}
        </div>
      </div>
    </>
  );
}
