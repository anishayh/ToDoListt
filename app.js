//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");


const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"))

mongoose.connect('mongodb+srv://anishayh:test123@kiitcluster0.slxtigc.mongodb.net/todolistDB', { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("MONGO CONNECTION OPEN!!!")
    })
    .catch(err => {
        console.log("OH NO MONGO CONNECTION ERROR!!!!")
        console.log(err)
    })

const itemsSchema = {
    name: String
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
    name: "Welcome to your toDoList"
});
const item2 = new Item({
    name: "Hit the + buttom to add a new item"
});
const item3 = new Item({
    name: "<-- Hit this to delete an item"
});

const defaultsItems = [item1, item2, item3];

const listSchema = {
    name: String,
    items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);

app.get("/", function(req, res){

    Item.find({})
    .then(foundItems => {
        
        if(foundItems.length === 0) {
            Item.insertMany(defaultsItems)
            .then(() => {
            console.log("\Successfully saved default items to DB");
            })
            .catch(er => {
            console.log("Error");
            console.log(er);
            })
            res.redirect("/");
        }else{
            res.render("list", {listTitle: "Today", newListItems: foundItems});
        }
        
    });

});

app.get("/:customListName", function(req, res){
    const customListName = _.capitalize(req.params.customListName);
    

    List.findOne({name: customListName})
    .then(foundList => {
        if(!foundList){
            //Create a new List
            const list = new List({
                name: customListName,
                items: defaultsItems
            });
        
            list.save();
            res.redirect("/" + customListName);
        }else{
            //Show an existing list
            res.render("list", {listTitle: foundList.name, newListItems: foundList.items})
        }
    }); 

});



app.post("/", function(req, res){
    
    const itemName = req.body.newItem;
    const listName = req.body.list;

    const item = new Item({
        name: itemName
    });

    if (listName === "Today"){
        item.save();
        res.redirect("/");
    }else{
        List.findOne({name: listName})
        .then(foundList => {
            foundList.items.push(item); 
            foundList.save(); 
               
        })
        res.redirect("/" + listName);
        
    }

    item.save();

    res.redirect("/");
});

app.post("/delete", function(req, res){
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if(listName === "Today" ){
        Item.findByIdAndRemove(checkedItemId)
    .then(() => {
        console.log("Successfully Deleted");
    })
    .catch(er => {
        console.log(er);
    })
    res.redirect("/");

    } else {
        List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}})
        .then(foundList => {
            res.redirect("/" + listName);
        })
        .catch(er =>{
            console.log(er);
        })

    }

    
});



app.get("/about", function(req, res){
    res.render("about");
});



app.listen(3000, function(){
    console.log("Server started on port 3000");
});