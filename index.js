const fs = require('fs');
const express = require('express');
const app = express();
const port = 8080;
const path = require('path');
const bodyParser = require('body-parser');
const SerialPort = require('serialport')
const Readline = require('@serialport/parser-readline')
const Port = new SerialPort('/dev/ttyACM0')

const parser = Port.pipe(new Readline({
  delimiter: '\r\n'
}))

parser.on('data', (data) => {
  try {
    JSON.parse(data);
    fs.writeFile('./data.txt', '\n' + JSON.stringify(data), {
      encoding: 'utf8',
      flag: 'a'
    })
  } catch (err) {
    console.log('JSON invalid')
  }
});

app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(express.json());


app.get('/', (req, res) => {
  res.sendFile(path.join(`${__dirname}/index.html`))
});

app.get('/getdata', (req, res) => {
  fs.readFile('./data.txt', 'utf8', (err, data) => {
    data = data.split("\n");
    for (let index = 0; index < data.length; index++) {
      data[index] = JSON.parse(data[index])
    }
    res.send(JSON.stringify(data));
  });
});

app.post('/writedata', (req, res) => {
  const body = req.body;
  fs.writeFile('./data.txt', '\n' + JSON.stringify(body), {
    encoding: 'utf8',
    flag: 'a'
  }, (err) => {
    if (err) {
      res.status(500).send(err);
    } else {
      res.status(200).send('success');
    }
  });
})

app.listen(port, () => console.log('listening on port ' + port));