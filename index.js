const express = require('express');
const server = express();
const cors = require("cors");
const constjwt = require('jsonwebtoken');
server.use(cors());

const secretKey = "testandojwtaplicacao";

server.use(express.urlencoded({extended: false}));
server.use(express.json());

//Midleweather
function valid(req, res, next) {
    //Passa no cabeçalho o token
    const authToken = req.headers['authorization'];

    //Verifica se o token esta indefinida//
    if(authToken != undefined) {

        //Quebra de linha do token separando ele//
        const bearer = authToken.split(' ');

        //recupera a parte que precisamos do token
        var token = bearer[1];

        //Fazemos o chamado do jwt para verificar nosso token junto com a chave que usamos para criar o token//
        constjwt.verify(token, secretKey, (err, data) => {
            
            //Se houver algum erro no token ele ira cair aqui e nos retornara o erro 401
            if(err) {
                res.status(401);
                res.json({error: "Token inválido"});

            //Se tudo correr bem ele ira liberar nossa requisição//    
            }else{
                req.token = token;
                req.loggedUser = {id: data.id, email: data.email}
                next();
            }
        })
    //Se estiver vazio ou indefinido retorno erro 401
    }else{
        res.status(401);
        res.json({error: "Inválido"});
    }
    next();
}

var DB = {
    games: [
        {
            id: 1,
            title: 'Call of Duty MW',
            year: 2010,
            price: 60
        },
        {
            id: 2,
            title: 'GTA 5',
            year: 2013,
            price: 100
        },
        {
            id: 3,
            title: 'Tomb Raider',
            year: 2015,
            price: 40
        },
        {
            id: 4,
            title: 'Resident Evil Village',
            year: 2021,
            price: 299
        }
    ],

    users: [
        {
            id: 1,
            name: 'Phelype Rodrigo',
            email: 'phelype@email.com',
            password: '123456789'
        },
        {
            id: 2,
            name: 'Marcelo Augusto',
            email: 'marcelo@email.com',
            password: '123456789'
        }

    ]
}

/////Rota para Games
///junto da rota passamos nossa middleware, para que seja verificado se está tudo certo com nosso token//
server.get('/games',valid, (req, res) => {
    
    res.statusCode = 200;
    res.json({user: req.loggedUser ,games: DB.games})
});

server.get('/games/:id',valid, (req, res) => {
    if(isNaN(req.params.id)){
        res.sendStatus(400);
    }else{
        var id = parseInt(req.params.id);
        var game = DB.games.find(g => g.id == id);

        if(game != undefined ){
            res.sendStatus = 200;
            res.json(game);
        }else{
            res.sendStatus(404);
        }
    }
});

server.post('/games',valid, (req, res) => {

    var { title, price, year } = req.body;

    if(title == null || price == null || year == null){
        res.sendStatus(400);
    }else{
        
        DB.games.push({
            id: 23,
            title,
            year,
            price
        });
        res.sendStatus(200);
    }
});


server.delete('/games/:id',valid, (req, res) => {
    if(isNaN(req.params.id)){
        res.sendStatus(400);
    }else{
        var id = parseInt(req.params.id);
        var index = DB.games.findIndex(g => g.id == id);

        if(index == -1){
            res.sendStatus(404);
        }else{
            DB.games.splice(index, 1);
            res.sendStatus(200);
        }
    }
});

server.put('/games/:id',valid, (req, res) =>{
    if(isNaN(req.params.id)){
        res.sendStatus(400);
    }else{
        var id = parseInt(req.params.id);
        var update = DB.games.find(g => g.id == id);
        if(update != undefined){
            var {title, price, year} = req.body;
            if(title != undefined){
                update.title = title;
            }
            if(price != undefined){
                update.price = price;
            }
            if(year != undefined){
                update.year = year;
            }
            res.sendStatus = 200;
        }else{
            res.sendStatus(404);
        }
    }
});
/////Fim das rotas games/////

server.post('/auth', (req, res) =>{
    //Pega os valores via body//
    var {email, password} = req.body;

    //Verifica se o e-mail está indefinido//
    if(email != undefined){

        //Faz a busca no Banco e verifica se o e-mail existe//
        users = DB.users.find(user => user.email === email);
        if(users != undefined){

            //Verifica se a senha e a mesma do banco//
            if(users.password == password){

                //Pega os valores de id e email passa para o JWT, junto com secret key e paramentros para validação e expiração do token//
                constjwt.sign({id: users.id, email: users,email}, secretKey, {expiresIn:'48h'},(err, token) => {
                    
                    //Se houver algum erro retorno staus 400
                    if(err){
                        res.status(400);
                        res.json({error: "Falha interna"});
                    
                    // Se tudo estiver correto retorno status 200 junto com Token//    
                    }else{
                        res.status(200);
                        res.json({token: token});
                    }
                });

            //Se a senha for diferente retorna erro 401
            }else{
                res.status(401);
                res.json({err: "Senha ou email inválidos"})
            }

        //Se o e-mail não existir retorno status 404 junto com mensagem via json//
        }else{
            res.status(404);
            res.json({err: "E-mail inválido"})
        }
    
    //Se email estiver indefinido passa status code 400 junto com uma resposta via json//
    }else{
        res.status(400);
        res.json({err: "E-mail não pode estar vazio"});
    }
})


server.listen(4000, () => {
    console.log('api iniciada')
});