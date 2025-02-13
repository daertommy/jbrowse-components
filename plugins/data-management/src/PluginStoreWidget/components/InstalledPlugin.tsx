import React, { Suspense, lazy, useState } from 'react'
import { observer } from 'mobx-react'
import { IconButton, ListItem, Tooltip, Typography } from '@mui/material'
import { makeStyles } from 'tss-react/mui'

import CloseIcon from '@mui/icons-material/Close'
import LockIcon from '@mui/icons-material/Lock'

import { getEnv, getSession } from '@jbrowse/core/util'
import {
  BasePlugin,
  isSessionWithSessionPlugins,
} from '@jbrowse/core/util/types'

// locals
import { PluginStoreModel } from '../model'

// lazies
const DeletePluginDialog = lazy(() => import('./DeletePluginDialog'))

const useStyles = makeStyles()(() => ({
  lockedPluginTooltip: {
    marginRight: '0.5rem',
  },
}))

function LockedPlugin() {
  const { classes } = useStyles()
  return (
    <Tooltip
      className={classes.lockedPluginTooltip}
      title="This plugin was installed by an administrator, you cannot remove it."
    >
      <LockIcon />
    </Tooltip>
  )
}

const InstalledPlugin = observer(function ({
  plugin,
  model,
}: {
  plugin: BasePlugin
  model: PluginStoreModel
}) {
  const [dialogPlugin, setDialogPlugin] = useState<string>()
  const { pluginManager } = getEnv(model)
  const session = getSession(model)
  const { jbrowse, adminMode } = session
  const isSessionPlugin = isSessionWithSessionPlugins(session)
    ? session.sessionPlugins?.some(
        p => pluginManager.pluginMetadata[plugin.name].url === p.url,
      )
    : false

  return (
    <>
      {dialogPlugin ? (
        <Suspense fallback={<React.Fragment />}>
          <DeletePluginDialog
            plugin={dialogPlugin}
            onClose={name => {
              if (name) {
                const pluginMetadata = pluginManager.pluginMetadata[plugin.name]

                if (adminMode) {
                  jbrowse.removePlugin(pluginMetadata)
                } else if (isSessionWithSessionPlugins(session)) {
                  session.removeSessionPlugin(pluginMetadata)
                }
              }
              setDialogPlugin(undefined)
            }}
          />
        </Suspense>
      ) : null}
      <ListItem key={plugin.name}>
        {adminMode || isSessionPlugin ? (
          <IconButton
            data-testid={`removePlugin-${plugin.name}`}
            onClick={() => setDialogPlugin(plugin.name)}
          >
            <CloseIcon />
          </IconButton>
        ) : (
          <LockedPlugin />
        )}
        <Typography>{plugin.name}</Typography>
      </ListItem>
    </>
  )
})

export default InstalledPlugin
