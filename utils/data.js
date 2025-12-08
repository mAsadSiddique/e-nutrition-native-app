export const categories = [
  { id: 1, name: 'Nutrition' },
  { id: 2, name: 'Fitness' },
  { id: 3, name: 'Weight Loss' },
  { id: 4, name: 'Healthy Recipes' },
  { id: 5, name: 'Supplements' },
  { id: 6, name: 'Mental Health' },
  { id: 7, name: 'Meal Planning' },
  { id: 8, name: 'Diet Plans' },
  { id: 9, name: 'Wellness' },
  { id: 10, name: 'Food Science' },
  { id: 11, name: 'Lifestyle' },
  { id: 12, name: 'Health' },
  { id: 13, name: ' Nutrition' },
];

export const blogs = [
  {
    id: 1,
    title: 'The Complete Guide to Macronutrients',
    description: 'Understanding proteins, carbohydrates, and fats for optimal health and nutrition.',
    author: 'Dr. Sarah Johnson',
    date: 'Nov 15, 2024',
    views: 1250,
    category: ['Nutrition', 'Health'],
    image: { uri: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1600&auto=format&fit=crop' },
    recommended: [2, 3],
    content: [
      { type: 'heading', text: 'Understanding Macronutrients' },
      'Macronutrients are the three main components of food that provide energy: proteins, carbohydrates, and fats. Each plays a crucial role in maintaining optimal health and supporting bodily functions.',
      'Proteins are essential for muscle repair, immune function, and hormone production. They should make up about 10-35% of your daily caloric intake, depending on your activity level and health goals.',
      { type: 'heading', text: 'The Role of Carbohydrates' },
      'Carbohydrates are your body\'s primary source of energy. Complex carbohydrates from whole grains, fruits, and vegetables provide sustained energy and important nutrients.',
      'Simple carbohydrates should be limited, as they can cause blood sugar spikes and provide little nutritional value beyond calories.',
    ]
  },
  {
    id: 2,
    title: 'Meal Prep Made Simple: A Beginner\'s Guide',
    author: 'Chef Maria Rodriguez',
    date: '5d ago',
    image: { uri: 'https://images.unsplash.com/photo-1547592180-85f173990554?q=80&w=1600&auto=format&fit=crop' },
    category: ['Meal Planning', 'Healthy Recipes'],
    description: 'Learn how to meal prep efficiently and save time while eating nutritious meals all week.',
    views: 421,
    comments: 13,
    content: [
      {
        type: 'heading',
        text: 'Why Meal Prep Matters'
      },
      {
        type: 'paragraph',
        text: 'Meal preparation is one of the most effective strategies for maintaining a healthy diet. It saves time, reduces food waste, and helps you make better nutritional choices throughout the week.'
      },
      {
        type: 'heading',
        text: 'Getting Started: Essential Tools'
      },
      {
        type: 'paragraph',
        text: 'Invest in quality glass containers, a good knife set, and measuring tools. Having the right equipment makes meal prep faster and more enjoyable.'
      },
      {
        type: 'heading',
        text: 'Plan Your Week'
      },
      {
        type: 'paragraph',
        text: 'Start by planning 3-4 meals you want to prepare. Choose recipes that use similar ingredients to minimize waste and shopping time.'
      },
      {
        type: 'heading',
        text: 'Batch Cooking Tips'
      },
      {
        type: 'paragraph',
        text: 'Cook grains, proteins, and vegetables in large batches. Store them separately so you can mix and match throughout the week for variety.'
      }
    ],
    recommended: [1, 3],
  },
  {
    id: 3,
    title: 'Understanding Intermittent Fasting: Benefits and Risks',
    author: 'Dr. Michael Chen',
    date: '4d ago',
    image: { uri: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?q=80&w=1600&auto=format&fit=crop' },
    category: ['Diet Plans', 'Weight Loss'],
    description: 'Explore the science behind intermittent fasting and whether it\'s right for your lifestyle.',
    views: 12000,
    comments: 187,
    content: [
      {
        type: 'heading',
        text: 'What is Intermittent Fasting?'
      },
      {
        type: 'paragraph',
        text: 'Intermittent fasting (IF) is an eating pattern that cycles between periods of fasting and eating. It\'s not about what foods to eat, but rather when you should eat them.'
      },
      {
        type: 'heading',
        text: 'Popular IF Methods'
      },
      {
        type: 'paragraph',
        text: 'The 16:8 method involves fasting for 16 hours and eating within an 8-hour window. The 5:2 diet involves eating normally 5 days a week and restricting calories on 2 days.'
      },
      {
        type: 'heading',
        text: 'Potential Benefits'
      },
      {
        type: 'paragraph',
        text: 'Research suggests IF may help with weight loss, improved insulin sensitivity, and cellular repair processes. However, results vary between individuals.'
      },
      {
        type: 'heading',
        text: 'Who Should Avoid IF'
      },
      {
        type: 'paragraph',
        text: 'Pregnant women, people with eating disorders, and those with certain medical conditions should consult healthcare providers before starting any fasting regimen.'
      }
    ],
    recommended: [2, 1],
  },
  {
    id: 4,
    title: 'Plant-Based Protein: Complete Guide for Vegans',
    author: 'Nutritionist Lisa Park',
    date: '3d ago',
    image: { uri: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?q=80&w=1600&auto=format&fit=crop' },
    category: ['Nutrition', 'Supplements'],
    description: 'Discover the best plant-based protein sources and how to meet your daily requirements.',
    views: 8500,
    comments: 92,
    content: [
      {
        type: 'heading',
        text: 'Complete vs Incomplete Proteins'
      },
      {
        type: 'paragraph',
        text: 'Complete proteins contain all nine essential amino acids. While most plant proteins are incomplete, combining different sources throughout the day ensures you get all amino acids.'
      },
      {
        type: 'heading',
        text: 'Top Plant Protein Sources'
      },
      {
        type: 'paragraph',
        text: 'Quinoa, hemp seeds, chia seeds, and soy products are complete proteins. Legumes, nuts, and seeds provide excellent protein when combined properly.'
      }
    ],
    recommended: [1, 2],
  },
  {
    id: 5,
    title: 'Hydration and Performance: How Much Water Do You Need?',
    author: 'Sports Scientist Tom Wilson',
    date: '2d ago',
    image: { uri: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?q=80&w=1600&auto=format&fit=crop' },
    category: ['Sports Nutrition', 'Fitness'],
    description: 'Learn the science of proper hydration for optimal physical and mental performance.',
    views: 6200,
    comments: 45,
    content: [
      {
        type: 'heading',
        text: 'The Importance of Hydration'
      },
      {
        type: 'paragraph',
        text: 'Water makes up about 60% of your body weight and is essential for temperature regulation, joint lubrication, and nutrient transport.'
      },
      {
        type: 'heading',
        text: 'Daily Water Needs'
      },
      {
        type: 'paragraph',
        text: 'The general recommendation is 8 glasses per day, but individual needs vary based on activity level, climate, and overall health.'
      }
    ],
    recommended: [1, 4],
  },
];


