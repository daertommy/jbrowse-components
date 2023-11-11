import React, { Suspense } from 'react'
import { observer } from 'mobx-react'

// locals
import Loading from './Loading'
import DisplayError from './DisplayError'

const BaseChordDisplay = observer(function ({
  display,
}: {
  display: {
    filled: boolean
    error: unknown
    reactElement: React.ReactElement
    renderProps: { radius: number }
  }
}) {
  if (display.error) {
    return <DisplayError model={display} />
  } else if (!display.filled) {
    return <Loading model={display} />
  } else {
    return <Suspense fallback={null}>{display.reactElement}</Suspense>
  }
})

export default BaseChordDisplay
