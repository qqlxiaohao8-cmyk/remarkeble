import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function base(props: IconProps) {
  return {
    viewBox: "0 0 24 24",
    fill: "currentColor",
    "aria-hidden": true as const,
    ...props,
  };
}

export function BookIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6.2 3.2h4.2c1.3 0 2.4.4 3.1 1 .7-.6 1.8-1 3.1-1h4.2c.7 0 1.2.5 1.2 1.2V19.4c0 .5-.3.9-.8 1.1-1.8.6-3.4.7-4.6.7-1.6 0-2.8.3-3.5.8a1.1 1.1 0 0 1-1.6 0c-.7-.5-1.9-.8-3.5-.8-1.2 0-2.8-.1-4.6-.7a1.2 1.2 0 0 1-.8-1.1V4.4c0-.7.5-1.2 1.2-1.2Z" />
    </svg>
  );
}

export function MapIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path
        fillRule="evenodd"
        d="M12 2.2a7.2 7.2 0 0 0-7.2 7.2c0 5.2 7.2 12.4 7.2 12.4s7.2-7.2 7.2-12.4A7.2 7.2 0 0 0 12 2.2Zm0 9.6a2.4 2.4 0 1 1 0-4.8 2.4 2.4 0 0 1 0 4.8Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function TocIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 6h3.2v3.2H4V6Zm5 0H20v3.2H9V6ZM4 10.4h3.2V13.6H4v-3.2Zm5 0H20v3.2H9v-3.2ZM4 14.8h3.2V18H4v-3.2Zm5 0H20V18H9v-3.2Z" />
    </svg>
  );
}

export function BookmarkIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M6.2 2.8h11.6c.7 0 1.2.5 1.2 1.2V21L12 17.2 4.9 21V4c0-.7.6-1.2 1.3-1.2Z" />
    </svg>
  );
}

export function PlayIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M8.2 5.4c0-.8.9-1.3 1.6-.9l9 5.6c.7.4.7 1.4 0 1.8l-9 5.6c-.7.4-1.6-.1-1.6-.9V5.4Z" />
    </svg>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path
        fillRule="evenodd"
        d="M10.4 2.6a7.8 7.8 0 1 0 4.9 13.8l3.7 3.7a1.2 1.2 0 0 0 1.7-1.7l-3.7-3.7A7.8 7.8 0 0 0 10.4 2.6ZM5 10.4a5.4 5.4 0 1 1 10.8 0 5.4 5.4 0 0 1-10.8 0Z"
        clipRule="evenodd"
      />
    </svg>
  );
}

export function NoteIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path
        fillRule="evenodd"
        d="M6 2.6h7.5L20 9.1v11.3c0 .7-.6 1.3-1.3 1.3H6c-.7 0-1.3-.6-1.3-1.3V3.9c0-.7.6-1.3 1.3-1.3Zm2.1 8.3h7.4v1.8H8.1v-1.8Zm0 3.5h7.4v1.8H8.1v-1.8Z"
        clipRule="evenodd"
      />
    </svg>
  );
}
