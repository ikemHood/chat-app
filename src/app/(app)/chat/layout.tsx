import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Chat - Message",
  description: "Your conversations",
};

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
