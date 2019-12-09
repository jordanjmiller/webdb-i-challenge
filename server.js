const express = require('express');

const db = require('./data/dbConfig.js');

const server = express();

server.use(express.json());

// SELECT using Knex
// In Knex, the equivalent of SELECT * FROM users is:
// db.select('*').from('users');
server.get('/', (req, res) => {
    db('accounts')
    .then(accounts => {
        console.log(accounts);
        res.status(200).json(accounts);
    })
    .catch(err => {
        res.status(500).json({message: 'Error retrieving accounts'});
    })
});

// SELECT/WHERE using Knex
// Knex also allows for a where clause. In Knex, we could write SELECT * FROM users WHERE id=1 as
// db('users').where({ id: 1 });
// This method will resolve to an array containing a single entry like so: [{ id: 1, name: 'bill' }].
server.get('/:id', (req, res) => {
    const { id } = req.params; //destructure params as param(id): value(/2 /3 etc)

    db('accounts').where({id}) //where id: x
    .then(accounts => {
        console.log(accounts);
        if (accounts.length > 0){
            res.status(200).json(accounts);
        }
        else{
            res.status(404).json({message: `Account with id: ${id} not found `});
        }
    })
    .catch(err => {
        res.status(500).json({message: 'Error retrieving accounts'});
    })
});

// INSERT using Knex
// In Knex, the equivalent of INSERT INTO users (name, age) VALUES ('Eva', 32) is:
// db('users').insert({ name: 'Eva', age: 32 });
//The insert method in Knex will resolve to an array containing the newly created id for that user like so: [3].
server.post('/add', (req, res) => {
    if (req.body){
        if (!req.body.name){
            res.status(400).json({message: 'You must add a name to the account.'});
        }
        else if (!req.body.budget){
            res.status(400).json({message: 'You must add a budget to the account.'});
        }
        else {
            db('accounts').insert({ name: req.body.name, budget: req.body.budget })
            .then(account => {
                console.log(account);
                db('accounts').where({ id: account[0] }) //where id: x
                .then(newAccount => {
                    console.log(newAccount);
                    if (newAccount.length > 0){
                        res.status(200).json({message: `Account with id: ${account[0]} created `, newAccount: newAccount[0]});
                    }
                    else{
                        res.status(404).json({message: `Account with id: ${account} not found `});
                    }
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({message: `Error retrieving new account: ${err}`});
                })
            })
            .catch(err => {
                console.log(err);
                res.status(500).json({message: `Error adding account: ${err}`});
            })
        }
    }
    else{
        res.status(400).json({message: 'You must send an account to add.'});
    }
});

// UPDATE using Knex
// In knex, the equivalent of UPDATE users SET name='Ava', age=33 WHERE id=3; is:
// db('users').where({ id: 3 })
// .update({name: 'Ava', age: 33 });
// Note that the where method comes before update, unlike in SQL.
// Update will resolve to a count of rows updated.
server.put('/:id', (req, res) => {
    const {id} = req.params;
    db('accounts').where({id: id}).update(req.body)
    .then(updated => {
        if(updated){
            db('accounts').where({id: id})
            .then(account => {
                res.status(200).json( {message: `Account with id: ${account[0].id} updated `, account});
            })
        }else{
            res.status(404).json({message: `Account with id: ${id} not found`});
        }
    })
    .catch(err => {
        console.log(err);
        res.status(500).json({message: `Error updating account: ${err}`});
    });
})


// DELETE using Knex
// In Knex, the equivalent of DELETE FROM users WHERE age=33; is:
// db('users').where({ age: 33}).del();
// Once again, the where must come before the del. This method will resolve to a count of records removed.
server.delete('/:id', (req, res) => {
    const {id} = req.params;
    db('accounts').where({id: id}).del()
    .then(deleted => {
        console.log(deleted);
        if(deleted){
            res.status(200).json({message: `Account with id: ${id} successfully deleted`});    
        }else{
            res.status(404).json({message: `Account with id: ${id} was not found in the database`});
        }
    })
    .catch(err => res.status(500).json({message: 'error deleting account'}));
})


module.exports = server;