declare module "*.js" {
  const value: any;
  export = value;
}

declare module "../shuocanvas-legacy/api/storyGenerationApi.js" {
  export function generateStoryDraft(options?: any): Promise<any>;
  export function generateStoryEpisodeScript(options?: any): Promise<any>;
  export function extractStoryAssets(options?: any): Promise<any>;
  export function planStoryEpisodes(options?: any): Promise<any>;
  export function splitStoryEpisode(options?: any): Promise<any>;
}
