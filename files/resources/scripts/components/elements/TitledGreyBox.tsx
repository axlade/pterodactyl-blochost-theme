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
        style={{ background: '#191919', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px' }}
    >
        <div
            css={tw`rounded-t p-3`}
            style={{ background: '#141414', borderBottom: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px 12px 0 0' }}
        >
            {typeof title === 'string' ? (
                <p css={tw`text-sm uppercase`} style={{ color: 'rgba(255,255,255,0.5)', letterSpacing: '0.08em', fontSize: '0.7rem', fontWeight: 700 }}>
                    {icon && <FontAwesomeIcon icon={icon} css={tw`mr-2`} style={{ color: 'rgba(255,255,255,0.35)' }} />}
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
