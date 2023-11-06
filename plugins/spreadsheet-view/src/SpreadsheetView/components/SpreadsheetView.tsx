import React, { useState } from 'react'
import { Grid } from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import { observer } from 'mobx-react'
import { ResizeHandle } from '@jbrowse/core/ui'

// locals
import ImportWizard from './ImportWizard'
import Spreadsheet from './Spreadsheet'
import { SpreadsheetViewModel } from '../models/SpreadsheetView'

const headerHeight = 52
const colFilterHeight = 46
const statusBarHeight = 40

const useStyles = makeStyles()(theme => ({
  header: {
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    boxSizing: 'border-box',
    height: headerHeight,
    paddingLeft: theme.spacing(1),
  },
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
  const {
    spreadsheet,
    filterControls,
    hideVerticalResizeHandle,
    mode,
    height,
  } = model

  return (
    <div>
      {mode === 'import' ? (
        <ImportWizard model={model.importWizard} />
      ) : (
        <div className={classes.contentArea}>
          <div
            style={{
              position: 'relative',
              display: mode === 'display' ? undefined : 'none',
            }}
          >
            {spreadsheet ? (
              <Spreadsheet
                model={spreadsheet}
                height={
                  height -
                  headerHeight -
                  filterControls.columnFilters.length * colFilterHeight -
                  statusBarHeight
                }
              />
            ) : null}
          </div>
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
