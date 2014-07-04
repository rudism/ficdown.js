regexLib =

  anchors: /(\[((?:[^\[\]]+|\[(?:[^\[\]]+|\[(?:[^\[\]]+|\[(?:[^\[\]]+|\[(?:[^\[\]]+|\[(?:[^\[\]]+|\[\])*\])*\])*\])*\])*\])*)\]\([ ]*((?:[^()\s]+|\((?:[^()\s]+|\((?:[^()\s]+|\((?:[^()\s]+|\((?:[^()\s]+|\((?:[^()\s]+|\(\))*\))*\))*\))*\))*\))*)[ ]*((['"])(.*?)\5[ ]*)?\))/gm

  href: /^(?:\/([a-zA-Z](?:-?[a-zA-Z0-9])*))?(?:\?((?:!?[a-zA-Z](?:-?[a-zA-Z0-9])*)(?:&!?[a-zA-Z](?:-?[a-zA-Z0-9])*)*)?)?(?:#((?:[a-zA-Z](?:-?[a-zA-Z0-9])*)(?:\+[a-zA-Z](?:-?[a-zA-Z0-9])*)*))?$/

  trim: /^\s+|\s+$/g

  altText: /^((?:[^|\\]|\\.)*)(?:\|((?:[^|\\]|\\.)+))?$/

  escapeChar: /\\(?=[^\\])/g

  emptyListItem: /^[ ]*-\s*([\r\n]+|$)/gm

matchAnchor = (text) ->
  re = new RegExp regexLib.anchors
  match = re.exec text
  if match?
    result =
      anchor: match[1]
      text: match[2]
      href: match[3]
      title: match[6]
    if result.href.indexOf('"') == 0
      result.title = result.href.substring 1, result.href.length - 1
      result.href = ''
    return result
  return match

matchAnchors = (text) ->
  re = new RegExp regexLib.anchors
  anchors = []
  while match = re.exec text
    anchor =
      anchor: match[1]
      text: match[2]
      href: match[3]
      title: match[6]
    if anchor.href.indexOf('"') == 0
      anchor.title = anchor.href.substring 1, anchor.href.length - 1
      anchor.href = ''
    anchors.push anchor
  return anchors

trimText = (text) ->
  text.replace regexLib.trim, ''

matchHref = (href) ->
  re = new RegExp regexLib.href
  match = re.exec href
  if match?
    result =
      target: match[1]
      conditions: match[2]
      toggles: match[3]
    return result
  return match

normalize = (text) ->
  text.toLowerCase().replace(/^\W+|\W+$/g, '').replace /\W+/g, '-'

toBoolHash = (names) ->
  if !names?
    return null
  hash = {}
  for name in names
    if name.indexOf('!') == 0
      hash[name.substring 1, name.length] = false
    else
      hash[name] = true
  return hash

conditionsMet = (state, conditions) ->
  met = true
  for cond, val of conditions
    if (val and !state[cond]) or (!val and state[cond])
      met = false
      break
  return met

splitAltText = (text) ->
  re = new RegExp regexLib.altText
  match = re.exec text
  if match?
    result =
      passed: match[1]
      failed: match[2]
    return result
  return
