
import React, { useState, useMemo, useRef } from 'react';
import { MatchRoom, Sport, UserProfile } from '../types';
import { ALL_SPORTS, COST_TO_JOIN } from '../constants';

interface FindMatchListProps {
    allRooms: MatchRoom[];
    onBack: () => void;
    onTriggerJoinRoom: (roomId: string, buttonRect: DOMRect) => void;
    onViewRoom: (room: MatchRoom) => void;
    userProfile: UserProfile;
}

const calculateAge = (birthDateString: string) => {
    if (!birthDateString) return 0;
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

const FindMatchList: React.FC<FindMatchListProps> = ({ allRooms, onBack, onTriggerJoinRoom, onViewRoom, userProfile }) => {
    const [selectedSport, setSelectedSport] = useState<Sport | 'all'>('all');
    const joinButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
    
    const hasEnoughCoins = userProfile.wCoins >= COST_TO_JOIN;
    const userAge = calculateAge(userProfile.birthDate);

    const sortedRooms = useMemo(() => {
        const filtered = allRooms.filter(room => 
            (selectedSport === 'all' || room.sport === selectedSport) && 
            !room.currentPlayers.some(p => p.id === userProfile.id)
        );
        return filtered.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
    }, [allRooms, selectedSport, userProfile.id]);

    const checkRestrictions = (room: MatchRoom) => {
        let reason = '';
        let allowed = true;

        // Check Gender
        if (room.genderRequirement !== '不限' && room.genderRequirement !== userProfile.gender) {
            allowed = false;
            reason = '性別不符';
        }

        // Check Age
        if (room.minAge && userAge < room.minAge) {
            allowed = false;
            reason = '年齡過小';
        }
        if (room.maxAge && userAge > room.maxAge) {
            allowed = false;
            reason = '年齡過大';
        }

        // Check Coins
        if (!hasEnoughCoins) {
            allowed = false;
            reason = 'W幣不足';
        }
        
        // Check Full
        if (room.currentPlayers.length >= room.maxPlayers) {
            allowed = false;
            reason = '已額滿';
        }

        return { allowed, reason };
    }

    const handleJoinClick = (roomId: string) => {
        const button = joinButtonRefs.current[roomId];
        if (button) {
            const rect = button.getBoundingClientRect();
            onTriggerJoinRoom(roomId, rect);
        }
    };

    return (
        <div className="max-w-4xl mx-auto animate-fade-in">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">尋找活動</h2>
                <button onClick={onBack} className="text-slate-500 font-medium hover:text-slate-800 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    返回
                </button>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-4 mb-2 scrollbar-hide">
                <button 
                    onClick={() => setSelectedSport('all')}
                    className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${selectedSport === 'all' ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                >
                    全部
                </button>
                {ALL_SPORTS.map(sport => (
                     <button 
                        key={sport}
                        onClick={() => setSelectedSport(sport)}
                        className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${selectedSport === sport ? 'bg-brand-primary text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
                    >
                        {sport}
                    </button>
                ))}
            </div>

            <div className="space-y-4">
                {sortedRooms.map(room => {
                    const { allowed, reason } = checkRestrictions(room);
                    
                    return (
                        <div key={room.id} className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                            {/* Tags / Restrictions */}
                            <div className="flex flex-wrap gap-2 mb-3">
                                <div className="flex items-center gap-2">
                                    <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-brand-primary text-xs font-bold">{room.sport}</span>
                                    <span className="text-xs text-slate-500 font-medium bg-slate-100 px-2 py-1 rounded-lg">{room.skillLevel}</span>
                                </div>
                                <span className={`text-xs px-2 py-1 rounded-lg font-medium ${room.genderRequirement === '不限' ? 'bg-slate-100 text-slate-500' : (room.genderRequirement === '男性' ? 'bg-blue-100 text-blue-600' : 'bg-pink-100 text-pink-600')}`}>
                                    {room.genderRequirement === '不限' ? '性別不限' : `限${room.genderRequirement}`}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded-lg font-medium ${(!room.minAge && !room.maxAge) ? 'bg-slate-100 text-slate-500' : 'bg-amber-50 text-amber-700 border border-amber-100'}`}>
                                    {(!room.minAge && !room.maxAge) ? '年齡不限' : `${room.minAge || 0} - ${room.maxAge || '不限'} 歲`}
                                </span>
                            </div>

                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 mb-1">{room.locationName}</h3>
                                    <span className="text-xs font-medium text-slate-400 block mb-3">
                                        {new Date(room.time).toLocaleDateString()} {new Date(room.time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                    </span>
                                </div>
                            </div>
                            
                            {/* Notes Section */}
                            {room.notes && (
                                <div className="mb-4 p-2.5 bg-slate-50 rounded-lg text-xs text-slate-600 border border-slate-100">
                                    <span className="font-bold text-slate-400 mr-1">備註:</span>
                                    <span className="line-clamp-2">{room.notes}</span>
                                </div>
                            )}

                            <p className="text-sm text-slate-500 flex items-center gap-1 mb-4">
                                <span className="inline-block w-2 h-2 rounded-full bg-slate-300"></span>
                                房主: {room.host.name}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                <div className="flex items-center gap-3">
                                     <div className="flex -space-x-2">
                                        {room.currentPlayers.slice(0, 3).map(p => (
                                            <div key={p.id} className="relative group/avatar">
                                                {p.avatarUrl ? 
                                                <img 
                                                    src={p.avatarUrl} 
                                                    className={`w-8 h-8 rounded-full border-2 bg-white ${p.gender === '男性' ? 'border-blue-500' : 'border-pink-500'}`} 
                                                    alt={p.name} 
                                                /> :
                                                <div className={`w-8 h-8 rounded-full border-2 bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 ${p.gender === '男性' ? 'border-blue-500' : 'border-pink-500'}`}>
                                                    {p.name.charAt(0)}
                                                </div>
                                                }
                                                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-[10px] px-2 py-1 rounded pointer-events-none opacity-0 group-hover/avatar:opacity-100 transition-opacity whitespace-nowrap z-10">
                                                    {p.gender === '男性' ? '♂' : '♀'} {calculateAge(p.birthDate)}歲
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <span className="text-xs font-medium text-slate-500">
                                        {room.currentPlayers.length} / {room.maxPlayers} 人
                                    </span>
                                </div>
                                <div className="flex gap-2">
                                    <button 
                                        onClick={() => onViewRoom(room)}
                                        className="px-4 py-2 rounded-xl bg-slate-50 text-slate-600 text-sm font-bold hover:bg-slate-100 transition-colors"
                                    >
                                        詳情
                                    </button>
                                    <button
                                        ref={el => { joinButtonRefs.current[room.id] = el; }} 
                                        onClick={() => handleJoinClick(room.id)}
                                        disabled={!allowed}
                                        className={`px-6 py-2 rounded-xl text-sm font-bold text-white transition-all ${!allowed ? 'bg-slate-300 cursor-not-allowed' : 'bg-brand-primary hover:bg-brand-dark shadow-sm hover:shadow'}`}
                                    >
                                        {allowed ? '加入' : reason}
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
                {sortedRooms.length === 0 && (
                    <div className="text-center py-12 px-4">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400 text-2xl">🔍</div>
                        <h3 className="text-slate-800 font-bold mb-1">沒有找到相關活動</h3>
                        <p className="text-slate-500 text-sm">試著切換篩選條件，或是自己建立一個吧！</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FindMatchList;
