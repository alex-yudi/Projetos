const database = require('../database/database');
const { searchIndexAccountByNumber, writeInFiles } = require('./accounts');
const { format } = require('date-fns');
const accounts = database.contas;
const withdrawals = database.saques;
const deposits = database.depositos;
const transfers = database.transferencias;

const generateDate = () => {
    return format(new Date(), "yyyy-MM-dd kk:mm:ss");
}


const depositValue = async (req, res) => {
    const { numero_conta, valor } = req.body;
    const indexAccount = await searchIndexAccountByNumber(Number(numero_conta));

    if (!numero_conta || !valor) {
        return res.status(400).json({ mensagem: "O número da conta e o valor são obrigatórios!" })
    }

    if (indexAccount === -1) {
        return res.status(400).json({ mensagem: "A conta informada não existe!" })
    }

    if (valor <= 0) {
        return res.status(400).json({ mensagem: "Valor negativos para depósito não são permitidos!" })
    }

    accounts[indexAccount].saldo += valor;

    deposits.push({
        data: generateDate(),
        numero_conta,
        valor
    })

    writeInFiles(deposits, 'src/database/deposits.js');
    writeInFiles(accounts, 'src/database/accountsInfo.js');

    return res.status(200).send()
}

const withdrawValue = async (req, res) => {
    const { numero_conta, valor, senha } = req.body;
    const indexAccount = await searchIndexAccountByNumber(Number(numero_conta));


    if (!numero_conta || !valor || !senha) {
        return res.status(400).json({ mensagem: "O número da conta, o valor e a senha são obrigatórios!" })
    }

    if (indexAccount === -1) {
        return res.status(400).json({ mensagem: "A conta informada não existe!" })
    }

    const userPassword = await accounts[indexAccount].usuario.senha;
    if (senha !== userPassword) {
        return res.status(400).json({ mensagem: "A senha informada está incorreta!" })
    }

    if (valor <= 0) {
        return res.status(400).json({ mensagem: "Valor negativos para saque não são permitidos!" })
    }

    if (valor > accounts[indexAccount].saldo) {
        return res.status(400).json({ mensagen: "Não há saldo suficiente para o saque!" })
    }

    accounts[indexAccount].saldo -= valor;

    withdrawals.push({
        data: generateDate(),
        numero_conta,
        valor
    })

    writeInFiles(withdrawals, 'src/database/withdrawals.js');
    writeInFiles(accounts, 'src/database/accountsInfo.js');



    return res.status(200).send();
}

const transferValue = async (req, res) => {
    const { numero_conta_origem, numero_conta_destino, valor, senha } = req.body;
    const indexAccountOrigin = await searchIndexAccountByNumber(numero_conta_origem);
    const indexAccountDestiny = await searchIndexAccountByNumber(numero_conta_destino);
    const userPassword = await accounts[indexAccountOrigin].usuario.senha;

    if (!numero_conta_origem ||
        !numero_conta_destino ||
        !valor ||
        !senha) {
        res.status(400).json({ mensagem: "É necessário informar a conta de origem e senha senha, o valor e a conta de destino para a transferência!" });
    }

    if (indexAccountOrigin === -1) {
        return res.status(400).json({ mensagem: "A conta de origem informada não existe!" });
    }

    if (indexAccountDestiny === -1) {
        return res.status(400).json({ mensagem: "A conta de destino informada não existe!" });
    }

    if (indexAccountOrigin === indexAccountDestiny) {
        return res.status(400).json({ mensagem: "Não é possível fazer uma transferência para a própria conta!" })
    }

    if (senha !== userPassword) {
        return res.status(400).json({ mensagem: "A senha informada está incorreta!" })
    }

    if (valor > accounts[indexAccountOrigin].saldo) {
        return res.status(400).json({ mensagem: "O saldo é insuficiente para realizar a transferência!" })
    }

    accounts[indexAccountOrigin].saldo -= valor;
    accounts[indexAccountDestiny].saldo += valor;

    transfers.push({
        data: generateDate(),
        numero_conta_origem,
        numero_conta_destino,
        valor
    })

    writeInFiles(transfers, 'src/database/transfers.js');
    writeInFiles(accounts, 'src/database/accountsInfo.js');


    return res.status(200).send()
}

const showBalance = async (req, res) => {
    const { numero_conta, senha } = req.query;
    const indexAccount = searchIndexAccountByNumber(numero_conta);

    if (!numero_conta || !senha) {
        return res.status(400).json({ mensagem: "É necessário informar o número da conta e a senha!" })
    }

    if (indexAccount === -1) {
        return res.status(400).json({ mensagem: "Conta bancária não encontrada!" });
    }

    const userPassword = await accounts[indexAccount].usuario.senha;
    if (senha !== userPassword) {
        return res.status(400).json({ mensagem: "A senha informada está incorreta!" })
    }

    const balance = accounts[indexAccount].saldo;
    return res.status(200).json({ saldo: balance });
}

const showStatement = async (req, res) => {
    const { numero_conta, senha } = req.query;
    const indexAccount = await searchIndexAccountByNumber(Number(numero_conta));

    if (!numero_conta || !senha) {
        return res.status(400).json({ mensagem: "É necessário informar o número da conta e a senha!" })
    }

    if (indexAccount === -1) {
        return res.status(400).json({ mensagem: "Conta bancária não encontrada!" });
    }

    const userPassword = await accounts[indexAccount].usuario.senha;
    if (senha !== userPassword) {
        return res.status(400).json({ mensagem: "A senha informada está incorreta!" })
    }

    const accountDeposits = deposits.filter((account) => {
        return account.numero_conta === numero_conta;
    });
    const accountWithdrawals = withdrawals.filter((account) => {
        return account.numero_conta === numero_conta;
    });
    const tranfersDone = transfers.filter((account) => {
        return account.numero_conta_origem === numero_conta;
    })
    const tranfersReceived = transfers.filter((account) => {
        return account.numero_conta_destino === numero_conta;
    })


    const statementFiltered = {
        depositos: [
            accountDeposits
        ],
        saques: [
            accountWithdrawals
        ],
        transferenciasEnviadas: [
            tranfersDone
        ],
        transferenciasRecebidas: [
            tranfersReceived
        ]

    }

    return res.json(statementFiltered)
}

module.exports = {
    depositValue,
    withdrawValue,
    transferValue,
    showBalance,
    showStatement
}