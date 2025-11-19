
import React, { forwardRef } from 'react';
import { UserProfile, Conversation } from '../types';

interface PageHeaderProps {
  userProfile?: UserProfile | null;
  onLogout?: () => void;
  onNavigate?: (view: 'dashboard' | 'view-profile' | 'inbox' | 'friends') => void;
}

const PageHeader = forwardRef<HTMLDivElement, PageHeaderProps>(({ userProfile, onLogout, onNavigate }, ref) => {
  
  const unreadMessagesCount = userProfile
        ? Object.values(userProfile.conversations)
            .flatMap((conv: Conversation) => conv.messages)
            .filter(msg => !msg.isRead).length
        : 0;

  const pendingRequestsCount = userProfile ? userProfile.friendRequests.length : 0;

  const getAvatarBorderClass = (gender: string) => {
      return gender === '男性' ? 'border-blue-500' : 'border-pink-500';
  };

  return (
    <header className="flex flex-col sm:flex-row justify-between items-center py-4 mb-6 px-4 sm:px-0 bg-white sm:bg-transparent shadow-sm sm:shadow-none rounded-xl sm:rounded-none">
      <div className="flex items-center gap-4 w-full sm:w-auto mb-4 sm:mb-0">
        <div 
            onClick={() => onNavigate && onNavigate('dashboard')} 
            className="cursor-pointer group"
        >
            <h1 className="text-2xl font-bold text-brand-primary flex items-center gap-2">
                <span className="bg-brand-primary text-white p-1 rounded-lg group-hover:bg-brand-dark transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                </span>
                Huddle <span className="text-slate-400 text-lg font-normal">揪運動</span>
            </h1>
        </div>
      </div>

      {userProfile && onNavigate && (
        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
            {/* W-Coins Display (Target for Animation) */}
            <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1.5 rounded-full border border-yellow-100" ref={ref}>
                <span className="text-lg">💰</span>
                <span className="font-extrabold text-yellow-600">{userProfile.wCoins}</span>
            </div>

            <div className="flex items-center gap-3">
                 {/* Inbox Icon */}
                <button onClick={() => onNavigate('inbox')} className="relative p-2 text-slate-400 hover:text-brand-primary transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                    </svg>
                    {unreadMessagesCount > 0 && (
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                    )}
                </button>

                {/* Friends Icon */}
                <button onClick={() => onNavigate('friends')} className="relative p-2 text-slate-400 hover:text-brand-primary transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {pendingRequestsCount > 0 && (
                        <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
                    )}
                </button>

                {/* Avatar / Profile Link */}
                <div 
                    className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => onNavigate('view-profile')}
                >
                    {userProfile.avatarUrl ? (
                        <img src={userProfile.avatarUrl} alt={userProfile.name} className={`w-9 h-9 rounded-full object-cover border-2 ${getAvatarBorderClass(userProfile.gender)}`} />
                    ) : (
                        <div className={`w-9 h-9 rounded-full bg-brand-light text-white flex items-center justify-center font-bold text-sm border-2 ${getAvatarBorderClass(userProfile.gender)}`}>
                            {userProfile.name.charAt(0)}
                        </div>
                    )}
                    <span className="font-bold text-slate-700 hidden md:block">{userProfile.name}</span>
                </div>
            </div>
             {onLogout && (
                <button 
                    onClick={onLogout}
                    className="ml-2 text-slate-400 hover:text-slate-600 flex items-center gap-1 text-sm font-medium transition-colors border-l border-slate-200 pl-3"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="hidden sm:inline">登出</span>
                </button>
            )}
        </div>
      )}
    </header>
  );
});

export default PageHeader;
