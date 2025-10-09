const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const path = require('path');

// Rotas principais
const login = require('./backend/login');
const cadastro = require('./backend/cadastro');
const perfilfunc = require('./backend/perfilfunc');
const perfilresp = require('./backend/perfilresp');
const resp = require('./backend/resp');
const func = require('./backend/func');
const turma = require('./backend/turmas'); 
const agenda = require('./backend/agenda');
const esquecisenha = require('./backend/esquecisenha');

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
  cookie: { secure: false, maxAge: 1000 * 60 * 60 } 
}));

// Middlewares
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));

// Rotas
app.use('/', login);
app.use('/cadastro', cadastro);
app.use('/func', func);
app.use('/perfilf', perfilfunc);
app.use('/perfilr', perfilresp);
app.use('/resp', resp);
app.use('/turmas', turma);
app.use('/agenda', agenda);
app.use('/esqueci-senha', esquecisenha);

// Middleware de erro global
app.use((err, req, res, next) => {
  console.error("Erro capturado no servidor:", err); 
  res.status(500).send({
    message: "Ocorreu um erro no servidor!",
    error: err.message,
    stack: err.stack
  });
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
