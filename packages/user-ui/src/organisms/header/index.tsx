import { AccountMenu } from "../../molecules/account-menu";
import { Logo } from "../../atoms/logo";

import './header.css';
import { NavMenu } from "../../molecules/nav-menu";

export function Header() {
  return (
    <div className='header'>
      <Logo />
      <NavMenu />
      <AccountMenu />
    </div>
  )
}
