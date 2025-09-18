const { describe, it, expect } = require("@jest/globals");
const fs = require("fs");
const path = require("path");

const file = path.resolve(process.cwd(), "app/internal-projects/[projectId]/unified/page.tsx");

const read = () => fs.readFileSync(file, "utf8");

describe("About pane layout", () => {
  it("uses the transparent shell with compact padding", () => {
    const src = read();
    expect(src).toContain("bg-transparent p-5");
  });

  it("renders the compact toolbar with slim toggle", () => {
    const src = read();
    expect(src).toContain("flex items-center gap-2 text-xs");
    expect(src).toContain("className=\"h-6 rounded-full px-2.5 text-[11px]");
  });

  it("exposes the focus-within outline utility for the editor wrapper", () => {
    const src = read();
    expect(src).toContain("focus-within:ring-indigo-500/40");
  });
});
