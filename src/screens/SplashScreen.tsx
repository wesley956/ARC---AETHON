// ============================================================
// ARC: AETHON — SPLASH SCREEN
// Mobile-optimized loading screen.
// ============================================================

import Layout from '../components/Layout';

export default function SplashScreen() {
  return (
    <Layout className="items-center justify-center px-6">
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        {/* Logo/Icon */}
        <div className="text-6xl sm:text-7xl animate-float">🥚</div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-2xl sm:text-3xl font-bold text-[#c4b5fd]">Arc: Aethon</h1>
          <p className="text-sm text-[#6a6a7a] mt-2">Carregando...</p>
        </div>

        {/* Loading dots */}
        <div className="flex gap-2" aria-hidden="true">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2.5 h-2.5 rounded-full bg-[#a78bfa] animate-pulse"
              style={{ animationDelay: `${i * 0.2}s` }}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
}
