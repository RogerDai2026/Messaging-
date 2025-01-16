import { slog } from "../slog";

/**
 * Sidebar Component: GET Doc which contains all the collections.
 */
export class SidebarComponent extends HTMLElement {
  private shadow: ShadowRoot;
  private sidebarContainer: HTMLElement;
  private refreshButton: HTMLElement;
  private errorContainersidebar: HTMLElement;

  /**
   * Constructor defines the shadow root and appends the sidebar container to the shadow root.
   */
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });

    // Create the sidebar container within the shadow DOM
    this.sidebarContainer = document.createElement("section");
    this.sidebarContainer.classList.add("sidebar-container");

    this.shadow.append(this.sidebarContainer);

    // Create the refresh button
    this.refreshButton = document.createElement("button");
    this.refreshButton.textContent = "Refresh channels";
    this.refreshButton.classList.add("refresh-button-sidebar");
    this.refreshButton.addEventListener("click", () =>
      this.onRefreshButtonClick(),
    );

    this.shadow.append(this.refreshButton);
    // Create the error container
    this.errorContainersidebar = document.createElement("section");
    this.errorContainersidebar.classList.add("error-container");
    this.errorContainersidebar.style.display = "none"; // Initially hidden

    this.shadow.append(this.errorContainersidebar);

    // Add styles
    const style = document.createElement("style");
    style.textContent = `
        .sidebar-container {
          background-color: #E99E75;
          color: black;
          padding: 10px;
          width: 200px;
          position: fixed;
          overflow-y: auto;
          left: 0; 
        }
        .sidebar-item {
          font-family: "Jersey20", sans-serif;
          font-size: 1.55em;
          margin-bottom: 15px;
          padding: 10px;
          cursor: pointer;
          color: white;
          font-weight: bold;
        }
        .sidebar-item:hover {
          background-color: #f0f0f0;
        }
        .refresh-button-sidebar {
          font-family: "Jersey20", sans-serif;
          font-size: 12pt;
          margin-top: 410px;
          padding: 8px 10px;
          cursor: pointer;
          background-color: #420e39;
          color: white;
          border: none;
          border-radius: 10px;
        }
        .refresh-button-sidebar:hover {
          background-color: #4a6bb5;
        }
        /* Styles for the error container */
      .error-container {
        position: fixed;
        top: 500px; /* Adjust as needed */
        left: 0; /* Align with the sidebar */
        z-index: 1001; /* Above the dropdown */
      }

      .error-button-channel {
        background-color: #f8d7da;
        color: #721c24;
        border: 1px solid #f5c6cb;
        border-radius: 5px;
        padding: 10px 15px;
        font-size: 12px;
        cursor: pointer;
        display: flex;
        align-items: left;
        justify-content: space-between;
        box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
      }

      .error-button-channel.close-icon {
        margin-left: 10px;
        font-weight: bold;
        cursor: pointer;
      }

      .error-button-channe :hover {
        background-color: #f5c6cb;
      }
      `;
    this.shadow.appendChild(style);
  }

  /**
   * Lifecycle method called when the element is connected to the DOM.
   * Listens for the "workspace-select" event and attaches the event listener for handling workspace selection.
   */
  connectedCallback() {
    // Listen for the workspace-select event when the element is connected to the DOM
    document.addEventListener(
      "workspace-select",
      this.handleWorkspaceSelect as EventListener,
    );
  }

  /**
   * Lifecycle method called when the element is disconnected from the DOM.
   * Removes the event listener for the "workspace-select" event to clean up resources.
   */
  disconnectedCallback() {
    // Clean up the event listener when the element is removed from the DOM
    document.removeEventListener(
      "workspace-select",
      this.handleWorkspaceSelect as EventListener,
    );
  }

  /**
   * Handles the "workspace-select" event, retrieves the collections for the selected workspace,
   * and updates the component accordingly.
   * @param event - The event triggered when a workspace is selected.
   */
  private handleWorkspaceSelect = (event: Event) => {
    const customEvent = event as CustomEvent;
    const workspace = customEvent.detail.workspace;
    document.dispatchEvent(
      new CustomEvent("get-collections", {
        detail: { workspace },
        bubbles: true,
        composed: true,
      }),
    );
  };

  /**
   * Populates the workspace with the collections retrieved for the selected workspace.
   * @param collections - An array of collection names to be displayed in the workspace.
   * @param workspaceName - The name of the workspace for which the collections are being populated.
   */
  public populateCollections(
    collections: string[],
    workspaceName: string,
  ): void {
    this.sidebarContainer.innerHTML = ""; // Clear previous content

    // Update the workspace title (h2)
    const title = document.querySelector("#sidebar h2");
    if (title) {
      title.textContent = workspaceName || "Unknown Workspace";
    } else {
      const newTitle = document.createElement("h2");
      newTitle.textContent = workspaceName || "Unknown Workspace";
      this.sidebarContainer.insertBefore(
        newTitle,
        this.sidebarContainer.firstChild,
      );
    }

    // Add each collection (channel) as a clickable item
    collections.forEach((collection) => {
      const item = document.createElement("section");
      item.classList.add("sidebar-item");
      item.textContent = collection;
      item.addEventListener("click", () => this.onChannelSelect(collection));
      this.sidebarContainer.appendChild(item);
    });
  }

  /**
   * onChannelSelect function to select the channel
   * @param channel - The name of the channel to be selected.
   */
  public onChannelSelect(channel: string): void {
    slog.info("Selected channel in sidebar (sidebar onChannelSelect)", [
      "channel",
      channel,
    ]);
    const workspaceNameElement = document.querySelector("#sidebar h2");
    const workspaceName = workspaceNameElement
      ? workspaceNameElement.textContent?.trim()
      : "Unknown Workspace";
    slog.info("workspacename to be passed into event", ["channel", channel]);
    document.dispatchEvent(
      new CustomEvent("channel-select", {
        detail: { workspaceName, channel },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /**
   * Handles the click event for the refresh button.
   * Triggers the refresh logic for the workspace component.
   */
  private onRefreshButtonClick(): void {
    const workspaceNameElement = document.querySelector("#sidebar h2");
    const workspace = workspaceNameElement
      ? workspaceNameElement.textContent?.trim()
      : "Unknown Workspace";

    slog.info("Refresh button clicked");
    slog.info("workspaceName to be passed into event", [
      "workspaceName",
      workspace,
    ]);
    document.dispatchEvent(
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
    this.errorContainersidebar.innerHTML = "";

    // Create the error button
    const errorButton = document.createElement("button");
    errorButton.classList.add("error-button-channel");
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
    this.errorContainersidebar.appendChild(errorButton);

    // Make the error container visible
    this.errorContainersidebar.style.display = "block";
  }

  /**
   * Hides the error message.
   */
  public hideError(): void {
    this.errorContainersidebar.style.display = "none";
    this.errorContainersidebar.innerHTML = "";
  }
}
