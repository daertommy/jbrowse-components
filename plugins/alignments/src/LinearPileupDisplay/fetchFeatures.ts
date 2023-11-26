import {
  SimpleFeature,
  SimpleFeatureSerialized,
  getContainingTrack,
  getContainingView,
  getSession,
} from '@jbrowse/core/util'
import { getSnapshot } from 'mobx-state-tree'
import { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'
import { LinearPileupDisplayModel } from './model'

type LGV = LinearGenomeViewModel

export async function fetchFeatures(self: LinearPileupDisplayModel) {
  // @ts-expect-error
  const { rpcSessionId: sessionId } = getContainingTrack(self)
  const { rpcManager } = getSession(self)
  const view = getContainingView(self) as LGV

  if (!view.initialized || self.error || self.regionTooLarge) {
    return
  }

  self.setLoading(true)

  for (const block of view.staticBlocks.contentBlocks) {
    if (!self.selfFeatures[block.key]) {
      const ret = (await rpcManager.call(sessionId, 'CoreGetFeatures', {
        sessionId,
        regions: [block],
        filterBy: getSnapshot(self.filterBy),
        adapterConfig: self.adapterConfig,
      })) as SimpleFeatureSerialized[]
      self.setFeatures(
        block.key,
        ret.map(f => new SimpleFeature(f)),
      )
    }
  }

  self.setLoading(false)
}
