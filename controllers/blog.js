const blogRoutes = require('express').Router()
const Blog = require('../models/blog')

blogRoutes.get('/:id?', async (request, response) => {
  const query = {}
  if (request.params.id) query._id = request.params.id
  const blogs = await Blog.find(query)

  if (blogs.length === 0) {
    response.status(404).end()
  } else {
    response.json(blogs)
  }
})

blogRoutes.post('/', async (request, response) => {
  const blog = new Blog(request.body)
  const result = await blog.save()
  response.status(201).json(result)
})

blogRoutes.delete('/:id', async (request, response) => {
  const result = await Blog.findByIdAndDelete(request.params.id)
  if (result === null) {
    response.status(404).end()
  } else {
    response.status(204).json(result)
  }
})

blogRoutes.put('/:id', async (request, response) => {
  const id = request.params.id
  const update = request.body
  const result = await Blog.findByIdAndUpdate(id, update, { new: true })
  if (result === null) {
    response.status(404).end()
  } else {
    response.status(200).json(result)
  }
})

module.exports = blogRoutes
