export const courses = [{
    id: '1',
    title: 'Introduction to Web Development',
    description: 'Learn the fundamentals of HTML, CSS, and JavaScript to build modern websites from scratch.',
    instructorId: 'inst-1',
    thumbnail: '/placeholder.jpg',
    category: 'Software Development',
    difficulty: 'Beginner',
    duration: '8 weeks',
    lessons: 24,
    enrollments: 1234,
    rating: 4.8,
    progress: 40,
    price: 0,
    language: 'English',
    isFree: true,
    tags: ['HTML', 'CSS', 'JavaScript'],
    createdAt: '2024-01-15',
    hasCertificate: true,
    hasLifetimeAccess: true,
    hasResources: true,
    paymentLink: '',
    learningOutcomes: [
      'Understand how the web works and the role of HTML, CSS, and JavaScript',
      'Build responsive layouts using modern CSS techniques like Flexbox and Grid',
      'Master JavaScript fundamentals including DOM manipulation and APIs',
      'Deploy a live website to a professional hosting environment'
    ],
    rating: 4.8,
    reviews: [
      {
        id: "rev_1",
        userName: "Isaac Hamid",
        rating: 5,
        comment: "This course helped me refine the Obscura app logic. Highly recommend!",
        date: "2026-04-12"
      }
    ]
  },
  {
    id: '2',
    title: 'Python for Data Science',
    description: 'Master Python programming with a focus on data analysis, visualization, and machine learning basics.',
    instructorId: 'inst-1',
    thumbnail: '/placeholder.jpg',
    category: 'Data Science & AI',
    difficulty: 'Intermediate',
    duration: '10 weeks',
    lessons: 32,
    enrollments: 892,
    rating: 4.9,
    progress: 30,
    price: 0,
    isFree: true,
    language: 'English',
    tags: ['Python', 'Pandas', 'NumPy'],
    createdAt: '2024-02-20',
    hasCertificate: true,
    hasLifetimeAccess: true,
    hasResources: true,
    paymentLink: '',
    learningOutcomes: [
      'Write Python scripts confidently',
      'Analyze datasets using Pandas',
      'Visualize data with Matplotlib',
      'Build simple machine learning models'
    ]
  },
  {
    id: '3',
    title: 'Mobile App Development with React Native',
    description: 'Build cross-platform mobile applications using React Native and JavaScript.',
    instructorId: 'inst-2',
    thumbnail: '/placeholder.jpg',
    category: 'Software Development',
    difficulty: 'Advanced',
    duration: '12 weeks',
    lessons: 40,
    enrollments: 567,
    rating: 4.7,
    progress: 0,
    price: 79.99,
    language: 'English',
    isFree: false,
    tags: ['React Native', 'JavaScript', 'Mobile'],
    createdAt: '2024-03-10',
    hasCertificate: true,
    hasLifetimeAccess: true,
    hasResources: true,
    paymentLink: 'https://example.com/enroll/react-native',
    learningOutcomes: [
      'Build iOS and Android apps',
      'Use navigation and state management',
      'Integrate APIs',
      'Publish apps to app stores'
    ]
  },
  {
    id: '4',
    title: 'Digital Marketing Fundamentals',
    description: 'Learn essential digital marketing strategies including SEO, social media, and content marketing.',
    instructorId: 'inst-1',
    thumbnail: '/placeholder.jpg',
    category: 'Marketing & Sales',
    difficulty: 'Beginner',
    duration: '6 weeks',
    lessons: 18,
    enrollments: 2105,
    rating: 4.6,
    progress: 100,
    language: 'English',
    price: 0,
    isFree: true,
    tags: ['SEO', 'Social Media', 'Content Marketing'],
    createdAt: '2024-01-05',
    hasCertificate: true,
    hasLifetimeAccess: true,
    hasResources: true,
    paymentLink: '',
    learningOutcomes: [
      'Understand SEO basics',
      'Run social media campaigns',
      'Create content strategies',
      'Track marketing metrics'
    ]
  },
  {
    id: '5',
    title: 'UI/UX Design Principles',
    description: 'Master the art of creating beautiful and user-friendly interfaces with industry-standard tools.',
    instructorId: 'inst-2',
    thumbnail: '/placeholder.jpg',
    category: 'Design & UX',
    difficulty: 'Intermediate',
    duration: '8 weeks',
    lessons: 28,
    enrollments: 743,
    language: 'English',
    rating: 4.8,
    progress: 0,
    price: 0,
    isFree: true,
    tags: ['Figma', 'UI Design', 'UX Research'],
    createdAt: '2024-02-28',
    hasCertificate: true,
    hasLifetimeAccess: true,
    hasResources: true,
    paymentLink: '',
    learningOutcomes: [
      'Design wireframes',
      'Create prototypes',
      'Conduct user research',
      'Build design systems'
    ]
  },
  {
    id: '6',
    title: 'Cybersecurity Essentials',
    description: 'Understand cybersecurity fundamentals and learn to protect systems from common threats.',
    instructorId: 'inst-1',
    thumbnail: '/placeholder.jpg',
    category: 'Cybersecurity',
    difficulty: 'Intermediate',
    duration: '10 weeks',
    lessons: 30,
    enrollments: 456,
    rating: 4.9,
    progress: 0,
    price: 89.99,
    isFree: false,
    tags: ['Security', 'Networks', 'Ethical Hacking'],
    createdAt: '2024-03-15',
    hasCertificate: true,
    hasLifetimeAccess: true,
    hasResources: true,
    language: 'English',
    paymentLink: 'https://example.com/enroll/cybersecurity',
    learningOutcomes: [
      'Identify security threats',
      'Secure systems',
      'Understand encryption',
      'Perform vulnerability assessments'
    ]
  },
  {
    id: '7',
    title: 'Advanced JavaScript Concepts',
    description: 'Deep dive into closures, prototypes, asynchronous programming, and design patterns.',
    instructorId: 'inst-2',
    thumbnail: '/placeholder.jpg',
    category: 'Software Development',
    difficulty: 'Advanced',
    duration: '8 weeks',
    lessons: 26,
    enrollments: 985,
    rating: 4.9,
    progress: 0,
    language: 'English',
    price: 59.99,
    isFree: false,
    tags: ['JavaScript', 'ES6', 'Async'],
    createdAt: '2024-04-01',
    hasCertificate: true,
    hasLifetimeAccess: true,
    hasResources: true,
    paymentLink: '',
    learningOutcomes: ['Master closures', 'Understand prototypes', 'Use async/await', 'Apply design patterns']
  },
  {
    id: '8',
    title: 'Backend Development with Node.js',
    description: 'Build scalable server-side applications using Node.js, Express, and databases.',
    instructorId: 'inst-2',
    thumbnail: '/placeholder.jpg',
    category: 'Software Development',
    difficulty: 'Intermediate',
    duration: '10 weeks',
    lessons: 35,
    enrollments: 723,
    language: 'English',
    rating: 4.7,
    progress: 0,
    price: 0,
    isFree: true,
    tags: ['Node.js', 'Express', 'MongoDB'],
    createdAt: '2024-04-10',
    hasCertificate: true,
    hasLifetimeAccess: true,
    hasResources: true,
    paymentLink: '',
    learningOutcomes: [
      'Set up and configure Node.js environments',
      'Build RESTful APIs with Express',
      'Work with NoSQL databases',
      'Deploy applications to production'
    ]
  },
  {
    id: '9',
    title: 'Machine Learning Fundamentals',
    description: 'Learn core machine learning algorithms, model evaluation, and practical implementation with scikit-learn.',
    instructorId: 'inst-1',
    thumbnail: '/placeholder.jpg',
    category: 'Data Science & AI',
    difficulty: 'Advanced',
    duration: '12 weeks',
    lessons: 38,
    enrollments: 578,
    language: 'English',
    rating: 4.9,
    progress: 0,
    price: 0,
    isFree: true,
    tags: ['Machine Learning', 'Scikit-learn', 'TensorFlow'],
    createdAt: '2024-04-20',
    hasCertificate: true,
    hasLifetimeAccess: true,
    hasResources: true,
    paymentLink: '',
    learningOutcomes: [
      'Understand supervised and unsupervised learning',
      'Implement classification and regression models',
      'Evaluate and optimize ML models',
      'Handle real-world datasets'
    ]
  },
  {
    id: '10',
    title: 'Cloud Computing with AWS',
    description: 'Master Amazon Web Services for deploying, scaling, and managing cloud applications.',
    instructorId: 'inst-2',
    thumbnail: '/placeholder.jpg',
    category: 'Cloud & IT',
    difficulty: 'Intermediate',
    duration: '10 weeks',
    lessons: 32,
    enrollments: 634,
    language: 'English',
    rating: 4.8,
    progress: 0,
    price: 0,
    isFree: true,
    tags: ['AWS', 'Cloud', 'EC2', 'S3'],
    createdAt: '2024-04-25',
    hasCertificate: true,
    hasLifetimeAccess: true,
    hasResources: true,
    paymentLink: '',
    learningOutcomes: [
      'Set up AWS accounts and infrastructure',
      'Work with EC2, S3, and RDS',
      'Deploy applications on AWS',
      'Understand cloud security and cost optimization'
    ]
  },
  {
    id: '11',
    title: 'Business Fundamentals & Entrepreneurship',
    description: 'Learn the essentials of starting and running a successful business, from ideation to execution.',
    instructorId: 'inst-1',
    thumbnail: '/placeholder.jpg',
    category: 'Business & Entrepreneurship',
    difficulty: 'Beginner',
    duration: '6 weeks',
    language: 'English',
    lessons: 20,
    enrollments: 1456,
    rating: 4.7,
    progress: 0,
    price: 0,
    isFree: true,
    tags: ['Business', 'Entrepreneurship', 'Startups'],
    createdAt: '2024-05-01',
    hasCertificate: true,
    hasLifetimeAccess: true,
    hasResources: true,
    paymentLink: '',
    learningOutcomes: [
      'Develop a business idea and validate it',
      'Create a comprehensive business plan',
      'Understand market research and competition',
      'Learn funding strategies for startups'
    ]
  },
  {
    id: '12',
    title: 'Financial Accounting & Analysis',
    description: 'Master accounting principles, financial statements, and analysis for informed business decisions.',
    instructorId: 'inst-2',
    thumbnail: '/placeholder.jpg',
    category: 'Finance & Accounting',
    difficulty: 'Intermediate',
    language: 'English',
    duration: '8 weeks',
    lessons: 28,
    enrollments: 542,
    rating: 4.6,
    progress: 0,
    price: 0,
    isFree: true,
    tags: ['Accounting', 'Finance', 'Financial Analysis'],
    createdAt: '2024-05-05',
    hasCertificate: true,
    hasLifetimeAccess: true,
    hasResources: true,
    paymentLink: '',
    learningOutcomes: [
      'Understand accounting principles and standards',
      'Read and analyze financial statements',
      'Calculate and interpret financial ratios',
      'Make data-driven financial decisions'
    ]
  },
  {
    id: '13',
    title: 'Calculus for Beginners',
    description: 'Master the fundamentals of calculus including limits, derivatives, and integrals.',
    instructorId: 'inst-1',
    thumbnail: '/placeholder.jpg',
    category: 'Mathematics',
    difficulty: 'Beginner',
    language: 'English',
    duration: '10 weeks',
    lessons: 30,
    enrollments: 867,
    rating: 4.8,
    progress: 0,
    price: 0,
    isFree: true,
    tags: ['Calculus', 'Limits', 'Derivatives', 'Integrals'],
    createdAt: '2024-05-10',
    hasCertificate: true,
    hasLifetimeAccess: true,
    hasResources: true,
    paymentLink: '',
    learningOutcomes: [
      'Understand limits and continuity',
      'Calculate derivatives and apply them',
      'Integrate functions',
      'Solve real-world optimization problems'
    ]
  },
  {
    id: '14',
    title: 'Physics: Classical Mechanics',
    description: 'Explore the principles of motion, forces, energy, and mechanics with practical examples.',
    instructorId: 'inst-2',
    thumbnail: '/placeholder.jpg',
    category: 'Science',
    difficulty: 'Beginner',
    language: 'English',
    duration: '9 weeks',
    lessons: 27,
    enrollments: 456,
    rating: 4.7,
    progress: 0,
    price: 0,
    isFree: true,
    tags: ['Physics', 'Mechanics', 'Forces', 'Energy'],
    createdAt: '2024-05-15',
    hasCertificate: true,
    hasLifetimeAccess: true,
    hasResources: true,
    paymentLink: '',
    learningOutcomes: [
      'Understand Newton\'s laws of motion',
      'Apply concepts of work, energy, and momentum',
      'Solve mechanics problems',
      'Understand rotational dynamics'
    ]
  },
  {
    id: '15',
    title: 'World History: Medieval to Modern',
    description: 'Journey through pivotal events, cultures, and figures that shaped modern civilization.',
    instructorId: 'inst-2',
    thumbnail: '/placeholder.jpg',
    category: 'Humanities',
    difficulty: 'Beginner',
    duration: '8 weeks',
    lessons: 24,
    enrollments: 712,
    rating: 4.6,
    progress: 0,
    language: 'English',
    price: 0,
    isFree: true,
    tags: ['History', 'Medieval', 'Modern', 'Civilization'],
    createdAt: '2024-05-20',
    hasCertificate: true,
    hasLifetimeAccess: true,
    hasResources: true,
    paymentLink: '',
    learningOutcomes: [
      'Understand major historical periods and events',
      'Analyze the impact of significant historical figures',
      'Explore cultural and social changes',
      'Connect history to contemporary issues'
    ]
  },
  {
    id: '16',
    title: 'Spanish for Beginners',
    description: 'Learn conversational Spanish with practical vocabulary, grammar, and cultural insights.',
    instructorId: 'inst-2',
    thumbnail: '/placeholder.jpg',
    category: 'Languages',
    difficulty: 'Beginner',
    duration: '10 weeks',
    lessons: 40,
    enrollments: 1203,
    language: 'English',
    rating: 4.8,
    progress: 0,
    price: 0,
    isFree: true,
    tags: ['Spanish', 'Language', 'Conversation'],
    createdAt: '2024-05-25',
    hasCertificate: true,
    hasLifetimeAccess: true,
    hasResources: true,
    paymentLink: '',
    learningOutcomes: [
      'Master basic Spanish vocabulary and phrases',
      'Build conversational skills',
      'Understand Spanish grammar fundamentals',
      'Explore Hispanic culture and customs'
    ]
  },
  {
    id: '17',
    title: 'Professional Photography Essentials',
    description: 'Learn composition, lighting, and editing techniques to capture stunning photographs.',
    instructorId: 'inst-2',
    thumbnail: '/placeholder.jpg',
    category: 'Photography & Video',
    difficulty: 'Beginner',
    duration: '7 weeks',
    lessons: 22,
    language: 'English',
    enrollments: 534,
    rating: 4.7,
    progress: 0,
    price: 0,
    isFree: true,
    tags: ['Photography', 'Composition', 'Editing', 'Lighting'],
    createdAt: '2024-06-01',
    hasCertificate: true,
    hasLifetimeAccess: true,
    hasResources: true,
    paymentLink: '',
    learningOutcomes: [
      'Master camera settings and exposure',
      'Understand composition and framing',
      'Work with natural and artificial lighting',
      'Edit photos professionally with Lightroom and Photoshop'
    ]
  },
  {
    id: '18',
    title: 'Music Production Basics',
    description: 'Create music from scratch using DAWs, learn production techniques, and develop your sound.',
    instructorId: 'inst-1',
    thumbnail: '/placeholder.jpg',
    category: 'Music & Arts',
    difficulty: 'Beginner',
    duration: '8 weeks',
    language: 'English',
    lessons: 25,
    enrollments: 623,
    rating: 4.8,
    progress: 0,
    price: 0,
    isFree: true,
    tags: ['Music Production', 'DAW', 'Beat Making'],
    createdAt: '2024-06-05',
    hasCertificate: true,
    hasLifetimeAccess: true,
    hasResources: true,
    paymentLink: '',
    learningOutcomes: [
      'Set up your music production workspace',
      'Learn music theory basics',
      'Use DAWs like Ableton or FL Studio',
      'Mix and master your tracks'
    ]
  },
  {
    id: '19',
    title: 'Leadership & Management Skills',
    description: 'Develop essential leadership qualities, communication skills, and team management techniques.',
    instructorId: 'inst-1',
    thumbnail: '/placeholder.jpg',
    category: 'Personal Development',
    difficulty: 'Intermediate',
    language: 'English',
    duration: '6 weeks',
    lessons: 20,
    enrollments: 945,
    rating: 4.7,
    progress: 0,
    price: 0,
    isFree: true,
    tags: ['Leadership', 'Management', 'Communication'],
    createdAt: '2024-06-10',
    hasCertificate: true,
    hasLifetimeAccess: true,
    hasResources: true,
    paymentLink: '',
    learningOutcomes: [
      'Understand leadership styles and theories',
      'Develop emotional intelligence',
      'Master communication and negotiation',
      'Build and manage high-performing teams'
    ]
  },
  {
    id: '20',
    title: 'Fitness & Wellness',
    description: 'Learn exercise science, nutrition fundamentals, and create sustainable fitness habits.',
    instructorId: 'inst-1',
    thumbnail: '/placeholder.jpg',
    category: 'Health & Fitness',
    difficulty: 'Beginner',
    duration: '8 weeks',
    language: 'English',
    lessons: 24,
    enrollments: 1876,
    rating: 4.9,
    progress: 0,
    price: 0,
    isFree: true,
    tags: ['Fitness', 'Wellness', 'Nutrition', 'Exercise'],
    createdAt: '2024-06-15',
    hasCertificate: true,
    hasLifetimeAccess: true,
    hasResources: true,
    paymentLink: '',
    learningOutcomes: [
      'Understand exercise physiology',
      'Design personalized workout plans',
      'Learn nutrition principles',
      'Build sustainable healthy habits'
    ]
  },
  {
    id: '21',
    title: 'Advanced Excel for Business Analytics',
    description: 'Master Excel functions, pivot tables, and data visualization for business analysis.',
    instructorId: 'inst-2',
    thumbnail: '/placeholder.jpg',
    category: 'Office Productivity',
    difficulty: 'Intermediate',
    duration: '6 weeks',
    lessons: 18,
    enrollments: 1543,
    language: 'English',
    rating: 4.8,
    progress: 0,
    price: 0,
    isFree: true,
    tags: ['Excel', 'Data Analysis', 'Business'],
    createdAt: '2024-06-20',
    hasCertificate: true,
    hasLifetimeAccess: true,
    hasResources: true,
    paymentLink: '',
    learningOutcomes: [
      'Master advanced Excel formulas and functions',
      'Create pivot tables and dashboards',
      'Visualize data effectively',
      'Perform complex business analysis'
    ]
  },
  {
    id: '22',
    title: 'Content Marketing Strategy',
    description: 'Create compelling content that attracts, engages, and converts your audience.',
    instructorId: 'inst-2',
    thumbnail: '/placeholder.jpg',
    category: 'Marketing & Sales',
    difficulty: 'Intermediate',
    duration: '7 weeks',
    lessons: 21,
    language: 'English',
    enrollments: 834,
    rating: 4.6,
    progress: 0,
    price: 0,
    isFree: true,
    tags: ['Content Marketing', 'Strategy', 'Writing'],
    createdAt: '2024-06-25',
    hasCertificate: true,
    hasLifetimeAccess: true,
    hasResources: true,
    paymentLink: '',
    learningOutcomes: [
      'Develop a content strategy',
      'Create engaging blog posts and articles',
      'Master storytelling techniques',
      'Measure content performance'
    ]
  },
  {
    id: '23',
    title: 'Graphic Design with Adobe Creative Suite',
    description: 'Learn professional design skills using Photoshop, Illustrator, and InDesign.',
    instructorId: 'inst-2',
    thumbnail: '/placeholder.jpg',
    category: 'Design & UX',
    difficulty: 'Intermediate',
    duration: '10 weeks',
    lessons: 35,
    enrollments: 678,
    language: 'English',
    rating: 4.8,
    progress: 0,
    price: 0,
    isFree: true,
    tags: ['Graphic Design', 'Adobe', 'Photoshop'],
    createdAt: '2024-07-01',
    hasCertificate: true,
    hasLifetimeAccess: true,
    hasResources: true,
    paymentLink: '',
    learningOutcomes: [
      'Master Photoshop for photo editing',
      'Create vector graphics with Illustrator',
      'Design layouts with InDesign',
      'Build a professional design portfolio'
    ]
  },
  {
    id: '24',
    title: 'Video Production & Editing',
    description: 'Produce and edit professional-quality videos using industry-standard software and techniques.',
    instructorId: 'inst-2',
    thumbnail: '/placeholder.jpg',
    category: 'Photography & Video',
    difficulty: 'Intermediate',
    duration: '9 weeks',
    lessons: 28,
    enrollments: 456,
    rating: 4.7,
    language: 'English',
    progress: 0,
    price: 0,
    isFree: true,
    tags: ['Video Production', 'Editing', 'Filmmaking'],
    createdAt: '2024-07-05',
    hasCertificate: true,
    hasLifetimeAccess: true,
    hasResources: true,
    paymentLink: '',
    learningOutcomes: [
      'Plan and shoot video content',
      'Edit videos with Adobe Premiere Pro',
      'Add effects and animations',
      'Export and optimize for different platforms'
    ]
  },
  {
    id: '25',
    title: 'Time Management & Productivity Hacks',
    description: 'Master techniques to maximize productivity, eliminate distractions, and achieve your goals.',
    instructorId: 'inst-2',
    thumbnail: '/placeholder.jpg',
    category: 'Personal Development',
    difficulty: 'Beginner',
    duration: '4 weeks',
    lessons: 12,
    enrollments: 2341,
    rating: 4.9,
    language: 'English',
    progress: 0,
    price: 0,
    isFree: true,
    tags: ['Time Management', 'Productivity', 'Habits'],
    createdAt: '2024-07-10',
    hasCertificate: true,
    hasLifetimeAccess: true,
    hasResources: true,
    paymentLink: '',
    learningOutcomes: [
      'Master time management methodologies',
      'Identify and eliminate productivity killers',
      'Build habits that stick',
      'Achieve work-life balance'
    ]
  }
];

export const lessons = [
  {
    id: '1',
    courseId: '1',
    title: 'Introduction to HTML',
    description: 'Learn the basic structure of HTML documents and common tags.',
    duration: '45 min',
    videoUrl: 'https://youtu.be/Wkn2hqIo0iE?si=Ehdltc3mthsHCIQB',
    VideoFile: '',
    content: `
      <h2>What is HTML?</h2>
      <p>HTML (HyperText Markup Language) is the standard markup language for creating web pages. It describes the structure of a web page and consists of a series of elements that tell the browser how to display the content.</p>
      
      <h3>Basic Structure</h3>
      <p>Every HTML document starts with a doctype declaration, followed by the html, head, and body elements.</p>
      
      <h3>Common Tags</h3>
      <ul>
        <li><strong>&lt;h1&gt; to &lt;h6&gt;</strong> - Headings</li>
        <li><strong>&lt;p&gt;</strong> - Paragraphs</li>
        <li><strong>&lt;a&gt;</strong> - Links</li>
        <li><strong>&lt;img&gt;</strong> - Images</li>
        <li><strong>&lt;div&gt;</strong> - Divisions</li>
      </ul>
    `,
    resources: [
      {
        id: 'r1',
        title: 'HTML Cheat Sheet',
        url: 'https://example.com/html-cheatsheet.pdf',
        type: 'link',
      },
      {
        id: 'r2',
        title: 'MDN Structure Guide',
        url: 'https://developer.mozilla.org/en-US/docs/Web/HTML/Element/html',
        type: 'link'
      },
      {
        id: 'r3',
        title: 'Document Flow Diagram',
        url: '/images/student1.jpg',
        type: 'image'
      },
    ],
    isCompleted: true,
    order: 1,
  },
  {
    id: '2',
    courseId: '1',
    title: 'CSS Fundamentals',
    description: 'Style your web pages with CSS selectors, properties, and values.',
    duration: '60 min',
    videoUrl: 'https://youtu.be/Wkn2hqIo0iE?si=Ehdltc3mthsHCIQB',
    content: `
      <h2>Introduction to CSS</h2>
      <p>CSS (Cascading Style Sheets) is used to style and layout web pages. It controls colors, fonts, spacing, and positioning of HTML elements.</p>
      
      <h3>CSS Selectors</h3>
      <p>Selectors are patterns used to select the elements you want to style.</p>
      
      <h3>Box Model</h3>
      <p>Every element in CSS is a box. Understanding the box model is crucial for layout design.</p>
    `,
    isCompleted: true,
    order: 2
  },
  {
    id: '3',
    courseId: '1',
    title: 'JavaScript Basics',
    description: 'Add interactivity to your websites with JavaScript fundamentals.',
    duration: '75 min',
    videoUrl: 'https://youtu.be/Wkn2hqIo0iE?si=Ehdltc3mthsHCIQB',
    content: `
      <h2>What is JavaScript?</h2>
      <p>JavaScript is a programming language that enables interactive web pages. It runs in the browser and allows you to create dynamic content.</p>
      
      <h3>Variables and Data Types</h3>
      <p>Learn about let, const, strings, numbers, booleans, and objects.</p>
      
      <h3>Functions</h3>
      <p>Functions are reusable blocks of code that perform specific tasks.</p>
    `,
    isCompleted: false,
    order: 3
  },
  {
    id: '4',
    courseId: '1',
    title: 'DOM Manipulation',
    description: 'Learn to interact with HTML elements using JavaScript.',
    duration: '90 min',
    videoUrl: '',
    content: `
      <h2>The Document Object Model</h2>
      <p>The DOM represents the HTML document as a tree structure. JavaScript can access and modify this structure.</p>
    `,
    isCompleted: false,
    order: 4
  },
  {
    id: '5',
    courseId: '1',
    title: 'Responsive Web Design',
    description: 'Create websites that work on all devices and screen sizes.',
    duration: '60 min',
    videoUrl: '',
    content: `
      <h2>What is Responsive Design?</h2>
      <p>Responsive design ensures your website looks great on all devices, from phones to desktops.</p>
    `,
    isCompleted: false,
    order: 5
  }
]

export const quizzes = [
  {
    id: '1',
    courseId: '1',
    lessonId: '1',
    title: 'HTML Basics Quiz',
    duration: 180,
    questions: [
      {
        id: '1',
        question: 'What does HTML stand for?',
        options: [
          'Hyper Text Markup Language',
          'High Tech Modern Language',
          'Home Tool Markup Language',
          'Hyperlinks and Text Markup Language'
        ],
        correctAnswer: 0
      },
      {
        id: '2',
        question: 'Which tag is used for the largest heading?',
        options: ['<h6>', '<heading>', '<h1>', '<head>'],
        correctAnswer: 2
      },
      {
        id: '3',
        question: 'Which attribute specifies the URL in an anchor tag?',
        options: ['link', 'src', 'href', 'url'],
        correctAnswer: 2
      },
      {
        id: '4',
        question: 'What is the correct HTML element for inserting a line break?',
        options: ['<break>', '<lb>', '<br>', '<newline>'],
        correctAnswer: 2
      },
      {
        id: '5',
        question: 'Which HTML element defines the title of a document?',
        options: ['<meta>', '<title>', '<head>', '<header>'],
        correctAnswer: 1
      }
    ]
  }
]

export const categories = [
  'All Categories',
  
  // --- TECH & DEV ---
  'Software Development',  // Groups Web, Mobile, Backend
  'Data Science & AI',
  'Cybersecurity',
  'Cloud & IT',
  
  // --- BUSINESS & FINANCE ---
  'Business & Entrepreneurship',
  'Finance & Accounting',
  'Marketing & Sales',
  
  // --- ACADEMICS ---
  'Mathematics',          // Algebra, Calculus, Statistics
  'Science',              // Physics, Biology, Chemistry
  'Humanities',           // History, Literature, Philosophy
  'Languages',            // English, Spanish, Japanese, etc.
  
  // --- CREATIVE ---
  'Design & UX',
  'Photography & Video',
  'Music & Arts',
  
  // --- LIFESTYLE & SOFT SKILLS ---
  'Personal Development', // Leadership, Time Management
  'Health & Fitness',
  'Office Productivity',  // Excel, Google Workspace
  'Others'
]

export const difficulties = ['All Levels', 'Beginner', 'Intermediate', 'Advanced']

export const instructorStats = {
  totalCourses: 8,
  totalStudents: 4532,
  totalEarnings: 12450,
  averageRating: 4.8,
  completionRate: 78,
  monthlyEnrollments: [
    { month: 'Jan', enrollments: 245 },
    { month: 'Feb', enrollments: 312 },
    { month: 'Mar', enrollments: 428 },
    { month: 'Apr', enrollments: 389 },
    { month: 'May', enrollments: 456 },
    { month: 'Jun', enrollments: 521 }
  ],
  coursePerformance: [
    { name: 'Web Dev', students: 1234, completion: 65 },
    { name: 'Python', students: 892, completion: 72 },
    { name: 'React Native', students: 567, completion: 58 },
    { name: 'Marketing', students: 2105, completion: 81 },
    { name: 'UI/UX', students: 743, completion: 69 }
  ],
  recentStudents: [
    { id: '1', name: 'Adaeze Nwankwo', course: 'Web Development', joinedDate: '2 hours ago', progress: 45 },
    { id: '2', name: 'Kofi Asante', course: 'Python for Data Science', joinedDate: '5 hours ago', progress: 20 },
    { id: '3', name: 'Amara Diop', course: 'UI/UX Design', joinedDate: '1 day ago', progress: 10 },
    { id: '4', name: 'Emeka Obi', course: 'Web Development', joinedDate: '2 days ago', progress: 78 }
  ]
}

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
];

export const notifications = [];

export const getMilestones = (stats, user, unreadCount) => [
  {
    condition: stats.lessonsCompletedCount >= 1,
    id: 'FIRST_STEPS',
    type: 'achievement',
    title: 'First Step Badge Unlocked',
    message: 'You completed your very first lesson.'
  },
  {
    condition: stats.coursesCompletedCount >= 1,
    id: 'COURSE_CHAMPION',
    type: 'achievement',
    title: 'Course Champion Badge Unlocked',
    message: 'Awarded for successfully finishing an entire course.'
  },
  {
    condition: stats.perfectQuizzes >= 5,
    id: 'QUIZ_MASTER',
    type: 'achievement',
    title: 'Quiz Master Badge Unlocked',
    message: 'Achieve a perfect 100% score on 5 different quizzes.'
  },
  {
    condition: stats.streak >= 7,
    id: 'CONSISTENT_LEARNER',
    type: 'achievement',
    title: 'Consistent Learner Badge Unlocked',
    message: 'Maintain a learning streak for 7 consecutive days.'
  },
  {
    condition: stats.reviewsCount >= 10,
    id: 'SOCIAL_BUTTERFLY',
    type: 'community',
    title: 'Social Butterfly Badge Unlocked',
    message: 'Contribute to the community by leaving 10 course reviews.'
  },
  {
    condition: stats.fastFinishCount >= 1,
    id: 'SPEED_LEARNER',
    type: 'achievement',
    title: 'Speed Learner Badge Unlocked',
    message: 'Finish any full course within 7 days of enrollment.'
  },
  {
    condition: stats.isProfileComplete === 1,
    id: 'PATHFINDER',
    type: 'achievement',
    title: 'Pathfinder Badge Unlocked',
    message: 'Complete your profile and set your learning goals.'
  }
];

export const instructors = [
  {
    id: 'inst-1',
    name: 'Prof. Kwame Mensah',
    title: 'Senior Data Scientist & Academic',
    avatar: '/placeholder-user.jpg',
    bio: 'Over 15 years of experience in statistical modeling and machine learning. Kwame has led data teams at global tech firms.',
    rating: 4.9,
    totalStudents: 400,
    coursesCount: 5,
    portfolio:'https://kwamemensah.com',
    skills: ['Python', 'R', 'TensorFlow', 'SQL']
  },
  {
    id: 'inst-2',
    name: 'Fatima Diallo',
    title: 'Full Stack Engineer & Mobile Expert',
    avatar: '/placeholder-user.jpg',
    bio: 'A passionate developer advocate and cross-platform specialist. Fatima has built apps used by millions in the fintech space.',
    rating: 4.8,
    totalStudents: 890,
    coursesCount: 3,
    portfolio:'https://kwamemensah.com',
    skills: ['React Native', 'Node.js', 'TypeScript', 'AWS']
  }
]