const jwt = require('jsonwebtoken')
const blogRoutes = require('express').Router()
const Blog = require('../models/blog')
const User = require('../models/user')
const middleware = require('../utils/middleware')

blogRoutes.get('/:id?', async (request, response) => {
  const query = {}
  if (request.params.id) query._id = request.params.id
  const blogs = await Blog.find(query).populate('user', { username: 1, name: 1 })

  if (query._id && blogs.length === 0) {
    response.status(404).end()
  } else {
    response.json(blogs)
  }
})

blogRoutes.post('/', middleware.tokenExtractor, async (request, response) => {
  const body = request.body
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!request.token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  const user = await User.findById(decodedToken.id)

  if (user === null) {
    return response.status(404).json({ error: 'User not found in DB' })
  }
  body.user = user._id

  const blog = new Blog(body)
  const savedBlog = await blog.save()
  user.blogs = user.blogs.concat(savedBlog._id)
  await user.save()
  response.status(201).json(savedBlog)
})

blogRoutes.delete('/:id', middleware.tokenExtractor, async (request, response) => {
  const decodedToken = jwt.verify(request.token, process.env.SECRET)
  if (!request.token || !decodedToken.id) {
    return response.status(401).json({ error: 'token missing or invalid' })
  }
  const blog = await Blog.findById(request.params.id)
  if (blog === null) {
    return response.status(404).json({ error: 'blog not found' })
  }
  if (blog.user.toString() !== decodedToken.id) {
    return response.status(401).json({ error: 'User not authorize' })
  }

  const result = await Blog.findByIdAndDelete(request.params.id)
  response.status(204).json(result)
})

blogRoutes.put('/:id', middleware.tokenExtractor, async (request, response) => {
  const id = request.params.id
  const update = request.body
  const result = await Blog.findByIdAndUpdate(id, update, { new: true })
  if (result === null) {
    return response.status(404).end()
  }
  response.status(200).json(result)
})

module.exports = blogRoutes
