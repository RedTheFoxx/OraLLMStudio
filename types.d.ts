declare module 'react-syntax-highlighter' {
  import { ComponentType, ReactNode } from 'react';
  
  export interface SyntaxHighlighterProps {
    language?: string;
    style?: any;
    children?: ReactNode;
    PreTag?: string;
    [key: string]: any;
  }
  
  export const Prism: ComponentType<SyntaxHighlighterProps>;
  export const Light: ComponentType<SyntaxHighlighterProps>;
}

declare module 'react-syntax-highlighter/dist/esm/styles/prism' {
  const tomorrow: any;
  export { tomorrow };
}

declare module 'boosted' {
  export class Toast {
    constructor(element: HTMLElement);
    show(): void;
    hide(): void;
  }
} 