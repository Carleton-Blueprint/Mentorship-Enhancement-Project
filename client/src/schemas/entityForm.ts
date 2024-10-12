import { z } from 'zod';

export const FormSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  preferredName: z.string().optional(),
  preferredPronouns: z.string().optional(),
  email: z.string().email(),
  entityNumber: z.string().min(9).max(9),
  yearLevel: z.string().min(1),
  major: z.string().min(1),
  courses: z.array(z.string()),
  availability: z.array(z.array(z.boolean())),
})

export const EntityIDSchema = z.object({
  entityID: z.string().min(1),
})

export const courseFormSchema = z.object({
  courseCode: z.string().min(1),
  courseName: z.string().optional(),
})

export const dateRangeFormSchema = z.object({
  startDate: z.date(),
  endDate: z.date(),
})
