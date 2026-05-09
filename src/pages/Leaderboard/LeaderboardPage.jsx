import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/common/Card';

const leaderboardData = [
  { rank: 1, name: 'Chidinma Okafor', points: 15420, courses: 12, badges: 24, avatar: 'C', streak: 45 },
  { rank: 2, name: 'Kwame Asante', points: 14850, courses: 11, badges: 22, avatar: 'K', streak: 38 },
  { rank: 3, name: 'Fatima Hassan', points: 13200, courses: 10, badges: 20, avatar: 'F', streak: 32 },
  { rank: 4, name: 'Emmanuel Nkosi', points: 12100, courses: 9, badges: 18, avatar: 'E', streak: 28 },
  { rank: 5, name: 'Amara Diallo', points: 11500, courses: 9, badges: 17, avatar: 'A', streak: 25 },
  { rank: 6, name: 'Ibrahim Toure', points: 10800, courses: 8, badges: 16, avatar: 'I', streak: 22 },
  { rank: 7, name: 'Grace Mensah', points: 10200, courses: 8, badges: 15, avatar: 'G', streak: 20 },
  { rank: 8, name: 'David Osei', points: 9600, courses: 7, badges: 14, avatar: 'D', streak: 18 },
  { rank: 9, name: 'Aisha Kamara', points: 9100, courses: 7, badges: 13, avatar: 'A', streak: 15 },
  { rank: 10, name: 'Samuel Banda', points: 8700, courses: 6, badges: 12, avatar: 'S', streak: 14 },
];

const timeframes = ['This Week', 'This Month', 'All Time'];
const categories = ['Overall', 'Courses', 'Badges', 'Streak'];

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [selectedTimeframe, setSelectedTimeframe] = useState('This Week');
  const [selectedCategory, setSelectedCategory] = useState('Overall');

  const currentUserRank = {
    rank: 15,
    name: user?.name || 'You',
    points: 5200,
    courses: 4,
    badges: 8,
    avatar: user?.name?.charAt(0) || 'Y',
    streak: 7,
  };

  const getRankStyles = (rank) => {
    switch (rank) {
      case 1:
        return 'bg-gradient-to-r from-yellow-400 to-amber-500 text-white';
      case 2:
        return 'bg-gradient-to-r from-slate-300 to-slate-400 text-slate-800';
      case 3:
        return 'bg-gradient-to-r from-amber-600 to-amber-700 text-white';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getMedalIcon = (rank) => {
    const colors = {
      1: 'text-yellow-500',
      2: 'text-slate-400',
      3: 'text-amber-600',
    };
    if (rank <= 3) {
      return (
        <svg className={`w-6 h-6 ${colors[rank]}`} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      );
    }
    return <span className="text-muted-foreground font-bold">#{rank}</span>;
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Leaderboard</h1>
        <p className="text-muted-foreground mt-2">See how you rank among other learners</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="flex gap-2 p-1 bg-muted rounded-xl">
          {timeframes.map((tf) => (
            <button
              key={tf}
              onClick={() => setSelectedTimeframe(tf)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedTimeframe === tf
                  ? 'bg-background text-foreground shadow'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
        <div className="flex gap-2 p-1 bg-muted rounded-xl">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                selectedCategory === cat
                  ? 'bg-background text-foreground shadow'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Top 3 Podium */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {/* Second Place */}
        <div className="order-1 md:order-1">
          <Card className="text-center pt-8 pb-6 bg-gradient-to-b from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 border-slate-300 dark:border-slate-700">
            <div className="relative inline-block">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center text-2xl font-bold text-slate-800 mx-auto">
                {leaderboardData[1].avatar}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-slate-400 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                2
              </div>
            </div>
            <h3 className="mt-4 font-bold text-foreground">{leaderboardData[1].name}</h3>
            <p className="text-2xl font-bold text-slate-500 mt-2">{leaderboardData[1].points.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">points</p>
          </Card>
        </div>

        {/* First Place */}
        <div className="order-0 md:order-2 -mt-4">
          <Card className="text-center pt-10 pb-8 bg-gradient-to-b from-yellow-100 to-amber-50 dark:from-yellow-900/30 dark:to-amber-900/20 border-yellow-300 dark:border-yellow-700 shadow-xl">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2">
              <svg className="w-12 h-12 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5z" />
              </svg>
            </div>
            <div className="relative inline-block">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-3xl font-bold text-white mx-auto ring-4 ring-yellow-300 dark:ring-yellow-600">
                {leaderboardData[0].avatar}
              </div>
              <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold shadow-lg">
                1
              </div>
            </div>
            <h3 className="mt-4 font-bold text-lg text-foreground">{leaderboardData[0].name}</h3>
            <p className="text-3xl font-bold text-yellow-600 dark:text-yellow-400 mt-2">{leaderboardData[0].points.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">points</p>
            <div className="flex justify-center gap-4 mt-4 text-sm">
              <span className="text-muted-foreground">{leaderboardData[0].courses} courses</span>
              <span className="text-muted-foreground">{leaderboardData[0].streak} day streak</span>
            </div>
          </Card>
        </div>

        {/* Third Place */}
        <div className="order-2 md:order-3">
          <Card className="text-center pt-8 pb-6 bg-gradient-to-b from-amber-100 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/20 border-amber-300 dark:border-amber-700">
            <div className="relative inline-block">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-2xl font-bold text-white mx-auto">
                {leaderboardData[2].avatar}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                3
              </div>
            </div>
            <h3 className="mt-4 font-bold text-foreground">{leaderboardData[2].name}</h3>
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400 mt-2">{leaderboardData[2].points.toLocaleString()}</p>
            <p className="text-sm text-muted-foreground">points</p>
          </Card>
        </div>
      </div>

      {/* Full Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle>Full Rankings</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Rank</th>
                  <th className="text-left p-4 text-sm font-medium text-muted-foreground">Learner</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground">Points</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground hidden sm:table-cell">Courses</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground hidden md:table-cell">Badges</th>
                  <th className="text-right p-4 text-sm font-medium text-muted-foreground hidden lg:table-cell">Streak</th>
                </tr>
              </thead>
              <tbody>
                {leaderboardData.map((learner, index) => (
                  <tr
                    key={learner.rank}
                    className={`border-b border-border hover:bg-muted/50 transition-colors ${
                      index < 3 ? 'bg-primary/5' : ''
                    }`}
                  >
                    <td className="p-4">
                      <div className="flex items-center justify-center w-8">
                        {getMedalIcon(learner.rank)}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${getRankStyles(learner.rank)}`}>
                          {learner.avatar}
                        </div>
                        <span className="font-medium text-foreground">{learner.name}</span>
                      </div>
                    </td>
                    <td className="p-4 text-right font-semibold text-foreground">
                      {learner.points.toLocaleString()}
                    </td>
                    <td className="p-4 text-right text-muted-foreground hidden sm:table-cell">
                      {learner.courses}
                    </td>
                    <td className="p-4 text-right text-muted-foreground hidden md:table-cell">
                      {learner.badges}
                    </td>
                    <td className="p-4 text-right hidden lg:table-cell">
                      <span className="inline-flex items-center gap-1 text-accent">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                        </svg>
                        {learner.streak}
                      </span>
                    </td>
                  </tr>
                ))}

                {/* Current User */}
                <tr className="bg-primary/10 border-2 border-primary/30">
                  <td className="p-4">
                    <span className="text-muted-foreground font-bold">#{currentUserRank.rank}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-sm font-bold text-primary-foreground ring-2 ring-primary/30">
                        {currentUserRank.avatar}
                      </div>
                      <span className="font-medium text-foreground">{currentUserRank.name} (You)</span>
                    </div>
                  </td>
                  <td className="p-4 text-right font-semibold text-primary">
                    {currentUserRank.points.toLocaleString()}
                  </td>
                  <td className="p-4 text-right text-muted-foreground hidden sm:table-cell">
                    {currentUserRank.courses}
                  </td>
                  <td className="p-4 text-right text-muted-foreground hidden md:table-cell">
                    {currentUserRank.badges}
                  </td>
                  <td className="p-4 text-right hidden lg:table-cell">
                    <span className="inline-flex items-center gap-1 text-accent">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
                      </svg>
                      {currentUserRank.streak}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
