import React, { lazy, useEffect, useState, Suspense } from 'react'
import { observer } from 'mobx-react'
import { ErrorBoundary } from 'react-error-boundary'
import {
  StringParam,
  QueryParamProvider,
  useQueryParam,
} from 'use-query-params'
import { WindowHistoryAdapter } from 'use-query-params/adapters/window'
import { FatalErrorDialog, LoadingEllipses } from '@jbrowse/core/ui'
import '@fontsource/roboto'

// locals
import Loading from './Loading'
import JBrowse from './JBrowse'
import factoryReset from '../factoryReset'
import SessionLoader, {
  SessionLoaderModel,
  SessionTriagedInfo,
} from '../SessionLoader'
import StartScreenErrorMessage from './StartScreenErrorMessage'
import PluginManager from '@jbrowse/core/PluginManager'
import { createPluginManager } from '../createPluginManager'

const ConfigWarningDialog = lazy(() => import('./ConfigWarningDialog'))
const SessionWarningDialog = lazy(() => import('./SessionWarningDialog'))
const StartScreen = lazy(() => import('./StartScreen'))

export function Loader({
  initialTimestamp = Date.now(),
}: {
  initialTimestamp?: number
}) {
  // return value if defined, else convert null to undefined for use with
  // types.maybe
  const load = (param: string | null | undefined) =>
    param === null ? undefined : param

  const Str = StringParam

  const [config] = useQueryParam('config', Str)
  const [session] = useQueryParam('session', Str)
  const [adminKey] = useQueryParam('adminKey', Str)
  const [password, setPassword] = useQueryParam('password', Str)
  const [loc, setLoc] = useQueryParam('loc', Str)
  const [sessionTracks, setSessionTracks] = useQueryParam('sessionTracks', Str)
  const [assembly, setAssembly] = useQueryParam('assembly', Str)
  const [tracks, setTracks] = useQueryParam('tracks', Str)

  const loader = SessionLoader.create({
    configPath: load(config),
    sessionQuery: load(session),
    password: load(password),
    adminKey: load(adminKey),
    loc: load(loc),
    assembly: load(assembly),
    tracks: load(tracks),
    sessionTracks: load(sessionTracks),
    initialTimestamp,
  })

  useEffect(() => {
    setLoc(undefined, 'replaceIn')
    setTracks(undefined, 'replaceIn')
    setAssembly(undefined, 'replaceIn')
    setPassword(undefined, 'replaceIn')
    setSessionTracks(undefined, 'replaceIn')
  }, [setAssembly, setLoc, setTracks, setPassword, setSessionTracks])

  return <Renderer loader={loader} />
}

const SessionTriaged = observer(function ({
  sessionTriaged,
  loader,
}: {
  loader: SessionLoaderModel
  sessionTriaged: SessionTriagedInfo
}) {
  return (
    <Suspense fallback={<React.Fragment />}>
      {sessionTriaged?.origin === 'session' ? (
        <SessionWarningDialog
          loader={loader}
          handleClose={() => loader.setSessionTriaged(undefined)}
        />
      ) : (
        <ConfigWarningDialog
          loader={loader}
          handleClose={() => loader.setSessionTriaged(undefined)}
        />
      )}
    </Suspense>
  )
})

const PluginManagerLoaded = observer(function ({
  pluginManager,
}: {
  pluginManager: PluginManager
}) {
  const { rootModel } = pluginManager
  return !rootModel?.session ? (
    <Suspense fallback={<LoadingEllipses />}>
      <StartScreen rootModel={rootModel} onFactoryReset={factoryReset} />
    </Suspense>
  ) : (
    <JBrowse pluginManager={pluginManager} />
  )
})

const Renderer = observer(function ({
  loader,
}: {
  loader: SessionLoaderModel
}) {
  const { configError, ready, sessionTriaged } = loader
  const [pluginManager, setPluginManager] = useState<PluginManager>()
  const [error, setError] = useState<unknown>()

  useEffect(() => {
    let pm: PluginManager | undefined
    try {
      if (!ready) {
        return
      }
      pm = createPluginManager(loader)
      setPluginManager(pm)
    } catch (e) {
      console.error(e)
      setError(e)
    }
  }, [loader, ready])

  const err = configError || error
  if (err) {
    return <StartScreenErrorMessage error={err} />
  } else if (sessionTriaged) {
    return <SessionTriaged loader={loader} sessionTriaged={sessionTriaged} />
  } else if (pluginManager) {
    return <PluginManagerLoaded pluginManager={pluginManager} />
  } else {
    return <Loading />
  }
})

function LoaderWrapper({ initialTimestamp }: { initialTimestamp: number }) {
  return (
    <ErrorBoundary
      FallbackComponent={props => (
        <FatalErrorDialog
          {...props}
          resetButtonText="Reset Session"
          onFactoryReset={factoryReset}
        />
      )}
    >
      <QueryParamProvider adapter={WindowHistoryAdapter}>
        <Loader initialTimestamp={initialTimestamp} />
      </QueryParamProvider>
    </ErrorBoundary>
  )
}

export default LoaderWrapper
