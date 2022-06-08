//imports the Express module
const express = require('express');
//import path module
const path = require('path');
// import node library for files
const fs = require('fs');
const { JSDOM } = require("jsdom");
//store the Express app object in an app variable.
const app = express();

//set up express port
const port = process.env.PORT || '3000';

//set path for view
app.set('views', path.join(__dirname , 'views'));

//setting up the template engine
app.set('view engine' , 'pug');

app.use(express.urlencoded({ extended: true})); // enabling url encoding

app.use(express.json());
var library_data;

fs.readFile('./data/library-data.kml', 'utf-8' ,(error , data) =>{
    const dom = new JSDOM(data , {contentType : "application/xml"});
    //load dom tree
    library_data = dom.window.document;
});
//setting up  path to public folder
app.use(express.static(path.join(__dirname, 'public')));
//page routing
app.get('/',(request , response) => {
    let library_data = listLibraries();
    response.render('index' , {title : 'Library Data' , libraries : library_data});
});

//function to list libraries
function listLibraries(){
    return library_data.querySelectorAll("Document>Placemark");

}
app.get("/library", (request, response) => {

    let id = request.query.id; //retrieve the placeholder from req.query
    let lib = getLibraryById(id); //retrieve the id in the URL
    //the page title as well.
    let name = lib.querySelector("name").textContent;

    //render the individual library page and pass the retrieved library to the template
    response.render("library", { title: name, library: lib});
});

// this function gets an id of the xml node and returns the matching node
function getLibraryById(id) {
    //return the <Placemark> matching the XPath query
    return library_data.evaluate("//Document/Placemark[@id='"+ id+ "']", library_data, "http://www.opengis.net/kml/2.2", 4, null).iterateNext();
}
//set up server listener
app.listen(port , () => {
    console.log(`Server is running on post ${port}`);
});
