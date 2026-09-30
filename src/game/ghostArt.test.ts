import { describe, expect, it } from 'vitest'
import { basicGhostArt, buildArtPlan } from './ghostArt'

describe('buildArtPlan', () => {
  const variantCount = basicGhostArt.length - 1 // basic-0 (neutre) exclu du compte

  it('donne deux occurrences de chaque variante décorée, sur 100 fantômes', () => {
    const plan = buildArtPlan(100)
    expect(plan).toHaveLength(100)

    for (let variant = 1; variant <= variantCount; variant += 1) {
      expect(plan.filter((v) => v === variant), `variante ${variant}`).toHaveLength(2)
    }
  })

  it('assigne tout le reste au visuel neutre (index 0)', () => {
    const plan = buildArtPlan(100)
    const zeros = plan.filter((v) => v === 0).length
    expect(zeros).toBe(100 - variantCount * 2)
  })

  it('étale les variantes plutôt que de les regrouper en tête de liste', () => {
    const plan = buildArtPlan(100)
    const firstNonZero = plan.findIndex((v) => v !== 0)
    const lastNonZero = plan.length - 1 - [...plan].reverse().findIndex((v) => v !== 0)
    // Regroupées, elles tiendraient dans les 36 premières cases : ici elles
    // doivent couvrir une bien plus grande partie de la liste.
    expect(lastNonZero - firstNonZero).toBeGreaterThan(60)
  })

  it('ne casse pas sur un total plus petit que le nombre de variantes', () => {
    const plan = buildArtPlan(5)
    expect(plan).toHaveLength(5)
    expect(plan.every((v) => v >= 0 && v <= variantCount)).toBe(true)
  })
})
