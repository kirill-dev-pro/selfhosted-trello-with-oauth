import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'

export const wikiRouter = createTRPCRouter({
  // Get all wiki pages across all accessible projects
  getAll: protectedProcedure.query(async ({ ctx }) => {
    // Get user's organization
    const userMembership = await ctx.db.organizationMember.findFirst({
      where: { userId: ctx.user.id },
      include: {
        organization: {
          include: {
            projects: {
              include: {
                wikiPages: {
                  where: { published: true },
                  include: {
                    createdBy: true,
                    lastEditedBy: true,
                    project: {
                      select: {
                        id: true,
                        name: true,
                        color: true,
                      },
                    },
                  },
                  orderBy: { updatedAt: 'desc' },
                },
              },
            },
          },
        },
      },
    })

    if (!userMembership) {
      throw new Error("You don't have access to any organization")
    }

    // Flatten all wiki pages from all projects
    const allWikiPages = userMembership.organization.projects
      .flatMap((project) => project.wikiPages)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    return allWikiPages
  }),

  // Get all wiki pages for a project
  getByProject: protectedProcedure
    .input(z.object({ projectId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Check if user has access to this project
      const project = await ctx.db.project.findUnique({
        where: { id: input.projectId },
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

      const wikiPages = await ctx.db.wikiPage.findMany({
        where: {
          projectId: input.projectId,
          published: true,
        },
        include: {
          createdBy: true,
          lastEditedBy: true,
        },
        orderBy: { updatedAt: 'desc' },
      })

      return wikiPages
    }),

  // Get single wiki page
  getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const wikiPage = await ctx.db.wikiPage.findUnique({
      where: { id: input.id },
      include: {
        project: {
          include: {
            organization: {
              include: {
                members: {
                  where: { userId: ctx.user.id },
                },
              },
            },
          },
        },
        createdBy: true,
        lastEditedBy: true,
      },
    })

    if (!wikiPage) {
      throw new Error('Wiki page not found')
    }

    // Check if user has access to this wiki page
    if (wikiPage.project.organization.members.length === 0) {
      throw new Error("You don't have access to this wiki page")
    }

    return wikiPage
  }),

  // Get wiki page by slug
  getBySlug: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        slug: z.string(),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Check if user has access to this project
      const project = await ctx.db.project.findUnique({
        where: { id: input.projectId },
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

      const wikiPage = await ctx.db.wikiPage.findUnique({
        where: {
          projectId_slug: {
            projectId: input.projectId,
            slug: input.slug,
          },
        },
        include: {
          createdBy: true,
          lastEditedBy: true,
        },
      })

      if (!wikiPage) {
        throw new Error('Wiki page not found')
      }

      return wikiPage
    }),

  // Create wiki page
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        content: z.string(),
        slug: z
          .string()
          .min(1)
          .max(100)
          .regex(/^[a-z0-9-]+$/),
        projectId: z.string(),
        published: z.boolean().default(false),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has access to this project
      const project = await ctx.db.project.findUnique({
        where: { id: input.projectId },
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

      // Check if slug is unique within the project
      const existingPage = await ctx.db.wikiPage.findUnique({
        where: {
          projectId_slug: {
            projectId: input.projectId,
            slug: input.slug,
          },
        },
      })

      if (existingPage) {
        throw new Error('A wiki page with this slug already exists in this project')
      }

      const wikiPage = await ctx.db.wikiPage.create({
        data: {
          title: input.title,
          content: input.content,
          slug: input.slug,
          projectId: input.projectId,
          createdById: ctx.user.id,
          published: input.published,
        },
        include: {
          createdBy: true,
          lastEditedBy: true,
        },
      })

      return wikiPage
    }),

  // Create wiki page with auto-generated slug
  createSimple: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        content: z.string().default(''),
        projectId: z.string(),
        published: z.boolean().default(true),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has access to this project
      const project = await ctx.db.project.findUnique({
        where: { id: input.projectId },
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

      // Generate slug from title
      let baseSlug = input.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-')
        .substring(0, 50)
        .replace(/^-|-$/g, '')

      if (!baseSlug) {
        baseSlug = 'page'
      }

      // Ensure slug is unique
      let slug = baseSlug
      let counter = 1
      while (true) {
        const existingPage = await ctx.db.wikiPage.findUnique({
          where: {
            projectId_slug: {
              projectId: input.projectId,
              slug: slug,
            },
          },
        })

        if (!existingPage) {
          break
        }

        slug = `${baseSlug}-${counter}`
        counter++
      }

      const wikiPage = await ctx.db.wikiPage.create({
        data: {
          title: input.title,
          content: input.content,
          slug: slug,
          projectId: input.projectId,
          createdById: ctx.user.id,
          published: input.published,
        },
        include: {
          createdBy: true,
          lastEditedBy: true,
        },
      })

      return wikiPage
    }),

  // Update wiki page
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(200).optional(),
        content: z.string().optional(),
        slug: z
          .string()
          .min(1)
          .max(100)
          .regex(/^[a-z0-9-]+$/)
          .optional(),
        published: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has access to this wiki page
      const wikiPage = await ctx.db.wikiPage.findUnique({
        where: { id: input.id },
        include: {
          project: {
            include: {
              organization: {
                include: {
                  members: {
                    where: { userId: ctx.user.id },
                  },
                },
              },
            },
          },
        },
      })

      if (!wikiPage || wikiPage.project.organization.members.length === 0) {
        throw new Error("You don't have access to this wiki page")
      }

      // If updating slug, check if it's unique within the project
      if (input.slug && input.slug !== wikiPage.slug) {
        const existingPage = await ctx.db.wikiPage.findUnique({
          where: {
            projectId_slug: {
              projectId: wikiPage.projectId,
              slug: input.slug,
            },
          },
        })

        if (existingPage) {
          throw new Error('A wiki page with this slug already exists in this project')
        }
      }

      const updatedWikiPage = await ctx.db.wikiPage.update({
        where: { id: input.id },
        data: {
          title: input.title,
          content: input.content,
          slug: input.slug,
          published: input.published,
          lastEditedById: ctx.user.id,
        },
        include: {
          createdBy: true,
          lastEditedBy: true,
        },
      })

      return updatedWikiPage
    }),

  // Delete wiki page
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user has access to this wiki page
      const wikiPage = await ctx.db.wikiPage.findUnique({
        where: { id: input.id },
        include: {
          project: {
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
          },
        },
      })

      if (!wikiPage) {
        throw new Error('Wiki page not found')
      }

      // Check if user is creator or admin
      const isCreator = wikiPage.createdById === ctx.user.id
      const isAdmin = wikiPage.project.organization.members.length > 0

      if (!isCreator && !isAdmin) {
        throw new Error("You don't have permission to delete this wiki page")
      }

      await ctx.db.wikiPage.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  // Search wiki pages
  search: protectedProcedure
    .input(
      z.object({
        projectId: z.string(),
        query: z.string().min(1),
      }),
    )
    .query(async ({ ctx, input }) => {
      // Check if user has access to this project
      const project = await ctx.db.project.findUnique({
        where: { id: input.projectId },
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

      const wikiPages = await ctx.db.wikiPage.findMany({
        where: {
          projectId: input.projectId,
          published: true,
          OR: [
            {
              title: {
                contains: input.query,
                mode: 'insensitive',
              },
            },
            {
              content: {
                contains: input.query,
                mode: 'insensitive',
              },
            },
          ],
        },
        include: {
          createdBy: true,
          lastEditedBy: true,
        },
        orderBy: { updatedAt: 'desc' },
      })

      return wikiPages
    }),
})
