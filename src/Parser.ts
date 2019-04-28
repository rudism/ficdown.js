import {
  Action,
  Block,
  BlockType,
  BoolHash,
  Line,
  ParseError,
  Scene,
  Story,
} from './Model';
import { Util } from './Util';

export class Parser {
  public static parse(source: string): Story {
    const lines = source.split(/\n|\r\n/);
    const blocks = this.extractBlocks(lines);
    return this.parseBlocks(blocks);
  }

  private static getBlockType(hashCount: 1 | 2 | 3): BlockType {
    switch(hashCount) {
      case 1: return BlockType.Story;
      case 2: return BlockType.Scene;
      case 3: return BlockType.Action;
    }
  }

  private static extractBlocks(lines: string[]): Block[] {
    const blocks: Block[] = [];
    let currentBlock: Block | undefined = undefined;
    for(let i = 0; i < lines.length; i++) {
      const match = lines[i].match(/^(#{1,3})\s+([^#].*)$/);
      if(match) {
        if(currentBlock) blocks.push(currentBlock);
        currentBlock = {
          lineNumber: i,
          type: this.getBlockType(<1 | 2 | 3>match[1].length),
          name: match[2],
          lines: [],
        };
      } else if(currentBlock) {
        currentBlock.lines.push({ lineNumber: i, text: lines[i] });
      }
    }
    if(currentBlock) blocks.push(currentBlock);
    return blocks;
  }

  private static parseBlocks(blocks: Block[]): Story {
    let storyBlock: Block | undefined =
      blocks.find(b => b.type === BlockType.Story);

    if(!storyBlock) throw new ParseError('no story block', 0);
    const storyName = Util.matchAnchor(storyBlock.name);
    if(!storyName) throw new ParseError('no story name', storyBlock.lineNumber);
    const storyHref = Util.matchHref(storyName.href);
    if(!storyHref) throw new ParseError('no link to first scene', storyBlock.lineNumber);

    const story: Story = {
      name: storyName.text,
      description: Util.trimText(storyBlock.lines.join("\n")),
      firstScene: storyHref.target,
      scenes: {},
      actions: {},
    };

    for(let block of blocks) {
      switch(block.type) {
        case BlockType.Scene:
          const scene = this.blockToScene(block);
          if(!story.scenes[scene.key]) story.scenes[scene.key] = [];
          story.scenes[scene.key].push(scene);
          break;
        case BlockType.Action:
          const action = this.blockToAction(block);
          story.actions[action.state] = action;
          break;
      }
    }

    return story;
  }

  private static blockToScene(block: Block): Scene {
    const sceneName = Util.matchAnchor(block.name);
    let name: string | undefined = undefined;
    let key: string;
    let conditions: BoolHash | undefined = undefined;
    if(sceneName) {
      name = sceneName.title
        ? Util.trimText(sceneName.title)
        : Util.trimText(sceneName.text);
      key = Util.normalize(sceneName.text);
      const href = Util.matchHref(sceneName.href);
      if(href && href.conditions) conditions =
        Util.toBoolHash(href.conditions.split('&'));
    } else {
      name = Util.trimText(block.name);
      key = Util.normalize(block.name);
    }
    return {
      name,
      key,
      conditions,
      description: Util.trimText(block.lines.join("\n")),
      lineNumber: block.lineNumber,
    };
  }

  private static blockToAction(block: Block): Action {
    return {
      state: Util.normalize(block.name),
      description: Util.trimText(block.lines.join("\n")),
      lineNumber: block.lineNumber,
    };
  }
}
