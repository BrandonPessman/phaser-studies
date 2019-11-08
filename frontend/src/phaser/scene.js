import Phaser from 'phaser'
import playerImage from '../assets/square-blue.png'
import otherPlayerImage from '../assets/square-red.png'
import dotImage from '../assets/circle-yellow.png'

import io from 'socket.io-client'

class playGame extends Phaser.Scene {
  constructor () {
    super('PlayGame')
  }

  preload () {
    this.load.image('player', playerImage)
    this.load.image('otherPlayer', otherPlayerImage)
    this.load.image('dot', dotImage)
  }

  create () {
    // Setting up Input Listening
    this.cursors = this.input.keyboard.createCursorKeys()

    // Group of other Players
    this.otherPlayers = this.physics.add.group()

    // Group of dots
    this.dots = this.physics.add.group()

    // Connecting the socket
    // this.socket = io('http://165.227.115.42:3000/')
    this.socket = io('localhost:3000')

    // Player Setup
    this.socket.on('currentPlayers', players => {
      Object.keys(players).forEach(id => {
        if (players[id].playerId === this.socket.id) {
          addPlayer.call(this, players[id])
        } else {
          addAnotherPlayer.call(this, players[id])
        }
      })
    })

    this.socket.on('currentDots', dots => {
      dots.forEach(dot => {
        addNewDot.call(this, dot)
      })
    })

    this.socket.on('playerMoved', playerInfo => {
      this.otherPlayers.children.each(function (otherPlayer) {
        if (playerInfo.playerId === otherPlayer.playerId) {
          otherPlayer.setRotation(playerInfo.rotation)
          otherPlayer.setPosition(playerInfo.x, playerInfo.y)
        }
      })
    })

    this.socket.on('newPlayer', playerInfo => {
      addAnotherPlayer.call(this, playerInfo)
    })

    this.socket.on('disconnect', playerId => {
      this.otherPlayers.getChildren().forEach(otherPlayer => {
        if (playerId === otherPlayer.playerId) {
          otherPlayer.destroy()
        }
      })
    })

    this.socket.on('newDot', dot => {
      addNewDot.call(this, dot)
    })
  }

  update () {
    // Velocity Reset
    if (this.player != null) {
      this.player.body.setVelocity(0)
    }

    // Horizontal movement
    if (this.cursors.left.isDown) {
      this.player.body.setVelocityX(-80)
      sendPlayerMovement.call(this)
    } else if (this.cursors.right.isDown) {
      this.player.body.setVelocityX(80)
      sendPlayerMovement.call(this)
    }

    // Vertical movement
    if (this.cursors.up.isDown) {
      this.player.body.setVelocityY(-80)
      sendPlayerMovement.call(this)
    } else if (this.cursors.down.isDown) {
      this.player.body.setVelocityY(80)
      sendPlayerMovement.call(this)
    }
  }
}

function addAnotherPlayer (playerInfo) {
  const otherPlayer = this.add.sprite(playerInfo.x, playerInfo.y, 'otherPlayer')
  otherPlayer.playerId = playerInfo.playerId
  this.otherPlayers.add(otherPlayer)
}

function addPlayer (playerInfo) {
  this.player = this.physics.add.sprite(playerInfo.x, playerInfo.y, 'player')
}

function sendPlayerMovement () {
  this.socket.emit('playerMovement', {
    x: this.player.x,
    y: this.player.y,
    rotation: this.player.rotation
  })
}

function addNewDot (dot) {
  var newDot = this.add.sprite(dot.x, dot.y, 'dot')
  newDot.id = dot.id
  this.dots.add(newDot)

  // Adds collision between player and dots
  this.physics.add.collider(this.player, this.dots, (player, dot) => {
    console.log(dot)
    this.socket.emit('removeDot', dot)
    dot.destroy()
  })
}

export default playGame
