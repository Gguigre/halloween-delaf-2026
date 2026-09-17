import type { ReactNode } from 'react'
import { createHashRouter } from 'react-router-dom'
import { Layout } from './components/Layout'
import { RequireIdentity } from './player/RequireIdentity'
import { HomePage } from './pages/HomePage'
import { RulesPage } from './pages/RulesPage'
import { BasicGhostPage } from './pages/BasicGhostPage'
import { QuizGhostPage } from './pages/QuizGhostPage'
import { JokerGhostPage } from './pages/JokerGhostPage'
import { LeaderboardPage } from './pages/LeaderboardPage'
import { AllCodesPage } from './pages/AllCodesPage'
import { AdminPage } from './pages/AdminPage'
import { NotFoundPage } from './pages/NotFoundPage'

/** Tous les écrans passent par `Layout` : aucun n'est un cul-de-sac (specs/02). */
const screen = (element: ReactNode) => <Layout>{element}</Layout>

/** Le flux de scan exige une identité, posée devant la route demandée (specs/04). */
const gated = (element: ReactNode) => screen(<RequireIdentity>{element}</RequireIdentity>)

export const routes = [
  { path: '/', element: gated(<HomePage />), errorElement: screen(<NotFoundPage />) },
  { path: '/regles', element: screen(<RulesPage />) },
  { path: '/ghost/:id', element: gated(<BasicGhostPage />) },
  { path: '/quiz/:id', element: gated(<QuizGhostPage />) },
  { path: '/joker/:id', element: gated(<JokerGhostPage />) },
  { path: '/leaderboard', element: screen(<LeaderboardPage />) },
  { path: '/allCodes', element: screen(<AllCodesPage />) },
  { path: '/admin', element: screen(<AdminPage />) },
  { path: '*', element: screen(<NotFoundPage />) },
]

export const router = createHashRouter(routes)
