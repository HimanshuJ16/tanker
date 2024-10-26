import { z } from 'zod'

export const CustomerSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  email: z.string().email('Invalid email address').optional().nullable(),
  contactNumber: z.string().min(10, 'Contact number must be at least 10 characters long'),
  address: z.string().min(5, 'Address must be at least 5 characters long'),
  type: z.enum(['government', 'private']),
  vendorId: z.string().uuid('Invalid vendor ID'),
  approved: z.boolean().optional(),
  active: z.boolean().optional(),
})

export type CustomerSchemaType = z.infer<typeof CustomerSchema>