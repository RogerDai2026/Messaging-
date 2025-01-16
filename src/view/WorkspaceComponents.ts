// src/view/WorkspaceComponent.ts

import { slog } from "../slog";

/**
 * A custom web component representing a workspace, extending `HTMLElement`.
 * Provides functionality for interacting with workspace-related elements,
 * including a dropdown, refresh button, and error container.
 */
export class WorkspaceComponent extends HTMLElement {
  private shadow: ShadowRoot;
  private dropdownContainer: HTMLElement;
  private refreshButtonworkspace: HTMLElement;
  private errorContainer: HTMLElement;

  /**
   * Creates and initializes the `WorkspaceComponent`.
   * This constructor sets up the shadow DOM and creates essential elements
   * such as a dropdown button and its event listeners.
   */
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });

    // Create the dropdown button within the shadow DOM
    const button = document.createElement("button");
    button.textContent = "Workspace";
    button.classList.add("dropbtn");
    button.addEventListener("click", () => this.toggleDropdownVisibility());

    // Create the dropdown container as a section within the shadow DOM
    this.dropdownContainer = document.createElement("section");
    this.dropdownContainer.classList.add("dropdown-container");

    // Create the error container
    this.errorContainer = document.createElement("section");
    this.errorContainer.classList.add("error-container");
    this.errorContainer.style.display = "none"; // Initially hidden

    // Create the refresh button
    this.refreshButtonworkspace = document.createElement("button");
    this.refreshButtonworkspace.textContent = "Refresh workspace";
    this.refreshButtonworkspace.classList.add("refresh-button-workspace");
    this.refreshButtonworkspace.addEventListener("click", () =>
      this.onRefreshButtonClick(),
    );

    this.shadow.append(this.refreshButtonworkspace);

    this.shadow.append(button, this.dropdownContainer, this.errorContainer);

    // Add styles
    const style = document.createElement("style");
    style.textContent = `
      .dropbtn {
        font-family: "Jersey20", sans-serif;
        font-size: 12pt;
        background-color: #420e39;
        color: white;
        border: none;
        padding: 10px;
        border-radius: 5px;
        cursor: pointer;
        position: fixed;
        top: 10px;
        right: 100px;
      }
      
      .dropdown-container {
        display: none;
        position: fixed;
        background-color: white;
        border: 3px solid #ccc;
        border-radius: 3px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        width: 80px;
      }
    
      .dropdown-item {
        font-family: "Jersey20", sans-serif;
        padding: 10px;
        cursor: pointer;
        font-size: 15px;
      }
    
      .dropdown-item:hover {
        background-color: #f0f0f0;
      }
      /* Styles for the error container */
      .error-container {
        position: fixed;
        top: 60px; /* Adjust as needed */
        right: 100px; /* Align with the dropbtn */
        z-index: 1001; /* Above the dropdown */
      }

      .error-button-workspace {
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
        border-radius: 5px;
        padding: 10px 15px;
        font-size: 14px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-width: 200px;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      }

      .error-button-workspace .close-icon {
        margin-left: 10px;
        font-weight: bold;
        cursor: pointer;
      }

      .error-button-workspace:hover {
        background-color: #f5c6cb;
      }
      .refresh-button-workspace {
        font-family: "Jersey20", sans-serif;
        font-size: 12pt;
        background-color: #420e39;
        color: white;
        border: none;
        padding: 10px;
        border-radius: 5px;
        cursor: pointer;
        position: fixed;
        top: 10px;
        right: 450px; 
        margin-right: 5px;
      }
      .refresh-button-workspace:hover {
        background-color: #4a6bb5;
      }
    `;
    this.shadow.appendChild(style);
  }

  /**
   * Toggles the dropdown visibility by dispatching a "get-workspaces" event.
   */
  private toggleDropdownVisibility(): void {
    if (this.dropdownContainer.style.display === "block") {
      this.dropdownContainer.style.display = "none";
    } else {
      // Dispatch a "get-workspaces" event
      this.dispatchEvent(
        new CustomEvent("get-workspaces", {
          bubbles: true,
          composed: true,
        }),
      );
      this.dropdownContainer.style.display = "block";
    }
  }

  /**
   * Populates the dropdown with workspace names.
   * @param workspaces Array of workspace names.
   */
  public updateDropdown(workspaces: string[]): void {
    this.dropdownContainer.innerHTML = ""; // Clear previous content

    workspaces.forEach((workspace) => {
      const item = document.createElement("section");
      item.classList.add("dropdown-item");
      item.textContent = workspace;
      item.addEventListener("click", () => this.onWorkspaceSelect(workspace));
      this.dropdownContainer.appendChild(item);
    });

    this.positionDropdown();
  }

  /**
   * Positions the dropdown under the "Workspace" button.
   */
  private positionDropdown(): void {
    const button = this.shadow.querySelector(".dropbtn") as HTMLButtonElement;
    if (button) {
      const rect = button.getBoundingClientRect();
      this.dropdownContainer.style.top = `${rect.bottom + window.scrollY + 8}px`;
      this.dropdownContainer.style.left = `${rect.left + window.scrollX}px`;
    }
  }

  /**
   * Handles workspace selection by dispatching a "workspace-select" event.
   * @param workspace Selected workspace name.
   */
  private onWorkspaceSelect(workspace: string): void {
    slog.info("Selected workspace", ["workspace", workspace]);
    this.dropdownContainer.style.display = "none";

    // Update the sidebar's h2 with the selected workspace name
    const sidebarTitle = document.querySelector(
      "#sidebar h2",
    ) as HTMLHeadingElement;
    if (sidebarTitle) {
      sidebarTitle.textContent = workspace;
    }

    // Dispatch a "workspace-select" event
    this.dispatchEvent(
      new CustomEvent("get-collections", {
        detail: { workspace },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /**
   * Displays an error message.
   * @param message - The error message to display.
   */
  public showError(message: string): void {
    // Clear any existing error messages
    this.errorContainer.innerHTML = "";

    // Create the error button
    const errorButton = document.createElement("button");
    errorButton.classList.add("error-button-workspace");
    errorButton.textContent = message;

    // Create the close icon
    const closeIcon = document.createElement("span");
    closeIcon.classList.add("close-icon");
    closeIcon.textContent = "✖"; // Unicode for "x"

    // Append the close icon to the error button
    errorButton.appendChild(closeIcon);

    // Add event listener to hide the error message when "x" is clicked
    closeIcon.addEventListener("click", () => this.hideError());

    // Append the error button to the error container
    this.errorContainer.appendChild(errorButton);

    // Make the error container visible
    this.errorContainer.style.display = "block";
  }

  /**
   * Hides the error message.
   */
  public hideError(): void {
    this.errorContainer.style.display = "none";
    this.errorContainer.innerHTML = "";
  }

  /**
   * Handles the click event for the refresh button.
   */
  private onRefreshButtonClick(): void {
    document.dispatchEvent(
      new CustomEvent("get-workspaces", {
        bubbles: true,
        composed: true,
      }),
    );
  }
}
