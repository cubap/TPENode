import { Router } from 'express'
import middlewares from './middlewares/index.js'
const route = Router()

export default (app) => {
  app.use('/users', route)

  route.get('/geti', middlewares.isAuth, middlewares.attachCurrentUser, (req, res) => {
    return res.json({ user: req.currentUser }).status(200)
  })
}