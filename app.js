const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session'); // 👈 Importa o módulo de sessão

// Importa as rotas
const loginRoutes = require('./routes/loginRoutes');
const alunoRoutes = require('./routes/alunoRoutes');
const cadastroRoutes = require('./routes/cadastroRoutes');
const funcRoutes = require('./routes/funcRoutes');
// const perfilRoutes = require('./routes/perfilRoutes');
const respRoutes = require('./routes/respRoutes');
const turmaRoutes = require('./routes/turmaRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Configurações do EJS
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));
app.use(expressLayouts);

// Configura sessão — ✅ Esta parte resolve o erro do req.session
app.use(session({
    secret: 'escolinha270380',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // true somente se usar HTTPS
        maxAge: 1000 * 60 * 60 * 1 // 1 hora de duração
    }
}));

// Middlewares adicionais
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// Define as rotas
app.use('/', loginRoutes);
app.use('/aluno', alunoRoutes);
app.use('/cadastro', cadastroRoutes);
app.use('/func', funcRoutes);
// app.use('/perfil', perfilRoutes);
app.use('/resp', respRoutes);
app.use('/turma', turmaRoutes);

// Inicia o servidor
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
