import {
  Action,
  BoolHash,
  PlayerOptions,
  Scene,
  Story,
} from './Model';
import { Parser } from './Parser';
import { Util } from './Util';
import * as Markdown from 'markdown-it';
import * as $ from 'jquery';

export class Player {
  private converter: Markdown;
  private container: JQuery<any>;
  private playerState: BoolHash = {};
  private visitedScenes: BoolHash = {};
  private currentScene?: Scene;
  private moveCounter: number = 0;
  private story: Story;
  private startText: string;
  private endMarkdown: string;

  private startCallback?: () => void;
  private finishCallback?: () => void;
  private started: boolean = false;

  constructor(private options: PlayerOptions) {
    this.converter = new Markdown({
      html: options.html,
    });
    this.story = Parser.parse(options.source);
    this.startText = options.startText
      ? options.startText
      : 'Click to start...';
    this.endMarkdown = options.endMarkdown
      ? options.endMarkdown
      : "## The End\n\nYou have reached the end of this story. [Click here](restart()) to start over.";
    let i = 0;
    for(let [key, scenes] of Object.entries(this.story.scenes)) {
      for(let scene of scenes) scene.id = `#s${ ++i }`;
    }
    this.container = $(`#${ options.id }`);
    this.container.addClass('ficdown').data('player', this);

    this.startCallback = options.start;
    this.finishCallback = options.finish;
  }

  public play(): void {
    this.container.html(
      this.converter.render(`${ this.story.name ? `# ${this.story.name}\n\n` : '' }${ this.story.description }\n\n[${ this.startText }](/${ this.story.firstScene })`));
    this.wireLinks();
  }

  public handleHref(href: string): false {
    if (this.startCallback && !this.started) {
      this.started = true;
      this.startCallback();
    }
    const match = Util.matchHref(href);
    let matchedScene: Scene | undefined = undefined;
    const actions: Action[] = [];
    if(match && match.toggles) {
      const toggles = match.toggles.split('+');
      for(let toggle of toggles) {
        if(this.story.actions[toggle]) {
          const action: Action = { ...this.story.actions[toggle] };
          action.description = this.resolveDescription(action.description);
          actions.push(action);
        }
        this.playerState[toggle] = true;
      }
    }
    if(match && match.target) {
      if(this.story.scenes[match.target]) {
        for(let scene of this.story.scenes[match.target]) {
          if(Util.conditionsMet(this.playerState, scene.conditions)) {
            const sceneConds = scene.conditions
              ? Object.keys(scene.conditions).length : 0;
            const matchConds = matchedScene && matchedScene.conditions
              ? Object.keys(matchedScene.conditions).length : 0;
            if(!matchedScene || sceneConds > matchConds) {
              matchedScene = scene;
            }
          }
        }
      }
    }
    if(matchedScene) {
      this.currentScene = matchedScene;
    }
    const newScene: Scene = { ...this.currentScene! };
    newScene.description = this.resolveDescription(newScene.description);
    this.disableOldLinks();
    let newContent = newScene.name ? `## ${ newScene.name }\n\n` : '';
    for(let action of actions) {
      newContent += `${ action.description }\n\n`;
    }
    newContent += newScene.description;
    const newHtml = this.processHtml(newScene.id!, this.converter.render(newContent));
    this.visitedScenes[newScene.id!] = true;
    if(this.options.scroll) {
      const scrollId = `move-${ this.moveCounter++ }`;
      this.container.append($('<span/>').attr('id', scrollId));
      this.container.append(newHtml);
      const scrollParent = this.options.scrollParent
        ? $(`#${ this.options.scrollParent }`)
        : $([document.documentElement, document.body]);
      scrollParent.animate({
        scrollTop: $(`#${ scrollId }`).offset()!.top,
      }, 1000);
    } else {
      this.container.html(newHtml);
      if (this.options.scrollParent) {
        $(`#${ this.options.scrollParent }`)[0].scrollTop = 0;
      } else {
        window.scrollTo(0, 0);
      }
    }
    this.wireLinks();
    this.checkGameOver();
    return false;
  }

  private resolveDescription(description: string): string {
    for(let anchor of Util.matchAnchors(description)) {
      const href = Util.matchHref(anchor.href);
      if(href && href.conditions) {
        const conditions = Util.toBoolHash(href.conditions.split('&'));
        const satisfied = Util.conditionsMet(this.playerState, conditions);
        const alts = Util.splitAltText(anchor.text);
        let replace = satisfied ? alts.passed : alts.failed;
        if(!replace) replace = '';
        replace = replace.replace(Util.regexLib.escapeChar(), '');
        if(replace === '' || (!href.toggles && !href.target)) {
          description = description.replace(anchor.anchor, replace);
        } else {
          let newHref = href.target ? `/${ href.target }` : '';
          newHref += href.toggles ? `#${ href.toggles }` : '';
          const newAnchor = `[${ replace }](${ newHref })`;
          description = description.replace(anchor.anchor, newAnchor);
        }
      }
    }
    description = description.replace(Util.regexLib.emptyListItem(), '');
    return description;
  }

  private disableOldLinks(): void {
    this.container.find('a:not(.external)').each((i, el) => {
      const $this = $(el);
      $this.addClass('disabled');
      $this.unbind('click');
      $this.click(() => false);
    });
  }

  private processHtml(sceneId: string, html: string): string {
    const temp = $('<div/>').append($.parseHTML(html));
    if(this.visitedScenes[sceneId]) {
      temp.find('blockquote').remove();
    } else {
      temp.find('blockquote').each((i, el) => {
        const $this = $(el);
        $this.replaceWith($this.html());
      });
    }
    return temp.html();
  }

  private wireLinks(): void {
    this.container.find('a:not(.disabled):not(.external)').each((i, el) => {
      const $this = $(el);
      const href = $this.attr('href');
      if(href) {
        if(!href.match(/^https?:\/\//)) {
          $this.click(() => {
            $this.addClass('chosen');
            const player: Player = $this.parents('.ficdown').data('player');
            return player.handleHref(href);
          });
        } else {
          $this.addClass('external');
        }
      }
    });
  }

  private checkGameOver(): void {
    if(this.container.find('a:not(.disabled):not(.external)').length === 0) {
      this.container.append(this.converter.render(this.endMarkdown));
      const restartAnchor = this.container.find("a[href='restart()']");
      const options = this.options;
      restartAnchor.click(() => {
        const game = $(`#${ options.id }`);
        const player = new Player(options);
        game.empty();
        game.data('player', player);
        player.play();
        return false;
      });
      if (this.finishCallback) {
        this.finishCallback();
      }
    }
  }
}
