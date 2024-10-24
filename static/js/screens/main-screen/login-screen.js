import { MessageObject } from "../../objects/common/message-object.js";
import { BaseGameScreen } from "../base/base-game-screen.js";
import { GameRegistration } from "../../models/game-registration.js";
import { MainMenuScreen } from "./main-menu-screen.js";
import { SERVER_CONNECTED_EVENT } from "../../constants/events-contants.js";
export class LoginScreen extends BaseGameScreen {
    gameServer;
    apiService;
    cryptoService;
    webSocketService;
    messageObject = null;
    constructor(gameController) {
        super(gameController);
        this.gameServer = gameController.getGameState().getGameServer();
        this.apiService = gameController.getApiService();
        this.cryptoService = gameController.getCryptoService();
        this.webSocketService = gameController.getWebSocketService();
        this.addCustomEventListeners();
    }
    loadObjects() {
        this.loadMessageObject();
        super.loadObjects();
    }
    hasTransitionFinished() {
        this.checkForUpdates();
    }
    hasConnectedToServer() {
        this.messageObject?.hide();
        this.transitionToMatchmakingScreen();
    }
    addCustomEventListeners() {
        window.addEventListener(SERVER_CONNECTED_EVENT, () => {
            console.log(`Event ${SERVER_CONNECTED_EVENT} handled`);
            this.hasConnectedToServer();
        });
    }
    loadMessageObject() {
        this.messageObject = new MessageObject(this.canvas);
        this.uiObjects.push(this.messageObject);
    }
    checkForUpdates() {
        this.messageObject?.show("Checking for updates...");
        this.apiService.checkForUpdates().then((requiresUpdate) => {
            if (requiresUpdate) {
                return alert("An update is required to play the game");
            }
            this.messageObject?.hide();
            this.registerUser();
        }).catch((error) => {
            console.error(error);
            alert("An error occurred while checking for updates");
        });
    }
    registerUser() {
        const name = prompt("Player name:", "player1");
        if (name === null) {
            return this.registerUser();
        }
        this.apiService.registerUser(name)
            .then((registrationResponse) => {
            this.gameServer.setGameRegistration(new GameRegistration(registrationResponse));
            this.downloadConfiguration();
        })
            .catch((error) => {
            console.error(error);
            alert("An error occurred while registering to the server");
        });
    }
    downloadConfiguration() {
        this.messageObject?.show("Downloading configuration...");
        this.apiService.getConfiguration()
            .then(async (configurationResponse) => {
            await this.applyConfiguration(configurationResponse);
        })
            .catch((error) => {
            console.error(error);
            alert("An error occurred while downloading configuration");
        });
    }
    async applyConfiguration(configurationResponse) {
        const decryptedResponse = await this.cryptoService.decryptResponse(configurationResponse);
        const configuration = JSON.parse(decryptedResponse);
        this.gameServer.setConfiguration(configuration);
        console.log("Configuration response (decrypted)", configuration);
        this.connectToServer();
    }
    connectToServer() {
        this.messageObject?.show("Connecting to the server...");
        this.webSocketService.connectToServer();
    }
    transitionToMatchmakingScreen() {
        const mainMenuScreen = new MainMenuScreen(this.gameController);
        mainMenuScreen.loadObjects();
        this.screenManagerService?.getTransitionService().crossfade(mainMenuScreen, 0.2);
    }
}
