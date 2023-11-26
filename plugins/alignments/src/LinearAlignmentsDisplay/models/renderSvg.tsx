import React from 'react'
import { LinearAlignmentsDisplayModel } from './model'
import { when } from '@jbrowse/core/util'

export async function renderSvg(
  self: LinearAlignmentsDisplayModel,
  opts: { rasterizeLayers?: boolean },
): Promise<React.ReactElement> {
  const pileupHeight = self.height - self.SNPCoverageDisplay.height
  await when(
    () =>
      !self.PileupDisplay.renderProps().notReady &&
      !self.SNPCoverageDisplay.renderProps().notReady,
  )
  return (
    <>
      <g>{await self.SNPCoverageDisplay.renderSvg(opts)}</g>
      <g transform={`translate(0 ${self.SNPCoverageDisplay.height})`}>
        {await self.PileupDisplay.renderSvg({
          ...opts,
          overrideHeight: pileupHeight,
        })}
      </g>
    </>
  )
}
