import { getContainingView, getSession } from '@jbrowse/core/util'
import { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'
import { Assembly } from '@jbrowse/core/assemblyManager/assembly'

// locals
import {
  getPairedOrientationColor,
  getPairedInsertSizeColor,
  getPairedInsertSizeAndOrientationColor,
} from '../shared/color'
import { featurizeSA } from '../MismatchParser'
import { LinearPileupDisplayModel } from './model'
import { hasPairedReads } from '../shared/util'

type LGV = LinearGenomeViewModel

function jitter(n: number) {
  return Math.random() * 2 * n - n
}

interface CoreFeat {
  strand: number
  refName: string
  start: number
  end: number
}

function drawLineAtOffset(
  ctx: CanvasRenderingContext2D,
  offset: number,
  height: number,
  color: string,
) {
  // draws a vertical line off to middle of nowhere if the second end not found
  ctx.strokeStyle = color
  ctx.beginPath()
  ctx.moveTo(offset, 0)
  ctx.lineTo(offset, height)
  ctx.stroke()
}

export function drawFeats(
  self: LinearPileupDisplayModel,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) {
  const { selfFeatures: features, colorBy } = self
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
