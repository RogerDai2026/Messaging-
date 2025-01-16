/// <reference types="cypress" />

// Requires OwlDB to be running with the m3ssag1n8 database loaded. Requires the
// web server to be running on baseURL, as defined in cypress.config.ts.

// .env variables DATABASE_HOST, DATABASE_PATH, and AUTH_PATH are accessible as
// Cypress.env("DATABASE_HOST"), etc.

// These tests are NOT comlete.  They are simply meant to demonstrate how tests
// can use the commands you must write.  While you should pass these tests, you
// should not assume that means the features be tested are fully correct.  The
// tests do not check everything that needs to happen for each feature to be
// correct, for instance.

describe("Login/Logout Tests", () => {
  beforeEach(() => {
    cy.visit("/");
  });

  it("should login", () => {
    // Intercept login request
    cy.intercept(
      "POST",
      `${Cypress.env("DATABASE_HOST")}${Cypress.env("AUTH_PATH")}`
    ).as("login");

    // Login
    cy.login("login user");

    // Ensure correct login request responds before checking page for username
    cy.wait("@login").its("request.body.username").should("eq", "login user");

    // Confirm username appears on the page other than in username input
    cy.contains(":not(input)", "login user").should("exist");
  });

  it("should logout", () => {
    // Login
    cy.login("logout user");

    // Confirm username appears on the page other than in username input
    cy.contains(":not(input)", "logout user").should("exist");

    // Intercept logout request
    cy.intercept(
      "DELETE",
      `${Cypress.env("DATABASE_HOST")}${Cypress.env("AUTH_PATH")}`
    ).as("logout");

    // Logout
    cy.logout();

    // Confirm username does not appear on the page
    cy.contains("logout user").should("not.exist");

    // Confirm correct logout request was sent
    cy.wait("@logout").its("response.statusCode").should("eq", 204);
  });
});

describe("Workspaces Tests", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.login("workspace user");
  });

  afterEach(() => {
    cy.logout();
  });

  it("should create a new workspace", () => {
    // Create a new workspace
    cy.createWorkspace("New Workspace");

    // Confirm that the new workspace's name is visible
    cy.contains("New Workspace").should("exist");
  });

  it("should delete a new workspace", () => {
    // Create a new workspace
    cy.deleteWorkspace("New Workspace");

    // Confirm that the new workspace's name is visible
    cy.contains("New Workspace").should("not.exist");
  });



  it("should select COMP 318 workspace", () => {
    cy.createWorkspace("COMP 318");
    // Open COMP 318 workspace
    cy.openWorkspace("COMP 318");

    // Confirm that the workspace's name is visible
    cy.contains("COMP 318").should("exist");
    cy.deleteWorkspace("COMP 318");
  });

  it("should select Messaging workspace", () => {
    // Open Messaging workspace
    cy.createWorkspace("Messaging");
    cy.openWorkspace("Messaging");


    // Confirm that the workspace's name is visible
    cy.contains("Messaging").should("exist");
    cy.deleteWorkspace("Messaging");
    cy.createWorkspace("COMP 310");
  });

});

describe("Channels Tests", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.login("channel user");
    cy.openWorkspace("COMP 310");
  });

  afterEach(() => {
    cy.logout();
  });

  it("should select Project 1 channel", () => {
    cy.createChannel("Project 1");
    // Open Project 1 channel
    cy.openChannel("Project 1");

    cy.createPost("This post should appear first");
    // Confirm that one of the channel's posts is visible
    cy.contains("This post should appear first").should("exist");
    cy.deleteChannel("Project 1");
  });

  it("should select Tutorials channel", () => {
    cy.createChannel("Tutorials");
    // Open Tutorials channel
    cy.openChannel("Tutorials");

    cy.createPost("No response?");
    // Confirm that one of the channel's posts is visible
    cy.contains("No response?").should("exist");
    cy.deleteChannel("Tutorials");
  });

  it("should create a new channel", () => {
    // Create a new channel
    cy.createChannel("New Channel");

    // Confirm that the new channel's name is visible
    cy.contains("New Channel").should("exist");
  });

  it("should delete a new channel", () => {
    // Create a new channel
    cy.deleteChannel("New Channel");

    // Confirm that the new channel's name is visible
    cy.contains("New Channel").should("not.exist");
  });


});

describe("Posts Tests", () => {
  beforeEach(() => {
    cy.visit("/");
    cy.login("posts user");
    cy.openWorkspace("COMP 310");
  });

  afterEach(() => {
    cy.logout();
  });

  it("should create a new post", () => {
    cy.createChannel("Tutorial");
    cy.openChannel("Tutorial");
    // Create a new post
    cy.createPost("This is a new post");

    // Confirm that the new post is visible
    cy.contains("This is a new post").should("exist");

    // Create another new post
    cy.createPost("This is another new post");

    // Confirm that the first new post is still visible
    cy.contains("This is a new post").should("exist");

  });

  it("should reply to a post", () => {
    cy.openChannel("Tutorial");

    cy.createPost("No response?");
    // Reply to a post
    cy.getPost("No response?").replyToPost("This is a reply");

    // Confirm that the reply is visible
    cy.contains("This is a reply").should("exist");

    cy.createPost("This is a brand new post");

    cy.contains("This is a reply").should("exist");

    cy.getPost("This is a brand new post").replyToPost("This is a reply to a reply");

  });

  it("should react to a post", () => {
    cy.openChannel("Tutorial");
    // React to a post
    cy.getPost("No response?").reactToPost(":smile:");

    // Confirm that a reaction count of 1 is visible
    cy.contains("1").should("exist");

    cy.getPost("No response?").reactToPost(":smile:");


    cy.contains("0").should("exist");

    //delete everything
    cy.deleteChannel("Tutorial");
    cy.deleteWorkspace("COMP 310");
  });
});
