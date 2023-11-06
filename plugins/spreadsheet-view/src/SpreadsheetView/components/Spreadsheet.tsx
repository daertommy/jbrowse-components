import React, { useMemo, useState } from 'react'
import { observer } from 'mobx-react'
import { makeStyles } from 'tss-react/mui'
import { DataGrid } from '@mui/x-data-grid'
import { LoadingEllipses } from '@jbrowse/core/ui'
import { useResizeBar } from '@jbrowse/core/ui/useResizeBar'
import ResizeBar from '@jbrowse/core/ui/ResizeBar'
import { measureGridWidth } from '@jbrowse/core/util'

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

const DataTable = observer(function ({ model }: { model: SpreadsheetModel }) {
  const { ref, scrollLeft } = useResizeBar()
  const { rows } = model.data!
  const w0 = useMemo(
    () =>
      model.data!.columns.map(e =>
        measureGridWidth(model.data!.rows.map(r => r[e])),
      ),
    [model.data],
  )
  const [widths, setWidths] = useState(w0)
  const columns = model.data!.columns.map((m, i) => ({
    field: m,
    width: widths[i],
  }))
  return (
    <div ref={ref}>
      <ResizeBar
        widths={widths}
        setWidths={setWidths}
        scrollLeft={scrollLeft}
      />
      <DataGrid
        columnHeaderHeight={35}
        rowHeight={25}
        hideFooter={rows.length < 100}
        rows={rows}
        columns={columns}
      />
    </div>
  )
})

const Spreadsheet = observer(function ({
  model,
  height,
}: {
  model: SpreadsheetModel
  height: number
}) {
  const { classes } = useStyles()
  console.log(model.data)

  return (
    <div className={classes.root} style={{ height }}>
      {model?.data ? (
        <DataTable model={model} />
      ) : (
        <LoadingEllipses variant="h6" />
      )}
    </div>
  )
})

export default Spreadsheet
