import { GameScene, PowerType } from "../scenes/Game";

export class LootBox extends Phaser.Physics.Arcade.Sprite {

	private _landY: number;
	private _powers: any;

	constructor (scene, x, y) {
		super(scene, x, y, 'box');
		this._landY = GameScene.height * 0.78;

		this.on('animationcomplete', () => {
			this.setVisible(false);
			this.setActive(false);
			this.body.enable = false;

			let newPower: PowerType = Math.floor(Math.random() * 5) as PowerType;
			console.log("POWER ACTIVATED:", PowerType[newPower]);

			this.scene.sound.play('sfx/bonus', { volume: 3, loop: false });

			let bonus = this.scene.add.image(this.x, this.y, 'bonus_icons', newPower);
			bonus.setOrigin(0.5);
			bonus.displayWidth = this.displayWidth;
			bonus.displayHeight = this.displayHeight;

			this.scene.add.tween({
				targets: bonus,
				y: this.y - 50,
				alpha: 0,
				duration: 2000,
				onComplete: () => {
					let current: any = this._powers[newPower];
					if (current) {
						this._powers[newPower].time = current.time + 20000;
					} else {

						bonus.setOrigin(0.5, 0);
						bonus.x = GameScene.left + GameScene.width * (0.945 - this._powers.count * 0.105);
						bonus.y = 5;
						bonus.alpha = 1;

						this._powers.count++;

						this._powers[newPower] = {
							time: 20000,
							icon: bonus
						};
					}
				}
			});
		});
	}

	public drop(x, y, powers) {
		this._powers = powers;
		this.setFrame(0);
		this.body.enable = true;
		this.body.reset(x, y);

		this.setActive(true);
		this.setVisible(true);

		this.setVelocityY(300);
	}

	public preUpdate(time, delta) {
		super.preUpdate(time, delta);

		if (this.body.velocity.y > 0) {
			this.setVelocityY(this.body.velocity.y + 5);

			if (this.y >= this._landY) {

				this.scene.sound.play('sfx/box_break', { volume: 1, loop: false });
				this.setVelocityY(0);
				this.play("box_break");
			}
		}
	}
}