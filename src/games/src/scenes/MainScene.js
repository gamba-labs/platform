import Phaser from 'phaser';
import Animations from './Animations';

export default class MainScene extends Phaser.Scene {
    constructor() {
        super('MainScene');
        this.characters = [];
        this.gameOver = false;
        this.specialAnimationProbability = 0.5; // Default value, can be changed
    }

    preload() {
        this.load.image('background', 'src/assets/sprites/bg.jpg');
        this.load.image('character1', 'src/assets/sprites/mcD.png');
        this.load.image('character2', 'src/assets/sprites/dragon.png');
        this.load.image('character3', 'src/assets/sprites/ape.png');
        this.load.image('character4', 'src/assets/sprites/wizard.png');
        this.load.image('banana', 'src/assets/sprites/banana.png');
        this.load.image('phone', 'src/assets/sprites/phone.png');
        this.load.image('fire', 'src/assets/sprites/fire.png');
        this.load.image('frog', 'src/assets/sprites/frog.png');
    }

    create() {
        this.animations = new Animations(this, this.specialAnimationProbability);

        const background = this.add.image(0, 0, 'background');
        background.setOrigin(0, 0);
        background.displayWidth = this.sys.game.config.width;
        background.displayHeight = this.sys.game.config.height;

        const characterData = [
            { key: 'character1', name: 'McD' },
            { key: 'character2', name: 'Dragon' },
            { key: 'character3', name: 'Ape' },
            { key: 'character4', name: 'Wizard' }
        ];

        const winnerIndex = Phaser.Math.Between(0, characterData.length - 1);
        characterData.forEach((char, index) => {
            char.distance = index === winnerIndex ? 100 : Phaser.Math.Between(0, 99);
        });

        characterData.sort((a, b) => a.distance - b.distance);

        characterData.forEach((char, index) => {
            const yPosition = 150 + index * 100;
            const character = this.add.image(100, yPosition, char.key);
            character.setScale(0.125);
            character.name = char.name;
            character.distance = char.distance;
            character.initialX = 100;
            character.finalX = this.calculateFinalX(char.distance);
            character.speed = Phaser.Math.FloatBetween(0.5, 1.5);
            this.characters.push(character);

            if (char.name === 'Ape' && char.distance !== 100) {
                const banana = this.add.image(character.finalX, yPosition + 30, 'banana');
                banana.setScale(0.05);
                banana.setVisible(false);
                character.banana = banana;
            }
        });

        this.winner = this.characters[this.characters.length - 1];

        this.winnerText = this.add.text(400, 300, '', { fontSize: '32px', fill: '#fff', backgroundColor: '#000' });
        this.winnerText.setOrigin(0.5);
        this.winnerText.setPadding(10);
        this.winnerText.setVisible(false);

        const startButton = this.add.text(400, 500, 'Start Race', { fontSize: '24px', fill: '#fff', backgroundColor: '#000' });
        startButton.setOrigin(0.5);
        startButton.setPadding(10);
        startButton.setInteractive({ useHandCursor: true });
        startButton.on('pointerdown', () => this.startRace());

        this.raceStarted = false;
        this.finishedCharacters = 0;
    }

    calculateFinalX(distance) {
        const trackWidth = this.sys.game.config.width - 200;
        return 100 + (trackWidth * distance / 100);
    }

    startRace() {
        this.raceStarted = true;
    }

    update() {
        if (!this.raceStarted || this.gameOver) return;

        this.characters.forEach(char => {
            if (char.x < char.finalX) {
                char.x += char.speed;
                char.x += Phaser.Math.FloatBetween(-0.25, 0.25);
                char.x = Math.min(char.x, char.finalX);
            } else if (!char.hasFinished) {
                char.hasFinished = true;
                this.finishedCharacters++;
                if (char !== this.winner) {
                    this.animations.playLosingAnimation(char, this.winner);
                }
            }
        });

        if (this.finishedCharacters === this.characters.length) {
            this.gameOver = true;
            this.winnerText.setText(`${this.winner.name} wins!`);
            this.winnerText.setVisible(true);
            this.animations.playWinningAnimation(this.winner);
            this.createRestartButton();
        }
    }

    createRestartButton() {
        const restartButton = this.add.text(400, 400, 'Restart', { fontSize: '24px', fill: '#fff', backgroundColor: '#000' });
        restartButton.setOrigin(0.5);
        restartButton.setPadding(10);
        restartButton.setInteractive({ useHandCursor: true });
        restartButton.on('pointerdown', () => this.scene.restart());
    }
}