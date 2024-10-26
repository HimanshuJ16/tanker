import { z } from 'zod'

export const VehicleSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2, 'Name must be at least 2 characters long'),
  address: z.string().min(5, 'Address must be at least 5 characters long'),
  contactNumber: z.string().min(10, 'Contact number must be at least 10 characters long'),
  email: z.string().email('Invalid email address'),
  vehicleNumber: z.string().min(5, 'Vehicle number must be at least 5 characters long'),
  vendorId: z.string().uuid('Invalid vendor ID'),
})

export type VehicleSchemaType = z.infer<typeof VehicleSchema>