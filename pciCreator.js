/*
Build by Wiquid's PCI Generator for TAO platform Free to use 
 */

define([
	'lodash',
	'ScatterPlotInteraction/creator/widget/Widget',
	'tpl!ScatterPlotInteraction/creator/tpl/markup',
	'handlebars'
], function (_, Widget, markupTpl, Handlebars) {
	'use strict';

	var _typeIdentifier = 'ScatterPlotInteraction';

	var ScatterPlotInteractionCreator = {
		/**
		 * (required) Get the typeIdentifier of the custom interaction
		 * 
		 * @returns {String}
		 */
		getTypeIdentifier: function () {
			return _typeIdentifier;
		},
		/**
		 * (required) Get the widget prototype
		 * Used in the renderer
		 * 
		 * @returns {Object} Widget
		 */
		getWidget: function () {
			return Widget;
		},
		/**
		 * (optional) Get the default properties values of the pci.
		 * Used on new pci instance creation
		 * 
		 * @returns {Object}
		 */
		getDefaultProperties: function (pci) {
			return {
				identifier: 'RESPONSE',
				storeOperationLog: false,
				csvData: '',
				csvColumnNames: [],
				i18nLocale: '',	// 言語設定
				plotExcludable: false,
				plotShowOrHide: 'hide',
				rawDataCaption: '',
				scatterPlotCaption: '',
				xAxis: '',
				yAxis: '',
				groupBy: '',
				graphType: 'scatter',
				graphTypeScatterPlot: true,
				graphTypeBubbleChart: false,
				bubbleChartValue: '',
				showRegressionLine: false,  // 回帰直線の表示
				regressionLineEditable: false,	// 受験者による変更可否
				showCorrelation: false,    // 相関係数の表示
				correlationEditable: false,	// 受験者による変更可否
				showRsquared: false,    // 決定係数の表示
				RsquaredEditable: false	// 受験者による変更可否
			};
		},
		/**
		 * (optional) Callback to execute on the 
		 * Used on new pci instance creation
		 * 
		 * @returns {Object}
		 */
		afterCreate: function (pci) {
			//do some stuff
		},
		/**
		 * (required) Gives the qti pci xml template 
		 * 
		 * @returns {function} handlebar template
		 */
		getMarkupTemplate: function () {
			return markupTpl;
		},
		/**
		 * (optional) Allows passing additional data to xml template
		 * 
		 * @returns {function} handlebar template
		 */
		getMarkupData: function (pci, defaultData) {
			defaultData.prompt = pci.data('prompt');
			return defaultData;
		}
	};

	//since we assume we are in a tao context, there is no use to expose the a global object for lib registration
	//all libs should be declared here
	return ScatterPlotInteractionCreator;
});
