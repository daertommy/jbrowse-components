import { Feature, getContainingView, getSession } from '@jbrowse/core/util'
import { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

import { LinearPileupDisplayModel } from './model'
import { fillRectCtx, strokeRectCtx } from '../LinearReadCloudDisplay/util'
import { fillColor, strokeColor } from '../shared/color'

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
  if (!asm || !self.featureData) {
    return
  }

  for (const [key, val] of self.layout.getRectangles().entries()) {
    const [l, top, r, bottom] = val
    const w = r - l - 1
    const featureHeight = bottom - top

    strokeRectCtx(l - view.offsetPx, top, w, featureHeight - 1, ctx, 'grey')
    fillRectCtx(l - view.offsetPx, top, w, featureHeight - 1, ctx, 'grey')
  }
}
