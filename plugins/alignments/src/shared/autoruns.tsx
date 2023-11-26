import { getContainingView } from '@jbrowse/core/util'

import { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

// locals
import { createAutorun } from '../util'
import { fetchFeatures } from './fetchFeatures'
import { LinearReadCloudDisplayModel } from '../LinearReadCloudDisplay/model'
import { LinearReadArcsDisplayModel } from '../LinearReadArcsDisplay/model'

type LGV = LinearGenomeViewModel

export function fetchFeaturesAutorun(
  self: LinearReadArcsDisplayModel | LinearReadCloudDisplayModel,
) {
  createAutorun(
    self,
    async () => {
      await fetchFeatures(self)
    },
    { delay: 1000 },
  )
}

interface AnyLinearAlignmentsDisplay {
  setError: (e: unknown) => void
  lastDrawnOffsetPx: number | undefined
  lastDrawnBpPerPx: number | undefined
  setLastDrawnOffsetPx: (arg: number) => void
  setLastDrawnBpPerPx: (arg: number) => void
  height: number
  featureData: unknown
  ref: HTMLCanvasElement | null
}

type DrawFeaturesCallback<T> = (
  self: T,
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
) => void

function draw<T extends AnyLinearAlignmentsDisplay>(
  self: T,
  view: LGV,
  cb: DrawFeaturesCallback<T>,
) {
  const canvas = self.ref
  if (!canvas) {
    return
  }

  const ctx = canvas.getContext('2d')
  if (!ctx) {
    return
  }

  if (!self.featureData) {
    return
  }

  ctx.clearRect(0, 0, canvas.width, self.height * 2)
  ctx.resetTransform()
  ctx.scale(2, 2)
  cb(self, ctx, canvas.width, self.height)
  self.setLastDrawnOffsetPx(view.offsetPx)
  self.setLastDrawnBpPerPx(view.bpPerPx)
}

export function drawAutorun<T extends AnyLinearAlignmentsDisplay>(
  self: T,
  cb: DrawFeaturesCallback<T>,
) {
  // first autorun instantly draws if bpPerPx changes
  createAutorun(self, async () => {
    const view = getContainingView(self) as LGV
    if (view.bpPerPx !== self.lastDrawnBpPerPx) {
      draw(self, view, cb)
    }
  })

  // second autorun draws after delay 1000 e.g. if offsetPx changes
  createAutorun(
    self,
    async () => {
      const view = getContainingView(self) as LGV
      draw(self, view, cb)
    },
    { delay: 1000 },
  )
}
