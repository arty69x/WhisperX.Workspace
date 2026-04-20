import { TRPCError } from "@trpc/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { storagePutMock } = vi.hoisted(() => ({
  storagePutMock: vi.fn(async (relKey: string) => ({
    key: relKey,
    url: "/manus-storage/mock-upload",
  })),
}));

vi.mock("./storage", () => ({
  storagePut: storagePutMock,
}));

import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

type UserRole = "admin" | "user";
type AuthenticatedUser = NonNullable<TrpcContext["user"]>;

function createContext(role?: UserRole): TrpcContext {
  const user: AuthenticatedUser | null = role
    ? {
        id: role === "admin" ? 1 : 2,
        openId: `${role}-open-id`,
        email: `${role}@example.com`,
        name: role === "admin" ? "Admin User" : "Standard User",
        loginMethod: "manus",
        role,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastSignedIn: new Date(),
      }
    : null;

  return {
    user,
    req: {
      protocol: "https",
      headers: {},
    } as TrpcContext["req"],
    res: {
      clearCookie: () => undefined,
    } as TrpcContext["res"],
  };
}

describe("platform router", () => {
  beforeEach(() => {
    storagePutMock.mockClear();
  });

  it("returns overview data for authenticated users", async () => {
    const caller = appRouter.createCaller(createContext("user"));

    const overview = await caller.platform.overview();

    expect(overview.user.role).toBe("user");
    expect(overview.stats.length).toBeGreaterThan(0);
    expect(overview.modules.length).toBeGreaterThan(0);
    expect(overview.presence.length).toBeGreaterThan(0);
  });

  it("rejects members.list for non-admin users", async () => {
    const caller = appRouter.createCaller(createContext("user"));

    await expect(caller.members.list()).rejects.toMatchObject<Partial<TRPCError>>({
      code: "FORBIDDEN",
    });
  });

  it("allows members.list for admins", async () => {
    const caller = appRouter.createCaller(createContext("admin"));

    const members = await caller.members.list();

    expect(members).toHaveLength(3);
    expect(members[0]?.role).toBe("admin");
  });

  it("evaluates skill templates with deterministic checks", async () => {
    const caller = appRouter.createCaller(createContext("user"));

    const result = await caller.skills.validateTemplate({
      name: "Executive Summary Skill",
      prompt: "Create a structured summary output with action items and JSON-ready sections for operational analysis.",
    });

    expect(result.score).toBe(3);
    expect(result.checks.every(item => item.passed)).toBe(true);
  });

  it("uploads files through storage and returns a tracked asset", async () => {
    const caller = appRouter.createCaller(createContext("user"));

    const uploaded = await caller.files.upload({
      fileName: "board-notes.txt",
      contentType: "text/plain",
      contentBase64: Buffer.from("hello workspace", "utf8").toString("base64"),
      module: "canvas",
    });

    expect(storagePutMock).toHaveBeenCalledTimes(1);
    expect(uploaded.name).toBe("board-notes.txt");
    expect(uploaded.module).toBe("canvas");
    expect(uploaded.url).toBe("/manus-storage/mock-upload");
  });
});
