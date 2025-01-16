// src/model/DeleteWorkspaceModel.ts

import { slog } from "../slog";
//import { typedFetch } from "./Validation";

/**
 * Handles deleting channels from a workspace.
 */
export class DeleteWorkspaceModel {
  private deleteWorkspacePath: string;

  /**
   * Initializes the DeleteWorkspaceModel with the API endpoint.
   * @param deleteWorkspacePath - The API endpoint for deleting a workspace.
   */
  constructor(deleteWorkspacePath: string) {
    this.deleteWorkspacePath = deleteWorkspacePath;
  }

  /**
   * Sends a DELETE request to delete a workspace.
   * @param authToken - The authentication token for authorization.
   * @param workspaceName - The name of the workspace to delete.
   * @returns A promise that resolves with the response data.
   * @throws An error if the request fails.
   */
  public async deleteWorkspace(
    authToken: string,
    workspaceName: string,
  ): Promise<void> {
    const encodedWorkspaceName = encodeURIComponent(workspaceName);
    const requestUrl = `${this.deleteWorkspacePath}${encodedWorkspaceName}`;

    slog.info(`Deleting workspace at URL: ${requestUrl}`);

    try {
      const response = await fetch(requestUrl, {
        method: "DELETE",
        headers: {
          accept: "*/*",
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (!response.ok) {
        throw new Error(`Failed to delete workspace: ${response.statusText}`);
      }
    } catch (error: any) {
      slog.error("Error deleting workspace:", error);
      throw error;
    }
  }
}
