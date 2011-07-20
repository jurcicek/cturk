$(function(){
    var token = LocationSearch.attr("token");
    $(".getPassword input[type='submit']").unbind("click").click(function(){
        var password = $(".getPassword input[name='password']").val();
		
		
        if (password != "") {
            Ajax.resetPassword({
                data: {
                    password: password,
                    token: token
                },
                success: function(o){
                    console.log(o);
                    if (o.status == 0) {
                        $(".resetPasswordError").html(o.info);
                    } else if (o.status == 1) {
                        $(".resetPasswordError").html(o.info);
                        window.setTimeout(function(){
                            location.href = "index.html";
                        }, 3000);
                        
                    }
                }
            });
        }else{
			 $(".resetPasswordError").html("Password can't empty. ");
		}
    });
    
});
