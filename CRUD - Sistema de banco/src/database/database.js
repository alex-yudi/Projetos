const bankInfo = require('./bankInfo');
const accountsInfo = require('./accountsInfo');
const withdrawals = require('./withdrawals');
const deposits = require('./deposits');
const transfers = require('./transfers');

module.exports = {
    banco: bankInfo,
    contas: accountsInfo,
    saques: withdrawals,
    depositos: deposits,
    transferencias: transfers
}
