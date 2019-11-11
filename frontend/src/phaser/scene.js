import Phaser from 'phaser'
import playerImage from '../assets/sprites/player.png'
import otherPlayerImage from '../assets/sprites/enemy.png'
import dotImage from '../assets/sprites/square_point.png'
import mappyData from '../assets/tiled/map.json'
import tilesetImage from '../assets/tileset/tileset-extruded.png'

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
    // Global Variables
    this.acceleration = 5;
    this.deceleration = 1;
    this.maxSpeed = 120;
    
    // Setting up Input Listening
    this.cursors = this.input.keyboard.createCursorKeys()

    // Group of other Players
    this.otherPlayers = this.physics.add.group()

    // Group of dots
    this.dots = this.physics.add.group()

    // Connecting the socket
    this.socket = io('http://165.227.115.42:3000/')
    //this.socket = io('localhost:3000')

    // Player Setup
    this.socket.on('currentPlayers', players => {
      Object.keys(players).forEach(id => {
        if (players[id].playerId === this.socket.id) {
          addPlayer.call(this, players[id])

          // Setting up Terrain
          let mappy = this.add.tilemap('mappy')

          let terrain = mappy.addTilesetImage("tileset-extruded", "terrain")
      
          let terrainLayer = mappy.createStaticLayer("Tile Layer 1", [terrain], 0, 0).setDepth(-1)
          
          this.physics.add.collider(this.player, terrainLayer);

          terrainLayer.setCollisionByProperty({collides: true})

          this.playerChatText = this.add.text(16, 16, '', { fontSize: 'bold 12px Arial', fill: '#000'});
          this.playerNameText = this.add.text(16, 16, 'Braymen', { fontSize: 'bold 16px Arial', fill: '#000'});
 
          updatePlayerName.call(this)
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
      //this.player.body.setVelocity(this.player.body - 10)
      if (this.player.body.velocity.x > 0) {
        this.player.body.setVelocityX(Math.max(this.player.body.velocity.x - this.deceleration, 0))
      } else if (this.player.body.velocity.x < 0) {
        this.player.body.setVelocityX(Math.min(this.player.body.velocity.x + this.deceleration, 0))
      }

      if (this.player.body.velocity.y > 0) {
        this.player.body.setVelocityY(Math.max(this.player.body.velocity.y - this.deceleration, 0))
      } else if (this.player.body.velocity.y < 0) {
        this.player.body.setVelocityY(Math.min(this.player.body.velocity.y + this.deceleration, 0))
      }

      var rad = Phaser.Math.Angle.Between(this.player.x, this.player.y, this.game.input.mousePointer.worldX, this.game.input.mousePointer.worldY)
      var deg = rad * (180/Math.PI)
      rotateTowardsMouse.call(this, deg)
      updatePlayerName.call(this)
  }

    // Horizontal movement
    if (this.cursors.left.isDown) {
      this.player.body.setVelocityX(Math.max(this.player.body.velocity.x - this.acceleration, -this.maxSpeed))
      sendPlayerMovement.call(this)
    } else if (this.cursors.right.isDown) {
      this.player.body.setVelocityX(Math.min(this.player.body.velocity.x + this.acceleration, this.maxSpeed))
      sendPlayerMovement.call(this)
    }

    // Vertical movement
    if (this.cursors.up.isDown) {
      
      this.player.body.setVelocityY(Math.max(this.player.body.velocity.y - this.acceleration, -this.maxSpeed))
      sendPlayerMovement.call(this)
    } else if (this.cursors.down.isDown) {
      this.player.body.setVelocityY(Math.min(this.player.body.velocity.y + this.acceleration, this.maxSpeed))
      sendPlayerMovement.call(this)
    }


  }
}

function updatePlayerName() {
      // Update Name Text
      this.playerChatText.setX(this.player.x - (this.playerChatText.width / 2.0))
      this.playerChatText.setY(this.player.y - 30)

      this.playerNameText.setX(this.player.x - (this.playerNameText.width / 2.0))
      this.playerNameText.setY(this.player.y + 20)
}

function addAnotherPlayer (playerInfo) {
  const otherPlayer = this.add.sprite(playerInfo.x, playerInfo.y, 'otherPlayer')
  otherPlayer.playerId = playerInfo.playerId
  this.otherPlayers.add(otherPlayer)
}

function addPlayer (playerInfo) {
  this.player = this.physics.add.sprite(playerInfo.x, playerInfo.y, 'player')
  //this.player.setCollideWorldBounds(true)
  // Camera Setup
  var camera = this.cameras.main
  camera.zoom = 1
  camera.startFollow(this.player)
  camera.roundPixels = true;

  camera.fadeIn(2000);

  this.player.setOrigin(.3, .5)
}

function sendPlayerMovement () {
  updatePlayerName.call(this)
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
    this.socket.emit('removeDot', dot)
    dot.destroy()
  })
}

function rotateTowardsMouse (deg) {
  this.player.angle = deg;
}

export default playGame
