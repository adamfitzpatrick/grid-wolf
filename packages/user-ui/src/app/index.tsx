import React, { useEffect, useState } from 'react';
import logo from './atoms/logo.svg';
import './app.css';

function parseTokenResponse() {
  const url = new URL(window.location.href);
  const searchParams = new URLSearchParams(url.hash.replace(/^#/, ''));
  return searchParams.get('access_token');
}

export default function App() {
  const [accessToken, setAccessToken] = useState<null | string>(null);

  useEffect(() => {
    setAccessToken(parseTokenResponse());
  }, []);

  const getMain = () => {
    if (accessToken) {
      return <div className='access-token'>Access Token: {accessToken}</div>
    }
    return <h2>LOGIN REQUIRED</h2>
  }

  const handleLogin = () => {
    window.location.href = "https://dev-grid-wolf-stepinto.auth.us-west-2.amazoncognito.com/oauth2/authorize?client_id=77mki6qlup2br0bme721cgv5o9&response_type=token&scope=openid&redirect_uri=http%3A%2F%2Flocalhost%3A3100"
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Grid-Wolf User App</h1>
      </header>
      <main className='app-main'>
        {getMain()}
        <button onClick={handleLogin}>LOGIN</button>
      </main>
    </div>
  );
}
