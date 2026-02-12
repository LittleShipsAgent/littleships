import "server-only";

export function requireAdminToken(token: string | null | undefined): void {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected) {
    throw new Error("Missing ADMIN_TOKEN env var");
  }
  if (!token || token !== expected) {
    throw new Error("Unauthorized");
  }
}
