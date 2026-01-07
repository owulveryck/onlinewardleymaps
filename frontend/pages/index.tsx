import dynamic from 'next/dynamic';
import Head from 'next/head';
import {useRouter} from 'next/router';
import React, {useEffect, useState} from 'react';
import {MapPersistenceStrategy} from '../src/constants/defaults';
import {useI18n} from '../src/hooks/useI18n';

// Dynamic import with SSR disabled - MapEnvironment uses window/document APIs
const MapEnvironment = dynamic(() => import('../src/components/MapEnvironment'), {
    ssr: false,
    loading: () => <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh'}}>Loading...</div>,
});

interface MapProps {
    toggleTheme: () => void;
    toggleMenu: () => void;
    menuVisible: boolean;
    isLightTheme: boolean;
}

const Map: React.FC<MapProps> = props => {
    const router = useRouter();
    const {slug} = router.query;
    const {t, currentLanguage} = useI18n();
    const [currentId, setCurrentId] = useState('');
    const [mapPersistenceStrategy, setMapPersistenceStrategy] = useState(MapPersistenceStrategy.Legacy);
    const [shouldLoad, setShouldLoad] = useState(false);

    // Update document language when language changes
    useEffect(() => {
        if (typeof document !== 'undefined') {
            document.documentElement.lang = currentLanguage;
        }
    }, [currentLanguage]);

    useEffect(() => {
        if (slug === undefined) {
            if (typeof window !== 'undefined' && window.location.hash.length > 0) {
                setMapPersistenceStrategy(MapPersistenceStrategy.Legacy);
                let mapId = window.location.hash.replace('#', '');
                if (mapId.includes(':')) {
                    mapId = mapId.split(':')[1];
                }
                setCurrentId(mapId);
                setShouldLoad(true);
            }
            return;
        }
    }, [slug]);

    const pageTitle = `${t('app.title', 'Wardley Maps')} - ${t('app.name', 'Online Wardley Maps')}`;
    const pageDescription = t('app.description', 'Create and share Wardley Maps online');

    return (
        <>
            <Head>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:locale" content={currentLanguage} />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDescription} />
                <link rel="canonical" href={`https://onlinewardleymaps.com${router.asPath}`} />
            </Head>
            <MapEnvironment
                toggleMenu={props.toggleMenu}
                toggleTheme={props.toggleTheme}
                menuVisible={props.menuVisible}
                isLightTheme={props.isLightTheme}
                currentId={currentId}
                setCurrentId={setCurrentId}
                mapPersistenceStrategy={mapPersistenceStrategy}
                setMapPersistenceStrategy={setMapPersistenceStrategy}
                shouldLoad={shouldLoad}
                setShouldLoad={setShouldLoad}
            />
        </>
    );
};

export default Map;
