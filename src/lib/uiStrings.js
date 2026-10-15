// UI chrome strings, separate from lesson content.
//
// Deliberately a flat dictionary rather than an i18n library: the app ships
// offline in an Electron bundle, and a runtime message-format dependency would
// buy plural rules and date formatting that nothing here needs. Keys are the
// English source text's meaning, not the text itself, so re-wording English
// does not silently orphan the Turkish.
//
// A missing Turkish key falls back to English rather than rendering the key,
// which keeps a half-translated screen readable instead of littered with
// `nav.reviewLab`.

const STRINGS = {
  en: {
    'nav.reviewLab': 'Review Lab',
    'nav.glossary': 'Glossary Codex',
    'nav.home': 'Home',
    'progress.complete': '{done}/{total} complete',
    'nav.modulePrefix': 'Module {n}:',
    'nav.moduleOverview': 'View Module {n} Overview',
    'nav.moduleLocked': 'Module {n} (Locked — click to view overview)',

    'lesson.askMentor': 'Ask Mentor',
    'lesson.challenge': 'Challenge',
    'lesson.hints': 'Hints',
    'lesson.solution': 'Solution',
    'lesson.run': 'Run',
    'lesson.reset': 'Reset',
    'lesson.markComplete': 'Mark Complete',
    'lesson.completed': 'Completed',
    'lesson.nextLesson': 'Next Lesson',
    'lesson.popOutReading': 'Pop out Lesson Reading into a separate OS window',
    'lesson.popOutEditor': 'Pop out the Live Sandbox into a separate OS window',
    'lesson.zenMode': 'Zen Mode',

    'playground.testFileTitle': 'This example is a test file.',
    'playground.testFileBody': 'Read it and edit it above — there is no test runner in the sandbox, so there is nothing to preview.',
    'playground.plainJsTitle': 'This example is plain JavaScript.',
    'playground.plainJsBody': 'Read it and edit it above. It does not describe a screen yet, so there is nothing to preview.',

    'lesson.notFoundTitle': 'Lesson not found',
    'lesson.notFoundBody': 'Choose a lesson from the curriculum to continue learning.',
    'lesson.returnHome': 'Return home',

    'settings.title': 'Settings',
    'settings.language': 'Language',
    'settings.sound': 'Sound',
    'settings.freeRoam': 'Free Roam Mode',

    'mentor.placeholder': 'Ask me about this lesson…',
    'mentor.thinking': 'Thinking…',
  },

  tr: {
    'nav.reviewLab': 'Tekrar Laboratuvarı',
    'nav.glossary': 'Terim Sözlüğü',
    'nav.home': 'Ana Sayfa',
    'progress.complete': '{done}/{total} tamamlandı',
    'nav.modulePrefix': 'Modül {n}:',
    'nav.moduleOverview': 'Modül {n} genel bakışını aç',
    'nav.moduleLocked': 'Modül {n} (Kilitli — genel bakış için tıklayın)',

    'lesson.askMentor': 'Mentöre Sor',
    'lesson.challenge': 'Alıştırma',
    'lesson.hints': 'İpuçları',
    'lesson.solution': 'Çözüm',
    'lesson.run': 'Çalıştır',
    'lesson.reset': 'Sıfırla',
    'lesson.markComplete': 'Tamamlandı İşaretle',
    'lesson.completed': 'Tamamlandı',
    'lesson.nextLesson': 'Sonraki Ders',
    'lesson.popOutReading': 'Ders metnini ayrı bir pencerede aç',
    'lesson.popOutEditor': 'Canlı editörü ayrı bir pencerede aç',
    'lesson.zenMode': 'Odak Modu',

    'playground.testFileTitle': 'Bu örnek bir test dosyası.',
    'playground.testFileBody': 'Yukarıdan okuyup düzenleyebilirsiniz — bu ortamda test çalıştırıcı yok, dolayısıyla gösterilecek bir önizleme de yok.',
    'playground.plainJsTitle': 'Bu örnek düz JavaScript.',
    'playground.plainJsBody': 'Yukarıdan okuyup düzenleyebilirsiniz. Henüz bir ekran tarif etmiyor, dolayısıyla önizleme yok.',

    'lesson.notFoundTitle': 'Ders bulunamadı',
    'lesson.notFoundBody': 'Öğrenmeye devam etmek için müfredattan bir ders seçin.',
    'lesson.returnHome': 'Ana sayfaya dön',

    'settings.title': 'Ayarlar',
    'settings.language': 'Dil',
    'settings.sound': 'Ses',
    'settings.freeRoam': 'Serbest Dolaşım',

    'mentor.placeholder': 'Bu ders hakkında soru sorun…',
    'mentor.thinking': 'Düşünüyor…',
  },
};

/**
 * Look up a UI string, filling `{name}` placeholders from `vars`.
 * Falls back to English, then to the key itself.
 */
export function translate(locale, key, vars) {
  const text = STRINGS[locale]?.[key] ?? STRINGS.en[key] ?? key;
  if (!vars) return text;
  return text.replace(/\{(\w+)\}/g, (match, name) =>
    Object.hasOwn(vars, name) ? String(vars[name]) : match,
  );
}

/** Bind `translate` to one locale, for components that use several strings. */
export function translator(locale) {
  return (key, vars) => translate(locale, key, vars);
}

export const UI_STRING_KEYS = Object.keys(STRINGS.en);
export default STRINGS;
