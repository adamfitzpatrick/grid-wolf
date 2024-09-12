import { AccountMenu } from "../account-menu";
import { Logo } from "../../atoms/logo";

import './header.css';

export function Header() {
  return (
    <div className='header'>
      <Logo />
      <AccountMenu />
    </div>
  )
}
