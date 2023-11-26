import { lazy } from 'react'
import { types, Instance } from 'mobx-state-tree'
import {
  AnyConfigurationSchemaType,
  ConfigurationReference,
  readConfObject,
  getConf,
} from '@jbrowse/core/configuration'
import {
  getEnv,
  getSession,
  getContainingView,
  Feature,
} from '@jbrowse/core/util'

import { LinearGenomeViewModel } from '@jbrowse/plugin-linear-genome-view'

// icons
import VisibilityIcon from '@mui/icons-material/Visibility'
import SortIcon from '@mui/icons-material/Sort'

// locals
import { SharedLinearPileupDisplayMixin } from '../SharedLinearPileupDisplay/model'
import { GranularRectLayout } from '@jbrowse/core/util/layouts'
import { autorun } from 'mobx'

// async
const SortByTagDialog = lazy(() => import('./components/SortByTagDialog'))

type LGV = LinearGenomeViewModel

/**
 * #stateModel LinearPileupDisplay
 * #category display
 * extends `SharedLinearPileupDisplayMixin`
 */
function stateModelFactory(configSchema: AnyConfigurationSchemaType) {
  return types
    .compose(
      'LinearPileupDisplay',
      SharedLinearPileupDisplayMixin(configSchema),
      types.model({
        /**
         * #property
         */
        type: types.literal('LinearPileupDisplay'),
        /**
         * #property
         */
        configuration: ConfigurationReference(configSchema),
        /**
         * #property
         */
        showSoftClipping: false,
        /**
         * #property
         */
        mismatchAlpha: types.maybe(types.boolean),

        /**
         * #property
         */
        sortedBy: types.maybe(
          types.model({
            type: types.string,
            pos: types.number,
            tag: types.maybe(types.string),
            refName: types.string,
            assemblyName: types.string,
          }),
        ),
      }),
    )
    .volatile(() => ({
      sortReady: false,
      currSortBpPerPx: 0,
      loading: false,
      layout: new GranularRectLayout(),
      featureData: undefined as Feature[] | undefined,
      lastDrawnOffsetPx: undefined as number | undefined,
      lastDrawnBpPerPx: 0,
      ref: null as HTMLCanvasElement | null,
    }))
    .actions(self => ({
      /**
       * #action
       */
      setLastDrawnOffsetPx(n: number) {
        self.lastDrawnOffsetPx = n
      },
      /**
       * #action
       */
      setLastDrawnBpPerPx(n: number) {
        self.lastDrawnBpPerPx = n
      },
      /**
       * #action
       * internal, a reference to a HTMLCanvas because we use a autorun to draw
       * the canvas
       */
      setRef(ref: HTMLCanvasElement | null) {
        self.ref = ref
      },
      /**
       * #action
       */
      setFeatures(f: Feature[]) {
        self.featureData = f
      },
      /**
       * #action
       */
      setLoading(f: boolean) {
        self.loading = f
      },
      /**
       * #action
       */
      setCurrSortBpPerPx(n: number) {
        self.currSortBpPerPx = n
      },

      /**
       * #action
       */
      setSortReady(flag: boolean) {
        self.sortReady = flag
      },
      /**
       * #action
       */
      clearSelected() {
        self.sortedBy = undefined
      },
      /**
       * #action
       */
      toggleSoftClipping() {
        self.showSoftClipping = !self.showSoftClipping
      },
      /**
       * #action
       */
      toggleMismatchAlpha() {
        self.mismatchAlpha = !self.mismatchAlpha
      },
      /**
       * #action
       */
      setSortedBy(type: string, tag?: string) {
        const { centerLineInfo } = getContainingView(self) as LGV
        if (!centerLineInfo) {
          return
        }
        const { refName, assemblyName, offset } = centerLineInfo
        const centerBp = Math.round(offset) + 1

        if (centerBp < 0 || !refName) {
          return
        }

        self.sortReady = false
        self.sortedBy = {
          type,
          pos: centerBp,
          refName,
          assemblyName,
          tag,
        }
      },
    }))
    .actions(self => {
      // resets the sort object and refresh whole display on reload
      const superReload = self.reload

      return {
        /**
         * #action
         */
        reload() {
          self.clearSelected()
          superReload()
        },
      }
    })

    .views(self => ({
      /**
       * #getter
       */
      get drawn() {
        return self.lastDrawnOffsetPx !== undefined
      },
      /**
       * #getter
       */
      get rendererConfig() {
        const {
          featureHeight,
          noSpacing,
          trackMaxHeight,
          mismatchAlpha,
          rendererTypeName,
        } = self
        const configBlob = getConf(self, ['renderers', rendererTypeName]) || {}
        return self.rendererType.configSchema.create(
          {
            ...configBlob,
            ...(featureHeight !== undefined ? { height: featureHeight } : {}),
            ...(noSpacing !== undefined ? { noSpacing } : {}),
            ...(mismatchAlpha !== undefined ? { mismatchAlpha } : {}),
            ...(trackMaxHeight !== undefined
              ? { maxHeight: trackMaxHeight }
              : {}),
          },
          getEnv(self),
        )
      },
    }))
    .views(self => {
      const { renderReady: superRenderReady } = self
      return {
        /**
         * #getter
         */
        get mismatchAlphaSetting() {
          return readConfObject(self.rendererConfig, 'mismatchAlpha')
        },
        /**
         * #method
         */
        renderReady() {
          const view = getContainingView(self) as LGV
          return self.currSortBpPerPx === view.bpPerPx && superRenderReady()
        },
      }
    })
    .views(self => {
      const {
        trackMenuItems: superTrackMenuItems,
        renderPropsPre: superRenderPropsPre,
        renderProps: superRenderProps,
        colorSchemeSubMenuItems: superColorSchemeSubMenuItems,
      } = self

      return {
        /**
         * #method
         */
        renderPropsPre() {
          const { sortedBy, showSoftClipping } = self
          const superProps = superRenderPropsPre()
          return {
            ...superProps,
            showSoftClip: showSoftClipping,
            sortedBy,
          }
        },
        /**
         * #method
         */
        renderProps() {
          const { sortReady } = self
          const result = superRenderProps()
          return {
            ...result,
            notReady: result.notReady || !sortReady,
          }
        },

        /**
         * #method
         */
        trackMenuItems() {
          return [
            ...superTrackMenuItems(),
            {
              label: 'Show soft clipping',
              icon: VisibilityIcon,
              type: 'checkbox',
              checked: self.showSoftClipping,
              onClick: () => {
                self.toggleSoftClipping()
                // if toggling from off to on, will break sort for this track
                // so clear it
                if (self.showSoftClipping) {
                  self.clearSelected()
                }
              },
            },
            {
              label: 'Sort by',
              icon: SortIcon,
              disabled: self.showSoftClipping,
              subMenu: [
                ...['Start location', 'Read strand', 'Base pair'].map(
                  option => ({
                    label: option,
                    onClick: () => self.setSortedBy(option),
                  }),
                ),
                {
                  label: 'Sort by tag...',
                  onClick: () => {
                    getSession(self).queueDialog(handleClose => [
                      SortByTagDialog,
                      { model: self, handleClose },
                    ])
                  },
                },
                {
                  label: 'Clear sort',
                  onClick: () => self.clearSelected(),
                },
              ],
            },
            {
              label: 'Color scheme',
              subMenu: [
                {
                  label: 'Pair orientation',
                  onClick: () =>
                    self.setColorScheme({ type: 'pairOrientation' }),
                },
                // {
                //   label: 'Modifications or methylation',
                //   onClick: () => {
                //     getSession(self).queueDialog(doneCallback => [
                //       ModificationsDialog,
                //       { model: self, handleClose: doneCallback },
                //     ])
                //   },
                // },
                {
                  label: 'Insert size',
                  onClick: () => self.setColorScheme({ type: 'insertSize' }),
                },
                ...superColorSchemeSubMenuItems(),
              ],
            },
            {
              label: 'Fade mismatches by quality',
              type: 'checkbox',
              checked: self.mismatchAlphaSetting,
              onClick: () => self.toggleMismatchAlpha(),
            },
          ]
        },
      }
    })
    .actions(self => ({
      afterAttach() {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        ;(async () => {
          try {
            const { doAfterAttach } = await import('./doAfterAttach')
            doAfterAttach(self)
          } catch (e) {
            console.error(e)
            self.setError(e)
          }
        })()

        autorun(() => {
          const view = getContainingView(self) as LGV
          if (self.lastDrawnBpPerPx !== view.bpPerPx) {
            self.layout = new GranularRectLayout({ pitchX: 1 })
          }

          self.featureData?.forEach(f => {
            const s = f.get('start')
            const e = f.get('end')
            const refName = f.get('refName')
            const rs = view.bpToPx({ refName, coord: s })?.offsetPx
            const re = view.bpToPx({ refName, coord: e })?.offsetPx
            if (rs !== undefined && re !== undefined) {
              self.layout.addRect(f.id(), rs, re, 10, f)
            }
          })
        })
      },
    }))
}

export type LinearPileupDisplayStateModel = ReturnType<typeof stateModelFactory>
export type LinearPileupDisplayModel = Instance<LinearPileupDisplayStateModel>
export default stateModelFactory
