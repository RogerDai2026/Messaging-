// Tests run on owlDB database on database names and URLs as specified in given .env file

/// <reference types="cypress" />

import { setupDatabase } from "./setup";

// Make absolutely sure the ".env" file has the correct database path
// for testing. This is the path that will be used to access the database
// in the tests. It should be the same as the path used in the application
// under test.
const host: string = Cypress.env("DATABASE_HOST");
const database: string = Cypress.env("DATABASE_PATH");




describe("Basic Test", () => {
  before(() => {
    // Setup the database once before all tests in this describe block.
    setupDatabase(host, database);
  });

  beforeEach(() => {
    // Open the application.
    cy.visit("/");
  });

  it("should access programmatically created database", () => {
    // Basic test that logs in, opens workspace, opens channel, and checks post
    cy.login("user2");
    cy.openWorkspace("Workspace");
    cy.openChannel("Channel");
    cy.getPost("This is a test post");
  });
});


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
      
          cy.wait("@login").then((interception) => {
                // Add a type guard to ensure response exists
                if (!interception.response) {
                    throw new Error("No response received for the login request");
                }
    
                // Extract the auth token from the response body
                const authToken = interception.response.body.token; // Replace 'token' with your API's key for the token
                expect(authToken).to.exist; // Ensure token is present
                Cypress.env("AUTH_TOKEN", authToken); // Store the token for later use
            });
            // Confirm username appears on the page other than in username input
            cy.contains(":not(input)", "login user").should("exist");
      
          // Confirm username appears on the page other than in username input
          cy.contains(":not(input)", "login user").should("exist");
        });
});      

describe("Reaction Tests", () => {
        before(() => {
        // Setup the database once before all tests in this describe block.
        setupDatabase(host, database);
        });
        
        beforeEach(() => {
        // Open the application.
        cy.visit("/");
        });

        it("should react to all posts, check if they are 1 or 0", () => {
                cy.login("user2");
                cy.openWorkspace("Workspace");
                cy.openChannel("Channel");

                cy.getPost("This is a test post").reactToPost(":smile:");
                cy.contains("1").should("exist");
                cy.getPost("This is a test post").reactToPost(":smile:");
                cy.contains("0").should("exist");

                cy.getPost("This is a test post").reactToPost(":frown:");
                cy.contains("1").should("exist");
                cy.getPost("This is a test post").reactToPost(":frown:");
                cy.contains("0").should("exist");

                cy.getPost("This is a test post").reactToPost(":like:");
                cy.contains("1").should("exist");
                cy.getPost("This is a test post").reactToPost(":like:");
                cy.contains("0").should("exist");

                cy.getPost("This is a test post").reactToPost(":celebrate:");
                cy.contains("1").should("exist");
                cy.getPost("This is a test post").reactToPost(":celebrate:");
                cy.contains("0").should("exist");
        });
});

// Test bold, italicize and hyperlink
describe("Text Formatting Tests", () => {
        before(() => {
                setupDatabase(host, database);
        });
        beforeEach(() => {
        // Open the application.
        cy.visit("/");
        });
        afterEach(() => {
                cy.logout();
        });
        it("should bold the selected text and verify the display", () => {
                cy.login("user2");
                cy.openWorkspace("Workspace");
                cy.openChannel("Channel");
            
                const message = "This is a bold text";
            
                // Type the message into the input box
                cy.get("#chat-input")
                    .type(message)
                    .then(($input) => {
                        // Cast the element to HTMLTextAreaElement to use setSelectionRange
                        const input = $input[0] as HTMLTextAreaElement;
            
                        // Use setSelectionRange to select the portion of the text to bold
                        input.setSelectionRange(0, message.length); // Select the whole message
                    });
                // Click the bold button
                cy.get('iconify-icon[icon="mdi:format-bold"]').click();
            
                // Send the message
                cy.get("#send-button").click();
            
                // Verify that the bold text is rendered in HTML within <strong> tags
                cy.get(".message").last().scrollIntoView().within(() => {
                    cy.get("strong").contains(message).should("exist");
                });
            });            
        it("should italicize the selected text and verify the display", () => {
                cy.login("user2");
                cy.openWorkspace("Workspace");
                cy.openChannel("Channel");
            
                const message = "This is an italicized text";
            
                // Type the message into the input box
                cy.get("#chat-input")
                    .type(message)
                    .then(($input) => {
                        // Cast the element to HTMLTextAreaElement to use setSelectionRange
                        const input = $input[0] as HTMLTextAreaElement;
            
                        // Use setSelectionRange to select the portion of the text to italicize
                        input.setSelectionRange(0, message.length); // Select the whole message
                    });
            
                // Click the italic button
                cy.get('iconify-icon[icon="mdi:format-italic"]').click();
            
                // Send the message
                cy.get("#send-button").click();

            
                // Verify that the italicized text is rendered in HTML within <em> tags
                cy.get(".message").last().scrollIntoView().within(() => {
                    cy.get("em").contains(message).should("exist");
                });
            });
        it("should send a hyperlinked text", () => {
                cy.login("user2");
                cy.openWorkspace("Workspace");
                cy.openChannel("Channel");
                // Create a post with italicized text
                cy.createPost("[This is a hyperlink text](link.com)");
                // Verify the italicized text is rendered in HTML within <em> tags
                cy.get(".message").last().scrollIntoView().within(() => {
                cy.get("a").contains("This is a hyperlink text").should("exist");});
        });

        it("should send a bolded, italiziced, hyperlinked text", () => {
                cy.login("user2");
                cy.openWorkspace("Workspace");
                cy.openChannel("Channel");

                // Create a post with italicized text
                cy.createPost("[***This is a bolded, italiziced, hyperlinked text***](link)");
                // Verify the italicized text is rendered in HTML within <em> tags
                // Verify the nested structure in HTML
                cy.get(".message")
                .last() // Select the most recent message
                .within(() => {
                        cy.get("a[href='link']").should("exist").scrollIntoView().within(() => { // Outer layer is hhyperlink
                        cy.get("strong").should("exist").within(() => { // Bold
                        cy.get("em").contains("This is a bolded, italiziced, hyperlinked text").should("exist"); // Italics
                                });
                        });
                });

        });
});

//Test the usage of the buttons, if they add a
describe("Emoji text tests", () => {
        before(() => {
                setupDatabase(host, database);
        });
        beforeEach(() => {
        // Open the application.
        cy.visit("/");
        cy.login("user2");
        cy.openWorkspace("Workspace");
        cy.openChannel("Channel");
        });
        afterEach(() => {
                cy.logout();
        });

        it("should post a smile", () => {
                cy.createPost(":smile:");
                cy.get(".message")
                .last() // Select the most recent message
                .within(() => {
                        cy.get("iconify-icon[icon='twemoji:smiling-face']")
                        .should("exist") // Ensure the icon is present
                        .and("be.visible"); // Ensure it is visible
                });
        });

        it("should post a frown", () => {
                cy.createPost(":frown:");
                cy.get(".message")
                .last() // Select the most recent message
                .within(() => {
                        cy.get("iconify-icon[icon='twemoji:slightly-frowning-face']")
                        .should("exist") // Ensure the icon is present
                        .and("be.visible"); // Ensure it is visible
                });
        });

        it("should post a like", () => {
                cy.createPost(":like:");
                cy.get(".message")
                .last() // Select the most recent message
                .scrollIntoView()
                .within(() => {
                        cy.get("iconify-icon[icon='twemoji:thumbs-up']")
                        .should("exist") // Ensure the icon is present
                        .and("be.visible"); // Ensure it is visible
                });
        });

        it("should post a celebrate", () => {
                cy.createPost(":celebrate:");
                cy.get(".message")
                .last() // Select the most recent message
                .scrollIntoView()
                .within(() => {
                        cy.get("iconify-icon[icon='twemoji:party-popper']")
                        .should("exist") // Ensure the icon is present
                        .and("be.visible"); // Ensure it is visible
                });
        });

});


describe("createworkspace error test", () => {
        before(() => {
                setupDatabase(host, database);
        });
        beforeEach(() => {
        // Open the application.
        cy.visit("/");
        cy.login("user2");
        });
        afterEach(() => {
                cy.logout();
        });
        it("should fail to create a workspace", () => {
                cy.createWorkspace("Workspace");
                cy.createWorkspace ("Workspace");
                cy.get(".error-button-workspace").contains("Fetch failed: Bad Request").should("exist");
                cy.get(".error-button-workspace").find(".close-icon").click();
                cy.get(".error-button-workspace").should("not.exist");
                cy.createWorkspace("Workspace");
                cy.createWorkspace("new workspace");
                cy.get(".error-button-workspace").should("not.exist");
                cy.deleteWorkspace("new workspace");
                cy.deleteWorkspace("Workspace");
        });

        it("should fail to delete a workspace", () => {
                cy.deleteWorkspace("Workspace");
                cy.get(".error-button-workspace").contains("Failed to delete workspace: Not Found").should("exist");
                cy.get(".error-button-workspace").find(".close-icon").click();
                cy.get(".error-button-workspace").should("not.exist");
                cy.deleteWorkspace("new workspace");
                cy.createWorkspace("new workspace");
                cy.get(".error-button-workspace").should("not.exist");
                cy.deleteWorkspace("new workspace");
        });
});

describe("createchannel error test", () => {
        before(() => {
                setupDatabase(host, database);
        });
        beforeEach(() => {
        // Open the application.
        cy.visit("/");
        cy.login("user4");
        cy.createWorkspace("channel-test");
        cy.openWorkspace("channel-test");
        });
        afterEach(() => {
                cy.logout();
        });
        it("should fail to create a channel", () => {
                cy.createChannel("Channel");
                cy.createChannel("Channel");
                cy.get(".error-button-channel").contains("Fetch failed: Bad Request").should("exist");
                cy.get(".error-button-channel").find(".close-icon").click();
                cy.get(".error-button-channel").should("not.exist");
                cy.createChannel("Channel");
                cy.createChannel("new channel");
                cy.get(".error-button-channel").should("not.exist");
                cy.deleteChannel("new channel");
                cy.deleteChannel("Channel");
                cy.deleteWorkspace("channel-test");
        });
        it("should fail to delete a channel", () => {
                cy.deleteChannel("Channel");
                cy.get(".error-button-channel").contains("Failed to delete channel: Not Found").should("exist");
                cy.get(".error-button-channel").find(".close-icon").click();
                cy.get(".error-button-channel").should("not.exist");
                cy.deleteChannel("new channel");
                cy.createChannel("new channel");
                cy.get(".error-button-channel").should("not.exist");
                cy.deleteWorkspace("channel-test");
                cy.deleteChannel("new channel");
        });
});


describe("Concurrency test", () => {
        before(() => {
          // Setup the database once before all tests in this describe block.
          setupDatabase(host, database);
        });
      
        beforeEach(() => {
          // Open the application.
          cy.visit("/");
        });
      
        it("concurrency test", () => {
                cy.login("user2");
                cy.createWorkspace("Workspace 1");
                cy.openWorkspace("Workspace 1");
                cy.createChannel("Tutorials");
                cy.openChannel("Tutorials");
                const newPostContent = "This is a remotely added post";
                const workspaceName = "Workspace 1";
                const channelName = "Tutorials";
        
                // Get the current token and workspace/channel paths from the application or environment
                const authToken = Cypress.env("AUTH_TOKEN");
                const databaseHost = Cypress.env("DATABASE_HOST");
                const databasePath = Cypress.env("DATABASE_PATH");
        
                const workspaceId = encodeURIComponent(workspaceName);
                const channelId = encodeURIComponent(channelName);
              
                const postUrl = `${databaseHost}${databasePath}${workspaceId}/channels/${channelId}/posts/`;
        
                // Construct the payload
                const payload = {
                    msg: newPostContent,
                };
        
                // Send the POST request to add the new post
                cy.request({
                    method: "POST",
                    url: postUrl,
                    headers: {
                        accept: "application/json",
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${authToken}`,
                    },
                    body: payload,
                }).then((response) => {
                    // Verify that the POST request was successful
                    expect(response.status).to.eq(201); // Ensure the correct status code is returned
                });
        
                cy.wait(1000);
        
                cy.get(".message")
                    .contains(newPostContent) // Verify the post's content
                    .should("exist");
            });
        });

      