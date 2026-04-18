// Server Component — fetches all policies from GitHub at request time.
import { fetchAllPolicies, getCategories } from '@/lib/github';
import PolicyList from '@/components/PolicyList';

export const revalidate = 300; // ISR: rebuild page cache every 5 minutes

export default async function Home() {
  const policies   = await fetchAllPolicies();
  const categories = await getCategories(policies);

  return <PolicyList policies={policies} categories={categories} />;
}
