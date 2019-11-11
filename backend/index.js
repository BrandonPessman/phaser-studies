const express = require('express')
const app = express()

// HTTP Setup
const server = require('http').Server(app)
const io = require('socket.io').listen(server)

const players = {}
const dots = []
const MAX_DOTS = 10
let counter = 0

setInterval(() => {
  if (dots.length < MAX_DOTS) {
    var dot = {
      id: counter,
      x: Math.floor(Math.random() * 20 * 14) + 20,
      y: Math.floor(Math.random() * 20 * 14) + 20
    }

    dots.push(dot)

    io.sockets.emit('newDot', dot)
    counter++
  }
}, 5000)

io.on('connection', function (socket) {
  console.log('a user connected: ', socket.id)

  // Create a New Player and Add it
  players[socket.id] = {
    x: Math.floor(Math.random() * 20 * 14) + 20,
    y: Math.floor(Math.random() * 20 * 14) + 20,
    rotation: 0,
    playerId: socket.id
  }

  // Sends Current Players to New Player
  socket.emit('currentPlayers', players)

  // Sends Current Dots to New Player
  socket.emit('currentDots', dots)

  // Tell all Other Players of New Player
  socket.broadcast.emit('newPlayer', players[socket.id])

  // Disconnect a Player when Disconnected
  socket.on('disconnect', function () {
    console.log('user disconnected: ', socket.id)
    delete players[socket.id]
    // Tell all other Players they Disconnected
    io.emit('disconnect', socket.id)
  })

  // On Player Movement
  socket.on('playerMovement', function (movementData) {
    players[socket.id].x = movementData.x
    players[socket.id].y = movementData.y
    players[socket.id].rotation = movementData.rotation
    players[socket.id].flipX = movementData.flipX

    // Tell all Players a Player Moved
    socket.broadcast.emit('playerMoved', players[socket.id])
  })

  socket.on('removeDot', dot => {
    for (let i = 0; i < dots.length; i++) {
      if (dots[i].x == dot.x && dots[i].y == dot.y) {
        dots.splice(i, 1)

        // Send Dot that was removed
        socket.broadcast.emit('playerCollectedDot', dot)
      }
    }
  })
})

server.listen(process.env.PORT || 3000, () => {
  console.log(`Server started on port ${process.env.PORT || 3000}`)
})
