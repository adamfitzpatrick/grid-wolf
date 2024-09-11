
import { createContext } from "react";

export interface AccountContextData {
    username: null | string;
    accessToken: null | string;
}

export const defaultAccountContext: AccountContextData = {
    username: null,
    accessToken: null
}

export const AccountContext = createContext(defaultAccountContext);
export const AccountContextProvider = AccountContext.Provider
