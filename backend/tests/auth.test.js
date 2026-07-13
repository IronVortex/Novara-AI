import test from "node:test";
import assert from "node:assert/strict";
import { comparePassword, createToken, hashPassword } from "../utils/auth.js";

test("hashes and compares passwords", async () => {
  const hashed = await hashPassword("supersecret");
  assert.notEqual(hashed, "supersecret");
  assert.equal(await comparePassword("supersecret", hashed), true);
  assert.equal(await comparePassword("wrong", hashed), false);
});

test("creates a signed JWT token", () => {
  process.env.JWT_SECRET = "test-secret";
  const token = createToken({ _id: "user-1", email: "test@example.com" });
  assert.equal(typeof token, "string");
  assert.ok(token.length > 20);
});
