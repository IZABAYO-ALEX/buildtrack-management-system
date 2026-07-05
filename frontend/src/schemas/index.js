import { z } from 'zod';

export const projectSchema = z.object({
  name: z.string().min(3, 'Project name must be at least 3 characters').max(255),
  clientName: z.string().optional(),
  description: z.string().optional(),
  location: z.string().optional(),
  budget: z.number().positive('Budget must be greater than 0').min(1, 'Budget must be at least 1'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  status: z.enum(['planning', 'active', 'completed', 'suspended']).default('planning')
});

export const expenseSchema = z.object({
  projectId: z.string().uuid('Please select a project'),
  category: z.string().min(2, 'Category must be at least 2 characters').max(100),
  amount: z.number().positive('Amount must be greater than 0').min(1, 'Amount must be at least 1'),
  description: z.string().min(5, 'Description must be at least 5 characters'),
  date: z.string().optional(),
  receiptUrl: z.string().optional(),
  status: z.enum(['pending', 'approved', 'rejected']).default('pending')
});

export const workerSchema = z.object({
  fullName: z.string().min(3, 'Full name must be at least 3 characters').max(255),
  phone: z.string().optional(),
  role: z.string().min(2, 'Role must be at least 2 characters').max(100),
  rate: z.number().positive('Rate must be greater than 0').min(1, 'Rate must be at least 1'),
  projectId: z.string().uuid('Please select a project'),
  isActive: z.boolean().default(true)
});
