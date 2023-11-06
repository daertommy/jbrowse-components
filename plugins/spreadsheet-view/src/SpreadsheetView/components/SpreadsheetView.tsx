import React from 'react'
import { makeStyles } from 'tss-react/mui'
import { observer } from 'mobx-react'
import { ResizeHandle } from '@jbrowse/core/ui'

// locals
import ImportWizard from './ImportWizard'
import Spreadsheet from './Spreadsheet'
import { SpreadsheetViewModel } from '../models/SpreadsheetView'

const headerHeight = 52
const statusBarHeight = 40

const useStyles = makeStyles()(theme => ({
  contentArea: {
    overflow: 'auto',
  },
  resizeHandle: {
    height: 3,
    position: 'absolute',
    bottom: 0,
    left: 0,
    background: theme.palette.action.disabled,
    boxSizing: 'border-box',
    borderTop: '1px solid #fafafa',
  },
}))

const SpreadsheetView = observer(function ({
  model,
}: {
  model: SpreadsheetViewModel
}) {
  const { classes } = useStyles()
  const { spreadsheet, hideVerticalResizeHandle, height } = model

  return (
    <div>
      {!spreadsheet.data ? (
        <ImportWizard model={model.importWizard} />
      ) : (
        <div className={classes.contentArea}>
          <Spreadsheet
            model={spreadsheet}
            height={height - headerHeight - statusBarHeight}
          />
        </div>
      )}

      {hideVerticalResizeHandle ? null : (
        <ResizeHandle
          onDrag={model.resizeHeight}
          className={classes.resizeHandle}
        />
      )}
    </div>
  )
})

export default SpreadsheetView
