
import React, { useState, useEffect, useMemo } from 'react';
import { UserProfile, Sport, SkillLevel, UserGender } from '../types';
import { ALL_SPORTS, SKILL_LEVELS, USER_GENDERS, TAIWAN_CITIES, TAIWAN_DISTRICTS } from '../constants';

interface UserProfileSetupProps {
    onProfileCreate: (profile: UserProfile) => void;
    isEditMode?: boolean;
    initialProfile?: UserProfile | null;
    onBack?: () => void;
}

const UserProfileSetup: React.FC<UserProfileSetupProps> = ({ onProfileCreate, isEditMode = false, initialProfile = null, onBack }) => {
    const [step, setStep] = useState(1);
    const [name, setName] = useState('');
    const [avatarUrl, setAvatarUrl] = useState('');
    const [selectedSports, setSelectedSports] = useState<Sport[]>([]);
    const [skillLevels, setSkillLevels] = useState<Partial<Record<Sport, SkillLevel>>>({});
    const [gender, setGender] = useState<UserGender | ''>('');
    
    // Date State
    const currentYear = new Date().getFullYear();
    const [birthYear, setBirthYear] = useState(currentYear - 20);
    const [birthMonth, setBirthMonth] = useState(1);
    const [birthDay, setBirthDay] = useState(1);

    const [city, setCity] = useState('');
    const [district, setDistrict] = useState('');
    const [availableDistricts, setAvailableDistricts] = useState<string[]>([]);

    useEffect(() => {
        if (isEditMode && initialProfile) {
            setName(initialProfile.name);
            setAvatarUrl(initialProfile.avatarUrl || '');
            const sports = Object.keys(initialProfile.skillLevels) as Sport[];
            setSelectedSports(sports);
            setSkillLevels(initialProfile.skillLevels);
            setGender(initialProfile.gender);
            
            if (initialProfile.birthDate) {
                const date = new Date(initialProfile.birthDate);
                setBirthYear(date.getFullYear());
                setBirthMonth(date.getMonth() + 1);
                setBirthDay(date.getDate());
            }

            setCity(initialProfile.city);
            setDistrict(initialProfile.district);
        }
    }, [isEditMode, initialProfile]);

    useEffect(() => {
      if (city && TAIWAN_DISTRICTS[city]) {
          setAvailableDistricts(TAIWAN_DISTRICTS[city]);
          if (initialProfile?.city !== city) {
             setDistrict('');
          }
      } else {
          setAvailableDistricts([]);
      }
    }, [city, initialProfile]);
    
    const years = useMemo(() => {
        const y = [];
        for (let i = currentYear; i >= 1950; i--) y.push(i);
        return y;
    }, [currentYear]);

    const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);
    
    const days = useMemo(() => {
        const daysInMonth = new Date(birthYear, birthMonth, 0).getDate();
        return Array.from({ length: daysInMonth }, (_, i) => i + 1);
    }, [birthYear, birthMonth]);


    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setAvatarUrl(event.target?.result as string);
            };
            reader.readAsDataURL(e.target.files[0]);
        }
    };

    const handleSportToggle = (sport: Sport) => {
        const isSelected = selectedSports.includes(sport);
        let newSelectedSports: Sport[];
        if (isSelected) {
            newSelectedSports = selectedSports.filter(s => s !== sport);
            setSkillLevels(prev => {
                const newLevels = { ...prev };
                delete newLevels[sport];
                return newLevels;
            });
        } else {
            newSelectedSports = [...selectedSports, sport];
        }
        setSelectedSports(newSelectedSports);
    };

    const handleSkillLevelChange = (sport: Sport, level: SkillLevel) => {
        setSkillLevels(prev => ({ ...prev, [sport]: level }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const areAllSkillsSet = selectedSports.length > 0 && selectedSports.every(s => !!skillLevels[s]);

        if (!name || !gender || !city || !district || !areAllSkillsSet ) {
            alert('請填寫所有必填欄位');
            return;
        }

        // Format date string YYYY-MM-DD
        const formattedDate = `${birthYear}-${String(birthMonth).padStart(2, '0')}-${String(birthDay).padStart(2, '0')}`;
        
        const profileData: UserProfile = {
            id: isEditMode && initialProfile ? initialProfile.id : `user-${Date.now()}`,
            name,
            avatarUrl,
            skillLevels,
            gender: gender as UserGender,
            birthDate: formattedDate,
            city,
            district,
            ratings: isEditMode && initialProfile ? initialProfile.ratings : { intensity: {}, friendliness: [], comments: [] },
            friends: isEditMode && initialProfile ? initialProfile.friends : [],
            friendRequests: isEditMode && initialProfile ? initialProfile.friendRequests : [],
            conversations: isEditMode && initialProfile ? initialProfile.conversations : {},
            wCoins: isEditMode && initialProfile ? initialProfile.wCoins : 20,
            subscriptionTier: isEditMode && initialProfile ? initialProfile.subscriptionTier : 'free',
            monthlyActivity: isEditMode && initialProfile ? initialProfile.monthlyActivity : {
                lastReset: new Date().toISOString(),
            },
        };
        onProfileCreate(profileData);
    };
    
    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);
    
    const areAllSkillsSet = selectedSports.length > 0 && selectedSports.every(s => !!skillLevels[s]);

    const renderStepIndicator = () => (
        <div className="flex justify-center mb-8">
            {[1, 2, 3, 4].map(i => (
                <div key={i} className={`w-3 h-3 rounded-full mx-2 ${step === i ? 'bg-brand-primary scale-125' : step > i ? 'bg-brand-light' : 'bg-slate-200'}`}></div>
            ))}
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden animate-fade-in">
             <div className="bg-slate-50 p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800">
                    {isEditMode ? '編輯個人檔案' : '建立個人檔案'}
                </h2>
                {onBack && (
                    <button onClick={onBack} className="text-sm text-slate-500 hover:text-slate-800">取消</button>
                )}
            </div>
            
            <div className="p-6 md:p-8">
                {!isEditMode && renderStepIndicator()}
                
                <form onSubmit={handleSubmit}>
                     {(step === 1 || isEditMode) && (
                        <div className={isEditMode ? "space-y-6" : "space-y-6 animate-fade-in"}>
                             <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">您的稱呼</label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all" placeholder="例如: Alex" required/>
                            </div>
                             <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">大頭貼</label>
                                <div className="flex items-center gap-4">
                                    {avatarUrl ? <img src={avatarUrl} alt="Preview" className="w-16 h-16 rounded-full object-cover border border-slate-200" /> : <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 text-2xl font-bold">{name ? name.charAt(0) : '?'}</div>}
                                    <label className="cursor-pointer px-4 py-2 bg-white border border-slate-200 rounded-lg text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                                        更換圖片
                                        <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                                    </label>
                                </div>
                            </div>
                             {(!isEditMode) && (
                                <div className="flex justify-end mt-6">
                                    <button type="button" onClick={nextStep} disabled={!name} className="px-6 py-2 bg-brand-primary text-white rounded-xl font-semibold hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors">下一步</button>
                                </div>
                            )}
                        </div>
                     )}

                     {(step === 2 || isEditMode) && (
                        <div className={isEditMode ? "space-y-6 pt-6 border-t border-slate-100" : "space-y-6 animate-fade-in"}>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-3">{isEditMode ? "感興趣的運動" : "您喜歡哪些運動?"}</label>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                    {ALL_SPORTS.map(sport => (
                                        <button 
                                            key={sport} 
                                            type="button" 
                                            onClick={() => handleSportToggle(sport)} 
                                            className={`p-3 rounded-xl text-sm font-medium transition-all border ${selectedSports.includes(sport) ? 'bg-blue-50 border-brand-primary text-brand-primary' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                                        >
                                            {sport}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            {(!isEditMode) && (
                                <div className="flex justify-between mt-6">
                                    <button type="button" onClick={prevStep} className="px-6 py-2 text-slate-500 font-medium hover:text-slate-800">上一步</button>
                                    <button type="button" onClick={nextStep} disabled={selectedSports.length === 0} className="px-6 py-2 bg-brand-primary text-white rounded-xl font-semibold hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors">下一步</button>
                                </div>
                            )}
                        </div>
                     )}

                     {(step === 3 || isEditMode) && selectedSports.length > 0 && (
                         <div className={isEditMode ? "space-y-6 pt-6 border-t border-slate-100" : "space-y-6 animate-fade-in"}>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-3">自我程度評估</label>
                                <div className="space-y-4">
                                    {selectedSports.map(sport => (
                                        <div key={sport} className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                            <span className="block text-sm font-bold text-slate-700 mb-2">{sport}</span>
                                            <div className="flex flex-wrap gap-2">
                                                {SKILL_LEVELS.map(level => (
                                                    <button 
                                                        key={level} 
                                                        type="button" 
                                                        onClick={() => handleSkillLevelChange(sport, level)} 
                                                        className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${skillLevels[sport] === level ? 'bg-brand-primary text-white shadow-sm' : 'bg-white border border-slate-200 text-slate-500 hover:bg-slate-100'}`}
                                                    >
                                                        {level}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                             {(!isEditMode) && (
                                <div className="flex justify-between mt-6">
                                    <button type="button" onClick={prevStep} className="px-6 py-2 text-slate-500 font-medium hover:text-slate-800">上一步</button>
                                    <button type="button" onClick={nextStep} disabled={!areAllSkillsSet} className="px-6 py-2 bg-brand-primary text-white rounded-xl font-semibold hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors">下一步</button>
                                </div>
                            )}
                         </div>
                     )}

                     {(step === 4 || isEditMode) && (
                         <div className={isEditMode ? "space-y-6 pt-6 border-t border-slate-100" : "space-y-6 animate-fade-in"}>
                             <div className="grid grid-cols-2 gap-4">
                                 <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">性別</label>
                                    <div className="flex gap-2">
                                        {USER_GENDERS.map(g => (
                                            <button key={g} type="button" onClick={() => setGender(g)} className={`flex-1 py-2 rounded-xl text-sm font-medium transition-all border ${gender === g ? 'bg-blue-50 border-brand-primary text-brand-primary' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{g}</button>
                                        ))}
                                    </div>
                                 </div>
                                 <div className="col-span-1">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2">出生日期</label>
                                    <div className="flex gap-2">
                                        <select 
                                            value={birthYear} 
                                            onChange={e => setBirthYear(Number(e.target.value))} 
                                            className="w-full bg-white border border-slate-200 rounded-xl py-2 px-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm"
                                        >
                                            {years.map(y => <option key={y} value={y}>{y}年</option>)}
                                        </select>
                                        <select 
                                            value={birthMonth} 
                                            onChange={e => setBirthMonth(Number(e.target.value))} 
                                            className="w-full bg-white border border-slate-200 rounded-xl py-2 px-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm"
                                        >
                                            {months.map(m => <option key={m} value={m}>{m}月</option>)}
                                        </select>
                                        <select 
                                            value={birthDay} 
                                            onChange={e => setBirthDay(Number(e.target.value))} 
                                            className="w-full bg-white border border-slate-200 rounded-xl py-2 px-2 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary text-sm"
                                        >
                                            {days.map(d => <option key={d} value={d}>{d}日</option>)}
                                        </select>
                                    </div>
                                 </div>
                             </div>
                             <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">活動區域</label>
                                <div className="flex gap-3">
                                    <select value={city} onChange={e => setCity(e.target.value)} className="w-1/2 bg-white border border-slate-200 rounded-xl py-2 px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary">
                                        <option value="" disabled>縣市</option>
                                        {TAIWAN_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    <select value={district} onChange={e => setDistrict(e.target.value)} disabled={!city} className="w-1/2 bg-white border border-slate-200 rounded-xl py-2 px-3 text-slate-800 focus:outline-none focus:ring-2 focus:ring-brand-primary disabled:bg-slate-100 disabled:text-slate-400">
                                        <option value="" disabled>區域</option>
                                        {availableDistricts.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                </div>
                             </div>
                             
                             <div className="flex justify-between mt-8 pt-4 border-t border-slate-100">
                                 {!isEditMode && <button type="button" onClick={prevStep} className="px-6 py-2 text-slate-500 font-medium hover:text-slate-800">上一步</button>}
                                 <button type="submit" disabled={!gender || !city || !district} className={`px-8 py-2 bg-green-500 text-white rounded-xl font-bold shadow-md hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-95 ${isEditMode ? 'ml-auto' : ''}`}>
                                     {isEditMode ? '儲存變更' : '完成註冊'}
                                 </button>
                             </div>
                         </div>
                     )}
                </form>
            </div>
        </div>
    );
};

export default UserProfileSetup;