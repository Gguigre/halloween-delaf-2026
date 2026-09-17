import { describe, expect, it } from 'vitest'
import { routes } from './router'

describe('routes', () => {
  it('expose les routes décrites dans specs/01, plus /admin (specs/18)', () => {
    expect(routes.map((route) => route.path)).toEqual([
      '/',
      '/regles',
      '/ghost/:id',
      '/quiz/:id',
      '/joker/:id',
      '/leaderboard',
      '/allCodes',
      '/admin',
      '*',
    ])
  })

  it('rattrape les routes inconnues au lieu de casser l’app', () => {
    expect(routes.at(-1)?.path).toBe('*')
    expect(routes[0].errorElement).toBeDefined()
  })
})
