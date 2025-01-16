/**
 * A custom web component representing a button to edit a workspace.
 * Extends the `HTMLElement` class and provides functionality to open a dialog
 * for managing workspace settings when the button is clicked.
 */
export class EditWorkspaceButton extends HTMLElement {
  private shadow: ShadowRoot;
  private editDialog: HTMLElement;

  /**
   * Initializes the `EditWorkspaceButton` component.
   * Sets up the shadow DOM and creates the edit dialog container.
   */
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });

    // Create the edit dialog container
    this.editDialog = document.createElement("section");
    this.editDialog.classList.add("edit-dialog");
    this.editDialog.innerHTML = `
      <section class="dialog-content">
        <h3>Edit Workspace</h3>
        <button class="create-workspace">Create Workspace</button>
        <button class="delete-workspace">Delete Workspace</button>
        <button class="close-dialog">Close</button>
      </section>
    `;
    this.editDialog.style.display = "none"; // Hidden by default

    // Append elements to the shadow DOM
    this.shadow.append(this.editDialog);

    // Add styles
    const style = document.createElement("style");
    style.textContent = `
      .editbtn {
        background-color: #e5c3d1;
        color: white;
        border: none;
        padding: 10px;
        border-radius: 5px;
        cursor: pointer;
        position: fixed;
        top: 10px;
        right: 200px; /* Adjusted to position next to "Workspace" button */
        margin-right: 5px;
      }

      .edit-dialog {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #ffffff;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        z-index: 2000;
        width: 300px;
        display: none; /* Hidden by default */
      }

      .dialog-content {
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .dialog-content h3 {
        margin-bottom: 15px;
      }

      .dialog-content button {
        background-color: #e5c3d1;
        color: white;
        border: none;
        padding: 10px 20px;
        margin: 10px 0;
        cursor: pointer;
        border-radius: 5px;
        width: 80%;
        font-size: 14px;
      }

      .dialog-content button:hover {
        background-color: #d4a8bb;
      }

      .close-dialog {
        background-color: #ccc;
        color: #333;
      }

      .close-dialog:hover {
        background-color: #bbb;
      }
      .blur {
        filter: blur(8px);
        -webkit-filter: blur(8px);
        
      }
    `;
    this.shadow.appendChild(style);

    // Bind event listeners for dialog buttons
    this.shadow
      .querySelector(".create-workspace")
      ?.addEventListener("click", () => this.handleCreateWorkspace());

    this.shadow
      .querySelector(".delete-workspace")
      ?.addEventListener("click", () => this.handleDeleteWorkspace());

    this.shadow
      .querySelector(".close-dialog")
      ?.addEventListener("click", () => this.closeEditDialog());
  }

  /**
   * Called when the `EditWorkspaceButton` element is added to the DOM.
   * Sets up the edit button by adding text, a CSS class, and an event listener
   * to open the edit dialog when clicked.
   */
  connectedCallback(): void {
    const editButton = document.getElementById(
      "edit-workspace-button",
    ) as HTMLButtonElement;
    editButton.textContent = "Edit Workspace";
    editButton.classList.add("editbtn");
    editButton.addEventListener("click", () => this.openEditDialog());
  }

  /**
   * Opens the Edit Workspace dialog.
   */
  private openEditDialog(): void {
    this.editDialog.style.display = "block";
    const backPage = document.getElementById("app");
    if (backPage) {
      backPage.classList.add("blur");
      backPage.style.pointerEvents = "none"; // Disable interaction
    }
  }

  /**
   * Closes the Edit Workspace dialog.
   */
  private closeEditDialog(): void {
    this.editDialog.style.display = "none";
    const backPage = document.getElementById("app");
    if (backPage) {
      backPage.classList.remove("blur");
      backPage.style.pointerEvents = ""; // Restore interaction
    }
  }

  /**
   * Handles the Create Workspace button click.
   */
  private handleCreateWorkspace(): void {
    this.closeEditDialog();

    // Dispatch a custom event to notify parent components or other parts of the app
    this.dispatchEvent(
      new CustomEvent("create-workspace", {
        bubbles: true,
        composed: true,
      }),
    );
  }

  /**
   * Handles the Delete Workspace button click.
   */
  private handleDeleteWorkspace(): void {
    this.closeEditDialog();
    // Dispatch a custom event to notify parent components or other parts of the app
    this.dispatchEvent(
      new CustomEvent("delete-workspace", {
        bubbles: true,
        composed: true,
      }),
    );
  }
}
