import type { ReactNode, SVGProps } from "react";

export type IconName =
  | "arrow"
  | "arrowUpRight"
  | "brain"
  | "check"
  | "clipboard"
  | "document"
  | "link"
  | "lock"
  | "menu"
  | "search"
  | "shield"
  | "shieldCheck"
  | "spark"
  | "upload"
  | "userCheck"
  | "warning"
  | "x";

type IconProps = SVGProps<SVGSVGElement> & {
  name: IconName;
};

const paths: Record<IconName, ReactNode> = {
  arrow: <path d="M4 12h15m-6-6 6 6-6 6" />,
  arrowUpRight: <path d="M7 17 17 7m0 0H9m8 0v8" />,
  brain: (
    <>
      <path d="M9.5 4.2A3.2 3.2 0 0 0 6 7.4a3.1 3.1 0 0 0-1 5.8A3.1 3.1 0 0 0 8 18a3.1 3.1 0 0 0 4-1.1A3.1 3.1 0 0 0 16 18a3.1 3.1 0 0 0 3-4.8 3.1 3.1 0 0 0-1-5.8 3.2 3.2 0 0 0-3.5-3.2A3.2 3.2 0 0 0 12 6a3.2 3.2 0 0 0-2.5-1.8Z" />
      <path d="M12 6v11m-3-7h3m3-2h-3m-3 5h3" />
    </>
  ),
  check: <path d="m5 12 4 4L19 6" />,
  clipboard: (
    <>
      <rect x="5" y="4" width="14" height="16" rx="2" />
      <path d="M9 4.5V3h6v1.5M8.5 10h7M8.5 14h5" />
    </>
  ),
  document: (
    <>
      <path d="M6 3.5h8l4 4V20.5H6z" />
      <path d="M14 3.5v4h4M9 12h6M9 16h4" />
    </>
  ),
  link: <path d="M10 13.5 14 9.5m-7.1 7.1-1 1a3.2 3.2 0 0 1-4.5-4.5l3-3a3.2 3.2 0 0 1 4.5 0m2.2-2.2 1-1a3.2 3.2 0 0 1 4.5 4.5l-3 3a3.2 3.2 0 0 1-4.5 0" />,
  lock: (
    <>
      <rect x="5" y="10" width="14" height="10" rx="2" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3m-4 4v2" />
    </>
  ),
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  search: (
    <>
      <circle cx="10.8" cy="10.8" r="6.3" />
      <path d="m16 16 4 4" />
    </>
  ),
  shield: <path d="M12 3 19 6v5c0 4.7-2.9 8.3-7 10-4.1-1.7-7-5.3-7-10V6z" />,
  shieldCheck: (
    <>
      <path d="M12 3 19 6v5c0 4.7-2.9 8.3-7 10-4.1-1.7-7-5.3-7-10V6z" />
      <path d="m8.5 12 2.2 2.2 4.8-4.8" />
    </>
  ),
  spark: (
    <>
      <path d="m12 3 1.4 5.6L19 10l-5.6 1.4L12 17l-1.4-5.6L5 10l5.6-1.4z" />
      <path d="m18 16 .6 2.4L21 19l-2.4.6L18 22l-.6-2.4L15 19l2.4-.6z" />
    </>
  ),
  upload: (
    <>
      <path d="M12 16V4m0 0L8 8m4-4 4 4" />
      <path d="M5 14v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-4" />
    </>
  ),
  userCheck: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0M15 15l2 2 4-4" />
    </>
  ),
  warning: (
    <>
      <path d="m12 3 9 17H3z" />
      <path d="M12 9v4m0 3h.01" />
    </>
  ),
  x: <path d="m6 6 12 12M18 6 6 18" />,
};

export function Icon({ name, width = 20, height = 20, ...props }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      height={height}
      viewBox="0 0 24 24"
      width={width}
      xmlns="http://www.w3.org/2000/svg"
      {...props}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.8}
    >
      {paths[name]}
    </svg>
  );
}
