// app.js
import express from 'express'
import morgan from 'morgan'
import path from 'path'
import cors from 'cors'
import { fileURLToPath } from 'url'
import catchError from './Utils/catchError.js'
import { addClient } from './sse.js' // 👈 جدید

const __filename = fileURLToPath(import.meta.url)
export const __dirname = path.dirname(__filename)

const app = express()
app.use(morgan('dev'))
app.use(cors())
app.use(express.json())


app.get('/events', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream')
  res.setHeader('Cache-Control', 'no-cache')
  res.setHeader('Connection', 'keep-alive')
  res.flushHeaders()

  addClient(res)
})

app.use(catchError)

export default app
