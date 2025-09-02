"use client";

import yaml from "js-yaml";

export type ComponentCommon = {
  type: string;
  id?: string;
  frame: { x: number; y: number; w: number; h: number };
  props?: Record<string, any>;
  linkTo?: string;
  milestone?: "M0" | "M1" | "M2";
  until?: "M0" | "M1" | "M2"; // optional: last milestone where visible
};

export type Screen = {
  id: string;
  name: string;
  device: "mobile" | "web";
  size?: { width: number; height: number };
  background?: string;
  milestone?: "M0" | "M1" | "M2";
  components: ComponentCommon[];
};

export type DSL = {
  name: string;
  theme?: "light" | "dark";
  screens: Screen[];
};

export function parseDSL(src: string): DSL {
  const obj = yaml.load(src) as any;
  if (!obj || typeof obj !== "object") throw new Error("DSL must be an object");
  if (!Array.isArray(obj.screens)) throw new Error("DSL missing 'screens' array");
  // light validation/coercion
  const screens: Screen[] = obj.screens.map((s: any) => ({
    id: String(s.id),
    name: String(s.name ?? s.id),
    device: (s.device === "web" ? "web" : "mobile") as "mobile" | "web",
    size: s.size ? { width: Number(s.size.width), height: Number(s.size.height) } : undefined,
    background: s.background ? String(s.background) : undefined,
    milestone: s.milestone && ["M0","M1","M2"].includes(String(s.milestone)) ? (String(s.milestone) as any) : undefined,
    components: Array.isArray(s.components)
      ? s.components.map((c: any) => ({
          type: String(c.type),
          id: c.id ? String(c.id) : undefined,
          frame: {
            x: Number(c.frame?.x ?? 0),
            y: Number(c.frame?.y ?? 0),
            w: Number(c.frame?.w ?? 100),
            h: Number(c.frame?.h ?? 40),
          },
          props: c.props ?? {},
          linkTo: c.linkTo ? String(c.linkTo) : undefined,
          milestone: c.milestone && ["M0","M1","M2"].includes(String(c.milestone)) ? (String(c.milestone) as any) : undefined,
          until: c.until && ["M0","M1","M2"].includes(String(c.until)) ? (String(c.until) as any) : undefined,
        }))
      : [],
  }));

  return {
    name: String(obj.name ?? "Prototype"),
    theme: obj.theme === "dark" ? "dark" : "light",
    screens,
  };
}

export function stringifyDSL(dsl: DSL): string {
  return yaml.dump(dsl, { lineWidth: 120, noRefs: true });
}

export function ensureScreen(dsl: DSL, scr: Screen) {
  const existing = dsl.screens.find((s) => s.id === scr.id);
  if (existing) {
    Object.assign(existing, scr);
  } else {
    dsl.screens.push(scr);
  }
}

export function findScreen(dsl: DSL, id: string): Screen | undefined {
  return dsl.screens.find((s) => s.id === id);
}
