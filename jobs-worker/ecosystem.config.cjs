/**
 * PM2 config for the Vultr box (runbook §5).
 * The name must stay unique across everything on this server — the
 * first-call stitch worker already runs here as `worker`.
 */
module.exports = {
  apps: [
    {
      name: "jobs24-worker",
      script: "src/server.js",
      cwd: __dirname,
      instances: 1,
      exec_mode: "fork",
      // 1 GB box shared with another worker — cap hard (runbook §2).
      max_memory_restart: "180M",
      env: { NODE_ENV: "production", PORT: 8081, HOST: "127.0.0.1" },
      error_file: "/var/log/jobs24-worker-error.log",
      out_file: "/var/log/jobs24-worker-out.log",
      time: true,
    },
  ],
};
