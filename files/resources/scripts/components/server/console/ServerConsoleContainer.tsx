import React, { memo } from 'react';
import { ServerContext } from '@/state/server';
import Can from '@/components/elements/Can';
import ServerContentBlock from '@/components/elements/ServerContentBlock';
import isEqual from 'react-fast-compare';
import Spinner from '@/components/elements/Spinner';
import Features from '@feature/Features';
import Console from '@/components/server/console/Console';
import StatGraphs from '@/components/server/console/StatGraphs';
import PowerButtons from '@/components/server/console/PowerButtons';
import ServerDetailsBlock from '@/components/server/console/ServerDetailsBlock';
import { Alert } from '@/components/elements/alert';

import BeforeContent from '@blueprint/components/Server/Terminal/BeforeContent';
import AfterContent from '@blueprint/components/Server/Terminal/AfterContent';

export type PowerAction = 'start' | 'stop' | 'restart' | 'kill';

const ServerConsoleContainer = () => {
    const name = ServerContext.useStoreState((state) => state.server.data!.name);
    const description = ServerContext.useStoreState((state) => state.server.data!.description);
    const isInstalling = ServerContext.useStoreState((state) => state.server.isInstalling);
    const isTransferring = ServerContext.useStoreState((state) => state.server.data!.isTransferring);
    const eggFeatures = ServerContext.useStoreState((state) => state.server.data!.eggFeatures, isEqual);
    const isNodeUnderMaintenance = ServerContext.useStoreState((state) => state.server.data!.isNodeUnderMaintenance);

    return (
        <ServerContentBlock title={'Console'}>
            {(isNodeUnderMaintenance || isInstalling || isTransferring) && (
                <Alert type={'warning'} className={'mb-4'}>
                    {isNodeUnderMaintenance
                        ? 'The node of this server is currently under maintenance and all actions are unavailable.'
                        : isInstalling
                        ? 'This server is currently running its installation process and most actions are unavailable.'
                        : 'This server is currently being transferred to another node and all actions are unavailable.'}
                </Alert>
            )}
            <BeforeContent />
            <div className={'grid grid-cols-4 gap-4 mb-4'}>
                <div className={'hidden sm:block sm:col-span-2 lg:col-span-3 pr-4'}>
                    <h1 className={'font-header font-medium text-2xl text-gray-50 leading-relaxed line-clamp-1'}>
                        {name}
                    </h1>
                    <p className={'text-sm line-clamp-2'}>{description}</p>
                </div>
                <div className={'col-span-4 sm:col-span-2 lg:col-span-1 self-end'}>
                    <Can action={['control.start', 'control.stop', 'control.restart']} matchAny>
                        <PowerButtons className={'flex sm:justify-end space-x-2'} />
                    </Can>
                </div>
            </div>
            <div className={'grid grid-cols-4 gap-2 sm:gap-4 mb-4'}>
                <div className={'flex col-span-4 lg:col-span-3'} style={{ flexDirection: 'column' }}>
                    {/* BLOCHOST — Console panel header */}
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '0.55rem 1rem',
                        background: '#191919',
                        borderRadius: '14px 14px 0 0',
                        borderBottom: '1px solid rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.07)',
                        borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
                        flexShrink: 0,
                        fontFamily: "'Sora', sans-serif",
                    }}>
                        <span style={{
                            fontSize: '0.68rem', fontWeight: 700,
                            color: 'rgba(255,255,255,0.35)',
                            letterSpacing: '0.1em', textTransform: 'uppercase',
                        }}>Console</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <button
                                onClick={() => window.dispatchEvent(new Event('bh-clear-console'))}
                                title='Vider la console'
                                style={{
                                    background: 'none', border: 'none',
                                    cursor: 'pointer', color: 'rgba(255,255,255,0.28)',
                                    padding: '4px 5px', borderRadius: '5px',
                                    display: 'flex', alignItems: 'center',
                                    transition: 'color .15s',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.28)')}
                            >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                                </svg>
                            </button>
                            <button
                                onClick={() => window.dispatchEvent(new Event('bh-download-console'))}
                                title='Télécharger les logs'
                                style={{
                                    background: 'none', border: 'none',
                                    cursor: 'pointer', color: 'rgba(255,255,255,0.28)',
                                    padding: '4px 5px', borderRadius: '5px',
                                    display: 'flex', alignItems: 'center',
                                    transition: 'color .15s',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.6)')}
                                onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.28)')}
                            >
                                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
                                </svg>
                            </button>
                            <button
                                onClick={() => window.dispatchEvent(new Event('bh-clear-console'))}
                                style={{
                                    background: 'transparent',
                                    border: '1px solid rgba(255,125,32,0.45)',
                                    cursor: 'pointer', color: '#FF7D20',
                                    padding: '3px 10px', borderRadius: '6px',
                                    fontSize: '0.7rem', fontWeight: 600,
                                    fontFamily: "'Sora', sans-serif",
                                    transition: 'background .15s',
                                }}
                                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255,125,32,0.08)')}
                                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                            >
                                Vider la console
                            </button>
                        </div>
                    </div>
                    <Spinner.Suspense>
                        <Console />
                    </Spinner.Suspense>
                </div>
                <ServerDetailsBlock className={'col-span-4 lg:col-span-1 order-last lg:order-none'} />
            </div>
            <div className={'grid grid-cols-1 md:grid-cols-3 gap-2 sm:gap-4'}>
                <Spinner.Suspense>
                    <StatGraphs />
                </Spinner.Suspense>
            </div>
            <AfterContent />
            <Features enabled={eggFeatures} />
        </ServerContentBlock>
    );
};

export default memo(ServerConsoleContainer, isEqual);
