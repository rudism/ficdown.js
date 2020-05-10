export type PlayerOptions = {
  source: string, // ficdown story source
  id: string, // id of div to inject game into
  scroll?: boolean, // continuous scroll mode
  scrollParent?: string, // id of the parent container to scroll
  html?: boolean, // allow html in story source
  startText?: string, // custom link text to start game
  endMarkdown?: string, // custom markdown when game ends
  start?: () => void, // callback when the game starts
  finish?: () => void, // callback when the game finishes
}
