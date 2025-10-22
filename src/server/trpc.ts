import { initTRPC } from '@trpc/server';

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;

export type InferQueryOutput<TRouteKey extends string> = unknown;

// re-export helpers for routers
export default t;
