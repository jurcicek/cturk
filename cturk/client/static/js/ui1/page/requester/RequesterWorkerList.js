$(function(){
    var C = {
    
        user: null,
        
        load: function(){
            Ajax.getUserInfo({
                success: function(o){
                    if (o.status == 1) {
                        if (o.data.User['isRequester'] == 1) {
                            C.user = o.data;
                            WorkerList.load();
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

var WorkerList = {

    order: '',// sorting order
    limit: 10,// items show in a page
    page: 1,// number of pages
    count: 0,// total items
    paginator: null,
    
    load: function(){
        WorkerList.getWorkerList(false);
        WorkerList.bindEvent();
    },
    
    getWorkerList: function(isRefresh){
        var x = this;
        x.order = $("#groupSortType").val();
        x.initWorkerList();
        if (typeof isRefresh == "undefined" || isRefresh == false) {
            $("#workerListPaginatorText").html("");
            x.initPaginator();
        }
        Ajax.getWorkerList({
            data: {
                order: x.order,
                limit: x.limit,
                page: x.page
            },
            success: function(o){
                if (o.status == 1) {
                    if (o.data.info == 0) {
                        $("#workerListPaginator").html("0-0 of 0 Results");
                        x.paginator.setOptions({
                            size: 0,
                            currentPage: 0
                        });
                        var html = '';
                        html += '<div class="hitMessage hitWarning">No available Worker.</div>';
                        $("#workerList").html(html);
                    } else {
                        x.count = o.info;
                        x.refreshPagination();
                        x.showWorkerList(o.data);
                    }
                }
            }
        });
    },
    
    bindEvent: function(){
        var x = this;
        $("#groupSortButton").unbind("click").click(function(){
            x.page = 1;
            x.getWorkerList(false);
        });
        
        $("#sendMessageButton").unbind("click").click(function(){
            var checkedEl = $("#workerList input[name='userEmail']:checked");
            if (checkedEl.length == 0) {
                alert("No worker selected.");
                
            } else {
                var a = [];
                checkedEl.each(function(){
                    a.push($(this).val());
                });
                var str = a.join(",");
                window.location.href = 'mailto:' + str;
            }
        });
    },
    
    initPaginator: function(){
        var x = this;
        x.paginator = new MFPagination({
            id: "workerListPaginator",
            size: 0,
            itemsPerPage: x.limit,
            numDisplayEntries: 5,
            currentPage: x.page - 1,
            numEdgeEntries: 0,
            onPageChange: function(pageIndex, jq){
                if (pageIndex != x.page - 1) {
                    console.log("MFPagination.onPageChange callback: pageIndex = " + pageIndex);
                    x.page = pageIndex + 1;
                    x.getWorkerList(true);
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
        $("#workerListPaginatorText").html(html);
        
        x.paginator.setOptions({
            size: count,
            currentPage: x.page - 1
        });
    },
    
    initWorkerList: function(){
        $("#workerList").html('Loading data...');
    },
    
    enableRequester: function(userId, isRequester, username){
        $(".hitSuccessMessage").html("").hide();
        var x = this;
        var text = "Are you sure to set [" + username + "] as Requester?";
        if (confirm(text)) {
            Ajax.enableRequester({
                data: {
                    userId: userId,
                    isRequester: isRequester
                },
                success: function(o){
                    if (o.status == 0) {
                        alert(o.info);
                    } else {
                        var text = o.info + " [" + username + "] = Requester";
                        $("#hitSuccessMessage").html(text).show();
                        x.getWorkerList(true);
                    }
                }
            })
        }
    },
    
    enableWorker: function(userId, isEnabled, username){
        $(".hitMessage").html("").hide();
        var x = this;
        Ajax.enableWorker({
            data: {
                userId: userId,
                isEnabled: isEnabled
            },
            success: function(o){
                if (o.status == 0) {
                    alert(o.info);
                } else {
                    var enable = (isEnabled == "1") ? "Enable" : "Disable";
                    var text = o.info + " [" + username + "] Enable Status = " + enable;
                    $("#hitSuccessMessage").html(text).show();
                    x.getWorkerList(true);
                }
            }
        })
    },
    
    showWorkerList: function(data, count){
        var html = '';
        //var tip = {
        //    requester: 'The Requester that submitted the HITs in this group.',
        //    expireDate: 'The date these HITs will expire, and will no longer be available.',
        //    reward: 'The amount of money you can earn for completing each HIT in this group.',
        //    assignmentTime: 'The amount of time you have to complete the HIT, from the moment you accept it.',
        //    numAvailableHit: 'The number of HITs in this group.',
        //    description: 'A general description of HITs in this group.'
        //};
        if (data.length == 0) {
            html += '<div class="hitMessage hitWarning">No available Worker.</div>';
        }
        for (var i = 0; i < data.length; i++) {
            var o = data[i];
            //var previewHITUrl = 'previewhit.html?groupId=' + o.Group['id'];
            var username = o.User['username'];
            var userInfoLink = "userinfo.html?userId=" + o.User['id'];
            html += '<table width="100%" class="workerListTable" cellpadding="0" cellspacing="0">';
            html += '  <tr class="tableHead">';
            html += '    <td width="50%"><input type="checkbox" name="userEmail" value="' + username + '" style="margin-right:10px;" /><a href="' + userInfoLink + '">' + username + '</a></td>';
            var fnEnableRequester = "WorkerList.enableRequester('" + o.User['id'] + "', '1', '" + username + "')";
            var fnDisableWorker = "WorkerList.enableWorker('" + o.User['id'] + "', '0', '" + username + "')";
            var fnEnableWorker = "WorkerList.enableWorker('" + o.User['id'] + "', '1', '" + username + "')";
            html += '    <td align="right"><input type="button" class="fnButton" value="Update To Requester" onclick="' + fnEnableRequester + '" /> <input type="button" class="fnButton" value="Disable" onclick="' + fnDisableWorker + '" /> <input type="button" class="fnButton" value="Enable" onclick="' + fnEnableWorker + '" /></td>';
            html += '  </tr>';
            html += '  <tr class="tableBody">';
            html += '    <td colspan="2">';
            //-- .workerDataTable start
            var firstname = o.User['firstname'];
            var surname = o.User['surname'];
            var gender = o.User['sex'];
            var email = o.User['email'];
            var paypalAccount = o.User['paypalAccount'];
            var acceptanceRatio = o.User['acceptanceRatio'] + '%';
            var accountActive = o.User['isActive'] == "1" ? "Active" : "Inactive";
            var accountEnable = o.User['isEnabled'] == "1" ? "Enable" : "Disable";
            html += '      <table width="100%" class="workerListDataTable" cellpadding="0" cellspacing="0">';
            html += '        <tr>';
            html += '          <td width="33%"><span class="textTitle">Firstname: </span> ' + firstname + '</td>';
            html += '          <td width="33%"><span class="textTitle">Surname: </span>' + surname + '</td>';
            html += '          <td><span class="textTitle">Gender: </span>' + gender + '</td>';
            html += '        </tr>';
            html += '        <tr>';
            html += '          <td><span class="textTitle">Email: </span> ' + email + '</td>';
            html += '          <td><span class="textTitle">Paypal Account: </span>' + paypalAccount + '</td>';
            html += '          <td><span class="textTitle">	Acceptance Ratio: </span>' + acceptanceRatio + '</td>';
            html += '        </tr>';
            html += '        <tr>';
            html += '          <td><span class="textTitle" title="Inactive worker cannot log in to CTurk">Active Status: </span> ' + accountActive + '</td>';
            html += '          <td><span class="textTitle" title="Disabled worker can log in to CTurk but cannot accept HIT">Enable Status: </span>' + accountEnable + '</td>';
            html += '          <td><span class="textTitle">&nbsp;</td>';
            html += '        </tr>';
            html += '      </table>';
            //-- .workerListDataTable end
            html += '    </td>';
            html += '  </tr>';
            html += '</table>';
        }
        $("#workerList").html(html);
    }
    
};
