//classe e metodos para chamar nas rotas
class KpiDao {

    constructor(mysql) {
        this._mysql = mysql;
    }

    //metodo para adicionar nova kpi
    adiciona(kpi) {

        return new Promise((resolve, reject) => {
         
            this._mysql.query(
                "INSERT INTO `mydb`.`KPIS`(name, description, details, category) values(?,?,?,?)",
                [
                    kpi.name,
                    kpi.description,
                    kpi.details,
                    kpi.category
                ],
                err => {
                    if(err) {
                        console.log(err);
                        return reject('Não foi possivel adicionar');
                    }
        
                    resolve();
                }
            )
        });
    }

    remove(id) {

        return new Promise((resolve, reject) => {

            this._mysql.query(
                "DELETE FROM `mydb`.`KPIS` WHERE ID = ?",
                [
                    id
                ],
                err => {
                    if(err) {
                        console.log(err);
                        return reject('Não foi possivel excluir');
                    }
        
                    return resolve();
                }
            )
        })

    };

    atualiza(kpi) { // METODO DANDO ERRADO

        return new Promise((resolve, reject) => {

            this._mysql.query(
                "UPDATE `mydb`.`KPIS` SET name = ?, description = ?, details = ?, category = ? WHERE id = ?",
                [
                    kpi.name,
                    kpi.description,
                    kpi.details,
                    kpi.category,
                    kpi.id
                ],
                err => {
                    if(err) {
                        console.log(err);
                        return reject('Não foi possivel atualizar');
                    }
        
                    resolve();
                }
            )
        })
    }


}

module.exports = KpiDao;