//Unified Source for connecting to the database packaged as a module that can be imported and called by each route 
exports.databaseSetup = function ()  {
    
    const mysql = require('mysql2');

    //Database Connection
    const connection = mysql.createConnection({
    host: process.env.HOST,
    port: 25060,
    user: process.env.USERNAME,
    password: process.env.PASSWORD,
    database:  'defaultdb'
    });

    return connection;
};
    
    



