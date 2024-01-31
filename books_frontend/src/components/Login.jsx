import { useMutation } from '@apollo/client';
import { useEffect, useState } from 'react'
import { LOGIN } from '../queries';

const Login = ({ show, setToken, setPage }) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [login, loginResult] = useMutation(LOGIN, {
    onError: (error) => {
      const messages = error.graphQLErrors.map((e) => e.message).join("\n");
      console.log(messages);
    },
  });


  useEffect(() => {
    if (loginResult.data) {
      console.log(loginResult);
      const token = loginResult.data.login.value
      loginResult.reset()
      setToken(token)
      setPage('authors')
      localStorage.setItem('BookToken', token)
    }
  }, [loginResult])


  if (!show) {
    return null;
  }

  const loginHandle = (event) => {
    event.preventDefault()
    login({ variables: { username, password } })
    setUsername('')
    setPassword('')
  }

  return (
    <form onSubmit={loginHandle}>
      <div>
        username
        <input
          type='text'
          value={username}
          name='Username'
          onChange={({ target }) => setUsername(target.value)}
          id='username'
        />
      </div>
      <div>
        password
        <input
          type='password'
          value={password}
          name='Password'
          onChange={({ target }) => setPassword(target.value)}
          id='password'
        />
      </div>
      <button id='login-button' type='submit'>login</button>
    </form>
  )
}

export default Login