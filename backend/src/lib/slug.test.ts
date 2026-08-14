import {
  describe,
  expect,
  it,
} from 'bun:test';

import {
  generateSlug,
  normalizeSlugInput,
} from './slug';

describe("slug utilities", () => {
  it("normalizes mixed input and strips invalid characters", () => {
    expect(normalizeSlugInput("/My Page! 2025")).toBe("my-page-2025");
    expect(normalizeSlugInput("  About__Us  ")).toBe("about-us");
  });

  it("avoids reserved words by appending page", () => {
    expect(generateSlug("promotion")).toBe("promotion-page");
    expect(generateSlug("Admin")).toBe("admin-page");
  });

  it("falls back if the input is empty", () => {
    expect(generateSlug("!@#")).toBe("page");
  });
});
