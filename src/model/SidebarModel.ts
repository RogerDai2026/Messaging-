import { slog } from "../slog";
import { typedFetch, PostArray, isPostArray } from "./Validation";

/**
 * Handles sidebar-related API requests for workspace collections.
 */
export class SidebarModel {
  private channelPath: string;

  /**
   * Initializes with the API endpoint for channel and collection operations.
   * @param channelPath - The base API endpoint for collection-related requests.
   */
  constructor(channelPath: string) {
    this.channelPath = channelPath;
  }

  /**
   * Performs a GET DB request to retrieve the collection data for a specific workspace
   * @param authToken - The authentication token.
   * @param workspace - The workspace name.
   * @returns Promise that resolves with the collection data.
   * @throws Error if the request fails.
   * @throws Error if the response is not ok.
   */
  public getCollections(
    authToken: string,
    workspace: string,
  ): Promise<string[]> {
    const encodedWorkspaceName = encodeURIComponent(workspace);
    const url = `${this.channelPath}${encodedWorkspaceName}/channels/`;

    return typedFetch<PostArray>(url, isPostArray, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    })
      .then((response: PostArray) => {
        return response.map((item) => {
          const pathSegments = item.path.split("/");
          return pathSegments[pathSegments.length - 1];
        });
      })
      .catch((error) => {
        slog.error("Failed to fetch collections:", ["error", error]);
        throw new Error(
          `Unable to retrieve collections: ${error.message || error}`,
        );
      });
  }
}
