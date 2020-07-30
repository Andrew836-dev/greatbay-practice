const inquirer = require("inquirer");
const connection = require("./greatBayConnection");

// app starts user is prompted to post or bid
function start() {
    inquirer.prompt({
        type: "list",
        message: "What do you want to do?",
        choices: ["Post an item",
            "Bid on an item"],
        name: "userChoice"
    }).then(({ userChoice }) => {
        if (userChoice == "Post an item") post();
        else bid();
    });
}

function bid() {
    listItems();
    console.log("bidding");
}

function post() {
    console.log("Tell me about your item for sale");
    inquirer.prompt([{
        message: "Item description : ",
        name: "itemDescription"
    }, {
        message: "Minimum bid : ",
        name: "minimumBid"
    }
    ]).then(itemData => postItems(itemData));
}

function postItems(itemData) {
    connection.connect(function (err) {
        if (err) throw err;
        console.log("connected as id " + connection.threadId + "\n");
        connection.query("INSERT INTO items SET ?", itemData, function (err, response) {
            if (err) throw err;
            console.log(`Posted ${itemData.itemDescription} for minimum bid of $${itemData.minimumBid}`);
            connection.end();
            start();
        });
    });
}

// item description, minmimum price, current highest bid, id
// to post, ask questions about the item or task
// send that info to the database

// to bid, show a list of available items
// prompt to ask which item to bid on
// prompt to ask how much to bid
// compare bid to previous highest bid
// inform of success or failure
// replace highest bid if successful
// return to selection screen if failed.
function listItems() {
    connection.connect(function (err) {
        console.log("connected as id " + connection.threadId);
        connection.query("SELECT * FROM items", function (err, response) {
            if (err) throw err;
            for (let i =0; i < response.length; i++) {
                console.log(`${response[i].id} | ${response[i].itemDescription} - $${response[i].minimumBid}`);
            }
            connection.end();
            makeBid(response);
        });
    });
}

function makeBid(itemData) {
    inquirer.prompt({
        message:"Which item number do you want to bid on?",
        name: "answer"
    }).then(({ answer }) => {
        let [ chosen ] = itemData.filter(item => item.id == parseInt(answer));
        console.log(`${chosen.id} | ${chosen.itemDescription} - $${chosen.minimumBid}`);
        inquirer.prompt({
            message: "How much do you want to bid?",
            name: "bid"
        }).then(({ bid }) => {
            if (bid > chosen.minimumBid) {
                console.log("You have the highest bid!");
                updateBid(chosen, bid);
            }
            else {
                console.log("You don't have the highest bid!");
                start();
            }
        });
    });
}

function updateBid(itemData, newBid) {
    // update sql table to have a current bid ... or just keep updating the minimum bid
    // make an sql call to update the current high bid
    // connection.query("UPDATE items SET ? WHERE ?", [{minimumBid: newBid},{id: itemData.id}])
}

// optional extras, login screen
// see all items you have put up
// see all auctions you are in the lead
// design visually appealing tables
// search function for items, keyword or user name
start();