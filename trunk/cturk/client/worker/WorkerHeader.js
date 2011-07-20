var WorkerHeader = {
    write: function(menuItem){
        var html = '';
        html += '<div class="headerContent">';
        html += '    <img class="workerImage" src="images/worker50w.png"/>';
        html += '    <span class="b">Worker mode: </span> <span class="currentUser"></span> <span class="b">|</span> <a class="link logoutLink">Log out</a>';
        html += '</div>';
        html += '<ul class="headerNavigator">';
        html += '    <li class="menuItem myAccount">';
        html += '        <a href="index.html" class="menuItemAnchor">My Account</a>';
        html += '    </li>';
        html += '    <li class="menuItem submittedHITs">';
        html += '        <a href="submittedhits.html" class="menuItemAnchor">Submitted HITs</a>';
        html += '    </li>';
        html += '    <li class="menuItem acceptedHITs">';
        html += '        <a href="myhits.html" class="menuItemAnchor">Accepted HITs</a>';
        html += '    </li>';
        html += '    <li class="menuItem availableHITs">';
        html += '        <a href="findhits.html" class="menuItemAnchor">Available HITs</a>';
        html += '    </li>';
        html += '</ul>';
        document.write(html);
        
        if (typeof menuItem != "undefined") {
            $("#header .headerNavigator").find("." + menuItem).addClass("menuItemActive");
        }
        
        Ajax.getUserInfo({
            success: function(o){
                if (o.status == 1) {
                    var data = o.data.User;
                    
                    var html = '';
                    html += data['firstname'] + ' ' + data['surname'] + ' [' + data['username'] + ']';
                    $("#header .currentUser").html(html);
                }
            }
        });
        
        $("#header .logoutLink").unbind("click").click(function(){
            Ajax.logout({
                success: function(o){
                    if (o.status == 1) {
                        location.href = "../index.html";
                    }
                    
                }
            });
        });
    }
};
