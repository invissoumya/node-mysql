const express = require('express');
const  exphbs  = require("express-handlebars");
const bodyParser = require('body-parser');
const mysql = require('mysql');

const fileUpload = require('express-fileupload');

require('dotenv').config();

const app =express();
const port = process.env.PORT || 3000

//Parsing Middleware
//Parse Application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended : false}));

//Parse Application/json
app.use(bodyParser.json());

//name of the static folder
app.use(express.static('public'));  
app.use(express.static('upload'));

app.use(fileUpload());

//Templating Engine

app.engine('hbs', exphbs.engine( { extname : '.hbs'} ));
app.set('view engine','hbs');


//Connection Pool
const pool =mysql.createPool({
    connectionLimit : 10,
    host : 'localhost',
    user : 'root',
    password : '',
    database : 'user_profile',

});



app.get('/',(req,res) =>{
    
    pool.getConnection((err,connection) =>{
        if(err) throw err;
        connection.query("SELECT * from registration where id=1",(err,rows) =>{
            connection.release();
            if(!err)
            {
                res.render('index', { rows });
            }
        });
    });

});

app.post('/',(req,res) =>{
    let sampleFile;
    let uploadPath;
    if(!req.files || Object.keys(req.files).length === 0)
    {
        return res.status(400).send('No files were uploaded');
        
    }
    sampleFile = req.files.samplefile;
    uploadPath = __dirname + '/upload/' +sampleFile.name ;
    sampleFile.mv(uploadPath, function(err){
        if(err)
        {
            return res.status(500).send(err);
        }
        else
        {
            pool.getConnection((err,connection) =>{
                if(err) throw err;
                connection.query("update registration set profile_image= ? where id=1",[sampleFile.name],(err,rows) =>{
                    connection.release();
                    if(!err)
                    {
                        res.redirect('/');
                    }
                    else console.log(err);
                });
            });
        }       
    });
});

app.listen(port ,()=>console.log(`Listening to the port ${port} ......`));