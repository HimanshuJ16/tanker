import { z } from 'zod'

export const DestinationSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  address: z.string().min(5, 'Address must be at least 5 characters long'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  agree: z.boolean(),
  active: z.boolean(),
  approved: z.boolean(),
  vendorId: z.string().uuid('Invalid vendor ID'),
})

export type DestinationSchemaType = z.infer<typeof DestinationSchema>