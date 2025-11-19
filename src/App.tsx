import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, MatchRoom, ChatMessage } from './types';
import {
  MOCK_ROOMS,
  MOCK_USERS,
  COST_TO_CREATE,
  COST_TO_JOIN,
  COINS_PER_RATING,
  MONTHLY_COINS,
} from './constants';
import UserProfileSetup from './components/UserProfileSetup';
import Dashboard from './components/Dashboard';
import CreateMatchForm from './components/CreateMatchForm';
import FindMatchList from './components/FindMatchList';
import RatePlayersModal from './components/RatePlayersModal';
import MatchRoomDetails from './components/MatchRoomDetails';
import MatchRoomChat from './components/MatchRoomChat';
import FriendsManagement from './components/FriendsManagement';
import UserProfileDetails from './components/UserProfileDetails';
import InboxView from './components/InboxView';
import CoinAnimation from './components/CoinAnimation';
import Toast from './components/Toast';
import PageHeader from './components/PageHeader';
import BottomNav from './components/BottomNav';

const App: React.FC = () => {
  const [users, setUsers] = useState(MOCK_USERS);
  const [user, setUser] = useState<UserProfile | null>(users[0]);
  const [view, setView] = useState<any>('dashboard');
  const [rooms, setRooms] = useState(MOCK_ROOMS);
  const [activeRoom, setActiveRoom] = useState<MatchRoom | null>(null);
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);
  const [activeConvo, setActiveConvo] = useState<string | null>(null);
  const [showMyRooms, setShowMyRooms] = useState(false);
  const [anim, setAnim] = useState<any>(null);
  const [toast, setToast] = useState<any>(null);
  const coinRef = useRef<HTMLDivElement>(null);

  const showToast = (m: string, t: 'success' | 'error' | 'info') =>
    setToast({ message: m, type: t });
  const triggerAnim = (
    start: DOMRect,
    end: DOMRect,
    type: 'gain' | 'spend',
    cb: () => void
  ) =>
    setAnim({
      startRect: start,
      endRect: end,
      type,
      key: Date.now(),
      onComplete: cb,
    });

  const createRoom = (data: any, rect: DOMRect) => {
    if (!user || !coinRef.current) return;
    triggerAnim(coinRef.current.getBoundingClientRect(), rect, 'spend', () => {
      const newRoom = {
        ...data,
        id: `room-${Date.now()}`,
        host: user,
        currentPlayers: [user],
        messages: [],
      };
      setRooms([...rooms, newRoom]);
      updateUser({ ...user, wCoins: user.wCoins - COST_TO_CREATE });
      setView('dashboard');
      showToast('建立成功', 'success');
    });
  };

  const joinRoom = (id: string, rect: DOMRect) => {
    if (!user || !coinRef.current) return;
    triggerAnim(coinRef.current.getBoundingClientRect(), rect, 'spend', () => {
      const r = rooms.find((r) => r.id === id);
      if (r) {
        const updated = { ...r, currentPlayers: [...r.currentPlayers, user] };
        setRooms(rooms.map((room) => (room.id === id ? updated : room)));
        updateUser({ ...user, wCoins: user.wCoins - COST_TO_JOIN });
        setActiveRoom(updated);
        setView('room-chat');
        showToast('加入成功', 'success');
      }
    });
  };

  const claimReward = (msgId: string, rect: DOMRect) => {
    if (!user || !coinRef.current) return;
    const convo = user.conversations['system'];
    const msg = convo.messages.find((m) => m.id === msgId);
    if (msg?.reward && !msg.reward.claimed) {
      triggerAnim(rect, coinRef.current.getBoundingClientRect(), 'gain', () => {
        const updatedMsgs = convo.messages.map((m) =>
          m.id === msgId
            ? { ...m, reward: { ...m.reward!, claimed: true }, isRead: true }
            : m
        );
        updateUser({
          ...user,
          wCoins: user.wCoins + msg.reward!.amount,
          conversations: {
            ...user.conversations,
            system: { ...convo, messages: updatedMsgs },
          },
        });
        showToast('領取成功', 'success');
      });
    }
  };

  const updateUser = (u: UserProfile) => {
    setUser(u);
    setUsers(users.map((us) => (us.id === u.id ? u : us)));
  };

  const sendMessage = (uid: string, txt: string) => {
    if (!user) return;
    const msg = {
      id: `m-${Date.now()}`,
      fromUserId: user.id,
      text: txt,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    // Update current user
    const myConvos = { ...user.conversations };
    if (!myConvos[uid])
      myConvos[uid] = { participantIds: [user.id, uid], messages: [] };
    myConvos[uid].messages.push({ ...msg, isRead: true });
    updateUser({ ...user, conversations: myConvos });
    // Update other user (mock)
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id === uid) {
          const theirConvos = { ...u.conversations };
          if (!theirConvos[user.id])
            theirConvos[user.id] = {
              participantIds: [uid, user.id],
              messages: [],
            };
          theirConvos[user.id].messages.push(msg);
          return { ...u, conversations: theirConvos };
        }
        return u;
      })
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 sm:pb-0 font-sans">
      <div className="max-w-4xl mx-auto p-4">
        {user && (
          <PageHeader
            ref={coinRef}
            userProfile={user}
            onLogout={() => setUser(null)}
            onNavigate={setView}
          />
        )}
        {!user ? (
          <UserProfileSetup
            onProfileCreate={(u) => {
              setUsers([...users, u]);
              setUser(u);
              setView('dashboard');
            }}
          />
        ) : view === 'dashboard' ? (
          <Dashboard
            userProfile={user}
            onNavigate={setView}
            myHostedRooms={rooms.filter((r) => r.host.id === user.id)}
            joinedRoomsAsParticipant={rooms.filter(
              (r) =>
                r.host.id !== user.id &&
                r.currentPlayers.some((p) => p.id === user.id)
            )}
            onViewChat={(r) => {
              setActiveRoom(r);
              setView('room-chat');
            }}
            showMyRooms={showMyRooms}
          />
        ) : view === 'create' ? (
          <CreateMatchForm
            onTriggerCreateRoom={createRoom}
            onBack={() => setView('dashboard')}
            userProfile={user}
          />
        ) : view === 'find' ? (
          <FindMatchList
            allRooms={rooms}
            onBack={() => setView('dashboard')}
            onTriggerJoinRoom={joinRoom}
            onViewRoom={(r) => {
              setActiveRoom(r);
              setView('view-room');
            }}
            userProfile={user}
          />
        ) : view === 'view-room' && activeRoom ? (
          <MatchRoomDetails
            room={activeRoom}
            currentUser={user}
            onBack={() => setView('find')}
            onTriggerJoinRoom={joinRoom}
            onViewProfile={(p) => {
              setActiveProfile(p);
              setView('view-profile');
            }}
          />
        ) : view === 'room-chat' && activeRoom ? (
          <MatchRoomChat
            room={activeRoom}
            currentUser={user}
            allUsers={users}
            onBack={() => setView('dashboard')}
            onSendMessage={(id, t) =>
              setRooms(
                rooms.map((r) =>
                  r.id === id
                    ? {
                        ...r,
                        messages: [
                          ...r.messages,
                          {
                            userId: user.id,
                            name: user.name,
                            text: t,
                            timestamp: new Date().toISOString(),
                          },
                        ],
                      }
                    : r
                )
              )
            }
            onStartRating={(r) => {
              setActiveRoom(r);
              setView('rate');
            }}
            onSendFriendRequest={() => {}}
            onViewProfile={(p) => {
              setActiveProfile(p);
              setView('view-profile');
            }}
          />
        ) : view === 'rate' && activeRoom ? (
          <RatePlayersModal
            room={activeRoom}
            currentUser={user}
            onSubmit={(r) => {
              updateUser({
                ...user,
                wCoins: user.wCoins + r.length * COINS_PER_RATING,
              });
              showToast('評價完成', 'success');
              setView('dashboard');
            }}
            onCancel={() => setView('dashboard')}
          />
        ) : view === 'friends' ? (
          <FriendsManagement
            currentUser={user}
            allUsers={users}
            onBack={() => setView('dashboard')}
            onAccept={(id) => {
              const u = {
                ...user,
                friends: [...user.friends, id],
                friendRequests: user.friendRequests.filter(
                  (r) => r.from !== id
                ),
              };
              updateUser(u);
            }}
            onDecline={() => {}}
            onViewProfile={(p) => {
              setActiveProfile(p);
              setView('view-profile');
            }}
            onSendMessage={(id) => {
              setActiveConvo(id);
              setView('inbox');
            }}
          />
        ) : view === 'view-profile' && activeProfile ? (
          <UserProfileDetails
            profileToShow={activeProfile}
            viewerProfile={user}
            onBack={() => setView('dashboard')}
          />
        ) : view === 'inbox' ? (
          <InboxView
            currentUser={user}
            allUsers={users}
            onBack={() => setView('dashboard')}
            onTriggerClaimReward={claimReward}
            onSendMessage={sendMessage}
            activeConversationId={activeConvo}
            onSetActiveConversationId={setActiveConvo}
            onConversationRead={() => {}}
          />
        ) : null}
        {view === 'dashboard' && (
          <BottomNav
            showMyRooms={showMyRooms}
            setShowMyRooms={setShowMyRooms}
          />
        )}
      </div>
      {anim && (
        <CoinAnimation
          startRect={anim.startRect}
          endRect={anim.endRect}
          type={anim.type}
          onAnimationComplete={() => {
            anim.onComplete();
            setAnim(null);
          }}
        />
      )}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};
export default App;
