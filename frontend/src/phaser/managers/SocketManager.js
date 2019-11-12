import io from 'socket.io-client'

const ExperienceManager = require('./ExperienceManager')
const PlayerManager = require('./PlayerManager')

exports.setup = function () {
  // Connecting the socket
  // this.socket = io('http://165.227.115.42:3000/')
  this.socket = io('localhost:3000')

  // Player Setup
  this.socket.on('currentPlayers', players => {
    Object.keys(players).forEach(id => {
      if (players[id].playerId === this.socket.id) {
        PlayerManager.addPlayer.call(this, players[id])

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

        PlayerManager.updatePlayerName.call(this)
      } else {
        PlayerManager.addAnotherPlayer.call(this, players[id])
      }
    })
  })

  this.socket.on('currentDots', dots => {
    dots.forEach(dot => {
      ExperienceManager.addNewDot.call(this, dot)
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
    PlayerManager.addAnotherPlayer.call(this, playerInfo)
  })

  this.socket.on('disconnect', playerId => {
    this.otherPlayers.getChildren().forEach(otherPlayer => {
      if (playerId === otherPlayer.playerId) {
        otherPlayer.destroy()
      }
    })
  })

  this.socket.on('newDot', dot => {
    ExperienceManager.addNewDot.call(this, dot)
  })
}
