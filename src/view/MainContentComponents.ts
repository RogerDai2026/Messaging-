import { slog } from "../slog";
import type { JSONSchema, FromSchema } from "json-schema-to-ts";

/**
 * JSON Schema definition for the metadata of a post.
 */
const PostMetaSchema = {
  $id: "postMeta.json",
  $schema: "http://json-schema.org/draft-07/schema",
  title: "PostMeta",
  type: "object",
  required: ["createdBy", "createdAt"],
  properties: {
    createdBy: { type: "string" },
    createdAt: { type: "number" },
  },
  additionalProperties: false,
} as const satisfies JSONSchema;

/**
 * JSON Schema definition for the document structure of a post.
 */
const PostDocSchema = {
  $id: "postDoc.json",
  $schema: "http://json-schema.org/draft-07/schema",
  title: "PostDoc",
  type: "object",
  required: [],
  properties: {
    msg: { type: "string" },
    parent: { type: "string" },
    reactions: {
      type: "object",
      additionalProperties: {
        type: "array",
        items: { type: "string" },
      },
    },
    p2group64: { type: "string" }, // our extension?
  },
  additionalProperties: true, // Allow other arbitrary fields, but ignore them (other exntensions that arent ours)
} as const satisfies JSONSchema;

/**
 * JSON Schema definition for the structure of a post.
 */
const PostSchema = {
  $id: "post.json",
  $schema: "http://json-schema.org/draft-07/schema",
  title: "Post",
  type: "object",
  required: ["path", "doc", "meta"],
  properties: {
    path: { type: "string" },
    doc: { $ref: "postDoc.json" },
    meta: { $ref: "postMeta.json" },
  },
  additionalProperties: false,
} as const satisfies JSONSchema;

/**
 * Type definition for a Post object, derived from JSON schemas.
 */
type Post = FromSchema<
  typeof PostSchema,
  { references: [typeof PostDocSchema, typeof PostMetaSchema] }
>;

/**
 * Type definition for wrapping a message with its child messages.
 */
type MessageWrapper = {
  message: Post;
  children: MessageWrapper[];
};

/**
 * The MainContentComponent class is a custom Web Component designed to manage
 * the main content area of the application. This includes handling the header,
 * chat container, and error containers. It also maintains a message map and a retry queue
 * for handling message posting and retries.
 */
export class MainContentComponent extends HTMLElement {
  private header: HTMLHeadingElement;
  private chatContainer: HTMLElement;
  private errorContainerpost: HTMLElement;

  private messageMap = new Map<string, MessageWrapper>();
  private retryQueue: Post[] = [];
  /**
   * Constructor define the shadow root and append the header to the shadow root.
   */
  constructor() {
    super();

    // Attach a shadow root to this element
    const shadow = this.attachShadow({ mode: "open" });

    // Select header element and chat container
    this.header = document.querySelector(
      "#main-content #header",
    ) as HTMLHeadingElement;
    this.chatContainer = document.querySelector(
      "#main-content #chat-container",
    ) as HTMLElement;
    this.messageMap = this.messageMap;

    shadow.appendChild(this.header);

    // Create the error container
    this.errorContainerpost = document.createElement("section");
    this.errorContainerpost.classList.add("error-container");
    this.errorContainerpost.style.display = "none"; // Initially hidden

    shadow.append(this.errorContainerpost);

    this.loadPosts = this.loadPosts.bind(this);

    // Add styles
    const style = document.createElement("style");
    style.textContent = `
      #header {
        font-family: "Jersey20", sans-serif;
        background-color: #44426E;
        color: white;
        padding: 15px;
        font-size: 2em;
      }
      #chat-container {
        flex-grow: 1;
        padding: 20px;
        overflow-y: auto;
      }
      .message {
        font-family: "VT323", sans-serif;
        background-color: #ffffff;
        border: 1px solid #44426e;
        padding: 10px;
        margin-bottom: 18px;
        border-radius: 5px;
        max-width: 70%;
        position: relative;
        margin-left: 0px;
      }
      .reactions {
        margin-top: 8px;
        display: flex;
        gap: 8px;
      }
      .reaction-button {
        background-color: #f0f0f0;
        border: 1px solid #ccc;
        border-radius: 12px;
        padding: 4px 8px;
        font-size: 0.9em;
        cursor: pointer;
      }
      .error-container {
        position: fixed;
        top: 500px; /* Adjust as needed */
        left: 0; /* Align with the sidebar */
        z-index: 1001; /* Above the dropdown */
      }

      .error-button {
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

      .error-button .close-icon {
        margin-left: 10px;
        font-weight: bold;
        cursor: pointer;
      }

      .error-button:hover {
        background-color: #f5c6cb;
      }
      .birthday-cake-icon {
        position: fixed; /* Position relative to the viewport */
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%) scale(0); /* Start scaled down */
        width: 300px; /* Increased size */
        height: 300px; /* Increased size */
        font-size: 300px; /* Match the container size */
        opacity: 0; /* Start invisible */
        transition: transform 0.5s ease-out, opacity 0.5s ease-out; /* Smooth transition */
        z-index: 1000; /* Ensure it's on top of other elements */
        pointer-events: none; /* Allow interactions with underlying elements */
      }
      
      .birthday-cake-icon.show {
        transform: translate(-50%, -50%) scale(1); /* Scale to full size */
        opacity: 1; /* Fade in */
      }      
    `;
    shadow.appendChild(style);
  }

  /**
   * Updates the header text with the name of the selected channel.
   * @param event - The event object containing channel details.
   */
  private updateHeader = (event: Event) => {
    slog.info("MainContentComponent: updateHeader");
    const customEvent = event as CustomEvent;
    const channel = customEvent.detail.channel;
    slog.info("MainContentComponent: updateHeader", ["channel", channel]);
    // Update header text with the selected channel name
    const channelString = "☆ " + channel + " ☆";
    this.header.textContent = `${channelString}`;
  };

  /**
   * clearpost function to clear the chat container and set the header to "☆ PLEASE SELECT A CHANNEL ☆"
   * @param event - The event that triggers the clearing of the chat container.
   */
  public clearpost = (event: Event) => {
    slog.info("MainContentComponent: clearpost");
    this.chatContainer.innerHTML = "";
    this.header.textContent = "☆ PLEASE SELECT A CHANNEL ☆";
  };

  /**
   * MessageWrapper stuff to take care of nested posts
   * Helper to insert into sorted children array (by createdAt metadata)
   * @param children - The array of existing child message wrappers.
   * @param newWrapper - The new message wrapper to insert.
   * @returns the message of the child directly before the inserted wrapper, or `null` if no such child exists.
   */
  private insertIntoSortedChildren(
    children: MessageWrapper[],
    newWrapper: MessageWrapper,
  ): Post | null {
    const newTimestamp = newWrapper.message.meta.createdAt;
    // Search for idx to insert at
    let low = 0;
    let high = children.length;
    while (low < high) {
      const mid = Math.floor((low + high) / 2);
      if (children[mid].message.meta.createdAt > newTimestamp) {
        high = mid;
      } else {
        low = mid + 1;
      }
    }
    // Insert new wrapper
    children.splice(low, 0, newWrapper);
    slog.info("Children: ", ["children", children]);

    return children[low - 1]?.message || null;
  }

  /**
   * Renders a new message by attempting to insert it and processing any queued retries.
   * @param newPost - The `Post` object representing the new message to be rendered.
   */
  public renderMessage(newPost: Post) {
    slog.info("ENETERING RENDERMESSAGE");
    const res = this.tryInsertMessage(newPost);

    if (res) {
      this.processRetryQueue();
    }
  }

  /**
   * Processes the retry queue for message insertion.
   */
  private processRetryQueue() {
    let retrying = true;
    while (retrying && this.retryQueue.length > 0) {
      retrying = false;
      this.retryQueue.forEach((post) => {
        if (this.tryInsertMessage(post)) {
          this.retryQueue = this.retryQueue.filter((p) => p !== post);
          retrying = true;
        }
      });
    }
  }

  /**
   * Function to be called in main that will insert post into chat.
   * @param newPost - The `Post` object representing the new message to be rendered.
   * @returns `true` if the message was successfully inserted, otherwise `false.
   */
  private tryInsertMessage(newPost: Post): boolean {
    const parentPath = newPost.doc.parent;
    const newWrapper = { message: newPost, children: [] };
    let precedingPost: Post | null = null;
    let before = false;
    slog.info("tryInsertMessage: newPost", ["newpost", newPost.doc]);
    slog.info("tryInsertMessage: parentPath", ["parentPath", parentPath]);

    const existingWrapper = this.messageMap.get(newPost.path);

    if (existingWrapper) {
      existingWrapper.message = newPost;

      this.updateMessageReactions(newPost);
      // TODO: update reactions for the post this.updateMessageReactions(newPost);
      return true;
    }

    if (parentPath) {
      slog.info("Its a reply, parentPath: ", ["parentPath", parentPath]);
      const parentWrapper = this.messageMap.get(parentPath);
      if (!parentWrapper) {
        if (!this.retryQueue.includes(newPost)) this.retryQueue.push(newPost);
        return false;
      }
      precedingPost = this.insertIntoSortedChildren(
        parentWrapper.children,
        newWrapper,
      );
      if (!precedingPost && parentWrapper.children.length > 1) {
        before = true;
        precedingPost = parentWrapper.children[1].message;
      }

      this.messageMap.set(newPost.path, newWrapper);
    } else {
      slog.info("Its a top level post");
      // Convert the values of the messageMap to an array
      let messagesArray = Array.from(this.messageMap.values());

      // Filter out nodes that have parents (i.e., only top-level nodes)
      messagesArray = messagesArray.filter((wrapper) => {
        return !wrapper.message.doc.parent; // Keep nodes without parents
      });

      const topLevelArray = Array.from(messagesArray).sort(
        (a, b) => a.message.meta.createdAt - b.message.meta.createdAt,
      );
      precedingPost = this.insertIntoSortedChildren(topLevelArray, newWrapper);
      slog.info("After insertion into sorted children: ", [
        "precedingPost",
        precedingPost,
      ]);
      this.messageMap.set(newPost.path, newWrapper);
    }
    const newMessageElem = this.addMessage(newPost, this.messageMap);
    slog.info("tryInsertMessage: newMessageElem", [
      "newMessageElem",
      newMessageElem,
    ]);
    slog.info("precedingPost", ["precedingPost", precedingPost]);
    if (parentPath) {
      const parentElem = document.querySelector(
        `[data-path="${parentPath}"]`,
      ) as HTMLElement;
      if (precedingPost) {
        const precedingWrapper = this.messageMap.get(precedingPost.path);
        if (precedingWrapper) {
          const deepestPost = this.findDeepestChild(precedingWrapper);
          const precedingElem = document.querySelector(
            `[data-path="${deepestPost.path}"]`,
          ) as HTMLElement;
          slog.info("precedingElem for deepest post", [
            "precedingElem",
            precedingElem,
          ]);
          if (before) {
            precedingElem.insertAdjacentElement("beforebegin", newMessageElem);
          } else {
            precedingElem.insertAdjacentElement("afterend", newMessageElem);
          }
        }
      } else {
        parentElem.insertAdjacentElement("afterend", newMessageElem);
      }
    } else {
      slog.info("no parents, here");
      const container = this.chatContainer;
      if (precedingPost) {
        slog.info("precedingPost.path", [
          "precedingPost.path",
          precedingPost.path,
        ]);
        const precedingWrapper = this.messageMap.get(precedingPost.path);
        if (precedingWrapper) {
          const deepestPost = this.findDeepestChild(precedingWrapper);
          const precedingElem = document.querySelector(
            `[data-path="${deepestPost.path}"]`,
          ) as HTMLElement;
          slog.info("precedingElem", ["precedingElem", precedingElem]);
          // Need to check if this is in a completely new channel
          if (precedingElem && container.contains(precedingElem)) {
            precedingElem.insertAdjacentElement("afterend", newMessageElem);
          } else {
            container.insertBefore(newMessageElem, container.firstChild);
          }
        }
      } else {
        container.insertBefore(newMessageElem, container.firstChild);
      }
    }

    if ((newPost.doc.msg || "").toLowerCase().includes("happy birthday")) {
      slog.info("Happy Birthday detected!");
      this.showBirthdayCake();
    }

    return true;
  }

  /**
   * Updates the reaction section of a message element in the chat UI.
   * @param newPost - The `Post` object containing updated reaction data.
   */
  private updateMessageReactions(newPost: Post): void {
    // Find the message element by data-path
    slog["info"]("updateMessageReactions: newPost", ["newPost", newPost]);
    const messageElem = this.chatContainer.querySelector(
      `[data-path="${newPost.path}"]`,
    );
    if (!messageElem) {
      slog.error(`Message element not found for path: ${newPost.path}`);
      return;
    }

    const reactionsSection = messageElem.querySelector(".reactions");
    if (!reactionsSection) {
      slog.error(`Reactions section not found for message: ${newPost.path}`);
      return;
    }

    const emojis = {
      ":smile:": '<iconify-icon icon="twemoji:smiling-face"></iconify-icon>',
      ":frown:":
        '<iconify-icon icon="twemoji:slightly-frowning-face"></iconify-icon>',
      ":like:": '<iconify-icon icon="twemoji:thumbs-up"></iconify-icon>',
      ":celebrate:":
        '<iconify-icon icon="twemoji:party-popper"></iconify-icon>',
    };

    // Iterate over each reaction type
    Object.entries(emojis).forEach(([emoji, icon]) => {
      const reactionButton = reactionsSection.querySelector(
        `[data-reaction="${emoji}"]`,
      ) as HTMLButtonElement;
      // Update the count
      const userCount = newPost.doc.reactions?.[emoji]?.length || 0;
      reactionButton.innerHTML = `${icon} ${userCount}`;
    });
  }

  /**
   * Adds a new message element to the chat UI, handling reply indentation.
   * @param post - The `Post` object containing the message data.
   * @param messageMap - A mapping of message paths to `MessageWrapper` objects for easy parent lookup.
   * @returns the constructed message element to be appended to the chat container.
   */
  private addMessage(
    post: Post,
    messageMap: Map<string, MessageWrapper>,
  ): HTMLElement {
    // Determine the reply indentation level
    let replyIndent = 0;
    let currentPath = post.doc.parent;

    while (currentPath) {
      const parentWrapper = messageMap.get(currentPath);
      if (!parentWrapper) break; // Parent not found
      replyIndent++;
      currentPath = parentWrapper.message.doc.parent;
    }

    // Use the messageTemplate function to create the message element
    const messageElement = this.messageTemplate(post, replyIndent);

    return messageElement;
  }

  /**
   * Finds the deepest child message in a nested reply structure.
   * @param parentWrapper - The `MessageWrapper` wrapper object containing the parent message and its child messages.
   * @returns the deepest `Post` child message in the hierarchy, or the parent message if there are no children.
   */
  private findDeepestChild(parentWrapper: MessageWrapper): Post {
    if (parentWrapper.children.length === 0) return parentWrapper.message; // Base Case
    // Recursively find lowest child
    return this.findDeepestChild(
      parentWrapper.children[parentWrapper.children.length - 1],
    );
  }

  /**
   * Generates an HTML template for a given post with proper styling and metadata.
   * @param post - The `Post` object representing the message to be rendered.
   * @param replyIndent - The indentation level for replies.
   * @returns the structured HTML representation of the `Post` object.
   */
  private messageTemplate(post: Post, replyIndent: number): HTMLElement {
    const messageSection = document.createElement("section");
    messageSection.classList.add("message");
    messageSection.dataset.path = post.path; // Add data attribute for identification

    // Format createdAt timestamp to a readable date string
    const createdAtDate = new Date(post.meta.createdAt);
    const formattedDate = createdAtDate.toLocaleString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
      second: "numeric",
      timeZoneName: "short",
    });

    const parsedContent = this.parseMarkdown(post.doc.msg || "");

    // Add message content with author and timestamp
    messageSection.innerHTML = `<span><strong>${post.meta.createdBy} - ${formattedDate}:</strong><br>${parsedContent}</span>`;
    if (replyIndent > 0) {
      messageSection.style.marginLeft = `${replyIndent * 40}px`;
    }

    // Initialize reactions div
    const reactionsSection = document.createElement("section");
    reactionsSection.classList.add("reactions");

    const emojis = {
      ":smile:": '<iconify-icon icon="twemoji:smiling-face"></iconify-icon>',
      ":frown:":
        '<iconify-icon icon="twemoji:slightly-frowning-face"></iconify-icon>',
      ":like:": '<iconify-icon icon="twemoji:thumbs-up"></iconify-icon>',
      ":celebrate:":
        '<iconify-icon icon="twemoji:party-popper"></iconify-icon>',
    };

    // Create a button for each reaction type with initial count 0
    Object.entries(emojis).forEach(([emoji, icon]) => {
      const reactionButton = document.createElement("button");
      reactionButton.classList.add("reaction-button");
      reactionButton.dataset.reaction = emoji;
      const userCount = post.doc.reactions?.[emoji]?.length || 0;
      reactionButton.innerHTML = `${icon} ${userCount}`;
      reactionButton.title = emoji;
      reactionButton.id = emoji;
      reactionsSection.appendChild(reactionButton);

      // Add event listener for the reaction button
      reactionButton.addEventListener("click", () => {
        // Dispatch a 'reaction' event with postPath and reactionType
        this.dispatchEvent(
          new CustomEvent("reaction", {
            detail: {
              postPath: post.path,
              reactionType: emoji,
            },
            bubbles: true,
            composed: true,
          }),
        );
      });
    });

    // Add Reply button
    const replyButton = document.createElement("button");
    replyButton.id = "reply-button"; // Reusing the reaction-button style
    replyButton.classList.add("reaction-button"); // Reusing the reaction-button style
    replyButton.textContent = "Reply";
    replyButton.addEventListener("click", () =>
      this.handleReplyClick(post.path),
    );
    reactionsSection.appendChild(replyButton);

    // Add reactions row to the message component
    messageSection.appendChild(reactionsSection);

    return messageSection;
  }

  /**
   * Parses a given text string into HTML, converting Markdown-style syntax and
   * formatting into appropriate HTML elements for rendering.
   * @param text - The raw string input from the user that may contain Markdown-like syntax for formatting.
   * @returns the HTML string with Markdown formatting converted and input sanitized.
   */
  private parseMarkdown(text: string): string {
    // Escape HTML tags to prevent XSS
    text = text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    // Replace line breaks with <br>
    text = text.replace(/\n/g, "<br>");

    // Replace **text** with <strong>text</strong>
    text = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

    // Replace *text* with <em>text</em>
    text = text.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>");

    // Replace [text](url) with <a href="url">text</a>
    text = text.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>');

    // Replace :emoji: with Iconify icons
    const emojiIcons: { [key: string]: string } = {
      ":smile:": '<iconify-icon icon="twemoji:smiling-face"></iconify-icon>',
      ":frown:":
        '<iconify-icon icon="twemoji:slightly-frowning-face"></iconify-icon>',
      ":like:": '<iconify-icon icon="twemoji:thumbs-up"></iconify-icon>',
      ":celebrate:":
        '<iconify-icon icon="twemoji:party-popper"></iconify-icon>',
    };
    text = text.replace(/(:[a-zA-Z]+?:)/g, (match) => {
      return emojiIcons[match] || match;
    });

    return text;
  }

  /**
   * Handles the event when the "Reply" button is clicked on a post.
   * @param postPath - The unique identifier (path) of the post to which the user is replying.
   */
  private handleReplyClick(postPath: string): void {
    slog.info("MainContentComponent: handleReplyClick", ["postPath", postPath]);

    // Dispatch a custom event with the postPath to notify other parts of the app
    document.dispatchEvent(
      new CustomEvent("reply-to-message", {
        detail: { postPath },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /**
   * Displays a list of posts in the chat container by processing and rendering them.
   * @param posts - An array of `Post` objects to be displayed.
   */
  public displayPosts(posts: Post[]): void {
    slog.info("MainContentComponent: displayPosts", ["posts", posts]);

    // Sort posts by timestamp
    const sortedPosts = posts.sort(
      (a, b) => a.meta.createdAt - b.meta.createdAt,
    );

    // Create map of {"path": ["childrenpaths,..."]} and map of {"path": Post} for easy access
    const postMap = new Map<string, Post>();
    const childrenMap = new Map<string, string[]>();
    sortedPosts.forEach((post) => {
      postMap.set(post.path, post);
      if (post.doc.parent) {
        const parentPath = post.doc.parent;
        if (!childrenMap.has(parentPath)) {
          childrenMap.set(parentPath, []);
        }
        childrenMap.get(parentPath)!.push(post.path);
      } else {
        if (!childrenMap.has(post.path)) {
          childrenMap.set(post.path, []);
        }
      }
    });

    this.chatContainer.innerHTML = ""; // Clear previous content
    this.populateChat(postMap, childrenMap); // Render the posts in the chat container
  }

  /**
   * Recursive function to populate chat container with posts and replies.
   * @param postMap - A map where the key is the `postPath` and the value is the corresponding `Post` object.
   * @param childrenMap - A map where the key is a `postPath`, and the value is an array of paths to the replies.
   * @param postPath - The path of the post to start from. If `null`, starts from the root.
   * @param indent - The indentation level for nested replies. Defaults to 0.
   */
  private populateChat(
    postMap: Map<string, Post>,
    childrenMap: Map<string, string[]>,
    postPath: string | null = null,
    indent: number = 0,
  ): void {
    // If no specific postPath is provided, we start at the top-level posts (posts without a parent)
    const postsToRender = postPath
      ? childrenMap.get(postPath)
      : Array.from(postMap.keys()).filter(
          (path) => !postMap.get(path)!.doc.parent,
        );

    if (!postsToRender) return; // If there are no posts to render, exit

    for (const path of postsToRender) {
      const post = postMap.get(path);
      if (post) {
        // Render the post at the current indentation level
        // let childrenArray = [];
        // for (const child in childrenMap.get(path)) {
        //   const childWrapper: MessageWrapper = {message: postMap.get(child), children: postMap.get(child)};
        //   childrenArray.push(child);
        // }
        // const newMessageWrapper: MessageWrapper = {post, childrenArray}
        // this.messageMap.set(post.path, newMessageWrapper);

        const messageElement = this.messageTemplate(post, indent);
        this.chatContainer.appendChild(messageElement);

        // Recursively render children, increasing the indentation
        const children = childrenMap.get(path);
        if (children && children.length > 0) {
          this.populateChat(postMap, childrenMap, path, indent + 1);
        }
      }
    }
  }

  /**
   * Load posts for a selected workspace and channel by calling the controller.
   * @param event - The event object that triggers the loading of posts.
   * @returns a promise that resolves when the posts are successfully loaded.
   */
  private async loadPosts(event: Event): Promise<void> {
    const customEvent = event as CustomEvent;
    const { workspaceName, channel } = customEvent.detail;
    slog.info(
      "MainContentComponent: loadPosts",
      ["workspace", workspaceName],
      ["channel", channel],
    );
    document.dispatchEvent(
      new CustomEvent("get-posts", {
        detail: { workspaceName, channel },
        bubbles: true,
        composed: true,
      }),
    );
  }

  /**
   * connectedCallback to add event listeners.
   */
  connectedCallback() {
    // Listen for channel initialization event(autoselection for the first channel if no channel is selected)
    // Listen for channel selection event
    document.addEventListener(
      "channel-select",
      this.updateHeader as EventListener,
    );
    document.addEventListener(
      "channel-select",
      this.loadPosts as EventListener,
    );
    document.addEventListener(
      "workspace-select",
      this.clearpost as EventListener,
    );
  }

  /**
   * disconnectedCallback to remove event listeners.
   */
  disconnectedCallback() {
    // Clean up event listener
    document.removeEventListener(
      "channel-select",
      this.updateHeader as EventListener,
    );
    document.removeEventListener(
      "channel-select",
      this.loadPosts as EventListener,
    );
  }

  /**
   * Displays an error message.
   * @param message - The error message to display.
   */
  public showError(message: string): void {
    // Clear any existing error messages
    this.errorContainerpost.innerHTML = "";

    // Create the error button
    const errorButton = document.createElement("button");
    errorButton.classList.add("error-button");
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
    this.errorContainerpost.appendChild(errorButton);

    // Make the error container visible
    this.errorContainerpost.style.display = "block";
  }

  /**
   * Hides the error message.
   */
  public hideError(): void {
    this.errorContainerpost.style.display = "none";
    this.errorContainerpost.innerHTML = "";
  }

  /**
   * Creates and displays the birthday cake icon when called.
   */
  public showBirthdayCake(): void {
    // Create the birthday cake icon element
    const cakeIcon = document.createElement("iconify-icon");
    cakeIcon.setAttribute("icon", "twemoji:birthday-cake"); // Use a colorful birthday cake icon
    cakeIcon.classList.add("birthday-cake-icon");
    cakeIcon.setAttribute("role", "img");
    cakeIcon.setAttribute("aria-label", "Birthday Cake");

    // Append the icon to the shadow root for encapsulation
    if (this.shadowRoot) {
      this.shadowRoot.appendChild(cakeIcon);

      // Trigger the animation on the next animation frame
      requestAnimationFrame(() => {
        cakeIcon.classList.add("show");
      });

      // Remove the icon after the animation completes (e.g., 2 seconds)
      setTimeout(() => {
        cakeIcon.classList.remove("show");
        // Optionally, remove the element from the DOM after fading out
        setTimeout(() => {
          cakeIcon.remove();
        }, 500); // Matches the transition duration
      }, 2000); // Duration the icon stays visible
    } else {
      console.error("Shadow root not found.");
    }
  }
}
