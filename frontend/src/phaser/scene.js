import Phaser from 'phaser'

const MovementManager = require('./managers/MovementManager')
const SocketManager = require('./managers/SocketManager')
const AssetManager = require('./managers/AssetManager')
const ControlManager = require('./managers/ControlManager')

class playGame extends Phaser.Scene {
  constructor () {
    super('PlayGame')
  }

  preload () {
    AssetManager.loadAssets.call(this)
    AssetManager.setupMap.call(this)
  }

  create () {
    // Global Variables
    this.acceleration = 5
    this.deceleration = 1
    this.maxSpeed = 120
    this.lastShotTime = 0
    this.gunDelay = 1000

    // Group of other Players
    this.otherPlayers = this.physics.add.group()

    // Group of dots
    this.dots = this.physics.add.group()

    ControlManager.setup.call(this)

    SocketManager.setup.call(this)
  }

  update () {
    MovementManager.stoppedCheck.call(this)

    MovementManager.horizontalMovementCheck.call(this)

    MovementManager.verticalMovementCheck.call(this)

    MovementManager.rotationCheck.call(this)

    MovementManager.shootingCheck.call(this)
  }
}

export default playGame
