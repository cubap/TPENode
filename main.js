import config from './config/index.js'
import app from './express.js'

async function startServer(port) {
  
    app.listen(config.port, () => {
        console.log(`Example app listening at http://localhost:${port}`)
    })
}

startServer(config.port)