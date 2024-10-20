import { BaseGameObject } from "../base/base-game-object.js";

export class NotificationObject extends BaseGameObject {
  private readonly DEFAULT_HEIGHT = 35;
  private readonly MARGIN = 20;
  private readonly TEXT_SPEED = 2;
  private readonly TRANSITION_MILLISECONDS = 250;

  private context: CanvasRenderingContext2D;
  private active: boolean = false;

  private opacity = 0;

  private x = 0;
  private y = 0;
  private textX = 0;

  private completedTimes = 0;

  private text = "Whoops! Something went wrong!";

  constructor(private readonly canvas: HTMLCanvasElement) {
    super();
    this.x = 0;
    this.y = this.MARGIN;
    this.context = canvas.getContext("2d") as CanvasRenderingContext2D;
    this.textX = this.canvas.width;
  }

  public override update(deltaTimeStamp: DOMHighResTimeStamp): void {
    if (this.active) {
      this.updateTextPosition();
    }
  }

  public override render(context: CanvasRenderingContext2D): void {
    context.globalAlpha = this.opacity;

    // Draw red borders
    context.fillStyle = "rgba(255, 0, 0, 0.85)";
    context.fillRect(this.x, this.y, this.canvas.width, 1); // Top border
    context.fillRect(
      this.x,
      this.y + this.DEFAULT_HEIGHT - 1,
      this.canvas.width,
      1,
    ); // Bottom border

    // Draw black rectangle
    context.fillStyle = "rgba(0, 0, 0, 0.85)";
    context.fillRect(
      this.x,
      this.y + 1,
      this.canvas.width,
      this.DEFAULT_HEIGHT - 2,
    ); // Main rectangle

    // Draw text
    context.fillStyle = "#FFF";
    context.font = "20px system-ui";
    context.fillText(
      this.text,
      this.textX,
      this.y + this.DEFAULT_HEIGHT / 2 + 6,
    );

    context.globalAlpha = 1;
  }

  public show(text: string): void {
    this.text = text;
    this.reset();
  }

  private reset(): void {
    this.opacity = 1;
    this.completedTimes = 0;
    this.textX = this.canvas.width + this.context.measureText(this.text).width;
    this.active = true;
  }

  private updateTextPosition(): void {
    if (this.opacity < 1) {
      return;
    }

    this.textX -= this.TEXT_SPEED;

    // Reset position if text is out of screen
    const textWidth = this.context.measureText(this.text).width;

    if (this.textX < -textWidth) {
      this.completedTimes++;
      this.textX = this.canvas.width + textWidth;

      if (this.completedTimes === 2) {
        this.opacity = 0;
      }
    }
  }
}
