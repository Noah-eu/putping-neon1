import React, { useEffect, useRef, useState } from 'react';
import '../app/styles/neon.css';

export default function ChatModal({ pid, peerName, onClose }){
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(null);
  const boxRef = useRef(null);

  useEffect(()=>{ if (boxRef.current) boxRef.current.scrollTop = boxRef.current.scrollHeight }, [messages.length]);

  const send = () => { if (!input && !pending) return; setMessages(m=> [...m, { id:Date.now(), text:input, img: pending }]); setInput(''); setPending(null) };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.45)', display:'grid', placeItems:'center', zIndex:2000 }} onClick={onClose}>
      <div className='neon-card chat-modal' onClick={e=>e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div style={{ fontWeight:800 }}>{peerName || 'Chat'}</div>
          <button className='neon-btn neon-btn--red' onClick={onClose}>Smazat chat</button>
        </div>
        <div ref={boxRef} style={{ maxHeight:'60vh', overflowY:'auto', padding:'8px 0', display:'grid', gap:8 }}>
          {messages.map(m => (
            <div key={m.id} style={{ display:'grid', gap:4 }}>
              {m.img && <img src={m.img} alt='' style={{ maxWidth:220, borderRadius:12 }} />}
              {m.text && <div className='neon-card' style={{ padding:'8px 10px' }}>{m.text}</div>}
            </div>
          ))}
        </div>
        <div style={{ display:'flex', gap:8, alignItems:'center' }}>
          <label className='neon-btn neon-btn--blue' style={{ cursor:'pointer' }}>📷
            <input type='file' accept='image/*' hidden onChange={e=>{ const f=e.target.files?.[0]; if (!f) return; setPending(URL.createObjectURL(f)); e.target.value='' }} />
          </label>
          {pending && <img src={pending} alt='' style={{ width:48, height:48, borderRadius:8 }} />}
          <input className='input' placeholder='Napiš zprávu…' value={input} onChange={e=>setInput(e.target.value)} style={{ flex:1, padding:8, borderRadius:8, border:'1px solid #28314f', background:'#0e1430', color:'#fff' }} />
          <button className='neon-btn neon-btn--green' onClick={send}>Odeslat</button>
        </div>
      </div>
    </div>
  );
}
