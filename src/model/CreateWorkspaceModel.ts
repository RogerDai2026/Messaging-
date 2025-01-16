// src/model/CreateWorkspaceModel.ts

import { slog } from "../slog";
import { typedFetch, URI, isURI } from "./Validation";

/**
 * Handles creating workspaces and initializing channels within them.
 */
export class CreateWorkspaceModel {
  private createWorkspacePath: string;

  /**
   * Initializes the CreateWorkspaceModel with the API endpoint.
   * @param createWorkspacePath - The API endpoint for creating a workspace.
   */
  constructor(createWorkspacePath: string) {
    this.createWorkspacePath = createWorkspacePath;
  }

  /**
   * Sends a PUT request to create a new workspace, then initializes channels for the workspace.
   * @param authToken - The authentication token for authorization.
   * @param workspaceName - The name of the workspace to create.
   * @returns A promise that resolves with the workspace URI.
   * @throws CreateWorkspaceError if any of the requests fail.
   */
  public async createWorkspace(
    authToken: string,
    workspaceName: string,
  ): Promise<URI> {
    const encodedWorkspaceName = encodeURIComponent(workspaceName);
    const requestUrl = `${this.createWorkspacePath}${encodedWorkspaceName}`;

    slog.info(`Creating workspace at URL: ${requestUrl}`);

    try {
      // First PUT request to create the workspace
      const workspaceResponse: URI = await typedFetch(
        requestUrl,
        isURI, // Validation function to check the response structure
        {
          method: "PUT",
          headers: {
            accept: "application/json",
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ name: workspaceName }), // Adjust the body as per your API requirements
        },
      );

      slog.info("Workspace created successfully:", [
        "workspaceResponse",
        workspaceResponse,
      ]);

      // Second PUT request to initialize channels for the workspace
      const channelsUrl = `${requestUrl}/channels/`;
      slog.info(`Initializing channels at URL: ${channelsUrl}`);

      const channelsResponse: URI = await typedFetch(
        channelsUrl,
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

      slog.info("Channels initialized successfully:", [
        "channelsResponse",
        channelsResponse,
      ]);

      // Optionally, you can return both responses or just the workspace response
      // Here, we'll return the workspace response
      return workspaceResponse;
    } catch (error: any) {
      // Log the error details
      slog.error("Error in createWorkspace:", ["error", error]);
      // Throw a custom error to be handled by the controller
      throw error;
    }
  }
}
