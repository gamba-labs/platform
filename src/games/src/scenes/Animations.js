export default class Animations {
    constructor(scene, specialAnimationProbability = 0.5) {
        this.scene = scene;
        this.specialAnimationProbability = specialAnimationProbability;
    }

    playWinningAnimation(winner) {
        this.scene.tweens.add({
            targets: winner,
            y: winner.y - 50,
            duration: 300,
            yoyo: true,
            repeat: 3,
            ease: 'Bounce.easeOut'
        });

        this.scene.tweens.add({
            targets: winner,
            angle: 360,
            duration: 1000,
            repeat: 1,
            ease: 'Cubic.easeInOut'
        });
    }

    playLosingAnimation(character, winner) {
        if (this.playSpecialAnimation(character, winner)) {
            return;
        }

        switch (character.name) {
            case 'McD':
                this.playMcDLosingAnimation(character);
                break;
            case 'Ape':
                if (!character.slipped) {
                    this.playApeSlipAnimation(character);
                }
                break;
            case 'Dragon':
                this.playDragonFlyAwayAnimation(character);
                break;
            case 'Wizard':
                this.playWizardFireAnimation(character);
                break;
            default:
                this.scene.tweens.add({
                    targets: character,
                    angle: -15,
                    duration: 200,
                    yoyo: true,
                    repeat: 3
                });
        }
    }

    playSpecialAnimation(loser, winner) {
        if (Math.random() < this.specialAnimationProbability) {
            if (winner.name === 'Wizard' && loser.name === 'Dragon') {
                this.playWizardTurnsDragonIntoFrog(winner, loser);
                return true;
            }
            // Add more special animations here
        }
        return false;
    }

    playMcDLosingAnimation(mcD) {
        const phone = this.scene.add.image(mcD.x + 50, mcD.y - 30, 'phone');
        phone.setScale(0.1);
        phone.setOrigin(0.5);
        phone.setAngle(15);
        phone.setAlpha(0);

        this.scene.tweens.add({
            targets: phone,
            scale: 0.15,
            angle: 0,
            alpha: 1,
            duration: 500,
            ease: 'Back.easeOut'
        });

        const textBox = this.scene.add.rectangle(mcD.x + 120, mcD.y - 60, 200, 80, 0xffffff, 0.8);
        textBox.setOrigin(0, 0.5);
        textBox.setAlpha(0);

        const text = this.scene.add.text(textBox.x + 10, textBox.y, "ur fired lol", {
            fontSize: '16px',
            color: '#000',
            align: 'left',
            wordWrap: { width: 180 }
        });
        text.setOrigin(0, 0.5);
        text.setAlpha(0);

        this.scene.tweens.add({
            targets: [textBox, text],
            alpha: 1,
            duration: 500,
            ease: 'Linear',
            delay: 300
        });

        this.scene.tweens.add({
            targets: mcD,
            x: mcD.x + 5,
            duration: 50,
            yoyo: true,
            repeat: 5,
            ease: 'Power2'
        });

        this.scene.time.delayedCall(3000, () => {
            this.scene.tweens.add({
                targets: [phone, textBox, text],
                alpha: 0,
                duration: 500,
                ease: 'Linear',
                onComplete: () => {
                    phone.destroy();
                    textBox.destroy();
                    text.destroy();
                }
            });
        });
    }

    playApeSlipAnimation(ape) {
        ape.slipped = true;
        if (ape.banana) {
            ape.banana.setVisible(true);
        }

        this.scene.tweens.add({
            targets: ape,
            angle: 360,
            duration: 1000,
            ease: 'Cubic.easeOut'
        });

        this.scene.tweens.add({
            targets: ape,
            y: ape.y - 30,
            duration: 500,
            yoyo: true,
            ease: 'Quad.easeOut'
        });

        const slipText = this.scene.add.text(ape.x, ape.y - 50, 'SLIP!', { fontSize: '24px', fill: '#ff0000' });
        slipText.setOrigin(0.5);
        this.scene.tweens.add({
            targets: slipText,
            scale: 1.5,
            duration: 500,
            yoyo: true,
            repeat: 1,
            onComplete: () => slipText.destroy()
        });
    }

    playDragonFlyAwayAnimation(dragon) {
        this.scene.tweens.add({
            targets: dragon,
            y: -dragon.height,
            duration: 1500,
            ease: 'Cubic.easeIn',
            onComplete: () => {
                dragon.setVisible(false);
            }
        });
    }

    playWizardFireAnimation(wizard) {
        const fire = this.scene.add.image(wizard.x, wizard.y, 'fire');
        fire.setOrigin(0.5, 0.5);
        fire.setScale(0);
        
        wizard.setVisible(false);

        this.scene.tweens.add({
            targets: fire,
            scale: wizard.scale,
            duration: 1000,
            ease: 'Bounce.easeOut',
            onComplete: () => {
                this.scene.time.delayedCall(1500, () => {
                    this.scene.tweens.add({
                        targets: fire,
                        alpha: 0,
                        duration: 500,
                        onComplete: () => fire.destroy()
                    });
                });
            }
        });
    }

    playWizardTurnsDragonIntoFrog(wizard, dragon) {
        const spell = this.scene.add.sprite(wizard.x, wizard.y, 'character4');
        spell.setScale(0.1);
        spell.setTint(0x00ff00);

        this.scene.tweens.add({
            targets: spell,
            x: dragon.x,
            y: dragon.y,
            scale: 0.5,
            duration: 1000,
            onComplete: () => {
                spell.destroy();
                
                const originalScale = dragon.scale;
                
                dragon.setTexture('frog');
                dragon.setScale(0.1);
                
                this.scene.tweens.add({
                    targets: dragon,
                    scale: originalScale,
                    y: dragon.y - 50,
                    duration: 500,
                    ease: 'Bounce.easeOut',
                    onComplete: () => {
                        this.scene.tweens.add({
                            targets: dragon,
                            y: dragon.y - 10,
                            duration: 1000,
                            yoyo: true,
                            repeat: -1,
                            ease: 'Sine.easeInOut'
                        });
                    }
                });

                const ribbitText = this.scene.add.text(dragon.x, dragon.y - 50, 'RIBBIT!', {
                    fontSize: '24px',
                    fill: '#00FF00',
                    fontStyle: 'bold'
                });
                ribbitText.setOrigin(0.5, 0.5);

                this.scene.tweens.add({
                    targets: ribbitText,
                    scale: 1.5,
                    alpha: 0,
                    duration: 800,
                    ease: 'Cubic.easeOut',
                    onComplete: () => ribbitText.destroy()
                });
            }
        });
    }
}