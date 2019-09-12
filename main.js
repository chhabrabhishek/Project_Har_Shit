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

  ipcMain.on("add_data", (event, args) => {
      let data = {
         location: `${args[0]}`,
         marka: `${args[1]}`,
         transport: `${args[2]}`
      };

      db.insert(data, (err, doc) => {
         if(err){
            console.log(err);
         }
      });
      newWindow.close();
      event.sender.send("add_new-task-finished", "yes");
  });
});

let html;
ipcMain.on("submitBtnClick", (event, args) => {

   let today = new Date();
   let date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();

   db.findOne({ marka: `${args[0]}` }, (err, doc) => {
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

      if(err){
         html = [
            "<body>",
               `<h1>${err}</h1>`,
            "</body>",
         ].join("");
      }
      else{
         html = [
            "<body>",
              `<h3 align="right">${date}</h3>`,
              `<h1><pre>${doc.location} के लिए</pre></h1>`,
              `<h1><pre>${args[1]} नग <sub>(ELECTRIC GOODS)</sub></pre></h1>`,
              `<h1>Transport : ${doc.transport}</h1>`,
              `<h1>Marka : ${doc.marka }</h1>`,
              `<button onClick="this.style.display = 'none'; me()">Print</button>`,
            "</body>",
            "<script>",
            "function me() {",
            "window.print(); }",
            "</script>"
         ].join("");
      }

      newWindow.maximize();
      newWindow.loadURL("data:text/html;charset=utf-8," + encodeURI(html));
      newWindow.show();
   });

   event.sender.send("btn_submit-task-finished", "yes");
})

app.on('ready', createWindow)