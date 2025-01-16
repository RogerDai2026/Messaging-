import { slog } from "../slog";

/**
 * Handles deleting channels from a workspace.
 */
export class DeleteChannelModel {
  private deleteChannelPath: string;

  /**
   * Initializes the DeleteChannelModel with the API endpoint.
   * @param deleteChannelPath - The API endpoint for deleting a channel.
   */
  constructor(deleteChannelPath: string) {
    this.deleteChannelPath = deleteChannelPath;
  }

  /**
   * Sends a DELETE request to delete an existing channel.
   * @param authToken - The authentication token for authorization.
   * @param workspaceName - The name of the workspace containing the channel.
   * @param channelName - The name of the channel to delete.
   * @returns A promise that resolves when the request is complete.
   * @throws An error if the request fails.
   */
  public async deleteChannel(
    authToken: string,
    workspaceName: string,
    channelName: string,
  ): Promise<void> {
    const encodedWorkspaceName = encodeURIComponent(workspaceName);
    const encodedChannelName = encodeURIComponent(channelName);
    const requestUrl = `${this.deleteChannelPath}${encodedWorkspaceName}/channels/${encodedChannelName}`;

    slog.info(`Deleting channel at URL: ${requestUrl}`);

    try {
      const response = await fetch(requestUrl, {
        method: "DELETE",
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to delete channel: ${response.statusText}`);
      }

      slog.info("Channel deleted successfully:");
    } catch (error: any) {
      slog.error("Error deleting channel:", error);
      throw error;
    }
  }
}
