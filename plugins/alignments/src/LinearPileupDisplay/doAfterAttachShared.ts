import { autorun } from 'mobx'
import { addDisposer } from 'mobx-state-tree'

import { getRpcSessionId } from '@jbrowse/core/util/tracks'
import {
  getSession,
  getContainingView,
  SimpleFeature,
} from '@jbrowse/core/util'

// locals
import { getUniqueTagValues } from '../shared'
import { SimpleFeatureSerialized } from '@jbrowse/core/util/simpleFeature'
import { createAutorun } from '../util'

export function doAfterAttachShared(self: SharedPileupModel) {
  createAutorun(
    self,
    async () => {
      const view = getContainingView(self) as LGV
      if (!self.autorunReady) {
        return
      }

      const { colorBy, tagsReady } = self
      const { staticBlocks } = view
      if (colorBy?.tag && !tagsReady) {
        const vals = await getUniqueTagValues(self, colorBy, staticBlocks)
        self.updateColorTagMap(vals)
      }
      self.setTagsReady(true)
    },
    { delay: 1000 },
  )

  // autorun synchronizes featureUnderMouse with featureIdUnderMouse
  // asynchronously. this is needed due to how we do not serialize all
  // features from the BAM/CRAM over the rpc
  addDisposer(
    self,
    autorun(async () => {
      const session = getSession(self)
      try {
        const featureId = self.featureIdUnderMouse
        if (self.featureUnderMouse?.id() !== featureId) {
          if (!featureId) {
            self.setFeatureUnderMouse(undefined)
          } else {
            const sessionId = getRpcSessionId(self)
            const view = getContainingView(self)
            const { feature } = (await session.rpcManager.call(
              sessionId,
              'CoreGetFeatureDetails',
              {
                featureId,
                sessionId,
                layoutId: view.id,
                rendererType: 'PileupRenderer',
              },
            )) as { feature: SimpleFeatureSerialized }

            // check featureIdUnderMouse is still the same as the
            // feature.id that was returned e.g. that the user hasn't
            // moused over to a new position during the async operation
            // above
            if (self.featureIdUnderMouse === feature?.uniqueId) {
              self.setFeatureUnderMouse(new SimpleFeature(feature))
            }
          }
        }
      } catch (e) {
        console.error(e)
        session.notify(`${e}`, 'error')
      }
    }),
  )
}
