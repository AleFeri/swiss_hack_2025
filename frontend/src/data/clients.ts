
import { Client } from '../types';

export const clients: Client[] = [
  {
    id: '1',
    name: 'Anna Müller',
    age: 34,
    occupation: 'Software Developer',
    funFacts: [
      'Recently bought a new apartment',
      'Interested in sustainable investments',
      'Travels frequently for work'
    ],
    portfolioDetails: 'Has a savings account with CHF 50,000 and a small investment portfolio.'
  },
  {
    id: '2',
    name: 'Thomas Schmidt',
    age: 45,
    occupation: 'Doctor',
    funFacts: [
      'Planning for early retirement',
      'Has two children in university',
      'Looking to renovate home'
    ],
    portfolioDetails: 'Has a diverse portfolio including stocks, bonds, and real estate investments.'
  },
  {
    id: '3',
    name: 'Maria Weber',
    age: 28,
    occupation: 'Marketing Manager',
    funFacts: [
      'Recently got married',
      'Planning to buy first property',
      'Interested in starting a business in the next 5 years'
    ],
    portfolioDetails: 'Has a savings account with CHF 35,000 and some company shares.'
  }
];

export const selectedClient = clients[0];
