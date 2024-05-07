import { createBrowserRouter } from 'react-router-dom'

import App from '../App'
import { Home } from '../views/Home'
import { NotFound } from '../views/NotFound'
import { New } from '../views/New'
import { Profile } from '../views/Profile'

enum Route {
    ROOT = '/',
    HOME = '/home',
    NEW = '/new',
    PROFILE = '/profile',
    NOTFOUND = '*',
}

const publicRoutes = [
    {
        path: Route.HOME,
        element: <Home />,
    },
    {
        path: Route.ROOT,
        element: <Home />,
    },
    {
        path: Route.NEW,
        element: <New />,
    },
    {
        path: Route.PROFILE,
        element: <Profile />,
    },
    {
        path: Route.NOTFOUND,
        element: <NotFound />,
    },
]

const routes = [
    {
        path: Route.ROOT,
        element: <App />,
        children: [...publicRoutes],
    },
]

const router = createBrowserRouter(routes)

export { router, Route }
