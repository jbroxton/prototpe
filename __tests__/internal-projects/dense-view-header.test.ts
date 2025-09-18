const fs = require("fs");
const path = require("path");

describe("Dense view header", () => {
  const file = path.resolve(process.cwd(), "app/internal-projects/[projectId]/unified/page.tsx");
  const read = () => fs.readFileSync(file, "utf8");

  it("exposes a data hook for project title rename", () => {
    const src = read();
    expect(src).toContain('data-testid="project-title-rename"');
  });

  it("calls the internal projects API when updating the title", () => {
    const src = read();
    expect(src).toContain('/api/internal-projects');
    expect(src).toContain('JSON.stringify({ projectId, name: trimmed })');
  });

  it("removes the legacy Home button from the header", () => {
    const src = read();
    expect(src).not.toMatch(/Home<\/Button>/);
  });

  it("places Add Story in the requirements action bar", () => {
    const src = read();
    expect(src).toContain('data-testid="requirements-add-story"');
  });
});
