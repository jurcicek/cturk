$(function(){
    var C = {
    
        user: null,
        
        load: function(){
            Ajax.getUserInfo({
                success: function(o){
                    if (o.status == 1) {
                        if (o.data.User['isRequester'] == 1) {
                            C.user = o.data;
                            ActiveHITGroups.load();
                            InactiveHITGroups.load();
                            
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

var ActiveHITGroups = {

    order: '',// sorting order
    limit: 5,// items show in a page
    page: 1,// page number
    count: 0,// total items
    hitGroupPaginator: null,
    
    load: function(){
        var x = this;
        x.getHITs(false);
        x.bindEvent();
    },
    
    getHITs: function(isRefresh){
        var x = this;
        x.order = $("#groupSortType").val();
        x.initHITGroups();
        if (typeof isRefresh == "undefined" || isRefresh == false) {
            $("#hitGroupPaginatorText").html("");
            x.initPaginator();
        }
        Ajax.getActiveHitGroupList({
            data: {
                order: x.order,
                limit: x.limit,
                page: x.page
            },
            success: function(o){
                if (o.status == 1) {
                    if (o.data.info == 0) {
                        $("#hitGroupPaginatorText").html("0-0 of 0 Results");
                        x.hitGroupPaginator.setOptions({
                            size: 0,
                            currentPage: 0
                        });
                        var html = '';
                        html += '<div class="hitMessage hitWarning">There are no available HIT Groups at this moment.</div>';
                        $("#hitGroupList").html(html);
                    } else {
                        x.count = o.info;
                        x.refreshPagination();
                        x.showHITGroups(o.data);
                    }
                }
            }
        });
    },
    
    bindEvent: function(){
        var x = this;
        $("#groupSortButton").unbind("click").click(function(){
            x.page = 1;
            x.getHITs(false);
        });
    },
    
    initPaginator: function(){
        var x = this;
        x.hitGroupPaginator = new MFPagination({
            id: "hitGroupPaginator",
            size: 0,
            itemsPerPage: x.limit,
            numDisplayEntries: 5,
            currentPage: x.page - 1,
            numEdgeEntries: 0,
            onPageChange: function(pageIndex, jq){
                if (pageIndex != x.page - 1) {
                    console.log("MFPagination.onPageChange callback: pageIndex = " + pageIndex);
                    x.page = pageIndex + 1;
                    x.getHITs(true);
                }
            }
        });
    },
    
    refreshPagination: function(){
        var x = this;
        var start = x.limit * (x.page - 1) + 1;
        var end = (x.limit * x.page < x.count) ? x.limit * x.page : x.count;
        var count = x.count;
        if (count == 0) {
            start = 0;
        }
        var html = '';
        html += start + '-' + end + ' of ' + count + ' Results';
        $("#hitGroupPaginatorText").html(html);
        
        x.hitGroupPaginator.setOptions({
            size: count,
            currentPage: x.page - 1
        });
    },
    
    initHITGroups: function(){
        $("#hitGroupList").html('Loading data...');
    },
    
    expireHITGroup: function(groupId){
        $(".hitMessage").html("").hide();
        var x = this;
        Ajax.expireHITGroup({
            data: {
                groupId: groupId
            },
            success: function(o){
                if (o.status == 0) {
                    $("#hitErrorMessage").html(o.info).show();
                    
                } else {
                    $("#hitSuccessMessage").html(o.info).show();
                    x.getHITs(true);
                    if (typeof InactiveHITGroups != "undefined") {
                        InactiveHITGroups.getHITs(true);
                    }
                }
            }
        })
    },
    
    duplicateHITGroup: function(groupId){
        //$(".hitMessage").html("").hide();
        //var x = this;
        //Ajax.duplicateHITGroup({
        //    data: {
        //        groupId: groupId
        //    },
        //    success: function(o){
        //        if (o.status == 0) {
        //            $("#hitErrorMessage").html(o.info).show();
        //            
        //        } else {
        //            $("#hitSuccessMessage").html(o.info).show();
        //            x.getHITs(true);
        //        }
        //    }
        //});
        window.location.href = "duplicatehitgroup.html?groupId=" + groupId;
    },
    
    setMaxHits: function(groupId, maxHits){
        var x = this;
        var num = prompt("Please set maxHits:", maxHits);
        if (num != null && num != maxHits) {
            var reInt = /^\d+$/;
            if (!reInt.test(num)) {
                alert("Invalid number, please try again.");
                x.setMaxHits(groupId, maxHits);
            } else {
                Ajax.setMaxHits({
                    data: {
                        groupId: groupId,
                        maxHits: num
                    },
                    success: function(o){
                        alert(o.info);
                        if (o.status == 1) {
                            x.getHITs(true);
                        }
                    }
                });
            }
        }
    },
    
    showHITGroups: function(data, count){
        var html = '';
        var tip = {
            requester: 'Requester that submitted HITs in this group.',
            expireDate: 'The date when these HITs will expire,and will no longer be available.',
            reward: 'The amount of money you can earn for completing each HIT in this group.',
            assignmentTime: 'The amount of time you have to complete the HIT, from the moment you accept it.',
            numAvailableHit: 'The number of HITs in this group.',
            description: 'A general description of HITs in this group.'
        };
        if (data.length == 0) {
            html += '<div class="hitMessage hitWarning">There are no available HIT Groups at this moment.</div>';
        }
        for (var i = 0; i < data.length; i++) {
            var o = data[i];
            var previewHITUrl = 'hits.html?groupId=' + o.Group['id'];
            var previewAssignmentUrl = 'assignments.html?groupId=' + o.Group['id'];
            var fnExpire = "ActiveHITGroups.expireHITGroup('" + o.Group['id'] + "')";
            var fnDuplicate = "ActiveHITGroups.duplicateHITGroup('" + o.Group['id'] + "')";
            html += '<table width="100%" class="groupTable" cellpadding="0" cellspacing="0">';
            html += '  <tr class="tableHead">';
            html += '    <td width="50%"><a href="' + previewHITUrl + '" class="groupName">' + o.Group['name'] + '</a></td>';
            html += '    <td align="right">';
            html += '        <INPUT TYPE="BUTTON" VALUE="View HITs" ONCLICK="window.location.href=\''+previewHITUrl+'\'">';
            html += '        <INPUT TYPE="BUTTON" VALUE="View Assignments" ONCLICK="window.location.href=\''+previewAssignmentUrl+'\'">';
            html += '        <input type="button" class="fnButton" value="Expire" onclick="' + fnExpire + '" /> <input type="button" class="fnButton" value="Duplicate" onclick="' + fnDuplicate + '" /></td>';
            html += '  </tr>';
            html += '  <tr class="tableBody">';
            html += '    <td colspan="2">';
            //-- .groupDataTable start
            var requesterName = o.User['firstname'] + ' ' + o.User['surname'];
            var expireDate = Util.getDate(o.Group['expireDate']);
            var reward = o.Group['currencyCode'] + ' ' + Util.getPrice(o.Group['reward']);
            var timeAllotted = Util.getTime(o.Group['assignmentTime']);
            var hitsAmount = o.Group['maxHits'];
            var hitsAvailable = o.Group['numAvailableHit'];
            var hitsComplete = o.Group['numCompletedHit'];
            var maxHits = o.Group['maxHits'];
            var description = o.Group['description'];
            var userLink = "userinfo.html?userId=" + o.User['id'];
            html += '      <table width="100%" class="groupDataTable" cellpadding="0" cellspacing="0">';
            html += '        <tr>';
            html += '          <td width="33%"><span class="textTitle" title="' + tip['requester'] + '">Requester:</span> <a href="' + userLink + '">' + requesterName + '</a></td>';
            html += '          <td width="33%"><span class="textTitle" title="' + tip['expireDate'] + '">HIT Expiration Date: </span>' + expireDate + '</td>';
            html += '          <td><span class="textTitle" title="' + tip['reward'] + '">Reward: </span>' + reward + '</td>';
            html += '        </tr>';
            html += '        <tr>';
            //html += '          <td><span class="textTitle" title="' + tip['assignmentTime'] + '">Time Allotted: </span>' + timeAllotted + '</td>';
            html += '          <td><span class="textTitle">HITs Amount: </span>' + hitsAmount + '</td>';
            html += '          <td><span class="textTitle" title="' + tip['numAvailableHit'] + '">HITs Available: </span>' + hitsAvailable + '</td>';
            html += '          <td><span class="textTitle"">HITs Completed: </span>' + hitsComplete + '</td>';
            html += '        </tr>';
            
            html += '        <tr>';
            var groupId = o.Group['id'];
            html += '          <td colspan="3"><span class="textTitle">Max HITs: </span>' + maxHits + ' <input type="button" class="fnButton" value="Set maximum HITs per worker" onclick="ActiveHITGroups.setMaxHits(\'' + groupId + '\',\'' + maxHits + '\')" /></td>';
            html += '        </tr>';
            
            html += '        <tr>';
            html += '          <td colspan="3"><span class="textTitle" title="' + tip['description'] + '">Description: </span>' + description + '</td>';
            html += '        </tr>';
            html += '      </table>';
            //-- .groupDataTable end
            html += '    </td>';
            html += '  </tr>';
            html += '</table>';
        }
        $("#hitGroupList").html(html);
    }
    
};


var InactiveHITGroups = {

    order: '',// sorting order
    limit: 5,// items showns in a page
    page: 1,// page number
    count: 0,// total items
    hitGroupPaginator: null,
    
    load: function(){
        var x = this;
        x.getHITs(false);
        x.bindEvent();
    },
    
    getHITs: function(isRefresh){
        var x = this;
        x.order = $("#inactiveHITGroupSortType").val();
        x.initHITGroups();
        if (typeof isRefresh == "undefined" || isRefresh == false) {
            $("#inactiveHITGroupPaginatorText").html("");
            x.initPaginator();
        }
        Ajax.getInactiveHitGroupList({
            data: {
                order: x.order,
                limit: x.limit,
                page: x.page
            },
            success: function(o){
                if (o.status == 1) {
                    if (o.data.info == 0) {
                        $("#inactiveHITGroupPaginatorText").html("0-0 of 0 Results");
                        x.hitGroupPaginator.setOptions({
                            size: 0,
                            currentPage: 0
                        });
                        var html = '';
                        html += '<div class="hitMessage hitWarning">There are no available HIT Groups at this moment.</div>';
                        $("#inactiveHITGroupList").html(html);
                    } else {
                        x.count = o.info;
                        x.refreshPagination();
                        x.showHITGroups(o.data);
                    }
                }
            }
        });
    },
    
    bindEvent: function(){
        var x = this;
        $("#inactiveHITGroupSortButton").unbind("click").click(function(){
            x.page = 1;
            x.getHITs(false);
        });
    },
    
    initPaginator: function(){
        var x = this;
        x.hitGroupPaginator = new MFPagination({
            id: "inactiveHITGroupPaginator",
            size: 0,
            itemsPerPage: x.limit,
            numDisplayEntries: 5,
            currentPage: x.page - 1,
            numEdgeEntries: 0,
            onPageChange: function(pageIndex, jq){
                if (pageIndex != x.page - 1) {
                    console.log("MFPagination.onPageChange callback: pageIndex = " + pageIndex);
                    x.page = pageIndex + 1;
                    x.getHITs(true);
                }
            }
        });
    },
    
    refreshPagination: function(){
        var x = this;
        var start = x.limit * (x.page - 1) + 1;
        var end = (x.limit * x.page < x.count) ? x.limit * x.page : x.count;
        var count = x.count;
        if (count == 0) {
            start = 0;
        }
        var html = '';
        html += start + '-' + end + ' of ' + count + ' Results';
        $("#inactiveHITGroupPaginatorText").html(html);
        
        x.hitGroupPaginator.setOptions({
            size: count,
            currentPage: x.page - 1
        });
    },
    
    initHITGroups: function(){
        $("#inactiveHITGroupList").html('Loading data...');
    },
    
    duplicateHITGroup: function(groupId){
        //$(".hitMessage").html("").hide();
        //var x = this;
        //Ajax.duplicateHITGroup({
        //    data: {
        //        groupId: groupId
        //    },
        //    success: function(o){
        //        if (o.status == 0) {
        //            $("#hitErrorMessage").html(o.info).show();
        //            
        //        } else {
        //            $("#hitSuccessMessage").html(o.info).show();
        //            x.getHITs(true);
        //            if (typeof ActiveHITGroups != "undefined") {
        //                ActiveHITGroups.getHITs(true);
        //            }
        //        }
        //    }
        //});
        window.location.href = "duplicatehitgroup.html?groupId=" + groupId;
    },
    
    setMaxHits: function(groupId, maxHits){
        var x = this;
        var num = prompt("Please set maxHits:", maxHits);
        if (num != null && num != maxHits) {
            var reInt = /^\d+$/;
            if (!reInt.test(num)) {
                alert("Invalid number, please try again.");
                x.setMaxHits(groupId, maxHits);
            } else {
                Ajax.setMaxHits({
                    data: {
                        groupId: groupId,
                        maxHits: num
                    },
                    success: function(o){
                        alert(o.info);
                        if (o.status == 1) {
                            x.getHITs(true);
                        }
                    }
                });
            }
        }
    },
    
    showHITGroups: function(data, count){
        var html = '';
        var tip = {
            requester: 'Requester that submitted the HITs in this group.',
            expireDate: 'The date when these HITs will expire and will no longer be available.',
            reward: 'The amount of money you can earn for completing each HIT in this group.',
            assignmentTime: 'The amount of time you have to complete the HIT from the moment you accept it.',
            numAvailableHit: 'The number of HITs in this group.',
            description: 'A general description of HITs in this group.'
        };
        if (data.length == 0) {
            html += '<div class="hitMessage hitWarning">There are no available HIT Groups at this moment.</div>';
        }
        for (var i = 0; i < data.length; i++) {
            var o = data[i];
            var previewHITUrl = 'hits.html?groupId=' + o.Group['id'];
            var fnExpire = "";
            var fnDuplicate = "InactiveHITGroups.duplicateHITGroup('" + o.Group['id'] + "')";
            html += '<table width="100%" class="groupTable" cellpadding="0" cellspacing="0">';
            html += '  <tr class="tableHead">';
            html += '    <td width="50%"><a href="' + previewHITUrl + '" class="groupName">' + o.Group['name'] + '</a></td>';
            html += '    <td align="right">';
            html += '        <INPUT TYPE="BUTTON" VALUE="View HITs" ONCLICK="window.location.href=\''+previewHITUrl+'\'">';
            html += '        <input type="button" class="fnButton" value="Duplicate" onclick="' + fnDuplicate + '" /></td>';
            html += '  </tr>';
            html += '  <tr class="tableBody">';
            html += '    <td colspan="2">';
            //-- .groupDataTable start
            var requesterName = o.User['firstname'] + ' ' + o.User['surname'];
            var expireDate = Util.getDate(o.Group['expireDate']);
            var reward = o.Group['currencyCode'] + ' ' + Util.getPrice(o.Group['reward']);
            var timeAllotted = Util.getTime(o.Group['assignmentTime']);
            var hitsAvailable = o.Group['numAvailableHit'];
            var hitsComplete = o.Group['numCompletedHit'];
            var maxHits = o.Group['maxHits'];
            var description = o.Group['description'];
            var userLink = "userinfo.html?userId=" + o.User['id'];
            html += '      <table width="100%" class="groupDataTable" cellpadding="0" cellspacing="0">';
            html += '        <tr>';
            html += '          <td width="33%"><span class="textTitle" title="' + tip['requester'] + '">Requester:</span> <a href="' + userLink + '">' + requesterName + '</a></td>';
            html += '          <td width="33%"><span class="textTitle" title="' + tip['expireDate'] + '">HIT Expiration Date: </span>' + expireDate + '</td>';
            html += '          <td><span class="textTitle" title="' + tip['reward'] + '">Reward: </span>' + reward + '</td>';
            html += '        </tr>';
            html += '        <tr>';
            html += '          <td><span class="textTitle" title="' + tip['assignmentTime'] + '">Time Allotted: </span>' + timeAllotted + '</td>';
            html += '          <td><span class="textTitle" title="' + tip['numAvailableHit'] + '">HITs Available: </span>' + hitsAvailable + '</td>';
            html += '          <td><span class="textTitle"">HITs Completed: </span>' + hitsComplete + '</td>';
            html += '        </tr>';
            
            
            html += '        <tr>';
            var groupId = o.Group['id'];
            html += '          <td colspan="3"><span class="textTitle">Max HITs: </span>' + maxHits + ' <input type="button" class="fnButton" value="Set maximum HITs per worker" onclick="InactiveHITGroups.setMaxHits(\'' + groupId + '\',\'' + maxHits + '\')" /></td>';
            html += '        </tr>';
            
            html += '        <tr>';
            html += '          <td colspan="3"><span class="textTitle" title="' + tip['description'] + '">Description: </span>' + description + '</td>';
            html += '        </tr>';
            html += '      </table>';
            //-- .groupDataTable end
            html += '    </td>';
            html += '  </tr>';
            html += '</table>';
        }
        $("#inactiveHITGroupList").html(html);
    }
    
};

