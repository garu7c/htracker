// src/app/page.tsx
import { redirect } from "next/navigation";

export default function Home() {
  // Redirige siempre al dashboard (stats)
  redirect("/login");
}
