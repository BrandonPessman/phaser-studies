import Phaser from 'phaser'
import playerImage from '../assets/square-blue.png'
import otherPlayerImage from '../assets/square-red.png'
import dotImage from '../assets/Ecu.png'
import mappyData from '../assets/maps/map.json'
import tilesetImage from '../assets/tilesets/terrain_shapestorm-extruded.png'

import io from 'socket.io-client'

class playGame extends Phaser.Scene {
  constructor () {
    super('PlayGame')
  }

  preload () {
    this.load.image('player', playerImage)
    this.load.image('otherPlayer', otherPlayerImage)
    this.load.image('dot', dotImage)

    // Load Map Data
    this.load.tilemapTiledJSON('mappy', mappyData)
    
    // Load Map Tileset
    this.load.image("terrain", tilesetImage)
  }

  create () {
   // Setting up Input Listening
    this.cursors = this.input.keyboard.createCursorKeys()

    // Group of other Players
    this.otherPlayers = this.physics.add.group()

    // Group of dots
    this.dots = this.physics.add.group()

    // Connecting the socket
    this.socket = io('http://165.227.115.42:3000/')
    
    // this.socket = io('localhost:3000')

    // Player Setup
    this.socket.on('currentPlayers', players => {
      Object.keys(players).forEach(id => {
        if (players[id].playerId === this.socket.id) {
          addPlayer.call(this, players[id])

          let mappy = this.add.tilemap('mappy')

          let terrain = mappy.addTilesetImage("terrain_shapestorm-extruded", "terrain")
      
          let terrainLayer = mappy.createStaticLayer("Tile Layer 1", [terrain], 0, 0).setDepth(-1)
          
          this.physics.add.collider(this.player, terrainLayer);

          terrainLayer.setCollisionByProperty({collides: true})
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

    this.socket.on('playerCollectedDot', info => {
      this.dots.children.each(function (dot) {
        if (info.x == dot.x && info.y == dot.y) {
          dot.destroy()
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
  this.player.setCollideWorldBounds(true)
  // Camera Setup
  var camera = this.cameras.main
  camera.zoom = 2
  camera.startFollow(this.player)
  camera.roundPixels = true;
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
