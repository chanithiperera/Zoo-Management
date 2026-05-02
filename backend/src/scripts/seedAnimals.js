const mongoose = require('mongoose');
require('dotenv').config();
const Animal = require('../models/Animal.model');

const animals = [
  {
    name: 'Lion',
    species: 'Panthera leo',
    category: 'Mammal',
    images: ['/uploads/pexels-regan-dsouza-1315522347-33243852.jpg'], // Using Tiger as fallback or similar if Lion missing, but wait, I'll use a placeholder if needed. Actually, I'll leave it as is if no match.
    description: 'The "King of the Jungle", known for its impressive mane and social pride structure.',
    habitat: 'Grassy plains and savannahs',
    diet: 'Carnivore (Antelope, Zebra, Wildebeest)',
    lifespan: '10-14 years (wild)',
    weight: '150-250 kg',
    conservationStatus: 'Vulnerable',
    funFacts: ['Lions are the only cats that live in large social groups called prides.', 'A lion\'s roar can be heard from up to 8 kilometers away.']
  },
  {
    name: 'Bengal Tiger',
    species: 'Panthera tigris tigris',
    category: 'Mammal',
    images: ['/uploads/pexels-regan-dsouza-1315522347-33243852.jpg'],
    description: 'The largest cat species in the world, famous for its dark vertical stripes on orange-brown fur.',
    habitat: 'Tropical rainforests, marshes, and grasslands',
    diet: 'Carnivore (Deer, Wild Boar)',
    lifespan: '10-15 years',
    weight: '180-260 kg',
    conservationStatus: 'Endangered',
    funFacts: ['No two tigers have the same stripes; they are like human fingerprints.', 'Tigers are excellent swimmers and actually enjoy the water.']
  },
  {
    name: 'Jaguar',
    species: 'Panthera onca',
    category: 'Mammal',
    images: ['/uploads/pexels-am83-19494790.jpg'],
    description: 'The third-largest cat species, native to the Americas, known for its powerful bite.',
    habitat: 'Rainforests, wetlands, and wooded regions',
    diet: 'Carnivore (Caiman, Capybara, Deer)',
    lifespan: '12-15 years',
    weight: '56-96 kg',
    conservationStatus: 'Near Threatened',
    funFacts: ['Jaguars have the strongest bite of all felids.', 'Unlike most cats, jaguars love swimming.']
  },
  {
    name: 'Sloth Bear',
    species: 'Melursus ursinus',
    category: 'Mammal',
    images: ['/uploads/pexels-regan-dsouza-1315522347-37148189.jpg'],
    description: 'A shaggy-haired bear native to the Indian subcontinent, specialized in eating insects.',
    habitat: 'Lowland forests and grasslands',
    diet: 'Omnivore (primarily Termites and Ants)',
    lifespan: '20 years',
    weight: '80-140 kg',
    conservationStatus: 'Vulnerable',
    funFacts: ['They lack upper front teeth, which helps them suck up termites like a vacuum.', 'Mothers carry their cubs on their backs while foraging.']
  },
  {
    name: 'Brown Bear',
    species: 'Ursus arctos',
    category: 'Mammal',
    images: ['/uploads/pexels-niksbro2404-34354944.jpg'],
    description: 'Large bears found across North America and Eurasia, including the famous Grizzly.',
    habitat: 'Forests, mountains, and coastal regions',
    diet: 'Omnivore (Fish, Berries, Roots, Small Mammals)',
    lifespan: '20-30 years',
    weight: '150-600 kg',
    conservationStatus: 'Least Concern',
    funFacts: ['They can run at speeds of up to 50 km/h.', 'Brown bears spend nearly half their year hibernating.']
  },
  {
    name: 'Giraffe',
    species: 'Giraffa camelopardalis',
    category: 'Mammal',
    images: ['/uploads/pexels-asnah-maige-557015610-31220229.jpg'],
    description: 'The tallest living land animal, recognized by its long neck and unique coat patterns.',
    habitat: 'Savannahs and open woodlands',
    diet: 'Herbivore (Acacia leaves)',
    lifespan: '20-25 years',
    weight: '800-1200 kg',
    conservationStatus: 'Vulnerable',
    funFacts: ['A giraffe\'s heart is 2 feet long and weighs about 11 kg.', 'They can stand up within 30 minutes of being born.']
  },
  {
    name: 'Zebra',
    species: 'Equus quagga',
    category: 'Mammal',
    images: ['/uploads/pexels-paul-jousseau-406314056-14918317.jpg'],
    description: 'Famous for their distinctive black-and-white striped coats.',
    habitat: 'Grasslands and savannahs',
    diet: 'Herbivore (Grasses)',
    lifespan: '20-30 years',
    weight: '300-450 kg',
    conservationStatus: 'Near Threatened',
    funFacts: ['Zebras can run up to 65 km/h.', 'Their stripes act as a natural insect repellent.']
  },
  {
    name: 'African Elephant',
    species: 'Loxodonta africana',
    category: 'Mammal',
    images: ['/uploads/pexels-dhilip-antony-993686059-27021927.jpg'],
    description: 'The largest land animal on Earth, known for its long trunk and ivory tusks.',
    habitat: 'Savannahs, forests, and deserts',
    diet: 'Herbivore (Grasses, Fruit, Bark)',
    lifespan: '60-70 years',
    weight: '2000-6000 kg',
    conservationStatus: 'Endangered',
    funFacts: ['Elephants can communicate over long distances using low-frequency sounds.', 'They use their trunks for everything from smelling to social interaction.']
  },
  {
    name: 'Rhinoceros',
    species: 'Rhinocerotidae',
    category: 'Mammal',
    images: ['/uploads/pexels-alfred-gf-198265263-11521883.jpg'],
    description: 'Large herbivorous mammals known for their thick skin and prominent horns.',
    habitat: 'Savannahs and shrublands',
    diet: 'Herbivore (Grasses, Leaves)',
    lifespan: '35-50 years',
    weight: '800-2300 kg',
    conservationStatus: 'Critically Endangered',
    funFacts: ['A rhino\'s horn is made of keratin, the same protein in human hair and nails.', 'They have excellent hearing and smell but poor eyesight.']
  },
  {
    name: 'Giant Panda',
    species: 'Ailuropoda melanoleuca',
    category: 'Mammal',
    images: ['/uploads/pexels-beratinarsivi-14608030.jpg'],
    description: 'A bear native to south-central China, famous for its black-and-white coat and love for bamboo.',
    habitat: 'Mountainous bamboo forests',
    diet: 'Herbivore (primarily Bamboo)',
    lifespan: '20 years',
    weight: '70-120 kg',
    conservationStatus: 'Vulnerable',
    funFacts: ['Pandas spend up to 14 hours a day eating bamboo.', 'A newborn panda is about the size of a stick of butter.']
  },
  {
    name: 'Meerkat',
    species: 'Suricata suricatta',
    category: 'Mammal',
    images: ['/uploads/pexels-andy-staver-2149380890-33664363.jpg'],
    description: 'Small mongooses known for their upright posture and social behavior.',
    habitat: 'Deserts and grasslands of Africa',
    diet: 'Insectivore (Insects, Spiders, Scorpions)',
    lifespan: '12-15 years',
    weight: '0.5-1 kg',
    conservationStatus: 'Least Concern',
    funFacts: ['Meerkats take turns acting as sentries to watch for predators.', 'They are immune to some types of snake venom.']
  },
  {
    name: 'Arctic Wolf',
    species: 'Canis lupus arctos',
    category: 'Mammal',
    images: ['/uploads/pexels-freestockpro-12861709.jpg'],
    description: 'A subspecies of gray wolf that lives in the high Arctic regions.',
    habitat: 'Arctic tundra',
    diet: 'Carnivore (Muskox, Arctic Hares, Caribou)',
    lifespan: '7-10 years',
    weight: '30-70 kg',
    conservationStatus: 'Least Concern',
    funFacts: ['They have white coats to blend in with the snow.', 'They can survive in sub-zero temperatures for months.']
  },
  {
    name: 'Flamingo',
    species: 'Phoenicopterus',
    category: 'Bird',
    images: ['/uploads/pexels-evelyn-poratti-310271693-19249458.jpg'],
    description: 'Tall, pink wading birds known for their long necks and stilt-like legs.',
    habitat: 'Lakes, lagoons, and marshes',
    diet: 'Omnivore (Shrimp, Algae)',
    lifespan: '20-30 years',
    weight: '2-4 kg',
    conservationStatus: 'Least Concern',
    funFacts: ['Their pink color comes from the carotenoid pigments in their food.', 'They often stand on one leg to conserve body heat.']
  },
  {
    name: 'Peacock',
    species: 'Pavo cristatus',
    category: 'Bird',
    images: ['/uploads/pexels-ganajp-4179466.jpg'],
    description: 'Male peafowl known for their magnificent iridescent tail feathers.',
    habitat: 'Forests and farmland',
    diet: 'Omnivore',
    lifespan: '15-20 years',
    weight: '4-6 kg',
    conservationStatus: 'Least Concern',
    funFacts: ['Peacocks use their colorful tails to attract mates during courtship.', 'They are the national bird of India.']
  },
  {
    name: 'Ostrich',
    species: 'Struthio camelus',
    category: 'Bird',
    images: ['/uploads/pexels-navlakha-33658237.jpg'],
    description: 'The world\'s largest and heaviest bird, flightless but extremely fast.',
    habitat: 'African savannahs and deserts',
    diet: 'Omnivore',
    lifespan: '30-40 years',
    weight: '63-145 kg',
    conservationStatus: 'Least Concern',
    funFacts: ['Ostrich eyes are larger than their brains.', 'They can kick with enough force to kill a lion.']
  },
  {
    name: 'Blue and Gold Macaw',
    species: 'Ara ararauna',
    category: 'Bird',
    images: ['/uploads/pexels-u-h-448257719-32189047.jpg'],
    description: 'Large, brightly colored parrots native to the rainforests of South America.',
    habitat: 'Tropical rainforests and woodlands',
    diet: 'Herbivore (Seeds, Nuts, Fruits)',
    lifespan: '30-50 years',
    weight: '1-1.5 kg',
    conservationStatus: 'Least Concern',
    funFacts: ['They can mimic human speech and other sounds.', 'They mate for life and are very social birds.']
  },
  {
    name: 'Penguin',
    species: 'Spheniscidae',
    category: 'Bird',
    images: ['/uploads/pexels-john-289283-920596.jpg'],
    description: 'Flightless marine birds known for their tuxedo-like appearance and waddling gait.',
    habitat: 'Antarctic and sub-Antarctic regions',
    diet: 'Carnivore (Fish, Krill, Squid)',
    lifespan: '15-20 years',
    weight: '1-35 kg (varies by species)',
    conservationStatus: 'Vulnerable',
    funFacts: ['Penguins spend about half their lives on land and half in the ocean.', 'They have a thick layer of blubber to keep them warm in freezing water.']
  },
  {
    name: 'Python',
    species: 'Pythonidae',
    category: 'Reptile',
    images: ['/uploads/pexels-vincent-ma-janssen-2561673.jpg'],
    description: 'Large, non-venomous constrictor snakes found in Africa, Asia, and Australia.',
    habitat: 'Rainforests, swamps, and grasslands',
    diet: 'Carnivore (Small mammals, Birds)',
    lifespan: '20-30 years',
    weight: '30-100 kg',
    conservationStatus: 'Least Concern',
    funFacts: ['Pythons kill their prey by wrapping around it and squeezing.', 'They have heat-sensing pits to locate warm-blooded prey at night.']
  },
  {
    name: 'Poison Dart Frog',
    species: 'Dendrobatidae',
    category: 'Amphibian',
    images: ['/uploads/pexels-y-glmmes-2147904764-36329695.jpg'],
    description: 'Small, brightly colored frogs known for their highly toxic skin.',
    habitat: 'Tropical rainforests of Central and South America',
    diet: 'Insectivore (Ants, Termites, Small Beetles)',
    lifespan: '3-15 years',
    weight: '2-10 g',
    conservationStatus: 'Endangered',
    funFacts: ['Their bright colors warn predators that they are poisonous.', 'Indigenous tribes use their toxins to coat the tips of blowdarts.']
  },
  {
    name: 'Crocodile',
    species: 'Crocodylinae',
    category: 'Reptile',
    images: ['/uploads/pexels-ramesh-photography-372987-8169460.jpg'],
    description: 'Large aquatic reptiles that have existed since the time of the dinosaurs.',
    habitat: 'Rivers, lakes, and coastal waters',
    diet: 'Carnivore (Fish, Mammals, Birds)',
    lifespan: '70-100 years',
    weight: '200-1000 kg',
    conservationStatus: 'Least Concern',
    funFacts: ['Crocodiles have the strongest bite of any animal in the world.', 'They can stay underwater for over an hour by slowing their heart rate.']
  },
  {
    name: 'Koala',
    species: 'Phascolarctos cinereus',
    category: 'Mammal',
    images: ['/uploads/pexels-frank-cone-140140-3887698.jpg'],
    description: 'An arboreal herbivorous marsupial native to Australia.',
    habitat: 'Eucalyptus woodlands',
    diet: 'Herbivore (Eucalyptus leaves)',
    lifespan: '13-18 years',
    weight: '4-15 kg',
    conservationStatus: 'Vulnerable',
    funFacts: ['Koalas sleep for up to 20 hours a day to save energy.', 'They have fingerprints that are almost identical to human fingerprints.']
  },
  {
    name: 'Chimpanzee',
    species: 'Pan troglodytes',
    category: 'Mammal',
    images: ['/uploads/pexels-magda-ehlers-pexels-32420365.jpg'],
    description: 'Highly intelligent great apes that share 98% of their DNA with humans.',
    habitat: 'Forests and savannahs of tropical Africa',
    diet: 'Omnivore (Fruits, Leaves, Insects, Meat)',
    lifespan: '40-50 years',
    weight: '40-70 kg',
    conservationStatus: 'Endangered',
    funFacts: ['Chimpanzees are one of the few animals that use tools to find food.', 'They have complex social structures and communicate with a variety of gestures and sounds.']
  },
  {
    name: 'Bactrian Camel',
    species: 'Camelus bactrianus',
    category: 'Mammal',
    images: ['/uploads/pexels-fal98-7053651.jpg'],
    description: 'Large, even-toed ungulates known for the two humps on their backs.',
    habitat: 'Steppes and deserts of Central Asia',
    diet: 'Herbivore (Grasses, Shrubs)',
    lifespan: '40-50 years',
    weight: '600-1000 kg',
    conservationStatus: 'Critically Endangered',
    funFacts: ['Their humps store fat, which can be converted into water and energy.', 'They can drink up to 30 gallons of water in just 13 minutes.']
  },
  {
    name: 'Monarch Butterfly',
    species: 'Danaus plexippus',
    category: 'Insect',
    images: ['/uploads/pexels-noval-35735291.jpg'],
    description: 'A milkweed butterfly famous for its incredible long-distance migration.',
    habitat: 'Fields, meadows, and gardens',
    diet: 'Nectar',
    lifespan: '2-6 weeks (migrating gen: up to 8 months)',
    weight: '0.25-0.75 g',
    conservationStatus: 'Endangered',
    funFacts: ['Monarchs can travel over 3,000 miles during their migration.', 'They are poisonous to predators due to the milkweed they eat as caterpillars.']
  },
  {
    name: 'Tropical Fish',
    species: 'Actinopterygii',
    category: 'Fish',
    images: ['/uploads/pexels-tuan-vy-903011268-33593384.jpg'],
    description: 'Diverse and colorful fish species that inhabit tropical aquatic environments.',
    habitat: 'Coral reefs, rivers, and lakes',
    diet: 'Omnivore (Algae, Plankton, Small Crustaceans)',
    lifespan: '3-10 years (varies by species)',
    weight: 'Varies',
    conservationStatus: 'Least Concern',
    funFacts: ['Many tropical fish live in symbiotic relationships with other marine life.', 'They use their vibrant colors for camouflage or to attract mates.']
  }
];

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for seeding animals...');

    for (const animalData of animals) {
      await Animal.findOneAndUpdate(
        { name: animalData.name },
        animalData,
        { upsert: true, new: true }
      );
      console.log(`Seeded/Updated: ${animalData.name}`);
    }

    console.log('All animals seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error seeding animals:', err);
    process.exit(1);
  }
}

seed();
