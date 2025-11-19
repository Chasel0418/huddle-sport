
import React, { useState, useRef } from 'react';
import { MatchRoom, Sport, SkillLevel, UserProfile, MatchGenderRequirement } from '../types';
import { ALL_SPORTS, SKILL_LEVELS, MATCH_GENDER_REQUIREMENTS, COST_TO_CREATE } from '../constants';

interface CreateMatchFormProps {
    onTriggerCreateRoom: (room: Omit<MatchRoom, 'id' | 'host' | 'currentPlayers' | 'messages'>, buttonRect: DOMRect) => void;
    onBack: () => void;
    userProfile: UserProfile;
}

const CreateMatchForm: React.FC<CreateMatchFormProps> = ({ onTriggerCreateRoom, onBack, userProfile }) => {
    const [sport, setSport] = useState<Sport>('羽球');
    const [locationName, setLocationName] = useState('');
    const [time, setTime] = useState(() => {
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        return now.toISOString().slice(0, 16);
    });
    const [maxPlayers, setMaxPlayers] = useState(4);
    const [skillLevel, setSkillLevel] = useState<SkillLevel>(userProfile.skillLevels[sport] || '初階');
    const [genderRequirement, setGenderRequirement] = useState<MatchGenderRequirement>('不限');
    const [notes, setNotes] = useState('');
    const [minAge, setMinAge] = useState<string>('');
    const [maxAge, setMaxAge] = useState<string>('');
    
    const createButtonRef = useRef<HTMLButtonElement>(null);

    const handleSportChange = (selectedSport: Sport) => {
        setSport(selectedSport);
        setSkillLevel(userProfile.skillLevels[selectedSport] || '初階');
    };
    
    const canCreate = userProfile.wCoins >= COST_TO_CREATE && locationName.trim().length > 0;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!canCreate) return;
        if (!createButtonRef.current) return;
        
        const buttonRect = createButtonRef.current.getBoundingClientRect();
        
        const roomData = { 
            sport, 
            locationName, 
            time: new Date(time).toISOString(), 
            maxPlayers, 
            skillLevel, 
            genderRequirement, 
            notes,
            minAge: minAge ? parseInt(minAge) : undefined,
            maxAge: maxAge ? parseInt(maxAge) : undefined
        };

        onTriggerCreateRoom(roomData, buttonRect);
    };

    return (
        <div className="max-w-lg mx-auto animate-fade-in">
             <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                <div className="flex justify-between items-center mb-6 border-b border-slate-100 pb-4">
                    <h2 className="text-xl font-bold text-slate-800">建立新的揪團</h2>
                    <button onClick={onBack} className="text-slate-400 hover:text-slate-600">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>

                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6 flex items-start gap-3">
                     <span className="text-2xl">💡</span>
                     <div>
                         <p className="text-sm text-blue-800 font-medium">建立費用</p>
                         <p className="text-xs text-blue-600 mt-0.5">建立房間將扣除 <span className="font-bold">{COST_TO_CREATE} W-Coins</span>。請確保您有足夠的餘額。</p>
                     </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">運動類型</label>
                            <select value={sport} onChange={e => handleSportChange(e.target.value as Sport)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary">
                                {ALL_SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">程度要求</label>
                            <select value={skillLevel} onChange={e => setSkillLevel(e.target.value as SkillLevel)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary">
                                {SKILL_LEVELS.map(level => <option key={level} value={level}>{level}</option>)}
                            </select>
                        </div>
                    </div>
                    
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">地點名稱</label>
                        <input type="text" value={locationName} onChange={(e) => setLocationName(e.target.value)} placeholder="例如：大安森林公園籃球場" className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary" required />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">日期與時間</label>
                            <input type="datetime-local" value={time} onChange={e => setTime(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm" required />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">總人數</label>
                            <input type="number" value={maxPlayers} min="2" onChange={e => setMaxPlayers(parseInt(e.target.value))} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary" required />
                        </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                         <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">最小年齡 (選填)</label>
                            <input type="number" value={minAge} onChange={e => setMinAge(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary" placeholder="無限制" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-1.5">最大年齡 (選填)</label>
                            <input type="number" value={maxAge} onChange={e => setMaxAge(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary" placeholder="無限制" />
                        </div>
                    </div>

                     <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">性別限制</label>
                        <div className="flex gap-2">
                             {MATCH_GENDER_REQUIREMENTS.map(g => (
                                <button key={g} type="button" onClick={() => setGenderRequirement(g)} className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all border ${genderRequirement === g ? 'bg-blue-50 border-brand-primary text-brand-primary' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{g}</button>
                            ))}
                        </div>
                    </div>

                     <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1.5">備註說明 (選填)</label>
                        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} placeholder="例如：場地費 $150/人，請自備球拍..." className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm" />
                    </div>

                    <div className="pt-4">
                        <button 
                            ref={createButtonRef} 
                            type="submit" 
                            disabled={!canCreate} 
                            className={`w-full py-3 rounded-xl font-bold shadow-md transition-all transform active:scale-[0.98] ${canCreate ? 'bg-brand-primary text-white hover:bg-brand-dark' : 'bg-slate-200 text-slate-400 cursor-not-allowed'}`}
                        >
                            立即建立
                        </button>
                    </div>
                </form>
             </div>
        </div>
    );
};

export default CreateMatchForm;