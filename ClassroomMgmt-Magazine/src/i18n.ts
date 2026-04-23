import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import HttpBackend from "i18next-http-backend"; // Make sure to import this

i18n
    .use(HttpBackend) // Need to use HttpBackend for loading translations
    .use(initReactI18next) // Passes i18n instance to react-i18next
    .init({
        lng: 'he',
        fallbackLng: "en", // Use English if detected language is not available
        debug: true, // Set to false in production
        interpolation: {
            escapeValue: false, // Not needed for React as it escapes by default
        },
        backend: {
            loadPath: `${process.env.PUBLIC_URL || ""}/locales/{{lng}}/{{ns}}.json`,
        },
        react: {
            useSuspense: true, // Wait for namespaces to load before rendering to avoid missingKey / hasLoadedNamespace warnings
        },
    });


document.documentElement.lang = i18n.language;

i18n.on('languageChanged', (lng) => {
    document.documentElement.lang = lng;
});

export default i18n;
