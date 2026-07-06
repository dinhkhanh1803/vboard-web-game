// @vitest-environment node
import { VERSION as PIXI_VERSION } from "pixi.js";
import { describe, expect, it } from "vitest";

describe("PixiJS dependency", () => {
  it("exposes the installed PixiJS version", () => {
    expect(PIXI_VERSION).toMatch(/^\d+\.\d+\.\d+/);
  });
});
