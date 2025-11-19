export type Sport = '羽球' | '籃球' | '網球' | '足球' | '排球' | '跑步';
export type SkillLevel = '初學' | '初階' | '中階' | '進階' | '選手等級';
export type UserGender = '男性' | '女性';
export type MatchGenderRequirement = '不限' | '男性' | '女性';
export type SubscriptionTier = 'free' | 'subscribed';

export interface DirectMessage {
  id: string;
  fromUserId: 'system' | string;
  text: string;
  timestamp: string;
  isRead: boolean;
  reward?: { amount: number; claimed: boolean };
}

export interface Conversation {
  participantIds: string[];
  messages: DirectMessage[];
}

export interface UserProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  skillLevels: Partial<Record<Sport, SkillLevel>>;
  gender: UserGender;
  birthDate: string;
  city: string;
  district: string;
  ratings: {
    intensity: Partial<Record<Sport, number[]>>;
    friendliness: number[];
    comments: { fromUserId: string; text: string }[];
  };
  friends: string[];
  friendRequests: { from: string; status: 'pending' }[];
  conversations: Record<string, Conversation>;
  wCoins: number;
  subscriptionTier: SubscriptionTier;
  monthlyActivity: { lastReset: string };
}

export interface ChatMessage {
  userId: string;
  name: string;
  text: string;
  timestamp: string;
}

export interface MatchRoom {
  id: string;
  host: UserProfile;
  sport: Sport;
  locationName: string;
  time: string;
  maxPlayers: number;
  currentPlayers: UserProfile[];
  skillLevel: SkillLevel;
  genderRequirement: MatchGenderRequirement;
  messages: ChatMessage[];
  notes?: string;
  minAge?: number;
  maxAge?: number;
}

export interface PlayerRating {
  ratedUserId: string;
  fromUserId: string;
  intensity: number;
  friendliness: number;
  comment?: string;
}
