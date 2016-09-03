var sock = new SockJS(window.location.origin+'/board_socket?code='+window.location.pathname.replace("/board/",""));

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

window.onbeforeunload = function(){
	sock.onclose=function(){};
	sock.close();
};