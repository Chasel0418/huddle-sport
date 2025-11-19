
import React, { useState, useMemo, useRef, useEffect } from 'react';
import { UserProfile, Conversation } from '../types';

interface InboxViewProps {
    currentUser: UserProfile;
    allUsers: UserProfile[];
    onBack: () => void;
    onTriggerClaimReward: (messageId: string, buttonRect: DOMRect) => void;
    onSendMessage: (toUserId: string, text: string) => void;
    onConversationRead: (conversationId: string) => void;
    activeConversationId: string | null;
    onSetActiveConversationId: (userId: string | null) => void;
}

const InboxView: React.FC<InboxViewProps> = ({ 
    currentUser, allUsers, onBack, onTriggerClaimReward, onSendMessage, onConversationRead,
    activeConversationId, onSetActiveConversationId
}) => {
    const [newMessage, setNewMessage] = useState('');
    const claimButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});
    const chatEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (activeConversationId) {
            onConversationRead(activeConversationId);
        }
    }, [activeConversationId, currentUser.conversations, onConversationRead]);
    
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [activeConversationId, currentUser.conversations]);
    
    const conversations = useMemo(() => {
        return Object.entries(currentUser.conversations)
            .map(([key, value]) => ({ ...(value as Conversation), otherParticipantId: key }))
            .sort((a, b) => {
                const lastMsgA = a.messages[a.messages.length - 1];
                const lastMsgB = b.messages[b.messages.length - 1];
                if (!lastMsgA) return 1;
                if (!lastMsgB) return -1;
                return new Date(lastMsgB.timestamp).getTime() - new Date(lastMsgA.timestamp).getTime();
            });
    }, [currentUser.conversations]);

    const activeConversation = useMemo(() => {
        if (!activeConversationId) return null;
        if (currentUser.conversations[activeConversationId]) return currentUser.conversations[activeConversationId];
        if (activeConversationId !== 'system' && allUsers.some(u => u.id === activeConversationId)) {
            return { participantIds: [currentUser.id, activeConversationId], messages: [] };
        }
        return null;
    }, [activeConversationId, currentUser, allUsers]);

    const activeParticipant = useMemo(() => {
        if (!activeConversationId) return null;
        if (activeConversationId === 'system') return { name: '系統通知' };
        return allUsers.find(u => u.id === activeConversationId) || null;
    }, [activeConversationId, allUsers]);

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim() && activeConversationId && activeConversationId !== 'system') {
            onSendMessage(activeConversationId, newMessage.trim());
            setNewMessage('');
        }
    };
    
    const handleClaimClick = (e: React.MouseEvent, messageId: string) => {
        // Ensure we get the correct button element even if clicked on children
        const button = e.currentTarget as HTMLButtonElement;
        if (button) {
            const rect = button.getBoundingClientRect();
            onTriggerClaimReward(messageId, rect);
        }
    };

    const getParticipantName = (convo: { otherParticipantId: string }) => {
        const otherId = convo.otherParticipantId;
        if (otherId === 'system' || !otherId) return '系統通知';
        return allUsers.find(u => u.id === otherId)?.name || '未知使用者';
    };

    const getAvatarBorderClass = (gender: string) => {
        return gender === '男性' ? 'border-blue-500' : 'border-pink-500';
    };

    return (
        <div className="h-[calc(100vh-120px)] max-w-6xl mx-auto animate-fade-in flex flex-col">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-slate-800">訊息中心</h2>
                <button onClick={onBack} className="text-slate-500 font-medium hover:text-slate-800">返回</button>
            </div>

            <div className="flex-grow bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden flex">
                {/* Sidebar */}
                <div className={`${activeConversationId ? 'hidden md:flex' : 'flex'} w-full md:w-80 border-r border-slate-100 flex-col`}>
                    <div className="p-4 border-b border-slate-50 bg-slate-50/50">
                        <h3 className="font-bold text-slate-700 text-sm">最近對話</h3>
                    </div>
                    <div className="flex-grow overflow-y-auto">
                        {conversations.length === 0 && <p className="text-center text-slate-400 py-8 text-sm">暫無訊息</p>}
                        {conversations.map(convo => {
                            const lastMessage = convo.messages[convo.messages.length - 1];
                            const hasUnread = convo.messages.some(m => !m.isRead);
                            const otherParticipant = allUsers.find(u => u.id === convo.otherParticipantId);
                            const isSystem = convo.otherParticipantId === 'system';

                            return (
                                <div
                                    key={convo.otherParticipantId}
                                    onClick={() => onSetActiveConversationId(convo.otherParticipantId)}
                                    className={`p-4 flex items-center gap-3 cursor-pointer transition-colors border-l-4 ${activeConversationId === convo.otherParticipantId ? 'bg-blue-50 border-brand-primary' : 'border-transparent hover:bg-slate-50'}`}
                                >
                                    {isSystem ?
                                        <div className="w-12 h-12 rounded-full bg-yellow-100 flex items-center justify-center text-yellow-600 text-lg">🔔</div>
                                        : otherParticipant?.avatarUrl ?
                                        <img src={otherParticipant.avatarUrl} alt="" className={`w-12 h-12 rounded-full object-cover shadow-sm border-2 ${getAvatarBorderClass(otherParticipant.gender)}`} />
                                        : <div className={`w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center font-bold text-slate-500 text-lg border-2 ${otherParticipant ? getAvatarBorderClass(otherParticipant.gender) : ''}`}>{getParticipantName(convo).charAt(0)}</div>
                                    }
                                    <div className="flex-grow overflow-hidden">
                                        <div className="flex justify-between items-center mb-0.5">
                                            <p className={`font-bold text-sm ${hasUnread ? 'text-slate-900' : 'text-slate-700'}`}>{getParticipantName(convo)}</p>
                                            {hasUnread && <div className="w-2 h-2 bg-brand-primary rounded-full"></div>}
                                        </div>
                                        <p className={`text-xs truncate ${hasUnread ? 'font-semibold text-slate-800' : 'text-slate-400'}`}>
                                            {lastMessage?.text || '沒有訊息'}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Chat Area */}
                <div className={`${!activeConversationId ? 'hidden md:flex' : 'flex'} w-full flex-col bg-slate-50/30`}>
                    {activeConversation ? (
                        <>
                            <div className="p-4 border-b border-slate-100 bg-white flex items-center gap-3 shadow-sm z-10">
                                <button onClick={() => onSetActiveConversationId(null)} className="md:hidden text-slate-400 hover:text-slate-600">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                </button>
                                <h3 className="font-bold text-slate-800">{activeParticipant?.name || '聊天室'}</h3>
                            </div>

                            <div className="flex-grow p-4 overflow-y-auto space-y-4">
                                {activeConversation.messages.map(msg => {
                                    const isMe = msg.fromUserId === currentUser.id;
                                    return (
                                        <div key={msg.id} className={`flex gap-2 items-end ${isMe ? 'justify-end' : 'justify-start'}`}>
                                            <div className={`max-w-[80%] p-3 rounded-2xl shadow-sm text-sm ${isMe ? 'bg-brand-primary text-white rounded-br-none' : 'bg-white text-slate-700 rounded-bl-none border border-slate-100'}`}>
                                                <p className="whitespace-pre-wrap leading-relaxed">{msg.text}</p>
                                                {msg.reward && (
                                                    <div className="mt-3 pt-2 border-t border-white/20 relative z-20">
                                                        <button
                                                            onClick={(e) => handleClaimClick(e, msg.id)}
                                                            disabled={msg.reward.claimed}
                                                            className={`w-full py-1.5 rounded-lg font-bold text-xs transition-colors cursor-pointer relative z-30 ${msg.reward.claimed ? 'bg-white/20 text-white cursor-default' : 'bg-yellow-400 text-yellow-900 hover:bg-yellow-300 shadow-sm'}`}
                                                        >
                                                            {msg.reward.claimed ? `已領取 ${msg.reward.amount} W` : `領取獎勵 ${msg.reward.amount} W`}
                                                        </button>
                                                    </div>
                                                )}
                                                <p className={`text-[10px] mt-1 text-right ${isMe ? 'text-blue-100' : 'text-slate-400'}`}>
                                                    {new Date(msg.timestamp).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}
                                                </p>
                                            </div>
                                        </div>
                                    )
                                })}
                                <div ref={chatEndRef} />
                            </div>

                            {activeConversationId !== 'system' && (
                                <form onSubmit={handleSendMessage} className="p-3 bg-white border-t border-slate-100">
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="輸入訊息..."
                                            className="flex-grow bg-slate-100 border-transparent rounded-xl py-2.5 px-4 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-brand-primary focus:ring-0 transition-colors"
                                        />
                                        <button type="submit" disabled={!newMessage.trim()} className="bg-brand-primary text-white p-2.5 rounded-xl hover:bg-brand-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                                            </svg>
                                        </button>
                                    </div>
                                </form>
                            )}
                        </>
                    ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                            <p>選擇一個對話開始聊天</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default InboxView;
