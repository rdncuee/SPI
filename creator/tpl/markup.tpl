<div class="ScatterPlot {{identifier}} px-0 pt-0 my-0">
	<div class="prompt d-none">{{{prompt}}}</div>
	<div class="hidden-scatter-plot-setting">
		<input type="hidden" name="scatter_plot_setting" class="scatter-plot-setting" />
		<input type="hidden" name="operation_log" class="operation-log" />
	</div>
	<!-- 基データのカード -->
	<div class="card card-csv-data mt-2 mb-0">
		<div class="card-header card-header-text pb-0">
			<h2 class="card-title">
				<div class="rawDataCaption">{{{rawDataCaption}}}</div>
			</h2>
		</div>
		<div class="card-body pt-0">
			<table id="rawData" class="table table-hover table-responsive table-sm table-csv-data">
				<thead class="csv-index"></thead>
				<tbody class="csv-content"></tbody>
			</table>
		</div>
	</div>
	<!-- Scatter Plotのカード -->
	<div class="card card-scatter-plot mt-4 mb-0">
		<div class="card-header card-header-text pb-0">
			<div class="row">
				<div class="col-8 ml-3 mb-0">
					<h2 class="card-title">
						<div class="scatterPlotCaption">{{{scatterPlotCaption}}}</div>
					</h2>
				</div>
				<div class="col m-0 text-right">
					<button name="resetButton" value="clicked"
						class="btn btn-info small btn-reset-graph scatter-plot-setting mt-4">
						<span class="icon-reset pr-0"></span>
						<span class="i18n">Reset</span>
					</button>
				</div>
			</div>
		</div>
		<style>
			.tooltip-inner .tooltip-content {
				display: block;
			}
		</style>
		<div class="card-body pt-0 px-2">
			<!-- グラフ１ -->
			<div data-graph-name="graph1" class="block block-graph-1">
				<div class="row div-scatter-plot-settings pl-4">
					<div class="col-2 pl-4 mt-2 mb-0">
						<div class="form-check form-check-radio form-graph-type-scatter">
							<input class="mb-0 scatter-plot-setting graph-type-scatter" type="radio" name="graphType1"
								style="vertical-align: middle;" value="scatter" checked="checked" />
							<label class="ml-0 i18n">Scatter Plot</label>
						</div>
						<div class="form-check form-check-radio form-graph-type-bubble">
							<input class="mb-0 scatter-plot-setting graph-type-bubble tooltipstered" type="radio"
								name="graphType1" style="vertical-align: middle;" value="bubble" />
							<label class="ml-0 i18n">Bubble Chart</label>
						</div>
						<div class="tooltip-content i18n">Regression line cannot be displayed</div>
					</div>
					<div class="col p-0">
						<div class="row">
							<div class="col p-0">
								<!--x軸-->
								<div class="form-group form-inline">
									<label class="i18n graph-axis-label">X axis</label>
									<select name="xAxis"
										class="form-control selectpicker select-x-axis scatter-plot-setting"
										data-style="btn btn-link" style="appearance: auto; border: 0;">
										<option value="">-</option>
									</select>
								</div>
							</div>
						</div>
						<div class="row">
							<div class="col p-0">
								<div class="form-group form-inline">
									<label class="i18n graph-axis-label">Y axis</label>
									<select name="yAxis"
										class="form-control selectpicker select-y-axis scatter-plot-setting"
										data-style="btn btn-link" style="appearance: auto; border: 0;">
										<option value="">-</option>
									</select>
								</div>
							</div>
						</div>
					</div>
					<div class="col p-0">
						<div class="row">
							<div class="col p-0">
								<div class="form-group form-inline">
									<label class="i18n graph-setting-label">Group Setting</label>
									<select name="groupBy"
										class="form-control selectpicker select-group-by scatter-plot-setting"
										data-style="btn btn-link" style="appearance: auto; border: 0;">
										<option value="">-</option>
									</select>
								</div>
							</div>
						</div>
						<div class="row">
							<div class="col p-0">
								<div class="form-group form-inline form-bubble-chart-value d-none">
									<label class="i18n graph-setting-label">Bubble Value</label>
									<select name="bubbleValue"
										class="form-control selectpicker select-bubble-chart-value scatter-plot-setting"
										data-style="btn btn-link" style="appearance: auto; border: 0;">
										<option value="__count__" class="i18n">Count</option>
									</select>
								</div>
							</div>
						</div>
					</div>
					<div class="col mt-3">
						<div class="form-group mt-0 pt-0" id="ScatterPlotSettingsAdditionalForm">
							<div class="form-group form-check-correlation my-0 p-0">
								<input
									class="form-check-input show-correlation-coefficient my-0 p-0 scatter-plot-setting"
									name="showCorrelationCoefficient" type="checkbox" value="1" />
								<label class="mb-0 i18n">Show Correlation Coefficient</label>
							</div>
							<div class="form-group form-check-regression-line my-0 p-0">
								<input class="form-check-input show-regression-line my-0 p-0 scatter-plot-setting"
									name="showRegressionLine" type="checkbox" value="1" />
								<label class="mb-0 i18n">Show Regression Line</label>
							</div>
							<div class="form-group form-check-rsquared my-0 p-0">
								<input class="form-check-input show-rsquared my-0 p-0 scatter-plot-setting"
									name="showRsquared" type="checkbox" value="1" />
								<label class="mb-0 i18n">Show Coefficient of Determination</label>
							</div>
						</div>
					</div>
				</div>
				<canvas class="canvas-scatter-plot canvas-scatter-plot-1" width="400" height="200"></canvas>
			</div>
			<!-- グラフ２ -->
			<div data-graph-name="graph2" class="block block-graph-2 d-none">
				<div class="hr"></div>
				<div class="row div-scatter-plot-settings pl-4">
					<div class="col-2 pl-4 mt-2 mb-0">
						<div class="form-check form-check-radio form-graph-type-scatter">
							<input class="mb-0 scatter-plot-setting graph-type-scatter" type="radio" name="graphType2"
								style="vertical-align: middle;" value="scatter" checked="checked" />
							<label class="ml-0 i18n">Scatter Plot</label>
						</div>
						<div class="form-check form-check-radio form-graph-type-bubble">
							<input class="mb-0 scatter-plot-setting graph-type-bubble" type="radio" name="graphType2"
								style="vertical-align: middle;" value="bubble" />
							<label class="ml-0 i18n">Bubble Chart</label>
						</div>
					</div>
					<div class="col p-0">
						<div class="row">
							<div class="col p-0">
								<!--x軸-->
								<div class="form-group form-inline">
									<label class="i18n graph-axis-label">X axis</label>
									<select name="xAxis"
										class="form-control selectpicker select-x-axis scatter-plot-setting"
										data-style="btn btn-link" style="appearance: auto; border: 0;">
										<option value="">-</option>
									</select>
								</div>
							</div>
						</div>
						<div class="row">
							<div class="col p-0">
								<div class="form-group form-inline">
									<label class="i18n graph-axis-label">Y axis</label>
									<select name="yAxis"
										class="form-control selectpicker select-y-axis scatter-plot-setting"
										data-style="btn btn-link" style="appearance: auto; border: 0;">
										<option value="">-</option>
									</select>
								</div>
							</div>
						</div>
					</div>
					<div class="col p-0">
						<div class="row">
							<div class="col p-0">
								<div class="form-group form-inline">
									<label class="i18n graph-setting-label">Group Setting</label>
									<select name="groupBy"
										class="form-control selectpicker select-group-by scatter-plot-setting"
										data-style="btn btn-link" style="appearance: auto; border: 0;">
										<option value="">-</option>
									</select>
								</div>
							</div>
						</div>
						<div class="row">
							<div class="col p-0">
								<div class="form-group form-inline form-bubble-chart-value d-none">
									<label class="i18n graph-setting-label">Bubble Value</label>
									<select name="bubbleValue"
										class="form-control selectpicker select-bubble-chart-value scatter-plot-setting"
										data-style="btn btn-link" style="appearance: auto; border: 0;">
										<option value="__count__" class="i18n">Count</option>
									</select>
								</div>
							</div>
						</div>
					</div>
					<div class="col mt-3">
						<div class="form-group mt-0 pt-0" id="ScatterPlotSettingsAdditionalForm">
							<div class="form-group form-check-correlation my-0 p-0">
								<input
									class="form-check-input show-correlation-coefficient my-0 p-0 scatter-plot-setting"
									name="showCorrelationCoefficient" type="checkbox" value="1" />
								<label class="mb-0 i18n">Show Correlation Coefficient</label>
							</div>
							<div class="form-group form-check-regression-line my-0 p-0">
								<input class="form-check-input show-regression-line my-0 p-0 scatter-plot-setting"
									name="showRegressionLine" type="checkbox" value="1" />
								<label class="mb-0 i18n">Show Regression Line</label>
							</div>
							<div class="form-group form-check-rsquared my-0 p-0">
								<input class="form-check-input show-rsquared my-0 p-0 scatter-plot-setting"
									name="showRsquared" type="checkbox" value="1" />
								<label class="mb-0 i18n">Show Coefficient of Determination</label>
							</div>
						</div>
					</div>
				</div>
				<canvas class="canvas-scatter-plot canvas-scatter-plot-2" width="400" height="200"></canvas>
			</div>
			<!-- グラフ３ -->
			<div data-graph-name="graph3" class="block block-graph-3 d-none">
				<div class="hr"></div>
				<div class="row div-scatter-plot-settings pl-4">
					<div class="col-2 pl-4 mt-2 mb-0">
						<div class="form-check form-check-radio form-graph-type-scatter">
							<input class="mb-0 scatter-plot-setting graph-type-scatter" type="radio" name="graphType3"
								style="vertical-align: middle;" value="scatter" checked="checked" />
							<label class="ml-0 i18n">Scatter Plot</label>
						</div>
						<div class="form-check form-check-radio form-graph-type-bubble">
							<input class="mb-0 scatter-plot-setting graph-type-bubble" type="radio" name="graphType3"
								style="vertical-align: middle;" value="bubble" />
							<label class="ml-0 i18n">Bubble Chart</label>
						</div>
					</div>
					<div class="col p-0">
						<div class="row">
							<div class="col p-0">
								<!--x軸-->
								<div class="form-group form-inline">
									<label class="i18n graph-axis-label">X axis</label>
									<select name="xAxis"
										class="form-control selectpicker select-x-axis scatter-plot-setting"
										data-style="btn btn-link" style="appearance: auto; border: 0;">
										<option value="">-</option>
									</select>
								</div>
							</div>
						</div>
						<div class="row">
							<div class="col p-0">
								<div class="form-group form-inline">
									<label class="i18n graph-axis-label">Y axis</label>
									<select name="yAxis"
										class="form-control selectpicker select-y-axis scatter-plot-setting"
										data-style="btn btn-link" style="appearance: auto; border: 0;">
										<option value="">-</option>
									</select>
								</div>
							</div>
						</div>
					</div>
					<div class="col p-0">
						<div class="row">
							<div class="col p-0">
								<div class="form-group form-inline">
									<label class="i18n graph-setting-label">Group Setting</label>
									<select name="groupBy"
										class="form-control selectpicker select-group-by scatter-plot-setting"
										data-style="btn btn-link" style="appearance: auto; border: 0;">
										<option value="">-</option>
									</select>
								</div>
							</div>
						</div>
						<div class="row">
							<div class="col p-0">
								<div class="form-group form-inline form-bubble-chart-value d-none">
									<label class="i18n graph-setting-label">Bubble Value</label>
									<select name="bubbleValue"
										class="form-control selectpicker select-bubble-chart-value scatter-plot-setting"
										data-style="btn btn-link" style="appearance: auto; border: 0;">
										<option value="__count__" class="i18n">Count</option>
									</select>
								</div>
							</div>
						</div>
					</div>
					<div class="col mt-3">
						<div class="form-group mt-0 pt-0" id="ScatterPlotSettingsAdditionalForm">
							<div class="form-group form-check-correlation my-0 p-0">
								<input
									class="form-check-input show-correlation-coefficient my-0 p-0 scatter-plot-setting"
									name="showCorrelationCoefficient" type="checkbox" value="1" />
								<label class="mb-0 i18n">Show Correlation Coefficient</label>
							</div>
							<div class="form-group form-check-regression-line my-0 p-0">
								<input class="form-check-input show-regression-line my-0 p-0 scatter-plot-setting"
									name="showRegressionLine" type="checkbox" value="1" />
								<label class="mb-0 i18n">Show Regression Line</label>
							</div>
							<div class="form-group form-check-rsquared my-0 p-0">
								<input class="form-check-input show-rsquared my-0 p-0 scatter-plot-setting"
									name="showRsquared" type="checkbox" value="1" />
								<label class="mb-0 i18n">Show Coefficient of Determination</label>
							</div>
						</div>
					</div>
				</div>
				<canvas class="canvas-scatter-plot canvas-scatter-plot-3" width="400" height="200"></canvas>
			</div>
			<!-- グラフ４ -->
			<div data-graph-name="graph4" class="block block-graph-4 d-none">
				<div class="hr"></div>
				<div class="row div-scatter-plot-settings pl-4">
					<div class="col-2 pl-4 mt-2 mb-0">
						<div class="form-check form-check-radio form-graph-type-scatter">
							<input class="mb-0 scatter-plot-setting graph-type-scatter" type="radio" name="graphType4"
								style="vertical-align: middle;" value="scatter" checked="checked" />
							<label class="ml-0 i18n">Scatter Plot</label>
						</div>
						<div class="form-check form-check-radio form-graph-type-bubble">
							<input class="mb-0 scatter-plot-setting graph-type-bubble" type="radio" name="graphType4"
								style="vertical-align: middle;" value="bubble" />
							<label class="ml-0 i18n">Bubble Chart</label>
						</div>
					</div>
					<div class="col p-0">
						<div class="row">
							<div class="col p-0">
								<!--x軸-->
								<div class="form-group form-inline">
									<label class="i18n graph-axis-label">X axis</label>
									<select name="xAxis"
										class="form-control selectpicker select-x-axis scatter-plot-setting"
										data-style="btn btn-link" style="appearance: auto; border: 0;">
										<option value="">-</option>
									</select>
								</div>
							</div>
						</div>
						<div class="row">
							<div class="col p-0">
								<div class="form-group form-inline">
									<label class="i18n graph-axis-label">Y axis</label>
									<select name="yAxis"
										class="form-control selectpicker select-y-axis scatter-plot-setting"
										data-style="btn btn-link" style="appearance: auto; border: 0;">
										<option value="">-</option>
									</select>
								</div>
							</div>
						</div>
					</div>
					<div class="col p-0">
						<div class="row">
							<div class="col p-0">
								<div class="form-group form-inline">
									<label class="i18n graph-setting-label">Group Setting</label>
									<select name="groupBy"
										class="form-control selectpicker select-group-by scatter-plot-setting"
										data-style="btn btn-link" style="appearance: auto; border: 0;">
										<option value="">-</option>
									</select>
								</div>
							</div>
						</div>
						<div class="row">
							<div class="col p-0">
								<div class="form-group form-inline form-bubble-chart-value d-none">
									<label class="i18n graph-setting-label">Bubble Value</label>
									<select name="bubbleValue"
										class="form-control selectpicker select-bubble-chart-value scatter-plot-setting"
										data-style="btn btn-link" style="appearance: auto; border: 0;">
										<option value="__count__" class="i18n">Count</option>
									</select>
								</div>
							</div>
						</div>
					</div>
					<div class="col mt-3">
						<div class="form-group mt-0 pt-0" id="ScatterPlotSettingsAdditionalForm">
							<div class="form-group form-check-correlation my-0 p-0">
								<input
									class="form-check-input show-correlation-coefficient my-0 p-0 scatter-plot-setting"
									name="showCorrelationCoefficient" type="checkbox" value="1" />
								<label class="mb-0 i18n">Show Correlation Coefficient</label>
							</div>
							<div class="form-group form-check-regression-line my-0 p-0">
								<input class="form-check-input show-regression-line my-0 p-0 scatter-plot-setting"
									name="showRegressionLine" type="checkbox" value="1" />
								<label class="mb-0 i18n">Show Regression Line</label>
							</div>
							<div class="form-group form-check-rsquared my-0 p-0">
								<input class="form-check-input show-rsquared my-0 p-0 scatter-plot-setting"
									name="showRsquared" type="checkbox" value="1" />
								<label class="mb-0 i18n">Show Coefficient of Determination</label>
							</div>
						</div>
					</div>
				</div>
				<canvas class="canvas-scatter-plot canvas-scatter-plot-4" width="400" height="200"></canvas>
			</div>
			<div class="row">
				<div class="col text-right">
					<button name="removeGraphButton" value="clicked"
						class="btn btn-error small btn-remove-graph scatter-plot-setting disabled">
						<span class="icon-remove pr-0"></span>
						<span class="i18n">Remove Graph</span>
					</button>
					<button name="addGraphButton" value="clicked"
						class="btn btn-success small btn-add-graph scatter-plot-setting">
						<span class="icon-add pr-0"></span>
						<span class="i18n">Add Graph</span>
					</button>
				</div>
			</div>
		</div>
	</div>
</div>