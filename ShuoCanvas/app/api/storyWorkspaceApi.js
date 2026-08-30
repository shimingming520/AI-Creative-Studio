import { get as a175_0x2c822c, post as a175_0x3e6859 } from "./requester.js";
const STORY_WORKSPACE_USER_FILE = "/api/v2/user/story-workspace.json";
export async function fetchStoryWorkspaceFromServer() {
  return await a175_0x2c822c(STORY_WORKSPACE_USER_FILE, {
    allow404Null: true,
    provider: "local"
  });
}
export async function saveStoryWorkspaceToServer(_0x39187d) {
  return await a175_0x3e6859(STORY_WORKSPACE_USER_FILE, _0x39187d || {}, {
    provider: "local"
  });
}