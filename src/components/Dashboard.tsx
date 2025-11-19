
import React, { RefObject } from 'react';
import { MatchRoom, UserProfile } from '../types';

interface DashboardProps {
  userProfile: UserProfile;
  onNavigate: (view: 'create' | 'find' | 'edit-profile' | 'friends' | 'view-profile' | 'inbox') => void;
  myHostedRooms: MatchRoom[];
  joinedRoomsAsParticipant: MatchRoom[];
  onViewChat: (room: MatchRoom) => void;
  showMyRooms: boolean;
  wCoinsRef?: RefObject<HTMLDivElement>; // Kept in props for compatibility but not used directly here anymore
}

const Dashboard: React.FC<DashboardProps> = ({ userProfile, onNavigate, myHostedRooms, joinedRoomsAsParticipant, onViewChat, showMyRooms }) => {
  
  return (
    <div className="animate-fade-in space-y-6">
      
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-brand-primary to-brand-light rounded-2xl p-6 text-white shadow-md relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-10 rounded-full -mr-10 -mt-10 transform rotate-45"></div>
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">早安，{userProfile.name}！</h2>
            <p className="opacity-90 mb-4">準備好今天的運動了嗎？目前您有 {userProfile.wCoins} W幣。</p>
            <div className="flex gap-2">
                {Object.entries(userProfile.skillLevels).slice(0, 4).map(([sport, level]) => (
                        <span key={sport} className="px-2 py-1 rounded-lg bg-white/20 text-xs font-bold backdrop-blur-sm border border-white/10">
                            {sport} {level}
                        </span>
                ))}
            </div>
          </div>
      </div>

      {/* Main Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          onClick={() => onNavigate('create')}
          className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 cursor-pointer group hover:shadow-md hover:border-blue-200 transition-all duration-300 flex flex-col items-center text-center"
        >
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
             </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800">開始配對</h3>
          <p className="text-slate-500 mt-2">建立新的運動房間，讓其他人加入</p>
          <div className="mt-6 px-4 py-2 bg-slate-50 rounded-full text-sm text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
              建立專屬活動
          </div>
        </div>

        <div 
          onClick={() => onNavigate('find')}
          className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 cursor-pointer group hover:shadow-md hover:border-blue-200 transition-all duration-300 flex flex-col items-center text-center"
        >
          <div className="w-16 h-16 bg-blue-100 text-brand-primary rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-slate-800">選擇配對</h3>
          <p className="text-slate-500 mt-2">瀏覽現有的運動房間，隨時加入</p>
          <div className="mt-6 px-4 py-2 bg-slate-50 rounded-full text-sm text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
              查看附近的揪團
          </div>
        </div>
      </div>

      {/* My Rooms List (Toggleable on mobile via BottomNav, always visible if showMyRooms is true) */}
      {showMyRooms && (
        <div className="space-y-8 animate-fade-in-down">
             {myHostedRooms.length > 0 && (
              <div>
                  <h3 className="text-lg font-bold text-slate-700 mb-4 px-2 border-l-4 border-yellow-400 pl-2">我的揪團</h3>
                  <div className="space-y-3">
                      {myHostedRooms.map(room => (
                         <div key={room.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
                             <div>
                                  <div className="flex items-center gap-2">
                                      <span className="font-bold text-slate-800">{room.sport}</span>
                                      <span className="text-xs text-slate-400">{new Date(room.time).toLocaleDateString()}</span>
                                  </div>
                                  <div className="text-sm text-slate-500 mt-1">{room.locationName}</div>
                             </div>
                             <button onClick={() => onViewChat(room)} className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg text-sm font-semibold hover:bg-slate-200">管理</button>
                         </div>
                      ))}
                  </div>
              </div>
            )}

            {joinedRoomsAsParticipant.length > 0 && (
              <div>
                  <h3 className="text-lg font-bold text-slate-700 mb-4 px-2 border-l-4 border-brand-primary pl-2">已加入的揪團</h3>
                  <div className="space-y-3">
                      {joinedRoomsAsParticipant.map(room => (
                          <div key={room.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex justify-between items-center">
                             <div>
                                  <div className="flex items-center gap-2">
                                      <span className="font-bold text-slate-800">{room.sport}</span>
                                      <span className="text-xs text-slate-400">{new Date(room.time).toLocaleDateString()}</span>
                                  </div>
                                  <div className="text-sm text-slate-500 mt-1">{room.locationName}</div>
                             </div>
                             <button onClick={() => onViewChat(room)} className="px-4 py-2 bg-blue-50 text-brand-primary rounded-lg text-sm font-semibold hover:bg-blue-100">查看</button>
                         </div>
                      ))}
                  </div>
              </div>
            )}
            {myHostedRooms.length === 0 && joinedRoomsAsParticipant.length === 0 && (
                <div className="text-center text-slate-400 py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    目前沒有進行中的活動
                </div>
            )}
        </div>
      )}
    </div>
  );
};

export default Dashboard;