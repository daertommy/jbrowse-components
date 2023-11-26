// locals
import { createAutorun } from '../util'
import { LinearPileupDisplayModel } from './model'
import { fetchFeatures } from './fetchFeatures'
import { drawAutorun } from '../shared/autoruns'
import { drawFeats } from './drawFeats'

export function doAfterAttach(self: LinearPileupDisplayModel) {
  createAutorun(
    self,
    async () => {
      await fetchFeatures(self)
    },
    { delay: 1000 },
  )

  drawAutorun(self, drawFeats)
}
