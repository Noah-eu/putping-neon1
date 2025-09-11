import 'mapbox-gl/dist/mapbox-gl.css';
import React, { useEffect, useRef, useState } from 'react';
import { listenToUsers, listenToPings, sendPing, acceptPing, rejectPing, updateMyLocation } from '../firebase/db.js';
import { getAuth } from '../firebase/index.js';
import { onAuthStateChanged } from 'firebase/auth';
import { createMarkerEl } from './MarkerEl.jsx';
import './marker.css';

export default function MapView({ user, onOpenChat }){
  const mapElRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef(new Map()); // uid -> marker
  const [myUid, setMyUid] = useState(() => getAuth()?.currentUser?.uid || user?.uid || 'me-guest');

  // keep uid synced with auth
  useEffect(() => {
    try{
      const auth = getAuth();
      const unsub = onAuthStateChanged(auth, (u) => setMyUid(u?.uid || 'me-guest'));
      return () => { try{ unsub && unsub(); }catch{} };
    }catch{ /* ignore */ }
  }, []);

  // init mapbox
  useEffect(() => {
    (async () => {
      const token = import.meta.env.VITE_MAPBOX_TOKEN;
      if (!token || !mapElRef.current) return;
      try{
        const mapboxgl = (await import('mapbox-gl')).default; mapboxgl.accessToken = token;
        // expose for Marker constructor usage elsewhere
        if (typeof window !== 'undefined') window.mapboxgl = mapboxgl;
        const map = new mapboxgl.Map({ container: mapElRef.current, style:'mapbox://styles/mapbox/dark-v11', center:[14.42076,50.08804], zoom:14 });
        mapRef.current = map; map.on('remove', () => mapRef.current = null);
      }catch(e){ console.warn('Mapbox not available', e); }
    })();
    return () => { try{ mapRef.current && mapRef.current.remove() }catch{} };
  }, []);

  // subscribe users -> create markers
  useEffect(() => {
    const unsub = listenToUsers(async (usersMap) => {
      const map = mapRef.current; if (!map) return;
      const entries = Object.entries(usersMap||{});
      // expose latest users for FAB actions
      try{ if (typeof window !== 'undefined') window.__LATEST_USERS = new Map(entries); }catch{}
      for (const [uid, u] of entries){
        if (!u || uid === myUid) continue;
        let mk = markersRef.current.get(uid);
        if (!mk){
          const el = createMarkerEl({ name: u.name||'Uživatel', gender: u.gender||'other', photoURL: u.photoURL });
          el.addEventListener('click', (e) => {
            e.stopPropagation();
            // toggle expanded
            el.classList.toggle('marker--expanded');
            try{ map.easeTo({ center:[u.lng,u.lat], zoom: Math.max(map.getZoom(), 16), duration: 250 }); }catch{}
            // stop pulse once user interacts
            el.classList.remove('ping-pulse');
            // clear previous actions
            el.querySelectorAll('.marker__act').forEach(n=>n.remove());
            if (el.classList.contains('marker--expanded')){
              // incoming ping? show accept/reject; else show Ping
              const incoming = (window.__pp_incoming && window.__pp_incoming.get(uid)) || null;
              if (incoming && incoming.state === 'sent'){
                const acc = document.createElement('button'); acc.className='marker__act marker__act--left'; acc.title='Accept'; acc.innerHTML = `<img src="/assets/svg/chat.svg" width="20" height="20" />`
                const rej = document.createElement('button'); rej.className='marker__act marker__act--right'; rej.title='Reject'; rej.innerHTML = `<img src="/assets/svg/close.svg" width="20" height="20" />`
                acc.onclick = async (ev)=>{ ev.stopPropagation(); const pid = await acceptPing(myUid, uid); el.classList.remove('marker--expanded'); onOpenChat && onOpenChat(uid, u.name||'Chat'); };
                rej.onclick = async (ev)=>{ ev.stopPropagation(); await rejectPing(myUid, uid); el.classList.remove('marker--expanded'); };
                el.appendChild(acc); el.appendChild(rej);
              } else {
                const pingBtn = document.createElement('button'); pingBtn.className='marker__act marker__act--right'; pingBtn.title='Ping'; pingBtn.innerHTML = `<img src="/assets/svg/ping.svg" width="20" height="20" />`
                pingBtn.onclick = async (ev)=>{ ev.stopPropagation(); await sendPing(myUid, uid); el.classList.remove('marker--expanded'); };
                el.appendChild(pingBtn);
              }
            }
          });
          mk = new window.mapboxgl.Marker({ element: el, anchor:'bottom' }).setLngLat([u.lng||0, u.lat||0]).addTo(map);
          markersRef.current.set(uid, mk);
        } else {
          try{ mk.setLngLat([u.lng||0, u.lat||0]); }catch{}
        }
      }
    });
    return () => { try{ unsub && unsub(); }catch{} };
  }, [myUid]);

  // subscribe pings -> pulse + auto open chat on accept
  useEffect(() => {
    const audio = new Audio('/assets/sounds/ping.wav');
    const incoming = new Map();
    window.__pp_incoming = incoming;
    const unsub = listenToPings(myUid, (p) => {
      if (!p) return;
      incoming.set(p.fromUid, p);
      const mk = markersRef.current.get(p.fromUid);
      const el = mk?.getElement?.();
      if (p.state === 'sent'){
        if (el){ el.classList.add('ping-pulse'); try{ audio.currentTime=0; audio.play().catch(()=>{}); }catch{} }
      }
      if (p.state === 'accepted'){
        onOpenChat && onOpenChat(p.fromUid, 'Chat');
      }
    });
    return () => { try{ unsub && unsub(); }catch{} };
  }, [myUid]);

  // on mount, update own location once
  useEffect(() => {
    if (!myUid) return;
    navigator.geolocation?.getCurrentPosition(
      (pos) => updateMyLocation(myUid, { lat: pos.coords.latitude, lng: pos.coords.longitude }).catch(()=>{}),
      () => {}, { enableHighAccuracy: true, maximumAge: 60000 }
    );
  }, [myUid]);

  return (
    <div>
      <div ref={mapElRef} style={{ position:'absolute', inset:0 }} />
      <div style={{ position:'absolute', top:8, left:'50%', transform:'translateX(-50%)', zIndex:10, pointerEvents:'none' }}>
        <img src={'/assets/svg/logo-putping.svg'} alt='PutPing' style={{ height:28 }} />
      </div>
    </div>
  );
}
