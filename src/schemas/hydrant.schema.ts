import { z } from 'zod'

export const HydrantSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  address: z.string().min(5, 'Address must be at least 5 characters long'),
  contactNumber: z.string().min(10, 'Contact number must be at least 10 characters long'),
  email: z.string().email('Invalid email address'),
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
  vendorId: z.string().uuid('Invalid vendor ID'),
})

export type HydrantSchemaType = z.infer<typeof HydrantSchema>