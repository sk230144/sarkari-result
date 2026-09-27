/**
 * Downloads for the desktop AI Interview Assistant ("Job 24 Alert Tool").
 *
 * The installers are ~300 MB each, too big for the repo or a Vercel deploy,
 * so they're served from GitHub Releases. `latest/download/<file>` always
 * points at the newest release, so publishing a new version only means
 * uploading files with these names (or updating the names here).
 */
const RELEASES = "https://github.com/sk230144/interview-ai/releases/latest/download";

export const APP_NAME = "Job 24 Alert Tool";
export const APP_VERSION = "1.0.0";

export type Build = {
  id: "win" | "mac-arm" | "mac-intel";
  os: "windows" | "mac";
  label: string;
  detail: string;
  file: string;
  size: string;
  href: string;
};

const build = (b: Omit<Build, "href">): Build => ({ ...b, href: `${RELEASES}/${b.file}` });

export const BUILDS: Build[] = [
  build({ id: "win", os: "windows", label: "Windows", detail: "Windows 10 / 11, 64-bit", file: `Job-24-Alert-Tool-Setup-${APP_VERSION}.exe`, size: "306 MB" }),
  build({ id: "mac-arm", os: "mac", label: "Mac (Apple Silicon)", detail: "M1, M2, M3, M4", file: `Job-24-Alert-Tool-${APP_VERSION}-arm64.dmg`, size: "328 MB" }),
  build({ id: "mac-intel", os: "mac", label: "Mac (Intel)", detail: "Intel-based Macs", file: `Job-24-Alert-Tool-${APP_VERSION}-x64.dmg`, size: "347 MB" }),
];
