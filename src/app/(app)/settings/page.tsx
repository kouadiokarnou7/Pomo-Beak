"use client";

import React, { useState } from "react";
import { useApp } from "@/context/AppContext";
import { useAuth } from "@/hooks/useAuth";
import { logout } from "@/app/actions/auth";

type TabType = "profile" | "durations" | "sounds_themes" | "notifications";

export default function SettingsPage() {
  const { user } = useAuth();
  const { timerSettings, setTimerSettings, themeSettings, setThemeSettings, showToast } = useApp();

  const [activeTab, setActiveTab] = useState<TabType>("profile");

  // Local state for durations
  const [focusMin, setFocusMin] = useState(timerSettings.focus / 60);
  const [shortMin, setShortMin] = useState(timerSettings.shortBreak / 60);

  // Local states for theme & audio
  const [generalColor, setGeneralColor] = useState(themeSettings.generalColor);
  const [actionColor, setActionColor] = useState(themeSettings.actionColor);
  const [colorMode, setColorMode] = useState(themeSettings.colorMode);
  const [soundTrack, setSoundTrack] = useState(themeSettings.soundTrack);
  const [bellFrequency, setBellFrequency] = useState(themeSettings.bellFrequency);
  const [ambientSound, setAmbientSound] = useState(themeSettings.ambientSound);
  const [ambientVolume, setAmbientVolume] = useState(themeSettings.ambientVolume);

  // Local states for notifications
  const [notifyInApp, setNotifyInApp] = useState(themeSettings.notifyInApp);
  const [notifyPush, setNotifyPush] = useState(themeSettings.notifyPush);
  const [notifyEmail, setNotifyEmail] = useState(themeSettings.notifyEmail);

  // Custom audio state
  const [customAudioName, setCustomAudioName] = useState<string | null>(null);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const name = localStorage.getItem("focusflow_custom_alarm_name");
      if (name) setCustomAudioName(name);
    }
  }, []);

  const handleAudioUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showToast("Fichier trop volumineux (2MB max)", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      try {
        localStorage.setItem("focusflow_custom_alarm", base64);
        localStorage.setItem("focusflow_custom_alarm_name", file.name);
        setCustomAudioName(file.name);
        setSoundTrack("custom");
        showToast("Sonnerie enregistrée avec succès !", "success");
      } catch (err) {
        showToast("Erreur: Mémoire saturée (fichier trop lourd).", "error");
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSaveDurations = (e: React.FormEvent) => {
    e.preventDefault();
    setTimerSettings(focusMin, shortMin);
    showToast("Durées enregistrées avec succès !", "success");
  };

  const handleSaveSoundsThemes = (e: React.FormEvent) => {
    e.preventDefault();
    setThemeSettings({
      ...themeSettings,
      generalColor,
      actionColor,
      colorMode,
      soundTrack,
      bellFrequency,
      ambientSound,
      ambientVolume,
    });
    showToast("Réglages audio et thème enregistrés avec succès !", "success");
  };

  const handleSaveNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    setThemeSettings({
      ...themeSettings,
      notifyInApp,
      notifyPush,
      notifyEmail,
    });
    showToast("Préférences de notifications enregistrées avec succès !", "success");
  };

  const testChime = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (soundTrack === "zen_chime") {
        osc.type = "sine";
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15);
      } else if (soundTrack === "digital_beep") {
        osc.type = "square";
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.setValueAtTime(1000, ctx.currentTime + 0.1);
      } else {
        osc.type = "triangle";
        osc.frequency.setValueAtTime(440, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.2);
      }

      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.45);
    } catch (e) {
      console.error(e);
    }
  };

  const handleResetLocalData = () => {
    if (confirm("Voulez-vous vraiment réinitialiser toutes vos données locales ?")) {
      localStorage.clear();
      window.location.reload();
    }
  };

  const tabs: { id: TabType; label: string; icon: string }[] = [
    { id: "profile", label: "Profil", icon: "person" },
    { id: "durations", label: "Durées", icon: "schedule" },
    { id: "sounds_themes", label: "Sons & Thème", icon: "palette" },
    { id: "notifications", label: "Notifications", icon: "notifications" },
  ];

  return (
    <div className="flex flex-col gap-6 w-full font-sans max-w-5xl mx-auto">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-bold text-on-surface tracking-tight">Paramètres Avancés</h2>
        <p className="text-xs text-on-surface-variant mt-1">Personnalisez votre compagnon pomoBEAK et gérez vos alertes.</p>
      </div>

      {/* Main Layout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Horizontal on Mobile, Vertical on Desktop */}
        <div className="md:col-span-3 flex flex-row md:flex-col gap-1 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 md:border-r border-border-glass/40 md:pr-4 shrink-0 scrollbar-none">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap cursor-pointer active:scale-95 ${
                activeTab === tab.id
                  ? "bg-primary text-background-obsidian font-extrabold shadow-glow-general-sm"
                  : "text-on-surface-variant hover:bg-surface-glass hover:text-on-surface"
              }`}
            >
              <span className="material-symbols-outlined text-[18px]">{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Right Column: Settings Content Cards */}
        <div className="md:col-span-9 glass-panel rounded-xl p-6 md:p-8 min-h-[400px]">
          {/* TAB 1: PROFILE */}
          {activeTab === "profile" && (
            <div className="space-y-6 animate-fade-in">
              <h3 className="text-sm font-semibold tracking-wider text-on-surface-variant uppercase pb-2 border-b border-border-glass/40">Mon Profil pomoBEAK</h3>
              
              <div className="flex flex-col sm:flex-row items-center gap-6 p-4 bg-surface-glass/40 border border-border-glass rounded-xl">
                <div className="w-16 h-16 rounded-full border border-border-glass overflow-hidden bg-primary/10 flex items-center justify-center text-xl font-bold text-primary shadow-glow-general-sm shrink-0">
                  {user?.email ? user.email.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="text-center sm:text-left">
                  <h4 className="font-bold text-base text-on-surface">{user?.user_metadata?.full_name || "Utilisateur pomoBEAK"}</h4>
                  <p className="text-xs text-on-surface-variant font-mono mt-0.5">{user?.email || "Mode Invité (Données locales)"}</p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-surface-glass/20 p-4 rounded-xl border border-border-glass/35 space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-on-surface-variant">Statut du compte</span>
                    <span className="font-bold text-primary">{user ? "Connecté " : "Mode Invité"}</span>
                  </div>
                  <div className="flex justify-between text-xs border-t border-border-glass/10 pt-3">
                    <span className="text-on-surface-variant">Fréquence d'utilisation</span>
                    <span className="font-semibold text-on-surface">Quotidienne</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    onClick={handleResetLocalData}
                    className="flex-1 py-2.5 px-4 border border-dashed border-error/30 hover:border-error text-error hover:bg-error/5 transition-all rounded-lg text-xs font-bold cursor-pointer"
                  >
                    Réinitialiser les données locales
                  </button>
                  {user && (
                    <button
                      onClick={() => logout()}
                      className="flex-1 py-2.5 px-4 bg-error/10 hover:bg-error/15 border border-error/30 text-error transition-all rounded-lg text-xs font-bold cursor-pointer"
                    >
                      Se déconnecter
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DURATIONS */}
          {activeTab === "durations" && (
            <form onSubmit={handleSaveDurations} className="space-y-6 animate-fade-in">
              <h3 className="text-sm font-semibold tracking-wider text-on-surface-variant uppercase pb-2 border-b border-border-glass/40">Durées (Minutes)</h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Focus duration */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant">Durée Focus</label>
                  <div className="flex items-center justify-between bg-surface-glass border border-border-glass rounded-lg p-1.5">
                    <button
                      type="button"
                      onClick={() => setFocusMin(Math.max(5, focusMin - 5))}
                      className="w-8 h-8 rounded flex items-center justify-center hover:bg-surface-container transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">remove</span>
                    </button>
                    <span className="font-mono font-bold text-primary">{focusMin} min</span>
                    <button
                      type="button"
                      onClick={() => setFocusMin(Math.min(90, focusMin + 5))}
                      className="w-8 h-8 rounded flex items-center justify-center hover:bg-surface-container transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                    </button>
                  </div>
                </div>

                {/* Short break */}
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant">Pause Courte</label>
                  <div className="flex items-center justify-between bg-surface-glass border border-border-glass rounded-lg p-1.5">
                    <button
                      type="button"
                      onClick={() => setShortMin(Math.max(1, shortMin - 1))}
                      className="w-8 h-8 rounded flex items-center justify-center hover:bg-surface-container transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">remove</span>
                    </button>
                    <span className="font-mono font-bold text-secondary">{shortMin} min</span>
                    <button
                      type="button"
                      onClick={() => setShortMin(Math.min(20, shortMin + 1))}
                      className="w-8 h-8 rounded flex items-center justify-center hover:bg-surface-container transition-colors cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">add</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-6 flex justify-end">
                <button
                  type="submit"
                  className="bg-primary-container text-white py-2.5 px-6 rounded-lg shadow-glow-action-md hover:brightness-105 transition-all text-xs font-bold active:scale-95 cursor-pointer"
                >
                  Enregistrer les durées
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: SOUNDS & THEMES */}
          {activeTab === "sounds_themes" && (
            <form onSubmit={handleSaveSoundsThemes} className="space-y-6 animate-fade-in">
              <h3 className="text-sm font-semibold tracking-wider text-on-surface-variant uppercase pb-2 border-b border-border-glass/40">Sons & Thèmes</h3>
              
              {/* Appearance Mode */}
              <div className="flex items-center justify-between py-2 border-b border-border-glass/10">
                <div>
                  <h4 className="text-xs font-bold text-on-surface">Thème Sombre</h4>
                  <p className="text-[10px] text-on-surface-variant mt-0.5">Activer ou désactiver le mode sombre visuel.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setColorMode(colorMode === "dark" ? "light" : "dark")}
                  className={`w-10 h-6 rounded-full transition-all relative cursor-pointer ${colorMode === "dark" ? "bg-primary" : "bg-surface-container"}`}
                >
                  <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${colorMode === "dark" ? "right-1" : "left-1"}`}></span>
                </button>
              </div>

              {/* Color picker */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 py-2">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant">Couleur Dominante</label>
                  <div className="flex items-center gap-4 bg-surface-glass border border-border-glass rounded-xl p-2.5">
                    <input 
                      type="color" 
                      value={generalColor}
                      onChange={(e) => setGeneralColor(e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer border-none p-0 bg-transparent"
                    />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-on-surface">Dominante</p>
                      <p className="text-[10px] text-on-surface-variant font-mono">{generalColor}</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant">Couleur des Accents d'Action</label>
                  <div className="flex items-center gap-4 bg-surface-glass border border-border-glass rounded-xl p-2.5">
                    <input 
                      type="color" 
                      value={actionColor}
                      onChange={(e) => setActionColor(e.target.value)}
                      className="w-8 h-8 rounded cursor-pointer border-none p-0 bg-transparent"
                    />
                    <div className="flex-1">
                      <p className="text-xs font-bold text-on-surface">Accents</p>
                      <p className="text-[10px] text-on-surface-variant font-mono">{actionColor}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Alarm configuration */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-border-glass/10">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant flex justify-between items-center">
                    <span>Son de Fin de Session</span>
                    <label className="text-[10px] text-primary cursor-pointer hover:underline bg-primary/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                      <span className="material-symbols-outlined text-[12px]">upload</span>
                      Uploader (.mp3)
                      <input type="file" accept="audio/*" className="hidden" onChange={handleAudioUpload} />
                    </label>
                  </label>
                  <select 
                    value={soundTrack}
                    onChange={(e) => setSoundTrack(e.target.value)}
                    className="w-full bg-surface-glass border border-border-glass rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary glass-select"
                  >
                    <option value="zen_chime">Zen Chime (Ondes Sinus)</option>
                    <option value="digital_beep">Digital Beep (Ondes Carrées)</option>
                    <option value="soft_bell">Soft Bell (Triangle Doux)</option>
                    {customAudioName && <option value="custom">Perso : {customAudioName}</option>}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-on-surface-variant">Fréquence de Sonnerie</label>
                  <select 
                    value={bellFrequency}
                    onChange={(e) => setBellFrequency(e.target.value as any)}
                    className="w-full bg-surface-glass border border-border-glass rounded-lg px-3 py-2 text-xs text-on-surface focus:outline-none focus:border-primary glass-select"
                  >
                    <option value="once">Sonne une fois</option>
                    <option value="repeat_3">Sonne trois fois</option>
                    <option value="continuous">Alarme continue (jusqu'au clic)</option>
                  </select>
                </div>
              </div>

              {/* Test chime button */}
              <div className="flex justify-between items-center bg-surface-glass/25 p-3 rounded-lg border border-border-glass/15">
                <span className="text-[11px] text-on-surface-variant">Tester le signal sonore sélectionné</span>
                <button
                  type="button"
                  onClick={testChime}
                  className="px-3.5 py-1 rounded bg-surface-container hover:bg-surface-glass border border-border-glass/40 text-[10px] font-bold transition-all cursor-pointer"
                >
                  Tester le son
                </button>
              </div>

              <div className="pt-6 flex justify-end">
                <button
                  type="submit"
                  className="bg-primary-container text-white py-2.5 px-6 rounded-lg shadow-glow-action-md hover:brightness-105 transition-all text-xs font-bold active:scale-95 cursor-pointer"
                >
                  Enregistrer les sons & thèmes
                </button>
              </div>
            </form>
          )}

          {/* TAB 4: NOTIFICATIONS */}
          {activeTab === "notifications" && (
            <form onSubmit={handleSaveNotifications} className="space-y-6 animate-fade-in">
              <h3 className="text-sm font-semibold tracking-wider text-on-surface-variant uppercase pb-2 border-b border-border-glass/40">Préférences de Notifications</h3>
              
              <div className="space-y-4">
                {/* In-app alert */}
                <div className="flex items-center justify-between py-2">
                  <div>
                    <h4 className="text-xs font-bold text-on-surface">Alertes Intégrées (In-App)</h4>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">Affiche un pop-up dans l'application pomoBEAK à la fin du cycle.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotifyInApp(!notifyInApp)}
                    className={`w-10 h-6 rounded-full transition-all relative cursor-pointer ${notifyInApp ? "bg-primary" : "bg-surface-container"}`}
                  >
                    <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${notifyInApp ? "right-1" : "left-1"}`}></span>
                  </button>
                </div>

                {/* Push notification */}
                <div className="flex items-center justify-between py-2 border-t border-border-glass/10">
                  <div>
                    <h4 className="text-xs font-bold text-on-surface">Notifications Navigateur (Push)</h4>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">Envoyer des notifications de bureau système via le navigateur.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotifyPush(!notifyPush)}
                    className={`w-10 h-6 rounded-full transition-all relative cursor-pointer ${notifyPush ? "bg-primary" : "bg-surface-container"}`}
                  >
                    <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${notifyPush ? "right-1" : "left-1"}`}></span>
                  </button>
                </div>

                {/* Email reminder */}
                <div className="flex items-center justify-between py-2 border-t border-border-glass/10">
                  <div>
                    <h4 className="text-xs font-bold text-on-surface">Rappels de Démarrage par Email</h4>
                    <p className="text-[10px] text-on-surface-variant mt-0.5">Envoyer un rappel par e-mail lors de l'arrivée à échéance d'une tâche.</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotifyEmail(!notifyEmail)}
                    className={`w-10 h-6 rounded-full transition-all relative cursor-pointer ${notifyEmail ? "bg-primary" : "bg-surface-container"}`}
                  >
                    <span className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-all ${notifyEmail ? "right-1" : "left-1"}`}></span>
                  </button>
                </div>
              </div>

              <div className="pt-6 flex justify-end">
                <button
                  type="submit"
                  className="bg-primary-container text-white py-2.5 px-6 rounded-lg shadow-glow-action-md hover:brightness-105 transition-all text-xs font-bold active:scale-95 cursor-pointer"
                >
                  Enregistrer les notifications
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
