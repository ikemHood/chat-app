import { redirect } from "next/navigation";
import { getSession } from "@/server/better-auth/server";

export default async function HomePage() {
  const res = await getSession();
  if (res?.session) {
    redirect("/chat");
  }
  // Redirect to login page - no landing page needed for this app
  redirect("/login");
}
