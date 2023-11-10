import { lazy } from 'react'
import ChordRendererType from '@jbrowse/core/pluggableElementTypes/renderers/CircularChordRendererType'
import PluginManager from '@jbrowse/core/PluginManager'
import configSchema from './configSchema'

export default (pluginManager: PluginManager) => {
  pluginManager.addRendererType(
    () =>
      new ChordRendererType({
        name: 'StructuralVariantChordRenderer',
        displayName: 'SV chord renderer',
        ReactComponent: lazy(() => import('./ReactComponent')),
        configSchema,
        pluginManager,
      }),
  )
}
