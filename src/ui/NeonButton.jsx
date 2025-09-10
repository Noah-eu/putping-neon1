import React from 'react';
export default function NeonButton({ variant='blue', className='', ...props }){
  return <button className={`neon-btn neon-btn--${variant} ${className}`} {...props} />
}
