import { typedFetch } from "./Validation";
import { isAuth } from "./Validation";

/**
 * Handles user authentication and logout operations.
 */
export class LoginModel {
  private authPath: string;

  /**
   * Initializes with the API endpoint for authentication.
   * @param authPath - The base API endpoint for authentication.
   */
  constructor(authPath: string) {
    this.authPath = authPath;
  }

  /**
   * Submits the username to owlDB and returns the token.
   * @param username - The username entered by the user.
   * @returns Promise that resolves with the authentication token.
   * @throws An error if the request fails.
   */
  public async authenticate(username: string): Promise<string> {
    try {
      const response = await typedFetch(this.authPath, isAuth, {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });
      return response.token;
    } catch (error: any) {
      throw new Error("Authentication failed.");
    }
  }

  /**
   * Sends a DELETE request to log out the user.
   * @param authToken - The authentication token for authorization.
   * @returns Promise that resolves when the user is logged out.
   * @throws An error if the request fails.
   */
  public async logout(authToken: string): Promise<void> {
    try {
      const response = await fetch(this.authPath, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error("Logout failed in model.");
      }
    } catch (error: any) {
      throw new Error("Logout failed in model.");
    }
  }
}
