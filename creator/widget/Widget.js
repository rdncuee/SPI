/*
 Build by Wiquid's PCI Generator for TAO platform Free to use
 */
define([
	'taoQtiItem/qtiCreator/widgets/interactions/customInteraction/Widget',
	'ScatterPlotInteraction/creator/widget/states/states'
], function (Widget, states) {
	'use strict';

	var ScatterPlotWidget = Widget.clone();

	ScatterPlotWidget.initCreator = function () {
		var $interaction;

		this.registerStates(states);

		Widget.initCreator.call(this);

		$interaction = this.$container.find('.ScatterPlot');
		if ($interaction.length) {
			$interaction.addClass('tao-qti-creator-context');
		}
	};

	return ScatterPlotWidget;
});
