// ============================================================
// ARC: AETHON — SPLASH SCREEN
// ============================================================

import Layout from '../components/Layout';

export default function SplashScreen() {
  return (
    <Layout className="items-center justify-center">
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        <div className="text-6xl animate-float">🥚</div>
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-[#c4b5fd]">Arc: Aethon</h1>
          <p className="text-sm text-[#6a6a7a]">Carregando...</p>
        </div>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div key={i} className="w-2 h-2 rounded-full bg-[#a78bfa] animate-glow" style={{ animationDelay: `${i * 0.3}s` }} />
          ))}
        </div>
      </div>
    </Layout>
  );
}
