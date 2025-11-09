export const categories = [
  { id: 1, name: 'Programming' },
  { id: 2, name: 'Technology' },
  { id: 3, name: 'Self Improvement' },
  { id: 4, name: 'Writing' },
  { id: 5, name: 'Relationships' },
  { id: 6, name: 'Machine Learning' },
  { id: 7, name: 'Productivity' },
  { id: 8, name: 'Politics' },
  { id: 9, name: 'Cryptocurrency' },
  { id: 10, name: 'Psychology' },
];

export const blogs = [
  {
    id: 1,
    title: 'Planning for a Big Adventure? You Need a Walk-Out Workout',
    author: 'Matt Traverso Ph.D.',
    date: '5d ago',
    image: { uri: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1600&auto=format&fit=crop' },
    category: 'Self Improvement',
    description:
      'Our greatest fitness accomplishments arise from daily, practical routines that build endurance.',
    views: 519,
    comments: 8,
    content: [
      'A walk-out workout is an endlessly engaging exercise that can be adapted to any environment.',
      'It helps improve endurance and can be started with minimal preparation.',
      'Consistency is the real differentiator in fitness success—build small, repeatable habits.',
    ],
    recommended: [2, 3],
  },
  {
    id: 2,
    title: 'Reading More Books in a World of Distractions',
    author: 'Brad Dunn',
    date: '5d ago',
    image: { uri: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?q=80&w=1600&auto=format&fit=crop' },
    category: 'Life',
    description:
      'Why is it so hard to read 50 books a year? Learn tactics that work.',
    views: 421,
    comments: 13,
    content: [
      'Modern life is optimized for distraction, not deep reading.',
      'Make a reading ritual: time, place, and a small frictionless stack of books.',
      'Track your wins and share notes to reinforce the habit.',
    ],
    recommended: [1, 3],
  },
  {
    id: 3,
    title: 'The Subtle Art of Writing Clear Technical Docs',
    author: 'A. Rivera',
    date: '4d ago',
    image: { uri: 'https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?q=80&w=1600&auto=format&fit=crop' },
    category: 'Writing',
    description:
      'Tech docs that developers love are simple, scannable, and relentlessly accurate.',
    views: 12000,
    comments: 187,
    content: [
      'Great documentation reduces support load and accelerates adoption.',
      'Use concrete examples and provide copy-pastable snippets.',
      'Keep a changelog and make docs part of the CI pipeline.',
    ],
    recommended: [2, 1],
  },
];


