exports.addPlayer = function (playerInfo) {
  this.player = this.physics.add.sprite(playerInfo.x, playerInfo.y, 'player')

  // Camera Setup
  var camera = this.cameras.main
  camera.zoom = 1
  camera.startFollow(this.player)
  camera.roundPixels = true

  camera.fadeIn(2000)

  this.player.setOrigin(0.3, 0.5)
}

exports.sendPlayerMovement = function () {
  exports.updatePlayerName.call(this)
  this.socket.emit('playerMovement', {
    x: this.player.x,
    y: this.player.y,
    rotation: this.player.angle
  })
}

exports.rotateTowardsMouse = function (deg) {
  this.player.angle = deg
  exports.sendPlayerMovement.call(this)
}

exports.updatePlayerName = function () {
  // Update Name Text
  this.playerChatText.setX(this.player.x - this.playerChatText.width / 2.0)
  this.playerChatText.setY(this.player.y - 30)

  this.playerNameText.setX(this.player.x - this.playerNameText.width / 2.0)
  this.playerNameText.setY(this.player.y + 20)
}

exports.addAnotherPlayer = function (playerInfo) {
  const otherPlayer = this.add.sprite(playerInfo.x, playerInfo.y, 'otherPlayer')
  otherPlayer.angle = playerInfo.rotation
  otherPlayer.playerId = playerInfo.playerId
  this.otherPlayers.add(otherPlayer)
}

exports.addPlayerBullet = function () {
  let currentTime = new Date()

  if (currentTime - this.lastShotTime > this.gunDelay) {
    var bullet = this.physics.add
      .sprite(this.player.x, this.player.y, 'playerBullet')
      .setDepth(-1)

    this.physics.moveTo(
      bullet,
      this.game.input.mousePointer.worldX,
      this.game.input.mousePointer.worldY,
      null,
      1000
    )

    this.lastShotTime = new Date()
  }
}
