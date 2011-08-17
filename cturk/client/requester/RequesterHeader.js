var RequesterHeader = {
    write: function(menuItem){
        var html = '';
        html += '<div class="headerContent">';
        html += '    <span class="b">Requester mode:</span> <span class="currentUser"></span> <span class="b">|</span>';
        html += '    <a class="link logoutLink">Log out</a>';
        html += '</div>';
        html += '<ul class="headerNavigator">';
        html += '    <li class="menuItem myAccount">';
        html += '        <a href="index.html" class="menuItemAnchor">My Account</a>';
        html += '    </li>';
        html += '    <li class="menuItem WorkerList">';
        html += '        <a href="workerlist.html" class="menuItemAnchor">Workers</a>';
        html += '    </li>';
        html += '    <li class="menuItem HITGroups">';
        html += '        <a href="hitgroups.html" class="menuItemAnchor">HIT Groups</a>';
        html += '    </li>';
        html += '    <li class="menuItem HITs">';
        html += '        <a href="hits.html" class="menuItemAnchor">HITs</a>';
        html += '    </li>';
        html += '    <li class="menuItem Assignments">';
        html += '        <a href="assignments.html" class="menuItemAnchor">Assignments</a>';
        html += '    </li>';
        html += '    <li class="menuItem help">';
        html += '        <a href="help.html" class="menuItemAnchor">Help</a>';
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
