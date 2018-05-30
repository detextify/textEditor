const express = require('express');
const path = require('path');

const app = express();

app.use(express.static('./assets'));

// app.get('/',(req,res) => {
//     res.sendFile(path.join(__dirname,'textEditor.html'))
// })

app.listen(3000, () => { console.log("Listening on port 3000") });