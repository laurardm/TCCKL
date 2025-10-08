const express = require("express");
const router = express.Router();

const turmasAtivas = require("./turmasAtivas");
const turmasArquivadas = require("./turmasArquivadas");
const fotosTurma = require("./fotosTurma");
const recadosTurma = require("./recadosTurma");
const alunos = require("./alunos");

router.use("/", turmasAtivas);
router.use("/arquivadas", turmasArquivadas);
router.use("/", fotosTurma);
router.use("/", recadosTurma);
router.use("/", alunos);

module.exports = router;
