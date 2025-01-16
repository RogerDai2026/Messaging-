// src/model/CreateChannelModel.ts

import { slog } from "../slog";
import { typedFetch, URI, isURI } from "./Validation";

/**
 * Handles creating channels and initializing posts within a workspace.
 */
export class CreateChannelModel {
  private createChannelPath: string;

  /**
   * Initializes the CreateChannelModel with the API endpoint.
   * @param createChannelPath - The API endpoint for creating a channel.
   */
  constructor(createChannelPath: string) {
    this.createChannelPath = createChannelPath;
  }

  /**
   * Sends a PUT request to create a new channel, then initializes posts for the channel.
   * @param authToken - The authentication token for authorization.
   * @param workspaceName - The name of the workspace containing the channel.
   * @param channelName - The name of the channel to create.
   * @returns A promise that resolves with the channel URI.
   * @throws An error if any of the requests fail.
   */
  public async createChannel(
    authToken: string,
    workspaceName: string,
    channelName: string,
  ): Promise<URI> {
    const encodedWorkspaceName = encodeURIComponent(workspaceName);
    const encodedChannelName = encodeURIComponent(channelName);
    const requestUrl = `${this.createChannelPath}${encodedWorkspaceName}/channels/${encodedChannelName}`;

    slog.info(`Creating channel at URL: ${requestUrl}`);

    // First PUT request to create the channel
    try {
      const channelResponse: URI = await typedFetch(
        requestUrl,
        isURI, // Validation function to check the response structure
        {
          method: "PUT",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ name: channelName }), // Adjust the body as per your API requirements
        },
      );

      // Second POST request to initialize posts for the channel
      const postsUrl = `${requestUrl}/posts/`;
      slog.info(`Initializing posts at URL: ${postsUrl}`);

      const postsResponse: URI = await typedFetch(
        postsUrl,
        isURI, // Validation function to check the response structure
        {
          method: "PUT",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({}), // Assuming no body is needed; adjust if necessary
        },
      );

      slog.info("Channel created successfully:", [
        "PostResponse",
        postsResponse,
      ]);

      // Optionally, you can return both responses or just the channel response
      // Here, we'll return the channel response
      return channelResponse;
    } catch (error: any) {
      slog.error("Error:", error);
      throw error; // Rethrow or handle gracefully
    }
  }
}
