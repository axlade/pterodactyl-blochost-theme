import React, { useState } from 'react';
import { NavLink, Link, useLocation, matchPath } from 'react-router-dom';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faLayerGroup, faUser, faKey, faFingerprint, faShieldAlt, faSignOutAlt,
    faTerminal, faFolder, faDatabase, faClock, faUsers, faDownload,
    faNetworkWired, faRocket, faCogs, faList, faChevronLeft,
    faChevronDown, faChevronRight,
} from '@fortawesome/free-solid-svg-icons';
import http from '@/api/http';

const F = "'Sora', sans-serif";

const base: React.CSSProperties = {
    display: 'flex', alignItems: 'center', gap: '0.6rem',
    padding: '0.45rem 0.65rem', borderRadius: '10px',
    fontSize: '0.81rem', fontWeight: 500,
    textDecoration: 'none',
    background: 'transparent', cursor: 'pointer',
    border: 'none', width: '100%', textAlign: 'left',
    boxSizing: 'border-box', fontFamily: F,
    position: 'relative', zIndex: 1,
    transition: 'color 0.18s',
};

/* ── Wrapper avec animation orange clip-path ─────────────────── */
const OrangeWrap = ({ children, extraStyle }: {
    children: (hov: boolean) => React.ReactNode;
    extraStyle?: React.CSSProperties;
}) => {
    const [hov, setHov] = useState(false);
    return (
        <div
            style={{ position: 'relative', overflow: 'hidden', borderRadius: '10px', ...extraStyle }}
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
        >
            {/* Couche orange — cercle qui s'étend */}
            <div style={{
                position: 'absolute', inset: 0, pointerEvents: 'none',
                background: '#FF7D20',
                clipPath: hov ? 'circle(150% at 8% 50%)' : 'circle(0% at 8% 50%)',
                transition: 'clip-path 0.55s cubic-bezier(0.4, 0, 0.2, 1)',
            }} />
            {children(hov)}
        </div>
    );
};

/* ── Composant section déroulante ───────────────────────────── */
interface SectionProps { title: string; defaultOpen?: boolean; children: React.ReactNode }
const Section = ({ title, defaultOpen = true, children }: SectionProps) => {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div style={{ marginTop: '0.1rem' }}>
            <button onClick={() => setOpen(o => !o)} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                width: '100%', background: 'none', border: 'none', cursor: 'pointer',
                padding: '0.4rem 0.5rem', borderRadius: '8px', fontFamily: F,
            }}>
                <span style={{ fontSize: '0.58rem', fontWeight: 700, color: '#282828', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                    {title}
                </span>
                <FontAwesomeIcon icon={open ? faChevronDown : faChevronRight} style={{ fontSize: '0.55rem', color: '#2a2a2a' }} />
            </button>
            {open && <div style={{ paddingLeft: '0.15rem' }}>{children}</div>}
        </div>
    );
};

/* ── Groupes de navigation serveur ─────────────────────────── */
const serverGroups = [
    {
        label: 'Accès',
        items: [
            { sub: '',       label: 'Console',  icon: faTerminal, exact: true  },
            { sub: '/files', label: 'Fichiers', icon: faFolder,   exact: false },
        ],
    },
    {
        label: 'Données',
        items: [
            { sub: '/databases', label: 'Bases de données', icon: faDatabase, exact: false },
            { sub: '/schedules', label: 'Planificateur',    icon: faClock,    exact: false },
            { sub: '/backups',   label: 'Sauvegardes',      icon: faDownload, exact: false },
        ],
    },
    {
        label: 'Serveur',
        items: [
            { sub: '/users',    label: 'Utilisateurs', icon: faUsers,        exact: false },
            { sub: '/network',  label: 'Réseau',        icon: faNetworkWired, exact: false },
            { sub: '/startup',  label: 'Démarrage',     icon: faRocket,       exact: false },
            { sub: '/settings', label: 'Paramètres',    icon: faCogs,         exact: false },
            { sub: '/activity', label: 'Activité',      icon: faList,         exact: false },
        ],
    },
];

export default () => {
    const panelName = useStoreState((s: ApplicationStore) => s.settings.data!.name);
    const username  = useStoreState((s: ApplicationStore) => s.user.data!.username);
    const email     = useStoreState((s: ApplicationStore) => s.user.data!.email);
    const isAdmin   = useStoreState((s: ApplicationStore) => s.user.data!.rootAdmin);
    const [loggingOut, setLoggingOut] = useState(false);

    const { pathname } = useLocation();
    const serverMatch = matchPath<{ id: string }>(pathname, { path: '/server/:id', exact: false });
    const serverId = serverMatch?.params.id;

    const logout = () => {
        setLoggingOut(true);
        http.post('/auth/logout').finally(() => { (window as any).location = '/'; });
    };

    return (
        <div id='bh-sidebar' style={{
            position: 'fixed', left: 0, top: 0,
            width: '220px', height: '100vh',
            background: '#0f0f0f',
            borderRight: '1px solid rgba(255,125,32,0.08)',
            display: 'flex', flexDirection: 'column', zIndex: 1000,
            fontFamily: F,
        }}>
            {/* ── Brand ── */}
            <div style={{ padding: '1.25rem 1rem 1rem', borderBottom: '1px solid rgba(255,255,255,0.04)', flexShrink: 0 }}>
                <Link to='/' style={{ textDecoration: 'none' }}>
                    <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#FF7D20', letterSpacing: '-0.04em', fontFamily: F }}>
                        {panelName}
                    </div>
                </Link>
                <div style={{ fontSize: '0.62rem', color: '#222', marginTop: '0.18rem', fontWeight: 500, fontFamily: F }}>
                    Panel de gestion
                </div>
            </div>

            {/* ── Navigation ── */}
            <nav style={{ flex: 1, padding: '0.3rem 0.5rem', overflowY: 'auto', overflowX: 'hidden' }}>

                {serverId ? (
                    <>
                        {/* Bouton retour */}
                        <OrangeWrap extraStyle={{ marginTop: '0.3rem', marginBottom: '0.2rem' }}>
                            {(hov) => (
                                <Link to='/' className='bh-nav-item' style={{ ...base, color: hov ? '#fff' : '#333', fontSize: '0.75rem' }}>
                                    <FontAwesomeIcon icon={faChevronLeft} style={{ fontSize: '0.68rem' }} />
                                    Tableau de bord
                                </Link>
                            )}
                        </OrangeWrap>

                        {serverGroups.map(group => (
                            <Section key={group.label} title={group.label}>
                                {group.items.map(item => (
                                    <OrangeWrap key={item.sub}>
                                        {(hov) => (
                                            <NavLink
                                                exact={item.exact}
                                                to={`/server/${serverId}${item.sub}`}
                                                className='bh-nav-item'
                                                style={{ ...base, color: hov ? '#fff' : '#484848' }}
                                                activeStyle={{ color: hov ? '#fff' : '#FF7D20', fontWeight: 600, background: 'transparent' }}
                                            >
                                                <FontAwesomeIcon icon={item.icon} fixedWidth style={{ fontSize: '0.79rem' }} />
                                                {item.label}
                                            </NavLink>
                                        )}
                                    </OrangeWrap>
                                ))}
                            </Section>
                        ))}
                    </>
                ) : (
                    <Section title='Menu'>
                        <OrangeWrap>
                            {(hov) => (
                                <NavLink exact to='/' className='bh-nav-item'
                                    style={{ ...base, color: hov ? '#fff' : '#484848' }}
                                    activeStyle={{ color: hov ? '#fff' : '#FF7D20', fontWeight: 600, background: 'transparent' }}
                                >
                                    <FontAwesomeIcon icon={faLayerGroup} fixedWidth style={{ fontSize: '0.79rem' }} />
                                    Tableau de bord
                                </NavLink>
                            )}
                        </OrangeWrap>
                    </Section>
                )}

                {/* ═══ COMPTE ═══ */}
                <Section title='Compte' defaultOpen={!serverId}>
                    {[
                        { to: '/account',     exact: true,  icon: faUser,        label: 'Mon profil' },
                        { to: '/account/api', exact: false, icon: faKey,         label: 'Clés API'   },
                        { to: '/account/ssh', exact: false, icon: faFingerprint, label: 'Clés SSH'   },
                    ].map(({ to, exact, icon, label }) => (
                        <OrangeWrap key={to}>
                            {(hov) => (
                                <NavLink exact={exact} to={to} className='bh-nav-item'
                                    style={{ ...base, color: hov ? '#fff' : '#484848' }}
                                    activeStyle={{ color: hov ? '#fff' : '#FF7D20', fontWeight: 600, background: 'transparent' }}
                                >
                                    <FontAwesomeIcon icon={icon} fixedWidth style={{ fontSize: '0.79rem' }} />
                                    {label}
                                </NavLink>
                            )}
                        </OrangeWrap>
                    ))}
                </Section>

                {isAdmin && (
                    <Section title='Administration' defaultOpen={false}>
                        <OrangeWrap>
                            {(hov) => (
                                <a href='/admin' className='bh-nav-item' style={{ ...base, color: hov ? '#fff' : '#484848' }}>
                                    <FontAwesomeIcon icon={faShieldAlt} fixedWidth style={{ fontSize: '0.79rem' }} />
                                    Admin panel
                                </a>
                            )}
                        </OrangeWrap>
                    </Section>
                )}
            </nav>

            {/* ── User footer ── */}
            <div style={{ padding: '0.55rem', borderTop: '1px solid rgba(255,255,255,0.04)', flexShrink: 0 }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                    padding: '0.5rem 0.55rem', borderRadius: '11px',
                    background: 'rgba(255,255,255,0.025)',
                }}>
                    <div style={{
                        width: '30px', height: '30px', flexShrink: 0, borderRadius: '8px',
                        background: '#FF7D20',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.78rem', fontWeight: 700, color: '#fff', fontFamily: F,
                    }}>
                        {username.charAt(0).toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: '0.76rem', fontWeight: 600, color: '#b8b8b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: F }}>
                            {username}
                        </div>
                        <div style={{ fontSize: '0.61rem', color: '#2c2c2c', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: F }}>
                            {isAdmin ? 'Administrateur' : email}
                        </div>
                    </div>
                    <button onClick={logout} disabled={loggingOut} className='bh-logout-btn'
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#2a2a2a', padding: '4px 5px', borderRadius: '6px', flexShrink: 0, transition: 'color 0.15s' }}
                        title='Déconnexion'>
                        <FontAwesomeIcon icon={faSignOutAlt} />
                    </button>
                </div>
            </div>
        </div>
    );
};
