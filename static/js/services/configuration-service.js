import { API_HOSTNAME, API_HTTP_PROTOCOL, CONFIGURATION_ENDPOINT, } from "../constants/api.js";
export class ConfigurationService {
    gameServer;
    constructor(gameServer) {
        this.gameServer = gameServer;
    }
    async downloadFromServer() {
        const response = await this.getResponse();
        const decryptedResponse = await this.decryptResponse(response);
        const configuration = JSON.parse(decryptedResponse);
        console.log("Configuration response", configuration);
    }
    async getResponse() {
        const gameRegistration = this.gameServer.getGameRegistration();
        if (gameRegistration === null) {
            throw new Error("Game registration not found");
        }
        const authenticationToken = gameRegistration.getAuthenticationToken();
        if (authenticationToken === null) {
            throw new Error("Authentication token not found");
        }
        const response = await fetch(API_HTTP_PROTOCOL + API_HOSTNAME + CONFIGURATION_ENDPOINT, {
            headers: {
                "Authorization": authenticationToken,
            },
        });
        return response.arrayBuffer();
    }
    async decryptResponse(response) {
        const gameRegistration = this.gameServer.getGameRegistration();
        if (gameRegistration === null) {
            throw new Error("Game registration not found");
        }
        const sessionKey = gameRegistration.getSessionKey();
        const iv = response.slice(0, 12);
        const data = response.slice(12);
        const keyData = Uint8Array.from(atob(sessionKey), (c) => c.charCodeAt(0)).buffer;
        const algorithm = {
            name: "AES-GCM",
            iv,
        };
        const cryptoKey = await crypto.subtle.importKey("raw", keyData, { name: "AES-GCM" }, false, ["encrypt", "decrypt"]);
        const decryptedBuffer = await crypto.subtle.decrypt(algorithm, cryptoKey, data);
        return new TextDecoder().decode(decryptedBuffer);
    }
}