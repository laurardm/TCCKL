const express = require('express');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const expressLayouts = require('express-ejs-layouts');
const loginRoutes = require('./routes/loginRoutes');
const alunoRoutes = require('./routes/alunoRoutes');
const cadastroRoutes = require('./routes/cadastroRoutes');
const funcRoutes = require('./routes/funcRoutes');
const perfilRoutes = require('./routes/perfilRoutes');
const respRoutes = require('./routes/respRoutes');
const turmaRoutes = require('./routes/turmaRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');
app.use(expressLayouts);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.use('/', loginRoutes);
app.use('/aluno', alunoRoutes);
app.use('/cadastro', cadastroRoutes);
app.use('/func', funcRoutes);
app.use('/perfil', perfilRoutes);
app.use('/resp', respRoutes);
app.use('/turma', turmaRoutes);


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
