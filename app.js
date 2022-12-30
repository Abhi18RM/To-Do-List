const express = require('express');
const bodyParser = require('body-parser');
const ejs = require("ejs");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

//mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser: true});
mongoose.connect("mongodb+srv://abhiram-admin:abhiram@cluster0.jjf4d83.mongodb.net/todolistDB",{useNewUrlParser: true});

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item = mongoose.model("Item",itemsSchema);

const def1 = new Item({
  name: "Buy Food"
});

const def2 = new Item({
  name: "Cook Food"
});

const def3 = new Item({
  name: "Eat Food"
});

const defItems= [def1,def2,def3];

const listSchema = new mongoose.Schema({
   name: String,
   items: [itemsSchema]
});

const List = mongoose.model("List",listSchema);

app.get("/", function(req, res) {


  Item.find({}, function(err,foundItems){
    if (foundItems.length === 0) {
      Item.insertMany(defItems, function(err){
        if (err){
          console.log(err);
        } else{
          console.log("Successfully added the default items to the todoList");
        }
      });
      res.redirect("/");
    }
    else{
    res.render('list', {listHead: "Today",newListItem: foundItems}); }
  });

});

app.post("/", function(req, res) {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName==="Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
  }

  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }

});

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;
  console.log(listName);

  if (listName==="Today"){
    Item.deleteOne({_id: checkedItemId},function(err){
      if (!err){
        console.log(req.body);
        console.log("Deleted Successfully");
      }
    });
    res.redirect("/");
  }
  else{
    List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}},function(err,result){
      if (!err){
        console.log("Deleted Successfully");
      }
    });
    res.redirect("/"+listName);
  }

});

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({name: customListName},function(err,foundList){
    if (!err){
      if (!foundList){
        console.log("Doesnt exist");
        const list = new List({
          name: customListName,
          items: defItems
        });

        list.save();
        res.redirect("/"+customListName);
      }
      else{
      res.render("list",{listHead:foundList.name, newListItem: foundList.items})
    }
  }
  });
});


app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server running on port 3000");
})
