import React, { useState, useRef, useEffect } from 'react';
import NeonButton from './NeonButton.jsx';
import RandomEncounterModal from './RandomEncounterModal.jsx';
import { sendPing } from '../firebase/db.js';
export default function FabMenu({ onOpenChats, me }){
  const [open, setOpen] = useState(false);
  const cardRef = useRef(null);
  useEffect(()=>{
    const h = (e)=>{ if (open && cardRef.current && !cardRef.current.contains(e.target)) setOpen(false) };
    document.addEventListener('pointerdown', h);
    return ()=> document.removeEventListener('pointerdown', h);
  },[open]);
  const [showEncounter, setShowEncounter] = useState(false);
  async function handlePingRandom(){
    try{
      const map = (typeof window !== 'undefined' && window.__LATEST_USERS) ? window.__LATEST_USERS : new Map();
      const entries = Array.from(map.entries ? map.entries() : []);
      const others = entries.filter(([uid]) => uid !== me?.uid);
      if (!others.length) return;
      const [uid] = others[Math.floor(Math.random()*others.length)];
      await sendPing(me?.uid || 'me-guest', uid);
      setOpen(false);
    }catch(e){ console.warn('Ping failed', e); }
  }
  return (
    <div style={{ position:'fixed', right:16, bottom:16, zIndex:1900 }}>
      {open && (
        <div ref={cardRef} className='neon-card' style={{ padding:12, marginBottom:8, width:260 }}>
          <div style={{ display:'grid', gap:8 }}>
            <NeonButton variant='blue' onClick={()=>{ setOpen(false); }}>📸 Fotky</NeonButton>
            <NeonButton variant='pink' onClick={()=>{ setOpen(false); onOpenChats?.(); }}>💬 Chaty</NeonButton>
            <NeonButton variant='green' onClick={handlePingRandom}>📡 Ping náhodně</NeonButton>
            <NeonButton variant='green' onClick={()=>{ setOpen(false); setShowEncounter(true); }}>✨ Serendipity 20 min</NeonButton>
            <NeonButton variant='orange'>⏳ Přesun markeru</NeonButton>
            <NeonButton variant='green'>🌙 Viditelnost offline</NeonButton>
            <NeonButton variant='blue'>🛒 Nákupy</NeonButton>
            <NeonButton variant='red'>❌ Smazat účet</NeonButton>
            <NeonButton variant='blue'>ℹ️ O aplikaci</NeonButton>
          </div>
        </div>
      )}
      <button aria-label='Menu' className='neon-btn neon-btn--orange' onClick={()=> setOpen(v=>!v)}><img src='/assets/svg/fab-gear.svg' alt='' width={24} height={24} /></button>
      {showEncounter && <RandomEncounterModal me={me} onClose={()=> setShowEncounter(false)} />}
    </div>
  );
}
