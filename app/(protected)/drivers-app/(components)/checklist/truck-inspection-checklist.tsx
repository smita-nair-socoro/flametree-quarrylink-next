'use client';

import { BaseChecklist, Question } from './base-checklist';

const VEHICLE_INSPECTION_QUESTIONS: Question[] = [
  // Engine & Mechanical
  {
    id: 'engine_oil_level',
    category: 'Engine & Mechanical',
    text: 'Engine oil level - is it within acceptable range?',
  },
  {
    id: 'coolant_level',
    category: 'Engine & Mechanical',
    text: 'Coolant level - is it adequate and no leaks visible?',
  },
  {
    id: 'hydraulic_fluid',
    category: 'Engine & Mechanical',
    text: 'Hydraulic fluid levels - are they sufficient?',
  },
  {
    id: 'air_filter',
    category: 'Engine & Mechanical',
    text: 'Air filter - is it clean and functioning properly?',
  },
  {
    id: 'belts_hoses',
    category: 'Engine & Mechanical',
    text: 'Belts and hoses - are they in good condition with no cracks or wear?',
  },
  {
    id: 'battery',
    category: 'Engine & Mechanical',
    text: 'Battery - is it secure and terminals clean?',
  },
  {
    id: 'engine_noise',
    category: 'Engine & Mechanical',
    text: 'Engine sounds normal with no unusual noises?',
  },

  // Brakes
  {
    id: 'service_brakes',
    category: 'Brakes',
    text: 'Service brakes - do they respond correctly and hold firm?',
  },
  {
    id: 'parking_brake',
    category: 'Brakes',
    text: 'Parking brake - does it engage and hold securely?',
  },
  {
    id: 'brake_pressure',
    category: 'Brakes',
    text: 'Air brake pressure - is it building to proper PSI (if applicable)?',
  },
  {
    id: 'brake_fluid',
    category: 'Brakes',
    text: 'Brake fluid level - is it adequate with no leaks?',
  },
  {
    id: 'brake_lines',
    category: 'Brakes',
    text: 'Brake lines and hoses - are they intact with no damage?',
  },

  // Lights & Signals
  {
    id: 'headlights',
    category: 'Lights & Signals',
    text: 'Headlights and taillights - are they all functioning?',
  },
  {
    id: 'indicators',
    category: 'Lights & Signals',
    text: 'Indicators and hazard lights - are they working correctly?',
  },
  {
    id: 'reverse_lights',
    category: 'Lights & Signals',
    text: 'Reverse lights and horn - are they operational?',
  },
  {
    id: 'dashboard_lights',
    category: 'Lights & Signals',
    text: 'Dashboard warning lights - are there any active alerts?',
  },

  // Tyres & Wheels
  {
    id: 'tyres',
    category: 'Tyres & Wheels',
    text: 'Tyre tread and pressure - are they within safe limits?',
  },
  {
    id: 'wheel_nuts',
    category: 'Tyres & Wheels',
    text: 'Wheel nuts and fixings - are they tight and secure?',
  },
  {
    id: 'spare_tyre',
    category: 'Tyres & Wheels',
    text: 'Spare tyre - is it present and in good condition?',
  },

  // Body & Safety
  {
    id: 'mirrors',
    category: 'Body & Safety',
    text: 'Mirrors - are all mirrors clean and properly adjusted?',
  },
  {
    id: 'seatbelt',
    category: 'Body & Safety',
    text: 'Seatbelt - is it functioning and undamaged?',
  },
  {
    id: 'load_restraints',
    category: 'Body & Safety',
    text: 'Load restraints - are chains, straps, and binders in good condition?',
  },
  {
    id: 'fire_extinguisher',
    category: 'Body & Safety',
    text: 'Fire extinguisher - is it present and within service date?',
  },
];

export default function TruckInspectionChecklist({ onSubmit }: { onSubmit?: () => void }) {
  return (
    <BaseChecklist
      title="Vehicle Inspection Checklist"
      subtitle="DD-25-00002"
      showBackButton={true}
      questions={VEHICLE_INSPECTION_QUESTIONS}
      alertMessage="Complete vehicle inspection for EXT-10042 before starting deliveries"
      submitButtonText="Confirm & Start Delivery"
      onSubmit={onSubmit}
    />
  );
}
