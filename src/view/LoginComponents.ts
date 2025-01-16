import { slog } from "../slog";
//declare const process: { env: { DATABASE_HOST: string; AUTH_PATH: string } };

const loginComponentId = "#login-component-template";

/**
 * Get the template from the DOM
 * @param id - The CSS selector for the template element.
 * @returns the template element from the DOM.
 * @throws an error if the specified ID does not correspond to a template element.
 */
function getTemplate(id: string): HTMLTemplateElement {
  const template = document.querySelector(id);
  if (!(template instanceof HTMLTemplateElement)) {
    throw new Error(`Error: ${id} is not a template`);
  }
  return template;
}
/**
 * Define the login component
 */
export class LoginComponent extends HTMLElement {
  private static template: HTMLTemplateElement;
  private shadow: ShadowRoot;
  private username: string | null = null;

  static initialize(): void {
    LoginComponent.template = getTemplate(loginComponentId);
  }
  /**
   * Constructor defines the shadow root and appends the template content to the shadow root.
   */
  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: "open" });

    // Append the template content to the shadow root
    this.shadow.append(LoginComponent.template.content.cloneNode(true));

    // Inject styles specific to the component
    const style = document.createElement("style");
    style.textContent = `
      #popup-overlay {
        position: fixed;
        top: 0; left: 0;
        width: 100%; height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 10;
      }

      #popup {
        font-family: "RubikBurned", sans-serif;
        font-size: 13pt;
        position: fixed;
        justify-content: center;
        align-items: center;
        background: white;
        padding: 20px;
        border-radius: 8px;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        z-index: 1000;
      }
      
      #close-popup {
        background: #bbaab8;
        color: white;
        border: none;
        padding: 5px;
        cursor: pointer;
        border-radius: 4px;
      }

      #login-form {
        font-family: "Jersey20", sans-serif;
        display: flex;
        flex-direction: column;
      }

      #login-form input {
        font-family: "Jersey20", sans-serif;
        font-size: 11.5pt;
        margin: 5px 0;
        padding: 8px;
        border-radius: 4px;
        border: 1px solid #44426e;
      }

      #login-form input:focus {
        outline: none;
        border-color: #44426e;
        box-shadow: 0 0 5px rgba(187, 170, 184, 0.5);
      }

      #login-form button {
        font-family: "Jersey20", sans-serif;
        padding: 10px;
        background: #3c1634;
        color: white;
        border: none;
        border-radius: 4px;
        cursor: pointer;
      }

      .blur {
        filter: blur(8px);
        -webkit-filter: blur(8px);}
      }
    `;
    this.shadow.appendChild(style);
  }

  /**
   * Lifecycle method called when the component is connected to the DOM.
   * It sets up event listeners for handling popup cancellation, login form submission,
   * and logout button click. Additionally, it manages the behavior of the login dialog
   * and its associated components.
   */
  connectedCallback(): void {
    const popup = this.shadow.querySelector("#popup") as HTMLDialogElement;
    popup.addEventListener("cancel", (event) => {
      event.preventDefault();
    });
    // const closeButton = this.shadow.querySelector(
    //   "#close-popup",
    // ) as HTMLButtonElement;
    const loginForm = this.shadow.querySelector(
      "#login-form",
    ) as HTMLFormElement;
    const logoutButton = document.getElementById(
      "logout-button",
    ) as HTMLButtonElement;
    if (logoutButton) {
      logoutButton.addEventListener("click", () => this.logout());
    }
    // Event listeners for closing and submitting
    // closeButton.addEventListener("click", () => this.hidePopup());
    loginForm.addEventListener("submit", (event) => this.submitLogin(event));
  }

  /**
   * Displays the popup dialog and adds a blur effect to the main content.
   */
  public showPopup(): void {
    const popup = this.shadow.querySelector("#popup") as HTMLDialogElement;

    popup.showModal();
    // Add blur effect to the main content
    const backPage = document.getElementById("app");

    if (backPage) {
      backPage.classList.add("blur");
      backPage.style.pointerEvents = "none"; // Disable interaction
    }
  }

  /**
   * Closes the popup dialog and removes the blur effect from the main content.
   */
  private hidePopup(): void {
    const popup = this.shadow.querySelector("#popup") as HTMLDialogElement;
    popup.close();
    // Remove blur effect from the main content
    const backPage = document.getElementById("app");
    if (backPage) {
      backPage.classList.remove("blur");
      backPage.style.pointerEvents = ""; // Restore interaction
    }
  }

  /**
   * Connect to backend and handle the login submission.
   * @param event - The event triggered by the login form submission.
   */
  private submitLogin(event: Event): void {
    event.preventDefault();
    const usernameInput = this.shadow.querySelector(
      "#username",
    ) as HTMLInputElement;
    slog.info("Submitting login", ["username", usernameInput.value]);
    this.username = usernameInput.value.trim();
    if (this.username) {
      this.dispatchEvent(
        new CustomEvent("login-attempt", {
          detail: { username: this.username },
          bubbles: true,
          composed: true,
        }),
      );
    }

    this.hidePopup();
    console.log("Login submitted");
  }

  /**
   * Updates the view with showing login.
   * @param token - The token received from the backend.
   */
  public displaySuccess(token: string): void {
    slog.info("Displaying success in UI", ["token", token]);
    // Get the username property from input
    const usernameInput = this.shadow.querySelector(
      "#username",
    ) as HTMLInputElement;
    this.username = usernameInput.value;
    this.updateUsernameDisplay();
  }

  /**
   * Updates the username display next to the login button.
   */
  private updateUsernameDisplay(): void {
    const usernameDisplay = document.getElementById("username-display");
    const logoutButton = document.getElementById("logout-button");

    if (usernameDisplay && logoutButton && this.username) {
      usernameDisplay.textContent = `User: ${this.username}`;
      logoutButton.style.display = "inline";
    }
  }

  /**
   * Logs the user out by clearing the username and updating the UI.
   */
  private logout(): void {
    this.username = null;

    // Clear the username display and hide logout button
    const usernameDisplay = document.getElementById("username-display");
    const logoutButton = document.getElementById("logout-button");

    if (usernameDisplay) {
      usernameDisplay.textContent = "";
    }

    if (logoutButton) {
      logoutButton.style.display = "none";
    }
    const usernameInput =
      this.shadow.querySelector<HTMLInputElement>("#username");
    if (usernameInput) {
      usernameInput.value = ""; // Clear the input field
    } else {
      slog.warn("Username input field not cleared");
    }
    // Dispatch a "logout" event
    this.dispatchEvent(
      new CustomEvent("logout", {
        bubbles: true,
        composed: true,
      }),
    );
    // Show login modal again
    this.showPopup();
  }

  /**
   * Updates the view with an error message.
   * @param errorMessage - The error message to display.
   */
  public displayError(errorMessage: Error): void {
    // TODO: add some error message to UI
    slog.warn("Displaying error in UI", ["error", errorMessage.message]);
  }
}

/**
 * Initialize the components
 */
export function initComponents(): void {
  LoginComponent.initialize();
  customElements.define("login-component", LoginComponent);
}
