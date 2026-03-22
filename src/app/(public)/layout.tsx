import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { PromoBanner } from "@/components/layout/promo-banner";
import { ResumeChatWidget } from "@/components/resume-chat/resume-chat-widget";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col">
      <PromoBanner />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <ResumeChatWidget />
    </div>
  );
}
