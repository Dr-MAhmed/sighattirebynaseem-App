// instrumentation.ts or src/instrumentation.ts

export async function register() {
  const { registerHighlight } = await import("@highlight-run/next/server");

  registerHighlight({
    projectID: "0dq38x4e",
    serviceName: "nextjs-backend",
  });
}
