var sock = new SockJS('http://localhost:3000/socket_swag');
 sock.onopen = function() {
     console.log('open');
 };