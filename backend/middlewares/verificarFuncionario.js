function verificarFuncionario(req, res, next) {
  if (req.session?.usuario?.tipo === "funcionario") return next();
  return res.status(403).json("Acesso negado: apenas funcionários podem realizar esta ação.");
}

module.exports = verificarFuncionario;
