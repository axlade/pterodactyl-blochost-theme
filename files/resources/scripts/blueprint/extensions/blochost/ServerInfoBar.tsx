import React, { useEffect, useState } from 'react';
import { ServerContext } from '@/state/server';
import { SocketEvent, SocketRequest } from '@/components/server/events';
import useWebsocketEvent from '@/plugins/useWebsocketEvent';
import { bytesToString, ip, mbToBytes } from '@/lib/formatters';
import { capitalize } from '@/lib/strings';
import UptimeDuration from '@/components/server/UptimeDuration';
import CopyOnClick from '@/components/elements/CopyOnClick';
import { usePermissions } from '@/plugins/usePermissions';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faMicrochip, faMemory, faHdd, faArrowDown, faArrowUp,
    faPlay, faRedo, faStop,
} from '@fortawesome/free-solid-svg-icons';

/* ── Couleur déterministe basée sur le nom ───────────────────── */
const nameToColor = (name: string): string => {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    const palette = ['#FF7D20', '#22c55e', '#a78bfa', '#22d3ee', '#f472b6', '#fb923c', '#34d399', '#60a5fa'];
    return palette[Math.abs(hash) % palette.length];
};

type Stats = { memory: number; cpu: number; disk: number; uptime: number; rx: number; tx: number };
const F = "'Sora', sans-serif";

/* ── Icon stat chip ──────────────────────────────────────────── */
const StatChip = ({
    label, value, maxValue, color, iconBg, icon, progress,
}: {
    label: string;
    value: React.ReactNode;
    maxValue?: React.ReactNode;
    color: string;
    iconBg: string;
    icon: any;
    progress?: number;
}) => (
    <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '10px', padding: '0.45rem 0.7rem',
        flexShrink: 0, fontFamily: F, minWidth: '90px',
    }}>
        <div style={{
            width: '30px', height: '30px', borderRadius: '8px',
            background: iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
        }}>
            <FontAwesomeIcon icon={icon} style={{ fontSize: '0.72rem', color }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
                fontSize: '0.58rem', fontWeight: 700, color: 'rgba(255,255,255,0.28)',
                textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap',
            }}>{label}</div>
            <div style={{
                fontSize: '0.82rem', fontWeight: 600, color, lineHeight: 1.2,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
                {value}
                {maxValue !== undefined && (
                    <span style={{ fontSize: '0.63rem', color: 'rgba(255,255,255,0.25)', fontWeight: 400 }}>
                        {' /'}{maxValue}
                    </span>
                )}
            </div>
            {progress !== undefined && (
                <div style={{
                    marginTop: '3px', height: '2px',
                    background: 'rgba(255,255,255,0.08)', borderRadius: '2px', overflow: 'hidden',
                }}>
                    <div style={{
                        height: '100%', width: `${Math.min(100, Math.max(0, progress))}%`,
                        background: color, borderRadius: '2px', transition: 'width .6s ease',
                    }} />
                </div>
            )}
        </div>
    </div>
);

/* ── Status + Uptime chip ────────────────────────────────────── */
const StatusChip = ({ status, uptime }: { status: string | null; uptime: number }) => {
    const color = status === 'running' ? '#22c55e' : status === 'offline' ? '#ef4444' : '#eab308';
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
            borderRadius: '10px', padding: '0.45rem 0.7rem',
            flexShrink: 0, fontFamily: F,
        }}>
            <span style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: color, boxShadow: `0 0 6px ${color}`,
                display: 'inline-block', flexShrink: 0,
            }} />
            <div>
                <div style={{
                    fontSize: '0.58rem', fontWeight: 700, color: 'rgba(255,255,255,0.28)',
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                }}>Statut</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e0e0e0', lineHeight: 1.2 }}>
                    {capitalize(status || 'offline')}
                </div>
            </div>
            {uptime > 0 && (
                <>
                    <div style={{ width: '1px', alignSelf: 'stretch', background: 'rgba(255,255,255,0.07)' }} />
                    <div>
                        <div style={{
                            fontSize: '0.58rem', fontWeight: 700, color: 'rgba(255,255,255,0.28)',
                            textTransform: 'uppercase', letterSpacing: '0.08em',
                        }}>Uptime</div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#e0e0e0', lineHeight: 1.2 }}>
                            <UptimeDuration uptime={uptime / 1000} />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

/* ── Network chip ────────────────────────────────────────────── */
const NetworkChip = ({ rx, tx, offline }: { rx: number; tx: number; offline: boolean }) => (
    <div style={{
        display: 'flex', alignItems: 'center', gap: '0.55rem',
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '10px', padding: '0.45rem 0.7rem',
        flexShrink: 0, fontFamily: F,
    }}>
        <div style={{
            width: '30px', height: '30px', borderRadius: '8px',
            background: 'rgba(34,211,238,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
        }}>
            <FontAwesomeIcon icon={faArrowDown} style={{ fontSize: '0.72rem', color: '#22d3ee' }} />
        </div>
        <div>
            <div style={{
                fontSize: '0.58rem', fontWeight: 700, color: 'rgba(255,255,255,0.28)',
                textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>Entrant</div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#22d3ee', lineHeight: 1.2 }}>
                {offline ? '—' : bytesToString(rx)}
            </div>
        </div>
        <div style={{ width: '1px', alignSelf: 'stretch', background: 'rgba(255,255,255,0.07)' }} />
        <div style={{
            width: '30px', height: '30px', borderRadius: '8px',
            background: 'rgba(250,204,21,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
        }}>
            <FontAwesomeIcon icon={faArrowUp} style={{ fontSize: '0.72rem', color: '#facc15' }} />
        </div>
        <div>
            <div style={{
                fontSize: '0.58rem', fontWeight: 700, color: 'rgba(255,255,255,0.28)',
                textTransform: 'uppercase', letterSpacing: '0.08em',
            }}>Sortant</div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#facc15', lineHeight: 1.2 }}>
                {offline ? '—' : bytesToString(tx)}
            </div>
        </div>
    </div>
);

/* ── Power button ────────────────────────────────────────────── */
const PowerBtn = ({
    label, color, disabled, onClick, icon,
}: {
    label: string; color: string; disabled?: boolean; onClick(): void; icon: any;
}) => (
    <button disabled={disabled} onClick={onClick} style={{
        display: 'flex', alignItems: 'center', gap: '0.4rem',
        background: disabled ? 'rgba(255,255,255,0.04)' : color,
        border: `1px solid ${disabled ? 'rgba(255,255,255,0.06)' : color}`,
        borderRadius: '9px',
        color: disabled ? 'rgba(255,255,255,0.22)' : '#fff',
        fontWeight: 600, fontSize: '0.78rem', padding: '0.38rem 0.9rem',
        cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: F,
        transition: 'opacity .15s', flexShrink: 0,
    }}>
        <FontAwesomeIcon icon={icon} style={{ fontSize: '0.7rem' }} />
        {label}
    </button>
);

/* ── Icône serveur (image custom ou avatar lettre) ───────────── */
const ServerIcon = ({ name, iconUrl }: { name: string; iconUrl?: string }) => {
    const [imgError, setImgError] = useState(false);
    const letter = name.charAt(0).toUpperCase();
    const color  = nameToColor(name);

    const containerStyle: React.CSSProperties = {
        width: '50px', height: '50px', borderRadius: '10px',
        overflow: 'hidden', flexShrink: 0,
        border: '1px solid rgba(255,255,255,0.08)',
    };

    if (iconUrl && !imgError) {
        return (
            <div style={containerStyle}>
                <img
                    src={iconUrl}
                    alt={name}
                    onError={() => setImgError(true)}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                />
            </div>
        );
    }

    return (
        <div style={{
            ...containerStyle,
            background: color,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.3rem', fontWeight: 800, color: '#fff',
            fontFamily: F, userSelect: 'none',
        }}>
            {letter}
        </div>
    );
};

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════ */
export default () => {
    const [stats, setStats] = useState<Stats>({ memory: 0, cpu: 0, disk: 0, uptime: 0, rx: 0, tx: 0 });

    const name      = ServerContext.useStoreState((s) => s.server.data!.name);
    const status    = ServerContext.useStoreState((s) => s.status.value);
    const limits    = ServerContext.useStoreState((s) => s.server.data!.limits);
    const connected = ServerContext.useStoreState((s) => s.socket.connected);
    const instance  = ServerContext.useStoreState((s) => s.socket.instance);

    /* Icône personnalisée : variable d'egg SERVER_ICON (URL image) */
    const iconUrl = ServerContext.useStoreState((s) => {
        const v = s.server.data!.variables.find((x) => x.envVariable === 'SERVER_ICON');
        return v?.serverValue || undefined;
    });

    const allocation = ServerContext.useStoreState((s) => {
        const a = s.server.data!.allocations.find((x) => x.isDefault);
        return !a ? 'n/a' : `${a.alias || ip(a.ip)}:${a.port}`;
    });

    const [canStart, canRestart, canStop] = usePermissions(['control.start', 'control.restart', 'control.stop']);

    useEffect(() => {
        if (connected && instance) instance.send(SocketRequest.SEND_STATS);
    }, [connected, instance]);

    useWebsocketEvent(SocketEvent.STATS, (data) => {
        try {
            const s = JSON.parse(data);
            setStats({
                memory: s.memory_bytes, cpu: s.cpu_absolute, disk: s.disk_bytes,
                tx: s.network.tx_bytes, rx: s.network.rx_bytes, uptime: s.uptime || 0,
            });
        } catch { /* ignore */ }
    });

    const send = (action: string) => instance?.send('set state', action);

    const isOffline  = status === 'offline';
    const isStopping = status === 'stopping';

    const cpuPct  = limits.cpu    > 0 ? (stats.cpu    / limits.cpu) * 100 : 0;
    const memPct  = limits.memory > 0 ? (stats.memory / mbToBytes(limits.memory)) * 100 : 0;
    const diskPct = limits.disk   > 0 ? (stats.disk   / mbToBytes(limits.disk))   * 100 : 0;

    const statusColor = status === 'running' ? '#22c55e' : status === 'offline' ? '#ef4444' : '#eab308';

    return (
        <div style={{ marginBottom: '1rem', fontFamily: F }}>

            {/* ── Row 1: server name + IP + power buttons ── */}
            <div style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                marginBottom: '0.7rem', flexWrap: 'wrap',
            }}>

                <ServerIcon name={name} iconUrl={iconUrl} />

                {/* Name + status badge + IP */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <h1 style={{
                            margin: 0, fontSize: '1.25rem', fontWeight: 800, color: '#e8e8e8',
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: F,
                        }}>
                            {name}
                        </h1>
                        <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                            fontSize: '0.72rem', fontWeight: 600, color: statusColor,
                            background: `${statusColor}18`, border: `1px solid ${statusColor}38`,
                            borderRadius: '999px', padding: '2px 9px', flexShrink: 0,
                        }}>
                            <span style={{
                                width: '6px', height: '6px', borderRadius: '50%',
                                background: statusColor, display: 'inline-block',
                            }} />
                            {capitalize(status || 'Hors ligne')}
                        </span>
                    </div>
                    <CopyOnClick text={allocation}>
                        <div style={{
                            display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                            marginTop: '3px', cursor: 'pointer',
                        }}>
                            <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.28)', fontFamily: F }}>
                                {allocation}
                            </span>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                                stroke="rgba(255,255,255,0.22)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2"/>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                            </svg>
                        </div>
                    </CopyOnClick>
                </div>

                {/* Power buttons */}
                <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0, alignItems: 'center' }}>
                    {canStart   && <PowerBtn label='Démarrer'  color='#16a34a' disabled={!isOffline}  onClick={() => send('start')}   icon={faPlay} />}
                    {canRestart && <PowerBtn label='Relancer'  color='#374151' disabled={!status}      onClick={() => send('restart')} icon={faRedo} />}
                    {canStop    && <PowerBtn label={isStopping ? 'Forcer' : 'Arrêter'} color='#dc2626' disabled={isOffline} onClick={() => send(isStopping ? 'kill' : 'stop')} icon={faStop} />}
                </div>
            </div>

            {/* ── Row 2: stat chips ── */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'stretch' }}>

                <StatusChip status={status} uptime={stats.uptime} />

                <StatChip
                    label="CPU"
                    value={isOffline ? '—' : `${stats.cpu.toFixed(1)}%`}
                    maxValue={limits.cpu > 0 ? `${limits.cpu}%` : undefined}
                    color="#FF7D20"
                    iconBg="rgba(255,125,32,0.18)"
                    icon={faMicrochip}
                    progress={!isOffline && limits.cpu > 0 ? cpuPct : undefined}
                />

                <StatChip
                    label="Mémoire"
                    value={isOffline ? '—' : bytesToString(stats.memory)}
                    maxValue={limits.memory > 0 ? bytesToString(mbToBytes(limits.memory)) : undefined}
                    color="#a78bfa"
                    iconBg="rgba(167,139,250,0.18)"
                    icon={faMemory}
                    progress={!isOffline && limits.memory > 0 ? memPct : undefined}
                />

                <StatChip
                    label="Disque"
                    value={bytesToString(stats.disk)}
                    maxValue={limits.disk > 0 ? bytesToString(mbToBytes(limits.disk)) : undefined}
                    color="#d0d0d0"
                    iconBg="rgba(255,255,255,0.08)"
                    icon={faHdd}
                    progress={limits.disk > 0 ? diskPct : undefined}
                />

                <NetworkChip rx={stats.rx} tx={stats.tx} offline={isOffline} />

            </div>
        </div>
    );
};
