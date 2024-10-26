import { ZodType, z } from 'zod'

export type UserRegistrationProps = {
  district: string
  role: string
  fullname: string
  username: string
  email: string | null
  password: string
  confirmPassword: string
  contactNumber: string | null
  parentId?: string // Add this line
}

export const UserRegistrationSchema: ZodType<UserRegistrationProps> = z
  .object({
    district: z.string().min(1, 'Please select a district'),
    role: z.enum(['se', 'xen', 'aen', 'jen', 'vendor', 'contractor'], {
      required_error: 'Please select a role',
    }),
    fullname: z
      .string()
      .min(4, { message: 'Your full name must be at least 4 characters long' }),
    username: z
      .string()
      .min(3, { message: 'Username must be at least 3 characters long' })
      .max(20, { message: 'Username must not exceed 20 characters' })
      .regex(/^[a-zA-Z0-9_-]+$/, { message: 'Username can only contain letters, numbers, underscores, and hyphens' }),
    email: z.string().email({ message: 'Incorrect email format' }).nullable(),
    password: z
      .string()
      .min(8, { message: 'Your password must be at least 8 characters long' })
      .max(64, {
        message: 'Your password cannot be longer than 64 characters',
      })
      .refine(
        (value) => /^[a-zA-Z0-9_.-]*$/.test(value ?? ''),
        'Password should contain only alphabets, numbers, underscores, periods, and hyphens'
      ),
    confirmPassword: z.string(),
    contactNumber: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, { message: 'Please enter a valid phone number' })
      .nullable(),
    parentId: z.string().optional(),
  })
  .refine((schema) => schema.password === schema.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine(
    (schema) => {
      if (['aen', 'jen', 'vendor'].includes(schema.role)) {
        return !!schema.parentId;
      }
      return true;
    },
    {
      message: 'Parent ID is required for AEN, JEN, and Vendor roles',
      path: ['parentId'],
    }
  )

export type UserLoginProps = {
  username: string
  password: string
}

export const UserLoginSchema: ZodType<UserLoginProps> = z.object({
  username: z.string().min(3, { message: 'Username must be at least 3 characters long' }),
  password: z
    .string()
    .min(8, { message: 'Your password must be at least 8 characters long' })
    .max(64, {
      message: 'Your password cannot be longer than 64 characters',
    }),
})

export type ChangePasswordProps = {
  oldPassword: string;
  newPassword: string;
  confirmNewPassword: string;
}

export const ChangePasswordSchema: ZodType<ChangePasswordProps> = z.object({
  oldPassword: z.string().min(1, "Old password is required"),
  newPassword: z
    .string()
    .min(8, { message: 'Your new password must be at least 8 characters long' })
    .max(64, { message: 'Your new password cannot be longer than 64 characters' })
    .refine(
      (value) => /^[a-zA-Z0-9_.-]*$/.test(value ?? ''),
      'Password should contain only alphabets, numbers, underscores, periods, and hyphens'
    ),
  confirmNewPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmNewPassword, {
  message: "Passwords don't match",
  path: ["confirmNewPassword"],
});