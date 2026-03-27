'use client';

import { BaseChecklist, Question } from './base-checklist';

const DAILY_COMPLIANCE_QUESTIONS: Question[] = [
  // Health & Wellness
  {
    id: 'sleep',
    category: 'Health & Wellness',
    text: 'Have you had adequate sleep (7+ hours)?',
  },
  {
    id: 'fit',
    category: 'Health & Wellness',
    text: 'Are you feeling physically fit to drive?',
  },
  {
    id: 'alcohol',
    category: 'Health & Wellness',
    text: 'Have you consumed alcohol in the last 24 hours?',
  },
  {
    id: 'meds',
    category: 'Health & Wellness',
    text: 'Are you taking any medications that may affect driving?',
  },

  // Documentation
  {
    id: 'license',
    category: 'Documentation',
    text: "Do you have a valid driver's license?",
  },
  {
    id: 'registration',
    category: 'Documentation',
    text: 'Do you have vehicle registration and insurance documents?',
  },

  // Route Planning
  {
    id: 'route_schedule',
    category: 'Route Planning',
    text: "Have you reviewed today's delivery schedule and route?",
  },
  {
    id: 'traffic_weather',
    category: 'Route Planning',
    text: 'Are you aware of any traffic or weather conditions?',
  },

  // Safety Protocols
  {
    id: 'safety_protocols',
    category: 'Safety Protocols',
    text: "Do you understand all safety protocols for today's deliveries?",
  },
];

export default function DriverPreStartChecklist({ onSubmit }: { onSubmit?: () => void }) {
  return (
    <BaseChecklist
      questions={DAILY_COMPLIANCE_QUESTIONS}
      alertMessage="Complete this checklist before starting your deliveries"
      submitButtonText="Submit Checklist"
      onSubmit={onSubmit}
    />
  );
}
