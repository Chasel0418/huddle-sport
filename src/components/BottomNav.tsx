
import React from 'react';

interface BottomNavProps {
    showMyRooms: boolean;
    setShowMyRooms: (show: boolean) => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ showMyRooms, setShowMyRooms }) => {
    return (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 pb-safe flex justify-center items-center z-40 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
             <button 
                onClick={() => setShowMyRooms(!showMyRooms)}
                className="flex items-center gap-2 text-slate-600 font-medium hover:text-brand-primary transition-colors active:scale-95 transform"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 transition-transform ${showMyRooms ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
                我的運動房間
            </button>
        </div>
    );
};

export default BottomNav;
