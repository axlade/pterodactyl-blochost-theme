import React from 'react';
import classNames from 'classnames';
import styles from '@/components/server/console/style.module.css';
import { useTheme, T } from '@/lib/useTheme';

const F = "'Sora', sans-serif";

interface ChartBlockProps {
    title: string;
    legend?: React.ReactNode;
    value?: React.ReactNode;
    maxLabel?: string;
    color?: string;
    children: React.ReactNode;
}

export default ({ title, legend, value, maxLabel, color = '#FF7D20', children }: ChartBlockProps) => {
    const [theme] = useTheme();
    const t = T[theme];

    return (
        <div className={classNames(styles.chart_container, 'group')} style={{
            background: t.cardBg,
            border: `1px solid ${t.cardBorder}`,
            borderRadius: '20px',
            overflow: 'hidden',
            boxShadow: `${t.cardShadow}, 0 0 40px ${color}08`,
            transition: 'background 0.3s, border-color 0.3s, box-shadow 0.3s',
        }}>
            {/* Header */}
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '0.75rem 1rem 0.55rem',
                background: t.cardHeaderBg,
                borderBottom: `1px solid ${t.cardHeaderBorder}`,
                transition: 'background 0.3s',
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
                        color: t.cardTitleColor,
                        textTransform: 'uppercase', letterSpacing: '0.12em', fontFamily: F,
                        transition: 'color 0.3s',
                    }}>
                        {title}
                    </h3>
                    {value && <span style={{ marginLeft: '0.3rem' }}>{value}</span>}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    {maxLabel && (
                        <span style={{
                            fontSize: '0.62rem', color: t.cardMaxLabelColor, fontFamily: F,
                            background: t.cardMaxLabelBg,
                            padding: '2px 8px', borderRadius: '99px',
                            border: `1px solid ${t.cardMaxLabelBorder}`,
                            transition: 'all 0.3s',
                        }}>
                            max {maxLabel}
                        </span>
                    )}
                    {legend && <p style={{ margin: 0, fontSize: '0.8rem', display: 'flex', alignItems: 'center' }}>{legend}</p>}
                </div>
            </div>

            {/* Chart area */}
            <div style={{
                padding: '0.15rem 0.3rem 0.3rem',
                background: t.chartAreaBg,
                transition: 'background 0.3s',
            }}>
                {children}
            </div>
        </div>
    );
};
