import { Hono } from 'hono'
import auth from './auth'

const routes = new Hono()

// Mount auth routes
routes.route('/auth', auth)

export default routes
