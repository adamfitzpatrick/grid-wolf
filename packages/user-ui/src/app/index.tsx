import { useEffect, useState } from 'react';
import { AccountContextData, AccountContextProvider } from '../context/account-context';
import { LeftRightTemplate } from '../templates/left-right';
import { Header } from '../organisms/header';
import { Button } from '../atoms/button';
import { LoginOutlined } from '@ant-design/icons';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './app.css';
import { Landing } from '../pages/landing';

const router = createBrowserRouter([{
  path: '/',
  element: <Landing />
}]);

// TODO move to another path, which will reroute home.
function parseTokenResponse() {
  const url = new URL(window.location.href);
  const searchParams = new URLSearchParams(url.hash.replace(/^#/, ''));
  return {
    username: null,
    accessToken: searchParams.get('access_token')
  };
}

const initialAccountContext: AccountContextData = {
  username: null,
  accessToken: null
}

export default function App() {
  const [account, setAccount] = useState<AccountContextData>(initialAccountContext);

  useEffect(() => {
    setAccount(parseTokenResponse());
  }, []);

  return (
    <AccountContextProvider value={account}>
      <RouterProvider router={router} />
    </AccountContextProvider>
  );
}
