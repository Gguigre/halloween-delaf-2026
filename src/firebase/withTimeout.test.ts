import { describe, expect, it, vi } from 'vitest'
import { FirestoreTimeoutError, withTimeout } from './withTimeout'

describe('withTimeout', () => {
  it('laisse passer une opération qui se confirme', async () => {
    await expect(withTimeout(Promise.resolve('ok'), 50)).resolves.toBe('ok')
  })

  it('remonte l’échec de l’opération tel quel', async () => {
    const refus = new Error('règle Firestore refusée')
    await expect(withTimeout(Promise.reject(refus), 50)).rejects.toBe(refus)
  })

  it('abandonne une écriture qui ne se confirme jamais', async () => {
    vi.useFakeTimers()
    const jamais = new Promise<void>(() => {})
    const course = withTimeout(jamais, 10_000)
    const attendu = expect(course).rejects.toBeInstanceOf(FirestoreTimeoutError)
    await vi.advanceTimersByTimeAsync(10_000)
    await attendu
    vi.useRealTimers()
  })
})
