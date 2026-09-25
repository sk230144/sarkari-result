export type Notification = {
  id: string;
  type: "message" | "endorsement" | "view" | "referral";
  title: string;
  body: string | null;
  at: string;
  href: string;
  unread?: boolean;
};
