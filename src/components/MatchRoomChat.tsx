
import React, { useState, useRef, useEffect } from 'react';
import { MatchRoom, UserProfile } from '../types';

interface MatchRoomChatProps {
    room: MatchRoom;
    currentUser: UserProfile;
    allUsers: UserProfile[];
    onBack: () => void;
    onSendMessage: (roomId: string, message: string) => void;
    onStartRating: (room: MatchRoom) => void;
    onSendFriendRequest: (targetUserId: string) => void;
    onViewProfile: (user: UserProfile) => void;
}

const MatchRoomChat: React.FC<MatchRoomChatProps> = ({ room, currentUser, allUsers, onBack, onSendMessage, onStartRating, onSendFriendRequest, onViewProfile }) => {
    const [message, setMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const isEventTimePassed = new Date(room.time) < new Date();
    const isCurrentUserSubscribed = currentUser.subscriptionTier === 'subscribed';

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [room.messages]);
    
    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim()) {
            onSendMessage(room.id, message.trim());
            setMessage('');
        }
    };

    const getFriendshipStatus = (targetUserId: string) => {
        if (currentUser.friends.includes(targetUserId)) return { text: '已是好友', disabled: true };
        const targetUser = allUsers.find(u => u.id === targetUserId);
        if (targetUser?.friendRequests.some(req => req.from === currentUser.id)) return { text: '已送出', disabled: true };
        if (currentUser.friendRequests.some(req => req.from === targetUserId)) return { text: '確認邀請', disabled: true }; 
        return { text: '加好友', disabled: false };
    };

    const getAvatarBorderClass = (gender: string) => {
        return gender === '男性' ? 'border-blue-500' : 'border-pink-500';
    };

    return (
        <div className="h-[calc(100vh-120px)] max-w-5xl mx-auto animate-fade-in flex flex-col">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-slate-800">{room.locationName} <span className="text-slate-400 font-normal text-sm">| 聊天室</span></h2>
                <button onClick={onBack} className="text-slate-500 font-medium hover:text-slate-800">退出</button>
            </div>

            <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4 overflow-hidden">
                {/* Chat Area */}
                <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col overflow-hidden">
                    <div className="flex-grow overflow-y-auto p-4 space-y-3 bg-slate-50/50">
                        {room.messages.length === 0 && <p className="text-slate-400 text-center text-sm py-10">還沒有人發言，當第一個打招呼的人吧！</p>}
                        {room.messages.map((msg, index) => {
                            const isMe = msg.userId === currentUser.id;
                            const msgSender = allUsers.find(u => u.id === msg.userId);
                            return (
                                <div key={index} className={`flex gap-2 items-end ${isMe ? 'justify-end' : 'justify-start'}`}>
                                    {!isMe && (
                                        <div className={`w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-500 border ${msgSender ? getAvatarBorderClass(msgSender.gender) : ''}`}>
                                            {msg.name.charAt(0)}
                                        </div>
                                    )}
                                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${isMe ? 'bg-brand-primary text-white rounded-br-none' : 'bg-white text-slate-700 border border-slate-100 rounded-bl-none'}`}>
                                        {!isMe && <p className="text-[10px] text-slate-400 mb-0.5">{msg.name}</p>}
                                        <p>{msg.text}</p>
                                        <p className={`text-[9px] mt-1 text-right ${isMe ? 'text-blue-100' : 'text-slate-300'}`}>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                    </div>
                                </div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100 flex gap-2">
                        <input
                            type="text"
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            placeholder="輸入訊息..."
                            className="flex-grow bg-slate-100 border-transparent rounded-xl py-2.5 px-4 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-brand-primary focus:ring-0 transition-colors text-sm"
                        />
                        <button type="submit" className="bg-brand-primary text-white p-2.5 rounded-xl hover:bg-brand-dark transition-colors">
                             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                        </button>
                    </form>
                </div>

                {/* Member List & Actions */}
                <div className="hidden md:flex flex-col bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
                    <h3 className="text-sm font-bold text-slate-700 mb-3 uppercase tracking-wide">成員列表 <span className="text-slate-400 font-normal">({room.currentPlayers.length})</span></h3>
                    <div className="flex-grow overflow-y-auto space-y-2 pr-1">
                         {room.currentPlayers.map(player => {
                            const isCurrentUser = player.id === currentUser.id;
                            const isHost = player.id === room.host.id;
                            const friendStatus = isCurrentUser ? null : getFriendshipStatus(player.id);
                            
                            return (
                                <div key={player.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                    <div 
                                        className={`flex items-center gap-2 ${!isCurrentUser && isCurrentUserSubscribed ? 'cursor-pointer' : ''}`}
                                        onClick={!isCurrentUser && isCurrentUserSubscribed ? () => onViewProfile(player) : undefined}
                                     >
                                         <div className="relative">
                                            {player.avatarUrl ? (
                                                <img src={player.avatarUrl} alt={player.name} className={`w-8 h-8 rounded-full object-cover border-2 ${getAvatarBorderClass(player.gender)}`}/>
                                            ) : (
                                                <div className={`w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 text-xs border-2 ${getAvatarBorderClass(player.gender)}`}>
                                                    {player.name.charAt(0)}
                                                </div>
                                            )}
                                            {isHost && <span className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-900 text-[8px] font-bold px-1 py-0.5 rounded-full border border-white">HOST</span>}
                                         </div>
                                        <span className={`text-sm ${isCurrentUser ? 'font-bold text-slate-800' : 'text-slate-600'} ${!isCurrentUser && isCurrentUserSubscribed ? 'hover:text-brand-primary underline-offset-2 hover:underline' : ''}`}>{player.name}</span>
                                    </div>
                                    {!isCurrentUser && friendStatus && !friendStatus.disabled && (
                                         <button 
                                            onClick={() => onSendFriendRequest(player.id)}
                                            className="text-xs bg-white border border-slate-200 text-slate-600 font-medium py-1 px-2 rounded-md hover:bg-blue-50 hover:text-brand-primary hover:border-blue-200 transition-all"
                                          >
                                          +好友
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <div className="pt-4 mt-2 border-t border-slate-100">
                         <button
                            onClick={() => onStartRating(room)}
                            disabled={!isEventTimePassed}
                            className={`w-full py-2 px-4 rounded-xl font-bold text-sm shadow-sm transition-all ${isEventTimePassed ? 'bg-green-500 text-white hover:bg-green-600 hover:shadow-md' : 'bg-slate-100 text-slate-400 cursor-not-allowed'}`}
                        >
                            {isEventTimePassed ? '完成活動並評價' : `活動未結束`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MatchRoomChat;
