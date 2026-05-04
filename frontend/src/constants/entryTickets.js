/**
 * Entry admission tiers — single source for info screen and booking form.
 * Replace with API-driven config when booking is wired.
 */
export const ENTRY_TICKET_TYPES = [
  { id: 'localChild', label: 'Local Child', priceLkr: 450 },
  { id: 'localAdult', label: 'Local Adult', priceLkr: 900 },
  { id: 'foreignChild', label: 'Foreign Child', priceLkr: 1800 },
  { id: 'foreignAdult', label: 'Foreign Adult', priceLkr: 3500 },
];

/** Max quantity per line on the booking form. */
export const ENTRY_TICKET_MAX_PER_TYPE = 20;

export function formatLkr(amount) {
  return `LKR ${Number(amount).toLocaleString('en-LK')}`;
}

/** Zero-quantity map keyed by entry ticket id. */
export function initialEntryQuantities() {
  return Object.fromEntries(ENTRY_TICKET_TYPES.map((t) => [t.id, 0]));
}
