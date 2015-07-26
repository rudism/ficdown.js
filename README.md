# Ficdown.js

Ficdown is a system for building interactive fiction using MarkDown syntax, and Ficdown.js is a Javascript library for presenting Ficdown stories interactively in a web browser. See [Ficdown.com](http://www.ficdown.com/) for more information.

## Dependencies

Ficdown.js uses [jQuery](http://jquery.com) for DOM manipulation and [PageDown](https://code.google.com/p/pagedown/) to convert MarkDown into HTML.

## Usage

You can obtain *ficdown.js* or *ficdown.min.js* from the latest version on the [releases](https://github.com/rudism/Ficdown.js/releases) page. Assuming you've uploaded it to your web server along with a Ficdown story file named *story.md*, your HTML document would look something like this:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <title>My Ficdown Story</title>
  </head>
  <body>
    <!-- This container will be used by Ficdown.js to present the story -->
    <div id="main"></div>

    <!-- include Ficdown.js dependencies from CDNs -->
    <script src="http://code.jquery.com/jquery-2.1.1.min.js"></script>
    <script src="http://cdnjs.cloudflare.com/ajax/libs/pagedown/1.0/Markdown.Converter.min.js"></script>
    <script src="http://cdnjs.cloudflare.com/ajax/libs/pagedown/1.0/Markdown.Sanitizer.min.js"></script>

    <!-- include locally hosted Ficdown.js -->
    <script src="ficdown.min.js"></script>

    <script>
      // retrieve the Ficdown source file story.md via ajax
      $.get('story.md', function(data){

        // after retrieving the file, parse it
        story = parseText(data);

        // after parsing the story, load it into the div with id='main'
        player = new Player(story, 'main');
        player.play();

      }, 'text');
    </script>
  </body>
</html>
```

You will probably want to do some styling to make the story look better. For an example stylesheet, see the example included in the Ficdown.js repository at [/src/example/player.styl](/src/example/player.styl).
