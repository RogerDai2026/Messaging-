// src/components/CreateWorkspaceDialog.ts

import { slog } from "../slog";

/**
 * A custom web component that represents a dialog for creating a workspace.
 * Extends HTMLElement and uses shadow DOM to encapsulate styles and behavior.
 * Provides functionality to display and manage the creation of a new workspace.
 */
export class CreateWorkspaceDialog extends HTMLElement {
  private shadow: ShadowRoot;
  private dialogContainer: HTMLElement;

  /**
   * Initializes the CreateWorkspaceDialog component.
   * Attaches a shadow DOM and creates the dialog container element.
   */
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });

    // Create the dialog container
    this.dialogContainer = document.createElement("div");
    this.dialogContainer.classList.add("create-dialog");
    this.dialogContainer.innerHTML = `
      <div class="create-dialog-content">
        <h3>Create Workspace</h3>
        <input type="text" placeholder="Enter workspace name" class="workspace-input-box" />
        <button class="submit-workspace">Submit</button>
        <button class="cancel-create">Cancel</button>
      </div>
    `;
    this.dialogContainer.style.display = "none"; // Hidden by default

    // Append the dialog to the shadow DOM
    this.shadow.appendChild(this.dialogContainer);

    // Add styles
    const style = document.createElement("style");
    style.textContent = `
      .create-dialog {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #ffffff;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        z-index: 3000;
        width: 300px;
        display: none; /* Hidden by default */
      }

      .create-dialog-content {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .create-dialog-content h3 {
        margin-bottom: 15px;
      }

      .workspace-input-box {
        padding: 10px;
        margin: 10px 0;
        width: 80%;
        border: 1px solid #ccc;
        border-radius: 5px;
      }

      .create-dialog-content button {
        background-color: #e5c3d1;
        color: white;
        border: none;
        padding: 10px 20px;
        margin: 5px 0;
        cursor: pointer;
        border-radius: 5px;
        width: 80%;
        font-size: 14px;
      }

      .create-dialog-content button:hover {
        background-color: #d4a8bb;
      }

      .cancel-create {
        background-color: #ccc;
        color: #333;
      }

      .cancel-create:hover {
        background-color: #bbb;
      }

      .blur {
        filter: blur(8px);
        -webkit-filter: blur(8px);
        
      }
    `;
    this.shadow.appendChild(style);

    // Bind event listeners
    this.shadow
      .querySelector(".submit-workspace")
      ?.addEventListener("click", () => this.submitWorkspace());

    this.shadow
      .querySelector(".cancel-create")
      ?.addEventListener("click", () => this.closeDialog());

    // Listen to "create-workspace" event
    document.addEventListener("create-workspace", () => this.openDialog());
  }

  /**
   * Opens the Create Workspace dialog.
   */
  public openDialog(): void {
    this.dialogContainer.style.display = "block";
    const backPage = document.getElementById("app");
    if (backPage) {
      backPage.classList.add("blur");
      backPage.style.pointerEvents = "none";
    }
  }

  /**
   * Closes the Create Workspace dialog.
   */
  public closeDialog(): void {
    this.dialogContainer.style.display = "none";
    const backPage = document.getElementById("app");
    if (backPage) {
      backPage.classList.remove("blur");
      backPage.style.pointerEvents = ""; // Restore interaction
    }
  }

  /**
   * Handles the Submit button click.
   */
  private submitWorkspace(): void {
    const input = this.shadow.querySelector(
      ".workspace-input-box",
    ) as HTMLInputElement;
    const workspaceName = input.value.trim();
    if (workspaceName) {
      slog.info("Submitting new workspace:", ["workspaceName", workspaceName]);
      // Dispatch a custom event with the workspace name
      this.dispatchEvent(
        new CustomEvent("workspace-created", {
          detail: { workspaceName },
          bubbles: true,
          composed: true,
        }),
      );
      //clear the input field
      input.value = "";
      this.closeDialog();
    } else {
      slog.error("Please enter a workspace name.");
    }
  }
}
