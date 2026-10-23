import AppShell from "@/components/app-shell";
import { loadData } from "@/lib/queries";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { contacts, products } = await loadData();
  return <AppShell contacts={contacts} products={products} />;
}
