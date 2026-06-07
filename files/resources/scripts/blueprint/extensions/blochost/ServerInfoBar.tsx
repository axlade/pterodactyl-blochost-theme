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
import { useTheme, T } from '@/lib/useTheme';

type Stats = { memory: number; cpu: number; disk: number; uptime: number; rx: number; tx: number };
const F = "'Sora', sans-serif";

/* ── Icon stat chip ──────────────────────────────────────────── */
const StatChip = ({
    label, value, maxValue, color, iconBg, icon, progress, tk,
}: {
    label: string;
    value: React.ReactNode;
    maxValue?: React.ReactNode;
    color: string;
    iconBg: string;
    icon: any;
    progress?: number;
    tk: typeof T['dark'];
}) => (
    <div style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem',
        background: tk.chipBg,
        border: `1px solid ${tk.chipBorder}`,
        borderRadius: '10px', padding: '0.45rem 0.7rem',
        flexShrink: 0, fontFamily: F, minWidth: '90px',
        transition: 'background 0.3s, border-color 0.3s',
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
                fontSize: '0.58rem', fontWeight: 700, color: tk.chipLabel,
                textTransform: 'uppercase', letterSpacing: '0.08em', whiteSpace: 'nowrap',
                transition: 'color 0.3s',
            }}>{label}</div>
            <div style={{
                fontSize: '0.82rem', fontWeight: 600, color, lineHeight: 1.2,
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
            }}>
                {value}
                {maxValue !== undefined && (
                    <span style={{ fontSize: '0.63rem', color: tk.maxValueColor, fontWeight: 400 }}>
                        {' /'}{maxValue}
                    </span>
                )}
            </div>
            {progress !== undefined && (
                <div style={{
                    marginTop: '3px', height: '2px',
                    background: tk.progressTrack, borderRadius: '2px', overflow: 'hidden',
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
const StatusChip = ({ status, uptime, tk }: { status: string | null; uptime: number; tk: typeof T['dark'] }) => {
    const color = status === 'running' ? '#22c55e' : status === 'offline' ? '#ef4444' : '#eab308';
    return (
        <div style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            background: tk.chipBg,
            border: `1px solid ${tk.chipBorder}`,
            borderRadius: '10px', padding: '0.45rem 0.7rem',
            flexShrink: 0, fontFamily: F,
            transition: 'background 0.3s, border-color 0.3s',
        }}>
            <span style={{
                width: '8px', height: '8px', borderRadius: '50%',
                background: color, boxShadow: `0 0 6px ${color}`,
                display: 'inline-block', flexShrink: 0,
            }} />
            <div>
                <div style={{
                    fontSize: '0.58rem', fontWeight: 700, color: tk.chipLabel,
                    textTransform: 'uppercase', letterSpacing: '0.08em', transition: 'color 0.3s',
                }}>Statut</div>
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: tk.chipValue, lineHeight: 1.2, transition: 'color 0.3s' }}>
                    {capitalize(status || 'offline')}
                </div>
            </div>
            {uptime > 0 && (
                <>
                    <div style={{ width: '1px', alignSelf: 'stretch', background: tk.chipDivider }} />
                    <div>
                        <div style={{
                            fontSize: '0.58rem', fontWeight: 700, color: tk.chipLabel,
                            textTransform: 'uppercase', letterSpacing: '0.08em', transition: 'color 0.3s',
                        }}>Uptime</div>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600, color: tk.chipValue, lineHeight: 1.2, transition: 'color 0.3s' }}>
                            <UptimeDuration uptime={uptime / 1000} />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

/* ── Network chip ────────────────────────────────────────────── */
const NetworkChip = ({ rx, tx, offline, tk }: { rx: number; tx: number; offline: boolean; tk: typeof T['dark'] }) => (
    <div style={{
        display: 'flex', alignItems: 'center', gap: '0.55rem',
        background: tk.chipBg,
        border: `1px solid ${tk.chipBorder}`,
        borderRadius: '10px', padding: '0.45rem 0.7rem',
        flexShrink: 0, fontFamily: F,
        transition: 'background 0.3s, border-color 0.3s',
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
                fontSize: '0.58rem', fontWeight: 700, color: tk.chipLabel,
                textTransform: 'uppercase', letterSpacing: '0.08em', transition: 'color 0.3s',
            }}>Entrant</div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#22d3ee', lineHeight: 1.2 }}>
                {offline ? '—' : bytesToString(rx)}
            </div>
        </div>
        <div style={{ width: '1px', alignSelf: 'stretch', background: tk.chipDivider }} />
        <div style={{
            width: '30px', height: '30px', borderRadius: '8px',
            background: 'rgba(250,204,21,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
        }}>
            <FontAwesomeIcon icon={faArrowUp} style={{ fontSize: '0.72rem', color: '#facc15' }} />
        </div>
        <div>
            <div style={{
                fontSize: '0.58rem', fontWeight: 700, color: tk.chipLabel,
                textTransform: 'uppercase', letterSpacing: '0.08em', transition: 'color 0.3s',
            }}>Sortant</div>
            <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#facc15', lineHeight: 1.2 }}>
                {offline ? '—' : bytesToString(tx)}
            </div>
        </div>
    </div>
);

/* ── Power button ────────────────────────────────────────────── */
const PowerBtn = ({
    label, color, disabled, onClick, icon, tk,
}: {
    label: string; color: string; disabled?: boolean; onClick(): void; icon: any; tk: typeof T['dark'];
}) => (
    <button disabled={disabled} onClick={onClick} style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
        background: disabled ? tk.powerDisabledBg : `${color}20`,
        border: `1px solid ${disabled ? tk.powerDisabledBorder : color + '55'}`,
        borderRadius: '8px',
        color: disabled ? tk.powerDisabledColor : color,
        fontFamily: F, fontWeight: 600, fontSize: '0.75rem',
        padding: '0.3rem 0.7rem',
        cursor: disabled ? 'not-allowed' : 'pointer',
        transition: 'background .15s, border-color .15s, color .15s',
        flexShrink: 0, whiteSpace: 'nowrap',
    }}>
        <FontAwesomeIcon icon={icon} style={{ fontSize: '0.65rem' }} />
        {label}
    </button>
);

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════ */
export default () => {
    const [stats, setStats] = useState<Stats>({ memory: 0, cpu: 0, disk: 0, uptime: 0, rx: 0, tx: 0 });
    const [theme] = useTheme();
    const tk = T[theme];

    const name      = ServerContext.useStoreState((s) => s.server.data!.name);
    const status    = ServerContext.useStoreState((s) => s.status.value);
    const limits    = ServerContext.useStoreState((s) => s.server.data!.limits);
    const connected = ServerContext.useStoreState((s) => s.socket.connected);
    const instance  = ServerContext.useStoreState((s) => s.socket.instance);

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
                {/* Name + status badge + IP */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <h1 style={{
                            margin: 0, fontSize: '1.25rem', fontWeight: 800, color: tk.serverNameColor,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: F,
                            transition: 'color 0.3s',
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
                            <span style={{ fontSize: '0.75rem', color: tk.ipColor, fontFamily: F, transition: 'color 0.3s' }}>
                                {allocation}
                            </span>
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                                stroke={tk.ipIconStroke} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2"/>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                            </svg>
                        </div>
                    </CopyOnClick>
                </div>

                {/* Power buttons */}
                <div style={{ display: 'flex', gap: '0.35rem', flexShrink: 0, alignItems: 'center' }}>
                    {canStart   && <PowerBtn label='Démarrer'  color='#16a34a' disabled={!isOffline}  onClick={() => send('start')}   icon={faPlay}  tk={tk} />}
                    {canRestart && <PowerBtn label='Relancer'  color='#d97706' disabled={!status}      onClick={() => send('restart')} icon={faRedo}  tk={tk} />}
                    {canStop    && <PowerBtn label={isStopping ? 'Forcer' : 'Arrêter'} color='#dc2626' disabled={isOffline} onClick={() => send(isStopping ? 'kill' : 'stop')} icon={faStop} tk={tk} />}
                </div>
            </div>

            {/* ── Row 2: stat chips ── */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', alignItems: 'stretch' }}>

                <StatusChip status={status} uptime={stats.uptime} tk={tk} />

                <StatChip
                    label="CPU"
                    value={isOffline ? '—' : `${stats.cpu.toFixed(1)}%`}
                    maxValue={limits.cpu > 0 ? `${limits.cpu}%` : undefined}
                    color="#FF7D20"
                    iconBg="rgba(255,125,32,0.18)"
                    icon={faMicrochip}
                    progress={!isOffline && limits.cpu > 0 ? cpuPct : undefined}
                    tk={tk}
                />

                <StatChip
                    label="Mémoire"
                    value={isOffline ? '—' : bytesToString(stats.memory)}
                    maxValue={limits.memory > 0 ? bytesToString(mbToBytes(limits.memory)) : undefined}
                    color="#a78bfa"
                    iconBg="rgba(167,139,250,0.18)"
                    icon={faMemory}
                    progress={!isOffline && limits.memory > 0 ? memPct : undefined}
                    tk={tk}
                />

                <StatChip
                    label="Disque"
                    value={bytesToString(stats.disk)}
                    maxValue={limits.disk > 0 ? bytesToString(mbToBytes(limits.disk)) : undefined}
                    color={tk.diskColor}
                    iconBg={tk.diskIconBg}
                    icon={faHdd}
                    progress={limits.disk > 0 ? diskPct : undefined}
                    tk={tk}
                />

                <NetworkChip rx={stats.rx} tx={stats.tx} offline={isOffline} tk={tk} />

            </div>
        </div>
    );
};
