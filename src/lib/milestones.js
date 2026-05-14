// @/config/milestones.js
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