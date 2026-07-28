// import { Navigate, Outlet } from 'react-router-dom'
// import { useAuth } from '../context/AuthContext'
// import LoadingSpinner from './LoadingSpinner'

// export default function AdminRoute() {
//   const { user, loading } = useAuth()

//   if (loading) return <LoadingSpinner fullScreen />

//   // Not logged in at all → send to login
//   if (!user) return <Navigate to="/login" replace />

//   // Logged in but not admin → send to home, never show admin panel
//   if (!['admin', 'super_admin'].includes(user.role)) {
//     return <Navigate to="/" replace />
//   }

//   return <Outlet />
// }



import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import LoadingSpinner from './LoadingSpinner'

export default function AdminRoute() {
  const { user, loading } = useAuth()

  if (loading) return <LoadingSpinner fullScreen />

  // Not logged in at all → send to login
  if (!user) return <Navigate to="/login" replace />

  // Logged in but not admin → send to home, never show admin panel
  if (!['admin', 'super_admin'].includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}