# Shadow Maze

2D top-down horror game where an AI hunts the player.

## 📌 About The Game

Shadow Maze is a top-down, stealth-horror puzzle game built with Phaser 3. Players must navigate a dark maze, collect all the scattered artifacts, and then find the elusive exit before a relentless enemy catches them. The game emphasizes stealth and environmental awareness, as light sources are limited and the enemy's vision is a constant threat. Can you collect all the goals and escape the **Shadow Maze**?

## 🎮 Key Features

* Smart Enemy AI: Follows you using pathfinding.
* Raycast Lighting & Vision: Stay out of sight and use your flashlight wisely.
* Stealth-Horror Gameplay: Sneak, hide, and survive.
* Collect & Escape: Find all keys to open the exit.
* Dynamic Audio: Tense music and sounds that react to your actions.
* Simple Controls: Easy to learn, hard to master.

## ℹ️ How to Play

### 📜 Game Objective
1.  **Collect all the keys** scattered throughout the maze. The UI will show your progress.
2.  Once all keys are collected, a **Exit Portal** will appear somewhere in the maze.
3.  Reach the **Exit Portal** to win the game!

### 🕹️ Controls
* `W` or `Z`: Move Up
* **S**: Move Down
* `A` or `Q`: Move Left
* `D`: Move Right
* `F`: Toggle flashlight

### 👺 The Enemy
A hostile entity patrols the maze and has a limited field of vision.
* If the enemy spots you, its movement speed will increase and it will follow you.
* If you manage to break line of sight and remain hidden for a few seconds, the enemy will return to its patrol routine.
* If the enemy catches you, you restart!

### 🚀 Test the game
[Play online](https://deitsuki.netlify.app/shadow-maze)

## 🛠️ Development

This game is built using:
* **Phaser 3**: A fast, free, and fun open-source HTML5 game framework.
* **EasyStar.js**: A lightweight A\* pathfinding library for grid-based games.

## 🌟 Contributing

Contributions are welcome! If you have suggestions for improvements, new features, or bug fixes, please feel free to open an issue or submit a pull request.