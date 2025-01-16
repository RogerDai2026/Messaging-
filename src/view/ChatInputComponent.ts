import { slog } from "../slog";

/**
 * A custom web component representing a chat input field with various formatting and emoji buttons.
 * It extends `HTMLElement` and provides functionality to format text and insert emojis into the input area.
 */
export class ChatInputComponent extends HTMLElement {
  private shadow: ShadowRoot;
  private container: HTMLElement;
  private toolbar: HTMLElement;
  private inputContainer: HTMLElement;
  private sendButton: HTMLButtonElement;
  private inputElement: HTMLTextAreaElement;
  private closeButton: HTMLButtonElement;

  // Formatting buttons
  private boldButton: HTMLButtonElement;
  private italicButton: HTMLButtonElement;
  private linkButton: HTMLButtonElement;

  // Emoji buttons
  private smileButton: HTMLButtonElement;
  private frownButton: HTMLButtonElement;
  private likeButton: HTMLButtonElement;
  private celebrateButton: HTMLButtonElement;

  /**
   * Initializes the `ChatInputComponent` by setting up the shadow DOM
   * and preparing the necessary elements for the input area, toolbar, and buttons.
   */
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });
    slog.info("Initializing ChatInputComponent");

    // Create the main container
    this.container = document.createElement("div");
    this.container.setAttribute("id", "container");

    // Create the toolbar
    this.toolbar = document.createElement("div");
    this.toolbar.setAttribute("id", "toolbar");

    // Create formatting buttons
    this.boldButton = document.createElement("button");
    this.boldButton.setAttribute("id", "bold-button");
    this.boldButton.innerHTML =
      '<iconify-icon icon="mdi:format-bold"></iconify-icon>';
    this.boldButton.title = "Bold";

    this.italicButton = document.createElement("button");
    this.italicButton.setAttribute("id", "italic-button");
    this.italicButton.innerHTML =
      '<iconify-icon icon="mdi:format-italic"></iconify-icon>';
    this.italicButton.title = "Italic";

    this.linkButton = document.createElement("button");
    this.linkButton.setAttribute("id", "link-button");
    this.linkButton.innerHTML =
      '<iconify-icon icon="mdi:link-variant"></iconify-icon>';
    this.linkButton.title = "Link";

    // Create emoji buttons
    this.smileButton = document.createElement("button");
    this.smileButton.setAttribute("id", "smile-button");
    this.smileButton.innerHTML =
      '<iconify-icon icon="twemoji:smiling-face"></iconify-icon>';
    this.smileButton.title = ":smile:";

    this.frownButton = document.createElement("button");
    this.frownButton.setAttribute("id", "frown-button");
    this.frownButton.innerHTML =
      '<iconify-icon icon="twemoji:frowning-face"></iconify-icon>';
    this.frownButton.title = ":frown:";

    this.likeButton = document.createElement("button");
    this.likeButton.setAttribute("id", "like-button");
    this.likeButton.innerHTML =
      '<iconify-icon icon="twemoji:thumbs-up"></iconify-icon>';
    this.likeButton.title = ":like:";

    this.celebrateButton = document.createElement("button");
    this.celebrateButton.setAttribute("id", "celebrate-button");
    this.celebrateButton.innerHTML =
      '<iconify-icon icon="twemoji:party-popper"></iconify-icon>';
    this.celebrateButton.title = ":celebrate:";

    // Append buttons to toolbar
    this.toolbar.appendChild(this.boldButton);
    this.toolbar.appendChild(this.italicButton);
    this.toolbar.appendChild(this.linkButton);
    this.toolbar.appendChild(this.smileButton);
    this.toolbar.appendChild(this.frownButton);
    this.toolbar.appendChild(this.likeButton);
    this.toolbar.appendChild(this.celebrateButton);

    // Create the input container
    this.inputContainer = document.createElement("section");
    this.inputContainer.setAttribute("id", "chat-input-container");

    // Initialize the send button and input element
    this.sendButton = document.createElement("button");
    this.sendButton.setAttribute("id", "send-button");
    this.sendButton.textContent = "Post";

    this.inputElement = document.createElement("textarea");
    this.inputElement.setAttribute("id", "chat-input");
    this.inputElement.setAttribute("placeholder", "Type your message here...");

    this.closeButton = document.createElement("button");
    this.closeButton.setAttribute("id", "close-button");
    this.closeButton.textContent = "Close";

    // Append input and buttons to the input container
    this.inputContainer.appendChild(this.inputElement);
    this.inputContainer.appendChild(this.sendButton);
    this.inputContainer.appendChild(this.closeButton);

    // Append toolbar and input container to the main container
    this.container.appendChild(this.toolbar);
    this.container.appendChild(this.inputContainer);

    // Append the container to the shadow DOM
    this.shadow.appendChild(this.container);

    // Add styles
    const style = document.createElement("style");
    style.textContent = `
      #container {
        display: flex;
        flex-direction: column;
      }

      #toolbar {
        display: flex;
        align-items: center;
        background-color: #e0e0e0;
        padding: 5px;
        border-radius: 4px;
        border-bottom: 0.7px solid #ccc;
      }

      #toolbar button {
        background: none;
        border: none;
        cursor: pointer;
        margin-right: 5px;
        font-size: 1.2em;
      }

      #toolbar button:hover {
        background-color: #d0d0d0;
      }

      #toolbar button .iconify {
        font-size: 1.2em;
      }

      #chat-input-container {
        display: flex;
        align-items: center;
        padding: 10px;
        background-color: #e0e0e0;
      }
      
      #chat-input-container textarea {
        flex-grow: 1;
        padding: 10px;
        font-size: 1em;
        resize: vertical; /* Allow vertical resizing */
        height: 60px;
        border-radius: 5px;
        border: 1px solid #ccc;
        font-family: inherit; /* Match the font to the rest of the app */
      }
      #send-button {
        background-color: #420e39;
        color: white;
        border: none;
        padding: 10px 20px;
        margin-left: 10px;
        cursor: pointer;
        border-radius: 5px;
      }
      #send-button:hover {
        background-color: #292643;
      }

      #close-button {
        background-color: #ff4d4d;
        color: white;
        border: none;
        padding: 10px 20px;
        cursor: pointer;
        border-radius: 5px;
        visibility: hidden; /* Hidden by default */
        margin-left: 5px;
      }
      
      #close-button:hover {
        background-color: #e60000;
      }
    `;
    this.shadow.appendChild(style);

    // Event listeners
    this.sendButton.addEventListener("click", () => this.handleSendMessage());
    this.inputElement.addEventListener("keydown", (event) =>
      this.handleKeyDown(event),
    );

    // Formatting button event listeners
    this.boldButton.addEventListener("click", () => this.handleBold());
    this.italicButton.addEventListener("click", () => this.handleItalic());
    this.linkButton.addEventListener("click", () => this.handleLink());

    // Emoji button event listeners
    this.smileButton.addEventListener("click", () =>
      this.insertAtCursor(":smile:"),
    );
    this.frownButton.addEventListener("click", () =>
      this.insertAtCursor(":frown:"),
    );
    this.likeButton.addEventListener("click", () =>
      this.insertAtCursor(":like:"),
    );
    this.celebrateButton.addEventListener("click", () =>
      this.insertAtCursor(":celebrate:"),
    );
  }

  /**
   * Handles the `keydown` event for the chat input field.
   * @param event - The `KeyboardEvent` triggered when a key is pressed.
   */
  private handleKeyDown(event: KeyboardEvent): void {
    if (event.key === "Enter" && !event.shiftKey) {
      // Prevent default behavior of adding a newline
      event.preventDefault();
      this.handleSendMessage();
    }
    // If Shift+Enter, allow the newline to be inserted
  }

  /**
   * Handles the sending of a message from the chat input field.
   */
  private handleSendMessage(): void {
    const message = this.inputElement?.value.trim();
    slog.info("Sending message:", ["message", message]);

    // Only send the message if it's not empty, need to think about this.
    if (message) {
      // Dispatch a custom event with the message
      this.dispatchEvent(
        new CustomEvent("post-message", {
          detail: { message },
          bubbles: true,
          composed: true,
        }),
      );

      // Clear the input field after sending
      this.inputElement.value = "";
    } else {
    }
  }

  /**
   * Wraps the currently selected text in the input element with the specified wrapper.
   * @param wrapper - The string that will wrap the selected text (e.g., "**" for bold).
   */
  private wrapSelection(wrapper: string): void {
    const textarea = this.inputElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const selection = textarea.value.substring(start, end);

    const newText = wrapper + selection + wrapper;

    // Replace the selected text with the new text
    this.replaceSelection(newText);
  }

  /**
   * Replaces the currently selected text in the input element with the specified text.
   * @param text - The text that will replace the selected text in the input element.
   */
  private replaceSelection(text: string): void {
    const textarea = this.inputElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // Get the text before and after the selection
    const before = textarea.value.substring(0, start);
    const after = textarea.value.substring(end);

    // Set the new value
    textarea.value = before + text + after;

    // Update the cursor position
    const newCursorPosition = start + text.length;
    textarea.selectionStart = textarea.selectionEnd = newCursorPosition;

    // Focus the textarea
    textarea.focus();
  }

  /**
   * Inserts the specified text at the current cursor position in the input element.
   * @param text - The text to be inserted at the cursor position.
   */
  private insertAtCursor(text: string): void {
    const textarea = this.inputElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    // Get the text before and after the selection
    const before = textarea.value.substring(0, start);
    const after = textarea.value.substring(end);

    // Set the new value
    textarea.value = before + text + after;

    // Set the cursor position
    const newCursorPosition = start + text.length;
    textarea.selectionStart = textarea.selectionEnd = newCursorPosition;

    // Focus the textarea
    textarea.focus();
  }

  /**
   * Wraps the selected text with double asterisks to format it as bold.
   */
  private handleBold(): void {
    this.wrapSelection("**");
  }

  /**
   * Wraps the selected text with single asterisks to format it as italic.
   */
  private handleItalic(): void {
    this.wrapSelection("*");
  }

  /**
   * Inserts a Markdown-style link around the selected text or at the cursor.
   */
  private handleLink(): void {
    const textarea = this.inputElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;

    const selection = textarea.value.substring(start, end);

    const newText = "[" + selection + "]" + "()";

    // Replace the selected text with the new text
    this.replaceSelection(newText);
  }
}
