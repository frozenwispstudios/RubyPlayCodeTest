export class Missile extends Phaser.Physics.Arcade.Sprite {

	private _sfx: Phaser.Sound.BaseSound;

	constructor (scene, x, y) {
		super(scene, x, y, 'missile');

		setTimeout(() => {
			this.postConstructor();
		}, 1);
	}

	private postConstructor() {
		this.body.enable = false;
	}

	public launch(x, y) {
		this.body.enable = true;
		this.body.reset(x, y);

		this.setActive(true);
		this.setVisible(true);

		this.setVelocityY(-300);

		this._sfx = this.scene.sound.add('sfx/launch', { volume: 0.5, loop: false });
		this._sfx.play();
	}

	public preUpdate(time, delta) {
		super.preUpdate(time, delta);

		this.setVelocityY(this.body.velocity.y - 1);

		if (this.y <= 0) {
			this._sfx.stop();
			this.setActive(false);
			this.setVelocityY(0);
			this.setVisible(false);
			this.body.enable = false;
		}
	}

	public kill() {
		this._sfx.stop();
		this.setActive(false);
		this.setVelocityY(0);
		this.setVisible(false);
		this.body.enable = false;
	}
}