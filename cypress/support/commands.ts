/// <reference types="cypress" />
// ***********************************************
// This example commands.ts shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })
//
// declare global {
//   namespace Cypress {
//     interface Chainable {
//       login(email: string, password: string): Chainable<void>
//       drag(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       dismiss(subject: string, options?: Partial<TypeOptions>): Chainable<Element>
//       visit(originalFn: CommandOriginalFn, url: string, options: Partial<VisitOptions>): Chainable<Element>
//     }
//   }
// }

declare namespace Cypress {
  interface Chainable {
    login(username: string): Chainable<void>;
    logout(): Chainable<void>;
    openWorkspace(workspace: string): Chainable<void>;
    createWorkspace(workspace: string): Chainable<void>;
    deleteWorkspace(workspace: string): Chainable<void>;
    openChannel(channel: string): Chainable<void>;
    createChannel(channel: string): Chainable<void>;
    deleteChannel(channel: string): Chainable<void>;
    createPost(post: string): Chainable<void>;
    getPost(post: string): Chainable<JQuery<Element>>;
    replyToPost(reply: string): Chainable<void>;
    reactToPost(reaction: string): Chainable<void>;
  }
}

/*
 * This file contains the necessary custom commands to interact with your
 * application.  These commands should only do exactly what they say they do and
 * should only assume what the comments say they should assume.  These commands
 * can be used within your own tests and will be used by the machine grading
 * system to test your application.  It is therefore incredibly important you do
 * not change the behavior of these commands or the assumptions they make.
 *
 * Each command is likely to only be 2-3 lines of code that calls chained Cypress
 * commands.  If you find yourself writing a lot of code in a command, you may
 * want to ask for help or reconsider the structure of your application.
 *
 * Note that Cypress cannot "get" or "find" custom elements. However, as long as
 * the shadow DOM is created as "open", it can search within the shadow DOM. If
 * you need to return a custom element, you can "find" an element within the
 * shadow DOM and use ".parent()" as needed to return the custom element.
 */

/**
 * Login using given username.
 *
 * Assumes that no one is currently logged in.
 *
 * @param username Username to login with.
 */
Cypress.Commands.add("login", (username: string) => {
  // Cypress code to login.
  cy.get("#username").type(username);
  // cy.wait(4000);
  cy.get("#login-form button[type=submit]").click()
});

/**
 * Logout the currently logged in user.
 *
 * Assumes that a user is currently logged in.
 */
Cypress.Commands.add("logout", () => {
  // Cypress code to logout.
  cy.get("#logout-button").click();
});

/**
 * Open a workspace.
 *
 * Assumes that someone is logged in and that the workspace exists.
 *
 * @param workspace Name of the workspace to open.
 */
Cypress.Commands.add("openWorkspace", (workspace: string) => {
  // Cypress code to open the workspace.
  cy.get(".dropbtn").click();
  cy.get(".dropdown-item").contains(workspace)
  .click();
});

/**
 * Create a workspace.
 *
 * Assumes that someone is logged in and that the workspace does not exist.
 *
 * @param workspace Name of the workspace to create.
 */
Cypress.Commands.add("createWorkspace", (workspace: string) => {
  // Cypress code to create the workspace.
  cy.get("#edit-workspace-button").click()
  cy.get(".create-workspace").click();
  cy.get(".workspace-input-box").type(workspace);
  cy.get(".submit-workspace").click();
});

/**
 * Delete a workspace.
 *
 * Assumes that someone is logged in and that the workspace exists.
 *
 * @param workspace Name of the workspace to delete.
 */
Cypress.Commands.add("deleteWorkspace", (workspace: string) => {
  cy.get("#edit-workspace-button").click()
  cy.get(".delete-workspace").click();
  cy.get(".workspace-input").type(workspace);
  cy.get(".confirm-delete-workspace").click();
  // Cypress code to delete the workspace.
});

/**
 * Open a channel.
 *
 * Assumes that someone is logged in, a workspace is open, and that the channel
 * exists in that workspace.
 *
 * @param channel Name of the channel to open.
 */
Cypress.Commands.add("openChannel", (channel: string) => {
  // Cypress code to open the channel.
  cy.get(".sidebar-item").contains(channel).click();
});

/**
 * Create a channel.
 *
 * Assumes that someone is logged in, a workspace is open, and that the channel
 * does not exist in that workspace.
 *
 * @param channel Name of the channel to create.
 */
Cypress.Commands.add("createChannel", (channel: string) => {
  cy.get("#edit-channel-button").click();
  cy.get(".create-channel").click();
  cy.get(".channel-input-box").type(channel);
  cy.get(".submit-channel").click();
  // cy.get("edit-channel-button").shadow().within(() => {
  //   cy.get("#edit-channel-button").click(); // Click the button in the shadow DOM
  //   cy.get(".create-channel").click();
  //   cy.get(".channel-input-box").type(channel);
  //   cy.get(".submit-channel").click();
  // });
  // Cypress code to create the channel.
});

/**
 * Delete a channel.
 *
 * Assumes that someone is logged in, a workspace is open, and that the channel
 * exists in that workspace.
 *
 * @param channel Name of the channel to delete.
 */
Cypress.Commands.add("deleteChannel", (channel: string) => {
  // Cypress code to delete the channel.
  cy.get("#edit-channel-button").click()
  cy.get(".delete-channel").click();
  cy.get(".channel-input").type(channel);
  cy.get(".confirm-delete-channel").click();
});

/**
 * Create a post.
 *
 * Assumes that someone is logged in, a workspace is open, and a channel is open.
 *
 * @param post Text of the post to create.
 */
Cypress.Commands.add("createPost", (post: string) => {
  // Cypress code to create the post.
  cy.get("#chat-input").type(post);
  cy.get("#send-button").click();
});

/**
 * Get a post.
 *
 * Assumes that someone is logged in, a workspace is open, and a channel is open.
 * Also can assume the text only appears in a single post in the channel.
 * The given searchText may not be the full text of the post, but the post should
 * contain the searchText in its entirety.
 *
 * @param searchText Text that appears in the post to get.
 * @returns The post element that contains the searchText.  This element will
 *          be passed to the replyToPost and reactToPost commands, so should
 *          be the enclosing post element that allows those actions.
 */
Cypress.Commands.add(
  "getPost",
  (searchText: string): Cypress.Chainable<JQuery<Element>> => {
    // Cypress code to get the post.
    // Must return an element that can be used by the replyToPost and reactToPost commands.
    return cy.get(".message").contains(searchText).parent();
    // return cy.get(".message").filter((_, el) => {
    //   // Check if the text is included in the span inside the message
    //   return Cypress.$(el).find("span").text().includes(searchText);
    // });
  }
);

/**
 * Reply to a post.
 *
 * Assumes that someone is logged in, a workspace is open, a channel is open, and
 * that the provided post exists and came from the "getPost" command.
 *
 * @param subject The post to reply to (from getPost).
 * @param reply Text of the reply to create.
 */
Cypress.Commands.add(
  "replyToPost",
  { prevSubject: true },
  (subject, reply: string) => {
    // Cypress code to reply to the post.

    cy.wrap(subject).get("#reply-button").click(); // ADD A RPLY BUTTOn
    cy.get("#chat-input").type(reply);
    cy.get("#send-button").click();
    // cy.wrap(subject).find("#send-button").click();
  }
);

/**
 * React to a post.
 *
 * Assumes that someone is logged in, a workspace is open, a channel is open,
 * and that the provided post exists and came from the "getPost" command.
 *
 * @param subject The post to react to (from getPost).
 * @param reaction The reaction to react with (should be one of ":smile:",
 *                 ":frown:", ":like:", or ":celebrate:").
 */
Cypress.Commands.add(
  "reactToPost",
  { prevSubject: true },
  (subject, reaction: string) => {
    // Cypress code to react to the post.
    cy.wrap(subject)
    .find(`.reaction-button[data-reaction="${reaction}"]`)
    .click();
  }
);
