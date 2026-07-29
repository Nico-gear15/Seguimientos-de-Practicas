import { redirect } from "next/navigation";

export default function RegistroPage() {
  // El registro por interfaz fue eliminado: redirige siempre al login
  redirect("/login");
}
