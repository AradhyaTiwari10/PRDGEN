
import { z } from 'zod'

export const prdGenerationSchema = z.object({
  idea: z.string().min(10, 'Please provide a detailed product idea (at least 10 characters)'),
  category: z.string().min(1, 'Please select a category'),
  targetAudience: z.string().min(3, 'Please specify your target audience'),
})

export const prdUpdateSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  generated_prd: z.string().min(1, 'PRD content is required'),
  category: z.string().optional(),
  status: z.enum(['draft', 'final', 'archived']).optional(),
  is_favorite: z.boolean().optional(),
})

export type PRDGenerationData = z.infer<typeof prdGenerationSchema>
export type PRDUpdateData = z.infer<typeof prdUpdateSchema>
