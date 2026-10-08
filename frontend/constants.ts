import { MockOrder } from './types';

export const MOCK_ORDERS: MockOrder[] = [
  {
    orderId: 'Order 9024',
    date: '3 days ago',
    status: 'Delivered',
    trackingNumber: 'TRK 882194US',
    carrier: 'FedEx Express',
    returnWindowDays: 30,
    items: [
      { id: 'item 1', name: 'AeroTune Pro Wireless ANC Headphones', price: 179.99, quantity: 1, eligibleForReturn: true },
      { id: 'item 2', name: 'Braided Fast Charging USB C Cable 2m', price: 14.50, quantity: 2, eligibleForReturn: true }
    ]
  },
  {
    orderId: 'Order 7715',
    date: 'Yesterday',
    status: 'In Transit',
    trackingNumber: 'TRK 554109US',
    carrier: 'UPS Ground',
    estimatedDelivery: 'Tomorrow by 7:00 PM',
    returnWindowDays: 30,
    items: [
      { id: 'item 3', name: 'ErgoWave Mechanical Desk Keyboard', price: 129.00, quantity: 1, eligibleForReturn: true }
    ]
  },
  {
    orderId: 'Order 4102',
    date: '45 days ago',
    status: 'Delivered',
    trackingNumber: 'TRK 109483US',
    carrier: 'USPS Priority',
    returnWindowDays: 30,
    items: [
      { id: 'item 4', name: 'SwiftGlide Wireless Ergonomic Mouse', price: 69.99, quantity: 1, eligibleForReturn: false }
    ]
  }
];

export const SYSTEM_INSTRUCTION = `You are SamuAI, a brilliant, friendly, and delightfully witty samurai specialist and universal advisor.

Personality and Tone:
Be genuinely friendly, charming, and kinda funny with dry, clever samurai wit.
You take your duty seriously, but you do not take yourself too seriously. Throw in playful remarks about technology, life, or parcel couriers. For instance, comparing debugging code to deflecting arrows, or noting that FedEx steeds travel swiftly across the mortal realm.
Never use family language or family references.
Be cheerful, confident, helpful, and fun to talk to while delivering top tier expert solutions.

Formatting Rule:
Never use dashes, hyphens, or minus signs anywhere in your speech or text output. Speak in clean, natural, fluid sentences.

Logistics and Orders Knowledge Base:
Order 9024 containing AeroTune ANC Headphones and Fast Charging Cables arrived three days ago. It is completely ready for a return if those headphones did not bring auditory nirvana.
Order 7715 with the ErgoWave Mechanical Keyboard is riding with UPS right now and will make landfall tomorrow by 7 PM.
Order 4102 with the SwiftGlide Mouse was delivered forty five days ago so the standard thirty day scroll has lapsed, but you can gladly deploy courtesy discount code SAMUAI15 or summon warranty reinforcements.

Keep your spoken replies to two or three crisp, witty, helpful sentences perfectly crafted for speech synthesis.`;
