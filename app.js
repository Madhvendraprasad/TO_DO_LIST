//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
// const date = require(__dirname + "/date.js");
const mongoose =require("mongoose");
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/Tododb",{useNewUrlParser:true});

const itemsSchema = new mongoose.Schema({
  name: String
});

const Item= mongoose.model("Item",itemsSchema);

const item1= new Item({
  name:"waking"
});
const item2=new Item({
  name:"Sleeping"
});
const item3=new Item({
  name:"RUnning"
});
const defaultItems= [item1,item2,item3];

const listSchema={
  name:String,
  items:[itemsSchema]
};
const List=mongoose.model("List",listSchema);

app.get("/", function(req, res) {

 Item.find({},function(err,founditem){
   if(err){
     console.log(err);
   }
   else{

     if(founditem.length===0){
       Item.insertMany(defaultItems,function(err){
         if(err){
           console.log(err);
         }
         else{
           console.log("Successfully saved default items in db ");
         }
       });
          res.render("/");
     }
     else{
        res.render("list", {listTitle: "Today", newListItems:founditem });
     }


   }
 })



});

app.post("/", function(req, res){
  const listName=req.body.list;
  const itemName = req.body.newItem;
  const item=new Item({
    name:itemName
  });
  if(listName==="Today"){
    item.save();
   res.redirect("/");
  }
  else{
    List.findOne({name:listName},function(err,foundList){
      if(!err){
        foundList.items.push(item);
        foundList.save();
        res.redirect("/",listName);
      }
      else{
        console.log(err);
      }

    })
  }

});

app.post("/delete",function(req,res){
  const checkedid=req.body.checkbox;
  Item.findByIdAndRemove(checkedid,function(err){
    if(err){
      console.log(err);
    }
    else{
      console.log("Successfully deleted checked item")
    }
  })

});
// app.get("/work", function(req,res){

// });

app.get("/:place", function(req, res){
  const t=req.params.place;
 List.findOne({name:t},function(err,foundList){
   if(!err){
     if(!foundList){
       // console.log("Doesn't exist");
       const list= new List({
         name:t,
         items:[defaultItems]
       });
       list.save();
      res.redirect("/"+ t);
     }
     else{
       // console.log("Exist!");
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
     }
   }
 })



});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
