import type { Config } from 'tailwindcss';
export default { content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'], theme: { extend: { colors: { ink:'#252342', primary:'#4f46e5' } } }, plugins: [] } satisfies Config;
