import {
  BoolHash,
  PlayerOptions,
  Scene,
  Story,
} from './Model';
import { Parser } from './Parser';
import * as Markdown from 'markdown-it';
import * as $ from 'jquery';

export class Player {
  private static converter = new Markdown();
  private container: JQuery<any>;
  private playerState: BoolHash = {};
  private visitedScenes: BoolHash = {};
  private currentScene?: Scene;
  private moveCounter: number = 0;
  private story: Story;

  constructor(private options: PlayerOptions) {
    this.story = Parser.parse(options.source);
    let i = 0;
    for(let [key, scenes] of Object.entries(this.story.scenes)) {
      for(let scene of scenes) scene.id = `#s${ ++i }`;
    }
    this.container = $(`#${ options.id }`);
    this.container.addClass('ficdown').data('player', this);
  }

}
