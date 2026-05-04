import { getContactRequests } from "@/lib/data";
import RequestsClient from "./RequestsClient";

export default async function RequestsPage() {
  const requests = await getContactRequests();

  return <RequestsClient requests={requests} />;
}