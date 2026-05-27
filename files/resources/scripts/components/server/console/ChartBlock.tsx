import React from 'react';
import classNames from 'classnames';
import styles from '@/components/server/console/style.module.css';

const F = "'Sora', sans-serif";

interface ChartBlockProps {
    title: string;
    legend?: React.ReactNode;
    value?: React.ReactNode;
    maxLabel?: string;
    color?: string;
    children: React.ReactNode;
}

export default ({ title, legend, value, maxLabel, color = '#FF7D20', children }: ChartBlockProps) => (
    <div className={classNames(styles.chart_container, 'group')} style={{
        background: 'linear-gradient(180deg, #1c1c1c 0%, #141414 100%)',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: `0 0 0 1px rgba(255,255,255,0.04), 0 8px 32px rgba(0,0,0,0.45), 0 0 40px ${color}0a`,
        position: 'relative',
    }}>
        {/* Header */}
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.75rem 1rem 0.55rem',
            background: 'rgba(255,255,255,0.012)',
            borderBottom: '1px solid rgba(255,255,255,0.045)',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{
                    width: '3px', height: '15px',
                    background: color,
                    borderRadius: '3px', flexShrink: 0,
                    boxShadow: `0 0 10px ${color}88`,
                }} />
                <h3 style={{
                    margin: 0, fontSize: '0.65rem', fontWeight: 700,
                    color: 'rgba(255,255,255,0.38)',
                    textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: F,
                }}>
                    {title}
                </h3>
                {value && <span style={{ marginLeft: '0.3rem' }}>{value}</span>}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                {maxLabel && (
                    <span style={{
                        fontSize: '0.62rem', color: 'rgba(255,255,255,0.2)', fontFamily: F,
                        background: 'rgba(255,255,255,0.04)',
                        padding: '2px 8px', borderRadius: '99px',
                        border: '1px solid rgba(255,255,255,0.06)',
                    }}>
                        max {maxLabel}
                    </span>
                )}
                {legend && <p style={{ margin: 0, fontSize: '0.8rem', display: 'flex', alignItems: 'center' }}>{legend}</p>}
            </div>
        </div>

        {/* Chart area */}
        <div style={{ padding: '0.15rem 0.3rem 0.3rem' }}>
            {children}
        </div>
    </div>
);
