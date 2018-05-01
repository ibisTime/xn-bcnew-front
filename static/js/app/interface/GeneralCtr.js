define([
    'app/controller/base',
    'app/util/ajax'
], function(base, Ajax) {
    return {
    	//获取七牛Token
    	getQiniuToken(){
    		return Ajax.get("805951");
    	},
        // 查询资讯详情
        getNewsDetail(code) {
            return Ajax.get("628196", {
            	code
            }, true);
        },
        // 查询系统参数 type
        getSysConfigType(type) {
            return Ajax.get("628918", {type}, true);
        },
    };
})
