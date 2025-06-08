import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'

export const projectRouter = createTRPCRouter({
  // Get all projects in organization
  getAll: protectedProcedure
    .input(z.object({ organizationId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Check if user is member of organization
      const membership = await ctx.db.organizationMember.findFirst({
        where: {
          userId: ctx.user.id,
          organizationId: input.organizationId,
        },
      })

      if (!membership) {
        throw new Error("You don't have access to this organization")
      }

      const projects = await ctx.db.project.findMany({
        where: { organizationId: input.organizationId },
        include: {
          boards: {
            include: {
              lists: {
                include: {
                  cards: true,
                },
              },
            },
          },
          wikiPages: true,
        },
        orderBy: { createdAt: 'desc' },
      })

      return projects
    }),

  // Get single project
  getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const project = await ctx.db.project.findUnique({
      where: { id: input.id },
      include: {
        organization: {
          include: {
            members: {
              where: { userId: ctx.user.id },
            },
          },
        },
        boards: {
          include: {
            lists: {
              include: {
                cards: {
                  include: {
                    assignedTo: true,
                    createdBy: true,
                    labels: {
                      include: {
                        label: true,
                      },
                    },
                  },
                },
              },
              orderBy: { position: 'asc' },
            },
          },
        },
        wikiPages: {
          where: { published: true },
          orderBy: { updatedAt: 'desc' },
        },
      },
    })

    if (!project) {
      throw new Error('Project not found')
    }

    // Check if user has access to this project
    if (project.organization.members.length === 0) {
      throw new Error("You don't have access to this project")
    }

    return project
  }),

  // Create project
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().optional(),
        color: z
          .string()
          .regex(/^#[0-9A-F]{6}$/i)
          .optional(),
        organizationId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is member of organization
      const membership = await ctx.db.organizationMember.findFirst({
        where: {
          userId: ctx.user.id,
          organizationId: input.organizationId,
        },
      })

      if (!membership) {
        throw new Error("You don't have access to this organization")
      }

      const project = await ctx.db.project.create({
        data: {
          name: input.name,
          description: input.description,
          color: input.color ?? '#3b82f6',
          organizationId: input.organizationId,
        },
      })

      return project
    }),

  // Update project
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
        color: z
          .string()
          .regex(/^#[0-9A-F]{6}$/i)
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has access to this project
      const project = await ctx.db.project.findUnique({
        where: { id: input.id },
        include: {
          organization: {
            include: {
              members: {
                where: { userId: ctx.user.id },
              },
            },
          },
        },
      })

      if (!project || project.organization.members.length === 0) {
        throw new Error("You don't have access to this project")
      }

      const updatedProject = await ctx.db.project.update({
        where: { id: input.id },
        data: {
          name: input.name,
          description: input.description,
          color: input.color,
        },
      })

      return updatedProject
    }),

  // Delete project
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is admin or owner of organization
      const project = await ctx.db.project.findUnique({
        where: { id: input.id },
        include: {
          organization: {
            include: {
              members: {
                where: {
                  userId: ctx.user.id,
                  role: { in: ['OWNER', 'ADMIN'] },
                },
              },
            },
          },
        },
      })

      if (!project || project.organization.members.length === 0) {
        throw new Error("You don't have permission to delete this project")
      }

      await ctx.db.project.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),
})
