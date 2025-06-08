import { boardRouter } from '~/server/api/routers/board'
import { cardRouter } from '~/server/api/routers/card'
import { organizationRouter } from '~/server/api/routers/organization'
import { projectRouter } from '~/server/api/routers/project'
import { userRouter } from '~/server/api/routers/user'
import { wikiRouter } from '~/server/api/routers/wiki'
import { createCallerFactory, createTRPCRouter } from '~/server/api/trpc'

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  organization: organizationRouter,
  project: projectRouter,
  board: boardRouter,
  card: cardRouter,
  wiki: wikiRouter,
  user: userRouter,
})

// export type definition of API
export type AppRouter = typeof appRouter

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter)
