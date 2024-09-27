import { LoginOutlined } from "@ant-design/icons"
import { Button } from "../../atoms/button"
import { useContext } from "react"
import { AccountContext } from "../../context/account-context"


export function Landing() {
  const account = useContext(AccountContext);

  const getMain = () => {
    if (account.accessToken) {
      return <h1>Welcome!</h1>
    }
    return <h2>LOGIN REQUIRED</h2>
  }

  const handleLogin = () => {
    window.location.href = "https://dev-grid-wolf-stepinto.auth.us-west-2.amazoncognito.com/oauth2/authorize?client_id=77mki6qlup2br0bme721cgv5o9&response_type=token&scope=openid&redirect_uri=http%3A%2F%2Flocalhost%3A3100"
  }

  return (
    <div className='app-main'>
      {getMain()}
      <Button title='Log in' type='primary' size='large' icon={<LoginOutlined />} onClick={handleLogin}>Log In</Button>
    </div>
  )
}
