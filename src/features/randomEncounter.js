import { listenToUsers, sendPing } from '../firebase/db.js';

export function useRandomEncounter(my){
  let timer = null; let unsubUsers = null;
  let usersCache = {};
  const state = { enabled:false, deadline:0, remainingSec:0 };

  function start(onTick){
    if (state.enabled) return;
    state.enabled = true; state.deadline = Date.now() + 20*60*1000; tick(onTick);
    unsubUsers = listenToUsers(u => { usersCache = u || {} });
  }
  function stop(){ state.enabled=false; state.deadline=0; state.remainingSec=0; if (timer){ clearInterval(timer); timer=null } if (unsubUsers) { try{unsubUsers()}catch{} unsubUsers=null } }
  function tick(onTick){
    timer = setInterval(async () => {
      if (!state.enabled){ clearInterval(timer); timer=null; return; }
      state.remainingSec = Math.max(0, Math.floor((state.deadline - Date.now())/1000));
      onTick && onTick({ ...state });
      if (state.remainingSec <= 0){
        // pick up to 3 nearest and ping them
        const arr = Object.entries(usersCache).filter(([uid,u])=> uid!==my?.uid && u && Number.isFinite(u.lat) && Number.isFinite(u.lng));
        const myPos = { lng: my?.coords?.lng || 14.42076, lat: my?.coords?.lat || 50.08804 };
        arr.sort((a,b)=> dist(a[1], myPos) - dist(b[1], myPos));
        const picks = arr.slice(0,3);
        for (const [uid] of picks){ try{ await sendPing(my?.uid||'me-mock', uid) }catch{} }
        stop(); onTick && onTick({ ...state });
      }
    }, 1000);
  }
  return { state, start, stop };
}

function dist(u, p){
  const dx = (u.lng - p.lng), dy = (u.lat - p.lat); return Math.sqrt(dx*dx + dy*dy);
}
