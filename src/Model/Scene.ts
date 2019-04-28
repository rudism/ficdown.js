import { BoolHash } from './';

export type Scene = {
  lineNumber: number,
  name: string,
  key: string,
  description: string,
  conditions?: BoolHash,
  id?: string;
}
