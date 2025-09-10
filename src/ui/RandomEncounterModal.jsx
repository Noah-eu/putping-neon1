import React, { useEffect, useState } from 'react';
import Modal from './Modal.jsx';
import { useRandomEncounter } from '../features/randomEncounter.js';

export default function RandomEncounterModal({ me, onClose }){
  const [tick, setTick] = useState({ enabled:false, remainingSec:0 });
  const rec = useRandomEncounter(me);
  useEffect(()=>{ setTick({ ...rec.state }) },[]);
  const fmt = (s)=> `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`;
  return (
    <Modal onClose={onClose}>
      <div style={{ display:'grid', gap:10 }}>
        <h3 style={{ margin:0 }}>Serendipity — 20 min</h3>
        {rec.state.enabled ? (
          <>
            <div>Zbývá: <b>{fmt(rec.state.remainingSec)}</b></div>
            <button className='neon-btn neon-btn--red' onClick={()=>{ rec.stop(); onClose?.(); }}>Vystoupit</button>
          </>
        ) : (
          <button className='neon-btn neon-btn--green' onClick={()=> rec.start((s)=>{ setTick(s) })}>Zapojit se</button>
        )}
      </div>
    </Modal>
  );
}
