import { getQuotes } from "@/services/quotes.service";
import { QuotesTable } from "@/components/admin/quotes-table";

export default async function QuotesPage() {
  const quotes = await getQuotes();
  return <QuotesTable initialQuotes={quotes} />;
}
