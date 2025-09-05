import Phaser from "phaser";
import io from "socket.io-client";

class VirtualOfficeScene extends Phaser.Scene {
  constructor() {
    super({ key: "default" });
  }

  init(data) {
    this.playerName = data.playerName;
    this.setSocketRef = data.setSocketRef;
  }

  preload() {
    this.load.image(
      "background",
      "https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=1200&h=800&fit=crop"
    );

    // --- Create Player Avatar Texture ---
    const playerGraphics = this.add.graphics();
    playerGraphics.fillGradientStyle(0x4f46e5, 0x7c3aed, 0x06b6d4, 0x3b82f6, 1);
    playerGraphics.fillRoundedRect(0, 0, 80, 80, 20);
    playerGraphics.generateTexture("player_avatar", 80, 80);
    playerGraphics.destroy();

    // --- Create Other Player Avatar Texture ---
    const otherGraphics = this.add.graphics();
    otherGraphics.fillGradientStyle(0xf59e0b, 0xef4444, 0xf97316, 0xdc2626, 1);
    otherGraphics.fillRoundedRect(0, 0, 80, 80, 20);
    otherGraphics.generateTexture("other_player_avatar", 80, 80);
    otherGraphics.destroy();
  }

  create() {
    const bg = this.add.image(600, 400, "background");
    bg.setDisplaySize(1200, 800);

    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.3);
    overlay.fillRect(0, 0, 1200, 800);

    this.socket = io("ws://localhost:3001", {
      auth: { username: this.playerName },
    });

    this.setSocketRef?.(this.socket);

    this.otherPlayers = this.physics.add.group();
    this.cursors = this.input.keyboard.createCursorKeys();
    this.physics.world.setBounds(0, 0, 1200, 800);

    this.socket.on("currentPlayers", (players) => {
      Object.values(players).forEach((p) => {
        if (p.playerId === this.socket.id) this.addPlayer(p);
        else this.addOtherPlayer(p);
      });
    });

    this.socket.on("newPlayer", (p) => this.addOtherPlayer(p));

    this.socket.on("playerMoved", (pInfo) => {
      this.otherPlayers.getChildren().forEach((p) => {
        if (pInfo.playerId === p.playerId) {
          this.tweens.add({
            targets: p,
            x: pInfo.x,
            y: pInfo.y,
            duration: 100,
            ease: "Power2",
          });
        }
      });
    });

    this.socket.on("playerDisconnected", (playerId) => {
      this.otherPlayers.getChildren().forEach((player) => {
        if (player.playerId === playerId) {
          player.destroy();
        }
      });
    });

    this.add.text(20, 20, "Use ARROW KEYS to move around", {
      fontSize: "16px",
      fill: "#FFFFFF",
      backgroundColor: "rgba(0,0,0,0.7)",
      padding: { x: 10, y: 5 },
    });
  }

  update() {
    if (!this.player) return;

    const speed = 250;
    this.player.body.setVelocity(0);

    if (this.cursors.left.isDown) {
      this.player.body.setVelocityX(-speed);
      this.player.setScale(-1, 1);
    } else if (this.cursors.right.isDown) {
      this.player.body.setVelocityX(speed);
      this.player.setScale(1, 1);
    }

    if (this.cursors.up.isDown) {
      this.player.body.setVelocityY(-speed);
    } else if (this.cursors.down.isDown) {
      this.player.body.setVelocityY(speed);
    }

    const { x, y } = this.player;
    if (
      this.player.oldPosition &&
      (x !== this.player.oldPosition.x || y !== this.player.oldPosition.y)
    ) {
      this.socket.emit("playerMovement", { x, y });
    }
    this.player.oldPosition = { x, y };
  }

  addPlayer(playerInfo) {
    const container = this.add.container(
      playerInfo.x || 100,
      playerInfo.y || 100
    );
    container.setSize(80, 80);

    const avatar = this.add.sprite(0, -10, "player_avatar").setScale(0.8);
    const nameText = this.add
      .text(0, 50, playerInfo.playerName, {
        fontSize: "14px",
        fill: "#FFFFFF",
        stroke: "#000",
        strokeThickness: 2,
      })
      .setOrigin(0.5);

    const glow = this.add.graphics();
    glow.lineStyle(3, 0x00ff88, 0.8);
    glow.strokeCircle(0, -10, 45);

    container.add([glow, avatar, nameText]);
    this.physics.world.enable(container);
    container.body.setCollideWorldBounds(true);
    container.body.setCircle(40);
    this.player = container;
  }

  addOtherPlayer(playerInfo) {
    const container = this.add.container(
      playerInfo.x || 200,
      playerInfo.y || 200
    );
    container.setSize(80, 80);
    container.playerId = playerInfo.playerId;

    const avatar = this.add
      .sprite(0, -10, "other_player_avatar")
      .setScale(0.8);
    const nameText = this.add
      .text(0, 50, playerInfo.playerName, {
        fontSize: "14px",
        fill: "#FFFFFF",
        stroke: "#000",
        strokeThickness: 2,
      })
      .setOrigin(0.5);

    container.add([avatar, nameText]);
    this.otherPlayers.add(container);
  }
}

export default VirtualOfficeScene;
