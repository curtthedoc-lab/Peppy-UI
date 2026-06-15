import React from 'react'
import { 
  createRouter, 
  createRoute, 
  createRootRoute, 
  RouterProvider 
} from '@tanstack/react-router'
import { SharedLayout } from './components/SharedLayout'
import { Dashboard } from './pages/Dashboard'
import { Calculator } from './pages/Calculator'
import { Log } from './pages/Log'
import { SiteTracker } from './pages/SiteTracker'
import { Library } from './pages/Library'
import { PeptideDetail } from './pages/PeptideDetail'
import { Macros } from './pages/Macros'
import { Settings } from './pages/Settings'

const rootRoute = createRootRoute({
  component: SharedLayout,
})

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: Dashboard,
})

const calculatorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/calculator',
  component: Calculator,
})

const logRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/log',
  component: Log,
})

const siteTrackerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sites',
  component: SiteTracker,
})

const libraryRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/library',
  component: Library,
})

const peptideDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/library/$id',
  component: PeptideDetail,
})

const macrosRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/macros',
  component: Macros,
})

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: Settings,
})

const routeTree = rootRoute.addChildren([
  indexRoute,
  calculatorRoute,
  logRoute,
  siteTrackerRoute,
  libraryRoute,
  peptideDetailRoute,
  macrosRoute,
  settingsRoute,
])

const router = createRouter({ routeTree })

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router
  }
}

export default function App() {
  return <RouterProvider router={router} />
}
