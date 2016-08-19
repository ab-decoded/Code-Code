var sock = new SockJS('http://localhost:3000/socket_swag?code='+window.location.href.replace(baseUrl,""));
 sock.onopen = function() {
 	var url=window.location.href;
     var res={
     	"type":"connection",
     	"url":url
     };
     if(login===true){
 	 	res.userid=userid;
     	res.username=username;
     }
 	 else{
 	 	res.userid="0";
 	 	res.username="anonymous";
 	 }
     sock.send(JSON.stringify(res));
 };
