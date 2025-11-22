
import React, { useState, useEffect } from 'react';
import { useStore, AppProvider } from './store';
import { 
    LayoutDashboard, 
    CheckSquare, 
    Trophy, 
    User as UserIcon, 
    Settings, 
    Plus, 
    LogOut,
    Crown,
    Briefcase, Heart, BookOpen, Activity, Apple, DollarSign, Smile, Home as HomeIcon, Sprout,
    Clock,
    Bell,
    Calendar as CalendarIcon,
    FileText,
    Lock,
    Wallet,
    Mail,
    Headphones,
    Music,
    Youtube,
    Coffee,
    ExternalLink,
    PlayCircle
} from 'lucide-react';
import { Category, Priority, Frequency, UserRole, MembershipTier, NotificationType, Task } from './types';
import { Button, Card, Input, Select, Modal, Badge } from './components/UI';
import { AICoachModal } from './components/AICoachModal';
import { motivateUser, getCategoryWisdom } from './services/geminiService';

// --- Data: Category Resources (Mood Boosters) ---
const CATEGORY_RESOURCES: Record<Category, { title: string, icon: any, links: { name: string, url: string, type: 'spotify' | 'youtube' | 'web' }[] }> = {
    [Category.SPORTS]: {
        title: "Energía & Ritmo",
        icon: Activity,
        links: [
            { name: "Workout Hits (Spotify)", url: "https://open.spotify.com/playlist/37i9dQZF1DX76Wlfdnj7AP", type: 'spotify' },
            { name: "Música para Correr", url: "https://www.youtube.com/results?search_query=running+music+motivation", type: 'youtube' },
            { name: "Podcast: Fitness Revolucionario", url: "https://fitnessrevolucionario.com/podcast/", type: 'web' }
        ]
    },
    [Category.WORK]: {
        title: "Modo Enfoque Profundo",
        icon: Briefcase,
        links: [
            { name: "Deep Focus Playlist", url: "https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ", type: 'spotify' },
            { name: "Técnica Pomodoro (Timer)", url: "https://pomofocus.io/", type: 'web' },
            { name: "Ruido Blanco (Oficina)", url: "https://www.youtube.com/watch?v=2Z7g9B5xNls", type: 'youtube' }
        ]
    },
    [Category.EDUCATION]: {
        title: "Zona de Estudio",
        icon: BookOpen,
        links: [
            { name: "Lofi Hip Hop Radio", url: "https://www.youtube.com/watch?v=jfKfPfyJRdk", type: 'youtube' },
            { name: "Música Clásica para Leer", url: "https://open.spotify.com/playlist/37i9dQZF1DWWEJlAGA9gs0", type: 'spotify' },
            { name: "Khan Academy", url: "https://es.khanacademy.org/", type: 'web' }
        ]
    },
    [Category.NUTRITION]: {
        title: "Cocina & Salud",
        icon: Apple,
        links: [
            { name: "Podcast: Radio Fitness", url: "https://open.spotify.com/genre/podcasts-web", type: 'spotify' },
            { name: "Recetas Saludables 15min", url: "https://www.youtube.com/results?search_query=recetas+saludables+15+minutos", type: 'youtube' }
        ]
    },
    [Category.EMOTIONAL]: {
        title: "Paz Interior",
        icon: Heart,
        links: [
            { name: "Meditación Guiada 10min", url: "https://www.youtube.com/results?search_query=meditacion+guiada+10+minutos", type: 'youtube' },
            { name: "Sonidos de Lluvia", url: "https://open.spotify.com/playlist/37i9dQZF1DX8ymr6UES7ae", type: 'spotify' }
        ]
    },
    [Category.HOME]: {
        title: "Hogar Feliz",
        icon: HomeIcon,
        links: [
            { name: "Limpieza con Ritmo", url: "https://open.spotify.com/playlist/37i9dQZF1DX1tW4GkYCEx7", type: 'spotify' },
            { name: "Audiolibros (Audible)", url: "https://www.audible.com/", type: 'web' }
        ]
    },
    [Category.FINANCE]: {
        title: "Finanzas Claras",
        icon: DollarSign,
        links: [
            { name: "Podcast: Neurona Financiera", url: "https://neuronafinanciera.com/", type: 'web' },
            { name: "Jazz Suave de Fondo", url: "https://www.youtube.com/watch?v=Dx5qFachd3A", type: 'youtube' }
        ]
    },
    [Category.GROWTH]: {
        title: "Crecimiento Personal",
        icon: Sprout,
        links: [
            { name: "TED Talks (Motivación)", url: "https://www.youtube.com/user/TEDtalksDirector", type: 'youtube' },
            { name: "Podcast: Libros para Emprendedores", url: "https://librosaraemprendedores.net/", type: 'web' }
        ]
    },
    [Category.PERSONAL]: {
        title: "Tiempo para Mí",
        icon: UserIcon,
        links: [
            { name: "Top 50 Global", url: "https://open.spotify.com/playlist/37i9dQZEVXbMDoHDwVN2tF", type: 'spotify' },
            { name: "Podcast: Entiende tu Mente", url: "https://open.spotify.com/show/0rOatMAdzQyPvw6tXW7aCj", type: 'spotify' }
        ]
    }
};

// Helper for Category Colors and Icons
const getCategoryDetails = (cat: Category) => {
    switch(cat) {
        case Category.WORK: return { color: 'bg-blue-600', light: 'bg-blue-50', text: 'text-blue-600', icon: Briefcase };
        case Category.PERSONAL: return { color: 'bg-indigo-600', light: 'bg-indigo-50', text: 'text-indigo-600', icon: UserIcon };
        case Category.EDUCATION: return { color: 'bg-yellow-500', light: 'bg-yellow-50', text: 'text-yellow-600', icon: BookOpen };
        case Category.SPORTS: return { color: 'bg-orange-500', light: 'bg-orange-50', text: 'text-orange-600', icon: Activity };
        case Category.NUTRITION: return { color: 'bg-green-500', light: 'bg-green-50', text: 'text-green-600', icon: Apple };
        case Category.FINANCE: return { color: 'bg-emerald-600', light: 'bg-emerald-50', text: 'text-emerald-600', icon: DollarSign };
        case Category.EMOTIONAL: return { color: 'bg-rose-400', light: 'bg-rose-50', text: 'text-rose-600', icon: Heart };
        case Category.HOME: return { color: 'bg-stone-500', light: 'bg-stone-50', text: 'text-stone-600', icon: HomeIcon };
        case Category.GROWTH: return { color: 'bg-purple-500', light: 'bg-purple-50', text: 'text-purple-600', icon: Sprout };
        default: return { color: 'bg-slate-500', light: 'bg-slate-50', text: 'text-slate-600', icon: CheckSquare };
    }
}

const LoginScreen = () => {
  const { login, loading } = useStore();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
  };

  const handleLogin = () => {
      if (!validateEmail(email)) {
          setError('Por favor, ingresa un correo electrónico válido.');
          return;
      }
      login(email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary to-purple-600 p-4">
      <Card className="w-full max-w-md p-8 space-y-6 animate-fade-in">
        <div className="text-center">
          <div className="bg-indigo-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckSquare className="text-primary h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Tareas y Hábitos</h1>
          <p className="text-slate-500 mt-2">Tu Coach IA Personal</p>
        </div>
        
        <div className="space-y-4">
            <div>
                <Input 
                    label="Ingresa tu Email" 
                    placeholder="ejemplo@gmail.com" 
                    value={email}
                    onChange={(e: any) => {
                        setEmail(e.target.value);
                        if (error) setError('');
                    }}
                    type="email"
                />
                {error && <p className="text-red-500 text-xs mt-1 text-center font-medium animate-pulse">{error}</p>}
            </div>
            <p className="text-xs text-slate-400 text-center">
                Usamos tu correo para guardar tus avances de forma segura.
            </p>
            <Button className="w-full justify-center" onClick={handleLogin} disabled={loading}>
                {loading ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <><Mail size={18} /> Continuar con Email</>}
            </Button>
        </div>
      </Card>
    </div>
  );
};

const CompanionModal = ({ task, onClose }: { task: Task | null, onClose: () => void }) => {
    if (!task) return null;
    const resource = CATEGORY_RESOURCES[task.category];

    return (
        <Modal isOpen={!!task} onClose={onClose} title={resource.title}>
            <div className="space-y-4">
                <div className="flex items-center gap-3 bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                    <div className="bg-white p-2 rounded-full shadow-sm">
                        <resource.icon className="text-indigo-600" size={24} />
                    </div>
                    <p className="text-sm text-indigo-800">
                        Para acompañar tu actividad de <strong>{task.category}</strong>, aquí tienes algunas sugerencias para hacerlo más ameno:
                    </p>
                </div>

                <div className="space-y-2">
                    {resource.links.map((link, idx) => (
                        <a 
                            key={idx} 
                            href={link.url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="flex items-center justify-between p-3 border rounded-xl hover:bg-slate-50 hover:border-indigo-200 transition-all group"
                        >
                            <div className="flex items-center gap-3">
                                {link.type === 'spotify' && <Music className="text-green-500" size={20} />}
                                {link.type === 'youtube' && <Youtube className="text-red-500" size={20} />}
                                {link.type === 'web' && <ExternalLink className="text-blue-500" size={20} />}
                                <span className="font-medium text-slate-700 group-hover:text-indigo-600 transition-colors">{link.name}</span>
                            </div>
                            <PlayCircle className="text-slate-300 group-hover:text-indigo-500" size={20} />
                        </a>
                    ))}
                </div>
                
                <div className="text-center pt-2">
                    <Button onClick={onClose} variant="ghost" className="text-xs">Cerrar y empezar</Button>
                </div>
            </div>
        </Modal>
    );
};

const TaskList = ({ categoryFilter }: { categoryFilter?: string }) => {
    const { tasks, toggleTask, deleteTask } = useStore();
    const [wisdom, setWisdom] = useState('');
    const [companionTask, setCompanionTask] = useState<Task | null>(null);

    useEffect(() => {
        if(categoryFilter) {
            getCategoryWisdom(categoryFilter as Category).then(setWisdom);
        } else {
            setWisdom('');
        }
    }, [categoryFilter]);

    const filtered = categoryFilter 
        ? tasks.filter(t => t.category === categoryFilter)
        : tasks;

    return (
        <div className="space-y-3 pb-20">
            {wisdom && (
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-3 rounded-lg border border-indigo-100 text-sm text-indigo-800 italic flex gap-2 animate-fade-in">
                    <span className="not-italic">💡</span> {wisdom}
                </div>
            )}

            {filtered.length === 0 && (
                <div className="text-center py-10">
                    <div className="inline-block p-4 rounded-full bg-slate-100 mb-3"><CheckSquare className="text-slate-300" size={32} /></div>
                    <p className="text-slate-500">No hay actividades aquí. ¡Crea una!</p>
                </div>
            )}

            {filtered.map(task => {
                const catDetails = getCategoryDetails(task.category);
                
                return (
                    <div key={task.id} className={`group flex flex-col p-4 bg-white rounded-xl shadow-sm border border-slate-100 hover:border-indigo-100 transition-all ${task.completed ? 'opacity-60 bg-slate-50' : ''}`}>
                        <div className="flex items-start gap-3">
                            <button 
                                onClick={() => toggleTask(task.id)}
                                className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${task.completed ? 'bg-secondary border-secondary' : 'border-slate-300 hover:border-primary'}`}
                            >
                                {task.completed && <CheckSquare size={14} className="text-white" />}
                            </button>
                            
                            <div className="flex-1">
                                <h4 className={`font-medium ${task.completed ? 'line-through text-slate-500' : 'text-slate-800'}`}>{task.title}</h4>
                                <div className="flex flex-wrap items-center gap-2 mt-2">
                                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${catDetails.light} ${catDetails.text}`}>
                                        {task.category}
                                    </span>
                                    {task.startTime && (
                                        <span className="text-xs text-slate-500 flex items-center gap-1">
                                            <Clock size={12} /> {task.startTime} - {task.endTime}
                                        </span>
                                    )}
                                    {task.notificationType === NotificationType.VOICE && <span className="text-xs" title="Voz IA Activa">🗣️</span>}
                                </div>
                                {task.isHabit && (
                                    <div className="mt-2 text-xs text-slate-400 flex justify-between">
                                        <span className="text-orange-500 font-bold flex items-center gap-1">🔥 {task.streak} días</span>
                                        <span>Reto 30 días</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col items-end gap-2">
                                <span className="text-xs font-bold text-primary">+{task.points} pts</span>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => setCompanionTask(task)}
                                        className="p-1.5 text-indigo-400 bg-indigo-50 hover:bg-indigo-100 rounded-full transition-colors"
                                        title="Compañero de Actividad (Música/Podcast)"
                                    >
                                        <Headphones size={14} />
                                    </button>
                                    <button onClick={() => deleteTask(task.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
                                        <LogOut size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )
            })}

            {/* Companion Modal Instance */}
            <CompanionModal task={companionTask} onClose={() => setCompanionTask(null)} />
        </div>
    );
}

const Dashboard = () => {
    const { user, tasks } = useStore();
    const [motivation, setMotivation] = useState('');
    
    useEffect(() => {
        if(user) {
             motivateUser(user.points, 3).then(setMotivation);
        }
    }, [user]);

    const pendingTasks = tasks.filter(t => !t.completed).length;
    
    // Check for upcoming notifications
    useEffect(() => {
        const interval = setInterval(() => {
            const now = new Date();
            const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
            
            tasks.forEach(task => {
                if (!task.completed && task.startTime) {
                    // Parse time to subtract 10 mins
                    const [h, m] = task.startTime.split(':').map(Number);
                    const taskDate = new Date();
                    taskDate.setHours(h, m, 0);
                    const notifyTimeDate = new Date(taskDate.getTime() - 10 * 60000);
                    const notifyTime = `${String(notifyTimeDate.getHours()).padStart(2, '0')}:${String(notifyTimeDate.getMinutes()).padStart(2, '0')}`;
                    
                    if (currentTime === notifyTime && now.getSeconds() < 5) {
                       // Trigger notification
                       if (task.notificationType === NotificationType.VOICE) {
                           const utterance = new SpeechSynthesisUtterance(`Hola ${user?.name}, recuerda que tienes ${task.title} en 10 minutos.`);
                           window.speechSynthesis.speak(utterance);
                       } else {
                           // Simulate Email/Push
                           if (Notification.permission === "granted") {
                               new Notification(`Recordatorio: ${task.title}`, { body: 'Comienza en 10 minutos' });
                           } else {
                                alert(`📧 Recordatorio: "${task.title}" comienza en 10 minutos.`);
                           }
                       }
                    }
                }
            });
        }, 5000); // Check every 5 seconds
        
        // Request notification permission
        if (Notification.permission !== "granted") {
            Notification.requestPermission();
        }

        return () => clearInterval(interval);
    }, [tasks, user]);

    return (
        <div className="space-y-6 animate-fade-in">
            <header className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Hola, {user?.name?.split(' ')[0]} 👋</h2>
                    <p className="text-slate-500 text-sm italic">"{motivation}"</p>
                </div>
                <div className="bg-white p-1 rounded-full shadow-sm border border-slate-100">
                   <div className="w-10 h-10 bg-gradient-to-br from-primary to-purple-500 rounded-full flex items-center justify-center text-white font-bold shadow-inner">
                       {user?.level}
                   </div>
                </div>
            </header>

            <div className="grid grid-cols-2 gap-4">
                <Card className="bg-slate-900 text-white border-none relative overflow-hidden">
                    <div className="absolute right-0 top-0 p-4 opacity-10"><Trophy size={60}/></div>
                    <p className="text-slate-400 text-xs font-medium uppercase">Puntos</p>
                    <h3 className="text-3xl font-bold mt-1 text-yellow-400">{user?.points}</h3>
                    <p className="text-xs mt-2">Próximo nivel: 300pts</p>
                </Card>
                <Card className="bg-white border-l-4 border-primary">
                    <p className="text-slate-500 text-xs font-medium uppercase">Pendientes hoy</p>
                    <h3 className="text-3xl font-bold mt-1 text-slate-800">{pendingTasks}</h3>
                    <p className="text-xs mt-2 text-slate-400">¡Tú puedes!</p>
                </Card>
            </div>

            <div>
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2"><CalendarIcon size={18} className="text-primary"/> Agenda de Hoy</h3>
                </div>
                {/* Simplified Timeline View */}
                <div className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm mb-6">
                     {tasks.filter(t => t.startTime).sort((a,b) => (a.startTime || '') > (b.startTime || '') ? 1 : -1).map(t => (
                         <div key={t.id} className="flex gap-4 mb-4 last:mb-0">
                             <div className="text-xs text-slate-400 w-10 pt-1">{t.startTime}</div>
                             <div className={`flex-1 p-2 rounded-lg border-l-2 text-sm ${t.completed ? 'bg-slate-50 border-slate-300 text-slate-400' : 'bg-indigo-50 border-primary text-indigo-900'}`}>
                                 {t.title}
                             </div>
                         </div>
                     ))}
                     {tasks.filter(t => t.startTime).length === 0 && <p className="text-sm text-slate-400 text-center italic">No hay horarios definidos.</p>}
                </div>

                <TaskList categoryFilter="" />
            </div>
        </div>
    )
}

const RewardsShop = () => {
    const { user, rewards, unlockReward } = useStore();
    
    return (
        <div className="space-y-6 pb-20 animate-fade-in">
            <div className="bg-indigo-900 text-white p-6 rounded-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                <h2 className="text-2xl font-bold relative z-10">Premios</h2>
                <p className="text-indigo-200 relative z-10">Motívate canjeando tus logros.</p>
                <div className="mt-4 flex items-center gap-2 bg-black/20 w-fit px-3 py-1 rounded-lg">
                    <Wallet size={16} className="text-yellow-400"/>
                    <span className="font-bold">{user?.points} puntos</span>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {rewards.map(reward => {
                    const isUnlocked = user?.unlockedRewards.includes(reward.id);
                    const canAfford = (user?.points || 0) >= reward.cost;

                    return (
                        <Card key={reward.id} className={`relative border-2 ${isUnlocked ? 'border-green-400' : 'border-transparent'}`}>
                             {!isUnlocked && !canAfford && (
                                 <div className="absolute inset-0 bg-slate-100/50 flex items-center justify-center backdrop-blur-[1px] z-10 rounded-xl">
                                     <Lock className="text-slate-400" />
                                 </div>
                             )}
                             <div className="bg-slate-100 w-10 h-10 rounded-full flex items-center justify-center mb-3 text-slate-600">
                                 <Trophy size={20} />
                             </div>
                             <h4 className="font-bold text-slate-800 text-sm">{reward.name}</h4>
                             
                             {isUnlocked ? (
                                 <div className="mt-2 w-full py-1 bg-green-100 text-green-700 text-[10px] font-bold rounded text-center">
                                     DESBLOQUEADO
                                 </div>
                             ) : (
                                <Button 
                                    onClick={() => unlockReward(reward.id)}
                                    disabled={!canAfford}
                                    className="mt-2 w-full text-xs h-7 px-0" 
                                    variant={canAfford ? 'primary' : 'ghost'}
                                >
                                    {reward.cost} pts
                                </Button>
                             )}
                        </Card>
                    );
                })}
            </div>
        </div>
    )
}

const ProfileAndSettings = () => {
    const { user, updateUser, requestSubscription } = useStore();
    const [isProModalOpen, setProModalOpen] = useState(false);
    const [processing, setProcessing] = useState(false);

    const handleSubscription = async (tier: MembershipTier) => {
        setProcessing(true);
        await requestSubscription(tier);
        setProcessing(false);
        setProModalOpen(false);
        alert("¡Solicitud recibida! Te hemos enviado un correo con los pasos para completar tu pago. Tu cuenta será actualizada en breve.");
    };

    return (
        <div className="space-y-6 pb-20 animate-fade-in">
            <div className="text-center">
                <div className="w-20 h-20 bg-slate-200 rounded-full mx-auto mb-3 flex items-center justify-center text-2xl">
                    {user?.avatar === 'default' ? '👤' : '🥷'}
                </div>
                <h2 className="text-xl font-bold">{user?.name}</h2>
                <p className="text-sm text-slate-500">{user?.email}</p>
                <Badge color="purple" className="mt-2">{user?.membership}</Badge>
            </div>

            <div className="space-y-4">
                <h3 className="font-bold text-slate-800 text-sm uppercase border-b pb-2">Ficha Técnica Personal</h3>
                <Card>
                    <div className="space-y-3">
                        <Input 
                            label="Nombre Completo" 
                            value={user?.profileData?.fullName || ''} 
                            onChange={(e: any) => updateUser({profileData: {...user?.profileData!, fullName: e.target.value}})}
                        />
                        <Input 
                            label="Fecha de Nacimiento" 
                            type="date"
                            value={user?.profileData?.birthDate || ''} 
                            onChange={(e: any) => updateUser({profileData: {...user?.profileData!, birthDate: e.target.value}})}
                        />
                         <Input 
                            label="Ocupación" 
                            value={user?.profileData?.occupation || ''} 
                            onChange={(e: any) => updateUser({profileData: {...user?.profileData!, occupation: e.target.value}})}
                        />
                         <Input 
                            label="Biografía / Lema" 
                            value={user?.profileData?.bio || ''} 
                            onChange={(e: any) => updateUser({profileData: {...user?.profileData!, bio: e.target.value}})}
                        />
                    </div>
                </Card>

                <h3 className="font-bold text-slate-800 text-sm uppercase border-b pb-2 mt-6">Suscripción</h3>
                <Card className="bg-gradient-to-r from-slate-800 to-slate-900 text-white">
                    <div className="flex justify-between items-center">
                        <div>
                            <h4 className="font-bold text-lg">Membresía PRO</h4>
                            <p className="text-xs text-slate-300">Estadísticas, sin anuncios y más.</p>
                        </div>
                        <Button onClick={() => setProModalOpen(true)} className="bg-yellow-500 text-black hover:bg-yellow-400 border-none">
                            Mejorar
                        </Button>
                    </div>
                </Card>
            </div>

             {/* Subscription Modal */}
             <Modal isOpen={isProModalOpen} onClose={() => setProModalOpen(false)} title="Planes Pro">
                <div className="space-y-4">
                    <p className="text-sm text-slate-600 bg-blue-50 p-3 rounded">
                        Al seleccionar un plan, enviaremos a tu correo las instrucciones de pago seguro.
                    </p>
                    <div className="border p-4 rounded-xl hover:border-primary cursor-pointer" onClick={() => handleSubscription(MembershipTier.PRO_MONTHLY)}>
                        <div className="flex justify-between font-bold"><span>Mensual</span> <span>$4.99</span></div>
                        <p className="text-xs text-slate-500">Facturado cada mes.</p>
                    </div>
                    <div className="border p-4 rounded-xl border-primary bg-indigo-50 cursor-pointer" onClick={() => handleSubscription(MembershipTier.PRO_ANNUAL)}>
                        <div className="flex justify-between font-bold"><span>Anual</span> <span>$39.99</span></div>
                        <p className="text-xs text-slate-500">Ahorra 30%.</p>
                    </div>
                    {processing && <div className="text-center text-primary"><Clock className="animate-spin inline"/> Procesando...</div>}
                </div>
            </Modal>
        </div>
    )
}

const AdminPanel = () => {
    const { user, adminUpdateUserMembership } = useStore();

    if (user?.role !== UserRole.ADMIN) return <div className="p-10 text-center text-red-500 font-bold">Acceso Denegado: Solo Administrador</div>;

    return (
        <div className="space-y-6 pb-20 animate-fade-in">
            <h2 className="text-2xl font-bold text-slate-800">Panel de Administración</h2>
            
            <div className="grid grid-cols-2 gap-4">
                <Card className="bg-slate-800 text-white">
                    <h3 className="text-2xl font-bold">$120.00</h3>
                    <p className="text-xs text-slate-400">Ingresos este mes</p>
                </Card>
                <Card className="bg-slate-800 text-white">
                     <h3 className="text-2xl font-bold">4</h3>
                    <p className="text-xs text-slate-400">Usuarios Nuevos</p>
                </Card>
            </div>

            <Card>
                <h3 className="font-bold mb-4 flex items-center gap-2"><UserIcon size={18} /> Gestión de Usuarios</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500">
                            <tr>
                                <th className="p-2">Usuario</th>
                                <th className="p-2">Plan</th>
                                <th className="p-2">Acción</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr className="border-t">
                                <td className="p-2 text-xs">usuario1@test.com</td>
                                <td className="p-2"><Badge>Gratis</Badge></td>
                                <td className="p-2 flex gap-1">
                                    <button onClick={() => alert('Membresía actualizada')} className="text-[10px] bg-indigo-100 text-indigo-600 px-2 py-1 rounded">Activar Pro</button>
                                </td>
                            </tr>
                             <tr className="border-t">
                                <td className="p-2 text-xs">cliente2@gmail.com</td>
                                <td className="p-2"><Badge color="purple">Pro Anual</Badge></td>
                                <td className="p-2 flex gap-1">
                                    <button onClick={() => alert('Membresía pausada')} className="text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded">Pausar</button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    )
}

// --- Main App Component ---

const MainApp = () => {
    const { user, logout, addTask } = useStore();
    const [activeTab, setActiveTab] = useState<'dashboard' | 'tasks' | 'rewards' | 'profile' | 'admin'>('dashboard');
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);

    // New Task Form State
    const [newTask, setNewTask] = useState({ 
        title: '', 
        category: Category.PERSONAL, 
        priority: Priority.MEDIUM, 
        frequency: Frequency.ONCE, 
        isHabit: false,
        startTime: '',
        endTime: '',
        notificationType: NotificationType.EMAIL
    });

    const handleAddTask = () => {
        if (!newTask.title) return;
        addTask(newTask);
        setNewTask({ 
            title: '', 
            category: Category.PERSONAL, 
            priority: Priority.MEDIUM, 
            frequency: Frequency.ONCE, 
            isHabit: false,
            startTime: '',
            endTime: '',
            notificationType: NotificationType.EMAIL
        });
        setIsAddModalOpen(false);
    };

    const handleAiHabit = (habitName: string, cat: Category) => {
        addTask({
            title: habitName,
            category: cat,
            priority: Priority.MEDIUM,
            frequency: Frequency.DAILY,
            isHabit: true,
            notificationType: NotificationType.VOICE,
            startTime: '08:00',
            endTime: '08:30'
        });
    }

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard': return <Dashboard />;
            case 'tasks': return (
                <div className="animate-fade-in">
                    <div className="flex overflow-x-auto gap-2 pb-4 no-scrollbar mb-2 px-1">
                        <button 
                           onClick={() => setSelectedCategory(null)}
                           className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${!selectedCategory ? 'bg-slate-800 text-white shadow-md' : 'bg-white text-slate-500 border'}`}
                        >
                            Todas
                        </button>
                        {Object.values(Category).map(cat => {
                            const style = getCategoryDetails(cat);
                            return (
                                <button 
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1 ${selectedCategory === cat ? `${style.color} text-white shadow-md` : `bg-white ${style.text} border`}`}
                                >
                                    {selectedCategory === cat && <style.icon size={12} />}
                                    {cat}
                                </button>
                            )
                        })}
                    </div>
                    <TaskList categoryFilter={selectedCategory as any} />
                </div>
            );
            case 'rewards': return <RewardsShop />;
            case 'profile': return <ProfileAndSettings />;
            case 'admin': return <AdminPanel />;
            default: return <Dashboard />;
        }
    };

    return (
        <div className="flex flex-col h-screen max-w-md mx-auto bg-slate-50 relative shadow-2xl overflow-hidden">
            {/* Top Bar */}
            <div className="bg-white p-4 flex justify-between items-center shadow-sm z-10">
                <div className="flex items-center gap-2">
                    <div className="bg-primary/10 p-2 rounded-lg"><Crown className="text-primary" size={20} /></div>
                    <span className="font-bold text-slate-800 text-sm">Tareas Pro</span>
                    {user?.membership !== MembershipTier.FREE && <Badge color="purple">PRO</Badge>}
                </div>
                <button onClick={logout} className="text-slate-400 hover:text-slate-600"><LogOut size={20} /></button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 overflow-y-auto p-4">
                {renderContent()}
            </div>

            {/* Floating Action Button */}
            <div className="absolute bottom-24 right-6 z-20 flex flex-col gap-3">
                <button 
                    onClick={() => setIsAiModalOpen(true)}
                    className="w-12 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full text-white shadow-lg shadow-purple-500/40 flex items-center justify-center hover:scale-105 transition-transform"
                    title="Sugerencia IA"
                >
                    <span className="text-lg">✨</span>
                </button>
                <button 
                    onClick={() => setIsAddModalOpen(true)}
                    className="w-14 h-14 bg-primary rounded-full text-white shadow-lg shadow-indigo-500/40 flex items-center justify-center hover:scale-105 transition-transform"
                >
                    <Plus size={28} />
                </button>
            </div>

            {/* Bottom Navigation */}
            <div className="bg-white border-t border-slate-100 flex justify-around items-center p-3 pb-5 z-10">
                <button onClick={() => setActiveTab('dashboard')} className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-primary' : 'text-slate-400'}`}>
                    <LayoutDashboard size={20} />
                    <span className="text-[10px] font-medium">Inicio</span>
                </button>
                <button onClick={() => setActiveTab('tasks')} className={`flex flex-col items-center gap-1 ${activeTab === 'tasks' ? 'text-primary' : 'text-slate-400'}`}>
                    <CheckSquare size={20} />
                    <span className="text-[10px] font-medium">Tareas</span>
                </button>
                <button onClick={() => setActiveTab('rewards')} className={`flex flex-col items-center gap-1 ${activeTab === 'rewards' ? 'text-primary' : 'text-slate-400'}`}>
                    <Trophy size={20} />
                    <span className="text-[10px] font-medium">Premios</span>
                </button>
                <button onClick={() => setActiveTab('profile')} className={`flex flex-col items-center gap-1 ${activeTab === 'profile' ? 'text-primary' : 'text-slate-400'}`}>
                    <UserIcon size={20} />
                    <span className="text-[10px] font-medium">Perfil</span>
                </button>
                {user?.role === UserRole.ADMIN && (
                    <button onClick={() => setActiveTab('admin')} className={`flex flex-col items-center gap-1 ${activeTab === 'admin' ? 'text-primary' : 'text-slate-400'}`}>
                        <Settings size={20} />
                        <span className="text-[10px] font-medium">Admin</span>
                    </button>
                )}
            </div>

            {/* Add Task Modal */}
            <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Nueva Actividad">
                <Input label="Título" value={newTask.title} onChange={(e: any) => setNewTask({...newTask, title: e.target.value})} placeholder="Ej: Gimnasio" />
                <Select label="Categoría" value={newTask.category} onChange={(e: any) => setNewTask({...newTask, category: e.target.value})} options={Object.values(Category).map(c => ({label: c, value: c}))} />
                
                <div className="grid grid-cols-2 gap-3 mb-3">
                    <Input label="Inicio" type="time" value={newTask.startTime} onChange={(e: any) => setNewTask({...newTask, startTime: e.target.value})} />
                    <Input label="Fin" type="time" value={newTask.endTime} onChange={(e: any) => setNewTask({...newTask, endTime: e.target.value})} />
                </div>

                <div className="flex gap-4">
                     <div className="flex-1"><Select label="Prioridad" value={newTask.priority} onChange={(e: any) => setNewTask({...newTask, priority: e.target.value})} options={Object.values(Priority).map(p => ({label: p, value: p}))} /></div>
                     <div className="flex-1"><Select label="Frecuencia" value={newTask.frequency} onChange={(e: any) => setNewTask({...newTask, frequency: e.target.value})} options={Object.values(Frequency).map(f => ({label: f, value: f}))} /></div>
                </div>

                <Select label="Notificación (10 min antes)" value={newTask.notificationType} onChange={(e: any) => setNewTask({...newTask, notificationType: e.target.value})} options={Object.values(NotificationType).map(n => ({label: n, value: n}))} />

                <div className="flex items-center gap-2 mb-4 mt-2 bg-orange-50 p-2 rounded border border-orange-100">
                    <input type="checkbox" id="habit" checked={newTask.isHabit} onChange={e => setNewTask({...newTask, isHabit: e.target.checked})} className="w-4 h-4 text-primary rounded focus:ring-primary" />
                    <label htmlFor="habit" className="text-sm text-slate-700">¿Es hábito? (Reto 30 días)</label>
                </div>
                <Button onClick={handleAddTask} className="w-full" disabled={!newTask.title}>Crear Actividad</Button>
            </Modal>

            <AICoachModal isOpen={isAiModalOpen} onClose={() => setIsAiModalOpen(false)} onAddHabit={handleAiHabit} />
        </div>
    );
};

const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

const AppContent = () => {
  const { user, loading } = useStore();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50 flex-col gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        <p className="text-slate-500 text-sm animate-pulse">Cargando tu espacio...</p>
      </div>
    );
  }

  return user ? <MainApp /> : <LoginScreen />;
};

export default App;
