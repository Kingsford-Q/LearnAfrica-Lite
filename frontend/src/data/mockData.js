export const badgeConfig = [
  {
    id: '1',
    key: 'FIRST_STEPS',
    title: 'First Steps',
    description: 'Unlocked by completing your very first lesson.',
    iconName: 'Target',
    requirementType: 'lessons_completed',
    goal: 1,
    color: 'orange'
  },
  {
    id: '2',
    key: 'COURSE_CHAMPION',
    title: 'Course Champion',
    description: 'Awarded for successfully finishing an entire course.',
    iconName: 'Trophy',
    requirementType: 'courses_completed',
    goal: 1,
    color: 'yellow'
  },
  {
    id: '3',
    key: 'QUIZ_MASTER',
    title: 'Quiz Master',
    description: 'Achieve a perfect 100% score on 5 different quizzes.',
    iconName: 'Brain',
    requirementType: 'perfect_quizzes',
    goal: 5,
    color: 'purple'
  },
  {
    id: '4',
    key: 'CONSISTENT_LEARNER',
    title: 'Consistent Learner',
    description: 'Maintain a learning streak for 7 consecutive days.',
    iconName: 'Flame',
    requirementType: 'day_streak',
    goal: 7,
    color: 'red'
  },
  {
    id: '5',
    key: 'SOCIAL_BUTTERFLY',
    title: 'Social Butterfly',
    description: 'Contribute to the community by leaving 10 course reviews.',
    iconName: 'MessageSquare',
    requirementType: 'reviews_submitted',
    goal: 10,
    color: 'blue'
  },
  {
    id: '6',
    key: 'SPEED_LEARNER',
    title: 'Speed Learner',
    description: 'Finish any full course within 7 days of enrollment.',
    iconName: 'Zap',
    requirementType: 'fast_finish',
    goal: 1,
    color: 'amber'
  },
  {
    id: '7',
    key: 'PATHFINDER',
    title: 'Pathfinder',
    description: 'Complete your profile and set your learning goals.',
    iconName: 'Compass',
    requirementType: 'profile_completed',
    goal: 1,
    color: 'emerald'
  }
]

export const testimonials = [
  {
    id: '1',
    name: 'Adaeze Nwankwo',
    role: 'Software Developer',
    company: 'TechAfrica Inc.',
    avatar: '/images/student1.jpg',
    content: 'LearnAfrica Lite transformed my career. The courses are well-structured and the instructors are amazing. I went from zero coding knowledge to landing my dream job in just 6 months!',
    rating: 4
  },
  {
    id: '2',
    name: 'Kofi Asante',
    role: 'Data Analyst',
    company: 'DataHub Ghana',
    avatar: '/images/student3.jpg',
    content: 'The Python for Data Science course was exactly what I needed. The hands-on projects and real-world examples made learning so much easier.',
    rating: 5
  },
  {
    id: '3',
    name: 'Fatou Mbaye',
    role: 'UX Designer',
    company: 'DesignLab Senegal',
    avatar: '/images/student5.jpg',
    content: 'I love how the platform makes learning accessible and engaging. The UI/UX course helped me transition from graphic design to product design seamlessly.',
    rating: 5
  }
]

export const difficulties = ['All Levels', 'Beginner', 'Intermediate', 'Advanced']

export const categories = [
  'All Categories',

  // --- TECH & DEV ---
  'Software Development',
  'Data Science & AI',
  'Cybersecurity',
  'Cloud & IT',

  // --- BUSINESS & FINANCE ---
  'Business & Entrepreneurship',
  'Finance & Accounting',
  'Marketing & Sales',

  // --- ACADEMICS ---
  'Mathematics',
  'Science',
  'Humanities',
  'Languages',

  // --- CREATIVE ---
  'Design & UX',
  'Photography & Video',
  'Music & Arts',

  // --- LIFESTYLE & SOFT SKILLS ---
  'Personal Development',
  'Health & Fitness',
  'Office Productivity',
  'Others'
]
