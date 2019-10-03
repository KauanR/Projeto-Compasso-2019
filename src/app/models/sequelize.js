const Sequelize = require('sequelize')

const sequelize = new Sequelize(process.env.DBNAME, process.env.DBUSER, process.env.DBPASSWORD, {
  dialect: 'mysql',
  host: process.env.DBHOST,
  port: process.env.DBPORT,
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
  define: {
    paranoid: true,
    underscored: true,
    freezeTableName: true,
    timestamps: true
  },
  sync: { force: true }
})

sequelize.authenticate()
  .then(() => {
    console.log('Connection has been established successfully.')
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err)
  })

process.on("exit", () => {
  sequelize.close()
    .then(() => {
      console.log('Connection has been closed successfully.')
    })
    .catch(err => {
      console.error('Unable to close the connection to the database:', err)
    })
})

module.exports = sequelize