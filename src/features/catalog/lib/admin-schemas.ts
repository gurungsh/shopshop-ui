import { z } from 'zod'

// Catalog.Api/Validators: AdminCreateProductRequestValidator.cs and
// AdminCreateCategoryRequestValidator.cs. Same rules and messages.

export const productSchema = z.object({
  categoryId: z.string().min(1, 'Category is required.'),
  name: z
    .string()
    .trim()
    .min(1, 'Name is required.')
    .max(200, 'Name must not exceed 200 characters.'),
  description: z
    .string()
    .trim()
    .min(1, 'Description is required.')
    .max(2000, 'Description must not exceed 2000 characters.'),
  sku: z
    .string()
    .trim()
    .min(1, 'Sku is required.')
    .max(64, 'Sku must not exceed 64 characters.')
    .regex(
      /^[\w-]+$/,
      'Sku may only contain letters, numbers, hyphens, and underscores.',
    ),
  // Kept as the text of the field; the form sends it as a number
  price: z
    .string()
    .trim()
    .min(1, 'Price is required.')
    .refine((value) => Number(value) > 0, 'Price must be greater than 0.'),
  isActive: z.boolean(),
})

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required.')
    .max(200, 'Name must not exceed 200 characters.'),
  description: z
    .string()
    .trim()
    .max(2000, 'Description must not exceed 2000 characters.'),
  isActive: z.boolean(),
})

export type ProductValues = z.infer<typeof productSchema>
export type CategoryValues = z.infer<typeof categorySchema>
