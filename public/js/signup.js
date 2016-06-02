$(document).ready(function(){
	$('.ui.checkbox').checkbox();
	$('.ui.form')
	  .form({
	    fields: {
	      username: {
	        identifier : 'username',
	        rules: [
	          {
	            type   : 'regExp[/^[a-zA-Z0-9_-]{6,12}$/]',
	            prompt : 'Username should be 6-12 in length, and count contain only letters, numbers, \'_\' and \'-\' '
	          }
	        ]
	      },
	      email:{
	        identifier:'email',
	        rules:[
	        {
	          type:'email',
	          prompt:'Please enter a valid email'
	        }
	        ]
	      },
	      name:{
	        identifier:'name',
	        rules:[
	        {
	          type:'empty',
	          prompt:'Please enter a valid email'
	        }
	        ]
	      },
	      password: {
	        identifier : 'password',
	        rules: [
	          {
	            type   : 'empty',
	            prompt : 'Please enter a password'
	          },
	          {
	            type   : 'minLength[6]',
	            prompt : 'Your password must be at least 6 characters'
	          }
	        ]
	      },
	      confirm:{
	      	identifier : 'confirm',
	      	rules: [
	      	{
	      		type   : 'match[password]',
	      		prompt : 'Please confirm your'
	      	}
	      	]
	      }

	    }
	  });
});