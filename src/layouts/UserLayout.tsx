import { Outlet } from 'react-router-dom'
import UserNavbar from '../components/UserNavbar'
import CompareBar from '../components/CompareBar'
import CompareToast from '../components/CompareToast'
import LoginModal from '../components/LoginModal'
import { AuthModalProvider } from '../contexts/AuthModalContext'

export default function UserLayout() {
  return (
    <AuthModalProvider>
      <div className="min-h-screen luxe-landing bg-background-light dark:bg-background-dark">
        <UserNavbar />
        <Outlet />
        <CompareBar />
        <CompareToast />
      </div>
      <LoginModal />
    </AuthModalProvider>
  )
}

