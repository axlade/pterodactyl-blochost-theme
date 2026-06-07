import React, { memo, useEffect, useRef, useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHdd, faMemory, faMicrochip, faServer } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { Server } from '@/api/server/getServer';
import getServerResourceUsage, { ServerPowerState, ServerStats } from '@/api/server/getServerResourceUsage';
import { bytesToString, ip, mbToBytes } from '@/lib/formatters';
import isEqual from 'react-fast-compare';
import { useTheme, T } from '@/lib/useTheme';

import BeforeEntryName from '@blueprint/components/Dashboard/Serverlist/ServerRow/BeforeEntryName';
import AfterEntryName from '@blueprint/components/Dashboard/Serverlist/ServerRow/AfterEntryName';
import BeforeEntryDescription from '@blueprint/components/Dashboard/Serverlist/ServerRow/BeforeEntryDescription';
import AfterEntryDescription from '@blueprint/components/Dashboard/Serverlist/ServerRow/AfterEntryDescription';
import ResourceLimits from '@blueprint/components/Dashboard/Serverlist/ServerRow/ResourceLimits';

const F    = "'Sora', sans-serif";
const R    = 22;
const CIRC = 2 * Math.PI * R;

type Tk = typeof T['dark'];

const isAlarmState = (current: number, limit: number) =>
    limit > 0 && current / (limit * 1024 * 1024) >= 0.9;

const statusMeta = (s: ServerPowerState | undefined) => {
    if (!s || s === 'offline') return { color: '#ef4444', label: 'Hors ligne' };
    if (s === 'running')       return { color: '#22c55e', label: 'En ligne'   };
    if (s === 'starting')      return { color: '#eab308', label: 'Démarrage'  };
    if (s === 'stopping')      return { color: '#eab308', label: 'Arrêt'      };
    return                            { color: '#6b7280', label: s            };
};

const fmtShort = (bytes: number) => {
    if (bytes === 0) return '0';
    const gb = bytes / 1073741824;
    if (gb >= 1) return `${gb.toFixed(gb >= 10 ? 0 : 1)} Go`;
    const mb = bytes / 1048576;
    if (mb >= 1) return `${mb.toFixed(mb >= 10 ? 0 : 1)} Mo`;
    return `${(bytes / 1024).toFixed(0)} Ko`;
};

/* ── Jauge circulaire ────────────────────────────────────────── */
const Gauge = memo(({ icon, label, value, pct, color, alarm, hasLimit, onOrange, tk }: {
    icon: any; label: string; value: string;
    pct: number; color: string; alarm: boolean; hasLimit: boolean; onOrange: boolean; tk: Tk;
}) => {
    const ringColor = alarm ? '#ef4444' : color;
    const offset    = CIRC * (1 - Math.min(1, Math.max(0, pct / 100)));
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', minWidth: '58px' }}>
            <div style={{ position: 'relative', width: '52px', height: '52px' }}>
                <svg width="52" height="52" viewBox="0 0 56 56" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="28" cy="28" r={R} fill="none"
                        stroke={onOrange ? 'rgba(255,255,255,0.22)' : tk.rowGaugeTrack}
                        strokeWidth="3.5"
                        style={{ transition: 'stroke 0.2s' }} />
                    <circle cx="28" cy="28" r={R} fill="none"
                        stroke={ringColor} strokeWidth="3.5"
                        strokeDasharray={CIRC} strokeDashoffset={offset}
                        strokeLinecap="round"
                        style={{ transition: 'stroke-dashoffset 0.6s ease, stroke 0.2s' }} />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {hasLimit && pct > 0
                        ? <span style={{ fontSize: '0.6rem', fontWeight: 700, color: onOrange ? '#fff' : ringColor, fontFamily: F, transition: 'color 0.2s' }}>
                            {Math.round(pct)}%
                          </span>
                        : <FontAwesomeIcon icon={icon} style={{ fontSize: '0.6rem', color: onOrange ? '#fff' : ringColor, transition: 'color 0.15s' }} />
                    }
                </div>
            </div>
            <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '0.68rem', fontWeight: 700, fontFamily: F, transition: 'color 0.2s',
                    color: onOrange ? '#fff' : (alarm ? '#ef4444' : tk.rowGaugeValue) }}>
                    {value}
                </div>
                <div style={{ fontSize: '0.55rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: F, transition: 'color 0.2s',
                    color: onOrange ? 'rgba(255,255,255,0.65)' : tk.rowGaugeLabel }}>
                    {label}
                </div>
            </div>
        </div>
    );
}, isEqual);
Gauge.displayName = 'Gauge';

const GaugeSkeleton = ({ onOrange, tk }: { onOrange: boolean; tk: Tk }) => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', minWidth: '58px' }}>
        <div style={{
            width: '52px', height: '52px', borderRadius: '50%',
            background: onOrange ? 'rgba(255,255,255,0.15)' : tk.rowSkelBg,
            border: `3.5px solid ${onOrange ? 'rgba(255,255,255,0.25)' : tk.rowSkelBorder}`,
            transition: 'background 0.2s, border-color 0.2s',
        }} />
        <div style={{ width: '32px', height: '7px', borderRadius: '3px',
            background: onOrange ? 'rgba(255,255,255,0.2)' : tk.rowSkelBarBg,
            transition: 'background 0.2s',
        }} />
    </div>
);

/* ── Composant principal ─────────────────────────────────────── */
type Timer = ReturnType<typeof setInterval>;

export default ({ server, className }: { server: Server; className?: string }) => {
    const interval                      = useRef<Timer>(null) as React.MutableRefObject<Timer>;
    const [isSuspended, setIsSuspended] = useState(server.status === 'suspended');
    const [stats, setStats]             = useState<ServerStats | null>(null);
    const [hovered, setHovered]         = useState(false);
    const [theme]                       = useTheme();
    const tk                            = T[theme];

    const getStats = () =>
        getServerResourceUsage(server.uuid)
            .then((data) => setStats(data))
            .catch((error) => console.error(error));

    useEffect(() => {
        setIsSuspended(stats?.isSuspended || server.status === 'suspended');
    }, [stats?.isSuspended, server.status]);

    useEffect(() => {
        if (isSuspended) return;
        getStats().then(() => { interval.current = setInterval(() => getStats(), 30000); });
        return () => { interval.current && clearInterval(interval.current); };
    }, [isSuspended]);

    const alarms = { cpu: false, memory: false, disk: false };
    const pcts   = { cpu: 0, memory: 0, disk: 0 };

    if (stats) {
        alarms.cpu    = server.limits.cpu    > 0 && stats.cpuUsagePercent >= server.limits.cpu * 0.9;
        alarms.memory = isAlarmState(stats.memoryUsageInBytes, server.limits.memory);
        alarms.disk   = isAlarmState(stats.diskUsageInBytes,   server.limits.disk);
        pcts.cpu    = server.limits.cpu    > 0 ? (stats.cpuUsagePercent    / server.limits.cpu)                * 100 : 0;
        pcts.memory = server.limits.memory > 0 ? (stats.memoryUsageInBytes / mbToBytes(server.limits.memory)) * 100 : 0;
        pcts.disk   = server.limits.disk   > 0 ? (stats.diskUsageInBytes   / mbToBytes(server.limits.disk))   * 100 : 0;
    }

    const isSpecialState  = isSuspended || server.isTransferring || !!server.status;
    const sm              = statusMeta(stats?.status);
    const displayStatus   = isSpecialState
        ? { color: isSuspended ? '#ef4444' : '#eab308',
            label: isSuspended ? 'Suspendu' : server.isTransferring ? 'Transfert' : server.status === 'installing' ? 'Installation' : 'Indisponible' }
        : sm;

    const allocation     = server.allocations.find((a) => a.isDefault);
    const allocationText = allocation ? `${allocation.alias || ip(allocation.ip)}:${allocation.port}` : '—';

    const cpuVal  = stats ? `${stats.cpuUsagePercent.toFixed(1)} %` : '—';
    const ramVal  = stats ? fmtShort(stats.memoryUsageInBytes) : '—';
    const diskVal = stats ? fmtShort(stats.diskUsageInBytes)   : '—';

    return (
        <Link
            to={`/server/${server.id}`}
            className={className}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                display: 'flex', alignItems: 'center', gap: '1rem',
                background: tk.rowBg,
                border: `1px solid ${hovered ? '#FF7D20' : tk.rowBorder}`,
                borderRadius: '14px',
                padding: '1rem 1.25rem',
                textDecoration: 'none', color: 'inherit',
                fontFamily: F, position: 'relative', overflow: 'hidden',
                transition: 'border-color 0.35s ease, background 0.3s',
            }}
        >
            {/* Couche claire */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: 0,
                background: '#FFAA60',
                clipPath: hovered ? 'circle(160% at 4% 50%)' : 'circle(0% at 4% 50%)',
                transition: 'clip-path 0.72s cubic-bezier(0.4, 0, 0.2, 1)',
                willChange: 'clip-path',
            }} />
            {/* Couche orange */}
            <div style={{
                position: 'absolute', inset: 0, zIndex: 0,
                background: '#FF7D20',
                clipPath: hovered ? 'circle(160% at 4% 50%)' : 'circle(0% at 4% 50%)',
                transition: 'clip-path 0.78s cubic-bezier(0.4, 0, 0.2, 1) 0.08s',
                willChange: 'clip-path',
            }} />

            {/* Icône */}
            <div style={{
                position: 'relative', zIndex: 2, flexShrink: 0,
                width: '48px', height: '48px', borderRadius: '12px',
                background: hovered ? 'rgba(255,255,255,0.18)' : 'rgba(255,125,32,0.1)',
                border: `1px solid ${hovered ? 'rgba(255,255,255,0.35)' : 'rgba(255,125,32,0.2)'}`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                transition: 'background 0.25s 0.08s, border-color 0.25s 0.08s',
            }}>
                <FontAwesomeIcon icon={faServer} style={{
                    fontSize: '1.1rem',
                    color: hovered ? '#fff' : '#FF7D20',
                    transition: 'color 0.2s 0.08s',
                }} />
            </div>

            <BeforeEntryName />

            {/* Infos */}
            <div style={{ position: 'relative', zIndex: 2, flex: '1 1 0', minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.22rem', flexWrap: 'wrap' }}>
                    <span style={{
                        fontSize: '0.95rem', fontWeight: 700,
                        color: hovered ? '#fff' : tk.rowNameColor,
                        letterSpacing: '-0.02em',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                        transition: 'color 0.2s 0.1s',
                    }}>
                        {server.name}
                    </span>
                    <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                        fontSize: '0.6rem', fontWeight: 700, flexShrink: 0,
                        color: hovered ? '#fff' : displayStatus.color,
                        background: hovered ? 'rgba(255,255,255,0.2)' : `${displayStatus.color}15`,
                        border: `1px solid ${hovered ? 'rgba(255,255,255,0.38)' : `${displayStatus.color}30`}`,
                        borderRadius: '999px', padding: '2px 8px',
                        transition: 'all 0.2s 0.1s',
                    }}>
                        <span style={{
                            width: '5px', height: '5px', borderRadius: '50%', display: 'inline-block',
                            background: hovered ? '#fff' : displayStatus.color,
                            transition: 'background 0.2s',
                        }} />
                        {displayStatus.label}
                    </span>
                </div>
                <div style={{
                    fontSize: '0.7rem', fontWeight: 500,
                    color: hovered ? 'rgba(255,255,255,0.75)' : tk.rowIpColor,
                    fontFamily: "'Courier New', monospace",
                    transition: 'color 0.2s 0.1s',
                }}>
                    {allocationText}
                </div>
                {!!server.description && (
                    <div style={{ marginTop: '0.1rem' }}>
                        <BeforeEntryDescription />
                        <div style={{
                            fontSize: '0.68rem',
                            color: hovered ? 'rgba(255,255,255,0.65)' : tk.rowDescColor,
                            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                            transition: 'color 0.2s 0.1s',
                        }}>
                            {server.description}
                        </div>
                        <AfterEntryDescription />
                    </div>
                )}
            </div>

            <AfterEntryName />

            {/* Bouton Gérer */}
            <div style={{
                position: 'relative', zIndex: 2, flexShrink: 0,
                display: 'flex', alignItems: 'center', gap: '0.35rem',
                padding: '0.45rem 1rem',
                background: hovered ? 'rgba(255,255,255,0.18)' : 'transparent',
                border: `1px solid ${hovered ? 'rgba(255,255,255,0.4)' : tk.rowManageBorder}`,
                borderRadius: '8px',
                fontSize: '0.72rem', fontWeight: 600,
                color: hovered ? '#fff' : tk.rowManageColor,
                whiteSpace: 'nowrap',
                transition: 'all 0.2s 0.1s',
            }}>
                Gérer
                <svg width="9" height="9" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5h6M5.5 2.5L8 5l-2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
            </div>

            {/* Séparateur */}
            <div style={{
                position: 'relative', zIndex: 2, width: '1px', alignSelf: 'stretch', flexShrink: 0,
                background: hovered ? 'rgba(255,255,255,0.25)' : tk.rowSeparator,
                transition: 'background 0.2s 0.1s',
            }} />

            {/* Jauges */}
            <div style={{ position: 'relative', zIndex: 2, display: 'flex', gap: '0.5rem', alignItems: 'center', flexShrink: 0 }}>
                {!stats || isSpecialState ? (
                    isSuspended || server.isTransferring || !!server.status ? (
                        <span style={{
                            padding: '0.35rem 0.85rem',
                            background: hovered ? 'rgba(255,255,255,0.18)' : (isSuspended ? 'rgba(239,68,68,0.08)' : tk.rowSuspBg),
                            border: `1px solid ${hovered ? 'rgba(255,255,255,0.35)' : (isSuspended ? 'rgba(239,68,68,0.2)' : tk.rowSuspBorder)}`,
                            borderRadius: '7px', fontSize: '0.7rem', fontWeight: 600,
                            color: hovered ? '#fff' : (isSuspended ? '#ef4444' : tk.rowManageColor),
                            transition: 'all 0.2s 0.1s',
                        }}>
                            {displayStatus.label}
                        </span>
                    ) : (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <GaugeSkeleton onOrange={hovered} tk={tk} />
                            <GaugeSkeleton onOrange={hovered} tk={tk} />
                            <GaugeSkeleton onOrange={hovered} tk={tk} />
                        </div>
                    )
                ) : (
                    <>
                        <Gauge icon={faHdd}       label="Disque" value={diskVal}
                            pct={pcts.disk}   alarm={alarms.disk}   color="#38bdf8"
                            hasLimit={server.limits.disk   > 0} onOrange={hovered} tk={tk} />
                        <Gauge icon={faMemory}    label="RAM"    value={ramVal}
                            pct={pcts.memory} alarm={alarms.memory} color="#a78bfa"
                            hasLimit={server.limits.memory > 0} onOrange={hovered} tk={tk} />
                        <Gauge icon={faMicrochip} label="CPU"    value={cpuVal}
                            pct={pcts.cpu}    alarm={alarms.cpu}    color="#FF7D20"
                            hasLimit={server.limits.cpu    > 0} onOrange={hovered} tk={tk} />
                    </>
                )}
                <ResourceLimits />
            </div>
        </Link>
    );
};
