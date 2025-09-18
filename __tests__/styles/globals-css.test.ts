const fs = require("fs");
const path = require("path");

describe("app/globals.css", () => {
  const globalsPath = path.resolve(process.cwd(), "app", "globals.css");
  const contents = fs.readFileSync(globalsPath, "utf-8");

  it("registers the tailwindcss animate plugin", () => {
    expect(contents).toContain('@plugin "tailwindcss-animate";');
  });

  it("does not import the deprecated tw-animate layer", () => {
    expect(contents).not.toContain('@import "tw-animate-css";');
  });
});
