import { describe, it, expect } from "vitest";
import { validateContactSubmission } from "./validation";

describe("validateContactSubmission", () => {
  it("passes with valid input", () => {
    const result = validateContactSubmission({
      name: "Jane Doe",
      email: "jane@example.com",
      message: "I'd love to talk about your Baja project.",
    });
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual({});
  });

  it("requires a name", () => {
    const result = validateContactSubmission({ name: "  ", email: "jane@example.com", message: "Hello there!" });
    expect(result.valid).toBe(false);
    expect(result.errors.name).toBeDefined();
  });

  it("rejects an invalid email", () => {
    const result = validateContactSubmission({ name: "Jane", email: "not-an-email", message: "Hello there!" });
    expect(result.valid).toBe(false);
    expect(result.errors.email).toBeDefined();
  });

  it("requires a message of at least 10 characters", () => {
    const result = validateContactSubmission({ name: "Jane", email: "jane@example.com", message: "hi" });
    expect(result.valid).toBe(false);
    expect(result.errors.message).toBeDefined();
  });
});
