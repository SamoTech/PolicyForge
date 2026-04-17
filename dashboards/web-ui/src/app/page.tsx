import { getAllPolicies } from '@/lib/policies';
import Dashboard from '@/components/Dashboard';

export const revalidate = 3600; // ISR: rebuild every hour

export default async function Home() {
  const policies = await getAllPolicies();
  return <Dashboard policies={policies} />;
}
