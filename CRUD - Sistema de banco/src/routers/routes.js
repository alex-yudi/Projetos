const express = require('express');
const accounts = require('../controllers/accounts');
const transactions = require('../controllers/transactions');
const authenticator = require('../middlewares/authenticator');
const routes = express();


routes.get('/contas', authenticator.authenticatorAcessAcounts, accounts.showListAccounts);

routes.post('/contas', authenticator.bodyAuthenticator, accounts.createAccount);

routes.put('/contas/:numeroConta/usuario', authenticator.bodyAuthenticator, accounts.changeAccountData);

routes.delete('/contas/:numeroConta', accounts.deleteAccount);

routes.post('/transacoes/depositar', transactions.depositValue);

routes.post('/transacoes/sacar', transactions.withdrawValue);

routes.post('/transacoes/transferir', transactions.transferValue);

routes.get('/contas/saldo', transactions.showBalance);

routes.get('/contas/extrato', transactions.showStatement);

module.exports = routes;