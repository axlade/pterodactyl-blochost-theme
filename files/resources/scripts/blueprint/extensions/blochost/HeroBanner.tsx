import React from 'react';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';

export default () => {
    const panelName = useStoreState((state: ApplicationStore) => state.settings.data!.name);
    const username  = useStoreState((state: ApplicationStore) => state.user.data!.username);
    const isAdmin   = useStoreState((state: ApplicationStore) => state.user.data!.rootAdmin);

    return (
        <div style={{
            background: 'linear-gradient(135deg, #FF7D20 0%, #cc5800 100%)',
            borderRadius: '20px',
            padding: '2.25rem 2rem 2rem',
            marginBottom: '1.75rem',
            position: 'relative',
            overflow: 'hidden',
        }}>
            {/* Cercles décoratifs */}
            <div style={{
                position: 'absolute', top: '-50px', right: '-50px',
                width: '220px', height: '220px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.07)', pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute', bottom: '-70px', right: '80px',
                width: '300px', height: '300px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.04)', pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute', top: '20px', right: '180px',
                width: '80px', height: '80px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)', pointerEvents: 'none',
            }} />

            {/* Contenu */}
            <div style={{ position: 'relative', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.5rem' }}>
                    {isAdmin && (
                        <span style={{
                            background: 'rgba(0,0,0,0.2)',
                            color: '#fff',
                            fontSize: '0.65rem',
                            fontWeight: 700,
                            letterSpacing: '0.08em',
                            padding: '2px 8px',
                            borderRadius: '999px',
                            textTransform: 'uppercase',
                        }}>Admin</span>
                    )}
                </div>
                <h1 style={{
                    color: '#fff',
                    fontSize: '1.7rem',
                    fontWeight: 800,
                    margin: '0 0 0.4rem',
                    letterSpacing: '-0.03em',
                    lineHeight: 1.2,
                }}>
                    Bonjour, {username} 👋
                </h1>
                <p style={{
                    color: 'rgba(255,255,255,0.78)',
                    margin: 0,
                    fontSize: '0.92rem',
                    fontWeight: 400,
                }}>
                    Bienvenue sur <strong style={{ color: '#fff', fontWeight: 700 }}>{panelName}</strong> — gérez vos serveurs ci-dessous.
                </p>

                {/* Séparateur + label */}
                <div style={{
                    marginTop: '1.5rem',
                    paddingTop: '1.25rem',
                    borderTop: '1px solid rgba(255,255,255,0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>
                    </svg>
                    <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.78rem', fontWeight: 500 }}>
                        Mes serveurs
                    </span>
                </div>
            </div>
        </div>
    );
};
