// Explicit named imports instead of `import * as Icons from 'lucide-react'` --
// a wildcard import defeats tree-shaking and pulls the entire icon library
// (600+ KB) into the bundle just to look up ~12 icons by name. This is the
// full, fixed set of icons any BadgeDefinition.IconName can be (see
// backend/.../Data/DbSeeder.cs) plus the Award fallback for an unknown name.
import {
  Target,
  Trophy,
  Brain,
  Flame,
  MessageSquare,
  Zap,
  Compass,
  BookOpenCheck,
  Award,
  Library,
  GraduationCap,
  MessagesSquare,
} from 'lucide-react';

export const badgeIcons = {
  Target,
  Trophy,
  Brain,
  Flame,
  MessageSquare,
  Zap,
  Compass,
  BookOpenCheck,
  Award,
  Library,
  GraduationCap,
  MessagesSquare,
};
