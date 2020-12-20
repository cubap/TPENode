import auth from './auth.js'
import user from './user.js'

// guaranteed to get dependencies
export default (app) => {
	auth(app)
    user(app)

	return app
}