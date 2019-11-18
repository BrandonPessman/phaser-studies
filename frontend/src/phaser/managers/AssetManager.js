import playerImage from '../../assets/sprites/test.png'
import otherPlayerImage from '../../assets/sprites/enemy.png'
import dotImage from '../../assets/sprites/square_point.png'
import mappyData from '../../assets/tiled/map.json'
import tilesetImage from '../../assets/tileset/tileset-extruded.png'
import playerBulletImage from '../../assets/sprites/player_bullet.png'

exports.loadAssets = function () {
  this.load.image('player', playerImage)
  this.load.image('otherPlayer', otherPlayerImage)
  this.load.image('dot', dotImage)
  this.load.image('playerBullet', playerBulletImage)
}

exports.setupMap = function () {
  // Load Map Data
  this.load.tilemapTiledJSON('mappy', mappyData)

  // Load Map Tileset
  this.load.image('terrain', tilesetImage)
}
