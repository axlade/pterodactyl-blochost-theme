import React, { memo } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconProp } from '@fortawesome/fontawesome-svg-core';
import tw from 'twin.macro';
import isEqual from 'react-fast-compare';

interface Props {
    icon?: IconProp;
    title: string | React.ReactNode;
    className?: string;
    children: React.ReactNode;
}

const TitledGreyBox = ({ icon, title, children, className }: Props) => (
    <div
        css={tw`rounded shadow-md`}
        className={className}
        style={{
            background: 'var(--bh-surface)',
            border: '1px solid var(--bh-border)',
            borderRadius: '12px',
            transition: 'background 0.3s, border-color 0.3s',
        }}
    >
        <div
            css={tw`rounded-t p-3`}
            style={{
                background: 'var(--bh-surface2)',
                borderBottom: '1px solid var(--bh-border)',
                borderRadius: '12px 12px 0 0',
                transition: 'background 0.3s, border-color 0.3s',
            }}
        >
            {typeof title === 'string' ? (
                <p css={tw`text-sm uppercase`} style={{
                    color: 'var(--bh-title-color)',
                    letterSpacing: '0.08em', fontSize: '0.7rem', fontWeight: 700,
                    transition: 'color 0.3s',
                }}>
                    {icon && <FontAwesomeIcon icon={icon} css={tw`mr-2`} style={{ color: 'var(--bh-icon-muted)', transition: 'color 0.3s' }} />}
                    {title}
                </p>
            ) : (
                title
            )}
        </div>
        <div css={tw`p-3`}>{children}</div>
    </div>
);

export default memo(TitledGreyBox, isEqual);
