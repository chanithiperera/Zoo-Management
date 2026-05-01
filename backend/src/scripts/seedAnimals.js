require('dotenv').config({ path: __dirname + '/../../.env' });
const mongoose = require('mongoose');
const Animal = require('../models/Animal.model');
const connectDB = require('../config/db');

const mockAnimals = [
  {
    name: 'African Elephant',
    species: 'Loxodonta africana',
    category: 'Mammal',
    images: ['https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?q=80&w=1000&auto=format&fit=crop'],
    description: 'The African elephant is the largest living terrestrial animal. Their large ears allow them to radiate excess heat.',
    habitat: 'Savanna, forests, and deserts of Africa.',
    diet: 'Herbivore - eating leaves, branches, bark, and roots.',
    funFacts: ['An elephant trunk has over 40,000 muscles.', 'They use mud as sunscreen.'],
    conservationStatus: 'Endangered',
    educationContent: [
      {
        type: 'article',
        title: 'Elephant Social Structures',
        url: 'https://en.wikipedia.org/wiki/Elephant',
      },
      {
        type: 'video',
        title: 'Why Elephants Never Forget',
        url: 'https://www.youtube.com/watch?v=lFXyNj3QxOU',
      }
    ]
  },
  {
    name: 'Bengal Tiger',
    species: 'Panthera tigris tigris',
    category: 'Mammal',
    images: ['https://images.unsplash.com/photo-1549480017-d77466a410b5?q=80&w=1000&auto=format&fit=crop'],
    description: 'Bengal tigers are one of the biggest and most majestic cats in the world.',
    habitat: 'Tropical moist broadleaf forests, tropical dry forests.',
    diet: 'Carnivore - eating ungulates like deer and wild boar.',
    funFacts: ['No two tigers have the same stripes.', 'They are excellent swimmers.'],
    conservationStatus: 'Endangered',
    educationContent: [
      {
        type: 'video',
        title: 'Tiger Hunt in the Wild',
        url: 'https://www.youtube.com/watch?v=1zBspPEOVyY',
      }
    ]
  },
  {
    name: 'Green Iguana',
    species: 'Iguana iguana',
    category: 'Reptile',
    images: ['https://images.unsplash.com/photo-1502458428863-718fa671ab11?q=80&w=1000&auto=format&fit=crop'],
    description: 'A large, arboreal, mostly herbivorous species of lizard of the genus Iguana.',
    habitat: 'Rainforests of Northern Mexico, Central America, and South America.',
    diet: 'Herbivore - eating leaves, flowers, and fruit.',
    funFacts: ['They have a third eye on top of their heads called a parietal eye.'],
    conservationStatus: 'Least Concern',
    educationContent: []
  },
  {
    name: 'Macaw',
    species: 'Ara macao',
    category: 'Bird',
    images: ['https://images.unsplash.com/photo-1552560201-903dfc8230b7?q=80&w=1000&auto=format&fit=crop'],
    description: 'Macaws are long-tailed, often colorful, New World parrots.',
    habitat: 'Tropical rainforests.',
    diet: 'Omnivore - seeds, nuts, fruits, insects.',
    funFacts: ['Some macaws can live up to 80 years.', 'They have bone in their tongues.'],
    conservationStatus: 'Least Concern',
    educationContent: []
  }
];

const seedData = async () => {
  try {
    await connectDB();
    
    // Clear existing animals
    await Animal.deleteMany();
    console.log('Existing animals removed');

    // Insert new data
    await Animal.insertMany(mockAnimals);
    console.log('Mock animals seeded successfully!');

    process.exit();
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData();
