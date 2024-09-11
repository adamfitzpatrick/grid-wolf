import { LoginOutlined } from "@ant-design/icons"
import { Button } from "../../atoms/button"
import { Header } from "../../organisms/header"
import { LeftRightTemplate } from "../../templates/left-right"
import { useContext } from "react"
import { AccountContext } from "../../context/account-context"

function parseTokenResponse() {
  const url = new URL(window.location.href);
  const searchParams = new URLSearchParams(url.hash.replace(/^#/, ''));
  return {
    username: null,
    accessToken: searchParams.get('access_token')
  };
}

export function Landing() {

  const account = useContext(AccountContext);

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
    <Button title='Log in' type='primary' size='large' icon={<LoginOutlined />} onClick={handleLogin}>Log In</Button>
    {getMain()}
  </div>;

  return (
    <LeftRightTemplate
      header={header}
      sidebar={sidebar}
      main={main} />
  )
}
