
import React from 'react';
import { UserProfile } from '../types';

interface FriendsManagementProps {
    currentUser: UserProfile;
    allUsers: UserProfile[];
    onBack: () => void;
    onAccept: (requesterId: string) => void;
    onDecline: (requesterId: string) => void;
    onViewProfile: (user: UserProfile) => void;
    onSendMessage: (userId: string) => void;
}

const FriendsManagement: React.FC<FriendsManagementProps> = ({ currentUser, allUsers, onBack, onAccept, onDecline, onViewProfile, onSendMessage }) => {
    const friendRequests = currentUser.friendRequests.map(req => {
        const user = allUsers.find(u => u.id === req.from);
        return user ? { ...req, name: user.name, avatarUrl: user.avatarUrl, gender: user.gender } : null;
    }).filter(Boolean);

    const friends = currentUser.friends.map(friendId => {
        return allUsers.find(u => u.id === friendId);
    }).filter(Boolean) as UserProfile[];

    const getAvatarBorderClass = (gender: string) => {
        return gender === '男性' ? 'border-blue-500' : 'border-pink-500';
    };

    return (
        <div className="max-w-3xl mx-auto animate-fade-in">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">好友名單</h2>
                <button onClick={onBack} className="text-slate-500 hover:text-slate-800 font-medium">返回</button>
            </div>

            <div className="space-y-8">
                {friendRequests.length > 0 && (
                    <div className="bg-blue-50 rounded-2xl p-6 border border-blue-100">
                        <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                            <span className="bg-blue-200 text-blue-800 text-xs px-2 py-0.5 rounded-full">{friendRequests.length}</span>
                            待確認邀請
                        </h3>
                        <div className="space-y-3">
                            {friendRequests.map(req => req && (
                                <div key={req.from} className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                         {req.avatarUrl ? (
                                            <img src={req.avatarUrl} alt={req.name} className={`w-10 h-10 rounded-full object-cover shadow-sm border-2 ${getAvatarBorderClass(req.gender)}`}/>
                                        ) : (
                                            <div className={`w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 border-2 ${getAvatarBorderClass(req.gender)}`}>
                                                {req.name.charAt(0)}
                                            </div>
                                        )}
                                        <span className="font-bold text-slate-800">{req.name}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        <button onClick={() => onAccept(req.from)} className="bg-brand-primary text-white font-semibold py-1.5 px-4 rounded-lg hover:bg-brand-dark transition-colors text-sm shadow-sm">接受</button>
                                        <button onClick={() => onDecline(req.from)} className="bg-white border border-slate-200 text-slate-600 font-semibold py-1.5 px-4 rounded-lg hover:bg-slate-50 transition-colors text-sm">忽略</button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div>
                     <h3 className="text-lg font-bold text-slate-800 mb-4 px-2">我的好友 ({friends.length})</h3>
                     {friends.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {friends.map(friend => friend && (
                                <div 
                                    key={friend.id} 
                                    className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm hover:shadow-md hover:border-blue-100 transition-all flex items-center justify-between group cursor-pointer"
                                    onClick={() => onViewProfile(friend)}
                                >
                                    <div className="flex items-center gap-3">
                                         {friend.avatarUrl ? (
                                            <img src={friend.avatarUrl} alt={friend.name} className={`w-12 h-12 rounded-full object-cover border-2 ${getAvatarBorderClass(friend.gender)}`}/>
                                        ) : (
                                            <div className={`w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-400 text-lg group-hover:bg-blue-50 group-hover:text-brand-primary transition-colors border-2 ${getAvatarBorderClass(friend.gender)}`}>
                                                {friend.name.charAt(0)}
                                            </div>
                                        )}
                                        <div>
                                            <h4 className="font-bold text-slate-800 group-hover:text-brand-primary transition-colors">{friend.name}</h4>
                                            <p className="text-xs text-slate-400">{friend.city} {friend.district}</p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={(e) => { e.stopPropagation(); onSendMessage(friend.id); }}
                                        className="p-2 rounded-full text-slate-400 hover:bg-blue-50 hover:text-brand-primary transition-colors"
                                        title="傳送訊息"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                                            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-2xl border border-slate-100 border-dashed">
                             <p className="text-slate-400">您還沒有好友，快去參加活動認識新朋友吧！</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default FriendsManagement;
