import { formatLkr } from './entryTickets';

/**
 * Add-on animal shows — single source for the ticket info screen and show selection.
 * Replace with API-driven config when booking is wired.
 */
export const TICKET_SHOW_MAX_PER_SHOW = 10;

const IMG_BIRDS_OF_PREY = require('../../assets/images/show-birds-of-prey.jpg');
const IMG_ELEPHANT_CARE = require('../../assets/images/show-elephant-care-bath.png');
const IMG_SEA_LION = require('../../assets/images/showsealionsplash.jpg');
const IMG_REPTILE = require('../../assets/images/show-reptile-encounter.jpg');

export const TICKET_SHOW_CATALOG = [
  {
    id: 'birds_of_prey',
    name: 'Birds of prey flight',
    timeLabel: '10:00 AM',
    priceLkr: 200,
    image: IMG_BIRDS_OF_PREY,
    imageAccessibilityLabel: 'Zoo presenter with a large red and blue macaw',
  },
  {
    id: 'elephant_care_bath',
    name: 'Elephant care & bath',
    timeLabel: '2:30 PM',
    priceLkr: 250,
    image: IMG_ELEPHANT_CARE,
    imageAccessibilityLabel: 'Ceremonial elephant bath with people in traditional dress holding silver bowls',
  },
  {
    id: 'sea_lion_splash',
    name: 'Sea lion splash',
    timeLabel: '4:00 PM',
    priceLkr: 200,
    image: IMG_SEA_LION,
    imageAccessibilityLabel: 'Sea lion balancing a volleyball on its nose above blue water',
  },
  {
    id: 'reptile_encounter',
    name: 'Reptile encounter',
    timeLabel: '11:30 AM',
    priceLkr: 150,
    image: IMG_REPTILE,
    imageAccessibilityLabel: 'Zookeeper presenting a large patterned snake outdoors',
  },
];

/** Rows for `TicketShowPlaceholder` (name, time, price string). */
export function getTicketShowPlaceholderRows() {
  return TICKET_SHOW_CATALOG.map((s) => ({
    name: s.name,
    time: s.timeLabel,
    price: formatLkr(s.priceLkr),
  }));
}

export function initialTicketShowQuantities() {
  return Object.fromEntries(TICKET_SHOW_CATALOG.map((s) => [s.id, 0]));
}
