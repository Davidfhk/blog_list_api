const express = require('express')
const cors = require('cors')
const morgan = require('morgan')
const app = require('./app')
const config = require('./utils/config')

morgan.token('body', req => {
  return JSON.stringify(req.body)
})
app.use(morgan(':method :url :status :res[content-length] :response-time :body'))
app.use(cors())
app.use(express.json())

app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`)
})
