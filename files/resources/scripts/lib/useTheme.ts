import { useEffect, useState } from 'react';

export type Theme = 'dark' | 'light';

function applyTheme(t: Theme) {
    document.documentElement.setAttribute('data-theme', t);
    localStorage.setItem('bh-theme', t);
    window.dispatchEvent(new CustomEvent('bh-theme', { detail: t }));
}

export function useTheme(): [Theme, () => void] {
    const [theme, setTheme] = useState<Theme>(() => {
        const stored = (localStorage.getItem('bh-theme') as Theme) || 'dark';
        document.documentElement.setAttribute('data-theme', stored);
        return stored;
    });

    useEffect(() => {
        const handler = (e: Event) => setTheme((e as CustomEvent<Theme>).detail);
        window.addEventListener('bh-theme', handler);
        return () => window.removeEventListener('bh-theme', handler);
    }, []);

    const toggle = () => {
        const next: Theme = theme === 'dark' ? 'light' : 'dark';
        applyTheme(next);
    };

    return [theme, toggle];
}

// Color tokens per theme
export const T = {
    dark: {
        sidebarBg:          '#0f0f0f',
        sidebarBorder:      'rgba(255,125,32,0.08)',
        sidebarTopBorder:   'rgba(255,255,255,0.04)',
        navColor:           '#555555',
        navBtnColor:        '#555555',
        sectionLabel:       '#2e2e2e',
        sectionChevron:     '#333333',
        subtitleColor:      '#1e1e1e',
        userFooterBg:       'rgba(255,255,255,0.025)',
        usernameColor:      '#b8b8b8',
        roleColor:          '#2c2c2c',
        logoutColor:        '#2a2a2a',
        chipBg:             'rgba(255,255,255,0.04)',
        chipBorder:         'rgba(255,255,255,0.07)',
        chipLabel:          'rgba(255,255,255,0.28)',
        chipDivider:        'rgba(255,255,255,0.07)',
        chipValue:          '#e0e0e0',
        progressTrack:      'rgba(255,255,255,0.08)',
        maxValueColor:      'rgba(255,255,255,0.25)',
        ipColor:            'rgba(255,255,255,0.28)',
        ipIconStroke:       'rgba(255,255,255,0.22)',
        serverNameColor:    '#e8e8e8',
        cardBg:             'linear-gradient(180deg, #1c1c1c 0%, #141414 100%)',
        cardBorder:         'rgba(255,255,255,0.07)',
        cardShadow:         '0 0 0 1px rgba(255,255,255,0.04), 0 8px 32px rgba(0,0,0,0.45)',
        cardHeaderBg:       'rgba(255,255,255,0.012)',
        cardHeaderBorder:   'rgba(255,255,255,0.045)',
        cardTitleColor:     'rgba(255,255,255,0.38)',
        cardMaxLabelColor:  'rgba(255,255,255,0.2)',
        cardMaxLabelBg:     'rgba(255,255,255,0.04)',
        cardMaxLabelBorder: 'rgba(255,255,255,0.06)',
        chartAreaBg:        'rgba(0,0,0,0.15)',
        diskColor:          '#d0d0d0',
        diskIconBg:         'rgba(255,255,255,0.08)',
        powerDisabledBg:    'rgba(255,255,255,0.04)',
        powerDisabledBorder:'rgba(255,255,255,0.07)',
        powerDisabledColor: 'rgba(255,255,255,0.2)',
        rowBg:              '#191919',
        rowBorder:          'rgba(255,255,255,0.07)',
        rowNameColor:       '#f0f0f0',
        rowIpColor:         'rgba(255,255,255,0.22)',
        rowDescColor:       'rgba(255,255,255,0.16)',
        rowGaugeLabel:      'rgba(255,255,255,0.2)',
        rowGaugeValue:      '#cccccc',
        rowGaugeTrack:      'rgba(255,255,255,0.07)',
        rowSkelBg:          'rgba(255,255,255,0.04)',
        rowSkelBorder:      'rgba(255,255,255,0.06)',
        rowSkelBarBg:       'rgba(255,255,255,0.05)',
        rowManageBorder:    'rgba(255,255,255,0.08)',
        rowManageColor:     'rgba(255,255,255,0.28)',
        rowSeparator:       'rgba(255,255,255,0.07)',
        rowSuspBg:          'rgba(255,255,255,0.04)',
        rowSuspBorder:      'rgba(255,255,255,0.08)',
    },
    light: {
        sidebarBg:          '#ffffff',
        sidebarBorder:      'rgba(0,0,0,0.08)',
        sidebarTopBorder:   'rgba(0,0,0,0.06)',
        navColor:           '#444444',
        navBtnColor:        '#555555',
        sectionLabel:       '#bbbbbb',
        sectionChevron:     '#cccccc',
        subtitleColor:      '#cccccc',
        userFooterBg:       'rgba(0,0,0,0.04)',
        usernameColor:      '#222222',
        roleColor:          '#aaaaaa',
        logoutColor:        '#bbbbbb',
        chipBg:             'rgba(0,0,0,0.04)',
        chipBorder:         'rgba(0,0,0,0.08)',
        chipLabel:          'rgba(0,0,0,0.38)',
        chipDivider:        'rgba(0,0,0,0.08)',
        chipValue:          '#111111',
        progressTrack:      'rgba(0,0,0,0.08)',
        maxValueColor:      'rgba(0,0,0,0.3)',
        ipColor:            'rgba(0,0,0,0.35)',
        ipIconStroke:       'rgba(0,0,0,0.25)',
        serverNameColor:    '#111111',
        cardBg:             'linear-gradient(180deg, #ffffff 0%, #f8f8fa 100%)',
        cardBorder:         'rgba(0,0,0,0.08)',
        cardShadow:         '0 2px 16px rgba(0,0,0,0.07)',
        cardHeaderBg:       'rgba(0,0,0,0.015)',
        cardHeaderBorder:   'rgba(0,0,0,0.06)',
        cardTitleColor:     'rgba(0,0,0,0.4)',
        cardMaxLabelColor:  'rgba(0,0,0,0.3)',
        cardMaxLabelBg:     'rgba(0,0,0,0.05)',
        cardMaxLabelBorder: 'rgba(0,0,0,0.08)',
        chartAreaBg:        'rgba(0,0,0,0.025)',
        diskColor:          '#888888',
        diskIconBg:         'rgba(0,0,0,0.06)',
        powerDisabledBg:    'rgba(0,0,0,0.04)',
        powerDisabledBorder:'rgba(0,0,0,0.08)',
        powerDisabledColor: 'rgba(0,0,0,0.2)',
        rowBg:              '#ffffff',
        rowBorder:          'rgba(0,0,0,0.08)',
        rowNameColor:       '#111111',
        rowIpColor:         'rgba(0,0,0,0.4)',
        rowDescColor:       'rgba(0,0,0,0.45)',
        rowGaugeLabel:      'rgba(0,0,0,0.35)',
        rowGaugeValue:      '#333333',
        rowGaugeTrack:      'rgba(0,0,0,0.1)',
        rowSkelBg:          'rgba(0,0,0,0.04)',
        rowSkelBorder:      'rgba(0,0,0,0.07)',
        rowSkelBarBg:       'rgba(0,0,0,0.06)',
        rowManageBorder:    'rgba(0,0,0,0.1)',
        rowManageColor:     'rgba(0,0,0,0.4)',
        rowSeparator:       'rgba(0,0,0,0.08)',
        rowSuspBg:          'rgba(0,0,0,0.04)',
        rowSuspBorder:      'rgba(0,0,0,0.08)',
    },
} as const;
