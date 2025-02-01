import * as http from 'http';

const server = http.createServer((req, res) => {
  res.write('ok');
  res.end();
});

server.listen(3100);
