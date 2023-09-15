import express, { NextFunction, Request, Response } from 'express'
import path from 'path'
import dotenv from 'dotenv'

import ondcRoutes from './routes/ondc.routes'
import logger from './lib/logger'

dotenv.config({ path: path.resolve(__dirname, '../.env') })
const app = express()

app.use((req: Request, res: Response, next: NextFunction) => {
  const startTime = Date.now()
  res.on('finish', () => {
    const endTime = Date.now()
    const timeTaken = endTime - startTime
    logger.info(
      `${req.method} ${req.originalUrl} ${res.statusCode} - ${timeTaken}ms req_body: ${JSON.stringify(
        req.body,
        null,
        2,
      )}`,
    )
  })
  next()
})

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
// parse application/json

// app.use(cookieParser())
app.use(express.static(path.join(__dirname, 'public')))
app.get('/api-check', (_req: Request, res: Response) => {
  const responseMessage = {
    status: true,
    message: 'The server is up and running. Keep up the great work, developers!',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  }
  res.json(responseMessage)
})
// Application REST APIs
app.use(
  '/api',
  // cors(corsOptionsDelegate),
  ondcRoutes,
)
app.use(express.json({ limit: '50mb' }))
app.use(express.urlencoded({ limit: '50mb' }))

// app.disable('etag')

// Error handler
app.use(function (err: any, _req: Request, res: Response, _next: NextFunction) {
  // Send response status based on custom error code
  if (err.status) {
    res.status(err.status).json({ error: err.message })
  }

  res.status(500).json({ error: 'Something went wrong. Please try again' })
})

const PORT = process.env.PORT || '3002'

app.listen(PORT, () => {
  console.log(`server started on port : ${PORT}`)
})
