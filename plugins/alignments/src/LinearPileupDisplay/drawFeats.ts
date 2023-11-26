import { getContainingView, getSession } from '@jbrowse/core/util'
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

  const featureHeight = 5
  for (const feature of self.featureData) {
    const s = feature.get('start')
    const e = feature.get('end')
    const refName = feature.get('refName')
    const effectiveStrand = feature.get('strand')
    const rs = view.bpToPx({ refName, coord: s })?.offsetPx
    const re = view.bpToPx({ refName, coord: e })?.offsetPx
    if (rs !== undefined && re !== undefined) {
      const w = Math.max(re - rs, 2)
      const l = rs - view.offsetPx
      const c = effectiveStrand === -1 ? 'color_rev_strand' : 'color_fwd_strand'
      const top = Math.random() * 100
      strokeRectCtx(l, top, w, featureHeight, ctx, strokeColor[c])
      fillRectCtx(l, top, w, featureHeight, ctx, fillColor[c])
    }
  }
}
