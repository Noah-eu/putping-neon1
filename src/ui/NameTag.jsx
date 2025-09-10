import React from 'react';
export default function NameTag({ name, color='#fff' }){
  return <div style={{position:'absolute', left:'50%', bottom:62, transform:'translateX(-50%)', color, fontWeight:900, textShadow:'0 0 6px rgba(255,255,255,.6)'}}>{name}</div>
}
