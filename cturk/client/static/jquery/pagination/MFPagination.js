function MFPagination(options){
    this.params = {
        id: "p1",
        size: 56,//记录的总条数
        itemsPerPage: 10,//每页显示的记录数
        numDisplayEntries: 2,//每页显示的翻页数字
        currentPage: 0,//当前第几页
        numEdgeEntries: 1,//首尾显示的翻页数量
        prevText: "Prev",
        nextText: "Next",
        onPageChange: function(pageIndex, jq){
        }
    }
    var x = this;
    x.setOptions(options);
};

MFPagination.prototype.setOptions = function(options){
    var x = this;
    if (typeof options != "undefined") {
        $.extend(x.params, options);
    }
    
    var optInit = {
        items_per_page: x.params.itemsPerPage,
        num_display_entries: x.params.numDisplayEntries,
        current_page: x.params.currentPage,
        num_edge_entries: x.params.numEdgeEntries,
        link_to: "javascript:;",
        prev_text: x.params.prevText,
        next_text: x.params.nextText,
        callback: x.params.onPageChange
    };
    $("#" + x.params.id).pagination(x.params.size, optInit);
};
