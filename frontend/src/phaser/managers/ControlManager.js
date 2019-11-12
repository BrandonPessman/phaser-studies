exports.setup = function () {
  // Keylisteners
  this.wKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W)
  this.sKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S)
  this.aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)
  this.dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)

  // Setting up Input Listening
  this.cursors = this.input.keyboard.createCursorKeys()
}
