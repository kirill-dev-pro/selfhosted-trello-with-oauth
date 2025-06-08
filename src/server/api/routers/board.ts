import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'

export const boardRouter = createTRPCRouter({
  // Get boards by project
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

      const boards = await ctx.db.board.findMany({
        where: { projectId: input.projectId },
        include: {
          lists: {
            include: {
              cards: true,
            },
            orderBy: { position: 'asc' },
          },
          createdBy: true,
        },
        orderBy: { createdAt: 'desc' },
      })

      return boards
    }),

  // Get board with lists and cards
  getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const board = await ctx.db.board.findUnique({
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
                comments: {
                  include: {
                    author: true,
                  },
                  orderBy: { createdAt: 'desc' },
                },
                wikiPages: {
                  include: {
                    wikiPage: {
                      include: {
                        project: true,
                      },
                    },
                  },
                },
              },
              orderBy: { position: 'asc' },
            },
          },
          orderBy: { position: 'asc' },
        },
        createdBy: true,
      },
    })

    if (!board) {
      throw new Error('Board not found')
    }

    // Check if user has access to this board
    if (board.project.organization.members.length === 0) {
      throw new Error("You don't have access to this board")
    }

    return board
  }),

  // Create board
  create: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().optional(),
        projectId: z.string(),
        visibility: z.enum(['PRIVATE', 'ORGANIZATION', 'PUBLIC']).default('ORGANIZATION'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has access to the project
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

      const board = await ctx.db.board.create({
        data: {
          name: input.name,
          description: input.description,
          projectId: input.projectId,
          createdById: ctx.user.id,
          visibility: input.visibility,
          lists: {
            create: [
              { name: 'To Do', position: 0 },
              { name: 'In Progress', position: 1 },
              { name: 'Done', position: 2 },
            ],
          },
        },
        include: {
          lists: {
            orderBy: { position: 'asc' },
          },
        },
      })

      return board
    }),

  // Update board
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(100).optional(),
        description: z.string().optional(),
        visibility: z.enum(['PRIVATE', 'ORGANIZATION', 'PUBLIC']).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has access to this board
      const board = await ctx.db.board.findUnique({
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

      if (!board || board.project.organization.members.length === 0) {
        throw new Error("You don't have access to this board")
      }

      const updatedBoard = await ctx.db.board.update({
        where: { id: input.id },
        data: {
          name: input.name,
          description: input.description,
          visibility: input.visibility,
        },
      })

      return updatedBoard
    }),

  // Delete board
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is the creator or has admin rights
      const board = await ctx.db.board.findUnique({
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

      if (!board) {
        throw new Error('Board not found')
      }

      // Check if user is creator or admin
      const isCreator = board.createdById === ctx.user.id
      const isAdmin = board.project.organization.members.length > 0

      if (!isCreator && !isAdmin) {
        throw new Error("You don't have permission to delete this board")
      }

      await ctx.db.board.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  // Create list
  createList: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        name: z.string().min(1).max(100),
        position: z.number().int().min(0),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has access to this board
      const board = await ctx.db.board.findUnique({
        where: { id: input.boardId },
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

      if (!board || board.project.organization.members.length === 0) {
        throw new Error("You don't have access to this board")
      }

      const list = await ctx.db.list.create({
        data: {
          name: input.name,
          position: input.position,
          boardId: input.boardId,
        },
      })

      return list
    }),

  // Update list
  updateList: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1).max(100).optional(),
        position: z.number().int().min(0).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has access to this list's board
      const list = await ctx.db.list.findUnique({
        where: { id: input.id },
        include: {
          board: {
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
          },
        },
      })

      if (!list || list.board.project.organization.members.length === 0) {
        throw new Error("You don't have access to this list")
      }

      const updatedList = await ctx.db.list.update({
        where: { id: input.id },
        data: {
          name: input.name,
          position: input.position,
        },
      })

      return updatedList
    }),

  // Delete list
  deleteList: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user has access to this list's board
      const list = await ctx.db.list.findUnique({
        where: { id: input.id },
        include: {
          board: {
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
          },
        },
      })

      if (!list || list.board.project.organization.members.length === 0) {
        throw new Error("You don't have access to this list")
      }

      await ctx.db.list.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),
})
