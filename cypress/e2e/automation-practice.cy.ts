/// <reference types="cypress" />
import 'cypress-iframe';

describe('Testes do Site de Prática de Automação', () => {
  beforeEach(() => {
    cy.visit('https://testautomationpractice.blogspot.com/');
  });

  it('deve verificar os elementos do formulário', () => {
    cy.get('#name').type('João Silva');
    cy.get('#email').type('joao@email.com');
    cy.get('#phone').type('11999999999');
    cy.get('#textarea').type('Endereço completo');
    cy.get('#male').check();
    cy.get('#sunday').check();
    cy.get('#country').select('Brazil');
    cy.get('#country').should('have.value', 'Argentina');
    cy.get('#colors').select('Red');
  });

  it('deve verificar a funcionalidade da tabela web', () => {
    cy.get('table[name="BookTable"]')
      .find('tr')
      .should('have.length.at.least', 2);
    
    cy.get('table[name="BookTable"]')
      .contains('td', 'Learn Selenium')
      .parent('tr')
      .within(() => {
        cy.get('td').eq(1).should('contain', 'Amit');
        cy.get('td').eq(2).should('contain', 'Selenium');
        cy.get('td').eq(3).should('contain', '300');
      });
  });

  it('deve validar alerta de confirmação cancelado', () => {
    cy.window().then((win) => {
      const stub = cy.stub(win, 'confirm').returns(false);
      cy.wrap(stub).as('windowConfirm');
    });

    cy.get('button[onclick="myFunctionConfirm()"]').click();
    cy.get('@windowConfirm').should('be.called');
  });
}); 