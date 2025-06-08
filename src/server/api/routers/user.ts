import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'

export const userRouter = createTRPCRouter({
  // Get current user profile
  getProfile: protectedProcedure.query(async ({ ctx }) => {
    const user = await ctx.db.user.findUnique({
      where: { id: ctx.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerified: true,
        image: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      throw new Error('User not found')
    }

    return user
  }),

  // Update user profile
  updateProfile: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100).optional(),
        email: z.string().email().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // If email is being updated, check if it's already taken
      if (input.email && input.email !== ctx.user.email) {
        const existingUser = await ctx.db.user.findUnique({
          where: { email: input.email },
        })

        if (existingUser) {
          throw new Error('Email is already in use')
        }
      }

      const updatedUser = await ctx.db.user.update({
        where: { id: ctx.user.id },
        data: {
          name: input.name,
          email: input.email,
          // Reset email verification if email is changed
          emailVerified: input.email && input.email !== ctx.user.email ? false : undefined,
        },
        select: {
          id: true,
          name: true,
          email: true,
          emailVerified: true,
          image: true,
          createdAt: true,
          updatedAt: true,
        },
      })

      return updatedUser
    }),

  // Get account information (to check if user has password authentication)
  getAccountInfo: protectedProcedure.query(async ({ ctx }) => {
    const accounts = await ctx.db.account.findMany({
      where: { userId: ctx.user.id },
      select: {
        providerId: true,
        accountId: true,
      },
    })

    return {
      hasPassword: accounts.some((account) => account.providerId === 'credential'),
      providers: accounts.map((account) => account.providerId),
    }
  }),
})
