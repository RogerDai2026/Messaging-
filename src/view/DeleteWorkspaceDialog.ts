// src/components/DeleteWorkspaceDialog.ts

import { slog } from "../slog";

/**
 * A custom web component for displaying a dialog to confirm the deletion of a workspace.
 * Extends `HTMLElement` and encapsulates the dialog's structure and behavior within the shadow DOM.
 */
export class DeleteWorkspaceDialog extends HTMLElement {
  private shadow: ShadowRoot;
  private dialogContainer: HTMLElement;
  // private workspaceName: string = "";

  /**
   * Initializes the DeleteWorkspaceDialog component.
   * Attaches a shadow DOM and creates the dialog container element.
   */
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });

    // Create the dialog container
    this.dialogContainer = document.createElement("div");
    this.dialogContainer.classList.add("delete-dialog");
    this.dialogContainer.innerHTML = `
      <div class="delete-dialog-content">
        <h3>Delete Workspace</h3>
        <input type="text" placeholder="Enter workspace name" class="workspace-input" />
        <button class="confirm-delete-workspace">Delete</button>
        <button class="cancel-delete-workspace">Cancel</button>
      </div>
    `;
    this.dialogContainer.style.display = "none"; // Hidden by default

    // Append the dialog to the shadow DOM
    this.shadow.appendChild(this.dialogContainer);

    // Add styles
    const style = document.createElement("style");
    style.textContent = `
      .delete-dialog {
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

      .delete-dialog-content {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .delete-dialog-content h3 {
        margin-bottom: 15px;
      }

      .workspace-input {
        padding: 10px;
        margin: 10px 0;
        width: 80%;
        border: 1px solid #ccc;
        border-radius: 5px;
      }

      .delete-dialog-content p {
        margin-bottom: 20px;
        text-align: center;
      }

      .delete-dialog-content button {
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

      .delete-dialog-content button:hover {
        background-color: #d4a8bb;
      }

      .cancel-delete {
        background-color: #ccc;
        color: #333;
      }

      .cancel-delete:hover {
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
      .querySelector(".confirm-delete-workspace")
      ?.addEventListener("click", () => this.confirmDelete());

    this.shadow
      .querySelector(".cancel-delete-workspace")
      ?.addEventListener("click", () => this.closeDialog());

    // Listen to "delete-workspace" event with detail
    document.addEventListener("delete-workspace", (event: Event) =>
      this.openDialog(),
    );
  }

  /**
   * Opens the Delete Workspace dialog.
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
   * Closes the Delete Workspace dialog.
   */
  public closeDialog(): void {
    this.dialogContainer.style.display = "none";
    const backPage = document.getElementById("app");
    if (backPage) {
      backPage.classList.remove("blur");
      backPage.style.pointerEvents = "";
    }
  }

  /**
   * Handles the Delete button click.
   */
  private confirmDelete(): void {
    const input = this.shadow.querySelector(
      ".workspace-input",
    ) as HTMLInputElement;
    const workspaceName = input.value.trim();
    if (workspaceName) {
      slog.info("Confirming workspace deletion:", [
        "workspaceName",
        workspaceName,
      ]);
      // Dispatch a custom event to notify parent components or other parts of the app
      this.dispatchEvent(
        new CustomEvent("workspace-deleted", {
          detail: { workspaceName: workspaceName },
          bubbles: true,
          composed: true,
        }),
      );
      input.value = ""; // Clear the input field
      this.closeDialog();
    } else {
      slog.error("Workspace name is required.");
    }
  }
}
