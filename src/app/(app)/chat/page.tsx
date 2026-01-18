
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/server/better-auth/config";
import { db } from "@/server/db";
import { ChatClient } from "@/components/chat/chat-client";

export default async function ChatPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session) {
    redirect("/login");
  }
  
  const user = await db.user.findUnique({
    where: { id: session.user.id }
  });

  if (!user) {
    redirect("/login");
  }

  return (
    <ChatClient 
       initialUser={{
         id: user.id,
         name: user.name,
         email: user.email,
         image: user.image ?? undefined,
         isOnline: user.isOnline,
       }} 
    />
  );
}
