import { useEffect, useState } from "react";
import { Button } from "../../atoms/button";
import { CloseOutlined, LogoutOutlined, ProfileOutlined, UserOutlined } from "@ant-design/icons";
import { DropDown } from "../drop-down";

import './account-menu.css'

function renderMenu(open: boolean) {
  if (open) {
    return (
      <DropDown position='right'>
        <Button title='profile' type='text' onClick={() => console.log('profile')} icon={<ProfileOutlined />}>Profile</Button>
        <Button title='logout' type='text' onClick={() => console.log('logout')} icon={<LogoutOutlined />}>Logout</Button>
      </DropDown>
    )
  }
  return null;
}

function getIcon(open: boolean) {
  if (open) {
    return <CloseOutlined />
  }
  return <UserOutlined />
}

export function AccountMenu () {
  const [open, setOpen] = useState<boolean>(false);
  const [lockedOpen, setLockedOpen] = useState<boolean>(false);

  useEffect(() => {
    setOpen(lockedOpen);
  }, [lockedOpen]);

  const onClick = () => {
    setLockedOpen(!lockedOpen);
  }

  const onMouseOver = (enter: boolean) => () => {
    if (!lockedOpen) {
      setOpen(enter);
    }
  }

  return (
    <div className='account-menu' onMouseEnter={onMouseOver(true)} onMouseLeave={onMouseOver(false)}>
      <Button title='account menu' type='primary' size='large' icon={getIcon(open)} onClick={onClick} />
      {renderMenu(open)}
    </div>
  )
}
