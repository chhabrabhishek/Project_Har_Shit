const {app, BrowserWindow, ipcMain} = require('electron');
let Datastore = require('nedb');
let db = new Datastore({ filename: 'har_shit.db', autoload: true });

let win;
function createWindow () {
   win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
         nodeIntegration: true
      }
   })

   win.maximize()
   win.loadFile('index.htm')

   win.on('closed' , () => {
      win = null
   })
}

let newWindow;
ipcMain.on("btnclick", (event) => {
      newWindow = new BrowserWindow({ 
      width: 800, 
      height: 600, 
      show: false,
      webPreferences: {
         webSecurity: false,
         plugins: true,
         nodeIntegration: true
      } 
   });

   newWindow.loadFile('form.htm');
   newWindow.show();

   event.sender.send("btnclick-task-finished", "yes"); 
});

ipcMain.on("add_data", (event, args) => {
   transport_list = args[2].split(",");
   let data = {
      location: `${args[0]}`,
      marka: `${args[1]}`,
      transport: transport_list
   };

   db.findOne({marka: `${args[1]}`}, (err, doc) => {
      if(!doc){
         db.insert(data, (err, doc) => {
            if(err){
               console.log("MYERROR", err);
            }
         });
      }
      else{
         newWindow.close();
         throw new Error("Marka already exists.")
      }
   });
   event.sender.send("add_new-task-finished", "yes");
});

let html;
ipcMain.on("submitBtnClick", (event, args) => {

   let today = new Date();
   let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();

   newWindow = new BrowserWindow({ 
      width: 800, 
      height: 60, 
      show: false,
      webPreferences: {
         webSecurity: false,
         plugins: true,
         nodeIntegration: true
      } 
   });
   let receiptString = '';
   for(let i=0; i<dataObject.location.length; i++){
      receiptString += `<h3 style="padding-left: 250px">${date}</h3>`;
      receiptString += `<h1>${dataObject.location[i]}<span style="font-weight:50;"> के लिए</span></h1>`;
      receiptString += `<h1><pre>${dataObject.quantity[i]} नग <span style="font-weight:50;"><sub>(ELECTRIC GOODS)</sub></span></pre></h1>`;
      receiptString += `<h1><span style="font-weight:50;">Transport : </span>${dataObject.transport[i]}</h1>`;
      receiptString += `<h1><span style="font-weight:50;">Marka : </span>${dataObject.marka[i]}/${dataObject.quantity[i]}</h1>`;
   }

   dataObject = {};
   location = [];
   transport = [];
   marka = [];
   quantity = [];

   html = [
      "<body ondblclick='me()'>",
         `${receiptString}`,
      "</body>",
      "<script>",
      "function me() {",
      "if (confirm('Are you sure you want to print ?')) {",
      "window.print();}",
      "else{}}",
      "</script>"
   ].join("");+

   newWindow.maximize();
   // newWindow.webContents.openDevTools()
   newWindow.loadURL("data:text/html;charset=utf-8," + encodeURI(html));
   newWindow.show();

   event.sender.send("btn_submit-task-finished", "yes");
})

ipcMain.on("deleteBtnClick", (event) => {
   newWindow = new BrowserWindow({ 
      width: 800, 
      height: 600, 
      show: false,
      webPreferences: {
         webSecurity: false,
         plugins: true,
         nodeIntegration: true
      } 
   });

   newWindow.loadFile('delete.htm');
   newWindow.show();

   event.sender.send("btn_delete-task-finished", "yes");
})

ipcMain.on("delete_data", (event, args) => {
   db.findOne({marka: args}, (err, doc) => {
      if(!doc){
         newWindow.close();
         throw new Error("Marca doesn't exist!");
      }
   })
   db.remove({marka: args}, {}, (err, doc) => {
      if(err){
         console.log(err);
      }
   });

   event.sender.send("delete-task-finished", "yes");
});


ipcMain.on("updateBtnClick", (event) => {
   newWindow = new BrowserWindow({ 
      width: 800, 
      height: 600, 
      show: false,
      webPreferences: {
         webSecurity: false,
         plugins: true,
         nodeIntegration: true
      } 
   });

   newWindow.loadFile('update.htm');
   newWindow.show();

   event.sender.send("btn_update-task-finished", "yes");
})

ipcMain.on("update_data", (event, args) => {
   db.findOne({marka: args[1]}, (err, doc) => {
      if(!doc){
         newWindow.close();
         throw new Error("Marca doesn't exist!");
      }
   })
   transport_list = args[2].split(",");
   db.update({marka: args[1]}, {location: args[0], marka: args[1], transport: transport_list}, {}, (err, doc) => {
      if(err){
         console.log(err);
      }
   });
   
   event.sender.send("update-task-finished", "yes");
});

ipcMain.on("transportBtnClick", (event, args) => {
   db.findOne({marka: args}, (err, doc) => {
      if(doc){
         newWindow = new BrowserWindow({ 
            width: 800, 
            height: 600, 
            show: false,
            webPreferences: {
               webSecurity: false,
               plugins: true,
               nodeIntegration: true
            } 
         });
         let transport = "";
         for(let i=0; i<doc.transport.length; i++){
            transport += `<input type='checkbox' class='transCheck' name='transport${i+1}' value='${doc.transport[i]}'> ${doc.transport[i]}<br>`;
         }
         html = [
            "<body>",
               "<form>",
               `${transport}`,
               `<button id="submitTransport" onClick="me()">Submit!</button>`,
               "</form>",

            "</body>",
            "<script>",
            "function me() {",
            "var checkedValue = document.querySelector('.transCheck:checked');",
            "const ipcRenderer = require('electron').ipcRenderer;",
            "ipcRenderer.send('submitTransportClick', checkedValue.value);}",
            "</script>"
         ].join("");
         
         newWindow.loadURL("data:text/html;charset=utf-8," + encodeURI(html));
         newWindow.show();
      }
      else{
         throw new Error("Enter a valid marka");
      }
   });

   event.sender.send("transport-task-finished", "yes");
});

let trans;
ipcMain.on("submitTransportClick", (event, args) => {
   trans = args;
   newWindow.close();
   event.sender.send("submit_transport-task-finished", "yes");
});

let dataObject = {};
let location = [];
let quantity = [];
let transport = [];
let marka = [];
ipcMain.on("moreBtnClick", (event, args) => {
   db.findOne({marka: args[0]}, (err, doc) => {
      if(doc){
         if(marka.includes(args[0]))
            throw new Error("Marca already added!");
         else{
            if(args[1] && trans){
               location.push(doc.location.toUpperCase());
               quantity.push(args[1]);
               transport.push(trans.toUpperCase());
               trans = null;
               marka.push(doc.marka);
               dataObject['location'] = location;
               dataObject['quantity'] = quantity;
               dataObject['transport'] = transport;
               dataObject['marka'] = marka;
            }
            else
               throw new Error("Enter a valid quantity or check your transport!");
         }
      }
      else{
         throw new Error("Marka doesn't exist!");
      }
   })

   event.sender.send("more_transport-task-finished", "yes");
})


app.on('ready', createWindow)