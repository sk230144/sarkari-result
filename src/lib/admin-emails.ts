/**
 * Admin accounts, in one place for the server and the browser. In the
 * browser this only decides whether admin links and buttons are shown;
 * every admin action is checked again on the server.
 */
export const ADMIN_EMAILS = ["risabht043@gmail.com"];

export function isAdminEmail(email: string | null | undefined): boolean {
  return Boolean(email && ADMIN_EMAILS.includes(email.toLowerCase()));
}
