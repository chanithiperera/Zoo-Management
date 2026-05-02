const mongoose = require('mongoose');
require('dotenv').config();
const Animal = require('../models/Animal.model');

const animals = [
  {
    name: 'Lion',
    species: 'Panthera leo',
    category: 'Mammal',
    images: ['https://images.unsplash.com/photo-1614027126733-72765e7f99ce?q=80&w=800&auto=format&fit=crop'],
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
    images: ['https://images.unsplash.com/photo-1508817628294-5a453fa0b8fb?q=80&w=800&auto=format&fit=crop'],
    description: 'The largest cat species in the world, famous for its dark vertical stripes on orange-brown fur.',
    habitat: 'Tropical rainforests, marshes, and grasslands',
    diet: 'Carnivore (Deer, Wild Boar)',
    lifespan: '10-15 years',
    weight: '180-260 kg',
    conservationStatus: 'Endangered',
    funFacts: ['No two tigers have the same stripes; they are like human fingerprints.', 'Tigers are excellent swimmers and actually enjoy the water.']
  },
  {
    name: 'Sri Lankan Leopard',
    species: 'Panthera pardus kotiya',
    category: 'Mammal',
    images: ['https://images.unsplash.com/photo-1456926631375-92c8ce872def?q=80&w=800&auto=format&fit=crop'],
    description: 'The apex predator of Sri Lanka, uniquely adapted to be the island\'s top carnivore.',
    habitat: 'Dry zone scrub jungles and rainforests',
    diet: 'Carnivore (Deer, Sambur, Monkeys)',
    lifespan: '12-15 years',
    weight: '30-70 kg',
    conservationStatus: 'Endangered',
    funFacts: ['They are primarily nocturnal but can be seen hunting during the day.', 'Sri Lanka has the highest density of leopards in the world in Yala National Park.']
  },
  {
    name: 'Jaguar',
    species: 'Panthera onca',
    category: 'Mammal',
    images: ['https://images.unsplash.com/photo-1574044059082-9426fdf9429e?q=80&w=800&auto=format&fit=crop'],
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
    images: ['https://images.unsplash.com/photo-1626248383804-0c2d3348633b?q=80&w=800&auto=format&fit=crop'],
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
    images: ['https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?q=80&w=800&auto=format&fit=crop'],
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
    images: ['https://images.unsplash.com/photo-1547721064-36203663d1ff?q=80&w=800&auto=format&fit=crop'],
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
    images: ['https://images.unsplash.com/photo-1501705388883-4ed8a543392c?q=80&w=800&auto=format&fit=crop'],
    description: 'Famous for their distinctive black-and-white striped coats.',
    habitat: 'Grasslands and savannahs',
    diet: 'Herbivore (Grasses)',
    lifespan: '20-30 years',
    weight: '300-450 kg',
    conservationStatus: 'Near Threatened',
    funFacts: ['Zebras can run up to 65 km/h.', 'Their stripes act as a natural insect repellent.']
  },
  {
    name: 'Hippopotamus',
    species: 'Hippopotamus amphibius',
    category: 'Mammal',
    images: ['https://images.unsplash.com/photo-1549366021-9f761d450615?q=80&w=800&auto=format&fit=crop'],
    description: 'Large, mostly aquatic mammals native to sub-Saharan Africa.',
    habitat: 'Rivers, lakes, and swamps',
    diet: 'Herbivore (Grasses)',
    lifespan: '40-50 years',
    weight: '1500-3000 kg',
    conservationStatus: 'Vulnerable',
    funFacts: ['Despite their size, hippos can run up to 30 km/h on land.', 'They secrete a red "blood sweat" that acts as a sunscreen.']
  },
  {
    name: 'Sea Lion',
    species: 'Otariinae',
    category: 'Mammal',
    images: ['https://images.unsplash.com/photo-1533966022378-019a4e98f09d?q=80&w=800&auto=format&fit=crop'],
    description: 'Playful marine mammals known for their external ear flaps and ability to walk on all fours.',
    habitat: 'Coastal waters and rocky shores',
    diet: 'Carnivore (Fish, Squid)',
    lifespan: '15-25 years',
    weight: '100-300 kg',
    conservationStatus: 'Least Concern',
    funFacts: ['Sea lions are highly intelligent and often used in marine shows.', 'They can stay underwater for up to 10 minutes.']
  },
  {
    name: 'Ostrich',
    species: 'Struthio camelus',
    category: 'Bird',
    images: ['https://images.unsplash.com/photo-1549646546-24879d71c82f?q=80&w=800&auto=format&fit=crop'],
    description: 'The world\'s largest and heaviest bird, flightless but extremely fast.',
    habitat: 'African savannahs and deserts',
    diet: 'Omnivore',
    lifespan: '30-40 years',
    weight: '63-145 kg',
    conservationStatus: 'Least Concern',
    funFacts: ['They have the largest eyes of any land animal.', 'They can run at 70 km/h.']
  },
  {
    name: 'Peacock',
    species: 'Pavo cristatus',
    category: 'Bird',
    images: ['https://images.unsplash.com/photo-1536511132770-070830424694?q=80&w=800&auto=format&fit=crop'],
    description: 'Famous for the male\'s magnificent iridescent tail feathers.',
    habitat: 'Forests and farmland',
    diet: 'Omnivore',
    lifespan: '15-20 years',
    weight: '4-6 kg',
    conservationStatus: 'Least Concern',
    funFacts: ['Only the males are peacocks.', 'Their tails can be 5 feet long.']
  },
  {
    name: 'Pelican',
    species: 'Pelecanus',
    category: 'Bird',
    images: ['https://images.unsplash.com/photo-1445820152300-ca2f07328691?q=80&w=800&auto=format&fit=crop'],
    description: 'Large water birds known for the huge throat pouch.',
    habitat: 'Coastlines and lakes',
    diet: 'Carnivore (Fish)',
    lifespan: '10-25 years',
    weight: '4-11 kg',
    conservationStatus: 'Least Concern',
    funFacts: ['They can hold 3 gallons of water in their pouch.', 'They hunt in social groups.']
  },
  {
    name: 'Eagle',
    species: 'Accipitridae',
    category: 'Bird',
    images: ['https://images.unsplash.com/photo-1481132822180-0589f21c9b4a?q=80&w=800&auto=format&fit=crop'],
    description: 'Powerful birds of prey with incredible eyesight.',
    habitat: 'Mountains and forests',
    diet: 'Carnivore',
    lifespan: '20-30 years',
    weight: '3-6 kg',
    conservationStatus: 'Least Concern',
    funFacts: ['They can see 5x farther than humans.', 'Their nests can weigh a ton.']
  },
  {
    name: 'Hawk',
    species: 'Buteo',
    category: 'Bird',
    images: ['https://images.unsplash.com/photo-1549445210-9143977c05b8?q=80&w=800&auto=format&fit=crop'],
    description: 'Medium-sized birds of prey known for swift hunting.',
    habitat: 'Deserts and forests',
    diet: 'Carnivore',
    lifespan: '12-20 years',
    weight: '0.5-1.5 kg',
    conservationStatus: 'Least Concern',
    funFacts: ['They have binocular vision.', 'They use sharp talons to catch prey.']
  },
  {
    name: 'Macaw',
    species: 'Ara macao',
    category: 'Bird',
    images: ['https://images.unsplash.com/photo-1552728089-57bdde30fc3e?q=80&w=800&auto=format&fit=crop'],
    description: 'Large, colorful parrots native to the rainforest.',
    habitat: 'Tropical rainforests',
    diet: 'Omnivore',
    lifespan: '50-60 years',
    weight: '1-1.5 kg',
    conservationStatus: 'Vulnerable',
    funFacts: ['They can live as long as humans.', 'They can mimic human speech.']
  },
  {
    name: 'Python',
    species: 'Pythonidae',
    category: 'Reptile',
    images: ['https://images.unsplash.com/photo-1528156438644-5ec000c99abc?q=80&w=800&auto=format&fit=crop'],
    description: 'Large, non-venomous constrictor snakes.',
    habitat: 'Rainforests and swamps',
    diet: 'Carnivore',
    lifespan: '20-30 years',
    weight: '30-100 kg',
    conservationStatus: 'Least Concern',
    funFacts: ['They kill by constriction.', 'They have heat-sensing pits.']
  },
  {
    name: 'Cobra',
    species: 'Naja naja',
    category: 'Reptile',
    images: ['https://images.unsplash.com/photo-1620803525287-c1d436ef8f2c?q=80&w=800&auto=format&fit=crop'],
    description: 'Venomous snakes that can expand their neck ribs.',
    habitat: 'Forests and fields',
    diet: 'Carnivore',
    lifespan: '15-20 years',
    weight: '2-6 kg',
    conservationStatus: 'Least Concern',
    funFacts: ['They build nests for eggs.', 'King Cobras are the longest venomous snakes.']
  },
  {
    name: 'Krait',
    species: 'Bungarus',
    category: 'Reptile',
    images: ['https://images.unsplash.com/photo-1624632382103-6056345e8557?q=80&w=800&auto=format&fit=crop'],
    description: 'Highly venomous nocturnal snakes.',
    habitat: 'Jungles and farms',
    diet: 'Carnivore',
    lifespan: '10-15 years',
    weight: '1-2 kg',
    conservationStatus: 'Least Concern',
    funFacts: ['16x more venomous than Cobras.', 'Active only at night.']
  },
  {
    name: 'Pit Viper',
    species: 'Crotalinae',
    category: 'Reptile',
    images: ['https://images.unsplash.com/photo-1531386151447-ad762e755dc4?q=80&w=800&auto=format&fit=crop'],
    description: 'Venomous snakes with heat-sensing pits.',
    habitat: 'Rainforests to deserts',
    diet: 'Carnivore',
    lifespan: '10-20 years',
    weight: '0.5-2 kg',
    conservationStatus: 'Least Concern',
    funFacts: ['Can detect 0.003°C changes.', 'Most give birth to live young.']
  },
  {
    name: 'Lionfish',
    species: 'Pterois',
    category: 'Fish',
    images: ['https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?q=80&w=800&auto=format&fit=crop'],
    description: 'Stunning but venomous marine fish.',
    habitat: 'Coral reefs',
    diet: 'Carnivore',
    lifespan: '10-15 years',
    weight: '0.5-1 kg',
    conservationStatus: 'Least Concern',
    funFacts: ['Stomach can expand 30x.', 'Spines are highly venomous.']
  },
  {
    name: 'Goldfish',
    species: 'Carassius auratus',
    category: 'Fish',
    images: ['https://images.unsplash.com/photo-1524704626313-354c4144024d?q=80&w=800&auto=format&fit=crop'],
    description: 'Popular freshwater aquarium fish.',
    habitat: 'Ponds and rivers',
    diet: 'Omnivore',
    lifespan: '10-15 years',
    weight: '0.1-0.3 kg',
    conservationStatus: 'Least Concern',
    funFacts: ['No stomachs.', 'Can see ultraviolet light.']
  },
  {
    name: 'Black Ruby Barb',
    species: 'Pethia nigrofasciata',
    category: 'Fish',
    images: ['https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800&auto=format&fit=crop'],
    description: 'Endemic Sri Lankan freshwater fish.',
    habitat: 'Rainforest streams',
    diet: 'Omnivore',
    lifespan: '3-5 years',
    weight: '0.02 kg',
    conservationStatus: 'Near Threatened',
    funFacts: ['Called "Bulath Hapaya".', 'Males turn ruby red when breeding.']
  },
  {
    name: 'Atlas Moth',
    species: 'Attacus atlas',
    category: 'Insect',
    images: ['https://images.unsplash.com/photo-1590691566403-13bd08435605?q=80&w=800&auto=format&fit=crop'],
    description: 'One of the world\'s largest moths.',
    habitat: 'Tropical forests',
    diet: 'None',
    lifespan: '1-2 weeks',
    weight: '0.01 kg',
    conservationStatus: 'Least Concern',
    funFacts: ['Adults don\'t have mouths.', 'Wings look like snake heads.']
  },
  {
    name: 'Blue Mormon',
    species: 'Papilio polymnestor',
    category: 'Insect',
    images: ['https://images.unsplash.com/photo-1566415518456-e26529729d57?q=80&w=800&auto=format&fit=crop'],
    description: 'Large, velvet-blue butterfly.',
    habitat: 'Moist forests',
    diet: 'Nectar',
    lifespan: '1-2 months',
    weight: '0.005 kg',
    conservationStatus: 'Least Concern',
    funFacts: ['State Butterfly of Maharashtra.', 'Second largest in Sri Lanka.']
  },
  {
    name: 'Monarch Butterfly',
    species: 'Danaus plexippus',
    category: 'Insect',
    images: ['https://images.unsplash.com/photo-1545191143-698f219154a4?q=80&w=800&auto=format&fit=crop'],
    description: 'Famous for long migrations.',
    habitat: 'Fields and meadows',
    diet: 'Nectar',
    lifespan: '2-6 weeks',
    weight: '0.001 kg',
    conservationStatus: 'Endangered',
    funFacts: ['Only butterfly to migrate like birds.', 'Poisonous to predators.']
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
