/**
 * A custom web component representing a button to edit a channel.
 * Extends the `HTMLElement` class and provides functionality to open a dialog
 * for managing channels when the button is clicked.
 */
export class EditChannelButton extends HTMLElement {
  private shadow: ShadowRoot;
  private channelDialog: HTMLElement;
  // private editButton: HTMLElement | null;

  /**
   * Initializes the EditChannelButton component.
   * Sets up the shadow DOM for the component and attaches event listeners.
   * Creates an "Edit Channel" button that, when clicked, opens the channel dialog for managing channels.
   */
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });

    // Create edit channel button
    const editButton = document.getElementById(
      "edit-channel-button",
    ) as HTMLButtonElement;
    editButton.textContent = "Manage Channels";
    // editButton.classList.add("editbtn");
    editButton.addEventListener("click", () => this.openChannelDialog());

    // Create the channel dialog container
    this.channelDialog = document.createElement("section");
    this.channelDialog.classList.add("channel-dialog");
    this.channelDialog.innerHTML = `
        <section class="dialog-content">
          <h3>Manage Channels</h3>
          <button class="create-channel">Create Channel</button>
          <button class="delete-channel">Delete Channel</button>
          <button class="close-dialog">Close</button>
        </section>
      `;
    this.channelDialog.style.display = "none"; // Hidden by default

    // Append elements to the shadow DOM
    this.shadow.append(this.channelDialog);
    // Append elements to the shadow DOM

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
          top-margin: 400px;
        }

        .create-channel-btn {
          background-color: #e5c3d1;
          color: white;
          border: none;
          padding: 10px;
          border-radius: 5px;
          cursor: pointer;
          width: 100%;

        }
  
        .channel-dialog {
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
          color: black;
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
      .querySelector(".create-channel")
      ?.addEventListener("click", () => this.handleCreateChannel());

    this.shadow
      .querySelector(".delete-channel")
      ?.addEventListener("click", () => this.handleDeleteChannel());

    this.shadow
      .querySelector(".close-dialog")
      ?.addEventListener("click", () => this.closeChannelDialog());
  }

  // connectedCallback(): void {
  //   const editButton = document.getElementById(
  //     "edit-channel-button",
  //   ) as HTMLButtonElement;
  //   editButton.textContent = "Manage Channels";
  //   editButton.classList.add("editbtn");
  //   editButton.addEventListener("click", () => this.openChannelDialog());
  // }

  /**
   * Opens the Channel Management dialog.ff
   */
  private openChannelDialog(): void {
    this.channelDialog.style.display = "block";
    const backPage = document.getElementById("app");
    if (backPage) {
      backPage.classList.add("blur");
      backPage.style.pointerEvents = "none"; // Disable interaction
    }
  }

  /**
   * Closes the Channel Management dialog.
   */
  private closeChannelDialog(): void {
    this.channelDialog.style.display = "none";
    const backPage = document.getElementById("app");
    if (backPage) {
      backPage.classList.remove("blur");
      backPage.style.pointerEvents = ""; // Restore interaction
    }
  }

  /**
   * Handles the Create Channel button click.
   */
  private handleCreateChannel(): void {
    this.closeChannelDialog();

    // Dispatch a custom event to notify other components
    this.dispatchEvent(
      new CustomEvent("create-channel", {
        bubbles: true,
        composed: true,
      }),
    );
  }

  /**
   * Handles the Delete Channel button click.
   */
  private handleDeleteChannel(): void {
    this.closeChannelDialog();

    // Dispatch a custom event to notify other components
    this.dispatchEvent(
      new CustomEvent("delete-channel", {
        bubbles: true,
        composed: true,
      }),
    );
  }
}
