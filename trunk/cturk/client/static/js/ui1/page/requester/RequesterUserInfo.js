$(function(){
    var C = {
    
        user: null,
        
        load: function(){
            Ajax.getUserInfo({
                success: function(o){
                    if (o.status == 1) {
                        if (o.data.User['isRequester'] == 1) {
                            C.user = o.data;
                            UserInfo.load();
                            UserSubmittedHit.load();
                            
                        } else {
                            alert("You are not requester. It will jump to worker page.");
                            window.location.href = "../worker/index.html";
                        }
                        
                    } else if (o.status == 0) {
                        alert("The login expired, please login again.");
                        location.href = "../index.html";
                    }
                }
            });
        }
    };
    
    C.load();
});

var UserInfo = {

    load: function(){
        if (LocationSearch.has("userId")) {
            var userId = LocationSearch.attr("userId");
            UserInfo.getUserInfo(userId);
            UserInfo.bindEvent();
            
        } else {
            alert("Missing userId parameter.");
        }
    },
    
    getUserInfo: function(userId){
        var x = this;
        $(".hitMessage").html("").hide();
        Ajax.getUserInfo({
            data: {
                userId: userId
            },
            success: function(o){
                if (o.status == 1) {
                    x.showUserInfo(o.data);
                    
                } else {
                    var html = 'Invalid userId.';
                    $("#hitErrorMessage").html(html).show();
                }
            }
        });
    },
    
    bindEvent: function(){
    
    },
    
    showUserInfo: function(data){
        $("#userInfo .view").each(function(){
            var key = $(this).attr("name");
            var html = data.User[key];
            if (key == "username") {
                html = '<a href="mailto:' + data.User[key] + '">' + data.User[key] + '</a>';
            }
            $(this).html(html);
        });
        var activeText = "Inactive";
        if (data.User['isActive'] == "1") {
            activeText = "Active";
        }
        $("#userInfo .isActive").html(activeText);
        
        var enableText = "Disable";
        if (data.User['isEnabled'] == "1") {
            enableText = "Enable";
        }
        $("#userInfo .isEnable").html(enableText);
        
        var isRequesterText = "false";
        if (data.User['isRequester'] == "1") {
            isRequesterText = "true";
        }
        $("#userInfo .isRequester").html(isRequesterText);
        
        $("#userInfo .acceptanceRatio").html(data.User['acceptanceRatio'] + '%');
        $("#userInfo .createDate").html(Util.getDate(data.User['createDate']));
    }
    
};

var UserSubmittedHit = {

    load: function(data){
        var x = this;
        if (LocationSearch.has("userId")) {
            var userId = LocationSearch.attr("userId");
            x.bindEvent(userId);
            
        }
    },
    
    bindEvent: function(userId){
        var str = "assignments.html?workerId=" + userId;
        $("#userHitLink").attr("href", str);
        $("#userHitLink").attr("onClick", "window.location='"+str+"\'");
    }
    
}
