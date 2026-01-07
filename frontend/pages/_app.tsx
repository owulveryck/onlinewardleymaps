import CssBaseline from '@mui/material/CssBaseline';
import {StyledEngineProvider, ThemeProvider as MaterialUIThemeProvider} from '@mui/material/styles';
import i18n from 'i18next';
import {AppProps} from 'next/app';
import Head from 'next/head';
import React, {useEffect, useState} from 'react';
import {I18nextProvider, initReactI18next} from 'react-i18next';
import {ThemeProvider as StyledComponentsThemeProvider} from 'styled-components';
import {FeatureSwitchesProvider} from '../src/components/FeatureSwitchesContext';
import {ModKeyPressedProvider} from '../src/components/KeyPressContext';
import Footer from '../src/components/page/Footer';
import {featureSwitches} from '../src/constants/featureswitches';
import {lightTheme, theme} from '../src/theme';

// Initialize i18n for both SSR and client
const basePath = '/onlinewardleymaps';

// Always initialize i18n (needed for both SSR and client)
if (!i18n.isInitialized) {
    const savedLocale = typeof window !== 'undefined' ? localStorage.getItem('locale') || 'en' : 'en';

    i18n.use(initReactI18next).init({
        lng: savedLocale,
        fallbackLng: 'en',
        ns: ['common'],
        defaultNS: 'common',
        interpolation: {escapeValue: false},
        resources: {},
        react: {
            useSuspense: false, // Disable suspense for SSR compatibility
        },
    });
}

// Load translations dynamically on client only
if (typeof window !== 'undefined') {
    const savedLocale = localStorage.getItem('locale') || 'en';
    fetch(`${basePath}/locales/${savedLocale}/common.json`)
        .then(res => res.json())
        .then(translations => {
            i18n.addResourceBundle(savedLocale, 'common', translations, true, true);
        })
        .catch(err => {
            console.warn('Failed to load translations:', err);
        });
}

const MyApp: React.FC<AppProps> = ({Component, pageProps}) => {
    const [currentTheme, setCurrentTheme] = useState(theme);
    const [isLightTheme, setIsLightTheme] = useState<boolean>(false);
    const [menuVisible, setMenuVisible] = useState<boolean>(false);

    const toggleMenu = () => {
        setMenuVisible(!menuVisible);
    };

    const toggleTheme = () => {
        setIsLightTheme(!isLightTheme);
    };

    useEffect(() => {
        setCurrentTheme(isLightTheme ? lightTheme : theme);
    }, [isLightTheme]);

    return (
        <>
            <Head>
                <title>OnlineWardleyMaps.com</title>
                <meta name="viewport" content="minimum-scale=1, initial-scale=1, width=device-width" />
            </Head>
            <I18nextProvider i18n={i18n}>
                <FeatureSwitchesProvider value={featureSwitches}>
                    <ModKeyPressedProvider>
                        <StyledEngineProvider injectFirst>
                            <MaterialUIThemeProvider theme={currentTheme}>
                                <StyledComponentsThemeProvider theme={currentTheme}>
                                    <CssBaseline />

                                    <Component
                                        {...pageProps}
                                        toggleTheme={toggleTheme}
                                        toggleMenu={toggleMenu}
                                        menuVisible={menuVisible}
                                        isLightTheme={isLightTheme}
                                    />
                                    <Footer />
                                </StyledComponentsThemeProvider>
                            </MaterialUIThemeProvider>
                        </StyledEngineProvider>
                    </ModKeyPressedProvider>
                </FeatureSwitchesProvider>
            </I18nextProvider>
        </>
    );
};

export default MyApp;
