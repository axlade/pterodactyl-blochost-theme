import styled from 'styled-components/macro';
import tw, { theme } from 'twin.macro';

const SubNavigation = styled.div`
    ${tw`w-full shadow overflow-x-auto`};
    background: var(--bh-surface);
    border-bottom: 1px solid var(--bh-border);
    transition: background 0.3s, border-color 0.3s;

    & > div {
        ${tw`flex items-center text-sm mx-auto px-2`};
        max-width: 1200px;

        & > a,
        & > div {
            ${tw`inline-block py-3 px-4 no-underline whitespace-nowrap transition-all duration-150`};
            color: var(--bh-text);
            opacity: 0.6;

            &:not(:first-of-type) {
                ${tw`ml-2`};
            }

            &:hover {
                opacity: 1;
            }

            &:active,
            &.active {
                opacity: 1;
                box-shadow: inset 0 -2px ${theme`colors.cyan.600`.toString()};
            }
        }
    }
`;

export default SubNavigation;
