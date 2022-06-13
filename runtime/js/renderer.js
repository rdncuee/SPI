/**
 *Build by Wiquid's PCI Generator for TAO platform Free to use
 **/

requirejs.config({
	paths: {
		chart: './chart',
	},
	shim: {
		'jqueryui': ['jquery'],
		'./chart': ['jquery'],
		'./jquery.csv': ['jquery'],
		'./jquery.tablesorter': ['jquery']
	}
});

define([
	'jquery',
	'OAT/util/html',
	'./chart',
	'./jquery.csv',
	'moment',
	'./jquery.tablesorter',
	'jqueryui',
	'ui/tooltip',
	'./bignumber',
	'./i18n.translation'
],
	function ($, html, Chart, JQueryCSV, moment, JQueryTableSorter, JQueryUI, Tooltip, BigNumber, i18nTr) {
		'use strict';

		// 目アイコン
		const ICON_EYE = '<span class="unicode-emoji unicode-emoji-eye"></span>';
		// ゴミ箱アイコン
		const ICON_TRASH = '<span class="unicode-emoji unicode-emoji-trash"></span>';
		// フラグアイコン
		const ICON_FLAG = '<span class="unicode-emoji unicode-emoji-flag"></span>';
		// 回帰直線のラベルに含める文字列
		const REGRESSION_LINE_ID = '__REGRESSION_LINE__';
		// グループ無しのラベルに含める文字列
		const NO_GROUP_SETTING_ID = '__NO_GROUP_SETTING__';
		// 数値を西暦と判断する閾値
		const GUESSING_YEAR = { from: 1600, to: 2200 };
		// 未定義値を表す文字列
		const UNDEFINED_LABEL = ' - ';

		// [バブルチャート]ラジオボタンのtooltipの中身(回帰直線表示不可)
		const TOOLTIP_MESSAGE = 'Regression line cannot be displayed';

		// 相関係数ラベル(凡例表示用)
		const CORRELATION_COEFFICIENT_LABEL = 'Correlation Coefficient';

		// 回帰直線ラベル(凡例表示用)
		const REGRESSION_LINE_LABEL = 'Regression Line';

		// 決定係数ラベル(凡例表示用)
		const COEFFICIENT_OF_DETERMINATION_LABEL = 'Coefficient of Determination';

		/**
		 * グラフの色指定
		 * This list is part of chartjs-plugin-colorschemes (https://nagix.github.io/chartjs-plugin-colorschemes/).
		 */
		const defaultColorScheme = ['#a6cee3', '#1f78b4', '#b2df8a', '#33a02c', '#fb9a99', '#e31a1c', '#fdbf6f', '#ff7f00']; // Paired8

		// 基データ
		var rawData = {};
		// 有効なデータ
		var currentData = {};
		// オーサリング中フラグ
		var onAuthoring = false;
		// 操作ログ
		var operationLog = [];

		/**
		 *  値の有無をチェック
		 * 
		 * @param {*} data 
		 * @returns	Boolean
		 */
		var isset = function (data) {
			if (data === "" || data === null || data === undefined) {
				return false;
			} else {
				return true;
			}
		};

		/**
		 * JSONの有効性チェック
		 * 
		 * @param {string} value 
		 * @returns	Boolean
		 */
		var isValidJson = function (value) {
			try {
				JSON.parse(value)
			} catch (e) {
				return false
			}
			return true
		}

		/**
		 * 操作ログを追加
		 * 
		 * @param {Node} Scontainer 
		 * @param {string} name 
		 * @param {string} operation 
		 * @param {*} value 
		 */
		function putOperationLog(Scontainer, name, operation, value) {
			var datetime = moment().format("YYYY-MM-DD HH:mm:ssZ");
			operationLog.push({
				operation: operation,
				name: name,
				value: value,
				datetime: datetime
			});
			// hiddenフォームに格納しておく
			Scontainer.find('input.operation-log').val(JSON.stringify(operationLog));
		}

		/**
		 * 相関係数を求める
		 * 
		 * @param {Array} elements 
		 * @returns {Number} 相関係数
		 */
		function getCorrelationCoefficient(elements) {
			var n = new BigNumber(elements.length);
			var sumx = new BigNumber(0),
				sumy = new BigNumber(0),
				sumxx = new BigNumber(0),
				sumyy = new BigNumber(0),
				sumxy = new BigNumber(0);
			var xm, ym, xxi, yyi;
			var sumxxm = new BigNumber(0),
				sumyym = new BigNumber(0),
				sumxym = new BigNumber(0);
			var i;
			for (i = 0; i < n; i++) {
				sumx = sumx.plus(elements[i].x);
				sumy = sumy.plus(elements[i].y);
			}
			xm = sumx.dividedBy(n);
			ym = sumy.dividedBy(n);
			for (i = 0; i < n; i++) {
				xxi = new BigNumber(elements[i].x);
				yyi = new BigNumber(elements[i].y);
				sumxxm = sumxxm.plus(xxi.minus(xm).times(xxi.minus(xm)));
				sumyym = sumyym.plus(yyi.minus(ym).times(yyi.minus(ym)));
				sumxym = sumxym.plus(xxi.minus(xm).times(yyi.minus(ym)));
			}
			if (sumxxm.isEqualTo(0) || sumyym.isEqualTo(0)) {
				return UNDEFINED_LABEL;
			}
			var retval = sumxym.dividedBy(sumxxm.squareRoot()).dividedBy(sumyym.squareRoot()).toNumber();
			return retval;
		}

		/**
		 * CSVをパースする
		 * 
		 * @param {string} data 
		 * @returns {Array} 要素の配列
		 */
		function parseCsv(data) {
			rawData = {
				'info': [],
				'data': []
			};
			// CSVを配列で読み込む
			var csv = $.csv.toArrays(data);
			// 一行毎の処理
			$(csv).each(function (row_idx) {
				if (this.length <= 0) {
					return true;
				}
				if (row_idx == 0) {
					// 最初の行には、カラム名が格納されている
					$(this).each(function (col_idx) {
						rawData['info'][col_idx] = {
							'index': col_idx,
							'caption': this,
							'isInteger': true,
							'isNumber': true,
							'isYear': true,
							'isString': false,
							'couldBeOptions': false,
							'choices': {}
						};
					});
				} else {
					rawData['data'][row_idx - 1] = {};
					// カラム毎の処理
					$(this).each(function (col_idx) {
						var value = this;
						var caption = rawData['info'][col_idx]['caption'];
						rawData['data'][row_idx - 1][caption] = value;
						if (value.match(/^[+,-]?\d+$/) || value.match(/^[+,-]?\d+(\.\d+)?$/)) {
							// 数値の場合
							value = Number.parseFloat(value);
							rawData['data'][row_idx - 1][caption] = value;
							rawData['info'][col_idx]['isInteger'] &&= Number.isInteger(value);
							rawData['info'][col_idx]['isNumber'] &&= true;
							rawData['info'][col_idx]['isYear'] &&= ((GUESSING_YEAR.from <= value) && (value <= GUESSING_YEAR.to));
							rawData['info'][col_idx]['isString'] ||= false;
						} else {
							// 数値でない場合
							rawData['info'][col_idx]['isInteger'] = false;
							rawData['info'][col_idx]['isNumber'] = false;
							rawData['info'][col_idx]['isYear'] = false;
							rawData['info'][col_idx]['isString'] = true;
						}
						// 選択肢になり得るかどうかチェックするために、同じ値の出現回数をまとめておく
						if (value in rawData['info'][col_idx]['choices']) {
							rawData['info'][col_idx]['choices'][value]++;
						} else {
							rawData['info'][col_idx]['choices'][value] = 1;
						}
					});
					rawData['data'][row_idx - 1]['__ID__'] = row_idx;
				}
			});
			// 件数
			var count = rawData['data'].length;
			// 選択肢になり得るかどうかチェック
			$.each(rawData['info'], function (index, val) {
				var choice_count = Object.keys(val['choices']).length;
				if ((choice_count >= 2) && ((choice_count <= 20) || (choice_count <= (count / 10)))) {
					// 選択肢数が (2以上 && (10以下 || 件数÷10以下)) なら　選択肢になり得る
					rawData['info'][index]['couldBeOptions'] = true;
				} else {
					rawData['info'][index]['couldBeOptions'] = false;
					delete rawData['info'][index]['choices'];
				}
			});
			return rawData;
		}

		/**
		 * 受験者用グラフ操作フォームの描画
		 * 
		 * @param {string} id 
		 * @param {Node} Scontainer 
		 * @param {Object} config 
		 */
		function renderSettingForms(id, Scontainer, config) {
			// カラム名のリストを用意する
			var columnNames = [];
			if ((config.csvData !== "") && isset(config.csvColumnNames)) {
				columnNames = ($.isArray(config.csvColumnNames)) ? config.csvColumnNames : JSON.parse(config.csvColumnNames);
			}
			// ｘ軸、ｙ軸、グループのプルダウンメニューのアイテムを生成
			$.each(columnNames, function (index, val) {
				Scontainer.find("select.select-x-axis").append('<option value="' + val + '"' + ((config.xAxis === val) ? 'selected' : '') + '>' + val + '</option>');
				Scontainer.find("select.select-y-axis").append('<option value="' + val + '"' + ((config.yAxis === val) ? 'selected' : '') + '>' + val + '</option>');
				Scontainer.find("select.select-group-by").append('<option value="' + val + '"' + ((config.groupBy === val) ? 'selected' : '') + '>' + val + '</option>');
				Scontainer.find("select.select-bubble-chart-value").append('<option value="' + val + '"' + ((config.bubbleChartValue === val) ? 'selected' : '') + '>' + val + '</option>');
			});
			// グラフ種別の初期値設定
			Scontainer.find("input.graph-type-scatter").prop("checked", (config.graphType === 'scatter') ? true : false);
			Scontainer.find("input.graph-type-bubble").prop("checked", (config.graphType === 'bubble') ? true : false);
			// バブルチャートの値 (円の直径) の表示/非表示
			if (config.graphType === 'scatter') {
				Scontainer.find("div.form-bubble-chart-value").addClass('d-none');
			}
			else {
				Scontainer.find("div.form-bubble-chart-value").removeClass('d-none');
			}
			// 相関係数の初期値設定
			Scontainer.find("div.form-check-correlation input.show-correlation-coefficient").prop('checked', (config.showCorrelation) ? true : false);
			// 相関係数の編集可否
			if (!config.correlationEditable) {
				// 編集不可
				Scontainer.find("div.form-check-correlation").addClass('d-none');
			}
			// 回帰直線の初期値設定
			Scontainer.find("div.form-check-regression-line input.show-regression-line").prop('checked', (config.showRegressionLine) ? true : false);
			// 回帰直線の編集可否
			if (!config.regressionLineEditable) {
				// 編集不可
				Scontainer.find("div.form-check-regression-line").addClass('d-none');
			}
			// 決定係数の初期値設定
			Scontainer.find("div.form-check-rsquared input.show-rsquared").prop('checked', (config.showRsquared) ? true : false);
			// 決定係数の編集可否
			if (!config.RsquaredEditable) {
				// 編集不可
				Scontainer.find("div.form-check-rsquared").addClass('d-none');
			}
			else {
				// 決定係数のdisabled設定(回帰直線の初期値が表示なしの場合はdisabledにしておく)
				Scontainer.find("div.form-check-rsquared input.show-rsquared").attr('disabled', (config.showRegressionLine) ? false : true);
			}
			// .scatter-plot-setting にidのクラス名を追加
			Scontainer.find(".scatter-plot-setting").addClass(id);
			// オーサリング中の場合は設定フォームを変更不可にしておく
			if (onAuthoring) {
				Scontainer.find(".scatter-plot-setting").attr('disabled', true);
			}
			// 変更イベントハンドラ
			var workInProgress = false;
			Scontainer.on('change', '.scatter-plot-setting.' + id, function () {
				// グラフの再描画
				if (workInProgress) {
					return;
				}
				workInProgress = true;
				if (config.storeOperationLog) {
					// 操作ログの用意
					var graph_id = $(this).closest('div.block').data('graph-name') ?? '';
					var name = $(this).attr('name');
					var value = ($.inArray(name, ['showRegressionLine', 'showCorrelationCoefficient', 'showRsquared']) !== -1) ? $(this).prop('checked') : $(this).val();
					var operation = 'change';
					putOperationLog(Scontainer, graph_id + '.' + name, operation, value);
				}
				// 回帰直線のチェックが外れたら決定係数のフォームをdisabledにする
				if (($(this).attr('name') === 'showRegressionLine') && (config.RsquaredEditable)) {
					$(this).parent().parent().find("input.show-rsquared").attr('disabled', ($(this).prop('checked')) ? false : true);
				}
				// グラフの描画
				renderScatterPlot(id, Scontainer, config, false);
				workInProgress = false;
			});
			// 回帰直線を初期状態で表示または、回帰直線の表示変更可能な場合
			if (config.showRegressionLine || config.regressionLineEditable) {
				// バブルチャートのラジオボタンにツールチップ『回帰直線表示不可』を追加
				var tooltip_message = i18nTr.translate(config.i18nLocale, TOOLTIP_MESSAGE);
				if (tooltip_message !== undefined) {
					// 翻訳後の文字列に置き換える
					Scontainer.find("div.form-graph-type-bubble").each(function (index, el) {
						Tooltip.create(el, tooltip_message, {
							theme: 'info',
							placement: 'left'
						});
					});
				}
			}
		}

		/**
		 * 基データテーブルの描画
		 * 
		 * @param {string} id 
		 * @param {Node} Scontainer 
		 * @param {Object} config 
		 */
		function renderRawDataTable(id, Scontainer, config) {
			// 見出しを表示
			Scontainer.find(".rawDataCaption").text(config.rawDataCaption);
			if ((config.csvData === undefined) || (config.csvData === "")) {
				return;
			}
			// 基データテーブル
			var rawDataTable = Scontainer.find('table.table-csv-data');
			// CSVをパースする
			var rawData = parseCsv(config.csvData);
			// tableのヘッダのHTML作成
			var table_header = '<tr>';
			// 最初のカラムにアイコンを置く
			var thead_icon = (config.plotExcludable) ? ((config.plotShowOrHide === 'hide') ? ICON_TRASH : ICON_EYE) : ICON_FLAG;
			table_header += '<th style="width: 2rem;" data-sorter="' + ((onAuthoring) ? 'false' : 'text') + '" class="text-center">' + thead_icon + '</th>';
			// 各カラムのヘッダ
			$.each(rawData['info'], function (index, val) {
				table_header += '<th data-sorter="' + ((onAuthoring) ? 'false' : ((val.isInteger || val.isNumber) ? 'digit' : 'text')) + '">' + val['caption'] + '</th>';
			});
			table_header += '</tr>';
			rawDataTable.find("thead").append(table_header);
			// tableの中身のHTML作成
			var hidden_flags = '<span class="d-none element-highlighted">9</span><span class="d-none element-deleted">9</span>';
			$.each(rawData['data'], function (row_index, row_data) {
				var table_row = "<tr class='data-table data-table-" + row_data['__ID__'] + "' data-json='" + JSON.stringify(row_data) + "'>";
				table_row += '<td class="text-center td-flags">' + hidden_flags + '<span class="id d-none">' + ('00000' + row_data['__ID__']).slice(-5) + '</span>';
				if (config.plotExcludable) {
					// データが削除可能の場合
					table_row += '<input class="form-check-input check-muted m-0 p-0" name="mute" type="checkbox" value="1" ' + ((config.plotShowOrHide === 'hide') ? '' : 'checked') + '/>';
				}
				else {
					// 削除不可の場合(ハイライト時にフラグアイコンを表示するようにしておきます)
					table_row += '<span class="unicode-emoji"></span>';
				}
				table_row += '</td>';
				var col_index = 0;
				$.each(row_data, function (col_name, col_data) {
					if (col_name === "__ID__") {
						// __ID__は画面に表示しない
						return false;
					}
					var td_class = '';
					if (rawData['info'][col_index]['isNumber']) {
						// 数値だったら右寄せ
						td_class = 'text-end';
						if (!rawData['info'][col_index]['isYear']) {
							// 西暦でなさそうなら、カンマ区切りで表示
							col_data = col_data.toLocaleString();
						}
					}
					else if (rawData['info'][col_index]['couldBeOptions']) {
						// 中央寄せ
						td_class = 'text-center';
					}
					else {
						// 左寄せ(デフォルト)
						td_class = 'text-start';
					}
					table_row += ('<td class="' + td_class + '">' + col_data + '</td>');
					col_index++;
				});
				table_row += '</tr>';
				rawDataTable.find("tbody").append(table_row);
			});
			// tablesorterの設定
			rawDataTable.tablesorter({
				// widgets        : ['zebra', 'columns'],
				// usNumberFormat : false,
				sortReset: true,
				sortRestart: true,
				// 最初のカラムでソートしておく
				sortList: [[0, 0]]
			}).on('change', 'input.check-muted', function () {
				// 表示・非表示の設定
				var checked = ($(this).prop('checked')) ? true : false;
				var plotHide = (config.plotShowOrHide === 'hide') ? true : false;
				var operation = '';
				if ((checked && plotHide) || ((!checked) && (!plotHide))) {
					operation = 'hideElement';
					$(this).closest('tr').addClass('exclude');
					$(this).closest('tr').find('td').addClass('muted');
					$(this).closest('tr').find('span.element-deleted').text('1');
					// チェックボックスのカラムはmuteしない
					$(this).closest('td').removeClass('muted');
				} else {
					operation = 'showElement';
					$(this).closest('tr').removeClass('exclude');
					$(this).closest('tr').find('span.element-deleted').text('9');
					$(this).closest('tr').find('td').removeClass('muted');
				}
				if (config.storeOperationLog) {
					// 操作ログ格納
					var element = $(this).closest('tr').data('json');
					putOperationLog(Scontainer, 'muteCheckbox', operation, element);
				}
				// tablesorterに更新を知らせる
				rawDataTable.trigger("update");
				// 散布図の更新
				renderScatterPlot(id, Scontainer, config, false);
			});
		}

		/**
		 * 凡例に表示する相関係数・回帰直線の式・決定係数のフォーマット
		 * 
		 * @param {Boolean} show_correlation_coefficient 
		 * @param {Boolean} show_regression_line 
		 * @param {Boolean} show_rsquared 
		 * @param {Object} additional_data 
		 * @returns {string} 凡例表示用の文字列
		 */
		function formatLegendLabel(plot_style = 'scatter', show_correlation_coefficient = false, show_regression_line = false, show_rsquared = false, additional_data, i18nLocale) {
			var label = '';
			// 相関係数
			if (show_correlation_coefficient && isset(additional_data.correlation_coefficient)) {
				label += i18nTr.translate(i18nLocale, CORRELATION_COEFFICIENT_LABEL, CORRELATION_COEFFICIENT_LABEL) + ':' + additional_data.correlation_coefficient.toLocaleString(undefined, { maximumFractionDigits: 4 });
			}
			// 回帰直線
			if (show_regression_line && (plot_style === 'scatter') && isset(additional_data.equation)) {
				label += ((label === '') ? '' : '  ') + i18nTr.translate(i18nLocale, REGRESSION_LINE_LABEL, REGRESSION_LINE_LABEL) + ":" + additional_data.equation;
				// 決定係数
				if (show_rsquared && (plot_style === 'scatter') && isset(additional_data.r_squared)) {
					label += ((label === '') ? '' : '  ') + i18nTr.translate(i18nLocale, COEFFICIENT_OF_DETERMINATION_LABEL, COEFFICIENT_OF_DETERMINATION_LABEL) + ":" + additional_data.r_squared.toLocaleString(undefined, { maximumFractionDigits: 4 });
				}
			}
			// 【カッコ】
			if (label !== '') {
				label = '【' + label + '】';
			}
			return label;
		}

		/**
		 * 散布図の描画
		 * 
		 * @param {string} id 
		 * @param {Node} Scontainer 
		 * @param {Object} config 
		 */
		var scatterPlots = {};
		function renderScatterPlot(id, Scontainer, config, addEvent = true) {
			// 見出しを表示
			Scontainer.find(".scatterPlotCaption").text(config.scatterPlotCaption);
			// 言語設定取得
			var i18nLocale = config.i18nLocale;
			// Chart.js用の色設定
			var graphColorScheme = (isset(config.colorScheme)) ? (($.isArray(config.colorScheme)) ? config.colorScheme : JSON.parse(config.colorScheme)) : defaultColorScheme;
			var graphColorSchemeLength = graphColorScheme.length;
			if (!isset(scatterPlots[id])) {
				scatterPlots[id] = [];
			}
			// 基データテーブルから有効なデータを抽出
			var rawDataTable = Scontainer.find("table.table-csv-data");
			currentData.data = [];
			rawDataTable.find('tbody').children('tr').not('.exclude').each(function () {
				currentData.data.push($(this).data('json'));
			});
			// グラフを描画
			$.each([1, 2, 3, 4], function (idx, graph_no) {
				var graphBlock = Scontainer.find("div.block-graph-" + graph_no);
				var scatterPlotIndex = idx;
				// グラフの設定を取得
				var x_axis = graphBlock.find("select.select-x-axis").val();
				var y_axis = graphBlock.find("select.select-y-axis").val();
				var plot_style = (graphBlock.find("input.graph-type-scatter").prop('checked')) ? 'scatter' : 'bubble';
				var plot_value = graphBlock.find("select.select-bubble-chart-value").val();
				var group_by = graphBlock.find("select.select-group-by").val();
				var show_correlation_coefficient = (graphBlock.find("input.show-correlation-coefficient").prop("checked")) ? true : false;
				var show_regression_line = (graphBlock.find("input.show-regression-line").prop("checked")) ? true : false;
				var show_rsquared = (graphBlock.find("input.show-rsquared").prop("checked")) ? true : false;
				if (plot_style === 'scatter') {
					// 散布図の場合
					graphBlock.find('div.form-bubble-chart-value').addClass('d-none');
					if (config.regressionLineEditable) {
						graphBlock.find('div.form-check-regression-line').removeClass('d-none');
					}
					if (config.RsquaredEditable) {
						graphBlock.find('div.form-check-rsquared').removeClass('d-none');
					}
				}
				else {
					// バブルチャートの場合([回帰直線を表示]フォームをけして、[バブル値]のフォームを表示)
					graphBlock.find('div.form-bubble-chart-value').removeClass('d-none');
					if (config.regressionLineEditable) {
						graphBlock.find('div.form-check-regression-line').addClass('d-none');
					}
					if (config.RsquaredEditable) {
						graphBlock.find('div.form-check-rsquared').addClass('d-none');
					}
				}
				if (!isset(x_axis) || !isset(y_axis)) {
					// まだx軸、y軸の指定がそろっていません
					if (isset(scatterPlots[id][scatterPlotIndex]) && scatterPlots[id][scatterPlotIndex]) {
						scatterPlots[id][scatterPlotIndex].destroy();
					}
					return null;
				}
				var graphCanvas = graphBlock.find("canvas");
				// データの加工
				var scatter_data = {};
				var additional_data = {};
				var data_x = [];
				var data_y = [];
				if ((plot_style === 'bubble') && (plot_value === '__count__')) {
					// バブルチャートで、件数を半径とする場合
					var base_r = 9;
					var bubble_val = {};
					var bubble_id = {};
					$.each(currentData['data'], function (idx, e) {
						var grp = (isset(group_by)) ? e[group_by] : NO_GROUP_SETTING_ID;
						if (!isset(bubble_val[grp])) {
							bubble_val[grp] = {};
							bubble_id[grp] = {};
						}
						if (!isset(bubble_val[grp][e[x_axis]])) {
							bubble_val[grp][e[x_axis]] = {};
							bubble_id[grp][e[x_axis]] = {};
						}
						if (!isset(bubble_val[grp][e[x_axis]][e[y_axis]])) {
							bubble_val[grp][e[x_axis]][e[y_axis]] = 0;
							bubble_id[grp][e[x_axis]][e[y_axis]] = [];
						}
						bubble_val[grp][e[x_axis]][e[y_axis]] += base_r;
						bubble_id[grp][e[x_axis]][e[y_axis]].push(e.__ID__);
					});
					// 配列を加工する
					var color_idx = 0;
					$.each(bubble_val, function (bvg_idx, bvg_e) {
						scatter_data[bvg_idx] = {
							label: bvg_idx,
							data: [],
							backgroundColor: graphColorScheme[color_idx++ % graphColorSchemeLength] + '80',
						};
						additional_data[bvg_idx] = {
							correlation_coefficient: null,
							r_squared: null,
							equation: null
						};
						$.each(bubble_val[bvg_idx], function (bvx_idx, bvx_e) {
							$.each(bubble_val[bvg_idx][bvx_idx], function (bvy_idx, bvy_e) {
								var element = {
									x: bvx_idx,
									y: bvy_idx,
									r: Math.sqrt(bubble_val[bvg_idx][bvx_idx][bvy_idx]),
									value: (bubble_val[bvg_idx][bvx_idx][bvy_idx] / base_r),
									__ID__: JSON.stringify(bubble_id[bvg_idx][bvx_idx][bvy_idx])
								};
								scatter_data[bvg_idx]['data'].push(element);
								data_x.push(bvx_idx);
								data_y.push(bvy_idx);
							});
						});
					});
				}
				else {
					// 散布図またはバブルチャート(件数以外)の場合
					var color_idx = 0;
					var element_idx = 0;
					$.each(currentData['data'], function (idx, e) {
						var group_name = (isset(group_by)) ? e[group_by] : NO_GROUP_SETTING_ID;
						if (!isset(scatter_data[group_name])) {
							scatter_data[group_name] = {
								label: group_name,
								data: [],
								backgroundColor: (graphColorScheme[color_idx++ % graphColorSchemeLength] + ((plot_style == 'bubble') ? '80' : ''))
							};
							additional_data[group_name] = {
								correlation_coefficient: null,
								r_squared: null,
								equation: null
							};
						}
						var element = {
							x: e[x_axis],
							y: e[y_axis],
							__ID__: e.__ID__
						};
						if (plot_style == 'bubble') {
							element.r = (isset(e[plot_value])) ? e[plot_value] : 3;
							element.value = (isset(e[plot_value])) ? e[plot_value] : 1;
						}
						scatter_data[group_name]['data'].push(element);
						data_x.push(e[x_axis]);
						data_y.push(e[y_axis]);
					});
				}
				/**
				 * グループ毎に相関係数を算出
				 */
				if (show_correlation_coefficient || show_rsquared) {
					$.each(scatter_data, function (group_name, group_data) {
						if (group_data.data.length <= 1) {
							// データが足りない
							additional_data[group_name].correlation_coefficient = UNDEFINED_LABEL;
							additional_data[group_name].r_squared = UNDEFINED_LABEL;
							return true;
						}
						// 相関係数
						additional_data[group_name].correlation_coefficient = getCorrelationCoefficient(group_data.data);
						if (additional_data[group_name].correlation_coefficient === UNDEFINED_LABEL) {
							// 相関係数が未定義の場合、決定係数も未定義にしておく
							additional_data[group_name].r_squared = UNDEFINED_LABEL;
						}
						else {
							// 決定係数
							additional_data[group_name].r_squared = Math.pow(additional_data[group_name].correlation_coefficient, 2);
						}
					});
				}
				/**
				 * 回帰直線を生成
				 */
				var datasets = {
					datasets: []
				}
				$.each(scatter_data, function (group_name, group_data) {
					if (plot_style === "bubble" || (!show_regression_line)) {
						// 回帰直線を描画しない場合
						group_data.label += formatLegendLabel(plot_style, show_correlation_coefficient, show_regression_line, show_rsquared, additional_data[group_name], config.i18nLocale);
						datasets['datasets'].push(group_data);
						return true;
					}
					// 回帰直線のプロット
					var sx = new BigNumber(0);
					var sy = new BigNumber(0);
					var sxy = new BigNumber(0);
					var sxsq = new BigNumber(0);
					var valx;
					var valy;
					var xmean;
					var ymean;
					var y_intercept = new BigNumber(0);
					var slope_denominator = new BigNumber(0);
					var slope = new BigNumber(0);
					var equation = '';
					var n;
					$.each(group_data.data, function (idx, val) {
						valx = new BigNumber(val.x);
						valy = new BigNumber(val.y);
						sx = sx.plus(val.x);
						sy = sy.plus(val.y);
						sxy = sxy.plus(valx.times(valy));
						sxsq = sxsq.plus(valx.pow(2));
					});
					n = new BigNumber(group_data.data.length);
					xmean = sx.div(n);
					ymean = sy.div(n);
					// 傾き
					slope_denominator = n.times(sxsq).minus(sx.pow(2));
					if (!slope_denominator.isEqualTo(0)) {
						slope = n.times(sxy).minus(sx.times(sy)).div(slope_denominator);
						// 切片
						y_intercept = ymean.minus(slope.times(xmean));
					}
					else {
						// 分母が０
						slope = undefined;
					}
					// 一次方程式
					if (slope === undefined) {
						// 傾きが未定義
						equation = UNDEFINED_LABEL;
					}
					else if (slope.isEqualTo(0)) {
						// 傾きなし
						equation = 'ｙ=' + ((y_intercept >= 0) ? '' : '-') + y_intercept.abs().toNumber().toLocaleString(undefined, { maximumFractionDigits: 4 });
					}
					else {
						equation = 'ｙ= ';
						if (slope.abs().isEqualTo(1)) {
							// 傾きが1または-1
							equation += ((slope.isGreaterThan(0)) ? '' : '-') + 'ｘ';
						}
						else {
							equation += ((slope.isGreaterThan(0)) ? '' : '-') + slope.abs().toNumber().toLocaleString(undefined, { maximumFractionDigits: 4 }) + 'ｘ';
						}
						if (y_intercept.isEqualTo(0)) {
							// y切片は０
						}
						else {
							equation += ((y_intercept.isGreaterThanOrEqualTo(0)) ? '+' : '-') + y_intercept.abs().toNumber().toLocaleString(undefined, { maximumFractionDigits: 4 });
						}
					}
					additional_data[group_name].equation = equation;
					// ラベルの生成
					scatter_data[group_name].label += formatLegendLabel(plot_style, show_correlation_coefficient, show_regression_line, show_rsquared, additional_data[group_name], config.i18nLocale);
					// データの格納
					datasets['datasets'].push(scatter_data[group_name]);
					// 回帰式より、回帰直線描画用データを作成
					var regressionLinePlot = [];
					if (equation !== UNDEFINED_LABEL) {
						$.each(scatter_data[group_name].data, function (idx, val) {
							regressionLinePlot.push({ 'x': val.x, 'y': y_intercept.plus(slope.times(val.x)).toNumber() });
						});
						var regressiondata = {
							type: plot_style,
							label: REGRESSION_LINE_ID + ': ' + additional_data[group_name].equation,
							borderColor: scatter_data[group_name].backgroundColor + '80',     // 線の色(半透明)
							backgroundColor: scatter_data[group_name].backgroundColor + '80',
							data: regressionLinePlot,
							borderWidth: 2,                       // 線幅
							pointRadius: 0.0,                      // 点の形状の半径（0にすると点を描画しない）
							tension: 0,                            // 線を直線にする
							showLine: true,                        // 線を描画
							fill: false
						};
						datasets['datasets'].push(regressiondata);
					}
				});
				/**
				 * Chart.jsに渡すグラフの設定を生成
				 */
				var scatterPlotConfig = {
					type: plot_style,
					data: datasets,
					options: {
						animation: false,
						scales: {
							x: {
								type: 'linear',
								title: {
									display: true,
									text: x_axis,
									align: "end"
								}
							},
							y: {
								type: 'linear',
								title: {
									display: true,
									text: y_axis,
									align: "end"
								}
							}
						},
						onHover: function (evt, elements, chartInstance) {
							if (onAuthoring) {
								// オーサリング中はHoverイベントの処理を行わない
								return;
							}
							$.each(elements, function (idx, el) {
								var element = chartInstance.data.datasets[el.datasetIndex].data[el.index];
							});
						},
						onClick: function (evt, elements, chartInstance) {
							if (onAuthoring) {
								// オーサリング中はClickイベントの処理を行わない
								return;
							}
							// 現在のハイライト表示をリセット
							rawDataTable.find("tbody tr.data-table.highlight span.element-highlighted").text("9");
							rawDataTable.find("tbody tr.data-table").removeClass("highlight");
							rawDataTable.find("tbody tr.data-table td span.unicode-emoji").removeClass("unicode-emoji-flag");
							// クリックされた要素から__ID__を取得
							var element_ids = [];
							$.each(elements, function (idx, el) {
								// クリックされた要素を取得
								var element = chartInstance.data.datasets[el.datasetIndex].data[el.index];
								if (element.__ID__ === undefined) {
									return true;
								}
								var id_list = [];
								if (!Number.isInteger(element.__ID__)) {
									if (isValidJson(element.__ID__)) {
										// JSON形式 (バブルチャートで同座標に複数要素がある場合)
										id_list = JSON.parse(element.__ID__);
										$.each(id_list, function (idx, id) {
											element_ids.push(id);
										});
									}
								}
								else {
									element_ids.push(element.__ID__);
								}
							});
							if (element_ids.length < 1) {
								// 散布図の点はクリックされていなかった
								return;
							}
							else {
								// ハイライト表示
								$.each(element_ids, function (idx, id) {
									rawDataTable.find("tbody tr.data-table-" + id + " span.element-highlighted").text("1");
									rawDataTable.find("tbody tr.data-table-" + id).addClass("highlight");
									rawDataTable.find("tbody tr.data-table-" + id + " span.unicode-emoji").addClass("unicode-emoji-flag");
								});
								// tablesorterにハイライト表示の更新を知らせる
								rawDataTable.trigger("update");
								// 基データの該当する要素をスクロールして表示
								rawDataTable.find("tbody tr.data-table-" + element_ids[0])[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
							}
						},
						plugins: {
							legend: {
								labels: {
									boxWidth: 12,
									filter: function (item) {
										if (isNaN(item.text) === false) {
											return true
										}
										// 回帰直線の凡例は表示しない
										return (!item.text.startsWith(REGRESSION_LINE_ID));
									},
									generateLabels: function (chart) {
										return chart.data.datasets.map(function (dataset, i) {
											// グループ指定なしの場合は、左の四角を隠す
											var no_group_setting = dataset.label.startsWith(NO_GROUP_SETTING_ID);
											return {
												text: ((no_group_setting) ? dataset.label.substring(NO_GROUP_SETTING_ID.length) : dataset.label),
												fillStyle: ((no_group_setting) ? '#FFFFFF00' : dataset.backgroundColor),
												hidden: !chart.isDatasetVisible(i),
												lineCap: dataset.borderCapStyle,
												lineDash: [],
												lineDashOffset: 0,
												lineJoin: dataset.borderJoinStyle,
												lineWidth: ((no_group_setting) ? 0 : dataset.pointBorderWidth),
												strokeStyle: ((no_group_setting) ? '#FFFFFF00' : dataset.borderColor),
												pointStyle: dataset.pointStyle,
												datasetIndex: ((no_group_setting) ? undefined : i)  // extra data used for toggling the datasets
											};
										})
									}
								},
								onClick: function (e, legendItem, legend) {
									const index = legendItem.datasetIndex;
									if (index === undefined) {
										// グループ指定が無い場合はクリックイベントは無効
										return false;
									}
									const ci = legend.chart;
									if (ci.isDatasetVisible(index)) {
										// 表示されていた場合は非表示に
										ci.hide(index);
										legendItem.hidden = true;
									} else {
										// 非表示だった場合は表示する
										ci.show(index);
										legendItem.hidden = false;
									}
								}
							},
							tooltip: {	// ツールチップの設定
								callbacks: {
									label: function (context) {
										let label = context.dataset.label || '';
										if (label.includes(REGRESSION_LINE_ID)) {
											// 回帰直線上のプロットに対してはツールチップを表示しない
											return false;
										}
										// グループ指定無しの目印を消しておく
										if (label.startsWith(NO_GROUP_SETTING_ID)) {
											label = label.substring(NO_GROUP_SETTING_ID.length);
										}
										// 相関係数等の文字列を取り除く
										if (show_correlation_coefficient || show_regression_line || show_rsquared) {
											var index_of_cc = label.indexOf('【');
											if (index_of_cc != -1) {
												label = label.substr(0, index_of_cc);
											}
										}
										label += ((label) ? ': ' : '') + '(' + context.parsed.x + ', ' + context.parsed.y + ((isset(context.raw.value)) ? ', ' + context.raw.value : '') + ')';
										return label;
									}
								}
							}
						}

					}
				};
				/**
				 * グラフの描画
				 */
				if (isset(scatterPlots[id][scatterPlotIndex]) && scatterPlots[id][scatterPlotIndex]) {
					// 既存のグラフはリセット
					scatterPlots[id][scatterPlotIndex].destroy();
				}
				scatterPlots[id][scatterPlotIndex] = new Chart(graphCanvas, scatterPlotConfig);
				scatterPlots[id][scatterPlotIndex].update();
				if (onAuthoring) {
					// オーサリング中の場合は最初の散布図だけ描画する
					return false;
				}
			});
			/**
			 * イベントハンドラを設定(初回のみ)
			 */
			if (addEvent) {
				// [リセット]、[グラフの追加]、[グラフの削除] ボタンのイベントハンドラ
				$(function () {
					// [リセット]ボタンのイベントハンドラ
					Scontainer.on('click', 'button.btn-reset-graph', function () {
						// 基データのハイライト、削除設定、ソート設定をリセット
						var rawDataTable = Scontainer.find('table.table-csv-data');
						rawDataTable.find("input.check-muted").prop('checked', false);
						rawDataTable.find("tbody tr.data-table span.element-deleted").text("9");
						rawDataTable.find("tbody tr.data-table").removeClass("exclude");
						rawDataTable.find("tbody tr.data-table td.muted").removeClass("muted");
						rawDataTable.find("tbody tr.data-table.highlight span.element-highlighted").text("9");
						rawDataTable.find("tbody tr.data-table").removeClass("highlight");
						rawDataTable.find("tbody tr.data-table span.icon").removeClass('icon-anchor');
						rawDataTable.trigger('filterReset').trigger('sortReset').trigger("updateAll", [true, function () {
							// 最初のカラムでソートしておく
							rawDataTable.find("th").eq(0).trigger("sort").trigger('update');
						}])
						// 設定フォームを初期値に戻す
						Scontainer.find('select.select-x-axis').val((isset(config.xAxis)) ? config.xAxis : '');
						Scontainer.find('select.select-y-axis').val((isset(config.xAxis)) ? config.yAxis : '');
						Scontainer.find('select.select-group-by').val((isset(config.groupBy)) ? config.groupBy : '');
						Scontainer.find('input.graph-type-scatter').prop('checked', true);
						Scontainer.find('input.show-regression-line').prop('checked', config.showRegressionLine);
						Scontainer.find('input.show-correlation-coefficient').prop('checked', config.showCorrelation);
						// グラフの追加、削除を初期値に戻す
						Scontainer.find('div.block-graph-2,div.block-graph-3,div.block-graph-4').addClass('d-none');
						Scontainer.find('button.btn-add-graph').removeClass('disabled');
						Scontainer.find('button.btn-remove-graph').addClass('disabled');
						if (config.storeOperationLog) {
							// 操作ログ格納
							putOperationLog(Scontainer, $(this).attr("name"), 'resetGraph', true);
						}
						// グラフを再描画
						renderScatterPlot(id, Scontainer, config, false);
					});
					// [グラフを追加]ボタンのイベントハンドラ
					Scontainer.on('click', 'button.btn-add-graph', function () {
						var targetGraphId = '';
						var graphAddable = true;
						var graphRemovable = false;
						$.each(['.block-graph-2', '.block-graph-3', '.block-graph-4'], function (idx, blockClass) {
							if (Scontainer.find(blockClass).hasClass('d-none')) {
								Scontainer.find(blockClass).removeClass('d-none');
								targetGraphId = Scontainer.find(blockClass).attr("id");
								if (blockClass === '.block-graph-4') {
									graphAddable = false;
								}
								else {
									graphRemovable = true;
								}
								return false;
							}
						})
						if (graphRemovable) {
							// [グラフを削除]ボタンを表示する
							Scontainer.find('button.btn-remove-graph').removeClass('disabled');
						}
						if (!graphAddable) {
							// [グラフを追加]ボタンを非表示にする
							Scontainer.find('button.btn-add-graph').addClass('disabled');
						}
						if (config.storeOperationLog) {
							// 操作ログ格納
							putOperationLog(Scontainer, $(this).attr("name"), 'showGraph', targetGraphId);
						}
					});
					Scontainer.on('click', 'button.btn-remove-graph', function () {
						var targetGraphId = '';
						var graphAddable = false;
						var graphRemovable = true;
						$.each(['.block-graph-4', '.block-graph-3', '.block-graph-2'], function (idx, blockClass) {
							if (!Scontainer.find(blockClass).hasClass('d-none')) {
								Scontainer.find(blockClass).addClass('d-none');
								targetGraphId = Scontainer.find(blockClass).attr("id");
								if (blockClass === '.block-graph-2') {
									graphRemovable = false;
								}
								else {
									graphAddable = true;
								}
								return false;
							}
						})
						if (!graphRemovable) {
							// [グラフを削除]ボタンを無効にする
							Scontainer.find('button.btn-remove-graph').addClass('disabled');
						}
						if (graphAddable) {
							// [グラフを追加]ボタンを有効にする
							Scontainer.find('button.btn-add-graph').removeClass('disabled');
						}
						if (config.storeOperationLog) {
							// 操作ログ格納
							putOperationLog(Scontainer, $(this).attr("name"), 'hideGraph', targetGraphId);
						}
					});
				});
			}
		}

		/**
		 * 散布図、基データ等への操作を無効にする(オーサリング中に使用)
		 * 
		 * @param {string} id 
		 * @param {Node} Scontainer 
		 * @param {Object} config 
		 */
		function setDisableOperations(id, Scontainer, config) {
			// 設定フォームと基データのソートを無効にする
			Scontainer.find(".scatter-plot-setting").attr('disabled', true);
			Scontainer.find(".check-muted").attr('disabled', true);
			Scontainer.find("table.table-csv-data thead tr th").data('sorter', 'false');
			Scontainer.find("table.table-csv-data").trigger("update");
		}

		/**
		 * 画面表示メイン
		 */
		return {
			render: function (id, container, config, assetManager) {
				var Scontainer = $(container);
				// render rich text content in prompt
				html.render(Scontainer.find('.prompt'));
				// promptのタグにdata-html-editable-container="true"があったらオーサリング中と判断します
				onAuthoring = (Scontainer.find('.prompt').data('html-editable-container') == true) ? true : false;
				$('div.prompt').on('DOMSubtreeModified propertychange', function () {
					// render後に書き換えられた場合に対応する
					if (onAuthoring) {
						return;
					}
					onAuthoring = (Scontainer.find('.prompt').data('html-editable-container') == true) ? true : false;
					if (onAuthoring) {
						// 散布図、基データ等への操作を無効にする
						setDisableOperations(id, Scontainer, config);
					}
				});
				// containerにIDのクラスを追加
				Scontainer.addClass(id);
				// 基データのtableを描画
				renderRawDataTable(id, Scontainer, config);
				// 受験者用グラフ操作フォームを描画
				renderSettingForms(id, Scontainer, config);
				// グラフの描画
				renderScatterPlot(id, Scontainer, config);
				// オーサリング中の場合
				if (onAuthoring) {
					// 散布図、基データ等への操作を無効にする
					setDisableOperations(id, Scontainer, config);
				}
				// i18n翻訳
				Scontainer.find(".i18n").each(function (idx, element) {
					var translated = i18nTr.translate(config.i18nLocale, $(this).text());
					if (translated !== undefined) {
						// 翻訳後の文字列に置き換える
						$(this).text(translated);
					}
				});
			},
			renderRawDataTable: function (id, container, config) {
				// 基データテーブルの描画
				renderRawDataTable(id, $(container), config);
			},
			renderSettingForms: function (id, container, config) {
				// 受験者用グラフ操作フォームの描画
				renderSettingForms(id, $(container), config);
			},
			renderScatterPlot: function (id, container, config) {
				// 散布図の描画
				renderScatterPlot(id, $(container), config);
			},
		};
	}
);
