import React from 'react';
import classNames from 'classnames';
import styles from '@/components/server/console/style.module.css';

const F = "'Sora', sans-serif";

interface ChartBlockProps {
    title: string;
    legend?: React.ReactNode;
    value?: React.ReactNode;
    maxLabel?: string;
    children: React.ReactNode;
}

export default ({ title, legend, value, maxLabel, children }: ChartBlockProps) => (
    <div className={classNames(styles.chart_container, 'group')} style={{
        background: '#191919',
        border: '1px solid rgba(255,255,255,0.07)',
        borderRadius: '14px',
        overflow: 'hidden',
    }}>
        <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '0.6rem 1rem',
            background: 'rgba(255,255,255,0.02)',
            borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ width: '3px', height: '14px', background: '#FF7D20', borderRadius: '2px', flexShrink: 0 }} />
                <h3 style={{
                    margin: 0, fontSize: '0.68rem', fontWeight: 700, color: 'rgba(255,255,255,0.5)',
                    textTransform: 'uppercase', letterSpacing: '0.08em', fontFamily: F,
                }}>
                    {title}
                </h3>
                {value && <span style={{ marginLeft: '0.25rem' }}>{value}</span>}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {maxLabel && (
                    <span style={{ fontSize: '0.68rem', color: 'rgba(255,255,255,0.28)', fontFamily: F }}>
                        {maxLabel}
                    </span>
                )}
                {legend && <p style={{ margin: 0, fontSize: '0.8rem', display: 'flex', alignItems: 'center' }}>{legend}</p>}
            </div>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.2)', padding: '0.25rem 0.25rem 0' }}>{children}</div>
    </div>
);
