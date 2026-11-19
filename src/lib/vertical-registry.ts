import { VerticalType, VerticalModuleDefinition } from './verticals/types';
import { milkHandler } from './verticals/milk';
import { kiranaHandler } from './verticals/kirana';
import { vegetableHandler } from './verticals/vegetable';
import { clinicHandler } from './verticals/clinic';
import { agricultureHandler } from './verticals/agriculture';

export * from './verticals/types';

const VERTICAL_REGISTRY: Record<VerticalType, VerticalModuleDefinition> = {
  milk_delivery: {
    id: 'milk_delivery',
    displayName: 'Milk Delivery',
    shortDescription: 'Recurring doorstep milk delivery, subscriptions, cutoffs, and pause schedules',
    routePath: '/milk',
    iconName: 'Milk',
    status: 'active_reference',
    statusBadgeLabel: 'Active Reference Workflow',
    description: 'The canonical daily delivery workflow with 20:00:00 IST cutoff protection, vacation holds, and route fulfillment manifests.',
    supportedIntents: [
      'PAUSE_DELIVERY',
      'RESUME_DELIVERY',
      'UPDATE_QUANTITY',
      'CHECK_SUBSCRIPTION_STATUS',
    ],
    sampleTranscripts: [
      {
        language: 'Hinglish',
        text: 'Bhaiya kal subah doodh mat dena, hum 3 din ke liye gaon ja rahe hain',
        intent: 'PAUSE_DELIVERY',
        expectedAction: 'Pause delivery for 3 days starting tomorrow',
      },
      {
        language: 'Hindi',
        text: 'कल सुबह आधा लीटर दूध बढ़ा देना, मेहमान आ रहे हैं',
        intent: 'UPDATE_QUANTITY',
        expectedAction: 'Update quantity by +500ml for tomorrow',
      },
      {
        language: 'English',
        text: 'Please resume regular 1 litre cow milk delivery starting Monday',
        intent: 'RESUME_DELIVERY',
        expectedAction: 'Resume standard 1000ml delivery',
      },
    ],
    validateProposal: (payload) => milkHandler.validateProposal(payload),
    applyTransaction: (db, submissionId, payload, actorId) => milkHandler.applyTransaction(db, submissionId, payload, actorId),
  },

  kirana: {
    id: 'kirana',
    displayName: 'Kirana Store',
    shortDescription: 'Neighborhood grocery ordering, multilingual catalog alias resolution, and line items',
    routePath: '/kirana',
    iconName: 'Store',
    status: 'foundation_ready',
    statusBadgeLabel: 'Foundation Ready',
    description: 'Voice ordering for local groceries with multi-word alias resolution (shakkar = sugar, chawal = rice) and integer paise pricing.',
    supportedIntents: [
      'CREATE_ORDER',
      'ADD_ITEMS',
      'RESOLVE_CATALOG',
      'CHECK_ORDER_STATUS',
    ],
    sampleTranscripts: [
      {
        language: 'Hinglish',
        text: 'Bhaiya do packet maggi, ek kilo shakkar aur ek packet tata namak bhej dena',
        intent: 'CREATE_ORDER',
        expectedAction: 'Order 2x Maggi, 1kg Sugar, 1x Tata Salt',
      },
      {
        language: 'Hindi',
        text: 'फॉर्च्यून सनफ्लावर तेल एक लीटर और दो किलो बासमती चावल भिजवा दो',
        intent: 'CREATE_ORDER',
        expectedAction: 'Order 1L Fortune Oil, 2kg Basmati Rice',
      },
    ],
    validateProposal: (payload) => kiranaHandler.validateProposal(payload),
    applyTransaction: (db, submissionId, payload, actorId) => kiranaHandler.applyTransaction(db, submissionId, payload, actorId),
  },

  vegetable_vendor: {
    id: 'vegetable_vendor',
    displayName: 'Vegetable Vendor',
    shortDescription: 'Fresh mandi produce orders, flexible weight units (kg, grams, bundles), and fulfillment lists',
    routePath: '/vegetables',
    iconName: 'Carrot',
    status: 'foundation_ready',
    statusBadgeLabel: 'Foundation Ready',
    description: 'Dynamic weight unit translation (bundles of dhaniya, grams of adrak, kg of aloo) with floating market pricing and packing lists.',
    supportedIntents: [
      'CREATE_ORDER',
      'RESOLVE_PRODUCE',
      'CHECK_MARKET_RATES',
    ],
    sampleTranscripts: [
      {
        language: 'Hinglish',
        text: 'Do kilo aloo, ek kilo tamatar, do gaddi dhaniya aur 250 gram adrak dena',
        intent: 'CREATE_ORDER',
        expectedAction: 'Basket: 2kg Potato, 1kg Tomato, 2 bundles Coriander, 250g Ginger',
      },
      {
        language: 'Hindi',
        text: 'आज ताजी पालक है क्या? दो गड्डी पालक और आधा किलो भिंडी रख देना',
        intent: 'CREATE_ORDER',
        expectedAction: 'Basket: 2 bundles Spinach, 500g Okra',
      },
    ],
    validateProposal: (payload) => vegetableHandler.validateProposal(payload),
    applyTransaction: (db, submissionId, payload, actorId) => vegetableHandler.applyTransaction(db, submissionId, payload, actorId),
  },

  clinic: {
    id: 'clinic',
    displayName: 'Clinic Appointments',
    shortDescription: 'Outpatient appointment booking, doctor schedules, and slot availability with strict privacy',
    routePath: '/clinic',
    iconName: 'Stethoscope',
    status: 'foundation_ready',
    statusBadgeLabel: 'Foundation Ready',
    description: 'Voice appointment scheduling with doctor slot allocation and strict non-diagnostic data boundaries (zero clinical storage).',
    supportedIntents: [
      'BOOK_APPOINTMENT',
      'RESCHEDULE_APPOINTMENT',
      'CANCEL_APPOINTMENT',
      'CHECK_DOCTOR_SLOTS',
    ],
    sampleTranscripts: [
      {
        language: 'Hinglish',
        text: 'Dr. Ramesh Rao ke saath kal subah 10 baje ka appointment book kar do',
        intent: 'BOOK_APPOINTMENT',
        expectedAction: 'Book slot 10:00 AM with Dr. Ramesh Rao',
      },
      {
        language: 'Hindi',
        text: 'बच्चों के डॉक्टर डॉ. स्नेहा वर्मा शुक्रवार शाम को उपलब्ध हैं क्या?',
        intent: 'CHECK_DOCTOR_SLOTS',
        expectedAction: 'Check Friday evening slots for Dr. Sneha Verma',
      },
    ],
    validateProposal: (payload) => clinicHandler.validateProposal(payload),
    applyTransaction: (db, submissionId, payload, actorId) => clinicHandler.applyTransaction(db, submissionId, payload, actorId),
  },

  agriculture: {
    id: 'agriculture',
    displayName: 'Agri Procurement',
    shortDescription: 'Farm produce procurement offers, volume estimation in quintals, and farm-gate pickup scheduling',
    routePath: '/agriculture',
    iconName: 'Tractor',
    status: 'foundation_ready',
    statusBadgeLabel: 'Foundation Ready',
    description: 'Farmer-to-procurement workflow for registering harvest crop offers, quintal lot estimation, and mandi collection routes.',
    supportedIntents: [
      'REGISTER_PROCUREMENT_OFFER',
      'SCHEDULE_PICKUP',
      'CHECK_CROP_MANDI_RATES',
    ],
    sampleTranscripts: [
      {
        language: 'Hinglish',
        text: 'Hamare paas 25 quintal sharbati gehun ready hai, somwar ko khet se pickup karwa lijiye',
        intent: 'REGISTER_PROCUREMENT_OFFER',
        expectedAction: 'Offer 25 quintals Sharbati Wheat for Monday pickup',
      },
      {
        language: 'Hindi',
        text: '15 क्विंटल हाइब्रिड टमाटर तैयार है, क्या भाव मिलेगा और गाड़ी कब आएगी?',
        intent: 'REGISTER_PROCUREMENT_OFFER',
        expectedAction: 'Offer 15 quintals Hybrid Tomato with rate quote',
      },
    ],
    validateProposal: (payload) => agricultureHandler.validateProposal(payload),
    applyTransaction: (db, submissionId, payload, actorId) => agricultureHandler.applyTransaction(db, submissionId, payload, actorId),
  },
};

export function getVerticalModule(id: string): VerticalModuleDefinition | null {
  if (id in VERTICAL_REGISTRY) {
    return VERTICAL_REGISTRY[id as VerticalType];
  }
  return null;
}

export function getAllVerticalModules(): VerticalModuleDefinition[] {
  return Object.values(VERTICAL_REGISTRY);
}

export function isValidVertical(id: string): id is VerticalType {
  return id in VERTICAL_REGISTRY;
}
