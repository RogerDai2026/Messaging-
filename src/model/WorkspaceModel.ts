import { slog } from "../slog";
import { typedFetch, PostArray, isPostArray } from "./Validation";

/**
 * Handles workspace-related API requests.
 */
export class WorkspaceModel {
  private dbPath: string;

  /**
   * Initializes with the API endpoint for workspace data.
   * @param dbPath - The base API endpoint for workspace operations.
   */
  constructor(dbPath: string) {
    this.dbPath = dbPath;
  }

  /**
   *  Performs a GET DB request to retrieve the workspace data
   * @param authToken - The authentication token.
   * @returns Promise that resolves with the workspace data.
   * @throws Error if the request fails.
   * @throws Error if the response is not ok.
   */
  public async getWorkspaces(authToken: string): Promise<string[]> {
    slog.info(this.dbPath);
    return typedFetch(this.dbPath, isPostArray, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${authToken}`,
        accept: "application/json",
      },
    })
      .then((response: PostArray) => {
        return response.map((item) => {
          const pathSegments = item.path.split("/");
          return pathSegments[pathSegments.length - 1];
        });
      })
      .catch((error) => {
        slog.error("Error fetching workspaces:", error);
        throw error;
      });
  }
}
