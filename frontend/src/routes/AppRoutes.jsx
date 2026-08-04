









// import { Routes, Route } from 'react-router-dom'
// import MainLayout from '../layouts/MainLayout'
// import ProtectedRoute from '../components/ProtectedRoute'
// import AdminRoute from '../components/AdminRoute'

// import Home           from '../pages/Home'
// import Login          from '../pages/Login'
// import Register       from '../pages/Register'
// import ForgotPassword from '../pages/ForgotPassword'
// import Categories     from '../pages/Categories'
// import ContestLobby   from '../pages/ContestLobby'
// import ContestDetail    from '../pages/ContestDetail'
// import ContestCountdown from '../pages/ContestCountdown'
// import ContestSubmitted from '../pages/ContestSubmitted'
// import Quiz           from '../pages/Quiz'
// import QuizPlay       from '../pages/QuizPlay'
// import Result         from '../pages/Result'
// import Leaderboard    from '../pages/Leaderboard'
// import Profile        from '../pages/Profile'
// import Dashboard      from '../pages/Dashboard'
// import Wallet         from '../pages/Wallet'
// import About          from '../pages/About'
// import Contact        from '../pages/Contact'
// import NotFound       from '../pages/NotFound'

// import AdminDashboard      from '../pages/admin/AdminDashboard'
// import AdminContests       from '../pages/admin/AdminContests'
// import AdminUsers          from '../pages/admin/AdminUsers'
// import AdminQuizzes        from '../pages/admin/AdminQuizzes'
// import AdminQuestionBank   from '../pages/admin/AdminQuestionBank'
// import AdminFraud          from '../pages/admin/AdminFraud'
// import AdminAnalytics      from '../pages/admin/AdminAnalytics'
// import AdminPrizeTemplates from '../pages/admin/AdminPrizeTemplates'

// import TermsPage    from '../pages/legal/Terms'
// import PrivacyPage  from '../pages/legal/Privacy'
// import RefundPage   from '../pages/legal/Refund'
// import FairPlayPage from '../pages/legal/FairPlay'

// export default function AppRoutes() {
//   return (
//     <Routes>
//       <Route element={<MainLayout />}>
//         <Route path="/"            element={<Home />} />
//         <Route path="/categories"  element={<Categories />} />
//         <Route path="/contests"    element={<ContestLobby />} />
//         <Route path="/leaderboard" element={<Leaderboard />} />
//         <Route path="/about"       element={<About />} />
//         <Route path="/contact"     element={<Contact />} />
//         <Route path="/terms"       element={<TermsPage />} />
//         <Route path="/privacy"     element={<PrivacyPage />} />
//         <Route path="/refund"      element={<RefundPage />} />
//         <Route path="/fair-play"   element={<FairPlayPage />} />

//         {/* Practice mode - public, no login needed */}
//         <Route path="/practice/:categoryId" element={<Quiz />} />

//         <Route element={<ProtectedRoute />}>
//           <Route path="/contests/:id"    element={<ContestDetail />} />
//           <Route path="/contests/:id/countdown" element={<ContestCountdown />} />
//           <Route path="/contests/:id/submitted" element={<ContestSubmitted />} />
//           <Route path="/quiz/:contestId" element={<QuizPlay />} />
//           <Route path="/result"          element={<Result />} />
//           <Route path="/profile"         element={<Profile />} />
//           <Route path="/dashboard"       element={<Dashboard />} />
//           <Route path="/wallet"          element={<Wallet />} />
//         </Route>

//         <Route element={<AdminRoute />}>
//           <Route path="/admin"                 element={<AdminDashboard />} />
//           <Route path="/admin/contests"        element={<AdminContests />} />
//           <Route path="/admin/users"           element={<AdminUsers />} />
//           <Route path="/admin/quizzes"         element={<AdminQuizzes />} />
//           <Route path="/admin/question-bank"   element={<AdminQuestionBank />} />
//           <Route path="/admin/fraud"           element={<AdminFraud />} />
//           <Route path="/admin/analytics"       element={<AdminAnalytics />} />
//           <Route path="/admin/prize-templates" element={<AdminPrizeTemplates />} />
//         </Route>
//       </Route>

//       <Route path="/login"           element={<Login />} />
//       <Route path="/register"        element={<Register />} />
//       <Route path="/forgot-password" element={<ForgotPassword />} />
//       <Route path="*"                element={<NotFound />} />
//     </Routes>
//   )
// }






import { Routes, Route } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import ProtectedRoute from '../components/ProtectedRoute'
import AdminRoute from '../components/AdminRoute'

import Home           from '../pages/Home'
import Login          from '../pages/Login'
import Register       from '../pages/Register'
import ForgotPassword from '../pages/ForgotPassword'
import ResetPassword  from '../pages/ResetPassword'
import VerifyEmail    from '../pages/VerifyEmail'
import Categories     from '../pages/Categories'
import ContestLobby   from '../pages/ContestLobby'
import ContestDetail    from '../pages/ContestDetail'
import ContestCountdown from '../pages/ContestCountdown'
import ContestSubmitted from '../pages/ContestSubmitted'
import RoomsHub    from '../pages/RoomsHub'
import CreateRoom  from '../pages/CreateRoom'
import RoomLobby   from '../pages/RoomLobby'
import RoomPlay    from '../pages/RoomPlay'
import RoomResult  from '../pages/RoomResult'
import Quiz           from '../pages/Quiz'
import QuizPlay       from '../pages/QuizPlay'
import Result         from '../pages/Result'
import Leaderboard    from '../pages/Leaderboard'
import Profile        from '../pages/Profile'
import Dashboard      from '../pages/Dashboard'
import Wallet         from '../pages/Wallet'
import About          from '../pages/About'
import Contact        from '../pages/Contact'
import NotFound       from '../pages/NotFound'

import AdminDashboard      from '../pages/admin/AdminDashboard'
import AdminContests       from '../pages/admin/AdminContests'
import AdminUsers          from '../pages/admin/AdminUsers'
import AdminQuizzes        from '../pages/admin/AdminQuizzes'
import AdminQuestionBank   from '../pages/admin/AdminQuestionBank'
import AdminFraud          from '../pages/admin/AdminFraud'
import AdminAnalytics      from '../pages/admin/AdminAnalytics'
import AdminPrizeTemplates from '../pages/admin/AdminPrizeTemplates'

import TermsPage    from '../pages/legal/Terms'
import PrivacyPage  from '../pages/legal/Privacy'
import RefundPage   from '../pages/legal/Refund'
import FairPlayPage from '../pages/legal/FairPlay'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/"            element={<Home />} />
        <Route path="/categories"  element={<Categories />} />
        <Route path="/contests"    element={<ContestLobby />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/about"       element={<About />} />
        <Route path="/contact"     element={<Contact />} />
        <Route path="/terms"       element={<TermsPage />} />
        <Route path="/privacy"     element={<PrivacyPage />} />
        <Route path="/refund"      element={<RefundPage />} />
        <Route path="/fair-play"   element={<FairPlayPage />} />

        {/* Practice mode - public, no login needed */}
        <Route path="/practice/:categoryId" element={<Quiz />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/contests/:id"    element={<ContestDetail />} />
          <Route path="/contests/:id/countdown" element={<ContestCountdown />} />
          <Route path="/contests/:id/submitted" element={<ContestSubmitted />} />
          <Route path="/quiz/:contestId" element={<QuizPlay />} />
          <Route path="/result"          element={<Result />} />
          <Route path="/profile"         element={<Profile />} />
          <Route path="/dashboard"       element={<Dashboard />} />
          <Route path="/wallet"          element={<Wallet />} />

          {/* Live Rooms — protected the same way /contests/:id is: a room
              link for a not-logged-in user bounces to /login and Login.jsx
              already returns them to location.state.from afterwards. */}
          <Route path="/rooms"              element={<RoomsHub />} />
          <Route path="/rooms/create"       element={<CreateRoom />} />
          <Route path="/rooms/:code"        element={<RoomLobby />} />
          <Route path="/rooms/:code/play"   element={<RoomPlay />} />
          <Route path="/rooms/:code/result" element={<RoomResult />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="/admin"                 element={<AdminDashboard />} />
          <Route path="/admin/contests"        element={<AdminContests />} />
          <Route path="/admin/users"           element={<AdminUsers />} />
          <Route path="/admin/quizzes"         element={<AdminQuizzes />} />
          <Route path="/admin/question-bank"   element={<AdminQuestionBank />} />
          <Route path="/admin/fraud"           element={<AdminFraud />} />
          <Route path="/admin/analytics"       element={<AdminAnalytics />} />
          <Route path="/admin/prize-templates" element={<AdminPrizeTemplates />} />
        </Route>
      </Route>

      <Route path="/login"           element={<Login />} />
      <Route path="/register"        element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/verify-email/:token"   element={<VerifyEmail />} />
      <Route path="*"                element={<NotFound />} />
    </Routes>
  )
}