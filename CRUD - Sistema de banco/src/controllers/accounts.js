const database = require('../database/database');
const accounts = database.contas;

const fs = require('fs/promises');

const writeInFiles = async (data, path) => {
    const dataStringify = JSON.stringify(data);
    const newDataToWrite = `module.exports = ${dataStringify}`;

    return await fs.writeFile(path, newDataToWrite);
}

const searchIndexAccountByCpf = (cpf) => {
    return accounts.findIndex((account) => {
        return account.usuario.cpf === cpf;
    })
}

const searchIndexAccountByNumber = (AccountNumber) => {
    return accounts.findIndex((account) => {
        return account.numero === Number(AccountNumber);
    })
}

const searchIndexEmail = (email) => {
    return accounts.findIndex((account) => {
        return account.usuario.email === email;
    })
}

const showListAccounts = (req, res) => {
    res.status(200).json(accounts);
}

const createAccount = async (req, res) => {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;
    const indexCpf = await searchIndexAccountByCpf(cpf);
    const emailChecked = await searchIndexEmail(email);

    if (indexCpf !== -1 || emailChecked !== -1) {
        return res.status(400).json({ mensagem: "Já existe uma conta com o cpf ou e-mail informado!" })
    }
    const acountCreated = {
        numero: database.banco.contadorConta,
        saldo: 0,
        usuario: {
            nome,
            cpf,
            data_nascimento,
            telefone,
            email,
            senha
        }
    }
    accounts.push(acountCreated);

    /*     const accountsStringfy = JSON.stringify(accounts);
        const newAccountsInfo = `module.exports = ${accountsStringfy}`;
    
        await fs.writeFile('src/database/accountsInfo.js', newAccountsInfo); */
    database.banco.contadorConta++;
    const bankInfo = database.banco;

    writeInFiles(bankInfo, 'src/database/bankInfo.js');

    writeInFiles(accounts, 'src/database/accountsInfo.js');




    return res.status(201).send();
}

const changeAccountData = async (req, res) => {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;
    const { numeroConta } = req.params;
    const emailChecked = await searchIndexEmail(email);
    const indexCpf = await searchIndexAccountByCpf(cpf);
    let indexAccount = await searchIndexAccountByNumber(numeroConta);


    if (indexAccount === -1) {
        return res.status(400).json({ mensagem: "A conta informada não existe" })
    }
    if (indexCpf !== -1) {
        return res.status(400).json({ mensagem: "O CPF informado já existe cadastrado!" })
    }
    if (emailChecked !== -1) {
        return res.status(400).json({ mensagem: "O e-mail informado já existe cadastrado!" })
    }

    accounts[indexAccount].usuario = {
        ...accounts[indexAccount].usuario,
        nome,
        cpf,
        data_nascimento,
        telefone,
        email,
        senha
    }

    writeInFiles(accounts, 'src/database/accountsInfo.js')

    return res.status(201).send();
}

const deleteAccount = async (req, res) => {
    const { numeroConta } = req.params;
    const indexAccount = await searchIndexAccountByNumber(numeroConta);
    const account = await accounts[indexAccount];

    if (!numeroConta) {
        return res.status(400).json({ mensagem: "É necessário informar um número de conta para a exclusão!" });
    }

    if (indexAccount === -1) {
        return res.status(400).json({ mensagem: "O número informado não pertende à nenhuma conta!" });
    }

    if (account.saldo !== 0) {
        return res.status(401).json({ mensagem: "A conta só pode ser removida se o saldo for zero!" });
    }

    accounts.splice(indexAccount, 1);

    writeInFiles(accounts, 'src/database/accountsInfo.js');

    return res.status(200).send();
}


module.exports = {
    searchIndexAccountByNumber,
    showListAccounts,
    createAccount,
    changeAccountData,
    deleteAccount,
    writeInFiles,
}