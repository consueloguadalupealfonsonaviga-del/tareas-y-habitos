import React, { useState } from 'react';
import { Modal, Button, Input, Select } from './UI';
import { Category } from '../types';
import { suggestHabits } from '../services/geminiService';
import { Loader2, Sparkles, CheckCircle2 } from 'lucide-react';

export const AICoachModal = ({ isOpen, onClose, onAddHabit }: any) => {
  const [goal, setGoal] = useState('');
  const [category, setCategory] = useState<Category>(Category.PERSONAL);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const handleSuggest = async () => {
    if (!goal) return;
    setLoading(true);
    const results = await suggestHabits(category, goal);
    setSuggestions(results);
    setLoading(false);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Coach IA - Gemini">
      <div className="space-y-4">
        <div className="bg-indigo-50 p-3 rounded-lg flex gap-3 items-start">
            <Sparkles className="text-indigo-600 mt-1 shrink-0" size={20} />
            <p className="text-sm text-indigo-800">Describe tu meta y usaré IA para diseñar hábitos efectivos para ti.</p>
        </div>

        <Select 
            label="Categoría"
            value={category} 
            onChange={(e: any) => setCategory(e.target.value as Category)}
            options={Object.values(Category).map(c => ({ label: c, value: c }))}
        />
        
        <Input 
          label="¿Qué quieres lograr?" 
          placeholder="Ej: Quiero correr un maratón..." 
          value={goal}
          onChange={(e: any) => setGoal(e.target.value)}
        />

        <Button onClick={handleSuggest} disabled={loading || !goal} className="w-full">
          {loading ? <Loader2 className="animate-spin" /> : <><Sparkles size={18}/> Generar Hábitos</>}
        </Button>

        {suggestions.length > 0 && (
            <div className="space-y-2 mt-4 border-t pt-4">
                <h4 className="font-medium text-sm text-slate-500 uppercase">Sugerencias</h4>
                {suggestions.map((s, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-white border rounded-lg shadow-sm">
                        <span className="text-sm font-medium text-slate-700">{s}</span>
                        <button 
                            onClick={() => { onAddHabit(s, category); onClose(); }}
                            className="text-primary hover:bg-indigo-50 p-2 rounded-full"
                        >
                            <CheckCircle2 size={20} />
                        </button>
                    </div>
                ))}
            </div>
        )}
      </div>
    </Modal>
  );
};