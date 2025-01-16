import { slog } from "../slog";

/**
 * A custom web component that represents a dialog for creating a new channel.
 * Extends HTMLElement and uses shadow DOM to encapsulate styles and behavior.
 * Provides functionality to display and manage the creation of a channel within a workspace.
 */
export class CreateChannelDialog extends HTMLElement {
  private shadow: ShadowRoot;
  private dialogContainer: HTMLElement;

  /**
   * Initializes the CreateChannelDialog component.
   * Sets up the shadow DOM for the component and creates the dialog container.
   */
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });

    // Create the dialog container
    this.dialogContainer = document.createElement("div");
    this.dialogContainer.classList.add("create-channel-dialog");
    this.dialogContainer.innerHTML = `
      <div class="create-dialog-content">
        <h3>Create Channel</h3>
        <input type="text" placeholder="Enter channel name" class="channel-input-box" />
        <button class="submit-channel">Submit</button>
        <button class="cancel-create">Cancel</button>
      </div>
    `;
    this.dialogContainer.style.display = "none"; // Hidden by default

    // Append the dialog to the shadow DOM
    this.shadow.appendChild(this.dialogContainer);

    // Add styles
    const style = document.createElement("style");
    style.textContent = `
      .create-channel-dialog {
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

      .channel-input-box {
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
      .querySelector(".submit-channel")
      ?.addEventListener("click", () => this.submitChannel());

    this.shadow
      .querySelector(".cancel-create")
      ?.addEventListener("click", () => this.closeDialog());

    // Listen to "create-channel" event
    document.addEventListener("create-channel", () => this.openDialog());
  }

  /**
   * Opens the Create Channel dialog.
   */
  private openDialog(): void {
    this.dialogContainer.style.display = "block";
    const backPage = document.getElementById("app");
    if (backPage) {
      backPage.classList.add("blur");
      backPage.style.pointerEvents = "none";
    }
  }

  /**
   * Closes the Create Channel dialog.
   */
  private closeDialog(): void {
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
  private submitChannel(): void {
    const input = this.shadow.querySelector(
      ".channel-input-box",
    ) as HTMLInputElement;
    const channelName = input.value.trim();
    if (channelName) {
      slog.info("Submitting new channel:", ["channelName", channelName]);
      // Dispatch a custom event with the channel name
      this.dispatchEvent(
        new CustomEvent("channel-created", {
          detail: { channelName },
          bubbles: true,
          composed: true,
        }),
      );
      input.value = ""; // Clear the input field
      this.closeDialog();
    } else {
      slog.error("Channel name is required.");
    }
  }
}

// Register the custom element
