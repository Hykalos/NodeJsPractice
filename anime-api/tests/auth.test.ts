import { describe, expect, it, vi } from "vitest";
import type { Pool } from "pg";
import type { NextFunction, Request, Response } from "express";
import { apiKeyAuth, bootstrapApiKeys, hashApiKey } from "../src/auth";

describe("auth", () => {
  it("hashes keys using sha256", () => {
    expect(hashApiKey("plain-key")).toMatch(/^[a-f0-9]{64}$/);
    expect(hashApiKey("plain-key")).not.toBe("plain-key");
  });

  it("bootstraps hashed keys and does not persist plaintext", async () => {
    const query = vi.fn(async () => ({ rowCount: 1 }));
    const pool = { query } as unknown as Pool;

    await bootstrapApiKeys(pool, "local-key-1:Local One, local-key-2");

    expect(query).toHaveBeenCalledTimes(2);

    const firstCallArgs = query.mock.calls[0] as unknown as [string, string[]];
    expect(firstCallArgs[1][0]).toBe("Local One");
    expect(firstCallArgs[1][1]).toBe(hashApiKey("local-key-1"));
    expect(firstCallArgs[1][1]).not.toBe("local-key-1");

    const secondCallArgs = query.mock.calls[1] as unknown as [string, string[]];
    expect(secondCallArgs[1][0]).toBe("Bootstrap Key");
    expect(secondCallArgs[1][1]).toBe(hashApiKey("local-key-2"));
    expect(secondCallArgs[1][1]).not.toBe("local-key-2");
  });

  it("ignores blank bootstrap values", async () => {
    const query = vi.fn(async () => ({ rowCount: 1 }));
    const pool = { query } as unknown as Pool;

    await bootstrapApiKeys(pool, "   ");

    expect(query).not.toHaveBeenCalled();
  });

  it("rejects requests without x-api-key", async () => {
    const query = vi.fn(async () => ({ rowCount: 0 }));
    const pool = { query } as unknown as Pool;
    const middleware = apiKeyAuth(pool);

    const req = { header: vi.fn(() => undefined) } as unknown as Request;
    const json = vi.fn();
    const res = { status: vi.fn(() => ({ json })) } as unknown as Response;
    const next = vi.fn() as NextFunction;

    await middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({
      error: { code: "AUTH_REQUIRED", message: "x-api-key header is required" }
    });
    expect(next).not.toHaveBeenCalled();
    expect(query).not.toHaveBeenCalled();
  });

  it("rejects requests with invalid x-api-key", async () => {
    const query = vi.fn(async () => ({ rowCount: 0 }));
    const pool = { query } as unknown as Pool;
    const middleware = apiKeyAuth(pool);

    const req = { header: vi.fn(() => "invalid-key") } as unknown as Request;
    const json = vi.fn();
    const res = { status: vi.fn(() => ({ json })) } as unknown as Response;
    const next = vi.fn() as NextFunction;

    await middleware(req, res, next);

    expect(query).toHaveBeenCalledTimes(1);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(json).toHaveBeenCalledWith({
      error: { code: "AUTH_INVALID", message: "Invalid API key" }
    });
    expect(next).not.toHaveBeenCalled();
  });

  it("allows requests with a valid x-api-key", async () => {
    const query = vi.fn(async () => ({ rowCount: 1 }));
    const pool = { query } as unknown as Pool;
    const middleware = apiKeyAuth(pool);

    const req = { header: vi.fn(() => "valid-key") } as unknown as Request;
    const res = { status: vi.fn(), json: vi.fn() } as unknown as Response;
    const next = vi.fn() as NextFunction;

    await middleware(req, res, next);

    expect(query).toHaveBeenCalledWith(expect.any(String), [hashApiKey("valid-key")]);
    expect(next).toHaveBeenCalledTimes(1);
    expect(res.status).not.toHaveBeenCalled();
  });
});
