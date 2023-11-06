import { getSession } from '@jbrowse/core/util'
import { autorun } from 'mobx'
import { addDisposer, types, getParent, Instance } from 'mobx-state-tree'

/**
 * #stateModel SpreadsheetViewSpreadsheet
 * #category view
 */
function x() {} // eslint-disable-line @typescript-eslint/no-unused-vars

function stateModelFactory() {
  return types
    .model('Spreadsheet', {
      assemblyName: types.maybe(types.string),
    })
    .volatile(() => ({
      isLoaded: false,
      data: undefined as unknown,
    }))
    .views(self => ({
      /**
       * #getter
       */
      get initialized() {
        const session = getSession(self)
        const name = self.assemblyName
        return name ? session.assemblyManager.get(name)?.initialized : false
      },
    }))
    .actions(self => ({
      setLoaded(flag: boolean) {
        self.isLoaded = flag
      },
    }))
    .actions(self => ({
      afterAttach() {
        addDisposer(
          self,
          autorun(async () => {
            const session = getSession(self)
            const { assemblyManager } = session
            try {
              if (self.assemblyName) {
                await assemblyManager.waitForAssembly(self.assemblyName)
                self.setLoaded(true)
              }
            } catch (error) {
              console.error(error)
              session.notify(
                `failed to load assembly ${self.assemblyName} ${error}`,
                'error',
              )
            }
          }),
        )
      },
    }))
}

export type SpreadsheetStateModel = ReturnType<typeof stateModelFactory>
export type SpreadsheetModel = Instance<SpreadsheetStateModel>

export default stateModelFactory
