import { describe, expect, it } from "vitest";

import { MAX_IMAGE_BYTES, storagePath, validateImage } from "./socialImageHost";

describe("what may be hosted for Meta", () => {
  it("accepts the formats Instagram publishes", () => {
    expect(validateImage("image/png", 1000)).toEqual({ ok: true, ext: "png" });
    expect(validateImage("image/jpeg", 1000)).toEqual({ ok: true, ext: "jpg" });
    expect(validateImage("image/webp", 1000)).toEqual({ ok: true, ext: "webp" });
    // A content type with a charset is still that type.
    expect(validateImage("image/png; charset=binary", 1000)).toEqual({ ok: true, ext: "png" });
    expect(validateImage("IMAGE/PNG", 1000)).toEqual({ ok: true, ext: "png" });
  });

  it("refuses anything that is not one of those", () => {
    // This endpoint writes to our storage; it must not become a file host.
    for (const type of ["text/html", "application/pdf", "image/svg+xml", "", undefined]) {
      expect(validateImage(type, 1000).ok, String(type)).toBe(false);
    }
  });

  it("refuses an image Instagram would reject anyway", () => {
    expect(validateImage("image/png", MAX_IMAGE_BYTES + 1)).toEqual({
      ok: false,
      reason: "too_large",
    });
    expect(validateImage("image/png", MAX_IMAGE_BYTES)).toEqual({ ok: true, ext: "png" });
    expect(validateImage("image/png", 0)).toEqual({ ok: false, reason: "empty" });
  });
});

describe("where an image is stored", () => {
  it("namespaces by user, so one account cannot reach another's", () => {
    expect(storagePath("user-123", "png", "abc")).toBe("user-123/abc.png");
  });

  it("strips anything that could climb out of the namespace", () => {
    // A user id or token that tried to traverse must not produce a path that
    // escapes the folder.
    const path = storagePath("../../etc", "png", "../secret");
    expect(path).not.toContain("..");
    expect(path).not.toContain("/etc");
    expect(path.split("/").length).toBe(2);
  });
});
