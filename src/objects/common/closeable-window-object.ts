import { GamePointer } from "../../models/game-pointer.js";
import { BasePressableGameObject } from "../base/base-pressable-game-object.js";
import { BackdropObject } from "./backdrop-object.js";

export class CloseableWindowObject extends BasePressableGameObject {
  private readonly TITLE_BAR_HEIGHT: number = 40;
  private readonly TEXT_LINE_HEIGHT: number = 20;

  private readonly backdropObject: BackdropObject;

  private globalAlpha: number = 0;

  private windowX: number = 0;
  private windowY: number = 0;
  private windowWidth: number = 0;
  private windowHeight: number = 0;

  private titleBarTextX: number = 0;
  private titleBarTextY: number = 0;

  private titleTextX: number = 0;
  private titleTextY: number = 0;

  private contentTextX: number = 0;
  private contentTextY: number = 0;
  private contentTextMaxWidth: number = 0;

  protected title: string = "Title";
  protected content: string = "Content goes here";

  private hidden: boolean = false;

  constructor(private canvas: HTMLCanvasElement) {
    super();

    this.backdropObject = new BackdropObject(this.canvas);

    this.setInitialState();
    this.setSize();
    this.setCenterPosition();
    this.calculatePositions();
  }

  public override load(): void {
    this.backdropObject.load();
    super.load();
  }

  public open(title: string, content: string): void {
    this.title = title;
    this.content = content;
    this.globalAlpha = 1;
    this.hidden = false;
    this.active = true;
  }

  public close(): void {
    if (this.hidden) {
      return console.warn("CloseableWindowObject is already closed");
    }

    this.hidden = true;
    this.globalAlpha = 0;
  }

  public isHidden(): boolean {
    return this.hidden;
  }

  public update(deltaTimeStamp: DOMHighResTimeStamp): void {
    if (this.pressed) {
      this.close();
    }

    super.update(deltaTimeStamp);
  }

  public override render(context: CanvasRenderingContext2D): void {
    context.globalAlpha = this.globalAlpha;

    this.backdropObject.render(context);

    // Background
    context.fillStyle = "rgb(0, 0, 0, 1)";
    context.fillRect(
      this.windowX,
      this.windowY,
      this.windowWidth,
      this.windowHeight,
    );

    // Title Bar
    context.fillStyle = "#333333"; // Title bar background color
    context.fillRect(
      this.windowX,
      this.windowY,
      this.windowWidth,
      this.TITLE_BAR_HEIGHT,
    );

    // Window Title
    context.fillStyle = "#FFFFFF";
    context.font = "20px system-ui";
    context.textAlign = "left";
    context.fillText("SERVER MESSAGE", this.titleBarTextX, this.titleBarTextY);

    // Title
    context.fillStyle = "#FFFFFF";
    context.font = "20px system-ui";
    context.textAlign = "left";
    context.fillText(this.title, this.titleTextX, this.titleTextY);

    // Content
    context.fillStyle = "#FFFFFF";
    context.font = "16px system-ui";
    context.textAlign = "left";

    // Text wrapping
    const lines = this.wrapText(
      context,
      this.content,
      this.contentTextMaxWidth,
    );

    for (let i = 0; i < lines.length; i++) {
      context.fillText(
        lines[i],
        this.contentTextX,
        this.contentTextY + (i * this.TEXT_LINE_HEIGHT),
      );
    }

    context.globalAlpha = 1; // Reset global alpha

    super.render(context);
  }

  private setInitialState(): void {
    this.active = false;
  }

  private setSize(): void {
    this.width = this.canvas.width;
    this.height = this.canvas.height;
    this.windowWidth = this.canvas.width * 0.9;
    this.windowHeight = 300;
  }

  private setCenterPosition(): void {
    this.windowX = (this.canvas.width - this.windowWidth) / 2;
    this.windowY = (this.canvas.height - this.windowHeight) / 2;
  }

  private calculatePositions(): void {
    this.titleBarTextX = this.windowX + 15;
    this.titleBarTextY = this.windowY + 28;

    this.titleTextX = this.windowX + 14;
    this.titleTextY = this.windowY + 68;

    this.contentTextX = this.windowX + 14;
    this.contentTextY = this.windowY + this.TITLE_BAR_HEIGHT + 62;
    this.contentTextMaxWidth = this.windowWidth - 20;
  }

  private wrapText(
    context: CanvasRenderingContext2D,
    text: string,
    maxWidth: number,
  ): string[] {
    const words = text.split(" ");
    const lines: string[] = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = context.measureText(currentLine + " " + word).width;
      if (width < maxWidth) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);

    return lines;
  }
}