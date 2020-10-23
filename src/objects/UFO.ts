import { GameScene } from "../scenes/Game";

export class UFO extends Phaser.Physics.Arcade.Sprite {

	private _landY: number;

	constructor (scene, x, y) {
		super(scene, x, y, 'ufo');
		this._landY = GameScene.height * 0.795;

		this.on('animationcomplete', () => {
			this.setActive(false);
			this.setVisible(false);
			this.body.enable = false;
		});

		setTimeout(() => {
			this.postConstructor();
		}, 1);
	}

	private postConstructor() {
		this.body.enable = false;
	}

	public startLanding(x, y, speed) {
		this.setFrame(0);
		this.body.enable = true;
		this.body.reset(x, y);

		this.setActive(true);
		this.setVisible(true);

		this.setVelocityY(speed);
	}

	public preUpdate(time, delta) {
		super.preUpdate(time, delta);

		if (this.y >= this._landY) {

			this.scene.sound.stopAll();
			GameScene.GameRunning = false;

			console.log("INVASION BEGINS! GAME OVER");
			this.scene.sound.play('sfx/game_over', { volume: 2, loop: false });

			this.setActive(false);
			this.setVelocityY(0);
			this.body.enable = false;
		}
	}

	public kill() {
		this.setVelocityY(0);

		this.scene.sound.play(`sfx/explode_${Math.floor(Math.random() * 5)}`, { volume: 2 });
		this.play("ufo_killed");
	}
}