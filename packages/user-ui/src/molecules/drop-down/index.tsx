import { PropsWithChildren } from 'react';

import './drop-down.css';

interface DropDownProps extends PropsWithChildren {
  position: 'left' | 'right'
}

export function DropDown(props: DropDownProps) {
  const classnames = `drop-down-wrapper drop-down-wrapper-${props.position}`;

  return (
    <div className={classnames}>
      <div className='drop-down'>
        {props.children}
      </div>
    </div>
  );
}
