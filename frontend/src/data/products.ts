import { Product } from '../types';
import { 
  CreditCard, Package, Home, Banknote, TrendingUp, LineChart, 
  BarChart3, ShieldCheck, PiggyBank, Coins 
} from 'lucide-react';

export const products: Product[] = [
  {
    id: '1',
    name: 'MemberPlus Package',
    category: 'packages',
    categoryLabel: 'Package',
    description: 'A premium banking package with enhanced benefits for Raiffeisen members.',
    reasonsToSell: [
      'Client qualifies for preferred interest rates on savings',
      'Free or discounted concert tickets would match client\'s interests',
      'Free entry to over 500 museums in Switzerland',
      'Discounts on public transport and leisure activities'
    ],
    impactLevel: 'high',
    icon: 'Package',
    documents: [
      { title: 'MemberPlus Brochure', url: '#' },
      { title: 'Membership Benefits Overview', url: '#' }
    ],
    sellingPoints: [
      {
        title: 'Financial Benefits',
        points: [
          'Preferred interest rates on savings',
          'Reduced fees on transactions',
          'One share of Raiffeisen (making the client a member)'
        ]
      },
      {
        title: 'Lifestyle Benefits',
        points: [
          'Free or discounted concert tickets',
          'Free entry to more than 500 museums in Switzerland',
          'Discounts on public transport, hotels, and leisure packages',
          'Mobility subscription discounts'
        ]
      }
    ]
  },
  {
    id: '2',
    name: 'Visa Gold Credit Card',
    category: 'debit-credit-cards',
    categoryLabel: 'Credit Card',
    description: 'Premium credit card with enhanced benefits and worldwide acceptance.',
    reasonsToSell: [
      'No fees for EUR/USD transactions matches client\'s travel habits',
      'Free worldwide card replacement for frequent travelers',
      'Enhanced insurance coverage for travel and purchases'
    ],
    impactLevel: 'medium',
    icon: 'CreditCard',
    documents: [
      { title: 'Visa Gold Benefits', url: '#' },
      { title: 'Fee Structure', url: '#' }
    ],
    sellingPoints: [
      {
        title: 'Travel Benefits',
        points: [
          'No fees for foreign currency transactions',
          'Free worldwide card replacement',
          'Travel insurance included'
        ]
      },
      {
        title: 'Shopping Benefits',
        points: [
          'Extended warranty on purchases',
          'Purchase protection',
          'Concierge service'
        ]
      }
    ]
  },
  {
    id: '3',
    name: 'Fixed-Rate Mortgage',
    category: 'mortgages',
    categoryLabel: 'Mortgage',
    description: 'Secure a fixed interest rate for your mortgage, providing stability in your housing costs.',
    reasonsToSell: [
      'Recently bought a new apartment',
      'Stable interest rate for budget planning',
      'Protection against rising interest rates'
    ],
    impactLevel: 'high',
    icon: 'Home',
    documents: [
      { title: 'Mortgage Terms', url: '#' },
      { title: 'Application Process', url: '#' }
    ],
    sellingPoints: [
      {
        title: 'Financial Stability',
        points: [
          'Fixed monthly payments for the entire term',
          'Protection against market fluctuations',
          'Easier budgeting and financial planning'
        ]
      },
      {
        title: 'Flexible Options',
        points: [
          'Terms from 2 to 15 years',
          'Partial prepayments possible',
          'Combinable with other mortgage products'
        ]
      }
    ]
  },
  {
    id: '4',
    name: 'Green Energy Investment Fund',
    category: 'investment-themes',
    categoryLabel: 'Investment Theme',
    description: 'Invest in renewable energy companies and sustainable technologies.',
    reasonsToSell: [
      'Aligns with client\'s interest in sustainability',
      'Strong long-term growth potential in renewable sector',
      'Portfolio diversification opportunity'
    ],
    impactLevel: 'medium',
    icon: 'TrendingUp',
    documents: [
      { title: 'Fund Prospectus', url: '#' },
      { title: 'Sustainability Report', url: '#' }
    ],
    sellingPoints: [
      {
        title: 'Environmental Impact',
        points: [
          'Support companies committed to renewable energy',
          'Contribute to reducing carbon emissions',
          'Invest in future-oriented technologies'
        ]
      },
      {
        title: 'Financial Potential',
        points: [
          'Growing sector with strong future demand',
          'Government subsidies supporting the industry',
          'Diversification from traditional energy investments'
        ]
      }
    ]
  },
  {
    id: '5',
    name: '3a Retirement Savings Account',
    category: 'pension-products',
    categoryLabel: 'Pension Product',
    description: 'Tax-advantaged retirement savings account for building your pension.',
    reasonsToSell: [
      'Tax benefits through retirement savings',
      'Flexible contribution options',
      'Good foundation for retirement planning'
    ],
    impactLevel: 'high',
    icon: 'PiggyBank',
    documents: [
      { title: '3a Account Information', url: '#' },
      { title: 'Tax Benefits Overview', url: '#' }
    ],
    sellingPoints: [
      {
        title: 'Tax Advantages',
        points: [
          'Reduce taxable income with annual contributions',
          'Tax-free growth during the investment period',
          'Preferential taxation upon withdrawal'
        ]
      },
      {
        title: 'Flexibility',
        points: [
          'Choose between account-based or securities-based solutions',
          'Adjust contribution amount yearly based on your situation',
          'Limited early withdrawal options for home purchase'
        ]
      }
    ]
  },
  {
    id: '6',
    name: 'Household Insurance',
    category: 'insurance',
    categoryLabel: 'Insurance',
    description: 'Comprehensive coverage for your home contents and personal liability.',
    reasonsToSell: [
      'New apartment needs proper insurance coverage',
      'Protection for valuable possessions',
      'Personal liability coverage for daily risks'
    ],
    impactLevel: 'medium',
    icon: 'ShieldCheck',
    documents: [
      { title: 'Insurance Policy Details', url: '#' },
      { title: 'Claims Process', url: '#' }
    ],
    sellingPoints: [
      {
        title: 'Home Protection',
        points: [
          'Coverage for furniture, electronics, and personal belongings',
          'Protection against fire, water damage, and theft',
          'Option to include valuable items specifically'
        ]
      },
      {
        title: 'Liability Coverage',
        points: [
          'Protection if you accidentally damage others\' property',
          'Legal defense costs covered',
          'Worldwide coverage for personal liability incidents'
        ]
      }
    ]
  },
  {
    id: '7',
    name: 'Investment Fund Savings Plan',
    category: 'investment-solutions',
    categoryLabel: 'Investment Solution',
    description: 'Regular investments into selected funds for long-term wealth building.',
    reasonsToSell: [
      'Systematic wealth building with small regular contributions',
      'Professional fund management',
      'Cost averaging benefits in fluctuating markets'
    ],
    impactLevel: 'low',
    icon: 'LineChart',
    documents: [
      { title: 'Savings Plan Guide', url: '#' },
      { title: 'Fund Selection Options', url: '#' }
    ],
    sellingPoints: [
      {
        title: 'Easy Investing',
        points: [
          'Start with as little as CHF 100 per month',
          'Automated regular investments',
          'Adjust or pause contributions anytime'
        ]
      },
      {
        title: 'Investment Strategy',
        points: [
          'Cost averaging to reduce timing risk',
          'Choice of different risk profiles',
          'Access to professionally managed funds'
        ]
      }
    ]
  },
  {
    id: '8',
    name: 'Private Loan',
    category: 'credits-loans',
    categoryLabel: 'Loan',
    description: 'Flexible financing for your personal projects and major purchases.',
    reasonsToSell: [
      'Flexible financing for home renovations or furnishing',
      'Quick approval process',
      'Competitive interest rates'
    ],
    impactLevel: 'low',
    icon: 'Coins',
    documents: [
      { title: 'Loan Terms', url: '#' },
      { title: 'Application Requirements', url: '#' }
    ],
    sellingPoints: [
      {
        title: 'Financing Benefits',
        points: [
          'Amounts from CHF 5,000 to CHF 80,000',
          'Terms from 12 to 84 months',
          'No early repayment penalties'
        ]
      },
      {
        title: 'Application Process',
        points: [
          'Quick decision within 24 hours',
          'Minimal documentation required',
          'Online application available'
        ]
      }
    ]
  },
  {
    id: '9',
    name: 'Wealth Management Mandate',
    category: 'investment-solutions',
    categoryLabel: 'Investment Solution',
    description: 'Professional management of your investment portfolio aligned with your goals.',
    reasonsToSell: [
      'Professional portfolio management',
      'Strategy tailored to risk profile and goals',
      'Regular rebalancing and optimization'
    ],
    impactLevel: 'low',
    icon: 'BarChart3',
    documents: [
      { title: 'Mandate Options', url: '#' },
      { title: 'Investment Philosophy', url: '#' }
    ],
    sellingPoints: [
      {
        title: 'Professional Management',
        points: [
          'Portfolio managed by investment experts',
          'Regular monitoring and rebalancing',
          'Access to institutional investment opportunities'
        ]
      },
      {
        title: 'Personalized Approach',
        points: [
          'Strategy aligned with your risk profile',
          'Regular reporting and performance updates',
          'Adjustments based on changing market conditions'
        ]
      }
    ]
  },
  {
    id: '10',
    name: 'Securities Account',
    category: 'investment-products',
    categoryLabel: 'Investment Product',
    description: 'Secure storage for your stocks, bonds, and other securities.',
    reasonsToSell: [
      'Secure custody for expanding investment portfolio',
      'Access to various investment products',
      'Overview of all securities in one place'
    ],
    impactLevel: 'medium',
    icon: 'Banknote',
    documents: [
      { title: 'Account Features', url: '#' },
      { title: 'Fee Structure', url: '#' }
    ],
    sellingPoints: [
      {
        title: 'Custody Services',
        points: [
          'Secure storage of stocks, bonds, and funds',
          'Dividend and interest collection',
          'Corporate actions processing'
        ]
      },
      {
        title: 'Trading Features',
        points: [
          'Access to Swiss and international markets',
          'Online trading platform',
          'Regular portfolio valuation reports'
        ]
      }
    ]
  }
];

export const suggestedProducts = [
  products[6], // Investment Fund Savings Plan (id: 7)
  products[8], // Wealth Management Mandate (id: 9)
  products[9]  // Securities Account (id: 10)
];
