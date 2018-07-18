const http = require('http');

var server_port = process.env.OPENSHIFT_NODEJS_PORT ||  process.env.OPENSHIFT_INTERNAL_PORT || process.env.PORT || 8080
var server_ip_address = process.env.OPENSHIFT_NODEJS_IP || process.env.OPENSHIFT_INTERNAL_IP || '127.0.0.1'

console.log('Hello from root!');

const server = http.createServer((req, res) => {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/plain');
  res.end('Hello World from Root\n');
});
server.listen(server_port, server_ip_address, () => {
  console.log(`Server running at http://${server_ip_address}:${server_port}/`);
});