import { GameScene } from "../scenes/Game";

export class UIPanel extends Phaser.GameObjects.Container {

	private _uiPanel: Phaser.GameObjects.Image;
    private _uiText: Phaser.GameObjects.BitmapText;

    public init(text: string) {
		this._uiPanel = new Phaser.GameObjects.Image(this.scene, 0, 0, 'ui_panel');
		this._uiPanel.setOrigin(0.5);
		this._uiPanel.displayWidth = GameScene.width * 0.75;
        this._uiPanel.displayHeight = GameScene.height * 0.5;
        this.add(this._uiPanel);

		this._uiText = new Phaser.GameObjects.BitmapText(
			this.scene, 0, GameScene.height * -0.05, 'default', text, GameScene.fontSize, Phaser.GameObjects.BitmapText.ALIGN_CENTER
		);
        this._uiText.setOrigin(0.5);
        this.add(this._uiText);
    }

    public addButton(label: string, onPress: Function, xPos: number) {
		let btn = new Phaser.GameObjects.Image(this.scene, xPos, this._uiPanel.displayHeight * 0.4, 'button1');
		btn.setOrigin(0.5);
		btn.displayWidth = GameScene.height * 0.1875;
        btn.displayHeight = btn.displayWidth * 0.33;
        btn.setInteractive();
        btn.on("down", () => { onPress(); });
        btn.on("pointerdown", () => { onPress(); });
        this.add(btn);

		this._uiText = new Phaser.GameObjects.BitmapText(
            this.scene, xPos, btn.y + 2, 'default', label, GameScene.fontSize, Phaser.GameObjects.BitmapText.ALIGN_CENTER
		);
        this._uiText.setOrigin(0.5);
        this.add(this._uiText);
    }
}