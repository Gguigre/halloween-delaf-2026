import { createHashRouter } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { RulesPage } from './pages/RulesPage'
import { BasicGhostPage } from './pages/BasicGhostPage'
import { QuizGhostPage } from './pages/QuizGhostPage'
import { JokerGhostPage } from './pages/JokerGhostPage'
import { LeaderboardPage } from './pages/LeaderboardPage'
import { AllCodesPage } from './pages/AllCodesPage'
import { AdminPage } from './pages/AdminPage'
import { NotFoundPage } from './pages/NotFoundPage'

export const routes = [
  { path: '/', element: <HomePage />, errorElement: <NotFoundPage /> },
  { path: '/regles', element: <RulesPage /> },
  { path: '/ghost/:id', element: <BasicGhostPage /> },
  { path: '/quiz/:id', element: <QuizGhostPage /> },
  { path: '/joker/:id', element: <JokerGhostPage /> },
  { path: '/leaderboard', element: <LeaderboardPage /> },
  { path: '/allCodes', element: <AllCodesPage /> },
  { path: '/admin', element: <AdminPage /> },
  { path: '*', element: <NotFoundPage /> },
]

export const router = createHashRouter(routes)
