// src/app/page.tsx
import { redirect } from "next/navigation";

export default function Home() {
  // 🔒 Por ahora, redirige siempre al login
  redirect("/login");
}
