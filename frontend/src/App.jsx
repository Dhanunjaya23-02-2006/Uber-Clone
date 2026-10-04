import { Route,Routes } from 'react-router-dom'
import UserLogin from './pages/UserLogin'
import UserSignup from './pages/UserSignup'
import CaptianLogin from './pages/CaptianLogin'
import CaptianSignup from './pages/CaptianSignup'
import Start from './pages/Start'
import Home from './pages/Home'

const App = () => {
  return (
    <div>
      <Routes>
        <Route path='/' element={<Start />} />
        <Route path='/login' element={<UserLogin />} />
        <Route path='/signup' element={<UserSignup />} />
        <Route path='/captain-login' element={<CaptianLogin />} />
        <Route path='/captain-signup' element={<CaptianSignup />} />
        <Route path='/home' element={Home} />
      </Routes>
    </div>
  )
}

export default App
