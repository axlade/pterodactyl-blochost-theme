import styled, { css } from 'styled-components/macro';
import tw from 'twin.macro';

export default styled.div<{ $hoverable?: boolean }>`
    ${tw`flex rounded no-underline text-neutral-200 items-center p-4 border transition-colors duration-150 overflow-hidden`};
    background: #191919;
    border-color: rgba(255, 255, 255, 0.06);
    border-radius: 12px;

    ${(props) => props.$hoverable !== false && css`
        &:hover { border-color: rgba(255, 125, 32, 0.3); }
    `};

    & .icon {
        ${tw`rounded-full w-16 flex items-center justify-center p-3`};
        background: #252525;
    }
`;
