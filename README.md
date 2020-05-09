# Ficdown.js

Ficdown is a system for building interactive fiction using MarkDown syntax, and Ficdown.js is a Javascript library for presenting Ficdown stories interactively in a web browser. See [Ficdown.com](http://www.ficdown.com/) for more information.

## Dependencies

The generated ficdown.js and ficdown.min.js include all dependencies ([JQuery](https://jquery.com), [markdown-it](https://github.com/markdown-it/markdown-it), and [core-js](https://github.com/zloirock/core-js)), so no additional scripts are required to play games.

## Bulding

You can compile, pack, and minify with these commands:

```
> npm install
> npm run build
> npm run pack
> npm run minify
```

You can combine all three `build`, `pack`, and `minify` steps with this command:

```
> npm run make
```

## Usage

You can obtain *ficdown.js* or *ficdown.min.js* from the latest version on the [releases](https://github.com/rudism/Ficdown.js/releases) page. See the example [test.html](https://github.com/rudism/Ficdown.js/blob/master/test.html) file for basic usage and styling. The example includes the story content in a hidden text area so it can run locally in a browser.

```javascript
var player = new Ficdown(playerOptions);
player.play();
```

Your `playerOptions` should be an object with the following properties:

- `source`: Your story's ficdown code. Either store it right in the html document, or make an XHR to pull the story content in from an external file, and put its content here.
- `id`: The id of a div on the page to inject the game into. For example if your html is `<div id='game'/>` then you would pass `game` here.
- `scroll` (optional): Set this to `true` if you want the player's full game history to remain on the screen and automatically scroll the page down whenever a new scene is added to the bottom. By default each scene will replace the previous one and the page will be scrolled to the top.
- `html` (optional): Set this to true if your ficdown file contains raw html that you want rendered. By default html will not be rendered.
- `startText` (optional): Set this to override the link text that begins the game.
- `endMarkdown` (optional): Set this to override the "game over" content that is displayed when the player reaches a scene with no more links to follow. Include an anchor with the href set to `restart()` if you want a link that will start the story over from the beginning.
- `start` (optional): Javascript callback function to execute when the user clicks the first link to begin the story.
- `finish` (optional): Javascript callback function to execute when the story has finished.
