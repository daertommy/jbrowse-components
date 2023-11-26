import { getContainingView, getSession } from '@jbrowse/core/util'
import { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

import { LinearPileupDisplayModel } from './model'

type LGV = LinearGenomeViewModel

export function drawFeats(
  self: LinearPileupDisplayModel,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const { featureData: features } = self
  if (!features) {
    return
  }
  const view = getContainingView(self) as LGV
  const { assemblyManager } = getSession(self)
  const asm = assemblyManager.get(view.assemblyNames[0])
  if (!asm) {
    return
  }
}
