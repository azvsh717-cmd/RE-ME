import Shell from '@/components/shell'; import { requireReadyUser } from '@/lib/auth';
export default async function Layout({children}:{children:React.ReactNode}){const u=await requireReadyUser();return <Shell email={u.email}>{children}</Shell>}
