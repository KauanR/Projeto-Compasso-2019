# H4 Configuração inicial:
É necessário criar um arquivo .env na raíz do repositório com as informações do banco de dados e do port, exemplo de arquivo .env:
```
DBHOST="localhost"
DBUSER="root"
DBPASSWORD="adminadmin" 
DBNAME="my_db"
PORT=6663.
```
É necessário também rodar o comando nmp install.

# H4 Como usar a classe Controller:
Deve ser informado no nome singular da rota, o nome plural da rota, o nome da tabela do banco de dados e o schema de validação para validar os dados que vão ser registrados nessa tabela, o shcema de validação usado é um JSON que contém as validações do do express-validator, documentação: https://express-validator.github.io/docs/schema-validation.html, para validar atributos que são NOT NULL deve ser colocado no schema de validação um atributo com o nome de "notNull" com o valor "true", exemplo:
```javascript
{
    notNull: true
}
```
Cada mensagem de erro deve ter a informação apropriado sobre o erro. Eu recomendo criar uma nova classe dentro da pasta "controllers" que tem o nome da tabela seguido pela palavra controller, em cammel case, e que herde da classe mãe Controller, como eu fiz no caso do PartyController:
```javascript
const Controller = require("./Controller")

module.exports = class PartyController extends Controller {
    constructor() {
        super("party", "parties", "party", {
            name: {
                isString: true,
                isLength: {
                    options: {
                        min: 1,
                        max: 255
                    }
                },
                notNull: true,
                escape: true,
                errorMessage: "O valor deve ser uma string e deve ter entre 1 e 255 caractéres."
            },
            type: {
                isString: true,
                isLength: {
                    options: {
                        min: 1,
                        max: 100
                    }
                },
                notNull: true,
                escape: true,
                errorMessage: "O valor deve ser uma string e deve ter entre 1 e 100 caractéres."
            },
            last_assessment: {
                isISO8601: true,
                notNull: true,
                errorMessage: "O valor deve ser uma data no formato ISO8601."
            },
            observations: {
                isString: true,
                notNull: true,
                escape: true,
                errorMessage: "O valor deve ser uma string."
            }
        })
    }
}
```
Para que as rotas criadas nesse controller possam ser acessadas é necessário ir até o arquivo config/custom-express.js, instanciar um novo objeto da classe desse controller e chamar a função app.use() mandando como parâmetro o atributo "router" do objeto instanciado. Exemplo:
```javascript
const PartyController = require("../app/controllers/PartyController")
const partyController = new PartyController()
app.use(partyController.router)
```

