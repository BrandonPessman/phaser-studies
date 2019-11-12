exports.addNewDot = function (dot) {
  var newDot = this.add.sprite(dot.x, dot.y, 'dot')
  newDot.id = dot.id
  this.dots.add(newDot)

  // Adds collision between player and dots
  this.physics.add.collider(this.player, this.dots, (player, dot) => {
    this.socket.emit('removeDot', dot)
    dot.destroy()
  })
}
