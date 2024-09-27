import React from 'react';

import './logo.css';

export function Logo() {
  return (
    <svg className='logo' version="1.1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 17.8 20.8">
      <g id='logo' transform='translate(0,0)'>
        <path id='vert-hex' d='M 0.3 5.3
        l 8.66 -5
        l 8.66 5
        v 10
        l -8.66 5
        l -8.66 -5
        v -10 z' fill='none' stroke='#5cdbd3' strokeWidth='0.5' />
        <text x='2' y='22.5' transform='scale(0.6)' fill='#722ed1'>GW</text>
      </g>
    </svg>
  )
}
