
import React, { useRef } from 'react';
import { MatchRoom, UserProfile, Sport } from '../types';
import { COST_TO_JOIN } from '../constants';

interface MatchRoomDetailsProps {
    room: MatchRoom;
    currentUser: UserProfile;
    onBack: () => void;
    onTriggerJoinRoom: (roomId: string, buttonRect: DOMRect) => void;
    onViewProfile: (user: UserProfile) => void;
}

const calculateAverageRating = (ratings: { intensity: Partial<Record<Sport, number[]>>; friendliness: number[] }): number => {
    const allIntensity = Object.values(ratings.intensity).flat();
    const allRatings = [...allIntensity, ...ratings.friendliness];
    if (allRatings.length === 0) return 0;
    const sum = allRatings.reduce((acc, r) => acc + r, 0);
    return sum / allRatings.length;
};

const MatchRoomDetails: React.FC<MatchRoomDetailsProps> = ({ room, currentUser, onBack, onTriggerJoinRoom, onViewProfile }) => {
    const joinButtonRef = useRef<HTMLButtonElement>(null);
    const hasEnoughCoins = currentUser.wCoins >= COST_TO_JOIN;
    const isFull = room.currentPlayers.length >= room.maxPlayers;
    const isAlreadyJoined = room.currentPlayers.some(p => p.id === currentUser.id);
    const canJoinGender = room.genderRequirement === '不限' || room.genderRequirement === currentUser.gender;
    const isJoinDisabled = isFull || isAlreadyJoined || !canJoinGender || !hasEnoughCoins;

    let joinButtonText = `立即加入`;
    if (isFull) joinButtonText = '已額滿';
    else if (isAlreadyJoined) joinButtonText = '已參加';
    else if (!canJoinGender) joinButtonText = '資格不符';

    const handleJoinClick = () => {
        if (joinButtonRef.current) {
            const rect = joinButtonRef.current.getBoundingClientRect();
            onTriggerJoinRoom(room.id, rect);
        }
    };

    const getAvatarBorderClass = (gender: string) => {
        return gender === '男性' ? 'border-blue-500' : 'border-pink-500';
    };

    return (
        <div className="max-w-3xl mx-auto animate-fade-in">
             <div className="mb-4">
                <button onClick={onBack} className="text-slate-500 hover:text-slate-800 font-medium flex items-center gap-1">
                     <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    返回列表
                </button>
            </div>
            
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden mb-6">
                <div className="p-6 border-b border-slate-100">
                    <div className="flex items-center gap-3 mb-3">
                        <span className="px-3 py-1 rounded-full bg-blue-50 text-brand-primary text-sm font-bold">{room.sport}</span>
                        <span className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-sm font-medium">{room.skillLevel}</span>
                         {room.genderRequirement !== '不限' && (
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${room.genderRequirement === '男性' ? 'bg-blue-50 text-blue-600' : 'bg-pink-50 text-pink-600'}`}>
                                限{room.genderRequirement}
                            </span>
                        )}
                         {(room.minAge || room.maxAge) && (
                            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100 text-sm font-medium">
                                {room.minAge || 0} - {room.maxAge || '不限'} 歲
                            </span>
                        )}
                    </div>
                    <h1 className="text-3xl font-bold text-slate-800 mb-2">{room.locationName}</h1>
                    <p className="text-slate-500 flex items-center gap-2">
                         <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {new Date(room.time).toLocaleString('zh-TW', { dateStyle: 'full', timeStyle: 'short' })}
                    </p>
                </div>

                <div className="p-6 bg-slate-50">
                    <div className="flex flex-col sm:flex-row gap-6">
                         <div className="flex-1">
                            <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">活動備註</h3>
                            <div className="bg-white p-4 rounded-xl border border-slate-200 text-slate-700 text-sm leading-relaxed">
                                {room.notes ? room.notes : '房主沒有留下備註。'}
                            </div>
                         </div>
                         <div className="sm:w-64 flex flex-col gap-4">
                             <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                                 <span className="text-slate-500 font-medium">目前人數</span>
                                 <span className="text-xl font-bold text-slate-800">{room.currentPlayers.length} <span className="text-slate-400 text-sm font-normal">/ {room.maxPlayers}</span></span>
                             </div>
                             <div className="bg-white p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                                 <span className="text-slate-500 font-medium">加入費用</span>
                                 <span className="text-xl font-bold text-yellow-500">{COST_TO_JOIN} <span className="text-xs text-slate-400 font-normal">W-COINS</span></span>
                             </div>
                            <button 
                                ref={joinButtonRef} 
                                onClick={handleJoinClick} 
                                disabled={isJoinDisabled} 
                                className={`w-full py-3 rounded-xl font-bold text-white shadow-md transition-all transform active:scale-[0.98] ${isJoinDisabled ? 'bg-slate-400 cursor-not-allowed shadow-none' : 'bg-brand-primary hover:bg-brand-dark'}`}
                            >
                                {joinButtonText}
                            </button>
                         </div>
                    </div>
                </div>
            </div>

            <div>
                <h3 className="text-lg font-bold text-slate-800 mb-4 px-1">參與名單 ({room.currentPlayers.length})</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {room.currentPlayers.map(player => {
                        const avgRating = calculateAverageRating(player.ratings);
                        const isSubscribed = currentUser.subscriptionTier === 'subscribed';
                        const isFriend = currentUser.friends.includes(player.id);
                        const canViewDetails = (isSubscribed && (isFriend || player.id !== currentUser.id));
                        const isHost = player.id === room.host.id;

                        return (
                            <div 
                                key={player.id} 
                                className={`bg-white p-4 rounded-xl border border-slate-100 flex items-center gap-4 shadow-sm ${canViewDetails ? 'cursor-pointer hover:border-blue-200 hover:shadow-md transition-all' : ''}`}
                                onClick={canViewDetails ? () => onViewProfile(player) : undefined}
                            >
                                <div className="relative">
                                    {player.avatarUrl ? (
                                        <img src={player.avatarUrl} alt={player.name} className={`w-12 h-12 rounded-full object-cover border-2 ${getAvatarBorderClass(player.gender)}`}/>
                                    ) : (
                                        <div className={`w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-lg border-2 ${getAvatarBorderClass(player.gender)}`}>
                                            {player.name.charAt(0)}
                                        </div>
                                    )}
                                    {isHost && <span className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-white">HOST</span>}
                                </div>
                                <div>
                                    <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
                                        {player.name} 
                                        {player.id === currentUser.id && <span className="text-slate-400 font-normal">(你)</span>}
                                    </h4>
                                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                                        <span>{player.skillLevels[room.sport] || '未分級'}</span>
                                        <span className="text-slate-300">•</span>
                                        <span className="flex items-center text-yellow-500">
                                            ★ {avgRating.toFixed(1)}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default MatchRoomDetails;
