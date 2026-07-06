// @vitest-environment node
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const root = process.cwd();

describe("Firebase rules baseline", () => {
  it("keeps Firestore client access closed by default", () => {
    const rules = readFileSync(join(root, "firebase/firestore.rules"), "utf8");

    expect(rules).toContain("allow read, write: if false;");
  });

  it("keeps Storage client access closed by default", () => {
    const rules = readFileSync(join(root, "firebase/storage.rules"), "utf8");

    expect(rules).toContain("allow read, write: if false;");
  });

  it("keeps Realtime Database client access closed by default", () => {
    const rules = JSON.parse(readFileSync(join(root, "firebase/database.rules.json"), "utf8"));

    expect(rules.rules[".read"]).toBe(false);
    expect(rules.rules[".write"]).toBe(false);
  });
});
