export class ParseError extends Error {
  constructor(message: string, public lineNumber: number) {
    super(lineNumber === 0
      ? message
      : `[${ lineNumber }]: ${ message }`);
  }
}
