import Phaser from 'phaser'

const Player = require('./Player')

exports.stoppedCheck = function () {
  if (this.player != null) {
    // this.player.body.setVelocity(this.player.body - 10)
    if (this.player.body.velocity.x > 0) {
      this.player.body.setVelocityX(
        Math.max(this.player.body.velocity.x - this.deceleration, 0)
      )
    } else if (this.player.body.velocity.x < 0) {
      this.player.body.setVelocityX(
        Math.min(this.player.body.velocity.x + this.deceleration, 0)
      )
    }

    if (this.player.body.velocity.y > 0) {
      this.player.body.setVelocityY(
        Math.max(this.player.body.velocity.y - this.deceleration, 0)
      )
    } else if (this.player.body.velocity.y < 0) {
      this.player.body.setVelocityY(
        Math.min(this.player.body.velocity.y + this.deceleration, 0)
      )
    }
  }
}

exports.horizontalMovementCheck = function () {
  // Horizontal movement
  if (this.aKey.isDown) {
    this.player.body.setVelocityX(
      Math.max(this.player.body.velocity.x - this.acceleration, -this.maxSpeed)
    )
    Player.sendPlayerMovement.call(this)
  } else if (this.dKey.isDown) {
    this.player.body.setVelocityX(
      Math.min(this.player.body.velocity.x + this.acceleration, this.maxSpeed)
    )
    Player.sendPlayerMovement.call(this)
  }
}

exports.verticalMovementCheck = function () {
  // Vertical movement
  if (this.wKey.isDown) {
    this.player.body.setVelocityY(
      Math.max(this.player.body.velocity.y - this.acceleration, -this.maxSpeed)
    )
    Player.sendPlayerMovement.call(this)
  } else if (this.sKey.isDown) {
    this.player.body.setVelocityY(
      Math.min(this.player.body.velocity.y + this.acceleration, this.maxSpeed)
    )
    Player.sendPlayerMovement.call(this)
  }
}

exports.rotationCheck = function () {
  if (this.player != null) {
    var rad = Phaser.Math.Angle.Between(
      this.player.x,
      this.player.y,
      this.game.input.mousePointer.worldX,
      this.game.input.mousePointer.worldY
    )
    var deg = rad * (180 / Math.PI)
    Player.rotateTowardsMouse.call(this, deg)
    Player.updatePlayerName.call(this)
  }
}

exports.shootingCheck = function () {
  if (this.cursors.space.isDown) {
    // Player.addPlayerBullet.call(this, 1)
  }
}
