import React, { useState } from 'react';
import { MatchRoom, UserProfile, PlayerRating } from '../types';

interface RatePlayersModalProps {
    room: MatchRoom;
    currentUser: UserProfile;
    onSubmit: (ratings: PlayerRating[]) => void;
    onCancel: () => void;
}

const StarRating: React.FC<{ rating: number; setRating: (rating: number) => void }> = ({ rating, setRating }) => {
    return (
        <div className="flex space-x-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <svg
                    key={star}
                    onClick={() => setRating(star)}
                    className={`w-6 h-6 cursor-pointer ${star <= rating ? 'text-yellow-400' : 'text-neutral-500'}`}
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
            ))}
        </div>
    );
};


const RatePlayersModal: React.FC<RatePlayersModalProps> = ({ room, currentUser, onSubmit, onCancel }) => {
    const playersToRate = room.currentPlayers.filter(p => p.id !== currentUser.id);
    const [ratings, setRatings] = useState<Record<string, { intensity: number; friendliness: number; comment: string }>>(
        playersToRate.reduce((acc, player) => ({ ...acc, [player.id]: { intensity: 3, friendliness: 3, comment: '' } }), {} as Record<string, { intensity: number; friendliness: number; comment: string }>)
    );

    const handleRatingChange = (playerId: string, type: 'intensity' | 'friendliness', value: number) => {
        setRatings(prev => ({ ...prev, [playerId]: { ...prev[playerId]!, [type]: value } }));
    };

    const handleCommentChange = (playerId: string, comment: string) => {
        setRatings(prev => ({ ...prev, [playerId]: { ...prev[playerId]!, comment } }));
    };

    const handleSubmit = () => {
        const finalRatings: PlayerRating[] = Object.keys(ratings).map((ratedUserId) => {
            const ratingData = ratings[ratedUserId]!;
            return {
                ratedUserId,
                fromUserId: currentUser.id,
                intensity: ratingData.intensity,
                friendliness: ratingData.friendliness,
                comment: ratingData.comment,
            };
        });
        onSubmit(finalRatings);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50 animate-fade-in">
            <div className="bg-neutral-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto p-6">
                <h2 className="text-2xl font-bold text-brand-primary mb-4">評價球友</h2>
                <p className="text-neutral-400 mb-6">為 {room.locationName} 的活動夥伴們評分。</p>
                
                <div className="space-y-6">
                    {playersToRate.length > 0 ? playersToRate.map(player => (
                        <div key={player.id} className="bg-neutral-700 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-white">{player.name}</h3>
                            <div className="mt-3">
                                <label className="block text-sm font-medium text-neutral-300 mb-1">強度</label>
                                <StarRating rating={ratings[player.id]!.intensity} setRating={(r) => handleRatingChange(player.id, 'intensity', r)} />
                            </div>
                            <div className="mt-3">
                                <label className="block text-sm font-medium text-neutral-300 mb-1">友善程度</label>
                                <StarRating rating={ratings[player.id]!.friendliness} setRating={(r) => handleRatingChange(player.id, 'friendliness', r)} />
                            </div>
                            <div className="mt-3">
                                <label className="block text-sm font-medium text-neutral-300 mb-1">其他評語 (選填)</label>
                                <textarea
                                    value={ratings[player.id]!.comment}
                                    onChange={(e) => handleCommentChange(player.id, e.target.value)}
                                    rows={2}
                                    className="w-full bg-neutral-600 border border-neutral-500 rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-brand-primary"
                                />
                            </div>
                        </div>
                    )) : (
                        <p className="text-neutral-400 text-center py-4">沒有其他玩家可以評價。</p>
                    )}
                </div>

                <div className="flex justify-end space-x-4 mt-8">
                    <button onClick={onCancel} className="bg-neutral-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-neutral-500 transition-colors">
                        取消
                    </button>
                    <button onClick={handleSubmit} className="bg-brand-primary text-white font-bold py-2 px-6 rounded-lg hover:bg-brand-dark transition-colors">
                        送出
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RatePlayersModal;
