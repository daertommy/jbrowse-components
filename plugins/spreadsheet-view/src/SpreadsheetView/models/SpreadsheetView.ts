import { types, getParent, cast, SnapshotIn, Instance } from 'mobx-state-tree'
import { BaseViewModel } from '@jbrowse/core/pluggableElementTypes/models'
import { getSession } from '@jbrowse/core/util'

// icons
import FolderOpenIcon from '@mui/icons-material/FolderOpen'

import spreadsheetModelFactory, { SpreadsheetModel } from './Spreadsheet'
import importWizardFactory from './ImportWizard'

const minHeight = 40
const defaultHeight = 440

/**
 * #stateModel SpreadsheetView
 * #category view
 */
function x() {} // eslint-disable-line @typescript-eslint/no-unused-vars

function stateModelFactory() {
  const ImportWizard = importWizardFactory()
  const SpreadsheetModelType = spreadsheetModelFactory()
  return types
    .compose(
      BaseViewModel,
      types.model('SpreadsheetView', {
        /**
         * #property
         */
        type: types.literal('SpreadsheetView'),
        /**
         * #property
         */
        offsetPx: 0,
        /**
         * #property
         */
        height: types.optional(
          types.refinement(
            'SpreadsheetViewHeight',
            types.number,
            n => n >= minHeight,
          ),
          defaultHeight,
        ),
        /**
         * #property
         */
        hideVerticalResizeHandle: false,

        /**
         * #property
         */
        importWizard: types.optional(ImportWizard, () => ImportWizard.create()),
        /**
         * #property
         */
        spreadsheet: types.optional(SpreadsheetModelType, () =>
          SpreadsheetModelType.create(),
        ),
      }),
    )
    .volatile(() => ({
      width: 400,
    }))
    .views(self => ({
      /**
       * #getter
       */
      get assembly() {
        const name = self.spreadsheet?.assemblyName
        const { assemblyManager } = getSession(self)
        return name ? assemblyManager.get(name) : undefined
      },
    }))
    .actions(self => ({
      /**
       * #action
       */
      setWidth(newWidth: number) {
        self.width = newWidth
        return self.width
      },
      /**
       * #action
       */
      setHeight(newHeight: number) {
        self.height = newHeight > minHeight ? newHeight : minHeight
        return self.height
      },
      /**
       * #action
       */
      resizeHeight(distance: number) {
        const oldHeight = self.height
        const newHeight = this.setHeight(self.height + distance)
        return newHeight - oldHeight
      },
      /**
       * #action
       */
      resizeWidth(distance: number) {
        const oldWidth = self.width
        const newWidth = this.setWidth(self.width + distance)
        return newWidth - oldWidth
      },

      /**
       * #action
       * load a new spreadsheet and set our mode to display it
       */
      displaySpreadsheet(spreadsheet?: unknown) {
        self.spreadsheet.setData(spreadsheet)
      },

      /**
       * #action
       */
      closeView() {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        getParent<any>(self, 2).removeView(self)
      },
    }))
    .views(self => ({
      /**
       * #method
       */
      menuItems() {
        return [
          {
            label: 'Return to import form',
            onClick: () => self.displaySpreadsheet(undefined),
            icon: FolderOpenIcon,
          },
        ]
      },
    }))
}

export type SpreadsheetViewStateModel = ReturnType<typeof stateModelFactory>
export type SpreadsheetViewModel = Instance<SpreadsheetViewStateModel>

export default stateModelFactory
