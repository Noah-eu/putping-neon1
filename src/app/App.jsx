import React, { useEffect, useState } from 'react';
import './styles/base.css';
import './styles/neon.css';

import MapView from '../map/MapView.jsx';
import Onboarding from '../onboarding/Onboarding.jsx';
import ChatModal from '../chat/ChatModal.jsx';
import FabMenu from '../ui/FabMenu.jsx';

export default function App(){
  const [phase, setPhase] = useState('splash'); // splash|onboarding|app
  const [profile, setProfile] = useState(null);
  const [openChat, setOpenChat] = useState(null); // {pid, name}

  useEffect(() => {
    const t1 = setTimeout(() => setPhase('onboarding'), 4500); // fade + hold
    return () => clearTimeout(t1);
  }, []);

  const needsOnboarding = !profile || !profile?.coords;

  return (
    <div>
      {phase === 'splash' && (
        <div style={{ position:'fixed', inset:0, zIndex: 3000, display:'grid', placeItems:'center', background:"url('/assets/img/splash.jpg') center/cover" }}>
          <img src={'/assets/svg/logo+heart.svg'} alt="PutPing" style={{ width: 200, opacity: 0.95 }} />
        </div>
      )}
      {phase !== 'splash' && (
        needsOnboarding ? (
          <div style={{ position:'fixed', inset:0, zIndex:2, background:"url('/assets/img/splash.jpg') center/cover" }}>
            <Onboarding onDone={setProfile} />
          </div>
        ) : (
          <>
            <MapView user={profile} onOpenChat={(pid, name)=> setOpenChat({ pid, name })} />
            <FabMenu onOpenChats={()=> setOpenChat({ pid:'local', name:'Chaty' })} />
          </>
        )
      )}
      {openChat && (
        <ChatModal pid={openChat.pid} peerName={openChat.name} onClose={()=> setOpenChat(null)} />
      )}
    </div>
  );
}
