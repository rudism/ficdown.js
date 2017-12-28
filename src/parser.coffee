parseText = (text) ->
  lines = text.split /\n|\r\n/
  blocks = extractBlocks lines
  story = parseBlocks blocks

getBlockType = (hashCount) ->
  switch hashCount
    when 1 then 'story'
    when 2 then 'scene'
    when 3 then 'action'

extractBlocks = (lines) ->
  blocks = []
  currentBlock = null
  for line in lines
    match = line.match /^(#{1,3})\s+([^#].*)$/
    if match?
      if currentBlock != null
        blocks.push currentBlock
      currentBlock =
        type: getBlockType match[1].length
        name: match[2]
        lines: []
    else
      currentBlock.lines.push line
  if currentBlock != null
    blocks.push currentBlock
  return blocks

parseBlocks = (blocks) ->
  storyBlock = null
  for block in blocks
    if block.type == 'story'
      storyBlock = block
      break
  storyName = matchAnchor storyBlock.name
  storyHref = matchHref storyName.href
  story =
    name: storyName.text
    description: trimText storyBlock.lines.join "\n"
    firstScene: storyHref.target
    scenes: {}
    actions: {}
  for block in blocks
    switch block.type
      when 'scene'
        scene = blockToScene block
        if !story.scenes[scene.key]
          story.scenes[scene.key] = []
        story.scenes[scene.key].push scene
      when 'action'
        action = blockToAction block
        story.actions[action.state] = action
  return story

blockToScene = (block) ->
  sceneName = matchAnchor block.name
  if sceneName?
    title = if sceneName.title? then trimText sceneName.title else trimText sceneName.text
    key = normalize sceneName.text
    href = matchHref sceneName.href
    if href?.conditions?
      conditions = toBoolHash href.conditions.split '&'
  else
    title = trimText block.name
    key = normalize block.name
  scene =
    name: if title != '' then title else null
    key: key
    description: trimText block.lines.join "\n"
    conditions: if conditions? then conditions else null

blockToAction = (block) ->
  action =
    state: normalize block.name
    description: trimText block.lines.join "\n"
