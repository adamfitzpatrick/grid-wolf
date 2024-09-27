import react, { useContext } from 'react';
import { AccountContext, AccountContextData } from '.';
import { render, screen } from '@testing-library/react';
import App from '../../app';

describe('AccountContext', () => {
  test('should provide context values', async () => {
    /*
    const data: AccountContextData = {
      username: 'user',
      accessToken: 'token'
    };
    function Tester() {
      const account = useContext(AccountContextInternal);
      return <div>{account.username} {account.accessToken}</div>
    }

    render(<AccountContextProvider value={data}>
      <Tester />
    </AccountContextProvider>);
    expect(screen.getByText('user token')).toBeInTheDocument();
    */
  });
});
