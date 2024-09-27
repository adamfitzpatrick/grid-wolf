import { MouseEventHandler, PropsWithChildren, ReactNode } from 'react';

import './button.css';

export type ButtonType = 'primary' | 'default' | 'text' | 'link';
export type ButtonSize = 'large' | 'small';

export interface ButtonProps extends PropsWithChildren {
  title?: string;
  type: ButtonType;
  size?: ButtonSize;
  icon?: ReactNode;
  disabled?: boolean;
  onClick: MouseEventHandler<HTMLButtonElement>
}

function getCssClass(props: ButtonProps) {
  const disabled = props.disabled ? ' disabled' : '';
  const iconOnly = (!props.children && props.icon) ? ' icon-only' : '';
  const size = props.size ? ` ${props.size}` : ''
  return `button ${props.type}${size}${iconOnly}${disabled}`;
}

function renderIcon(props: ButtonProps) {
  return props.icon ? <span>{props.icon}</span> : null;
}

export const Button = (props: ButtonProps) => {
  return (
    <button
      title={props.title}
      disabled={props.disabled}
      className={getCssClass(props)}
      onClick={props.onClick}>
        {renderIcon(props)}
        <span>{props.children}</span>
    </button>
  );
}
