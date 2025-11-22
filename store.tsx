
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Task, User, UserRole, MembershipTier, Category, Priority, INITIAL_REWARDS, Reward, LEVEL_THRESHOLDS, ADMIN_EMAIL, NotificationType } from './types';

interface AppState {
  user: User | null;
  tasks: Task[];
  rewards: Reward[];
  loading: boolean;
}

interface AppContextType extends AppState {
  login: (email: string) => void;
  logout: () => void;
  addTask: (task: Omit<Task, 'id' | 'points' | 'streak'>) => void;
  toggleTask: (id: string) => void;
  deleteTask: (id: string) => void;
  unlockReward: (rewardId: string) => void;
  updateUser: (updates: Partial<User>) => void;
  adminUpdateUserMembership: (userId: string, tier: MembershipTier) => void;
  addPoints: (amount: number) => void;
  requestSubscription: (tier: MembershipTier) => Promise<boolean>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Plantilla de usuario nuevo
const NEW_USER_TEMPLATE: User = {
  id: '',
  name: '',
  email: '',
  role: UserRole.USER,
  points: 0,
  level: 1,
  membership: MembershipTier.FREE,
  avatar: 'default',
  unlockedRewards: [],
  settings: { themeColor: 'indigo', darkMode: false, notifications: true },
  profileData: {
    fullName: '',
    birthDate: '',
    occupation: '',
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    bio: ''
  }
};

export const AppProvider = ({ children }: { children?: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [rewards, setRewards] = useState<Reward[]>(INITIAL_REWARDS);
  const [loading, setLoading] = useState(false); // Inicialmente false, carga al login

  // Guardado automático: Cada vez que cambia user o tasks, guardamos en la "caja" de ese email específico
  useEffect(() => {
    if (user && user.email) {
      const storageKey = `th_data_${user.email}`;
      const dataToSave = {
        user,
        tasks,
        rewards
      };
      localStorage.setItem(storageKey, JSON.stringify(dataToSave));
      // También guardamos una sesión activa genérica para persistencia rápida al recargar
      localStorage.setItem('th_active_session', user.email);
    }
  }, [user, tasks, rewards]);

  // Recuperar sesión al abrir la app
  useEffect(() => {
    const activeEmail = localStorage.getItem('th_active_session');
    if (activeEmail) {
      login(activeEmail);
    }
  }, []);

  const login = (email: string) => {
    setLoading(true);
    
    // Simular pequeña carga de red
    setTimeout(() => {
        const storageKey = `th_data_${email}`;
        const storedData = localStorage.getItem(storageKey);

        if (storedData) {
            // Usuario existente: Cargar sus datos específicos
            const parsed = JSON.parse(storedData);
            setUser(parsed.user);
            setTasks(parsed.tasks || []);
            setRewards(parsed.rewards || INITIAL_REWARDS);
        } else {
            // Usuario nuevo: Crear perfil desde cero
            const role = email === ADMIN_EMAIL ? UserRole.ADMIN : UserRole.USER;
            const newUser: User = { 
                ...NEW_USER_TEMPLATE, 
                id: email, 
                email, 
                role, 
                name: email.split('@')[0] 
            };
            setUser(newUser);
            setTasks([]);
            setRewards(INITIAL_REWARDS);
        }
        setLoading(false);
    }, 600);
  };

  const logout = () => {
    setUser(null);
    setTasks([]);
    localStorage.removeItem('th_active_session');
  };

  const calculateLevel = (points: number) => {
    let level = 1;
    for (let i = 0; i < LEVEL_THRESHOLDS.length; i++) {
      if (points >= LEVEL_THRESHOLDS[i]) level = i + 1;
    }
    return level;
  };

  const addPoints = (amount: number) => {
    if (!user) return;
    const newPoints = user.points + amount;
    const newLevel = calculateLevel(newPoints);
    setUser({ ...user, points: newPoints, level: newLevel });
  };

  const addTask = (taskData: Omit<Task, 'id' | 'points' | 'streak'>) => {
    const newTask: Task = {
      ...taskData,
      id: Math.random().toString(36).substring(2, 11),
      points: taskData.priority === Priority.HIGH ? 20 : taskData.priority === Priority.MEDIUM ? 10 : 5,
      streak: 0,
      completed: false,
      habitStartDate: taskData.isHabit ? new Date().toISOString() : undefined
    };
    setTasks(prev => [...prev, newTask]);
  };

  const toggleTask = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        const isCompleting = !t.completed;
        if (isCompleting) {
          addPoints(t.points);
          // Simple streak logic
          if (t.isHabit) {
             t.streak += 1;
             if(t.streak % 7 === 0) addPoints(50); // Weekly bonus
          }
        }
        return { 
          ...t, 
          completed: isCompleting, 
          lastCompleted: isCompleting ? new Date().toISOString() : t.lastCompleted 
        };
      }
      return t;
    }));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const unlockReward = (rewardId: string) => {
    if (!user) return;
    const reward = rewards.find(r => r.id === rewardId);
    if (reward && user.points >= reward.cost && !user.unlockedRewards.includes(rewardId)) {
      setUser({
        ...user,
        points: user.points - reward.cost,
        unlockedRewards: [...user.unlockedRewards, rewardId]
      });
    }
  };

  const updateUser = (updates: Partial<User>) => {
    if (!user) return;
    setUser({ ...user, ...updates });
  };

  const adminUpdateUserMembership = (userId: string, tier: MembershipTier) => {
    if (user && user.id === userId) {
        setUser({...user, membership: tier});
    }
    // En una app real, aquí actualizaríamos la base de datos del usuario objetivo buscando por su key
  };

  const requestSubscription = async (tier: MembershipTier): Promise<boolean> => {
     return new Promise((resolve) => {
         setTimeout(() => {
             console.log(`[SYSTEM] Email sent to ${user?.email} with payment instructions.`);
             console.log(`[SYSTEM] Admin notification sent to ${ADMIN_EMAIL}`);
             resolve(true);
         }, 1500);
     });
  };

  return (
    <AppContext.Provider value={{
      user, tasks, rewards, loading,
      login, logout, addTask, toggleTask, deleteTask, unlockReward, updateUser, adminUpdateUserMembership, addPoints, requestSubscription
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useStore must be used within AppProvider");
  return context;
};
