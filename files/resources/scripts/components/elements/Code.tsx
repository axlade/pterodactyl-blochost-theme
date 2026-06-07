import React from 'react';
import classNames from 'classnames';

interface CodeProps {
    dark?: boolean | undefined;
    className?: string;
    children: React.ReactChild | React.ReactFragment | React.ReactPortal;
}

export default ({ dark: _dark, className, children }: CodeProps) => (
    <code
        className={classNames('font-mono text-sm px-2 py-1 inline-block rounded', className)}
        style={{
            background: 'var(--bh-surface2)',
            color: 'var(--bh-text)',
            border: '1px solid var(--bh-border)',
            transition: 'background 0.3s, color 0.3s, border-color 0.3s',
        }}
    >
        {children}
    </code>
);
