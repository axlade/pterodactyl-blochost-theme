import React, { forwardRef } from 'react';
import { Form } from 'formik';
import FlashMessageRender from '@/components/FlashMessageRender';
import { useStoreState } from 'easy-peasy';
import { ApplicationStore } from '@/state';

import BeforeContent from '@blueprint/components/Authentication/Container/BeforeContent';
import AfterContent from '@blueprint/components/Authentication/Container/AfterContent';

const F = "'Sora', sans-serif";

type Props = React.DetailedHTMLProps<React.FormHTMLAttributes<HTMLFormElement>, HTMLFormElement> & {
    title?: string;
};

export default forwardRef<HTMLFormElement, Props>(({ title, ...props }, ref) => {
    const panelName = useStoreState((s: ApplicationStore) => s.settings.data?.name || 'Panel');

    return (
        <div style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: '#111111',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            fontFamily: F, overflow: 'hidden',
        }}>
            {/* Cercles décoratifs */}
            <div style={{
                position: 'absolute', top: '-200px', right: '-200px',
                width: '500px', height: '500px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,125,32,0.07) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />
            <div style={{
                position: 'absolute', bottom: '-200px', left: '-200px',
                width: '600px', height: '600px', borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(255,125,32,0.04) 0%, transparent 70%)',
                pointerEvents: 'none',
            }} />

            <div style={{ width: '100%', maxWidth: '380px', padding: '0 1rem', position: 'relative' }}>

                {/* Branding */}
                <div style={{ marginBottom: '1.5rem' }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#FF7D20', letterSpacing: '-0.04em', fontFamily: F }}>
                        {panelName}
                    </div>
                    <div style={{ fontSize: '0.65rem', color: '#3a3a3a', marginTop: '0.15rem', fontWeight: 600, letterSpacing: '0.1em', fontFamily: F, textTransform: 'uppercase' }}>
                        Panel de gestion
                    </div>
                </div>

                {/* Séparateur */}
                <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.05)', marginBottom: '1.5rem' }} />

                {/* Titre */}
                {title && (
                    <div style={{ marginBottom: '1.25rem' }}>
                        <h1 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#e0e0e0', margin: 0, fontFamily: F }}>
                            {title === 'Login to Continue' ? 'Connexion'
                             : title === 'Request Password Reset' ? 'Réinitialisation'
                             : title}
                        </h1>
                        <p style={{ fontSize: '0.73rem', color: '#3a3a3a', marginTop: '0.2rem', fontFamily: F }}>
                            {title === 'Login to Continue'
                                ? 'Accédez à votre espace de gestion'
                                : 'Entrez votre email pour recevoir un lien'}
                        </p>
                    </div>
                )}

                <FlashMessageRender css={{ marginBottom: '1rem' }} />
                <BeforeContent />
                <Form {...props} ref={ref} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {props.children}
                </Form>
                <AfterContent />

                {/* Footer */}
                <p style={{ color: '#222', fontSize: '0.65rem', marginTop: '1.75rem', fontFamily: F }}>
                    Pterodactyl&reg; © 2015 - {new Date().getFullYear()}
                </p>
            </div>
        </div>
    );
});
