import React from 'react'
import { observer } from 'mobx-react'
import { makeStyles } from 'tss-react/mui'
import { DataGrid } from '@mui/x-data-grid'
import { LoadingEllipses } from '@jbrowse/core/ui'

// locals
import { SpreadsheetModel } from '../models/Spreadsheet'

const useStyles = makeStyles()(theme => ({
  root: {
    position: 'relative',
    marginBottom: theme.spacing(1),
    background: theme.palette.background.paper,
    overflow: 'auto',
  },
}))

function DataTable() {
  const columns = [{ field: 'Test1' }, { field: 'Test2' }]
  return <DataGrid rows={[]} columns={columns} />
}

const Spreadsheet = observer(function ({
  model,
  height,
}: {
  model: SpreadsheetModel
  height: number
}) {
  const { classes } = useStyles()

  return (
    <div className={classes.root} style={{ height }}>
      {model?.isLoaded && model.initialized ? (
        <DataTable />
      ) : (
        <LoadingEllipses variant="h6" />
      )}
    </div>
  )
})

export default Spreadsheet
