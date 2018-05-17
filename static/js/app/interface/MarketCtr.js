define([
    'app/controller/base',
    'app/util/ajax'
], function(base, Ajax) {
    return {
    	/**
         * 获取k线图数据
         * @config：{symbol,exchange,period,size}
         */
        getSizeCandlestick(config) {
            return Ajax.get("628370", {
            	...config
            }, true);
        },
    	/**
         * 获取买卖五档
         * @config：{symbol,exchange}
         */
        getBuySellFive(config) {
            return Ajax.get("628380", {
            	...config
            }, true);
        },
    };
})
