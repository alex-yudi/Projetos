const database = require('../database/database');
const passwordAcessSystem = database.banco.senha;

const authenticatorAcessAcounts = async (req, res, next) => {
    const { senha_banco } = await req.query;

    if (senha_banco !== passwordAcessSystem) {
        return res.status(401).json({ mensagem: "A senha do banco informada é inválida!" })
    }

    return next();
}

const bodyAuthenticator = async (req, res, next) => {
    const { nome, cpf, data_nascimento, telefone, email, senha } = req.body;

    if (!nome) {
        return res.status(400).json({ mensagem: "É necessário informar o nome do(a) proprietário da conta!" })
    };
    if (!cpf) {
        return res.status(400).json({ mensagem: "É necessário informar o cpf do(a) proprietário da conta!" })
    };
    if (!data_nascimento) {
        return res.status(400).json({ mensagem: "É necessário informar a data de nascimento do(a) proprietário da conta!" })
    };
    if (!telefone) {
        return res.status(400).json({ mensagem: "É necessário informar o telefone do(a) proprietário da conta!" })
    };
    if (!email) {
        return res.status(400).json({ mensagem: "É necessário informar e-mail do(a) proprietário da conta!" })
    };
    if (!senha) {
        return res.status(400).json({ mensagem: "É necessário informar uma senha para poder acessar a conta novamente!" })
    };

    next();
}

module.exports = {
    authenticatorAcessAcounts,
    bodyAuthenticator,
}