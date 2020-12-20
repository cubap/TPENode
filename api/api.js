import routes from './routes/index.js'
import express from 'express'

const app = express()

export default()=>{
    routes(app)
        
    return app
}