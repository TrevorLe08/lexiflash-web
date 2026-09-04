export enum UserRole {
  USER = "USER",
  ADMIN = "ADMIN",
}

export enum PrivacyLevel {
  PUBLIC = "PUBLIC",
  PRIVATE = "PRIVATE",
  PASSWORD = "PASSWORD",
  UNLISTED = "UNLISTED",
}

export type StudyLevel = "BEGINNER" | "INTERMEDIATE" | "ADVANCED" | "ALL";

export enum CardStudyStatus {
  NOT_STUDIED = "NOT_STUDIED",
  LEARNING = "LEARNING",
  MASTERED = "MASTERED",
}

export enum StudyMode {
  FLASHCARDS = "FLASHCARDS",
  LEARN = "LEARN",
  WRITE = "WRITE",
  TEST = "TEST",
  MATCH = "MATCH",
}

export enum QuestionType {
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  TRUE_FALSE = "TRUE_FALSE",
  WRITTEN = "WRITTEN",
  MATCHING = "MATCHING",
}

export enum ClassRole {
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
}

export type StreakStatus = "ACTIVE" | "COOLED" | "BROKEN" | "INACTIVE";

export interface User {
  id: string;
  email: string;
  username: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  role: UserRole;
  isBanned?: boolean;
  isVip?: boolean;
  vipExpiresAt?: string | null;
  vipPlan?: "1_MONTH" | "1_YEAR" | null;
  aiUsageToday?: number;
  aiUsageResetDate?: string;
  streakCount: number;
  lastStudyDate?: string;
  isStreakActiveToday?: boolean;
  isStreakAtRisk?: boolean;
  streakStatus?: StreakStatus;
  bookmarkedSetIds?: string[];
  createdAt: string;
  stats?: {
    totalSetsCreated: number;
    totalCardsOwned?: number;
    totalCardsMastered: number;
    totalStudySessions: number;
    streakDays: number;
  };
}

export interface UserProfile extends User {
  createdSets?: StudySet[];
  createdFolders?: Folder[];
  bookmarkedSets?: StudySet[];
}

export interface Card {
  id: string;
  studySetId: string;
  term: string;
  definition: string;
  phonetic?: string;
  example?: string;
  hint?: string;
  imageUrl?: string;
  audioUrl?: string;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
}

export interface StudySet {
  id: string;
  title: string;
  description?: string;
  privacy: PrivacyLevel;
  password?: string;
  level?: StudyLevel;
  sourceLanguage: string;
  targetLanguage: string;
  creatorId: string;
  tags: string[];
  viewCount: number;
  starredUserIds: string[];
  cards: Card[];
  cardCount: number;
  creator: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
    role?: UserRole;
  };
  isStarredByCurrentUser?: boolean;
  isBookmarked?: boolean;
  bookmarkCount?: number;
  isFeatured?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Folder {
  id: string;
  title: string;
  description?: string;
  creatorId: string;
  studySetIds: string[];
  studySets: StudySet[];
  setCount: number;
  creator: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
    role?: UserRole;
  };
  createdAt: string;
  updatedAt: string;
}

export interface ClassMember {
  userId: string;
  role: ClassRole;
  joinedAt: string;
}

export interface ClassMemberDetail extends ClassMember {
  name: string;
  username: string;
  avatarUrl?: string;
  userRole: UserRole;
  streakCount: number;
}

export interface ClassGroup {
  id: string;
  name: string;
  description?: string;
  schoolName?: string;
  creatorId: string;
  joinCode: string;
  allowMemberAddSets: boolean;
  allowMemberInvite: boolean;
  members: ClassMember[];
  memberDetails?: ClassMemberDetail[];
  studySetIds: string[];
  studySets: StudySet[];
  memberCount: number;
  setCount: number;
  isCurrentUserMember?: boolean;
  isCurrentUserAdmin?: boolean;
  creator: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
    role?: UserRole;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UserCardProgress {
  id: string;
  userId: string;
  cardId: string;
  studySetId: string;
  status: CardStudyStatus;
  repetitionNumber: number;
  easeFactor: number;
  intervalDays: number;
  nextReviewDate: string;
  lapses: number;
  isStarred: boolean;
  lastStudiedAt: string;
}

export interface SetStudyProgressSummary {
  studySetId: string;
  totalCards: number;
  notStudiedCount: number;
  learningCount: number;
  masteredCount: number;
  starredCount: number;
  percentMastered: number;
}

export interface TestQuestion {
  id: string;
  cardId: string;
  type: QuestionType;
  prompt: string;
  options?: string[];
  userAnswer?: string;
}

export interface GeneratedTest {
  testId: string;
  studySetId: string;
  studySetTitle: string;
  totalQuestions: number;
  questions: TestQuestion[];
}

export interface TestResultQuestionReview {
  questionId: string;
  cardId: string;
  prompt: string;
  type: QuestionType;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export interface TestResult {
  id: string;
  userId: string;
  studySetId: string;
  scorePercentage: number;
  totalQuestions: number;
  correctCount: number;
  incorrectCount: number;
  timeSpentSeconds: number;
  questionTypes: QuestionType[];
  reviews: TestResultQuestionReview[];
  correctTerms: string[];
  incorrectTerms: string[];
  createdAt: string;
}

export interface MatchGameCard {
  id: string;
  cardId: string;
  type: "term" | "definition";
  content: string;
}

export interface MatchLeaderboardEntry {
  id: string;
  studySetId: string;
  userId: string;
  user: {
    id: string;
    name: string;
    username: string;
    avatarUrl?: string;
    role?: UserRole;
  };
  timeRecordMs: number;
  matchedPairs: number;
  createdAt: string;
}

export interface SearchUserResult {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
  role: UserRole;
  streakCount: number;
  bio?: string;
}

export interface UnifiedSearchResult {
  query: string;
  totalResults: number;
  studySets: StudySet[];
  users: SearchUserResult[];
  folders: Folder[];
  classes: ClassGroup[];
}

export interface ExploreRecommendationResult {
  trendingSets: StudySet[];
  featuredSets: StudySet[];
  recentSets: StudySet[];
  popularTags: string[];
}

export interface ApiResponse<T> {
  success: boolean;
  statusCode: number;
  message: string;
  data: T;
  meta?: {
    totalItems?: number;
    currentPage?: number;
    totalPages?: number;
    limit?: number;
    hasNextPage?: boolean;
    hasPrevPage?: boolean;
  };
}

export interface PaginatedResult<T> {
  items: T[];
  pagination: {
    totalItems: number;
    totalPages: number;
    page: number;
    limit: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
