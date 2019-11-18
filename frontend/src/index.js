import Phaser from 'phaser'
import React from 'react'
import ReactDOM from 'react-dom'
import App from './components/App.jsx'
import playGame from './phaser/scene'

// console.log(App);

export const config = {
  type: Phaser.AUTO,
  parent: 'phaser',
  width: '100%',
  height: '100%',
  scene: playGame,
  pixelArt: false,
  physics: {
    default: 'arcade',
    arcade: {
      debug: true
    }
  }
}

const game = new Phaser.Game(config)

ReactDOM.render(
  <App />,
  document.getElementById('root') || document.createElement('div')
)
