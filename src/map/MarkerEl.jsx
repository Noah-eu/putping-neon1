// Builds a DOM element for a user marker (teardrop + avatar + name)
// Usage: const el = createMarkerEl({ name, gender, photoURL });
export function createMarkerEl({ name = 'Uživatel', gender = 'other', photoURL }){
  const el = document.createElement('div');
  el.className = 'marker';
  // color by gender
  const color = gender === 'man' ? 'var(--pp-blue)' : gender === 'woman' ? 'var(--pp-pink)' : 'var(--pp-green)';
  el.style.setProperty('--marker-color', color);

  const svgWrap = document.createElement('div');
  svgWrap.className = 'marker__svg';
  svgWrap.innerHTML = `
    <svg viewBox="0 0 256 352" xmlns="http://www.w3.org/2000/svg" class="marker__glow">
      <defs>
        <filter id="g1" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="6" result="a"/>
          <feGaussianBlur stdDeviation="14" result="b"/>
          <feMerge>
            <feMergeNode in="b"/><feMergeNode in="a"/><feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <path d="M128 20 C198 20 240 68 240 130 C240 190 173 242 146 282 C138 294 133 308 128 320 C123 308 118 294 110 282 C83 242 16 190 16 130 C16 68 58 20 128 20 Z" fill="none" stroke="var(--marker-color)" stroke-width="10" filter="url(#g1)"/>
    </svg>`;
  el.appendChild(svgWrap);

  const avatar = document.createElement('img');
  avatar.className = 'marker__avatar';
  avatar.alt = name;
  avatar.src = photoURL || '/assets/svg/marker.svg';
  el.appendChild(avatar);

  const tag = document.createElement('div');
  tag.className = 'marker__name';
  tag.textContent = name;
  el.appendChild(tag);

  return el;
}
