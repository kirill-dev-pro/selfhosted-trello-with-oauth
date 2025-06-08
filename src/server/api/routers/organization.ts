import { z } from 'zod'
import { createTRPCRouter, protectedProcedure, publicProcedure } from '~/server/api/trpc'

export const organizationRouter = createTRPCRouter({
  // Get the single organization (for self-hosted version)
  get: publicProcedure.query(async ({ ctx }) => {
    const organization = await ctx.db.organization.findFirst({
      include: {
        members: {
          include: {
            user: true,
          },
        },
        projects: {
          include: {
            boards: true,
            wikiPages: true,
          },
        },
      },
    })

    return organization
  }),

  // Create organization (only if none exists for self-hosted)
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().optional(),
        slug: z
          .string()
          .min(1)
          .max(50)
          .regex(/^[a-z0-9-]+$/),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if organization already exists (self-hosted limitation)
      const existingOrg = await ctx.db.organization.findFirst()
      if (existingOrg) {
        throw new Error(
          'Organization already exists. Self-hosted version supports only one organization.',
        )
      }

      const organization = await ctx.db.organization.create({
        data: {
          name: input.name,
          description: input.description,
          slug: input.slug,
          members: {
            create: {
              userId: ctx.user.id,
              role: 'OWNER',
            },
          },
        },
        include: {
          members: {
            include: {
              user: true,
            },
          },
        },
      })

      return organization
    }),

  // Update organization
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is owner or admin
      const membership = await ctx.db.organizationMember.findFirst({
        where: {
          userId: ctx.user.id,
          organizationId: input.id,
          role: { in: ['OWNER', 'ADMIN'] },
        },
      })

      if (!membership) {
        throw new Error("You don't have permission to update this organization")
      }

      const organization = await ctx.db.organization.update({
        where: { id: input.id },
        data: {
          name: input.name,
          description: input.description,
        },
      })

      return organization
    }),

  // Add member to organization
  addMember: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
        email: z.string().email(),
        role: z.enum(['MEMBER', 'ADMIN']).default('MEMBER'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is owner or admin
      const membership = await ctx.db.organizationMember.findFirst({
        where: {
          userId: ctx.user.id,
          organizationId: input.organizationId,
          role: { in: ['OWNER', 'ADMIN'] },
        },
      })

      if (!membership) {
        throw new Error("You don't have permission to add members")
      }

      // Find user by email
      const user = await ctx.db.user.findUnique({
        where: { email: input.email },
      })

      if (!user) {
        throw new Error('User not found')
      }

      // Check if user is already a member
      const existingMembership = await ctx.db.organizationMember.findUnique({
        where: {
          userId_organizationId: {
            userId: user.id,
            organizationId: input.organizationId,
          },
        },
      })

      if (existingMembership) {
        throw new Error('User is already a member of this organization')
      }

      const newMember = await ctx.db.organizationMember.create({
        data: {
          userId: user.id,
          organizationId: input.organizationId,
          role: input.role,
        },
        include: {
          user: true,
        },
      })

      return newMember
    }),

  // Remove member from organization
  removeMember: protectedProcedure
    .input(
      z.object({
        organizationId: z.string(),
        userId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is owner or admin
      const membership = await ctx.db.organizationMember.findFirst({
        where: {
          userId: ctx.user.id,
          organizationId: input.organizationId,
          role: { in: ['OWNER', 'ADMIN'] },
        },
      })

      if (!membership) {
        throw new Error("You don't have permission to remove members")
      }

      // Can't remove the owner
      const targetMembership = await ctx.db.organizationMember.findUnique({
        where: {
          userId_organizationId: {
            userId: input.userId,
            organizationId: input.organizationId,
          },
        },
      })

      if (targetMembership?.role === 'OWNER') {
        throw new Error('Cannot remove the organization owner')
      }

      await ctx.db.organizationMember.delete({
        where: {
          userId_organizationId: {
            userId: input.userId,
            organizationId: input.organizationId,
          },
        },
      })

      return { success: true }
    }),
})
