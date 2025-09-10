import React from 'react';
export default function Modal({ children, onClose }){
  return (
    <div style={{position:'fixed', inset:0, zIndex:2000, background:'rgba(0,0,0,.45)'}} onClick={onClose}>
      <div className='neon-card' style={{ width:'min(720px,94vw)', margin:'8vh auto', padding:16, borderRadius:16 }} onClick={e=>e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}
