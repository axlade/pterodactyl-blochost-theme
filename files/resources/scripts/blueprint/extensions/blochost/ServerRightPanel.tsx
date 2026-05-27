import React, { useEffect, useState } from 'react';
import { ServerContext } from '@/state/server';
import { SocketEvent, SocketRequest } from '@/components/server/events';
import useWebsocketEvent from '@/plugins/useWebsocketEvent';
import { bytesToString, ip, mbToBytes } from '@/lib/formatters';
import { capitalize } from '@/lib/strings';
import UptimeDuration from '@/components/server/UptimeDuration';
import { Link } from 'react-router-dom';

const F = "'Sora', sans-serif";
type Stats = { memory: number; cpu: number; disk: number; uptime: number; rx: number; tx: number };

/* ── Info row ────────────────────────────────────────────────── */
const InfoRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
    <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        gap: '0.5rem', padding: '0.35rem 0',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
    }}>
        <span style={{ fontSize: '0.76rem', color: 'rgba(255,255,255,0.35)', fontFamily: F, flexShrink: 0 }}>
            {label}
        </span>
        <span style={{
            fontSize: '0.76rem', color: '#c8c8c8', fontFamily: F,
            fontWeight: 500, textAlign: 'right', wordBreak: 'break-all',
        }}>
            {children}
        </span>
    </div>
);

/* ── Section header ──────────────────────────────────────────── */
const SectionHeader = ({ title, action }: { title: string; action?: React.ReactNode }) => (
    <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        marginBottom: '0.55rem',
    }}>
        <span style={{
            fontSize: '0.65rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)',
            textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: F,
        }}>
            {title}
        </span>
        {action}
    </div>
);

/* ══════════════════════════════════════════════════════════════
   MAIN RIGHT PANEL
   ══════════════════════════════════════════════════════════════ */
export default () => {
    const [stats, setStats] = useState<Stats>({ memory: 0, cpu: 0, disk: 0, uptime: 0, rx: 0, tx: 0 });
    const [startedAt, setStartedAt] = useState<Date | null>(null);

    const status    = ServerContext.useStoreState((s) => s.status.value);
    const node      = ServerContext.useStoreState((s) => s.server.data!.node);
    const limits    = ServerContext.useStoreState((s) => s.server.data!.limits);
    const connected = ServerContext.useStoreState((s) => s.socket.connected);
    const instance  = ServerContext.useStoreState((s) => s.socket.instance);
    const serverId  = ServerContext.useStoreState((s) => s.server.data!.id);

    const defaultPort = ServerContext.useStoreState((s) => {
        const a = s.server.data!.allocations.find((x) => x.isDefault);
        return a ? a.port : null;
    });

    useEffect(() => {
        if (connected && instance) instance.send(SocketRequest.SEND_STATS);
    }, [connected, instance]);

    useWebsocketEvent(SocketEvent.STATS, (data) => {
        try {
            const s = JSON.parse(data);
            const uptime = s.uptime || 0;
            setStats({
                memory: s.memory_bytes, cpu: s.cpu_absolute, disk: s.disk_bytes,
                tx: s.network.tx_bytes, rx: s.network.rx_bytes, uptime,
            });
            if (uptime > 0 && !startedAt) {
                setStartedAt(new Date(Date.now() - uptime));
            }
        } catch { /* ignore */ }
    });

    const isOffline = status === 'offline';
    const statusColor = status === 'running' ? '#22c55e' : status === 'offline' ? '#ef4444' : '#eab308';

    const memLimit = limits.memory > 0
        ? bytesToString(mbToBytes(limits.memory))
        : '∞';

    const formatDate = (d: Date) => {
        const dd = String(d.getDate()).padStart(2, '0');
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const yyyy = d.getFullYear();
        const hh = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        const ss = String(d.getSeconds()).padStart(2, '0');
        return `${dd}/${mm}/${yyyy} ${hh}:${mm}:${ss}`;
    };

    const panelStyle: React.CSSProperties = {
        background: '#191919',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '14px',
        padding: '0.85rem 1rem',
        fontFamily: F,
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', gridColumn: 'span 6' }}>

            {/* ── INFORMATIONS ── */}
            <div style={panelStyle}>
                <SectionHeader title="Informations" />

                <InfoRow label="Statut">
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem', color: statusColor }}>
                        <span style={{
                            width: '6px', height: '6px', borderRadius: '50%',
                            background: statusColor, display: 'inline-block', flexShrink: 0,
                        }} />
                        {capitalize(status || 'Hors ligne')}
                    </span>
                </InfoRow>

                <InfoRow label="Node">{node}</InfoRow>

                <InfoRow label="Démarré le">
                    {startedAt && !isOffline ? formatDate(startedAt) : '—'}
                </InfoRow>

                <InfoRow label="Temps de fonctionnement">
                    {!isOffline && stats.uptime > 0
                        ? <UptimeDuration uptime={stats.uptime / 1000} />
                        : '—'
                    }
                </InfoRow>

                <InfoRow label="Mémoire assignée">{memLimit}</InfoRow>

                <InfoRow label="Port" >
                    {defaultPort !== null ? String(defaultPort) : '—'}
                </InfoRow>
            </div>

            {/* ── JOUEURS ── */}
            <div style={panelStyle}>
                <SectionHeader
                    title="Joueurs"
                    action={
                        <Link
                            to={`/server/${serverId}/users`}
                            style={{
                                fontSize: '0.68rem', fontWeight: 600,
                                color: '#FF7D20', fontFamily: F,
                                border: '1px solid rgba(255,125,32,0.45)',
                                borderRadius: '6px', padding: '2px 8px',
                                textDecoration: 'none',
                                transition: 'background .15s',
                            }}
                        >
                            Voir tous
                        </Link>
                    }
                />

                <div style={{
                    fontSize: '1rem', fontWeight: 700, color: '#e0e0e0',
                    marginBottom: '0.4rem', fontFamily: F,
                }}>
                    — / —
                </div>

                {/* Progress bar */}
                <div style={{
                    height: '4px', background: 'rgba(255,255,255,0.08)',
                    borderRadius: '4px', overflow: 'hidden',
                }}>
                    <div style={{
                        height: '100%', width: '0%',
                        background: '#FF7D20', borderRadius: '4px',
                    }} />
                </div>
            </div>

        </div>
    );
};
