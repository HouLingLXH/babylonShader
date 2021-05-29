import { Component, OnInit } from '@angular/core';
import { Game } from 'src/babylon/game';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {

  title = 'shader-test';
  public renderCanvas: HTMLCanvasElement | undefined;
  public game: Game | undefined;

  ngOnInit(): void {
    this.renderCanvas = document.getElementById("renderCanvas") as HTMLCanvasElement;
    this.game = new Game();
    this.game.initEngine(this.renderCanvas);
    this.game.createScene();

  }
}
