/* eslint-env jest */
const mongoose = require('mongoose')
const request = require('supertest')
const app = require('../app')
const Blog = require('../models/blog')

const initialBlogs = [
  {
    title: 'HTML is easy',
    author: 'David',
    url: 'www.david.com',
    likes: 3
  },
  {
    title: 'Browser can execute only Javascript',
    author: 'Meloncia',
    url: 'www.meloncia.com',
    likes: 5
  }
]

const newBlog = {
  title: 'I am learning Test with Jest',
  author: 'David',
  url: 'www.david.com',
  likes: 3
}

beforeEach(async () => {
  await Blog.deleteMany({})
  let blogObject = new Blog(initialBlogs[0])
  await blogObject.save()
  blogObject = new Blog(initialBlogs[1])
  await blogObject.save()
})

test('it should get all blogs', async () => {
  const response = await request(app).get('/api/blogs')
    .expect('Content-Type', /json/)
    .expect(200)
  expect(response.body).toHaveLength(initialBlogs.length)
})

test('it should check that the blog has a id property', async () => {
  const response = await request(app).get('/api/blogs')
    .expect('Content-Type', /json/)
    .expect(200)

  response.body.forEach(blog => {
    expect(blog.id).toBeDefined()
  })
})

test('it should to create a new blog', async () => {
  await request(app).post('/api/blogs')
    .send(newBlog)
    .set('Accept', 'application/json')
    .expect(201)

  const response = await request(app).get('/api/blogs')
    .expect('Content-Type', /json/)
    .expect(200)
  expect(response.body).toHaveLength(initialBlogs.length + 1)
})

afterAll(async () => {
  await mongoose.connection.close()
})
