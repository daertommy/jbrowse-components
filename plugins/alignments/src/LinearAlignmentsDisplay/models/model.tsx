/* eslint-disable react-refresh/only-export-components */
import React from 'react'
import { types, Instance } from 'mobx-state-tree'

// jbrowse
import {
  ConfigurationReference,
  AnyConfigurationModel,
  AnyConfigurationSchemaType,
  getConf,
} from '@jbrowse/core/configuration'
import { BaseDisplay } from '@jbrowse/core/pluggableElementTypes/models'
import PluginManager from '@jbrowse/core/PluginManager'
import { MenuItem } from '@jbrowse/core/ui'
import { FeatureDensityStats } from '@jbrowse/core/data_adapters/BaseAdapter'
import { getLowerPanelDisplays } from './util'

const minDisplayHeight = 20

function AlignmentsModel(
  pluginManager: PluginManager,
  configSchema: AnyConfigurationSchemaType,
) {
  const lowerPanelDisplays = getLowerPanelDisplays(pluginManager).map(
    f => f.stateModel,
  )

  return types.model({
    /**
     * #property
     * refers to LinearPileupDisplay sub-display model
     */
    PileupDisplay: types.maybe(types.union(...lowerPanelDisplays)),
    /**
     * #property
     * refers to LinearSNPCoverageDisplay sub-display model
     */
    SNPCoverageDisplay: types.maybe(
      pluginManager.getDisplayType('LinearSNPCoverageDisplay').stateModel,
    ),
    /**
     * #property
     */
    snpCovHeight: 45,
    /**
     * #property
     */
    type: types.literal('LinearAlignmentsDisplay'),
    /**
     * #property
     */
    configuration: ConfigurationReference(configSchema),
    /**
     * #property
     */
    heightPreConfig: types.maybe(types.number),
    /**
     * #property
     */
    userFeatureScreenDensity: types.maybe(types.number),
    /**
     * #property
     */
    lowerPanelType: 'LinearPileupDisplay',
  })
}

/**
 * #stateModel LinearAlignmentsDisplay
 * extends `BaseDisplay`
 */
function stateModelFactory(
  pluginManager: PluginManager,
  configSchema: AnyConfigurationSchemaType,
) {
  return types
    .compose(
      'LinearAlignmentsDisplay',
      BaseDisplay,
      AlignmentsModel(pluginManager, configSchema),
    )
    .volatile(() => ({
      scrollTop: 0,
    }))
    .actions(self => ({
      /**
       * #action
       */
      setScrollTop(scrollTop: number) {
        self.scrollTop = scrollTop
      },

      /**
       * #action
       */
      setSNPCoverageHeight(n: number) {
        self.snpCovHeight = n
      },
    }))
    .views(self => ({
      /**
       * #getter
       */
      get height() {
        return self.heightPreConfig ?? getConf(self, 'height')
      },

      /**
       * #getter
       */
      get featureIdUnderMouse() {
        return (
          self.PileupDisplay.featureIdUnderMouse ||
          self.SNPCoverageDisplay.featureIdUnderMouse
        )
      },
    }))
    .views(self => ({
      /**
       * #getter
       */
      get pileupConf() {
        const conf = getConf(self, 'pileupDisplay')
        return {
          ...conf,
          type: self.lowerPanelType,
          displayId: `${self.configuration.displayId}_${self.lowerPanelType}_xyz`, // xyz to avoid someone accidentally naming the displayId similar to this
        }
      },

      /**
       * #method
       */
      getFeatureByID(blockKey: string, id: string) {
        return self.PileupDisplay.getFeatureByID(blockKey, id)
      },
      /**
       * #method
       */
      searchFeatureByID(id: string) {
        return self.PileupDisplay.searchFeatureByID?.(id)
      },

      /**
       * #getter
       */
      get features() {
        return self.PileupDisplay.features
      },

      /**
       * #getter
       */
      get DisplayBlurb() {
        return self.PileupDisplay?.DisplayBlurb
      },

      /**
       * #getter
       */
      get sortedBy() {
        return self.PileupDisplay.sortedBy
      },

      /**
       * #getter
       */
      get coverageConf() {
        const conf = getConf(self, 'snpCoverageDisplay')
        return {
          ...conf,
          displayId: `${self.configuration.displayId}_snpcoverage_xyz`, // xyz to avoid someone accidentally naming the displayId similar to this
        }
      },
    }))
    .actions(self => ({
      /**
       * #action
       */
      setSNPCoverageDisplay(configuration: AnyConfigurationModel) {
        self.SNPCoverageDisplay = {
          type: 'LinearSNPCoverageDisplay',
          configuration,
          height: self.snpCovHeight,
        }
      },
      /**
       * #action
       */
      setFeatureDensityStatsLimit(stats?: FeatureDensityStats) {
        self.PileupDisplay.setFeatureDensityStatsLimit(stats)
        self.SNPCoverageDisplay.setFeatureDensityStatsLimit(stats)
      },

      /**
       * #action
       */
      setPileupDisplay(configuration: AnyConfigurationModel) {
        self.PileupDisplay = {
          type: configuration.type || 'LinearPileupDisplay',
          configuration,
        }
      },
      /**
       * #action
       */
      setHeight(n: number) {
        self.heightPreConfig = Math.max(n, minDisplayHeight)
        return self.heightPreConfig
      },
      /**
       * #action
       */
      setLowerPanelType(type: string) {
        self.lowerPanelType = type
      },
      /**
       * #action
       */
      resizeHeight(distance: number) {
        const oldHeight = self.height
        const newHeight = this.setHeight(self.height + distance)
        return newHeight - oldHeight
      },
    }))
    .actions(self => ({
      afterAttach() {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        ;(async () => {
          try {
            const { doAfterAttach } = await import('./doAfterAttach')
            doAfterAttach(self as LinearAlignmentsDisplayModel)
          } catch (e) {
            console.error(e)
            self.setError(e)
          }
        })()
      },
    }))
    .views(self => {
      const { trackMenuItems: superTrackMenuItems } = self
      return {
        /**
         * #method
         */
        trackMenuItems(): MenuItem[] {
          if (!self.PileupDisplay) {
            return []
          }
          const extra = getLowerPanelDisplays(pluginManager).map(d => ({
            type: 'radio',
            label: d.displayName,
            checked: d.name === self.PileupDisplay.type,
            onClick: () => self.setLowerPanelType(d.name),
          }))
          return [
            ...superTrackMenuItems(),
            {
              type: 'subMenu',
              label: 'Pileup settings',
              subMenu: self.PileupDisplay.trackMenuItems(),
            },
            {
              type: 'subMenu',
              label: 'SNPCoverage settings',
              subMenu: self.SNPCoverageDisplay.trackMenuItems(),
            },
            {
              type: 'subMenu',
              label: `Replace lower panel with...`,
              subMenu: extra,
            },
          ]
        },
      }
    })
    .actions(self => ({
      /**
       * #action
       */
      async renderSvg(opts: {
        rasterizeLayers?: boolean
      }): Promise<React.ReactNode> {
        const { renderSvg } = await import('./renderSvg')
        return renderSvg(self as LinearAlignmentsDisplayModel, opts)
      },
    }))
    .preProcessSnapshot(snap => {
      if (!snap) {
        return snap
      }
      // @ts-expect-error
      const { height, ...rest } = snap
      return { heightPreConfig: height, ...rest }
    })
}

export default stateModelFactory
export type LinearAlignmentsDisplayStateModel = ReturnType<
  typeof stateModelFactory
>
export type LinearAlignmentsDisplayModel =
  Instance<LinearAlignmentsDisplayStateModel>
