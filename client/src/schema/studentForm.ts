import { z } from 'zod';

export const FormSchema = z.object({
  firstName: z.string(),
  lastName: z.string(),
  preferredName: z.string().optional(),
  preferredPronouns: z.string().optional(),
  email: z.string().email(),
  studentNumber: z.string().min(9).max(9),
  yearLevel: z.string(),
  major: z.string(),
  courses: z.array(z.string()).min(1),
})