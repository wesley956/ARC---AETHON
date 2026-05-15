// ============================================================
// ARC: AETHON — SPLASH SCREEN
// Brief loading screen shown on app start.
// ============================================================

import Layout from '../components/Layout';

export default function SplashScreen() {
  return (
    <Layout className="items-center justify-center">
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        {/* Logo / Title */}
        <div className="text-center">
          <div className="text-5xl mb-2">🥚</div>
          <h1 className="text-3xl font-bold tracking-wider text-aethon-glow">
            ARC
          </h1>
          <p className="text-lg text-aethon-muted tracking-widest uppercase">
            Aethon
          </p>
        </div>

        {/* Loading indicator */}
        <div className="flex gap-1">
          <div className="w-2 h-2 rounded-full bg-aethon-accent animate-pulse" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 rounded-full bg-aethon-accent animate-pulse" style={{ animationDelay: '200ms' }} />
          <div className="w-2 h-2 rounded-full bg-aethon-accent animate-pulse" style={{ animationDelay: '400ms' }} />
        </div>
      </div>
    </Layout>
  );
}
