const TicketCatalog = require('../models/TicketCatalog.model');
const DEFAULT_SHOW_DAILY_CAPACITY = 100;

const DEFAULT_CATALOG = [
  { code: 'localChild', name: 'Local Child', category: 'entry', priceLkr: 450 },
  { code: 'localAdult', name: 'Local Adult', category: 'entry', priceLkr: 900 },
  { code: 'foreignChild', name: 'Foreign Child', category: 'entry', priceLkr: 1800 },
  { code: 'foreignAdult', name: 'Foreign Adult', category: 'entry', priceLkr: 3500 },
  {
    code: 'birds_of_prey',
    name: 'Birds of prey flight',
    category: 'show',
    priceLkr: 200,
    dailyCapacity: DEFAULT_SHOW_DAILY_CAPACITY,
    meta: {
      timeLabel: '10:00 AM',
      imageUrl: 'assets/images/show-birds-of-prey.png',
    },
  },
  {
    code: 'elephant_care_bath',
    name: 'Elephant care & bath',
    category: 'show',
    priceLkr: 250,
    dailyCapacity: DEFAULT_SHOW_DAILY_CAPACITY,
    meta: {
      timeLabel: '2:30 PM',
      imageUrl: 'assets/images/show-elephant-care-bath.png',
    },
  },
  {
    code: 'sea_lion_splash',
    name: 'Sea lion splash',
    category: 'show',
    priceLkr: 200,
    dailyCapacity: DEFAULT_SHOW_DAILY_CAPACITY,
    meta: {
      timeLabel: '4:00 PM',
      imageUrl: 'assets/images/show-sea-lion-splash.png',
    },
  },
  {
    code: 'reptile_encounter',
    name: 'Reptile encounter',
    category: 'show',
    priceLkr: 150,
    dailyCapacity: DEFAULT_SHOW_DAILY_CAPACITY,
    meta: {
      timeLabel: '11:30 AM',
      imageUrl: 'assets/images/show-reptile-encounter.png',
    },
  },
];

async function seedTicketCatalog() {
  for (const item of DEFAULT_CATALOG) {
    const existing = await TicketCatalog.findOne({ code: item.code }).lean();
    if (!existing) {
      await TicketCatalog.create({
        code: item.code,
        name: item.name,
        category: item.category,
        priceLkr: item.priceLkr,
        active: true,
        dailyCapacity: item.category === 'show' ? item.dailyCapacity || DEFAULT_SHOW_DAILY_CAPACITY : null,
        meta: item.meta || {},
      });
      continue;
    }

    const nextMeta = { ...(existing.meta || {}) };
    if (item.category === 'show') {
      if (!nextMeta.timeLabel && item.meta?.timeLabel) {
        nextMeta.timeLabel = item.meta.timeLabel;
      }
      if (!nextMeta.imageUrl && item.meta?.imageUrl) {
        nextMeta.imageUrl = item.meta.imageUrl;
      }
    }

    const update = {};
    if (existing.category !== item.category) {
      update.category = item.category;
    }
    if (existing.active !== true) {
      update.active = true;
    }
    if (item.category === 'show') {
      const nextDailyCapacity = Number(item.dailyCapacity || DEFAULT_SHOW_DAILY_CAPACITY);
      if (existing.dailyCapacity !== nextDailyCapacity) {
        update.dailyCapacity = nextDailyCapacity;
      }
    } else if (existing.dailyCapacity != null) {
      update.dailyCapacity = null;
    }
    if (JSON.stringify(nextMeta) !== JSON.stringify(existing.meta || {})) {
      update.meta = nextMeta;
    }

    if (Object.keys(update).length) {
      await TicketCatalog.updateOne({ _id: existing._id }, { $set: update });
    }
  }
  console.log('[seedCatalog] Ticket catalog seeded/updated.');
}

module.exports = { seedTicketCatalog, DEFAULT_CATALOG };
