import { Router } from 'express'
const route = Router()

export default (app) => {

  app.set("view engine", "pug")
  app.set("views", "./_pages")
  app.get('/', (req, res) => {
    res.render("index")
  })
  app.get('/login', (req, res) => {
    res.render("signup")
  })
}
