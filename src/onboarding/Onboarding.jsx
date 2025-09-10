import React, { useState } from 'react';
import NeonButton from '../ui/NeonButton.jsx';

export default function Onboarding({ onDone }){
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [photo, setPhoto] = useState(null);
  const [coords, setCoords] = useState(null);
  const [agree, setAgree] = useState(false);

  const next = () => setStep(s=> s+1);

  const pick = (e) => { const f = e.target.files?.[0]; if (!f) return; const url = URL.createObjectURL(f); setPhoto(url) };
  const geolocate = () => { if (!('geolocation' in navigator)) { setCoords({lng:14.42076,lat:50.08804}); return; } navigator.geolocation.getCurrentPosition(p=> setCoords({lng:p.coords.longitude,lat:p.coords.latitude}), ()=> setCoords({lng:14.42076,lat:50.08804})) };

  const canFinish = !!name && !!gender && !!photo && !!coords && agree;

  const finish = () => { if (!canFinish) return; onDone?.({ name, gender, age: age? Number(age): null, photoURL: photo, coords }) };

  return (
    <div style={{ display:'grid', placeItems:'center', height:'100%' }}>
      <div className='neon-card' style={{ width:'min(560px,92vw)', height:'75vh' }}>
        <div style={{ padding:16, display:'grid', gap:12 }}>
          <h2 style={{ margin:0 }}>Vytvoř si profil</h2>
          {step===0 && (
            <div style={{ display:'grid', gap:10 }}>
              <NeonButton variant='blue' onClick={next}>Přihlásit Googlem (mock)</NeonButton>
              <NeonButton variant='orange' onClick={next}>Pokračovat anonymně</NeonButton>
            </div>
          )}
          {step===1 && (
            <div>
              <label>Jméno<input value={name} onChange={e=>setName(e.target.value)} style={{ width:'100%', padding:8, borderRadius:8, border:'1px solid #28314f', background:'#0e1430', color:'#fff' }} /></label>
              <div style={{ marginTop:8 }}>Gender</div>
              <div style={{ display:'flex', gap:8 }}>
                <NeonButton variant='pink' onClick={()=>setGender('male')}>Muž</NeonButton>
                <NeonButton variant='blue' onClick={()=>setGender('female')}>Žena</NeonButton>
                <NeonButton variant='green' onClick={()=>setGender('other')}>Jiné</NeonButton>
              </div>
              <label style={{ display:'block', marginTop:8 }}>Věk (volitelné)<input type='number' value={age} onChange={e=>setAge(e.target.value)} style={{ width:'100%', padding:8, borderRadius:8, border:'1px solid #28314f', background:'#0e1430', color:'#fff' }} /></label>
              <div style={{ marginTop:8 }}>Profilová fotka</div>
              <input type='file' accept='image/*' onChange={pick} />
              {photo && <img src={photo} alt='' style={{ width:72, height:72, borderRadius:'50%', marginTop:8 }} />}
              <div style={{ marginTop:8 }}>Poloha</div>
              <NeonButton variant='green' onClick={geolocate}>{coords? 'Poloha povolena ✓':'Povolit polohu'}</NeonButton>
              <label style={{ display:'flex', gap:8, alignItems:'center', marginTop:8 }}><input type='checkbox' checked={agree} onChange={e=>setAgree(e.target.checked)} /> Souhlasím s podmínkami</label>
              <div style={{ display:'flex', justifyContent:'flex-end' }}>
                <NeonButton variant='pink' onClick={finish} disabled={!canFinish}>Pokračovat</NeonButton>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
