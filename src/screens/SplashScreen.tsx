// ============================================================
// ARC: AETHON — SPLASH SCREEN
// Brief loading screen shown on app start.
// ============================================================

import Layout from '../components/Layout';

export default function SplashScreen() {
  return (
    <Layout className="items-center justify-center">
      <div className="flex flex-col items-center gap-6 animate-fade-in">
        {/* Logo/Icon */}
        <div className="text-7xl animate-float">🥚</div>

        {/* Title */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-[#c4b5fd]">Arc: Aethon</h1>
          <p className="text-sm text-[#6a6a7a] mt-2">Carregando...</p>
        </div>

        {/* Loading dots */}
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full bg-[#a78bfa]"
              style={{
                animation: `pulse 1s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    </Layout>
  );
}
