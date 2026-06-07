import styled, { css } from 'styled-components/macro';
import tw from 'twin.macro';

export default styled.div<{ $hoverable?: boolean }>`
    ${tw`flex rounded no-underline items-center p-4 border transition-colors duration-150 overflow-hidden`};
    background: var(--bh-surface);
    border-color: var(--bh-border);
    border-radius: 12px;
    color: var(--bh-text);
    transition: background 0.3s, border-color 0.15s;

    ${(props) => props.$hoverable !== false && css`
        &:hover { border-color: rgba(255, 125, 32, 0.3); }
    `};

    & .icon {
        ${tw`rounded-full w-16 flex items-center justify-center p-3`};
        background: var(--bh-surface2);
        transition: background 0.3s;
    }
`;
