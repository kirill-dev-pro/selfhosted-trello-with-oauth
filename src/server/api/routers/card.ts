import { z } from 'zod'
import { createTRPCRouter, protectedProcedure } from '~/server/api/trpc'

export const cardRouter = createTRPCRouter({
  // Get card with details
  getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const card = await ctx.db.card.findUnique({
      where: { id: input.id },
      include: {
        list: {
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
        },
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
                createdBy: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })

    if (!card) {
      throw new Error('Card not found')
    }

    // Check if user has access to this card
    if (card.list.board.project.organization.members.length === 0) {
      throw new Error("You don't have access to this card")
    }

    return card
  }),

  // Create card
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1).max(200),
        description: z.string().optional(),
        listId: z.string(),
        position: z.number().int().min(0),
        assignedToId: z.string().optional(),
        dueDate: z.date().optional(),
        priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has access to this list
      const list = await ctx.db.list.findUnique({
        where: { id: input.listId },
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

      // If assignedToId is provided, check if that user is in the organization
      if (input.assignedToId) {
        const assignedUser = await ctx.db.organizationMember.findFirst({
          where: {
            userId: input.assignedToId,
            organizationId: list.board.project.organizationId,
          },
        })

        if (!assignedUser) {
          throw new Error('Assigned user is not a member of this organization')
        }
      }

      const card = await ctx.db.card.create({
        data: {
          title: input.title,
          description: input.description,
          listId: input.listId,
          position: input.position,
          assignedToId: input.assignedToId,
          createdById: ctx.user.id,
          dueDate: input.dueDate,
          priority: input.priority,
        },
        include: {
          assignedTo: true,
          createdBy: true,
          labels: {
            include: {
              label: true,
            },
          },
        },
      })

      return card
    }),

  // Update card
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().min(1).max(200).optional(),
        description: z.string().optional(),
        listId: z.string().optional(),
        position: z.number().int().min(0).optional(),
        assignedToId: z.string().optional(),
        dueDate: z.date().optional(),
        priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has access to this card
      const card = await ctx.db.card.findUnique({
        where: { id: input.id },
        include: {
          list: {
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
          },
        },
      })

      if (!card || card.list.board.project.organization.members.length === 0) {
        throw new Error("You don't have access to this card")
      }

      // If moving to a different list, check access to that list too
      if (input.listId && input.listId !== card.listId) {
        const targetList = await ctx.db.list.findUnique({
          where: { id: input.listId },
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

        if (!targetList || targetList.board.project.organization.members.length === 0) {
          throw new Error("You don't have access to the target list")
        }
      }

      // If assignedToId is provided, check if that user is in the organization
      if (input.assignedToId) {
        const assignedUser = await ctx.db.organizationMember.findFirst({
          where: {
            userId: input.assignedToId,
            organizationId: card.list.board.project.organizationId,
          },
        })

        if (!assignedUser) {
          throw new Error('Assigned user is not a member of this organization')
        }
      }

      const updatedCard = await ctx.db.card.update({
        where: { id: input.id },
        data: {
          title: input.title,
          description: input.description,
          listId: input.listId,
          position: input.position,
          assignedToId: input.assignedToId,
          dueDate: input.dueDate,
          priority: input.priority,
        },
        include: {
          assignedTo: true,
          createdBy: true,
          labels: {
            include: {
              label: true,
            },
          },
        },
      })

      return updatedCard
    }),

  // Delete card
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user has access to this card
      const card = await ctx.db.card.findUnique({
        where: { id: input.id },
        include: {
          list: {
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
          },
        },
      })

      if (!card || card.list.board.project.organization.members.length === 0) {
        throw new Error("You don't have access to this card")
      }

      await ctx.db.card.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  // Add comment to card
  addComment: protectedProcedure
    .input(
      z.object({
        cardId: z.string(),
        content: z.string().min(1).max(1000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has access to this card
      const card = await ctx.db.card.findUnique({
        where: { id: input.cardId },
        include: {
          list: {
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
          },
        },
      })

      if (!card || card.list.board.project.organization.members.length === 0) {
        throw new Error("You don't have access to this card")
      }

      const comment = await ctx.db.comment.create({
        data: {
          content: input.content,
          cardId: input.cardId,
          authorId: ctx.user.id,
        },
        include: {
          author: true,
        },
      })

      return comment
    }),

  // Update comment
  updateComment: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        content: z.string().min(1).max(1000),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user is the author of this comment
      const comment = await ctx.db.comment.findUnique({
        where: { id: input.id },
        include: {
          card: {
            include: {
              list: {
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
              },
            },
          },
        },
      })

      if (!comment) {
        throw new Error('Comment not found')
      }

      if (comment.authorId !== ctx.user.id) {
        throw new Error('You can only edit your own comments')
      }

      if (comment.card.list.board.project.organization.members.length === 0) {
        throw new Error("You don't have access to this comment")
      }

      const updatedComment = await ctx.db.comment.update({
        where: { id: input.id },
        data: {
          content: input.content,
        },
        include: {
          author: true,
        },
      })

      return updatedComment
    }),

  // Delete comment
  deleteComment: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      // Check if user is the author of this comment
      const comment = await ctx.db.comment.findUnique({
        where: { id: input.id },
        include: {
          card: {
            include: {
              list: {
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
              },
            },
          },
        },
      })

      if (!comment) {
        throw new Error('Comment not found')
      }

      if (comment.authorId !== ctx.user.id) {
        throw new Error('You can only delete your own comments')
      }

      if (comment.card.list.board.project.organization.members.length === 0) {
        throw new Error("You don't have access to this comment")
      }

      await ctx.db.comment.delete({
        where: { id: input.id },
      })

      return { success: true }
    }),

  // Add wiki page reference to card
  addWikiPageReference: protectedProcedure
    .input(
      z.object({
        cardId: z.string(),
        wikiPageId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has access to this card
      const card = await ctx.db.card.findUnique({
        where: { id: input.cardId },
        include: {
          list: {
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
          },
        },
      })

      if (!card || card.list.board.project.organization.members.length === 0) {
        throw new Error("You don't have access to this card")
      }

      // Check if wiki page exists and user has access to it
      const wikiPage = await ctx.db.wikiPage.findUnique({
        where: { id: input.wikiPageId },
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

      // Check if reference already exists
      const existingReference = await ctx.db.cardWikiPage.findUnique({
        where: {
          cardId_wikiPageId: {
            cardId: input.cardId,
            wikiPageId: input.wikiPageId,
          },
        },
      })

      if (existingReference) {
        throw new Error('Wiki page is already referenced by this card')
      }

      const reference = await ctx.db.cardWikiPage.create({
        data: {
          cardId: input.cardId,
          wikiPageId: input.wikiPageId,
        },
        include: {
          wikiPage: {
            include: {
              project: true,
            },
          },
        },
      })

      return reference
    }),

  // Remove wiki page reference from card
  removeWikiPageReference: protectedProcedure
    .input(
      z.object({
        cardId: z.string(),
        wikiPageId: z.string(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      // Check if user has access to this card
      const card = await ctx.db.card.findUnique({
        where: { id: input.cardId },
        include: {
          list: {
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
          },
        },
      })

      if (!card || card.list.board.project.organization.members.length === 0) {
        throw new Error("You don't have access to this card")
      }

      await ctx.db.cardWikiPage.delete({
        where: {
          cardId_wikiPageId: {
            cardId: input.cardId,
            wikiPageId: input.wikiPageId,
          },
        },
      })

      return { success: true }
    }),

  // Get available wiki pages for card (from same project or organization)
  getAvailableWikiPages: protectedProcedure
    .input(z.object({ cardId: z.string() }))
    .query(async ({ ctx, input }) => {
      // Check if user has access to this card and get project info
      const card = await ctx.db.card.findUnique({
        where: { id: input.cardId },
        include: {
          list: {
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
          },
          wikiPages: {
            include: {
              wikiPage: true,
            },
          },
        },
      })

      if (!card || card.list.board.project.organization.members.length === 0) {
        throw new Error("You don't have access to this card")
      }

      // Get all wiki pages from the same project that are not already referenced
      const referencedWikiPageIds = card.wikiPages.map((ref) => ref.wikiPageId)

      const availableWikiPages = await ctx.db.wikiPage.findMany({
        where: {
          projectId: card.list.board.project.id,
          published: true,
          id: {
            notIn: referencedWikiPageIds,
          },
        },
        include: {
          project: true,
          createdBy: true,
        },
        orderBy: { updatedAt: 'desc' },
      })

      return availableWikiPages
    }),
})
