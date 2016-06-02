$(document).ready(function(){
	$('.ui.checkbox').checkbox();
	$('.ui.form')
	  .form({
	    fields: {
	      email:{
	        identifier:'email',
	        rules:[
	        {
	          type:'email',
	          prompt:'Please enter a valid email'
	        }
	        ]
	      },
	      password: {
	        identifier : 'password',
	        rules: [
	          {
	            type   : 'minLength[6]',
	            prompt : 'Your password must be at least 6 characters'
	          }
	        ]
	      }
	    }
	  });
});