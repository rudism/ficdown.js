import { Anchor, Href, BoolHash, AltText } from './Model';

export class Util {
  public static regexLib: { [name: string]: () => RegExp } = {
    anchors: () => /(\[((?:[^\[\]]+|\[(?:[^\[\]]+|\[(?:[^\[\]]+|\[(?:[^\[\]]+|\[(?:[^\[\]]+|\[(?:[^\[\]]+|\[\])*\])*\])*\])*\])*\])*)\]\([ ]*((?:[^()\s]+|\((?:[^()\s]+|\((?:[^()\s]+|\((?:[^()\s]+|\((?:[^()\s]+|\((?:[^()\s]+|\(\))*\))*\))*\))*\))*\))*)[ ]*((['"])(.*?)\5[ ]*)?\))/gm,

    href: () => /^(?:\/([a-zA-Z](?:-?[a-zA-Z0-9])*))?(?:\?((?:!?[a-zA-Z](?:-?[a-zA-Z0-9])*)(?:&!?[a-zA-Z](?:-?[a-zA-Z0-9])*)*)?)?(?:#((?:[a-zA-Z](?:-?[a-zA-Z0-9])*)(?:\+[a-zA-Z](?:-?[a-zA-Z0-9])*)*))?$/,

    trim: () => /^\s+|\s+$/g,

    altText: () => /^((?:[^|\\]|\\.)*)(?:\|((?:[^|\\]|\\.)+))?$/,

    escapeChar: () => /\\(?=[^\\])/g,

    emptyListItem: () => /^[ ]*-\s*([\r\n]+|$)/gm,
  };

  private static matchToAnchor(match: RegExpExecArray): Anchor {
    const result = {
      anchor: match[1],
      text: match[2],
      href: match[3],
      title: match[6],
    };
    if(result.href.indexOf('"') === 0 || result.href.indexOf("'") === 0) {
      result.title = result.href.substring(1, result.href.length - 1);
      result.href = '';
    }
    return result;
  }

  public static matchAnchor(text: string): Anchor | undefined {
    const match = this.regexLib.anchors().exec(text);
    if(match) return this.matchToAnchor(match);
  }

  public static matchAnchors(text: string): Anchor[] {
    let match: RegExpExecArray | null;
    const anchors: Anchor[] = [];
    const regex = this.regexLib.anchors();
    while((match = regex.exec(text)) !== null) {
      anchors.push(this.matchToAnchor(match));
    }
    return anchors;
  }

  public static matchHref(text: string): Href | undefined {
    const match = this.regexLib.href().exec(text);
    if(match) {
      return {
        target: match[1],
        conditions: match[2],
        toggles: match[3],
      };
    }
  }

  public static trimText(text: string): string {
    return text.replace(this.regexLib.trim(), '');
  }

  public static normalize(text: string): string {
    return text.toLowerCase().replace(/^\W+|\W+$/g, '').replace(/\W+/g, '-');
  }

  public static toBoolHash(names: string[]): BoolHash | undefined {
    if(names) {
      const hash: BoolHash = {};
      for(let name of names) {
        if(name.indexOf('!') === 0) {
          hash[name.substring(1, name.length)] = false;
        } else {
          hash[name] = true;
        }
      }
      return hash;
    }
  }

  public static conditionsMet(state: BoolHash, conditions?: BoolHash): boolean {
    if(!conditions) return true;
    for(let [cond, val] of Object.entries(conditions)) {
      if((val && !state[cond]) || (!val && state[cond])) {
        return false;
      }
    }
    return true;
  }

  public static splitAltText(text: string): AltText {
    const match = this.regexLib.altText().exec(text);
    if(match) {
      return {
        passed: match[1],
        failed: match[2],
      };
    }
    return {};
  }
}
