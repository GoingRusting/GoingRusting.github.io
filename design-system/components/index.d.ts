import type * as React from 'react';

export type ProjectId = 'engine' | 'brain' | 'shader';
export type IconName = 'arrowRight' | 'arrowUpRight' | 'search' | 'copy' | 'check' | 'book' | 'path' | 'bolt' | 'info' | 'alert' | 'menu' | 'chevronDown' | 'chevronRight' | 'repo';

export interface LogoProps { size?: number; wordmark?: boolean; href?: string; className?: string }
export declare function Logo(props: LogoProps): React.ReactElement;

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> { variant?: 'primary' | 'secondary' | 'ghost'; size?: 'sm' | 'md' | 'lg'; icon?: IconName; arrow?: boolean | 'external'; href?: string }
export declare function Button(props: ButtonProps): React.ReactElement;

export interface TagProps { tone?: 'neutral' | 'accent' | 'success' | 'warning' | 'danger'; outline?: boolean; dot?: boolean; children?: React.ReactNode }
export declare function Tag(props: TagProps): React.ReactElement;

export interface SiteHeaderProps { active?: string; project?: ProjectId; clear?: boolean; items?: [string, string][] }
export declare function SiteHeader(props: SiteHeaderProps): React.ReactElement;

export interface SceneProps { kind?: 'forge' | 'engine' | 'brain' | 'shader'; density?: number; focusX?: number; focusY?: number; fill?: number; still?: boolean; interactive?: boolean; theme?: 'copper' | 'verdigris' | 'cobalt'; className?: string; style?: React.CSSProperties }
export declare function Scene(props: SceneProps): React.ReactElement;

export interface HomeHeroProps { active?: string; still?: boolean }
export declare function HomeHero(props: HomeHeroProps): React.ReactElement;

export interface ProjectTileProps { project: ProjectId; href?: string; still?: boolean }
export declare function ProjectTile(props: ProjectTileProps): React.ReactElement;

export interface ProjectPanelProps { project: ProjectId; align?: 'left' | 'right'; code?: boolean; still?: boolean }
export declare function ProjectPanel(props: ProjectPanelProps): React.ReactElement;

export interface Stat { value: string; unit?: string; label: string }
export interface StatRowProps { stats: Stat[]; foot?: string }
export declare function StatRow(props: StatRowProps): React.ReactElement;

export interface CodeBlockProps { code: string; lang?: 'rust' | 'bash' | 'json' | 'glsl'; title?: string; highlight?: number[]; lineNumbers?: boolean; floating?: boolean }
export declare function CodeBlock(props: CodeBlockProps): React.ReactElement;

export interface CalloutProps { kind?: 'note' | 'tip' | 'warning' | 'perf'; title?: string; children?: React.ReactNode }
export declare function Callout(props: CalloutProps): React.ReactElement;

export interface DocsNavItem { label: string; href?: string; active?: boolean; tag?: string; tagTone?: TagProps['tone'] }
export interface DocsShellProps { project: ProjectId; title: string; crumbs?: string[]; meta?: React.ReactNode; version?: string; nav?: { title: string; items: DocsNavItem[] }[]; toc?: { label: string; href?: string; active?: boolean; sub?: boolean }[]; still?: boolean; children?: React.ReactNode }
export declare function DocsShell(props: DocsShellProps): React.ReactElement;

export interface TutorialStep { title: string; summary?: string; minutes?: number; level?: string; state?: 'done' | 'current' | 'todo' }
export interface TutorialPathProps { project?: ProjectId; steps: TutorialStep[]; progress?: boolean }
export declare function TutorialPath(props: TutorialPathProps): React.ReactElement;

export declare function SiteFooter(props: {}): React.ReactElement;

declare global { interface Window { GoingRusting: { Logo: typeof Logo; Button: typeof Button; Tag: typeof Tag; SiteHeader: typeof SiteHeader; Scene: typeof Scene; HomeHero: typeof HomeHero; ProjectTile: typeof ProjectTile; ProjectPanel: typeof ProjectPanel; StatRow: typeof StatRow; CodeBlock: typeof CodeBlock; Callout: typeof Callout; DocsShell: typeof DocsShell; TutorialPath: typeof TutorialPath; SiteFooter: typeof SiteFooter } } }
