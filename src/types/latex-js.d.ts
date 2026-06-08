declare module "latex.js" {
  export class HtmlGenerator {
    constructor(options?: { hyphenate?: boolean });
    domFragment(): DocumentFragment;
    stylesAndScripts(base: string): HTMLHeadElement;
  }
  export function parse(
    latex: string,
    options?: { generator: HtmlGenerator }
  ): HtmlGenerator;
}
