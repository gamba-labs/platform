import Phaser from 'phaser';
import MainScene from './src/scenes/MainScene';

const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game',
    scene: [MainScene]
};

new Phaser.Game(config);