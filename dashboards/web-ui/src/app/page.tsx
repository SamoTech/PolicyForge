import { getAllPolicies } from '@/lib/policies';
import Dashboard from '@/components/Dashboard';

export default async function Home() {
  const policies = await getAllPolicies();
  return <Dashboard policies={policies} />;
}
