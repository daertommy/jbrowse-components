import { autorun } from 'mobx'
import { addDisposer, getSnapshot } from 'mobx-state-tree'
import { LinearAlignmentsDisplayModel } from './model'
import { propagateColorBy, propagateFilterBy } from './util'
import deepEqual from 'deep-equal'

export function doAfterAttach(self: LinearAlignmentsDisplayModel) {
  addDisposer(
    self,
    autorun(() => {
      const { SNPCoverageDisplay, PileupDisplay, coverageConf, pileupConf } =
        self

      if (!SNPCoverageDisplay) {
        self.setSNPCoverageDisplay(coverageConf)
      } else if (
        !deepEqual(coverageConf, getSnapshot(SNPCoverageDisplay.configuration))
      ) {
        SNPCoverageDisplay.setHeight(self.snpCovHeight)
        SNPCoverageDisplay.setConfig(self.coverageConf)
      }

      if (!PileupDisplay || self.lowerPanelType !== PileupDisplay.type) {
        self.setPileupDisplay(pileupConf)
      } else if (
        !deepEqual(pileupConf, getSnapshot(PileupDisplay.configuration))
      ) {
        PileupDisplay.setConfig(self.pileupConf)
      }

      propagateColorBy(self)
      propagateFilterBy(self)
    }),
  )

  addDisposer(
    self,
    autorun(() => {
      self.setSNPCoverageHeight(self.SNPCoverageDisplay.height)
    }),
  )

  addDisposer(
    self,
    autorun(() => {
      self.PileupDisplay.setHeight(self.height - self.SNPCoverageDisplay.height)
    }),
  )
}
