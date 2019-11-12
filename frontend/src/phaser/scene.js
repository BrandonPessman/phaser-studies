import Phaser from 'phaser'
import playerImage from '../assets/sprites/player.png'
import otherPlayerImage from '../assets/sprites/enemy.png'
import dotImage from '../assets/sprites/square_point.png'
import mappyData from '../assets/tiled/map.json'
import tilesetImage from '../assets/tileset/tileset-extruded.png'
import playerBulletImage from '../assets/sprites/player_bullet.png'

import io from 'socket.io-client'

const Player = require('./helper/Player')
const Experience = require('./helper/Experience')
const Movement = require('./helper/Movement')

class playGame extends Phaser.Scene {
  constructor () {
    super('PlayGame')
  }

  preload () {
    this.load.image('player', playerImage)
    this.load.image('otherPlayer', otherPlayerImage)
    this.load.image('dot', dotImage)
    this.load.image('playerBullet', playerBulletImage)

    // Load Map Data
    this.load.tilemapTiledJSON('mappy', mappyData)

    // Load Map Tileset
    this.load.image('terrain', tilesetImage)
  }

  create () {
    // Global Variables
    this.acceleration = 5
    this.deceleration = 1
    this.maxSpeed = 120

    // Keylisteners
    this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)
    this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S)
    this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)
    this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)

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
          Player.addPlayer.call(this, players[id])

          // Setting up Terrain
          let mappy = this.add.tilemap('mappy')

          let terrain = mappy.addTilesetImage('tileset-extruded', 'terrain')

          let terrainLayer = mappy
            .createStaticLayer('Tile Layer 1', [terrain], 0, 0)
            .setDepth(-1)

          this.physics.add.collider(this.player, terrainLayer)

          terrainLayer.setCollisionByProperty({ collides: true })

          this.playerChatText = this.add.text(16, 16, '', {
            fontSize: 'bold 12px Arial',
            fill: '#000'
          })
          this.playerNameText = this.add.text(16, 16, 'Braymen', {
            fontSize: 'bold 16px Arial',
            fill: '#000'
          })

          Player.updatePlayerName.call(this)
        } else {
          Player.addAnotherPlayer.call(this, players[id])
        }
      })
    })

    this.socket.on('currentDots', dots => {
      dots.forEach(dot => {
        Experience.addNewDot.call(this, dot)
      })
    })

    this.socket.on('playerMoved', playerInfo => {
      this.otherPlayers.children.each(function (otherPlayer) {
        if (playerInfo.playerId === otherPlayer.playerId) {
          otherPlayer.angle = playerInfo.rotation
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
      Player.addAnotherPlayer.call(this, playerInfo)
    })

    this.socket.on('disconnect', playerId => {
      this.otherPlayers.getChildren().forEach(otherPlayer => {
        if (playerId === otherPlayer.playerId) {
          otherPlayer.destroy()
        }
      })
    })

    this.socket.on('newDot', dot => {
      Experience.addNewDot.call(this, dot)
    })
  }

  update () {
    Movement.stoppedCheck.call(this)

    Movement.horizontalMovementCheck.call(this)

    Movement.verticalMovementCheck.call(this)

    Movement.rotationCheck.call(this)

    Movement.shootingCheck.call(this)
  }
}

export default playGame
