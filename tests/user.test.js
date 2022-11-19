/* eslint-env jest */
const bcrypt = require('bcrypt')
const mongoose = require('mongoose')
const request = require('supertest')
const app = require('../app')
const User = require('../models/user')
const helper = require('./test_helper')

describe('when there is initially one user in db', () => {
  beforeEach(async () => {
    await User.deleteMany({})

    const passwordHash = await bcrypt.hash('sekret', 10)
    const user = new User({ username: 'root', passwordHash })

    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'mluukkai',
      name: 'Matti Luukkainen',
      password: 'salainen'
    }

    await request(app)
      .post('/api/users')
      .send(newUser)
      .expect(200)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen'
    }

    const result = await request(app)
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    expect(result.body.error).toContain('`username` to be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd).toHaveLength(usersAtStart.length)
  })

  test('it should to return status 400, username have not 3 characters', async () => {
    const user = {
      username: 'hi',
      password: 'bye'
    }

    const result = await request(app)
      .post('/api/login')
      .send(user)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    expect(result.body.error).toContain('must have a minimum of 3 characters')
  })

  test('it should to return status 400, password have not 3 characters', async () => {
    const user = {
      username: 'david',
      password: 'by'
    }

    const result = await request(app)
      .post('/api/login')
      .send(user)
      .expect(400)
      .expect('Content-Type', /application\/json/)
    expect(result.body.error).toContain('must have a minimum of 3 characters')
  })
})

afterAll(async () => {
  await mongoose.connection.close()
})
