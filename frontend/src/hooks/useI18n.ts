import {useCallback, useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';

// Storage key for language preference
const LANGUAGE_STORAGE_KEY = 'locale';
const BASE_PATH = '/onlinewardleymaps';

/**
 * Custom hook for internationalization (client-side only)
 * Provides translation function and current language state
 */
export const useI18n = () => {
    const {
        t: originalT,
        i18n,
        ready,
    } = useTranslation('common', {
        bindI18n: 'languageChanged loaded',
    });
    const [isHydrated, setIsHydrated] = useState(false);
    const [forceRender, setForceRender] = useState(0);

    /**
     * Get the saved language preference from localStorage
     */
    const getSavedLanguage = useCallback(() => {
        if (typeof window !== 'undefined') {
            const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
            if (saved) {
                const supportedLocales = ['en', 'es', 'fr', 'de', 'it', 'pt', 'ja', 'zh', 'ko', 'ru'];
                if (supportedLocales.includes(saved)) {
                    return saved;
                }
            }
        }
        return 'en';
    }, []);

    // Track hydration state
    useEffect(() => {
        setIsHydrated(true);
    }, []);

    // Set up listener for i18next language changes
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const handleLanguageChanged = () => {
            setForceRender(prev => prev + 1);
        };

        i18n.on('languageChanged', handleLanguageChanged);
        window.addEventListener('languageChanged', handleLanguageChanged);

        return () => {
            i18n.off('languageChanged', handleLanguageChanged);
            window.removeEventListener('languageChanged', handleLanguageChanged);
        };
    }, [i18n]);

    // Translation function with fallback
    const t = useCallback(
        (key: string, fallback?: string) => {
            if (!isHydrated || !ready) {
                return fallback || key;
            }

            const translation = originalT(key);
            return translation === key && fallback ? fallback : translation;
        },
        [isHydrated, ready, originalT, forceRender, i18n.language],
    );

    const changeLanguage = useCallback(
        async (language: string) => {
            try {
                console.log(`Changing language to: ${language}`);

                // Change i18next language
                if (i18n && typeof i18n.changeLanguage === 'function') {
                    // Load translations for the new language if not loaded
                    if (!i18n.hasResourceBundle(language, 'common')) {
                        try {
                            const response = await fetch(`${BASE_PATH}/locales/${language}/common.json`);
                            const translations = await response.json();
                            i18n.addResourceBundle(language, 'common', translations, true, true);
                        } catch (err) {
                            console.warn(`Failed to load translations for ${language}:`, err);
                        }
                    }

                    await i18n.changeLanguage(language);

                    // Persist language preference
                    if (typeof window !== 'undefined') {
                        localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
                    }

                    // Force components to rerender
                    window.dispatchEvent(new CustomEvent('languageChanged', {detail: language}));
                    setForceRender(prev => prev + 1);
                }

                console.log(`Language changed to: ${language}`);
            } catch (error) {
                console.error('Error changing language:', error);
            }
        },
        [i18n],
    );

    const currentLanguage = i18n.language || getSavedLanguage();
    const isRTL = ['ar', 'he', 'fa'].includes(currentLanguage);

    return {
        t,
        originalT,
        changeLanguage,
        currentLanguage,
        isRTL,
        ready: ready && isHydrated,
        isHydrated,
        supportedLanguages: [
            {code: 'en', name: 'English', nativeName: 'English'},
            {code: 'es', name: 'Spanish', nativeName: 'Español'},
            {code: 'fr', name: 'French', nativeName: 'Français'},
            {code: 'de', name: 'German', nativeName: 'Deutsch'},
            {code: 'it', name: 'Italian', nativeName: 'Italiano'},
            {code: 'pt', name: 'Portuguese', nativeName: 'Português'},
            {code: 'ja', name: 'Japanese', nativeName: '日本語'},
            {code: 'zh', name: 'Chinese', nativeName: '中文'},
            {code: 'ko', name: 'Korean', nativeName: '한국어'},
            {code: 'ru', name: 'Russian', nativeName: 'Русский'},
        ],
    };
};
