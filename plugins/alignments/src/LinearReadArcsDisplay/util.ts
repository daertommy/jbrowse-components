import { FeatureData } from '../shared/fetchFeatures'

export function hasPairedReads(features: FeatureData) {
  for (const f of features.chains.values()) {
    if (f[0].flags & 1) {
      return true
    }
  }
  return false
}
