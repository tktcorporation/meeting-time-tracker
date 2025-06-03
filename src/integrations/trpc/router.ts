// import { TRPCError } from '@trpc/server'
import type { TRPCRouterRecord } from '@trpc/server'
import { z } from 'zod'

import { createTRPCRouter, publicProcedure } from './init'

const meetingRouter = {
  create: publicProcedure
    .input(z.object({
      title: z.string().min(1),
      duration: z.number().positive(),
      participants: z.array(z.string()).min(1),
    }))
    .mutation(async ({ input }) => {
      // TODO: 実際のデータベースへの保存処理を実装
      return {
        id: Date.now().toString(),
        ...input,
        createdAt: new Date(),
      }
    }),
  
  list: publicProcedure.query(async () => {
    // TODO: 実際のデータベースからの取得処理を実装
    return []
  }),
  
  updateProgress: publicProcedure
    .input(z.object({
      meetingId: z.string(),
      elapsedTime: z.number(),
      status: z.enum(['active', 'paused', 'completed']),
    }))
    .mutation(async ({ input }) => {
      // TODO: 実際の進行状況更新処理を実装
      return {
        success: true,
        ...input,
      }
    }),
} satisfies TRPCRouterRecord

export const trpcRouter = createTRPCRouter({
  meeting: meetingRouter,
})
export type TRPCRouter = typeof trpcRouter