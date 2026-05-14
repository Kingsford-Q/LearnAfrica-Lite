export const courses = [
  {
    id: '1',
    title: 'Introduction to Web Development',
    description: 'Learn the fundamentals of HTML, CSS, and JavaScript to build modern websites from scratch.',
    instructor: 'Dr. Amina Okonkwo',
    instructorAvatar: '/placeholder-user.jpg',
    thumbnail: '/placeholder.jpg',
    category: 'Web Development',
    difficulty: 'Beginner',
    duration: '8 weeks',
    lessons: 24,
    enrollments: 1234,
    rating: 4.8,
    progress: 40,
    price: 0,
    isFree: true,
    tags: ['HTML', 'CSS', 'JavaScript'],
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    title: 'Python for Data Science',
    description: 'Master Python programming with a focus on data analysis, visualization, and machine learning basics.',
    instructor: 'Prof. Kwame Mensah',
    instructorAvatar: '/placeholder-user.jpg',
    thumbnail: '/placeholder.jpg',
    category: 'Data Science',
    difficulty: 'Intermediate',
    duration: '10 weeks',
    lessons: 32,
    enrollments: 892,
    rating: 4.9,
    progress: 30,
    price: 49.99,
    isFree: true,
    tags: ['Python', 'Pandas', 'NumPy'],
    createdAt: '2024-02-20'
  },
  {
    id: '3',
    title: 'Mobile App Development with React Native',
    description: 'Build cross-platform mobile applications using React Native and JavaScript.',
    instructor: 'Fatima Diallo',
    instructorAvatar: '/placeholder-user.jpg',
    thumbnail: '/placeholder.jpg',
    category: 'Mobile Development',
    difficulty: 'Advanced',
    duration: '12 weeks',
    lessons: 40,
    enrollments: 567,
    rating: 4.7,
    progress: 0,
    price: 79.99,
    isFree: false,
    tags: ['React Native', 'JavaScript', 'Mobile'],
    createdAt: '2024-03-10'
  },
  {
    id: '4',
    title: 'Digital Marketing Fundamentals',
    description: 'Learn essential digital marketing strategies including SEO, social media, and content marketing.',
    instructor: 'Chioma Adeyemi',
    instructorAvatar: '/placeholder-user.jpg',
    thumbnail: '/placeholder.jpg',
    category: 'Marketing',
    difficulty: 'Beginner',
    duration: '6 weeks',
    lessons: 18,
    enrollments: 2105,
    rating: 4.6,
    progress: 100,
    price: 0,
    isFree: true,
    tags: ['SEO', 'Social Media', 'Content'],
    createdAt: '2024-01-05'
  },
  {
    id: '5',
    title: 'UI/UX Design Principles',
    description: 'Master the art of creating beautiful and user-friendly interfaces with industry-standard tools.',
    instructor: 'Oluwaseun Bakare',
    instructorAvatar: '/placeholder-user.jpg',
    thumbnail: '/placeholder.jpg',
    category: 'Design',
    difficulty: 'Intermediate',
    duration: '8 weeks',
    lessons: 28,
    enrollments: 743,
    rating: 4.8,
    progress: 0,
    price: 59.99,
    isFree: true,
    tags: ['Figma', 'UI Design', 'UX Research'],
    createdAt: '2024-02-28'
  },
  {
    id: '6',
    title: 'Cybersecurity Essentials',
    description: 'Understand cybersecurity fundamentals and learn to protect systems from common threats.',
    instructor: 'Ibrahim Hassan',
    instructorAvatar: '/placeholder-user.jpg',
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
    createdAt: '2024-03-15'
  }
]

export const lessons = [
  {
    id: '1',
    courseId: '1',
    title: 'Introduction to HTML',
    description: 'Learn the basic structure of HTML documents and common tags.',
    duration: '45 min',
    videoUrl: 'https://music.youtube.com/watch?v=lVT5dnIibF4&si=_xaMHahKzh3ndlx4',
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
    isCompleted: true,
    order: 1
  },
  {
    id: '2',
    courseId: '1',
    title: 'CSS Fundamentals',
    description: 'Style your web pages with CSS selectors, properties, and values.',
    duration: '60 min',
    videoUrl: 'https://example.com/video2',
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
    videoUrl: 'https://example.com/video3',
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
    videoUrl: 'https://example.com/video4',
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
    videoUrl: 'https://example.com/video5',
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
  'Web Development',
  'Data Science',
  'Mobile Development',
  'Marketing',
  'Design',
  'Cybersecurity',
  'Business',
  'Finance'
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
    title: 'Target: Badge Unlocked: First Steps',
    message: 'You completed your very first lesson.'
  },
  {
    condition: stats.coursesCompletedCount >= 1,
    id: 'COURSE_CHAMPION',
    type: 'achievement',
    title: 'Trophy: Badge Unlocked: Course Champion',
    message: 'Awarded for successfully finishing an entire course.'
  },
  {
    condition: stats.perfectQuizzes >= 5,
    id: 'QUIZ_MASTER',
    type: 'achievement',
    title: 'Brain: Badge Unlocked: Quiz Master',
    message: 'Achieve a perfect 100% score on 5 different quizzes.'
  },
  {
    condition: stats.streak >= 7,
    id: 'CONSISTENT_LEARNER',
    type: 'achievement',
    title: 'Flame: Badge Unlocked: Consistent Learner',
    message: 'Maintain a learning streak for 7 consecutive days.'
  },
  {
    condition: stats.reviewsCount >= 10,
    id: 'SOCIAL_BUTTERFLY',
    type: 'community',
    title: 'MessageSquare: Badge Unlocked: Social Butterfly',
    message: 'Contribute to the community by leaving 10 course reviews.'
  },
  {
    condition: stats.fastFinishCount >= 1,
    id: 'SPEED_LEARNER',
    type: 'achievement',
    title: 'Zap: Badge Unlocked: Speed Learner',
    message: 'Finish any full course within 7 days of enrollment.'
  },
  {
    condition: stats.isProfileComplete === 1,
    id: 'PATHFINDER',
    type: 'system',
    title: 'Compass: Badge Unlocked: Pathfinder',
    message: 'Complete your profile and set your learning goals.'
  }
];