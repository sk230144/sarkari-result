import { createServer } from "node:http";
import { db } from "./repositories/supabase.js";

/**
 * Health endpoint (§17.2). This is the long-running PM2 process; the sync
 * itself runs from cron, so this stays tiny and cheap on a 1 GB box.
 */
const PORT = Number(process.env.PORT || 8081);
// Bound to loopback: this is an internal health check, not a public API,
// and the box has no reverse proxy configured for it (runbook §"when not to").
const HOST = process.env.HOST || "127.0.0.1";

const server = createServer(async (req, res) => {
  if (req.url !== "/health") {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "not found" }));
    return;
  }

  const body = {
    status: "ok",
    database: "unknown",
    lastSuccessfulSync: null,
    activeJobs: null,
  };

  try {
    const { data, error } = await db
      .from("job_sync_logs")
      .select("finished_at, status")
      .eq("status", "ok")
      .order("finished_at", { ascending: false })
      .limit(1);

    if (error) throw error;
    body.database = "connected";
    body.lastSuccessfulSync = data?.[0]?.finished_at ?? null;

    const { count } = await db
      .from("jobs")
      .select("id", { count: "exact", head: true })
      .eq("status", "active");
    body.activeJobs = count ?? null;
  } catch (err) {
    body.status = "degraded";
    body.database = "error";
    body.error = err.message;
  }

  res.writeHead(body.status === "ok" ? 200 : 503, {
    "Content-Type": "application/json",
  });
  res.end(JSON.stringify(body, null, 2));
});

server.listen(PORT, HOST, () => {
  console.log(`jobs24-worker health endpoint on http://${HOST}:${PORT}/health`);
});
