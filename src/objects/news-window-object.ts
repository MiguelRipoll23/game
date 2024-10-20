import { PressableWindowObject } from "./common/pressable-window-object.js";

export class NewsWindowObject extends PressableWindowObject {
  private index: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    super(canvas);
  }

  public getIndex(): number {
    return this.index;
  }

  public openPost(index: number, title: string, content: string): void {
    this.index = index;
    super.open(title, content);
  }

  public override update(deltaTimeStamp: DOMHighResTimeStamp): void {
    if (this.isPressed()) {
      this.close();
      console.log("Closed news post window with index:", this.index);
    }

    super.update(deltaTimeStamp);
  }
}
