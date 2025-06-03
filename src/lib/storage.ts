import { z } from 'zod';
import {
  agendaItemSchema,
  meetingTemplateSchema,
  type AgendaItem,
  type MeetingTemplate,
} from './schemas';

const AGENDA_ITEMS_KEY = 'meetingTimeTracker_agendaItems';
const MEETING_TEMPLATES_KEY = 'meetingTimeTracker_meetingTemplates';

// Function to save agenda items
export function saveAgendaItems(items: AgendaItem[]): void {
  localStorage.setItem(AGENDA_ITEMS_KEY, JSON.stringify(items));
}

// Function to load agenda items
export function loadAgendaItems(): AgendaItem[] {
  const itemsJson = localStorage.getItem(AGENDA_ITEMS_KEY);
  if (itemsJson === null) {
    return [];
  }
  try {
    const parsedItems = JSON.parse(itemsJson);
    const validationResult = z.array(agendaItemSchema).safeParse(parsedItems);
    if (validationResult.success) {
      return validationResult.data;
    } else {
      console.error('Error validating agenda items from localStorage:', validationResult.error);
      return [];
    }
  } catch (error) {
    console.error('Error parsing agenda items from localStorage:', error);
    return [];
  }
}

// Function to save meeting templates
export function saveMeetingTemplates(templates: MeetingTemplate[]): void {
  localStorage.setItem(MEETING_TEMPLATES_KEY, JSON.stringify(templates));
}

// Function to load meeting templates
export function loadMeetingTemplates(): MeetingTemplate[] {
  const templatesJson = localStorage.getItem(MEETING_TEMPLATES_KEY);
  if (templatesJson === null) {
    return [];
  }
  try {
    const parsedTemplates = JSON.parse(templatesJson);
    const validationResult = z.array(meetingTemplateSchema).safeParse(parsedTemplates);
    if (validationResult.success) {
      return validationResult.data;
    } else {
      console.error('Error validating meeting templates from localStorage:', validationResult.error);
      return [];
    }
  } catch (error) {
    console.error('Error parsing meeting templates from localStorage:', error);
    return [];
  }
}
