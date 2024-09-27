
import { createContext, PropsWithChildren, useEffect, useState } from "react";
import { jwtDecode, JwtPayload } from "jwt-decode";

export interface AccountContextData {
    username: null | string;
    accessToken: null | string;
}

interface CognitoJwtPayload extends JwtPayload {
  username: string;
}

type AccountState = [ AccountContextData, (context: AccountContextData) => void ]

const LOCAL_STORAGE_ACCOUNT_CONTEXT_KEY = 'io.stepinto.grid-wolf.AccountContext';

const defaultAccountContext: AccountContextData = {
  username: null,
  accessToken: null
}

function storeAccountContext(context: AccountContextData) {
  localStorage.setItem(LOCAL_STORAGE_ACCOUNT_CONTEXT_KEY, JSON.stringify(context));
}

function loadAccountContext(): AccountContextData {
  const storedValue = localStorage.getItem(LOCAL_STORAGE_ACCOUNT_CONTEXT_KEY);
  try {
    return JSON.parse(storedValue!);
  } catch (e) {
    console.warn('Stored account data is unavailable or incorrect.');
    return { username: null, accessToken: null };
  }
}

function parseTokenResponse() {
  const url = new URL(window.location.href);
  const searchParams = new URLSearchParams(url.hash.replace(/^#/, ''));
  const accessToken = searchParams.get('access_token');
  const token = accessToken ? jwtDecode(accessToken) as CognitoJwtPayload : null;
  const username = token ? token.username : null;
  return {
    username,
    accessToken
  };
}

export const useAccountState = (givenInitialState?: AccountContextData): AccountState => {
  let initialState: AccountContextData | null;
  if (givenInitialState) {
    initialState = { ...givenInitialState };
  } else {
    initialState = loadAccountContext();
  }
  const [ accountContext, setAccountContext ]= useState<AccountContextData>(initialState);

  const setter = (context: AccountContextData): void => {
    storeAccountContext(context);
    setAccountContext({ ...context });
  }

  return [ accountContext, setter ];
}

export const AccountContext = createContext(defaultAccountContext);

export function AccountContextProvider({ children }: PropsWithChildren) {
  const [ account, setAccount ] = useAccountState();

  useEffect(() => {
    const tokenResponse = parseTokenResponse();
    if (tokenResponse.accessToken) {
      setAccount(tokenResponse);
    }
  }, []);

  return <AccountContext.Provider value={account}>
    {children}
  </AccountContext.Provider>
}
