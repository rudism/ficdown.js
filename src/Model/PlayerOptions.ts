export type PlayerOptions = {
  source: string, // ficdown story source
  id: string, // id of div to inject game into
  scroll?: boolean, // continuous scroll mode
  html?: boolean, // allow html in story source
  startText?: string, // custom link text to start game
  endMarkdown?: string, // custom markdown when game ends
}
