class Player
  constructor: (
    @story,
    @id,
    @startText = "Click to start...",
    @endText = '## The End\n\nYou have reached the end of this story. <a id="restart" href="">Click here</a> to start over.'
  ) ->
    @converter = new Markdown.Converter()
    @container = $("##{@id}")
    @container.addClass('ficdown').data 'player', this
    @playerState = {}
    @visitedScenes = {}
    @currentScene = null
    @moveCounter = 0
    i = 0
    scene.id = "s#{++i}" for scene in scenes for key, scenes of @story.scenes

  play: ->
    @container.html @converter.makeHtml "##{@story.name}\n\n#{@story.description}\n\n[#{@startText}](/#{@story.firstScene})"
    @wireLinks()

  wireLinks: ->
    @container.find('a:not(.disabled):not(.external)').each (i) ->
      $this = $(this)
      if !$this.attr('href').match(/^https?:\/\//)?
        $this.click ->
          $this.addClass 'chosen'
          player = $this.parents('.ficdown').data 'player'
          player.handleHref $this.attr 'href'
          return false
      else
        $this.addClass 'external'

  resolveDescription: (description) ->
    for anchor in matchAnchors description
      href = matchHref anchor.href
      if href.conditions?
        conditions = toBoolHash href.conditions.split '&'
        satisfied = conditionsMet @playerState, conditions
        alts = splitAltText anchor.text
        replace = if satisfied then alts.passed else alts.failed
        if !replace?
          replace = ''
        replace = replace.replace regexLib.escapeChar, ''
        if replace == '' or (!href.toggles? and !href.target?)
          description = description.replace anchor.anchor, replace
        else
          newAnchor = "[#{replace}](#{ if href.target? then "/#{href.target}" else "" }#{ if href.toggles? then "##{href.toggles}" else "" })"
          description = description.replace anchor.anchor, newAnchor
    description = description.replace regexLib.emptyListItem, ''
    return description

  disableOldLinks: ->
    @container.find('a:not(.external)').each (i) ->
      $this = $(this)
      $this.addClass 'disabled'
      $this.unbind 'click'
      $this.click -> return false

  processHtml: (sceneid, html) ->
    temp = $('<div/>').append $.parseHTML html
    if @visitedScenes[sceneid]
      temp.find('blockquote').remove()
    else
      temp.find('blockquote').each (i) ->
        $this = $(this)
        $this.replaceWith $this.html()
    return temp.html()

  checkGameOver: ->
    if @container.find('a:not(.disabled):not(.external)').length == 0
      @container.append @converter.makeHtml @endText
      $('#restart').data('info', [@id, @story]).click ->
        info = $(this).data 'info'
        $("##{info[0]}").empty()
        player = new Player info[1], info[0]
        $("##{info[0]}").data 'player', player
        player.play()
        return false

  handleHref: (href) ->
    match = matchHref href
    matchedScene = null
    actions = []
    if match?.toggles?
      toggles = match.toggles.split '+'
      for toggle in toggles
        if @story.actions[toggle]?
          action = $.extend {}, @story.actions[toggle]
          action.description = @resolveDescription action.description
          actions.push action
        @playerState[toggle] = true
    if match?.target?
      if @story.scenes[match.target]?
        for scene in @story.scenes[match.target]
          if conditionsMet @playerState, scene.conditions
            if !matchedScene? or !scene.conditions? or !matchedScene.conditions? or Object.keys(scene.conditions).length > Object.keys(matchedScene.conditions).length
              matchedScene = scene
    if matchedScene?
      @currentScene = matchedScene
    newScene = $.extend {}, @currentScene
    newScene.description = @resolveDescription newScene.description
    @disableOldLinks()
    newContent = ""
    newContent += "###{newScene.name}\n\n" if newScene.name?
    newContent += "#{action.description}\n\n" for action in actions
    newContent += newScene.description
    newHtml = @processHtml newScene.id, @converter.makeHtml newContent
    @visitedScenes[newScene.id] = true
    scrollId = "move-#{@moveCounter++}"
    @container.append $('<span/>').attr 'id', scrollId
    @container.append newHtml
    @wireLinks()
    @checkGameOver()
    @container.parent('.container').animate
      scrollTop: $("##{scrollId}").offset().top - @container.offset().top
    , 1000
