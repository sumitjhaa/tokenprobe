import type { CSSProperties } from "react";

const GLYPH: Record<string, string> = {
  book: "\u{f02d}", shield: "\u{f3ed}", code: "\u{f121}", key: "\u{f084}", hash: "\u{f292}",
  alert: "\u{f071}", check: "\u{f058}", lock: "\u{f023}", unlock: "\u{f09c}", search: "\u{f002}",
  server: "\u{f233}", braces: "\u{f0c0}", eye: "\u{f06e}", eyeOff: "\u{f070}", help: "\u{f059}",
  file: "\u{f15c}", clock: "\u{f017}", globe: "\u{f0ac}", cpu: "\u{f0db}", zap: "\u{f0e7}",
  sparkles: "\u{f005}", layers: "\u{f0ca}", wrench: "\u{f0ad}", bug: "\u{f188}", siren: "\u{f0f3}",
  terminal: "\u{f120}", download: "\u{f019}", upload: "\u{f093}", star: "\u{f005}",
  bookmark: "\u{f02e}", list: "\u{f03a}", info: "\u{f05a}", sliders: "\u{f1de}",
  github: "\u{f09b}", gitBranch: "\u{f126}", gitFork: "\u{f126}",
  home: "\u{f015}", user: "\u{f007}", cog: "\u{f013}", folder: "\u{f07b}",
  database: "\u{f1be}", cloud: "\u{f0c2}", moon: "\u{f186}", sun: "\u{f185}", paint: "\u{f1fc}",
  flask: "\u{f0c3}", rocket: "\u{f135}", tag: "\u{f02b}", tags: "\u{f02c}", link: "\u{f0c1}",
  external: "\u{f08e}", arrowRight: "\u{f061}", bars: "\u{f0c9}", times: "\u{f00d}",
  fileText: "\u{f15b}", copy: "\u{f0c5}", clipboard: "\u{f0ea}", history: "\u{f1da}",
  refresh: "\u{f021}", filter: "\u{f0b0}", toggleOn: "\u{f204}", toggleOff: "\u{f203}",
  lightbulb: "\u{f0eb}", angleRight: "\u{f105}", chevronDown: "\u{f078}", chevronUp: "\u{f077}",
  circle: "\u{f111}", square: "\u{f0c8}", users: "\u{f0c0}", spinner: "\u{f110}",
  checkCircle: "\u{f058}", fileSearch: "\u{f002}",
};

interface Props {
  name: string;
  size?: string | number;
  style?: CSSProperties;
}

export default function NfIcon({ name, size, style }: Props) {
  const fontSize = size == null ? "1.5em" : typeof size === "number" ? `${size}px` : size;
  return (
    <span
      aria-hidden
      style={{
        fontFamily: '"CaskaydiaMono NFM", monospace',
        fontSize,
        lineHeight: 1,
        display: "inline-block",
        verticalAlign: "middle",
        ...style,
      }}
    >
      {GLYPH[name] || "\u{f128}"}
    </span>
  );
}

export function iconContainer(size: string): CSSProperties {
  return {
    fontSize: size,
    width: "1em",
    height: "1em",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  };
}
