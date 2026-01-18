import { type Metadata } from "next";
import { getSession } from "@/server/better-auth/server";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Authentication - Message",
  description: "Login or sign up to start messaging",
};

export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
    const res = await getSession();
    if (res?.session) {
      redirect("/chat");
    }
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {children}
    </div>
  );
}
