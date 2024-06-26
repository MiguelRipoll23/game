import { GameFrame } from "../models/game-frame.js";
import { WorldScreen } from "../screens/world-screen.js";
import { ScreenManager } from "./screen-manager.js";
export class GameLoop {
    isRunning = false;
    canvas;
    context;
    gameFrame;
    screenManager;
    previousTimeStamp = 0;
    deltaTimeStamp = 0;
    constructor() {
        this.canvas = document.getElementById("canvas");
        this.context = this.canvas.getContext("2d");
        this.gameFrame = new GameFrame();
        this.screenManager = new ScreenManager(this);
        this.previousTimeStamp = performance.now();
        this.setCanvasSize();
        this.addResizeEventListener();
    }
    getGameFrame() {
        return this.gameFrame;
    }
    start() {
        this.isRunning = true;
        this.setInitialScreen();
        requestAnimationFrame(this.loop.bind(this));
    }
    stop() {
        this.isRunning = false;
    }
    setCanvasSize() {
        this.canvas.width = document.body.clientWidth;
        this.canvas.height = document.body.clientHeight;
    }
    addResizeEventListener() {
        window.addEventListener("resize", () => {
            this.canvas.width = document.body.clientWidth;
            this.canvas.height = document.body.clientHeight;
        });
    }
    setInitialScreen() {
        const worldScreen = new WorldScreen(this.canvas);
        worldScreen.loadObjects();
        this.screenManager.crossfade(worldScreen, 1);
    }
    loop(timeStamp) {
        this.deltaTimeStamp = Math.min(timeStamp - this.previousTimeStamp, 100);
        this.previousTimeStamp = timeStamp;
        this.update(this.deltaTimeStamp);
        this.render();
        if (this.isRunning) {
            requestAnimationFrame(this.loop.bind(this));
        }
    }
    update(deltaTimeStamp) {
        this.screenManager.update(deltaTimeStamp);
        this.gameFrame.getNextScreen()?.update(deltaTimeStamp);
        this.gameFrame.getCurrentScreen()?.update(deltaTimeStamp);
    }
    render() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.gameFrame.getNextScreen()?.render(this.context);
        this.gameFrame.getCurrentScreen()?.render(this.context);
    }
}
