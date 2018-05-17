define([
	'app/controller/base',
	'app/interface/MarketCtr',
	'echarts'
], function(base, MarketCtr, echarts) {
	var symbolVal = base.getUrlParam("symbol") || "btcusdt", //交易对
		exchange = base.getUrlParam("exchange") || "huobiPro"; //交易所

	var config = {
		symbol: symbolVal,
		exchange: exchange,
	};

	$("#chart").height($(".echarts-wrap").height() - $(".nav-wrap").height())
	var myChart = echarts.init(document.getElementById('chart'));
	var chartOption = {};
	var option = {};
	var primaryColor='#348ff6';
	var buyColor='#3cbc98';
	var sellColor='#fc5858';

	init();

	function init() {
		base.showLoading();
		getBuySellFive();
		addListener();
		
		var timer = setInterval(function(){
			getBuySellFive(true)
		},5000)
	}

	function getBuySellFive(refresh) {
		return MarketCtr.getBuySellFive(config).then((data) => {
			option = {
				price: [],
				amount: [],
			};
			
			data.bids.forEach((item, i) => {
				option.price.push(item.price);
				option.amount.push({
					value: item.amount,
					itemStyle:{
						color: buyColor
					}
				});
			})
			data.asks.forEach((item, i) => {
				option.price.push(item.price);
				option.amount.push({
					value: item.amount,
					itemStyle:{
						color: sellColor
					}
				});
			})
			setChart(refresh);
			base.hideLoading();
		})
	}

	function setChart(refresh) {
		chartOption = {
			animation: false,
		    tooltip: {
		        trigger: 'axis',
		        axisPointer:{
		        	lineStyle:{
		        		color: primaryColor
		        	},
		        },
				confine: true,
		    },
			xAxis: {
				type: 'category',
				data: option.price,
				axisLine: {
					lineStyle: {
						color: '#eeeeee',
					}
				},
				axisLabel: {
					color: '#999999',
					fontSize: '.24rem',
				},
			},
			yAxis: {
				scale: true,
				axisLine: {
					lineStyle: {
						color: '#eeeeee',
					}
				},
				axisLabel: {
					color: '#999999',
					fontSize: '.24rem',
				},
				splitLine: {
					lineStyle: {
						color: '#eee',
					}
				},
			},
			grid: [{
					left: '10%',
					right: '10%',
					top: '5%',
					height: '80%'
				}
			],
			series: [{
				data: option.amount,
				type: 'bar',
        		showSymbol: false,
        		barWidth: $(".braWidth").width(),
        		itemStyle:{
        			color: buyColor,
        			barBorderRadius: [2,2,0,0]
        		}
			}]
		}
		if(refresh) {
			myChart.clear();
		}
		myChart.setOption(chartOption)
	}

	function addListener() {

	}

});