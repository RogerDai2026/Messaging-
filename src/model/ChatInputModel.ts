// src/model/CreateChannelModel.ts

import { slog } from "../slog";
import { typedFetch, URI, isURI } from "./Validation";

/**
 * ChatInputModel is responsible for handling chat message creation and replies within channels of a workspace.
 * It interacts with the API to post new messages or reply to existing messages.
 */
export class ChatInputModel {
  private postChatPath: string;

  /**
   * Initializes the CreateChannelModel with the API endpoint.
   * @param postChatPath - The API endpoint for creating a channel.
   */
  constructor(postChatPath: string) {
    this.postChatPath = postChatPath;
  }

  /**
   * Posts a new message to a specified channel within a workspace.
   * @param authToken - The authorization token required for authenticating the request.
   * @param workspaceName - The name of the workspace where the channel exists.
   * @param channelName - The name of the channel to which the message will be posted.
   * @param chatInput - The content of the message to be posted.
   * @returns A promise that resolves to the URI of the created chat post.
   * @throws {Error} If the request fails or the post is unsuccessful.
   * */
  async postToChat(
    authToken: string,
    workspaceName: string,
    channelName: string,
    chatInput: string,
  ): Promise<URI> {
    const encodedWorkspaceName = encodeURIComponent(workspaceName);
    const encodedChannelName = encodeURIComponent(channelName);
    const requestUrl = `${this.postChatPath}${encodedWorkspaceName}/channels/${encodedChannelName}/posts/`;

    slog.info(`Posting to chat at URL: ${requestUrl}`);
    slog.info("Request data", ["chatInput", chatInput]);
    return typedFetch(requestUrl, isURI, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ msg: chatInput }), // TODO: what is this
    })
      .then((response) => {
        return response;
      })
      .catch((error) => {
        slog.error("Error:", error);
        throw new Error("Failed to post to chat."); // Rethrow or handle gracefully
      });
  }

  /**
   * Replies to an existing message in a channel, creating a threaded message.
   * @param authToken - The authorization token required for authenticating the request.
   * @param workspaceName - The name of the workspace where the channel exists.
   * @param channelName - The name of the channel to which the reply will be posted.
   * @param chatInput - The content of the reply message.
   * @param parent - The ID of the parent message being replied to.
   * @returns A promise that resolves to the URI of the reply post.
   * @throws {Error} If the request fails or the reply is unsuccessful.
   * */
  public async replyToChat(
    authToken: string,
    workspaceName: string,
    channelName: string,
    chatInput: string,
    parent: string,
  ): Promise<URI> {
    const encodedWorkspaceName = encodeURIComponent(workspaceName);
    const encodedChannelName = encodeURIComponent(channelName);
    const requestUrl = `${this.postChatPath}${encodedWorkspaceName}/channels/${encodedChannelName}/posts/`;

    slog.info(`Reply to chat at URL: ${requestUrl}`);
    slog.info("Request data", ["chatInput", chatInput]);
    return typedFetch(requestUrl, isURI, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ msg: chatInput, parent: parent }),
    })
      .then((response) => {
        return response;
      })
      .catch((error) => {
        slog.error("Error:", error);
        throw new Error("Failed to post reply.");
      });
  }
}
