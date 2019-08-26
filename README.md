# Configuração inicial:
É necessário criar um arquivo .env na raíz do repositório com as informações do banco de dados e do port, exemplo de arquivo .env:
```
DBHOST="localhost"
DBUSER="root"
DBPASSWORD="adminadmin" 
DBNAME="my_db"
PORT=6663
```
É necessário também rodar o comando "npm install".

# Como usar a classe Controller:
Deve ser informado o nome singular da rota, o nome plural da rota, o nome da tabela do banco de dados e o schema de validação para validar os dados que vão ser registrados nessa tabela, o schema de validação usado é um JSON que contém as validações do do express-validator, documentação: https://express-validator.github.io/docs/schema-validation.html. Para validar atributos que são NOT NULL deve ser colocado no schema de validação um atributo com o nome de "notNull" com o valor "true", exemplo:
```javascript
{
    notNull: true
}
```
Cada mensagem de erro deve ter a informação apropriado sobre o erro. Eu recomendo criar uma nova classe dentro da pasta "controllers" que tenha o nome da tabela seguido pela palavra controller, em cammel case, e que herde da classe mãe Controller, como eu fiz no caso do PartyController:
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
                errorMessage: "O valor deve ser uma string."
            }
        })
    }
}
```
A validação foi feita com base no código em SQL para a tabela:
``` SQL
CREATE TABLE IF NOT EXISTS `mydb`.`PARTY` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(255) NOT NULL,
  `type` VARCHAR(100) NOT NULL,
  `last_assessment` DATE NULL,
  `observations` TEXT NULL,
  PRIMARY KEY (`id`))
ENGINE = InnoDB;
```
Não é necessário definir uma validação para o atributo "id", pois ela já acontece na classe Controller.

Para que as rotas criadas nesse controller possam ser acessadas é necessário ir até o arquivo config/custom-express.js, instanciar um novo objeto da classe desse controller e chamar a função app.use() mandando como parâmetro o atributo "router" do objeto instanciado. Exemplo:
```javascript
const PartyController = require("../app/controllers/PartyController")
const partyController = new PartyController()
app.use(partyController.router)
```
Novas rotas vão ser criadas usando os nomes em plural e singular da classe. Exemplos:
```
-> "GET /parties?id[eq]=1": Pega dados com base na query;
-> "DELETE /parties?id[eq]=1": Apaga dados com base na query;
-> "POST /parties?id[eq]=1": Atualiza dados com base na query e no JSON enviado;
-> "POST /parties/party": Adiciona uma linha para a tabela do banco com base no JSON enviado.
```
# Query em JSON:
A query precisa informar um atributo válido da tabela do banco de dados, a operção (pegar, apagar ou atualizar) vai ser executada nas linhas que tiverem atributos que sejam iguais aos atributos da query, por exemplo a query:
```Javascript
{
    nome: {
        eq:"igor"
    }
}
``` 
executa a operação em todas as linhas que tiverem o atributo "nome" igual ao valor "igor". A estrutura da query em JSON é basicamente:
```Javascript
{

    limit: {
        count: /*<int maior ou igual a 0>*/,
        offset: /*<int maior ou igual a 0>*/
    },

    sort: {
        by: /*<atributo válido>*/,
        order: /*<"asc" ou "desc">*/
    },

    /*<atributo válido>*/: {
        /*<"$eq", "$dif", "$ls", "$lse", "$gr" ou "$gre">*/: /*<valor válido para o atributo>*/,
        $in: /*<array de valores válidos para o atributo>*/
    },

}
```
A conversão de JSON para SQL acontece na classe DAO no método "gerarQuery". A opção "limit" define quantas linhas vão ser buscadas e a opção "sort" define o ordenamento das linhas buscadas, essas opções não podem ser usadas na operação "update" por causa de limitações do mysql.
