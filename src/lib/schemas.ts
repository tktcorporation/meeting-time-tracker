import { z } from 'zod';

// Define agendaItemSchema
const agendaItemSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  plannedTime: z.number().int().positive(),
  actualTime: z.number().int().positive().optional(),
});

// Define agendaItemTemplateSchema
const agendaItemTemplateSchema = z.object({
  name: z.string().min(1),
  plannedTime: z.number().int().positive(),
});

// Define meetingTemplateSchema
const meetingTemplateSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  items: z.array(agendaItemTemplateSchema),
});

// Export inferred types
export type AgendaItem = z.infer<typeof agendaItemSchema>;
export type AgendaItemTemplate = z.infer<typeof agendaItemTemplateSchema>;
export type MeetingTemplate = z.infer<typeof meetingTemplateSchema>;

// Export the schemas
export { agendaItemSchema, meetingTemplateSchema, agendaItemTemplateSchema };
