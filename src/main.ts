import { slog } from "./slog";
import { LoginModel } from "./model/LoginModel";
import { WorkspaceModel } from "./model/WorkspaceModel";
import { SidebarModel } from "./model/SidebarModel";
import { MainContentModel } from "./model/MainContentModel";
import { CreateWorkspaceModel } from "./model/CreateWorkspaceModel";
import { DeleteWorkspaceModel } from "./model/DeleteWorkspaceModel";
import { CreateChannelModel } from "./model/CreateChannelModel";
import { DeleteChannelModel } from "./model/DeleteChannelModel";
import { ChatInputModel } from "./model/ChatInputModel";

import {
  LoginComponent,
  initComponents as initLoginComponents,
} from "./view/LoginComponents";
import { WorkspaceComponent } from "./view/WorkspaceComponents";
import { SidebarComponent } from "./view/SidebarComponents";
import { MainContentComponent } from "./view/MainContentComponents";
import { CreateWorkspaceDialog } from "./view/CreateWorkspaceDialog";
import { EditWorkspaceButton } from "./view/EditworkspaceComponents";
import { DeleteWorkspaceDialog } from "./view/DeleteWorkspaceDialog";
import { EditChannelButton } from "./view/EditChannelButton";
import { CreateChannelDialog } from "./view/CreateChannelDialog";
import { DeleteChannelDialog } from "./view/DeleteChannelDialog";
import { ChatInputComponent } from "./view/ChatInputComponent";

declare const process: {
  env: { DATABASE_HOST: string; DATABASE_PATH: string; AUTH_PATH: string };
};
export const DATABASE_HOST = process.env.DATABASE_HOST || "";
export const DATABASE_PATH = process.env.DATABASE_PATH || "";
export const AUTH_PATH = process.env.AUTH_PATH || "";
/**
 * Main Controller class handling business logic.
 */
export class MainController {
  private loginModel: LoginModel;
  private workspaceModel: WorkspaceModel;
  private sidebarModel: SidebarModel;
  private mainContentModel: MainContentModel;
  private createWorkspaceModel: CreateWorkspaceModel;
  private deleteworkspaceModel: DeleteWorkspaceModel;
  private createChannelModel: CreateChannelModel;
  private deleteChannelModel: DeleteChannelModel;
  private chatInputModel: ChatInputModel;

  private loginComponent: LoginComponent;
  private workspaceComponent: WorkspaceComponent;
  private sidebarComponent: SidebarComponent;
  private mainContentComponent: MainContentComponent;
  // private createWorkspaceDialog: CreateWorkspaceDialog;
  private chatInputComponent: ChatInputComponent;

  private authToken: string = "";
  private user: string = "";
  private currentWorkspace: string = "";
  private currentChannel: string = "";
  private currentParent: string = "";

  /**
   * Constructor initializes models and components.
   */
  constructor() {
    // Initialize models
    initLoginComponents();
    const loginComponent = document.querySelector(
      "login-component",
    ) as LoginComponent;
    if (loginComponent) {
      loginComponent.showPopup();
    }
    this.loginComponent = document.querySelector(
      "login-component",
    ) as LoginComponent;
    this.loginModel = new LoginModel(DATABASE_HOST + AUTH_PATH);
    customElements.define("workspace-component", WorkspaceComponent);
    customElements.define("sidebar-component", SidebarComponent);
    customElements.define("main-content-component", MainContentComponent);
    customElements.define("create-workspace-dialog", CreateWorkspaceDialog);
    customElements.define("edit-workspace-dialog", EditWorkspaceButton);
    customElements.define("delete-workspace-dialog", DeleteWorkspaceDialog);
    customElements.define("edit-channel-button", EditChannelButton);
    customElements.define("create-channel-dialog", CreateChannelDialog);
    customElements.define("delete-channel-dialog", DeleteChannelDialog);
    customElements.define("chat-input-component", ChatInputComponent);

    this.workspaceModel = new WorkspaceModel(DATABASE_HOST + DATABASE_PATH);
    this.sidebarModel = new SidebarModel(DATABASE_HOST + DATABASE_PATH);
    this.mainContentModel = new MainContentModel(DATABASE_HOST + DATABASE_PATH);
    this.deleteworkspaceModel = new DeleteWorkspaceModel(
      DATABASE_HOST + DATABASE_PATH,
    );
    this.createWorkspaceModel = new CreateWorkspaceModel(
      DATABASE_HOST + DATABASE_PATH,
    );
    this.createChannelModel = new CreateChannelModel(
      DATABASE_HOST + DATABASE_PATH,
    );
    this.deleteChannelModel = new DeleteChannelModel(
      DATABASE_HOST + DATABASE_PATH,
    );
    this.chatInputModel = new ChatInputModel(DATABASE_HOST + DATABASE_PATH);

    // Initialize view components
    this.workspaceComponent = document.querySelector(
      "workspace-component",
    ) as WorkspaceComponent;
    this.sidebarComponent = document.querySelector(
      "sidebar-component",
    ) as SidebarComponent;
    this.mainContentComponent = document.querySelector(
      "main-content-component",
    ) as MainContentComponent;
    this.chatInputComponent = document.querySelector(
      "chat-input-component",
    ) as ChatInputComponent;
    // this.deleteworkspaceDialog = document.querySelector("delete-workspace-dialog") as DeleteWorkspaceDialog;
  }

  /**
   * Initializes the controller by setting up event listeners.
   */
  public initialize(): void {
    this.setupEventListeners();
    // Show login popup on initialization
  }

  /**
   * Sets up event listeners for various components.
   */
  private setupEventListeners(): void {
    // LoginComponent events
    document.addEventListener("login-attempt", (event: Event) =>
      this.handleLoginAttempt(event),
    );
    document.addEventListener("logout", () => this.handleLogout());

    // WorkspaceComponent events
    document.addEventListener("get-workspaces", () =>
      this.handleGetWorkspaces(),
    );

    // SidebarComponent events
    document.addEventListener("get-collections", (event: Event) =>
      this.handleGetCollections(event),
    );
    document.addEventListener("get-posts", (event: Event) =>
      this.handleChannelSelect(event),
    );

    // CreateWorkspaceDialog events
    document.addEventListener("workspace-created", (event: Event) =>
      this.handleCreateWorkspace(event),
    );
    document.addEventListener("workspace-deleted", (event: Event) =>
      this.handleDeleteWorkspace(event),
    );

    document.addEventListener("channel-created", (event: Event) =>
      this.handleCreateChannel(event),
    );
    document.addEventListener("channel-deleted", (event: Event) =>
      this.handleDeleteChannel(event),
    );
    document.addEventListener("reply-to-message", (event: Event) =>
      this.handleClickReply(event),
    );
    document.addEventListener("post-message", (event: Event) =>
      this.handleClickPost(event),
    );

    document.addEventListener("reaction", (event: Event) => {
      const customEvent = event as CustomEvent;
      const { postPath, reactionType } = customEvent.detail;
      this.handleReaction(postPath, reactionType);
    });
  }

  // Inside the MainController class
  /**
   * A map that tracks whether a reaction for a specific post has been debounced.
   */
  private reactionDebounceMap: Map<string, boolean> = new Map();

  /**
   * Handles reactions.
   * @param postPath - The path of the post that the reaction is associated with.
   * @param reactionType - The type of reaction (e.g., "like", "dislike", etc.) to be applied to the post.
   */
  private handleReaction(postPath: string, reactionType: string): void {
    const reactionKey = `${postPath}-${reactionType}`;
    this.reactionDebounceMap.set(reactionKey, true);
    this.mainContentModel.setCurrentWorkspaceChannel(
      this.currentWorkspace,
      this.currentChannel,
    );

    this.mainContentModel
      .getCollections(
        this.authToken,
        this.currentWorkspace,
        this.currentChannel,
      )
      .then((posts) => {
        const post = posts.find((p) => p.path === postPath);
        slog.info("Post found", ["post", post]);
        if (!post) {
          // Reject the promise to skip to the catch block
          return Promise.reject(new Error("Post not found."));
        }

        const hasReacted =
          post.doc.reactions?.[reactionType]?.includes(this.user) || false;
        slog.info("Has reacted", ["hasReacted", hasReacted]);
        const remove = hasReacted;

        return this.mainContentModel
          .reactPost(postPath, remove, reactionType, this.user, this.authToken)
          .then(() => {
            // this.mainContentComponent.renderMessage(post);
            slog.info(
              `Reaction ${remove ? "removed" : "added"} for ${reactionType} on post ${postPath}`,
            );
            // Optionally, update local state or UI here if needed
          });
      })
      .catch((error) => {
        console.error(error.message);
      })
      .finally(() => {
        // Reset the debounce
        this.reactionDebounceMap.set(reactionKey, false);
      });
  }

  /**
   * Handles login attempts.
   * @param event - The event object associated with the login attempt.
   */
  private handleLoginAttempt(event: Event): void {
    const customEvent = event as CustomEvent;
    const username: string = customEvent.detail.username;

    if (!username) {
      this.loginComponent.displayError(new Error("Username is required."));
      return;
    }

    slog.info("Submitting login", ["username", username]);
    this.loginModel
      .authenticate(username)
      .then((token) => {
        this.authToken = token;
        this.user = username;
        slog.info(
          "Login successful",
          ["username", username],
          ["token", this.authToken],
        );

        // Update UI
        this.loginComponent.displaySuccess(token);
        // Optionally, fetch initial data here
      })
      .catch((error) => {
        slog.error("Login failed", ["username", username]);
        this.loginComponent.displayError(error);
      });
  }

  /**
   * Handles user logout.
   */
  private handleLogout(): void {
    if (!this.authToken) {
      slog.error("No auth token found during logout.");
      return;
    }

    this.loginModel
      .logout(this.authToken)
      .then(() => {
        slog.info("Logout successful");
        this.authToken = "";
        // Reset UI
        this.loginComponent.showPopup();
        this.mainContentModel.unsubscribeToPosts();
      })
      .catch((error) => {
        slog.error("Logout failed", ["error", error.message]);
        this.loginComponent.displayError(new Error("Logout failed"));
      });
    // this.loginComponent.logout();
  }

  //don't know whether need to hide the error message or not
  /**
   * Handles fetching workspaces.
   */
  private handleGetWorkspaces(): void {
    slog.info("authToken", ["auth", this.authToken]);

    slog.info("Getting workspaces (controller)");
    this.workspaceModel
      .getWorkspaces(this.authToken)
      .then((workspaceList) => {
        this.workspaceComponent.updateDropdown(workspaceList);
      })
      .catch((error) => {
        slog.error("Failed to get workspaces", ["error", error.message]);
        this.workspaceComponent.showError(`Error: ${error.message}`);
      });
  }

  /**
   * Handles fetching collections (channels) for a workspace.
   * @param event - The event object containing details about the workspace.
   */
  private handleGetCollections(event: Event): void {
    const customEvent = event as CustomEvent;
    const workspace = customEvent.detail.workspace;

    this.currentWorkspace = workspace;

    slog.info("Getting collections (controller)");
    slog.info("workspace", ["workspace", workspace]);
    this.sidebarModel
      .getCollections(this.authToken, workspace)
      .then((collections) => {
        slog.info("Collections received", ["collections", collections]);
        this.sidebarComponent.populateCollections(collections, workspace);
      })
      .catch((error) => {
        slog.error("Failed to get collections", ["error", error.message]);
        this.sidebarComponent.showError(`Error: ${error.message}`);
      });
  }

  /**
   * Handles channel selection.
   * @param event - The event object containing details about the selected channel and workspace.
   */
  private handleChannelSelect(event: Event): void {
    const customEvent = event as CustomEvent;
    const channel = customEvent.detail.channel;
    const workspaceName =
      customEvent.detail.workspaceName || this.currentWorkspace;

    slog.info("Channel selected", ["channel", channel]);

    this.currentChannel = channel;
    // Fetch posts for the selected channel
    this.fetchPostsSSE(workspaceName, channel);

    this.fetchPosts(workspaceName, channel);

    // Re initialize chatInputComponent
    this.reinitializeChatInput();
  }

  /**
   * Re-initializes chatInputComponent.
   */
  private reinitializeChatInput(): void {
    const exisitingChatInput = document.querySelector("chat-input-component");
    if (exisitingChatInput) {
      slog.info("HERE");
      exisitingChatInput.remove();
    }

    // Create a new ChatInputComponent instance
    const chatInputComponent = new ChatInputComponent();
    this.chatInputComponent = chatInputComponent;
    // Update Reply/Post button text
    const shadowRoot = chatInputComponent.shadowRoot;

    if (shadowRoot) {
      const sendButton = shadowRoot.querySelector(
        "#send-button",
      ) as HTMLButtonElement;
      if (sendButton) {
        sendButton.textContent = "Post"; // Reset text to "Post"
      }
    }
    // Append it to the main content or a specific container
    const mainContent = document.querySelector("#main-content"); // Ensure this ID exists in your layout
    if (mainContent) {
      mainContent.appendChild(chatInputComponent);
    } else {
      slog.error("Chat container not found in the DOM.");
    }

    // Remove the close button
    const closeButton = document.querySelector("#close-button");
    if (closeButton) {
      closeButton.remove();
    }
  }

  /**
   * Fetches posts for a given workspace and channel.
   * @param workspace - The name of the workspace from which posts will be fetched.
   * @param channel - The name of the channel within the workspace for which posts will be fetched.
   */
  private fetchPostsSSE(workspace: string, channel: string): void {
    // TODO: use subscribeToPosts and
    this.mainContentModel.unsubscribeToPosts();

    slog.info("Fetching posts", ["workspace", workspace], ["channel", channel]);
    this.mainContentModel.subscribeToPosts(
      this.authToken,
      workspace,
      channel,
      (post) => {
        slog.info("Post received", ["post", post]);
        this.mainContentComponent.renderMessage(post);
      },
      (error) => {
        slog.error("Failed to get posts", ["error", error.message]);
        this.mainContentComponent.showError(`Error: ${error.message}`);
      },
    );
    // this.mainContentModel
    //   .getCollections(this.authToken, workspace, channel)
    //   .then((posts) => {
    //     slog.info("Posts received", ["posts", posts]);
    //     // this.mainContentComponent.displayPosts(posts);
    //     // TEMPORARY TO JUST TEST NEW NESTED STRUCTURE
    //     for (const post of posts) {
    //       this.mainContentComponent.renderMessage(post);
    //     }
    //   })
    //   .catch((error) => {
    //     slog.error("Failed to get posts", ["error", error.message]);
    //   });
  }

  /**
   * Fetches posts for a given workspace and channel.
   * @param workspace - The name of the workspace from which posts will be fetched.
   * @param channel - The name of the channel within the workspace for which posts will be fetched.
   */
  private fetchPosts(workspace: string, channel: string): void {
    slog.info("Fetching posts", ["workspace", workspace], ["channel", channel]);
    this.mainContentModel
      .getCollections(this.authToken, workspace, channel)
      .then((posts) => {
        slog.info("Posts received", ["posts", posts]);
        // for (const post of posts) {
        //   this.mainContentComponent.renderMessage(post);
        // }
        this.mainContentComponent.displayPosts(posts);
        // TEMPORARY TO JUST TEST NEW NESTED STRUCTURE
        // for (const post of posts) {
        //   this.mainContentComponent.renderMessage(post);
        // }
      })
      .catch((error) => {
        slog.error("Failed to get posts", ["error", error.message]);
        this.mainContentComponent.showError(`Error: ${error.message}`);
      });
  }

  /**
   * Handles the event when the "Post" button is clicked on a post.
   * @param event - The event object representing the click event on the "Post" button.
   */
  private handleClickPost(event: Event): void {
    const customEvent = event as CustomEvent;
    const { message } = customEvent.detail;
    slog.info("Message received in main.ts", ["message", message]);

    // Access the shadow root and query the send-button
    const shadowRoot = this.chatInputComponent.shadowRoot;
    if (!shadowRoot) {
      slog.error("Shadow root not found in ChatInputComponent.");
      return;
    }

    const button = shadowRoot.querySelector(
      "#send-button",
    ) as HTMLButtonElement;
    if (!button) {
      slog.error("Send button not found in ChatInputComponent.");
      return;
    }
    slog.info("Button", ["button", button.textContent]);
    if (button?.textContent == "Post") {
      // Send Message to server
      this.chatInputModel
        .postToChat(
          this.authToken,
          this.currentWorkspace,
          this.currentChannel,
          message,
        )
        .then((data) => {
          slog.info("Message sent, URI: ", ["data", data]);

          //TODO: will call on View function to insert
          // this.mainContentComponent.renderMessage();
          // this.fetchPostsSSE(this.currentWorkspace, this.currentChannel);
        })
        .catch((error) => {
          slog.error("Failed to send message", ["error", error.message]);
        });
    }
    if (button?.textContent == "Reply") {
      // Send Message to server with reply model
      this.chatInputModel
        .replyToChat(
          this.authToken,
          this.currentWorkspace,
          this.currentChannel,
          message,
          this.currentParent,
        )
        .then((data) => {
          slog.info("Message sent, URI: ", ["data", data]);
          // this.fetchPostsSSE(this.currentWorkspace, this.currentChannel);
        })
        .catch((error) => {
          slog.error("Failed to send message", ["error", error.message]);
        });
    }
    this.reinitializeChatInput();
    // clear the text box in chat input
    // chat should update with sse
  }

  /**
   * Handles the event when the "Reply" button is clicked on a post.
   * @param event - The event object representing the click event on the "Reply" button.
   */
  private handleClickReply(event: Event): void {
    const customEvent = event as CustomEvent;
    const { postPath } = customEvent.detail;

    const messageElement = document.querySelector(
      `.message[data-path="${postPath}"]`,
    );

    this.currentParent = postPath;
    slog.info("current parent", ["currentParent", this.currentParent]);
    // Switched out for chat-input-component
    this.chatInputComponent = document.querySelector(
      "chat-input-component",
    ) as ChatInputComponent;
    const chatInputContainer = this.chatInputComponent;
    const shadowRoot = this.chatInputComponent.shadowRoot;
    if (!shadowRoot) {
      slog.error("Shadow root not found in ChatInputComponent.");
      return;
    }

    // // Check if already replying to the same post
    // const currentReplyPath = chatInputContainer.getAttribute("data-replying-to");
    // if (currentReplyPath === postPath) {
    //   // Call reinitializeChatInput to reset the chat box
    //   this.reinitializeChatInput();
    //   return;
    // }

    if (messageElement && this.chatInputComponent) {
      // Move the chat input container after the message
      messageElement.insertAdjacentElement("afterend", this.chatInputComponent);

      chatInputContainer.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      // Directly access the inputElement inside the ChatInputComponent
      const inputElement = shadowRoot.querySelector(
        "#chat-input",
      ) as HTMLInputElement;

      if (inputElement) {
        inputElement.placeholder = `Reply:`;
      } else {
        slog.error("Input element not found inside ChatInputComponent.");
      }
      chatInputContainer.setAttribute("data-replying-to", postPath);
    }

    // Change the text of the button from "Post" to "Reply"
    const sendButton = shadowRoot.querySelector(
      "#send-button",
    ) as HTMLButtonElement;

    if (sendButton) {
      sendButton.textContent = "Reply";
    } else {
      slog.error("Send button not found inside ChatInputComponent.");
    }
    // Dynamically add the "X" button
    const closeButton = shadowRoot.querySelector(
      "#close-button",
    ) as HTMLButtonElement;
    if (closeButton) {
      closeButton.style.display = "block";
      closeButton.style.visibility = "visible";
    }
    // On click of closeButton, call on reinitializeChatInput
    closeButton.addEventListener("click", () => {
      this.reinitializeChatInput();
    });
  }

  /**
   * Handles workspace creation.
   * @param event - The event object representing the workspace creation event.
   */
  private handleCreateWorkspace(event: Event): void {
    const customEvent = event as CustomEvent;
    const workspace: string = customEvent.detail.workspaceName;

    if (!workspace) {
      slog.error("Workspace name is empty. Cannot create workspace.");
      this.workspaceComponent.showError("Workspace name cannot be empty.");
      return;
    }

    slog.info("Creating workspace", ["workspaceName", workspace]);

    this.createWorkspaceModel
      .createWorkspace(this.authToken, workspace)
      .then((data) => {
        this.workspaceComponent.hideError();
        this.currentWorkspace = workspace;
        return this.handleGetWorkspaces();
      })
      .then(() => {
        document.dispatchEvent(
          new CustomEvent("get-collections", {
            detail: { workspace },
            bubbles: true,
            composed: true,
          }),
        );
        this.mainContentComponent.clearpost(event);
      })
      .catch((error) => {
        slog.error(error.message);
        this.workspaceComponent.showError(`${error.message}`);
      });
  }

  /**
   * Handles workspace deletion.
   * @param event - The event object representing the workspace deletion event.
   */
  private handleDeleteWorkspace(event: Event): void {
    const customEvent = event as CustomEvent;
    const workspaceName: string = customEvent.detail.workspaceName;

    if (!workspaceName) {
      slog.error("Workspace name is empty. Cannot delete workspace.");
      this.workspaceComponent.showError("Workspace name cannot be empty.");
      return;
    }

    slog.info("Deleting workspace", ["workspaceName", workspaceName]);

    this.deleteworkspaceModel
      .deleteWorkspace(this.authToken, workspaceName)
      .then((data) => {
        this.workspaceComponent.hideError();
        slog.info(`Workspace "${workspaceName}" deleted successfully.`);
        this.handleGetWorkspaces();
        // no need for components here, since we are not updating any UI ? or we can call view? need discussion
      })
      .catch((error) => {
        slog.error("Failed to delete workspace", error);
        this.workspaceComponent.showError(`${error.message}`);
      });
  }

  /**
   * Handles channel creation.
   * @param event - The event object representing the channel creation event.
   */
  private handleCreateChannel(event: Event): void {
    const customEvent = event as CustomEvent;
    const channelName: string = customEvent.detail.channelName;

    if (!channelName) {
      slog.error("Channel name is empty. Cannot create channel.");
      this.sidebarComponent.showError("Channel name cannot be empty.");
      return;
    }

    if (!this.currentWorkspace) {
      slog.error("No workspace selected. Cannot create channel.");
      this.sidebarComponent.showError("Please select a workspace first.");
      return;
    }

    slog.info(
      "Creating channel",
      ["workspaceName", this.currentWorkspace],
      ["channelName", channelName],
    );

    const workspace = this.currentWorkspace;

    this.createChannelModel
      .createChannel(this.authToken, this.currentWorkspace, channelName)
      .then((data) => {
        this.sidebarComponent.hideError();
        document.dispatchEvent(
          new CustomEvent("get-collections", {
            detail: { workspace },
            bubbles: true,
            composed: true,
          }),
        );
        this.sidebarComponent.onChannelSelect(channelName);
      })
      .catch((error) => {
        slog.error(error.message);
        this.sidebarComponent.showError(`${error.message}`);
      });
  }

  /**
   * Handles channel deletion.
   * @param event - The event object representing the channel deletion event.
   */
  private handleDeleteChannel(event: Event): void {
    const customEvent = event as CustomEvent;
    const channelName: string = customEvent.detail.channelName;

    if (!channelName) {
      slog.error("Channel name is empty. Cannot delete channel.");
      this.sidebarComponent.showError("Channel name cannot be empty.");
      return;
    }

    if (!this.currentWorkspace) {
      slog.error("No workspace selected. Cannot delete channel.");
      this.sidebarComponent.showError("Please select a workspace first.");
      return;
    }

    slog.info(
      "Deleting channel",
      ["workspaceName", this.currentWorkspace],
      ["channelName", channelName],
    );

    this.deleteChannelModel
      .deleteChannel(this.authToken, this.currentWorkspace, channelName)
      .then(() => {
        this.sidebarComponent.hideError();
        slog.info(
          `Channel "${channelName}" deleted successfully in workspace "${this.currentWorkspace}".`,
        );

        if (this.currentChannel === channelName) {
          slog.info(
            `Current channel "${this.currentChannel}" matches the deleted channel. Clearing posts.`,
          );
          this.mainContentModel.unsubscribeToPosts();
          this.mainContentComponent.clearpost(event);
        }
        // Refresh the channel list in the sidebar
        document.dispatchEvent(
          new CustomEvent("get-collections", {
            detail: { workspace: this.currentWorkspace },
            bubbles: true,
            composed: true,
          }),
        );
      })
      .catch((error) => {
        slog.error("Failed to delete channel", error);
        this.sidebarComponent.showError(`${error.message}`);
      });
  }

  /**
   * Displays an error message in the WorkspaceComponent.
   * @param message - The error message to display.
   */
  public displayWorkspaceError(message: string): void {
    if (this.workspaceComponent) {
      this.workspaceComponent.showError(message);
    } else {
      slog.error("WorkspaceComponent reference is missing.");
    }
  }
}

/**
 * Entry point of the application.
 */
function main(): void {
  const mainController = new MainController();
  mainController.initialize();

  // The controller handles its own initialization and shows the login popup
}

/* Register event handler to run after the page is fully loaded. */
document.addEventListener("DOMContentLoaded", () => {
  main();
});
