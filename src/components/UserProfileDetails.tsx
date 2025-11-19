
import React from 'react';
import { UserProfile, Sport } from '../types';

interface UserProfileDetailsProps {
    profileToShow: UserProfile;
    viewerProfile: UserProfile;
    onBack: () => void;
}

const calculateAverage = (arr: number[]): number => {
    if (!arr || arr.length === 0) return 0;
    return arr.reduce((acc, val) => acc + val, 0) / arr.length;
};

const calculateAge = (birthDateString: string) => {
    if (!birthDateString) return '?';
    const today = new Date();
    const birthDate = new Date(birthDateString);
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

const RatingStars: React.FC<{ rating: number; label?: string; }> = ({ rating, label }) => {
    const fullStars = Math.floor(rating);
    const halfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

    return (
        <div className="flex items-center justify-between w-full">
            {label && <span className="text-sm font-medium text-slate-600">{label}</span>}
            <div className="flex items-center gap-2">
                 <div className="flex text-yellow-400">
                    {[...Array(fullStars)].map((_, i) => <svg key={`full-${i}`} className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                    {halfStar && <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>}
                    {[...Array(emptyStars)].map((_, i) => <svg key={`empty-${i}`} className="w-4 h-4 text-slate-200" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>)}
                </div>
                <span className="text-xs font-bold text-slate-400 min-w-[20px] text-right">{rating.toFixed(1)}</span>
            </div>
        </div>
    );
};

const UserProfileDetails: React.FC<UserProfileDetailsProps> = ({ profileToShow, viewerProfile, onBack }) => {
    const { name, avatarUrl, gender, birthDate, city, district, skillLevels, ratings } = profileToShow;
    const isViewerSubscribed = viewerProfile.subscriptionTier === 'subscribed';
    const isOwnProfile = profileToShow.id === viewerProfile.id;
    const age = calculateAge(birthDate);

    const allIntensityRatings = Object.values(ratings.intensity).flat();
    const overallRating = calculateAverage([...allIntensityRatings, ...ratings.friendliness]);
    const friendlinessRating = calculateAverage(ratings.friendliness);

    const canViewDetails = isViewerSubscribed || isOwnProfile;
    
    const getAvatarBorderClass = (gender: string) => {
        return gender === '男性' ? 'border-blue-500' : 'border-pink-500';
    };

    return (
        <div className="max-w-2xl mx-auto animate-fade-in">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">用戶檔案</h2>
                <button onClick={onBack} className="text-slate-500 hover:text-slate-800 font-medium">返回</button>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="p-8 flex flex-col items-center text-center border-b border-slate-50">
                    <div className="relative mb-4">
                         {avatarUrl ? (
                            <img src={avatarUrl} alt={name} className={`w-24 h-24 rounded-full object-cover shadow-md border-4 ${gender === '男性' ? 'border-blue-500' : 'border-pink-500'}`}/>
                        ) : (
                            <div className={`w-24 h-24 rounded-full bg-blue-50 flex items-center justify-center font-bold text-brand-primary text-4xl shadow-inner border-4 ${gender === '男性' ? 'border-blue-500' : 'border-pink-500'}`}>
                                {name.charAt(0)}
                            </div>
                        )}
                        <div className="absolute bottom-0 right-0 bg-white rounded-full p-1 shadow-sm">
                            {gender === '男性' ? <span className="text-blue-500">♂</span> : <span className="text-pink-500">♀</span>}
                        </div>
                    </div>
                    <h3 className="text-2xl font-bold text-slate-800">{name}</h3>
                    <p className="text-slate-500 text-sm mt-1">{city} {district} • {age} 歲</p>
                    
                    <div className="flex gap-2 mt-4">
                         {Object.entries(skillLevels).map(([sport, level]) => (
                            <span key={sport} className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-xs font-medium text-slate-600">
                                {sport} {level}
                            </span>
                        ))}
                    </div>
                </div>

                <div className="p-6 bg-slate-50/50">
                    <h4 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">評價概況</h4>
                    
                    <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-4">
                         <RatingStars rating={overallRating} label="綜合評分" />
                    </div>

                    {canViewDetails ? (
                        <div className="space-y-4">
                            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                                <h5 className="text-sm font-bold text-slate-800 mb-3 pb-2 border-b border-slate-50">詳細指標</h5>
                                <div className="space-y-3">
                                    <RatingStars rating={friendlinessRating} label="友善程度" />
                                    {Object.keys(ratings.intensity).length > 0 && Object.entries(ratings.intensity).map(([sport, sportRatings]) => {
                                         if (Array.isArray(sportRatings)) {
                                            return <RatingStars key={sport} rating={calculateAverage(sportRatings)} label={`${sport}強度`} />;
                                         }
                                         return null;
                                    })}
                                </div>
                            </div>
                            
                            <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm">
                                <h5 className="text-sm font-bold text-slate-800 mb-3">球友留言</h5>
                                {ratings.comments.length > 0 ? (
                                    <div className="space-y-3 max-h-40 overflow-y-auto pr-1 scrollbar-thin">
                                        {ratings.comments.map((comment, index) => (
                                            <div key={index} className="bg-slate-50 p-3 rounded-lg text-sm text-slate-600 italic">
                                                "{comment.text}"
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-slate-400 text-center py-2">尚無留言</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-white p-6 rounded-xl border border-slate-100 border-dashed text-center">
                            <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3 text-yellow-600">🔒</div>
                            <p className="text-slate-600 font-medium">詳細評價為訂閱者限定</p>
                            <p className="text-xs text-slate-400 mt-1">升級會員以查看更多球友細節</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default UserProfileDetails;
