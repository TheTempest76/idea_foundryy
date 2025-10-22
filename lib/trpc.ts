import { createTRPCProxyClient, httpBatchLink } from '@trpc/client';
import type { AppRouter } from '../src/server/routers/app';

export const trpc = createTRPCProxyClient<AppRouter>({
	links: [
		httpBatchLink({ url: '/api/trpc' }),
	],
});

export default trpc;
