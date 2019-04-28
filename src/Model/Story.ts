import { Scene, Action } from './';

export type Story = {
  name: string,
  description: string,
  firstScene: string,
  scenes: { [key: string]: Scene[] },
  actions: { [key: string]: Action },
}
