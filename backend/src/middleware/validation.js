import { z } from 'zod';

export const validate = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        errors: error.errors
      });
    }
  };
};

export const projectSchema = z.object({
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  budget: z.number().positive().optional(),
  location: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['active', 'on_hold', 'completed', 'cancelled']).optional()
});

export const expenseSchema = z.object({
  projectId: z.string().uuid(),
  category: z.string().min(1).max(100),
  amount: z.number().positive(),
  description: z.string().min(1),
  date: z.string().optional(),
  receiptUrl: z.string().optional()
});

export const workerSchema = z.object({
  fullName: z.string().min(1).max(255),
  phone: z.string().optional(),
  role: z.string().min(1).max(100),
  rate: z.number().positive().optional(),
  projectId: z.string().uuid(),
  isActive: z.boolean().optional()
});
