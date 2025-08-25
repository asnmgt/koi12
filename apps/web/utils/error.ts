// Simplified error utility for KoiMgr

export function captureException(error: unknown) {
  console.error("Captured error:", error);
}

export function setUser(user: { id: string; email?: string }) {
  console.log("User context set:", user);
}
