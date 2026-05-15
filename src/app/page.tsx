import { getCategories } from "@/lib/data";
import ClientRedirect from "@/components/ClientRedirect";
import HomeClient from "@/components/HomeClient";
import SupportChat from "@/components/SupportChat";

export default async function Home() {
  const categories = await getCategories(10);
  return (
    <>
      <ClientRedirect />
      <HomeClient categories={categories} />
      <SupportChat userType="client" />
    </>
  );
}