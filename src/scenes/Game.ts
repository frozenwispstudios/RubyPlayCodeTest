import { Missile } from '../objects/Missile';
import { UFO } from '../objects/Ufo';
import { Util } from '../util';
import { LootBox } from '../objects/LootBox';
import { UIPanel } from '../objects/UIPanel';

export enum PowerType {
	DOUBLE_FIRE = 0,
	DOUBLE_POINTS = 1,
	HALF_UFO_SPEED = 2,
	UNSTOPABLE_MISSILES = 3,
	STATIC_CONTROLS = 4,
	COUNT = 5
}

export class GameScene extends Phaser.Scene {

	public static get width(): number { return window.innerHeight * 0.5625; }
	public static get left(): number { return (window.innerWidth - GameScene.width) * 0.5; }
	public static get height(): number { return window.innerHeight; }
	public static get fontSize(): number { return GameScene.height < 800 ? 24 : 32; }

	public static GameRunning: boolean = false;
	public static Difficulty: number;
	public static UFO_Speed: number[] = [100, 125, 150, 175, 200, 250];

	private static UFO_Points: number = 100;
	private static MissileCooldown: number = 1000;
	private static SymbolChangeRate: number[] = [9000, 8000, 7500, 7000, 6000, 5000];
	private static ArrivalRate: number[] = [1800, 1600, 1400, 1100, 900, 700];
	private static DifficultyChangeRate: number = 30000;

	private _buttons: Phaser.GameObjects.Image[];
	private _launchers: Phaser.GameObjects.Image[];
	private _launchOrder: number[];
	private _symbols: Phaser.GameObjects.Image[];
	private _missiles: Phaser.Physics.Arcade.Group;
	private _ufos: Phaser.Physics.Arcade.Group;
	private _boxes: Phaser.Physics.Arcade.Group;

	private _uiPanel: UIPanel;
	private _uiPanelShowing: boolean;

	private _cooldown: number;
	private _symbolTimer: number;
	private _arrivalTimer: number;
	private _difficultyTimer: number;

	private _score: number;
	private _scoreText: Phaser.GameObjects.BitmapText;
	private _powers: any;

	private _bg: Phaser.GameObjects.Image;
	private _launchpad: Phaser.GameObjects.Image;
	
	private reset(isFirstLoad: boolean = false) {
		GameScene.Difficulty = 1;

		this._cooldown = 0;
		this._symbolTimer = GameScene.SymbolChangeRate[GameScene.Difficulty];
		this._arrivalTimer = 500;
		this._difficultyTimer = GameScene.DifficultyChangeRate;
		this._score = 0;

		if (this._powers) {
			for (let i=0; i < PowerType.COUNT; i++) {
				let power: any = this._powers[i];
				if (power) {
					power.icon.destroy();
				}
			}
		}
		this._powers = {
			count: 0
		};

		if (this._missiles) {
			let list: Missile[] = this._missiles.getChildren() as Missile[];
			for (let i=0; i < list.length; i++) {
				list[i].setVisible(false);
			}
		}
		if (this._ufos) {
			let list: Missile[] = this._ufos.getChildren() as Missile[];
			for (let i=0; i < list.length; i++) {
				list[i].setVisible(false);
			}
		}
		if (this._boxes) {
			let list: Missile[] = this._boxes.getChildren() as Missile[];
			for (let i=0; i < list.length; i++) {
				list[i].setVisible(false);
			}
		}

		if (this._buttons) {
			for (let i=0; i < this._buttons.length; i++) {
				this._buttons[i].setTint(0xFF0000);
			}
		}
	}

	public preload(): void {
		this.reset(true);
		this.cameras.main.setBackgroundColor('#444');

		this.load.image('bg', 'assets/bg.png');
		this.load.image('top_bar', 'assets/top_bar.png');
		this.load.image('ground', 'assets/ground2.png');
		this.load.image('ui_panel', 'assets/ui_panel.png');
		this.load.image('button1', 'assets/button1.png');
		this.load.bitmapFont('default', 'assets/carterone_stroke.png', 'assets/carterone_stroke.fnt');
		this.load.spritesheet('launchpad', 'assets/launchpad.png', { frameWidth: 512, frameHeight: 128 });

		this.load.image('missile', 'assets/missile.png');
		this.load.spritesheet('launcher', 'assets/launcher2.png', { frameWidth: 128, frameHeight: 220 });
		this.load.spritesheet('symbols', 'assets/symbols2.png', { frameWidth: 128, frameHeight: 128 });

		this.load.spritesheet('ufo', 'assets/ufo.png', { frameWidth: 320, frameHeight: 128 });
		this.load.spritesheet('box', 'assets/box.png', { frameWidth: 128, frameHeight: 128 });
		this.load.spritesheet('bonus_icons', 'assets/bonus_icons.png', { frameWidth: 128, frameHeight: 128 });
		this.load.spritesheet('explosion', 'assets/explode2.png', { frameWidth: 256, frameHeight: 256 });

		this.load.audio('sfx/launch', 'assets/sfx/launch.mp3');
		this.load.audio('sfx/ufo_loop', 'assets/sfx/ufo_loop.mp3');
		this.load.audio('sfx/game_over', 'assets/sfx/game_over.mp3');
		this.load.audio('sfx/explode_0', 'assets/sfx/explode_0.mp3');
		this.load.audio('sfx/explode_1', 'assets/sfx/explode_1.mp3');
		this.load.audio('sfx/explode_2', 'assets/sfx/explode_2.mp3');
		this.load.audio('sfx/explode_3', 'assets/sfx/explode_3.mp3');
		this.load.audio('sfx/explode_4', 'assets/sfx/explode_4.mp3');
		this.load.audio('sfx/box_break', 'assets/sfx/box_break.mp3');
		this.load.audio('sfx/bonus', 'assets/sfx/bonus.mp3');
	}

	public create(): void {

		this._bg = this.add.image(window.innerWidth * 0.5, window.innerHeight * 0.5, 'bg');
		this._bg.setOrigin(0.5);
		this._bg.displayWidth = GameScene.width;
		this._bg.displayHeight = GameScene.height;

		this._missiles = this.physics.add.group({ collideWorldBounds: false });
		this._missiles.createMultiple({
			frameQuantity: 10, key: "missile", visible: false, active: false, classType: Missile
		});

		this._ufos = this.physics.add.group({ collideWorldBounds: false	});
		this._ufos.createMultiple({
			frameQuantity: 10, key: "ufo", frame: 0, visible: false, active: false, classType: UFO
		});

		this._boxes = this.physics.add.group({ collideWorldBounds: false });
		this._boxes.createMultiple({
			frameQuantity: 3, key: "box", frame: 0, visible: false, active: false, classType: LootBox
		});

		let topBar = this.add.image(GameScene.left, 0, 'top_bar');
		topBar.setOrigin(0);
		topBar.displayWidth = this._bg.displayWidth;
		topBar.displayHeight = GameScene.height * 0.06;

		this._scoreText = this.add.bitmapText(GameScene.left + 10, 10, 'default', "Score: 0", GameScene.fontSize);
		this._scoreText.setOrigin(0);

		let ground = this.add.image(window.innerWidth * 0.5, window.innerHeight, 'ground');
		ground.setOrigin(0.5, 1);
		ground.displayWidth = this._bg.displayWidth;
		ground.displayHeight = this._bg.displayHeight * (192 / 1024);

		this._launchers = [];
		this._symbols = [];
		this._launchOrder = [0, 1, 2, 3];
		for (let i = 0; i < 4; i++) {
			let launcher: Phaser.GameObjects.Image = this.add.image(
				GameScene.left + GameScene.width * (0.125 + i * 0.25), GameScene.height * 0.825, "launcher", 0
			);
			launcher.setOrigin(0.5);
			launcher.displayWidth = GameScene.width * 0.1;
			launcher.displayHeight = GameScene.width * 0.172;
			this._launchers.push(launcher);

			let symbol: Phaser.GameObjects.Image = this.add.image(
				GameScene.left + GameScene.width * (0.125 + i * 0.25), GameScene.height * 0.84, "symbols", i
			);
			symbol.setOrigin(0.5);
			symbol.displayWidth = GameScene.width * 0.08;
			symbol.displayHeight = GameScene.width * 0.08;
			symbol.setTint(0xFFAAAA);
			symbol.alpha = 0.8;
			this._symbols.push(symbol);

		}

		let launchpadY: number = GameScene.height * 0.94;
		this._launchpad = this.add.image(window.innerWidth * 0.5, launchpadY, 'launchpad', 0);
		this._launchpad.setOrigin(0.5, 0.5);
		this._launchpad.displayHeight = GameScene.width * 0.12;
		this._launchpad.displayWidth = GameScene.width * 0.48;

		this._buttons = [];
		for (let i = 0; i < 4; i++) {
			let btn: Phaser.GameObjects.Image = this.add.image(
				GameScene.left + GameScene.width * (0.335 + i * 0.11), launchpadY, "symbols", i
			);
			btn.setOrigin(0.5, 0.5);
			btn.displayWidth = GameScene.width * 0.1;
			btn.displayHeight = GameScene.width * 0.1;
			btn.setTint(0xFF0000);

			btn.setInteractive();
			btn.on('down', (p, btn) => this.onButtonInputDown(btn, i));
			btn.on('pointerdown', (pointer) => { btn.emit('down', pointer, btn); });

			this._buttons.push(btn);
		}

		this._uiPanel = new UIPanel(this, window.innerWidth * 0.5, window.innerHeight * 0.44);
		this._uiPanel.init(
			"LAUNCH CODES\n\nUse the big red\nbuttons to launch\nmissles at the UFOs.\n\nWatch out!\nThe launch codes\nare always changing!"
		);
		this._uiPanel.addButton("START", () => {
			this._uiPanel.destroy();
			this._uiPanelShowing = false;
			GameScene.GameRunning = true;
		}, 0);
		this.add.existing(this._uiPanel);
		this._uiPanelShowing = true;

		this.anims.create({
			key: "ufo_killed",
			frames: this.anims.generateFrameNumbers("ufo", { start: 1, end: 4 }),
			frameRate: 12
		});
		this.anims.create({
			key: "explode",
			frames: this.anims.generateFrameNumbers("explosion", { start: 0, end: 6 }),
			frameRate: 20
		});
		this.anims.create({
			key: "box_break",
			frames: this.anims.generateFrameNumbers("box", { start: 1, end: 3 }),
			frameRate: 20
		});

		setTimeout(() => {
			this.physics.add.collider(
				this._missiles, this._ufos, (m: Missile, u: UFO) => { this.onMissileHit(m, u); }
			)
		}, 100);
	}

	public update(time: number, delta: number): void {

		if (!GameScene.GameRunning) {

			if (!this._uiPanelShowing) {
				this._cooldown = 1;
				for (let i=0; i < this._buttons.length; i++) {
					this._buttons[i].setTint(0x660000);
				}

				let m: Missile = this._missiles.getFirstAlive();
				while (m) {
					m.setVelocityY(0);
					m.setActive(false);
					m = this._missiles.getFirstAlive();
				}
				
				let u: UFO = this._ufos.getFirstAlive();
				while (u) {
					u.setVelocityY(0);
					u.setActive(false);
					u = this._ufos.getFirstAlive();
				}

				this._uiPanel = new UIPanel(this, window.innerWidth * 0.5, window.innerHeight * 0.44);
				this._uiPanel.init(
					`INVASION\nBEGINS!\n\n\nScore:  ${this._score}\nGreat Job!`
				);
				this._uiPanel.addButton("RESTART", () => {
					this._uiPanel.destroy();
					this._uiPanelShowing = false;
					GameScene.GameRunning = true;
					this.reset();
				}, 0);
				this.add.existing(this._uiPanel);
				this._uiPanelShowing = true;
			}
			return;
		}

		for (let i=0; i < PowerType.COUNT; i++) {
			let power: any = this._powers[i];
			if (power) {
				let timeLeft = power.time;
				timeLeft -= delta;
				if (timeLeft < 0) {
					let xPos: number = power.icon.x;
					power.icon.destroy();
					this._powers[i] = null;
					this._powers.count--;
					console.log("POWER REMOVED: ", PowerType[i]);

					// Move anything to the left of the removed icon over a bit
					for (let j=0; j < PowerType.COUNT; j++) {
						let p: any = this._powers[j];
						if (p && p.icon.x < xPos) {
							p.icon.x += GameScene.width * 0.105;
						}
					}
				} else {
					this._powers[i].time = timeLeft;
				}
			}
		}

		if (this._cooldown > 0) {
			this._cooldown -= delta;

			let baseCD = GameScene.MissileCooldown;
			// if (this._powers[PowerType.HALF_COOLDOWN]) {
			// 	baseCD = baseCD * 0.5;
			// 	this._cooldown = Math.min(this._cooldown, baseCD);
			// }
	
			let frame: number = (baseCD - this._cooldown) / (baseCD / 16);
			frame = Math.min(15, Math.floor(frame));
			this._launchpad.setFrame(frame);

			if (this._cooldown < 0) {
				for (let i=0; i < this._buttons.length; i++) {
					this._buttons[i].setTint(0xFF0000);
				}
			}
		}

		if (!this._powers[PowerType.STATIC_CONTROLS]) {
			this._symbolTimer -= delta;
			if (this._symbolTimer < 0) {
				this._launchOrder = Util.shuffle(this._launchOrder);
				for (let i=0; i < this._symbols.length; i++) {
					this._symbols[i].setFrame(this._launchOrder[i]);
					this._symbolTimer = GameScene.SymbolChangeRate[GameScene.Difficulty];
				}
			}
		}

		this._arrivalTimer -= delta;
		if (this._arrivalTimer < 0) {
			let ufo: UFO = this._ufos.getFirstDead(false);
			if (ufo) {
				let lane: number = Math.floor(Math.random() * 4);
				ufo.displayWidth = GameScene.width * 0.2;
				ufo.setScale(ufo.scaleX, ufo.scaleX);

				let speed = GameScene.UFO_Speed[GameScene.Difficulty];
				if (this._powers[PowerType.HALF_UFO_SPEED]) {
					speed *= 0.5;
				}
				ufo.startLanding(
					GameScene.left + GameScene.width * (0.125 + 0.25 * lane),
					GameScene.height * -0.1,
					speed
				);
	
				this._arrivalTimer = GameScene.ArrivalRate[GameScene.Difficulty];
			}
		}

		this._difficultyTimer -= delta;
		if (this._difficultyTimer < 0) {
			GameScene.Difficulty = Math.min(GameScene.Difficulty + 1, 5);
			this._difficultyTimer = GameScene.DifficultyChangeRate;
			console.log("DIFFICULTY HAS INCREASED:", GameScene.Difficulty);
		}
	}

	private async onButtonInputDown(btn: Phaser.GameObjects.Image, btnIndex: number) {
		if (this._cooldown > 0 || !GameScene.GameRunning) { return; }

		let launchPadIndex: number = this._launchOrder.indexOf(btnIndex);
		this.launchMissile(launchPadIndex);

		// Launch a missile from another random launch pad
		if (this._powers[PowerType.DOUBLE_FIRE]) {
			let lane = Math.floor(Math.random() * 4);
			while (lane === launchPadIndex) {
				lane = Math.floor(Math.random() * 4);
			}
			this.launchMissile(lane);
		}

		this._cooldown = GameScene.MissileCooldown;
		// if (this._powers[PowerType.HALF_COOLDOWN]) {
		// 	this._cooldown = GameScene.MissileCooldown * 0.5;
		// }
		for (let i=0; i < this._buttons.length; i++) {
			this._buttons[i].setTint(0x660000);
		}
	}

	private launchMissile(index) {
		let missile: Missile = this._missiles.getFirstDead(false);
		if (missile) {
			let lane: number = index;
			missile.displayHeight = GameScene.height * 0.05;
			missile.displayWidth = missile.displayHeight * 0.25;
			missile.launch(GameScene.left + GameScene.width * (0.125 + 0.25 * lane), GameScene.height * 0.9);

			this._launchers[lane].setFrame(1);
			setTimeout(() => {
				this._launchers[lane].setFrame(0);
			}, 400);
		}
	}

	private async onMissileHit(missile: Missile, ufo: UFO) {
		let xPos: number = ufo.x;
		let yPos: number = ufo.y;

		ufo.kill();
		if (this._powers[PowerType.UNSTOPABLE_MISSILES]) {
			missile.setVelocityY(-300);
		} else {
			missile.kill();
		}

		this._score += GameScene.UFO_Points;
		if (this._powers[PowerType.DOUBLE_POINTS]) {
			this._score += GameScene.UFO_Points;
		}
		this._scoreText.text = "Score: " + Util.formatNumber(this._score);

		let explosion = this.add.sprite(ufo.x, ufo.y, 'explosion');
		explosion.on("animationcomplete", () => {
			explosion.destroy();
		});
		explosion.play("explode");

		if (Math.random() < 0.07) {
			let box: LootBox = this._boxes.getFirstDead(false);
			if (box) {
				box.displayHeight = GameScene.height * 0.05;
				box.displayWidth = box.displayHeight;
				box.drop(xPos, yPos, this._powers);
				console.log("BOX DROPPED");
			}
		}
	}
}