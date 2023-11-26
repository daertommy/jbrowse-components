import { getContainingView, getSession } from '@jbrowse/core/util'
import { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

// locals
import { LinearReadCloudDisplayModel } from './model'
import { hasPairedReads } from '../shared/util'
import { drawPairFeatures } from './drawPairFeatures'
import { drawLongReadFeatures } from './drawLongReadFeatures'

type LGV = LinearGenomeViewModel

export function drawFeats(
  self: LinearReadCloudDisplayModel,
  ctx: CanvasRenderingContext2D,
) {
  const { featureData } = self
  if (!featureData) {
    return
  }
  const { assemblyManager } = getSession(self)
  const view = getContainingView(self) as LGV
  const assemblyName = view.assemblyNames[0]
  const asm = assemblyManager.get(assemblyName)
  if (!asm) {
    return
  }

  const hasPaired = hasPairedReads(featureData)

  if (hasPaired) {
    drawPairFeatures({ self, view, asm, ctx, featureData })
  } else {
    drawLongReadFeatures({ self, view, asm, ctx, featureData })
  }
}
