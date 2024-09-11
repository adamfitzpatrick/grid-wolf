import { useEffect, useState } from 'react';
import { AccountContextData, AccountContextProvider } from '../context/account-context';
import { LeftRightTemplate } from '../templates/left-right';
import './app.css';
import { Header } from '../organisms/header';
import { Button } from '../atoms/button';
import { LoginOutlined } from '@ant-design/icons';

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

  const getMain = () => {
    if (account.accessToken) {
      return <div className='access-token'>Access Token: {account.accessToken}</div>
    }
    return <h2>LOGIN REQUIRED</h2>
  }

  const handleLogin = () => {
    window.location.href = "https://dev-grid-wolf-stepinto.auth.us-west-2.amazoncognito.com/oauth2/authorize?client_id=77mki6qlup2br0bme721cgv5o9&response_type=token&scope=openid&redirect_uri=http%3A%2F%2Flocalhost%3A3100"
  }

  const header = () => <Header />;
  const sidebar = () => <div className='app-sidebar'></div>;
  const main = () => <div className='app-main'>
    <Button title='log in' type='primary' size='large' icon={<LoginOutlined />} onClick={handleLogin}>Log In</Button>
    {getMain()}
  </div>;

  return (
    <AccountContextProvider value={account}>
      <LeftRightTemplate header={header} sidebar={sidebar} main={main}/>
    </AccountContextProvider>
  );
}
