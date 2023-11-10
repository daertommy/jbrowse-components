import BoxRendererType from '@jbrowse/core/pluggableElementTypes/renderers/BoxRendererType'
import Plugin from '@jbrowse/core/Plugin'
import PluginManager from '@jbrowse/core/PluginManager'
import { configSchema } from './SvgFeatureRenderer'
import { lazy } from 'react'

const ReactComponent = lazy(
  () => import('./SvgFeatureRenderer/components/SvgFeatureRendering'),
)

class SvgFeatureRenderer extends BoxRendererType {
  supportsSVG = true
}

export default class SVGPlugin extends Plugin {
  name = 'SVGPlugin'

  install(pluginManager: PluginManager) {
    pluginManager.addRendererType(
      () =>
        new SvgFeatureRenderer({
          name: 'SvgFeatureRenderer',
          ReactComponent,
          configSchema,
          pluginManager,
        }),
    )
  }
}

export { configSchema as svgFeatureRendererConfigSchema } from './SvgFeatureRenderer'
export { ReactComponent }
