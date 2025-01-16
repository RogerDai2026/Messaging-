import { fetchEventSource } from "@microsoft/fetch-event-source";
import { slog } from "../slog";
import {
  typedFetch,
  Post,
  isPostArray,
  PostArray,
  PATCHResponse,
  isPATCHResponse,
} from "./Validation";

/**
 * Handles API requests related to posts and workspace/channel management.
 */
export class MainContentModel {
  private currWorkspace: string | null = null;
  private currChannel: string | null = null;
  private ctrl: AbortController | null = null;

  /**
   * Public method that sets the current workspace and channel.
   * @param workspace - The current workspace.
   * @param channel - The current channel.
   */
  setCurrentWorkspaceChannel(workspace: string, channel: string): void {
    this.currWorkspace = workspace;
    this.currChannel = channel;
  }

  private postsPath: string;

  /**
   * Initializes with the API endpoint for posts.
   * @param postsPath - The base API endpoint for post-related requests.
   */
  constructor(postsPath: string) {
    this.postsPath = postsPath;
  }

  /**
   * Get the collections.
   * @param authToken - authentication token
   * @param workspace - workspace name
   * @param channel - channel name
   * @returns Post[] for the posts
   * */
  public async getCollections(
    authToken: string,
    workspace: string,
    channel: string,
  ): Promise<PostArray> {
    slog.info(
      "Fields in getCollection (model)",
      ["authToken", authToken],
      ["workspace", workspace],
      ["channel", channel],
    );
    const encodedWorkspaceName = encodeURIComponent(workspace);
    const encodedChannelName = encodeURIComponent(channel);
    slog.info(
      `${this.postsPath}${encodedWorkspaceName}/channels/${encodedChannelName}/posts/`,
    );

    return typedFetch<PostArray>(
      `${this.postsPath}${encodedWorkspaceName}/channels/${encodedChannelName}/posts/`,
      isPostArray,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      },
    )
      .then((response) => {
        slog.info("Fetched posts response:", ["response", response]);
        return response;
      })
      .catch((error) => {
        slog.error("Failed to fetch posts:", ["error", error]);
        throw error;
      });
  }

  /**
   * Subscribes to posts in the current workspace and channel, streaming them as they arrive.
   * @param authToken - The authentication token for authorization.
   * @param workspace - The name of the workspace to subscribe to.
   * @param channel - The name of the channel to subscribe to.
   * @param onMessage - Callback function to handle incoming posts.
   * @param onError - Optional callback to handle errors.
   */
  public subscribeToPosts(
    authToken: string,
    workspace: string,
    channel: string,
    onMessage: (post: Post) => void,
    onError?: (error: any) => void,
  ): void {
    if (!authToken) {
      throw new Error("No token provided");
    }

    if (this.ctrl) {
      this.ctrl.abort(); // Close SSE connection
    }
    this.ctrl = new AbortController();
    // Construct SSE URL
    const sseURL = `${this.postsPath}${encodeURIComponent(workspace)}/channels/${encodeURIComponent(channel)}/posts/?mode=subscribe`;
    fetchEventSource(sseURL, {
      method: "GET",
      headers: {
        "Content-Type": "text/event-stream",
        Authorization: `Bearer ${authToken}`,
      },
      signal: this.ctrl.signal,
      onmessage: (msg) => {
        if (!msg.data) {
          // Do i need to add validation
          return;
        }
        try {
          const data = JSON.parse(msg.data);
          onMessage(data);
        } catch (error) {
          slog.error("Failed to parse message:" + error);
        }
      },
      onerror: (error) => {
        slog.error("SSE connection error: " + error);
        this.ctrl?.abort(); // Abort on error
        if (onError) {
          onError(error);
        }
      },
    });
  }

  /**
   * Unsubscribes from the current post stream.
   */
  public unsubscribeToPosts(): void {
    if (this.ctrl) {
      this.ctrl.abort();
      this.ctrl = null;
      slog.info("Unsubscribed from posts");
    } else {
      slog.warn("No active subscription to posts to unsubscribe from");
    }
  }

  /**
   * Sends a reaction to a post, either adding or removing the reaction.
   * @param postPath - The API endpoint for reacting to a post.
   * @param remove - If `true`, removes the reaction; otherwise, adds the reaction.
   * @param reactionType - The type of reaction.
   * @param username - The username of the person reacting to the post.
   * @param token - The authentication token for authorization.
   * @throws Error if the current workspace or channel is not set.
   */
  public async reactPost(
    postPath: string,
    remove: boolean,
    reactionType: string,
    username: string,
    token: string,
  ): Promise<void> {
    if (!this.currWorkspace || !this.currChannel) {
      throw new Error("No current workspace or channel set");
    }

    slog.info(
      "Fields in reactPost (model)",
      ["postPath", postPath],
      ["remove", remove],
      ["reactionType", reactionType],
      ["username", username],
    );

    const segments = postPath.substring(1).split("/");
    const encodedSegments = segments.map((segment) =>
      encodeURIComponent(segment),
    );
    const encodedPath = encodedSegments.join("/");
    const reactPath = `${this.postsPath}${encodedPath}`;

    slog.info("React path:", ["reactPath", reactPath]);
    const options = {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify([
        {
          op: "ObjectAdd",
          path: "/reactions",
          value: {},
        },
        {
          op: "ObjectAdd",
          path: `/reactions/${reactionType}`,
          value: [],
        },
        {
          op: remove ? "ArrayRemove" : "ArrayAdd",
          path: `/reactions/${reactionType}`,
          value: username,
        },
      ]),
    };

    return typedFetch<PATCHResponse>(reactPath, isPATCHResponse, options)
      .then((response) => {
        if (response.patchFailed) {
          slog.error("Patch operation failed", ["response", response]);
          throw new Error("Failed to react to the post: PATCH failed");
        }
        slog.info("Reaction updated successfully:", ["response", response]);
      })
      .catch((error) => {
        slog.error("Error updating reactions:", ["error", error]);
        throw new Error(
          `Failed to update reactions: ${error.message || error}`,
        );
      });
  }
}
