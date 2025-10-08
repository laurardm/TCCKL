const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const path = require('path');

// Rotas principais
const loginRoutes = require('./routes/loginRoutes');
const cadastroRoutes = require('./routes/cadastroRoutes');
const perfilfuncRoutes = require('./routes/perfilfuncRoutes');
const perfilrespRoutes = require('./routes/perfilrespRoutes');
const respRoutes = require('./routes/respRoutes');
const funcRoutes = require('./routes/funcRoutes');
const turmaRoutes = require('./routes/turmas'); // Roteador unificado de turmas
const agendaRoutes = require('./routes/agendaRoutes');
const esquecisenhaRoutes = require('./routes/esquecisenhaRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurações do EJS e pasta pública
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressLayouts);

// Sessão
app.use(session({
  secret: 'escolinha270380',
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false, maxAge: 1000 * 60 * 60 } // 1h
}));

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// Rotas
app.use('/', loginRoutes);
app.use('/cadastro', cadastroRoutes);
app.use('/func', funcRoutes);
app.use('/perfilf', perfilfuncRoutes);
app.use('/perfilr', perfilrespRoutes);
app.use('/resp', respRoutes);

// ✅ Rotas de Turmas (Ativas, Arquivadas, Fotos, Recados, Alunos)
app.use('/turmas', turmaRoutes);

app.use('/agenda', agendaRoutes);
app.use('/esqueci-senha', esquecisenhaRoutes);

// Middleware de erro global
app.use((err, req, res, next) => {
  console.error("Erro capturado no servidor:", err); // Mostra o erro completo no terminal
  res.status(500).send({
    message: "Ocorreu um erro no servidor!",
    error: err.message,
    stack: err.stack
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
