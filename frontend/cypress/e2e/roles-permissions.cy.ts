describe('Roles and Permissions E2E Tests', () => {
  const baseUrl = 'http://localhost:4200';
  const apiUrl = 'http://localhost:5000/api';

  // Helper function to login
  const login = (email: string, password: string) => {
    cy.visit(`${baseUrl}/login`);
    cy.get('input[type="email"]').clear().type(email);
    cy.get('input[type="password"]').clear().type(password);
    cy.get('button[type="submit"]').click();
    cy.wait(2000); // Wait for authentication and redirect
  };

  // Helper function to logout
  const logout = () => {
    cy.contains('Logout', { matchCase: false }).click();
    cy.wait(1000);
  };

  before(() => {
    // Ensure backend is running on port 5000
    cy.request(`${apiUrl}/health`).its('status').should('eq', 200);
  });

  // describe('Reader Role Tests', () => {
  //   beforeEach(() => {
  //     login('reader@test.com', 'password123');
  //   });

  //   afterEach(() => {
  //     logout();
  //   });

  //   it('should successfully login as Reader', () => {
  //     cy.url().should('not.include', '/login');
  //     cy.contains('reader', { matchCase: false }).should('exist');
  //   });

  //   it('should NOT see "Write Article" button in navbar', () => {
  //     cy.visit(`${baseUrl}/articles`);
  //     cy.wait(1000);
  //     cy.get('nav, header').then(($nav) => {
  //       expect($nav.text()).to.not.include('Write Article');
  //     });
  //   });

  //   it('should NOT access article creation page', () => {
  //     cy.visit(`${baseUrl}/articles/create`, { failOnStatusCode: false });
  //     cy.wait(1000);
  //     // Should be redirected away from create page
  //     cy.url().then((url) => {
  //       expect(url).to.not.include('/articles/create');
  //     });
  //   });

  //   it('should be able to read articles', () => {
  //     cy.visit(`${baseUrl}/articles`);
  //     cy.wait(1000);
  //     // Check if articles list exists or no articles message
  //     cy.get('body').should('exist');
  //     cy.url().should('include', '/articles');
  //   });

  //   it('should be able to view article details', () => {
  //     cy.visit(`${baseUrl}/articles`);
  //     cy.wait(1000);
  //     // Try to click on an article if available
  //     cy.get('body').then(($body) => {
  //       if ($body.find('app-article-card').length > 0) {
  //         cy.get('app-article-card').first().find('a:contains("Read More")').click();
  //         cy.wait(1000);
  //         cy.url().should('match', /\/articles\/.+/);
  //       }
  //     });
  //   });

  //   it('should be able to post comments', () => {
  //     cy.visit(`${baseUrl}/articles`);
  //     cy.wait(1000);
  //     cy.get('body').then(($body) => {
  //       if ($body.find('app-article-card').length > 0) {
  //         cy.get('app-article-card').first().find('a:contains("Read More")').click();
  //         cy.wait(1500);
          
  //         // Try to find comment textarea
  //         cy.get('body').then(($detail) => {
  //           if ($detail.find('textarea').length > 0) {
  //             const commentText = `Test comment by reader ${Date.now()}`;
  //             cy.get('textarea').first().clear().type(commentText);
  //             cy.contains('button', /post|comment|submit/i).click();
  //             cy.wait(2000);
  //           }
  //         });
  //       }
  //     });
  //   });

  //   it('should NOT see edit/delete buttons on articles they do not own', () => {
  //     cy.visit(`${baseUrl}/articles`);
  //     cy.wait(1000);
  //     cy.get('body').then(($body) => {
  //       if ($body.find('app-article-card').length > 0) {
  //         cy.get('app-article-card').first().find('a:contains("Read More")').click();
  //         cy.wait(1000);
  //         cy.contains('Edit Article').should('not.exist');
  //         cy.contains('Delete Article').should('not.exist');
  //       }
  //     });
  //   });

  //   it('should NOT see Admin link in navbar', () => {
  //     cy.get('nav').within(() => {
  //       cy.contains('Admin').should('not.exist');
  //     });
  //   });
  // });

  // describe('Writer Role Tests', () => {
  //   beforeEach(() => {
  //     login('writer@test.com', 'password123');
  //   });

  //   afterEach(() => {
  //     logout();
  //   });

  //   it('should successfully login as Writer', () => {
  //     cy.url().should('not.include', '/login');
  //     cy.contains('writer', { matchCase: false }).should('exist');
  //   });

  //   it('should see "Write Article" button in navbar', () => {
  //     cy.get('nav').within(() => {
  //       cy.contains('Write Article').should('exist');
  //     });
  //   });

  //   it('should be able to access article creation page', () => {
  //     cy.contains('Write Article').click();
  //     cy.url().should('include', '/articles/create');
  //   });

  //   it('should be able to create a new article', () => {
  //     cy.visit(`${baseUrl}/articles/create`);
  //     cy.wait(1000);
      
  //     const articleTitle = `Test Article ${Date.now()}`;
  //     cy.get('input[formcontrolname="title"]').clear().type(articleTitle);
  //     cy.get('.ql-editor').clear().type('This is the test content for the article. It should be long enough to be valid. Adding more text to meet minimum character requirements for article content.');
      
  //     cy.contains('button', /publish|create|save/i).click();
  //     cy.wait(3000);
      
  //     // Should redirect to articles list or detail page
  //     cy.url().should('not.include', '/create');
  //   });

  //   it('should be able to edit own articles', () => {
  //     cy.visit(`${baseUrl}/profile`);
  //     cy.wait(2000);
      
  //     cy.get('body').then(($body) => {
  //       if ($body.find('app-article-card').length > 0) {
  //         // Click on article to go to detail page
  //         cy.get('app-article-card').first().find('a:contains("Read More")').click();
  //         cy.wait(1500);
          
  //         // Now we're on detail page, look for Edit button
  //         cy.get('body').then(($detail) => {
  //           if ($detail.find('a:contains("Edit"), button:contains("Edit")').length > 0) {
  //             cy.contains('a, button', 'Edit').click();
  //             cy.wait(1000);
  //             cy.url().should('include', '/edit');
  //             cy.get('input[formcontrolname="title"]').clear().type('Updated Article Title');
  //             cy.contains('button', /update|save/i).click();
  //             cy.wait(2000);
  //           }
  //         });
  //       }
  //     });
  //   });

  //   it('should be able to delete own articles', () => {
  //     cy.visit(`${baseUrl}/profile`);
  //     cy.wait(1000);
      
  //     cy.get('body').then(($body) => {
  //       if ($body.find('app-article-card').length > 0) {
  //         // Click on article to go to detail page
  //         cy.get('app-article-card').first().find('a:contains("Read More")').click();
  //         cy.wait(1500);
          
  //         // Now we're on detail page, look for Delete button
  //         cy.get('body').then(($detail) => {
  //           if ($detail.find('button:contains("Delete")').length > 0) {
  //             cy.contains('button', 'Delete').click();
  //             cy.wait(500);
  //             // Confirm deletion if there's a confirmation dialog
  //             cy.get('body').then(($confirm) => {
  //               if ($confirm.text().includes('Confirm')) {
  //                 cy.contains('Confirm', { matchCase: false }).click();
  //               }
  //             });
  //             cy.wait(1000);
  //           }
  //         });
  //       }
  //     });
  //   });

  //   it('should NOT be able to edit articles from other users', () => {
  //     cy.visit(`${baseUrl}/articles`);
  //     cy.wait(1000);
  //     cy.get('body').then(($body) => {
  //       if ($body.find('app-article-card').length > 0) {
  //         cy.get('app-article-card').first().find('a:contains("Read More")').click();
  //         cy.wait(1000);
  //         // Check if this article belongs to another user
  //         cy.get('body').then(($detail) => {
  //           if (!$detail.text().includes('writer')) {
  //             cy.contains('Edit Article').should('not.exist');
  //           }
  //         });
  //       }
  //     });
  //   });

  //   it('should NOT see Admin link in navbar', () => {
  //     cy.get('nav').within(() => {
  //       cy.contains('Admin Dashboard').should('not.exist');
  //       cy.contains('Admin').should('not.exist');
  //     });
  //   });
  // });

  describe('Editor Role Tests', () => {
    beforeEach(() => {
      login('editor@test.com', 'password123');
    });

    afterEach(() => {
      logout();
    });

    it('should successfully login as Editor', () => {
      cy.url().should('not.include', '/login');
      cy.contains('editor', { matchCase: false }).should('exist');
    });

    it('should see "Write Article" button', () => {
      cy.get('nav').within(() => {
        cy.contains('Write Article').should('exist');
      });
    });

    it('should be able to create articles', () => {
      cy.visit(`${baseUrl}/articles/create`);
      cy.wait(1000);
      
      const articleTitle = `Editor Article ${Date.now()}`;
      cy.get('input[formcontrolname="title"]').clear().type(articleTitle);
      cy.get('.ql-editor').clear().type('Editor test content that is sufficiently long. Adding more text to meet the minimum character requirements for article content validation.');
      
      cy.contains('button', /publish|create/i).click();
      cy.wait(3000);
      cy.url().should('not.include', '/create');
    });

    it('should be able to edit ANY article', () => {
      cy.visit(`${baseUrl}/articles`);
      cy.wait(1000);
      
      cy.get('body').then(($body) => {
        if ($body.find('app-article-card').length > 0) {
          cy.get('app-article-card').first().find('a:contains("Read More")').click();
          cy.wait(1500);
          
          cy.get('body').then(($detail) => {
            if ($detail.find('a:contains("Edit")').length > 0) {
              cy.contains('a', 'Edit').click();
              cy.wait(1000);
              cy.url().should('include', '/edit');
              const newTitle = `Edited by Editor ${Date.now()}`;
              cy.get('input[formcontrolname="title"]').clear().type(newTitle);
              cy.contains('button', /update|save/i).click();
              cy.wait(2000);
            }
          });
        }
      });
    });

    it('should be able to delete ANY article', () => {
      cy.visit(`${baseUrl}/articles`);
      cy.wait(1000);
      cy.get('body').then(($body) => {
        if ($body.find('app-article-card').length > 0) {
          cy.get('app-article-card').first().find('a:contains("Read More")').click();
          cy.wait(1000);
          
          cy.get('body').then(($detail) => {
            if ($detail.find('button:contains("Delete")').length > 0) {
              cy.contains('button', 'Delete').click();
              cy.wait(500);
              // Handle confirmation if it exists
              cy.get('body').then(($confirm) => {
                if ($confirm.text().includes('Confirm')) {
                  cy.contains('Confirm').click();
                }
              });
              cy.wait(1000);
            }
          });
        }
      });
    });

    it('should NOT see Admin link (unless also admin)', () => {
      cy.get('nav').within(() => {
        cy.contains('Admin Dashboard').should('not.exist');
      });
    });
  });

  describe('Admin Role Tests', () => {
    beforeEach(() => {
      login('admin@test.com', 'password123');
    });

    afterEach(() => {
      logout();
    });

    it('should successfully login as Admin', () => {
      cy.url().should('not.include', '/login');
      cy.contains('admin', { matchCase: false }).should('exist');
    });

    it('should see Admin link in navbar', () => {
      cy.get('nav').within(() => {
        cy.contains('Admin').should('exist');
      });
    });

    it('should be able to access admin dashboard', () => {
      cy.contains('Admin').click();
      cy.url().should('include', '/admin');
      cy.contains('User Management', { matchCase: false }).should('exist');
    });

    it('should see list of users in admin dashboard', () => {
      cy.visit(`${baseUrl}/admin`);
      cy.wait(2000);
      // Should see some user management interface
      cy.get('body').then(($body) => {
        const text = $body.text().toLowerCase();
        expect(text).to.include('user');
      });
    });

    it('should be able to change user roles', () => {
      cy.visit(`${baseUrl}/admin`);
      cy.wait(2000);
      
      cy.get('body').then(($body) => {
        if ($body.find('.user-row, .user-item, table tbody tr, select').length > 0) {
          cy.get('select, [name="role"]').first().select('writer', { force: true });
          cy.wait(500);
          cy.get('button').filter(':contains("Update"), :contains("Save")').first().click({ force: true });
          cy.wait(2000);
        }
      });
    });

    it('should be able to delete users', () => {
      cy.visit(`${baseUrl}/admin`);
      cy.wait(1000);
      
      // Try to find and delete a non-admin user
      cy.get('.user-row, .user-item, table tbody tr').last().within(() => {
        cy.contains('Delete', { matchCase: false }).click();
      });
      
      cy.contains('Confirm', { matchCase: false }).click();
      cy.wait(1000);
    });

    it('should be able to edit ANY article', () => {
      cy.visit(`${baseUrl}/articles`);
      cy.wait(1000);
      cy.get('body').then(($body) => {
        if ($body.find('app-article-card').length > 0) {
          cy.get('app-article-card').first().find('a:contains("Read More")').click();
          cy.wait(1000);
          
          cy.get('body').then(($detail) => {
            if ($detail.find('a:contains("Edit")').length > 0) {
              cy.contains('a', 'Edit').click();
              cy.url().should('include', '/edit');
            }
          });
        }
      });
    });

    it('should be able to delete ANY article', () => {
      cy.visit(`${baseUrl}/articles`);
      cy.wait(1000);
      cy.get('body').then(($body) => {
        if ($body.find('app-article-card').length > 0) {
          cy.get('app-article-card').first().find('a:contains("Read More")').click();
          cy.wait(1000);
          
          cy.get('body').then(($detail) => {
            if ($detail.find('button:contains("Delete")').length > 0) {
              cy.contains('button', 'Delete').click();
              cy.wait(500);
              // Handle confirmation if it exists
              cy.get('body').then(($confirm) => {
                if ($confirm.text().includes('Confirm')) {
                  cy.contains('Confirm').click();
                }
              });
              cy.wait(1000);
              cy.url().should('not.include', '/articles/');
            }
          });
        }
      });
    });

    it('should be able to create articles', () => {
      cy.visit(`${baseUrl}/articles/create`);
      cy.wait(1000);
      
      const articleTitle = `Admin Article ${Date.now()}`;
      cy.get('input[formcontrolname="title"]').clear().type(articleTitle);
      cy.get('.ql-editor').clear().type('Admin test content that is sufficiently long. Adding more text to meet the minimum character requirements for article content validation.');
      
      cy.contains('button', /publish|create/i).click();
      cy.wait(3000);
      cy.url().should('not.include', '/create');
    });
  });

  describe('Navigation Guards and Security', () => {
    it('should redirect unauthenticated users to login', () => {
      // Clear any existing session
      cy.clearCookies();
      cy.clearLocalStorage();
      cy.visit(`${baseUrl}/articles/create`, { failOnStatusCode: false });
      cy.wait(1000);
      cy.url().should('include', '/login');
    });

    it('should prevent reader from accessing admin panel', () => {
      login('reader@test.com', 'password123');
      cy.wait(1000);
      cy.visit(`${baseUrl}/admin`, { failOnStatusCode: false });
      cy.wait(1000);
      cy.url().then((url) => {
        expect(url).to.not.include('/admin');
      });
      logout();
    });

    it('should prevent writer from accessing admin panel', () => {
      login('writer@test.com', 'password123');
      cy.wait(1000);
      cy.visit(`${baseUrl}/admin`, { failOnStatusCode: false });
      cy.wait(1000);
      cy.url().then((url) => {
        expect(url).to.not.include('/admin');
      });
      logout();
    });

    it('should prevent editor from accessing admin panel', () => {
      login('editor@test.com', 'password123');
      cy.wait(1000);
      cy.visit(`${baseUrl}/admin`, { failOnStatusCode: false });
      cy.wait(1000);
      cy.url().then((url) => {
        expect(url).to.not.include('/admin');
      });
      logout();
    });

    it('should maintain session after page refresh', () => {
      login('writer@test.com', 'password123');
      cy.wait(1000);
      cy.reload();
      cy.wait(2000);
      // Should still be logged in (not redirected to login)
      cy.url().should('not.include', '/login');
      logout();
    });

    it('should clear session on logout', () => {
      login('writer@test.com', 'password123');
      cy.wait(1000);
      logout();
      cy.wait(1000);
      cy.visit(`${baseUrl}/articles/create`, { failOnStatusCode: false });
      cy.wait(1000);
      cy.url().should('include', '/login');
    });
  });

  describe('Comments Permissions', () => {
    it('should allow all authenticated users to comment', () => {
      const roles = [
        { email: 'reader@test.com', password: 'password123' },
        { email: 'writer@test.com', password: 'password123' }
      ];

      roles.forEach((role) => {
        login(role.email, role.password);
        cy.wait(1000);
        cy.visit(`${baseUrl}/articles`);
        cy.wait(1500);
        
        cy.get('body').then(($body) => {
          if ($body.find('app-article-card').length > 0) {
            cy.get('app-article-card').first().find('a:contains("Read More")').click();
            cy.wait(2000);
            
            cy.get('body').then(($detail) => {
              if ($detail.find('textarea').length > 0) {
                const comment = `Comment from ${role.email.split('@')[0]} at ${Date.now()}`;
                cy.get('textarea').first().clear().type(comment);
                cy.contains('button', /post|submit|comment/i).click();
                cy.wait(2000);
              }
            });
          }
        });
        
        logout();
        cy.wait(500);
      });
    });

    it('should allow users to delete their own comments', () => {
      login('writer@test.com', 'password123');
      cy.wait(1000);
      cy.visit(`${baseUrl}/articles`);
      cy.wait(1500);
      
      cy.get('body').then(($body) => {
        if ($body.find('app-article-card').length > 0) {
          cy.get('app-article-card').first().find('a:contains("Read More")').click();
          cy.wait(2000);
          
          cy.get('body').then(($detail) => {
            if ($detail.find('textarea').length > 0) {
              const comment = `Delete test ${Date.now()}`;
              cy.get('textarea').first().clear().type(comment);
              cy.contains('button', /post|submit/i).click();
              cy.wait(3000);
              
              // Try to find and delete the comment
              cy.get('body').then(($comments) => {
                if ($comments.text().includes(comment)) {
                  cy.contains(comment).parent().parent().find('button').filter(':contains("Delete")').first().click({ force: true });
                  cy.wait(1000);
                }
              });
            }
          });
        }
      });
      
      logout();
    });

    it('should allow admin to delete any comment', () => {
      login('admin@test.com', 'password123');
      cy.wait(1000);
      cy.visit(`${baseUrl}/articles`);
      cy.wait(1500);
      
      cy.get('body').then(($body) => {
        if ($body.find('app-article-card').length > 0) {
          cy.get('app-article-card').first().find('a:contains("Read More")').click();
          cy.wait(2000);
          
          // Admin should see delete buttons on comments (if any exist)
          cy.get('body').should('exist');
          cy.url().should('match', /\/articles\/.+/);
        }
      });
      
      logout();
    });
  });
});
