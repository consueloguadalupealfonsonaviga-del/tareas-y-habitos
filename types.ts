
export enum Category {
  PERSONAL = 'Personal',
  WORK = 'Laboral',
  EDUCATION = 'Educación',
  SPORTS = 'Deportes',
  NUTRITION = 'Nutrición',
  FINANCE = 'Finanzas',
  EMOTIONAL = 'Salud Emocional',
  HOME = 'Hogar',
  GROWTH = 'Crecimiento'
}

export enum Priority {
  LOW = 'Baja',
  MEDIUM = 'Media',
  HIGH = 'Alta'
}

export enum Frequency {
  ONCE = 'Una vez',
  DAILY = 'Diario',
  WEEKLY = 'Semanal',
  MONTHLY = 'Mensual'
}

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export enum MembershipTier {
  FREE = 'Gratis',
  PRO_MONTHLY = 'Pro Mensual',
  PRO_ANNUAL = 'Pro Anual'
}

export enum NotificationType {
  EMAIL = 'Correo',
  VOICE = 'Voz (IA)'
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  category: Category;
  priority: Priority;
  completed: boolean;
  points: number;
  frequency: Frequency;
  isHabit: boolean;
  streak: number;
  lastCompleted?: string; // ISO Date string
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  notificationType: NotificationType;
  habitStartDate?: string; // ISO Date string for the 30-day tracker
}

export interface UserProfileData {
  fullName: string;
  birthDate: string;
  occupation: string;
  timezone: string;
  bio: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  points: number;
  level: number;
  membership: MembershipTier;
  avatar: string;
  unlockedRewards: string[];
  profileData?: UserProfileData;
  settings: {
    themeColor: string;
    darkMode: boolean;
    notifications: boolean;
  };
}

export interface Reward {
  id: string;
  name: string;
  cost: number;
  icon: string;
  type: 'icon' | 'wallpaper' | 'feature';
  description: string;
}

export const LEVEL_THRESHOLDS = [0, 100, 300, 600, 1000, 1500, 2500, 5000];

export const INITIAL_REWARDS: Reward[] = [
  { id: 'r1', name: 'Tema Oscuro', cost: 50, icon: 'Moon', type: 'feature', description: 'Modo noche para descansar la vista.' },
  { id: 'r2', name: 'Avatar Ninja', cost: 150, icon: 'User', type: 'icon', description: 'Un avatar exclusivo de ninja.' },
  { id: 'r3', name: 'Fondo Galaxia', cost: 300, icon: 'Image', type: 'wallpaper', description: 'Fondo de pantalla estelar.' },
  { id: 'r4', name: 'Estadísticas Pro', cost: 500, icon: 'BarChart', type: 'feature', description: 'Acceso temporal a gráficos avanzados.' },
];

export const ADMIN_EMAIL = "rogeliojienezrojas@yahoo.com.mx";
