import { type Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentication - Message",
  description: "Login or sign up to start messaging",
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {children}
    </div>
  );
}
