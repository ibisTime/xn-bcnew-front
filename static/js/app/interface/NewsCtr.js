define([
    'app/controller/base',
    'app/util/ajax'
], function(base, Ajax) {
    return {
        // 新增资讯
        addNews(config) {
            return Ajax.get("628194", config, true);
        },
        //获取资讯类型
        getNewsType(){
            return Ajax.get("628007", true);
        }
    };
})
