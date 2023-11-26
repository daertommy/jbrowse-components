import { getSnapshot, isAlive, IStateTreeNode } from 'mobx-state-tree'
import deepEqual from 'fast-deep-equal'
import PluginManager from '@jbrowse/core/PluginManager'

// locals
import { LinearAlignmentsDisplayModel } from './model'

export function getLowerPanelDisplays(pluginManager: PluginManager) {
  return (
    pluginManager
      .getDisplayElements()
      // @ts-expect-error
      .filter(f => f.subDisplay?.type === 'LinearAlignmentsDisplay')
      // @ts-expect-error
      .filter(f => f.subDisplay?.lowerPanel)
  )
}

export function deepSnap<T extends IStateTreeNode, U extends IStateTreeNode>(
  x1: T,
  x2: U,
) {
  return deepEqual(
    x1 ? getSnapshot(x1) : undefined,
    x2 ? getSnapshot(x2) : undefined,
  )
}

function isPileupAlive(self: LinearAlignmentsDisplayModel) {
  const { PileupDisplay } = self
  return PileupDisplay && isAlive(PileupDisplay)
}

function isSNPCoverageAlive(self: LinearAlignmentsDisplayModel) {
  const { SNPCoverageDisplay } = self
  return SNPCoverageDisplay && isAlive(SNPCoverageDisplay)
}
export function preCheck(self: LinearAlignmentsDisplayModel) {
  return isPileupAlive(self) && isSNPCoverageAlive(self)
}

export function propagateColorBy(self: LinearAlignmentsDisplayModel) {
  const { PileupDisplay, SNPCoverageDisplay } = self
  if (!preCheck(self) || !PileupDisplay.colorBy) {
    return
  }
  if (!deepSnap(PileupDisplay.colorBy, SNPCoverageDisplay.colorBy)) {
    SNPCoverageDisplay.setColorBy(getSnapshot(PileupDisplay.colorBy))
  }
}

export function propagateFilterBy(self: LinearAlignmentsDisplayModel) {
  const { PileupDisplay, SNPCoverageDisplay } = self
  if (!preCheck(self) || !PileupDisplay.filterBy) {
    return
  }
  if (!deepSnap(PileupDisplay.filterBy, SNPCoverageDisplay.filterBy)) {
    SNPCoverageDisplay.setFilterBy(getSnapshot(PileupDisplay.filterBy))
  }
}
