import { getConf } from '@jbrowse/core/configuration'
import { getRpcSessionId } from '@jbrowse/core/util/tracks'
import { getSession, getContainingView } from '@jbrowse/core/util'
import { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

// locals
import { getUniqueModificationValues } from '../shared'
import { createAutorun } from '../util'
import { LinearPileupDisplayModel } from './model'
import { fetchFeatures } from './fetchFeatures'

type LGV = LinearGenomeViewModel

export function doAfterAttach(self: LinearPileupDisplayModel) {
  createAutorun(
    self,
    async () => {
      await fetchFeatures(self)
    },
    { delay: 1000 },
  )
  createAutorun(
    self,
    async () => {
      const view = getContainingView(self) as LGV
      if (!self.autorunReady) {
        return
      }

      const { bpPerPx } = view

      self.setCurrSortBpPerPx(bpPerPx)
    },
    { delay: 1000 },
  )
  createAutorun(
    self,
    async () => {
      const { rpcManager } = getSession(self)
      const view = getContainingView(self) as LGV
      if (!self.autorunReady) {
        return
      }

      const { sortedBy, adapterConfig, rendererType, sortReady } = self
      const { bpPerPx } = view

      if (sortedBy && (!sortReady || self.currSortBpPerPx === view.bpPerPx)) {
        const { pos, refName, assemblyName } = sortedBy
        // render just the sorted region first
        // @ts-expect-error
        await self.rendererType.renderInClient(rpcManager, {
          assemblyName,
          regions: [
            {
              start: pos,
              end: pos + 1,
              refName,
              assemblyName,
            },
          ],
          adapterConfig,
          rendererType: rendererType.name,
          sessionId: getRpcSessionId(self),
          layoutId: view.id,
          timeout: 1_000_000,
          ...self.renderPropsPre(),
        })
      }
      self.setCurrSortBpPerPx(bpPerPx)
      self.setSortReady(true)
    },
    { delay: 1000 },
  )

  createAutorun(self, async () => {
    if (!self.autorunReady) {
      return
    }
    const { parentTrack, colorBy } = self
    const { staticBlocks } = getContainingView(self) as LGV
    if (colorBy?.type === 'modifications') {
      const adapter = getConf(parentTrack, ['adapter'])
      const vals = await getUniqueModificationValues(
        self,
        adapter,
        colorBy,
        staticBlocks,
      )
      self.updateModificationColorMap(vals)
    }
    self.setModificationsReady(true)
  })
}
