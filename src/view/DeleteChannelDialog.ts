import { slog } from "../slog";

/**
 * A custom web component for displaying a dialog to confirm the deletion of a channel.
 * Extends `HTMLElement` and encapsulates the dialog's structure and behavior within the shadow DOM.
 */
export class DeleteChannelDialog extends HTMLElement {
  private shadow: ShadowRoot;
  private dialogContainer: HTMLElement;

  /**
   * Initializes the DeleteChannelDialog component.
   * Sets up the shadow DOM and prepares the dialog container for use.
   */
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });

    // Create the dialog container
    this.dialogContainer = document.createElement("div");
    this.dialogContainer.classList.add("delete-channel-dialog");
    this.dialogContainer.innerHTML = `
      <div class="delete-dialog-content">
        <h3>Delete Channel</h3>
        <input type="text" placeholder="Enter channel name" class="channel-input" />
        <button class="confirm-delete-channel">Delete</button>
        <button class="cancel-delete-channel">Cancel</button>
      </div>
    `;
    this.dialogContainer.style.display = "none"; // Hidden by default

    // Append the dialog to the shadow DOM
    this.shadow.appendChild(this.dialogContainer);

    // Add styles
    const style = document.createElement("style");
    style.textContent = `
      .delete-channel-dialog {
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

      .channel-input {
        padding: 10px;
        margin: 10px 0;
        width: 80%;
        border: 1px solid #ccc;
        border-radius: 5px;
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
      .querySelector(".confirm-delete-channel")
      ?.addEventListener("click", () => this.confirmDelete());

    this.shadow
      .querySelector(".cancel-delete-channel")
      ?.addEventListener("click", () => this.closeDialog());

    // Listen to "delete-channel" event
    document.addEventListener("delete-channel", () => this.openDialog());
  }

  /**
   * Opens the Delete Channel dialog.
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
   * Closes the Delete Channel dialog.
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
   * Handles the Delete button click.
   */
  private confirmDelete(): void {
    const input = this.shadow.querySelector(
      ".channel-input",
    ) as HTMLInputElement;
    const channelName = input.value.trim();
    if (channelName) {
      slog.info("Confirming channel deletion:", ["channelName", channelName]);
      // Dispatch a custom event to notify other components
      this.dispatchEvent(
        new CustomEvent("channel-deleted", {
          detail: { channelName },
          bubbles: true,
          composed: true,
        }),
      );
      input.value = "";
      this.closeDialog();
    } else {
      slog.error("Please enter a channel name.");
    }
  }
}
