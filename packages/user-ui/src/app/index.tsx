import { useEffect, useState } from 'react';
import { AccountContextProvider, AccountContextData } from '../context/account-context';
import { createBrowserRouter, Outlet, RouterProvider } from 'react-router-dom';
import './app.css';
import { Landing } from '../pages/landing';
import { Maps } from '../pages/maps';
import { LeftRightTemplate } from '../templates/left-right';
import { Header } from '../organisms/header';

function Root() {
  return (
    <LeftRightTemplate
      header={<Header />}
      sidebar={<div className='app-sidebar'></div>}
      main={<Outlet />} />
  );
}

const router = createBrowserRouter([{
  path: '/',
  element: <Root />,
  
  children: [{
    path: '',
    element: <Landing />
  }, {
    path: 'maps',
    element: <Maps />
  }]
}]);


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
  return (
    <AccountContextProvider>
      <RouterProvider router={router}/>
    </AccountContextProvider>
  );
}
