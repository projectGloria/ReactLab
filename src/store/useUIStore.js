import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import sounds from '../lib/soundEffects';

const useUIStore = create(
  persist(
    (set) => ({
      isSidebarOpen: true,
      toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
      setSidebarOpen: (isSidebarOpen) => set({ isSidebarOpen }),
      
      isSettingsOpen: false,
      openSettings: () => set({ isSettingsOpen: true }),
      closeSettings: () => set({ isSettingsOpen: false }),
      toggleSettings: () => set((state) => ({ isSettingsOpen: !state.isSettingsOpen })),

      isVoiceEnabled: false,
      toggleVoice: () => set((state) => ({ isVoiceEnabled: !state.isVoiceEnabled })),
      setVoiceEnabled: (isVoiceEnabled) => set({ isVoiceEnabled }),

      soniaAvatar: null,
      setSoniaAvatar: (soniaAvatar) => set({ soniaAvatar }),
      resetSoniaAvatar: () => set({ soniaAvatar: null }),
      
      isSoundEnabled: true,
      soundProfile: 'mechanical',
      soundVolume: 0.45,

      unlockAllLessons: false,
      toggleUnlockAll: () => set((state) => ({ unlockAllLessons: !state.unlockAllLessons })),
      setUnlockAllLessons: (unlockAllLessons) => set({ unlockAllLessons }),

      // 'en' | 'tr'. This key was already in the persist list below but was never
      // defined, so it read as undefined and nothing could ever set it.
      language: 'en',
      setLanguage: (language) => set({ language: language === 'tr' ? 'tr' : 'en' }),
      toggleLanguage: () => set((state) => ({ language: state.language === 'tr' ? 'en' : 'tr' })),



      // Zen Mode & Modal States
      isZenMode: false,
      toggleZenMode: () => set((state) => ({ isZenMode: !state.isZenMode })),
      setZenMode: (isZenMode) => set({ isZenMode }),

      // Window Controls Display Mode ('hover' | 'always' | 'hidden')
      windowControlsVisibility: 'hover',
      setWindowControlsVisibility: (windowControlsVisibility) => set({ windowControlsVisibility }),
      toggleWindowControlsVisibility: () => set((state) => ({
        windowControlsVisibility: state.windowControlsVisibility === 'always' ? 'hover' : 'always'
      })),

      isMentorOpen: false,
      openMentor: () => set({ isMentorOpen: true }),
      closeMentor: () => set({ isMentorOpen: false }),
      toggleMentor: () => set((state) => ({ isMentorOpen: !state.isMentorOpen })),

      // Persistent Mentor Chat per lesson
      mentorConversations: {}, // { [lessonId]: Array<{role, content}> }
      mentorDrafts: {}, // { [lessonId]: string }
      setMentorDraft: (lessonId, draft) => set((state) => ({
        mentorDrafts: { ...state.mentorDrafts, [lessonId]: draft }
      })),
      setMentorConversation: (lessonId, messages) => set((state) => ({
        mentorConversations: { ...state.mentorConversations, [lessonId]: messages }
      })),
      clearMentorConversation: (lessonId) => set((state) => {
        const next = { ...state.mentorConversations };
        delete next[lessonId];
        return { mentorConversations: next };
      }),

      // AI Mentor Configuration & Persona
      mentorName: 'ReactLab Mentor',
      setMentorName: (mentorName) => set({ mentorName: mentorName?.trim() || 'ReactLab Mentor' }),
      mentorPresetId: 'default',
      setMentorPresetId: (mentorPresetId) => set({ mentorPresetId }),
      // null = follow the selected persona preset. A string (including '') is the
      // learner's own text: clearing the box used to snap straight back to the
      // preset, which made the field look read-only.
      mentorCustomPrompt: null,
      setMentorCustomPrompt: (mentorCustomPrompt) => set({
        mentorCustomPrompt: typeof mentorCustomPrompt === 'string' ? mentorCustomPrompt : null,
      }),
      aiProvider: 'gemini', // 'gemini' | 'groq' | 'openai' | 'ollama'
      geminiApiKey: '',
      groqApiKey: '',
      openAiApiKey: '',
      setAiProvider: (aiProvider) => set({ aiProvider }),
      setGeminiApiKey: (geminiApiKey) => set({ geminiApiKey }),
      setGroqApiKey: (groqApiKey) => set({ groqApiKey }),
      setOpenAiApiKey: (openAiApiKey) => set({ openAiApiKey }),
      clearAllMentorSessions: () => set({ mentorConversations: {}, mentorDrafts: {} }),

      toggleSound: () => set((state) => {
        const next = !state.isSoundEnabled;
        sounds.setEnabled(next);
        if (next) sounds.playClick();
        return { isSoundEnabled: next };
      }),
      
      setSoundEnabled: (isSoundEnabled) => {
        sounds.setEnabled(isSoundEnabled);
        set({ isSoundEnabled });
      },

      setSoundProfile: (soundProfile) => {
        sounds.setProfile(soundProfile);
        sounds.playClick(); // Play instant preview click!
        set({ soundProfile });
      },

      setSoundVolume: (soundVolume) => {
        sounds.setVolume(soundVolume);
        set({ soundVolume });
      },
    }),
    {
      name: 'reactlab-ui-storage', // unique name for localStorage key
      partialize: (state) => ({ 
        isVoiceEnabled: state.isVoiceEnabled,
        soniaAvatar: state.soniaAvatar,
        isSoundEnabled: state.isSoundEnabled,
        soundProfile: state.soundProfile,
        soundVolume: state.soundVolume,
        unlockAllLessons: state.unlockAllLessons,
        language: state.language,
        mentorName: state.mentorName,
        mentorPresetId: state.mentorPresetId,
        mentorCustomPrompt: state.mentorCustomPrompt,
        aiProvider: state.aiProvider,
        geminiApiKey: state.geminiApiKey,
        groqApiKey: state.groqApiKey,
        openAiApiKey: state.openAiApiKey,
        // mentorConversations is deliberately NOT persisted. Full AI chat transcripts are
        // unbounded and would grow the 'reactlab-ui-storage' key until LocalStorage throws
        // QuotaExceededError, which breaks every other persisted setting with it. Conversations
        // stay in memory for the session; mentorDrafts (one short unsent string per lesson) is
        // small and worth keeping across restarts.
        mentorDrafts: state.mentorDrafts,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Older builds persisted '' for "never edited"; keep that meaning.
          if (state.mentorCustomPrompt === '') state.mentorCustomPrompt = null;
          sounds.setEnabled(state.isSoundEnabled ?? true);
          sounds.setProfile(state.soundProfile || 'mechanical');
          if (state.soundVolume !== undefined) sounds.setVolume(state.soundVolume);
        }
      }
    }
  )
);

// Explicit cross-window state rehydration for multi-window desktop setups
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === 'reactlab-ui-storage') {
      useUIStore.persist?.rehydrate();
    }
  });
}

export default useUIStore;
