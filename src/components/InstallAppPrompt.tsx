// ============================================================
// ARC: AETHON — INSTALL APP PROMPT (PWA - Prompt 12)
// ============================================================

import { useEffect, useState } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export default function InstallAppPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const dismissed = localStorage.getItem('aethon_install_prompt_dismissed');
    if (dismissed === 'true') return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setTimeout(() => setShowPrompt(true), 3000);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  if (!showPrompt || !deferredPrompt) return null;

  const handleInstall = async () => {
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') localStorage.setItem('aethon_install_prompt_dismissed', 'true');
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('aethon_install_prompt_dismissed', 'true');
    setShowPrompt(false);
  };

  return (
    <div className="fixed bottom-20 left-4 right-4 max-w-md mx-auto z-40 animate-fade-in safe-area-bottom">
      <div className="bg-[#1a1a2e]/95 backdrop-blur-sm border border-[#a78bfa]/30 rounded-2xl p-4 shadow-lg shadow-purple-900/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#7c3aed] to-[#a78bfa] flex items-center justify-center text-lg">🥚</div>
          <div>
            <p className="text-sm font-semibold text-[#e8e8ec]">Instalar Arc: Aethon</p>
            <p className="text-xs text-[#6a6a7a]">Acesse como app no seu dispositivo</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={handleInstall} className="flex-1 py-2.5 bg-[#a78bfa] text-white text-sm font-semibold rounded-xl active:scale-[0.98] transition-all">Instalar</button>
          <button onClick={handleDismiss} className="px-4 py-2.5 bg-[#2a2a3a] text-[#6a6a7a] text-sm rounded-xl active:scale-[0.98] transition-all">Agora não</button>
        </div>
      </div>
    </div>
  );
}
