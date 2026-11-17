// Server configuration preflight.
// Returns human readable problems so the UI can show an actionable message
// instead of a generic "check server settings" error.
export type ConfigIssue = { key: string; message: string };

export function configIssues(): ConfigIssue[] {
  const issues: ConfigIssue[] = [];
  if (!process.env.DATABASE_URL) {
    issues.push({ key: 'DATABASE_URL', message: 'DATABASE_URL sozlanmagan (PostgreSQL ulanish manzili kerak).' });
  }
  const secret = process.env.SECRET_KEY;
  if (!secret) issues.push({ key: 'SECRET_KEY', message: 'SECRET_KEY sozlanmagan (sessiya imzosi uchun maxfiy kalit).' });
  else if (secret.length < 32) issues.push({ key: 'SECRET_KEY', message: 'SECRET_KEY kamida 32 belgidan iborat bo‘lishi kerak.' });
  return issues;
}

export function configErrorMessage(issues: ConfigIssue[]) {
  return `Server sozlanmagan: ${issues.map(i => i.message).join(' ')} Vercel → Project → Settings → Environment Variables bo‘limida qo‘shib, qayta deploy qiling.`;
}

export function isConfigIssue(error: unknown): boolean {
  return error instanceof Error && /sozlanmagan|Sozlanmagan|sozlanmagan/.test(error.message);
}
