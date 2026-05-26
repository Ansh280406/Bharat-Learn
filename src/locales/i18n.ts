import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

// You can extract these into separate JSON files in the future.
const resources = {
  en: {
    translation: {
      "scanner": "AI Scanner",
      "index": "Textbook Lessons",
      "voice_on": "Voice: On",
      "voice_off": "Voice: Off",
    }
  },
  hi: {
    translation: {
      "scanner": "एआई स्कैनर",
      "index": "पाठ्यपुस्तक पाठ",
      "voice_on": "आवाज़: चालू",
      "voice_off": "आवाज़: बंद",
    }
  },
  gu: {
    translation: {
      "scanner": "એઆઈ સ્કેનર",
      "index": "પાઠ્યપુસ્તક પાઠ",
      "voice_on": "અવાજ: ચાલુ",
      "voice_off": "અવાજ: બંધ",
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "en", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false 
    }
  });

export default i18n;
