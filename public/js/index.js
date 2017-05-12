var socket = io.connect(window.location.origin+'/socket_swag?code='+window.location.pathname.replace("/",""));

socket.on('connect',function(){
	console.log("Working.");
	var url=window.location.href;
    var res={
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
	 socket.emit('connected',JSON.stringify(res));
});

window.onbeforeunload = function(){
	socket.on('disconnect',function(){});
	socket.disconnect();
};