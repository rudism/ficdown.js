import { Line } from './';

export enum BlockType {
  Action,
  Scene,
  Story,
}

export type Block = {
  lineNumber: number,
  type: BlockType,
  name: string,
  lines: Line[],
}
